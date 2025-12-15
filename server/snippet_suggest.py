
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
