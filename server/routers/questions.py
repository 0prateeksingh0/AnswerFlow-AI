from fastapi import APIRouter, Depends, HTTPException, WebSocket, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth
from websocket_manager import manager
import json
import os
from openai import OpenAI

# Init OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter(
    prefix="/questions",
    tags=["questions"],
)

@router.post("/", response_model=schemas.Question)
async def create_question(question: schemas.QuestionCreate, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    db_question = models.Question(content=question.content, is_anonymous=question.is_anonymous)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    # Notify all clients immediately
    msg = {
        "type": "new_question",
        "data": {
            "id": db_question.id,
            "content": db_question.content,
            "timestamp": db_question.timestamp.isoformat(),
            "status": db_question.status.value,
            "is_anonymous": db_question.is_anonymous,
            "sentiment": "Analyzing..."
        }
    }
    await manager.broadcast(json.dumps(msg))

    # Trigger async sentiment analysis
    background_tasks.add_task(analyze_sentiment_and_broadcast, db_question.id, db_question.content, db)
    
    return db_question

async def analyze_sentiment_and_broadcast(question_id: int, content: str, db: Session):
    try:
        # Use OpenAI to get sentiment
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a sentiment analyzer. Reply with exactly one word: Positive, Negative, or Neutral."},
                {"role": "user", "content": f"Analyze sentiment: {content}"}
            ]
        )
        sentiment = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI Error: {e}")
        sentiment = "Neutral"

    # Update DB - Need a new session because the passed one might be closed or not thread safe? 
    # Actually, BackgroundTasks runs after response, so we need a fresh session usually.
    # For simplicity, let's create a new session manualy or pass a generator... 
    # Safest is to use a new session.
    new_db = database.SessionLocal()
    try:
        q = new_db.query(models.Question).filter(models.Question.id == question_id).first()
        if q:
            q.sentiment = sentiment
            new_db.commit()
            
            # Broadcast update
            msg = {
                "type": "status_update", # Reuse status update or make new type
                "data": {
                    "id": q.id,
                    "status": q.status.value,
                    "sentiment": sentiment
                }
            }
            # Need to run async in background task, but this function is async?
            # manager.broadcast is async. We can await it.
            # But BackgroundTasks in FastAPI run in threadpool for sync functions or event loop for async.
            # If this def is async, it runs in loop.
            from websocket_manager import manager
            # We imported manager at top.
            await manager.broadcast(json.dumps(msg))
    finally:
        new_db.close()

@router.get("/", response_model=List[schemas.Question])
def read_questions(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    questions = db.query(models.Question).order_by(models.Question.timestamp.desc()).offset(skip).limit(limit).all()
    # Sort: Escalated first, then by timestamp
    # Doing this in python for simplicity, but SQL order_by preferred
    # Since Escalated is just a status, we can sort in python
    def sort_key(q):
        # 0 for escalated (top), 1 for others (based on timestamp desc)
        priority = 0 if q.status == models.QuestionStatus.ESCALATED else 1
        return (priority, -q.timestamp.timestamp())
    
    questions.sort(key=sort_key)
    return questions

@router.put("/{question_id}/answer", response_model=schemas.Answer)
async def answer_question(
    question_id: int, 
    answer: schemas.AnswerCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db_answer = models.Answer(
        content=answer.content,
        question_id=question_id,
        user_id=current_user.id
    )
    db.add(db_answer)
    
    # Auto-update status to ANSWERED? Or let admin do it?
    # Requirement: "only admins (logged in) can mark questions answered"
    # But guests can "answer" (respond to) questions?
    # "All users can respond to questions, but only admins (logged in) can mark questions answered"
    # So answering is just commenting.
    
    db.commit()
    db.refresh(db_answer)
    
    msg = {
        "type": "new_answer",
        "question_id": question_id,
        "data": {
            "id": db_answer.id,
            "content": db_answer.content,
            "user_id": db_answer.user_id,
            "timestamp": db_answer.timestamp.isoformat()
        }
    }
    await manager.broadcast(json.dumps(msg))
    
    return db_answer

@router.put("/{question_id}/status", response_model=schemas.Question)
async def update_question_status(
    question_id: int, 
    status: models.QuestionStatus, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_admin)
):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    db_question.status = status
    db.commit()
    db.refresh(db_question)
    
    msg = {
        "type": "status_update",
        "data": {
            "id": db_question.id,
            "status": db_question.status.value
        }
    }
    await manager.broadcast(json.dumps(msg))
    
    return db_question

@router.post("/{question_id}/suggest")
async def suggest_answer(
    question_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_admin)
):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
         raise HTTPException(status_code=404, detail="Question not found")
    
    # Real OpenAI RAG/Suggestion logic
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful support assistant. Suggest a concise answer to the user's question. If the question is vague, ask for clarification."},
                {"role": "user", "content": db_question.content}
            ]
        )
        suggestion = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI Suggest Error: {e}")
        suggestion = "Suggestion unavailable at this time."
        
    return {"suggestion": suggestion}
