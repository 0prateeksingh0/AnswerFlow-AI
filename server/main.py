from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, questions
from websocket_manager import manager

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(questions.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Change to specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Q&A Dashboard API"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just keep connection open, maybe handle incoming "pings" or client messages if needed
            data = await websocket.receive_text()
            # Optional: Echo or handle client-sent overrides
            # For now, client just listens
    except WebSocketDisconnect:
        manager.disconnect(websocket)
