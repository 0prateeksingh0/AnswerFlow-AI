from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    GUEST = "guest"

class QuestionStatus(str, Enum):
    PENDING = "Pending"
    ANSWERED = "Answered"
    ESCALATED = "Escalated"

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: UserRole
    class Config:
        from_attributes = True

# Answer Schemas
class AnswerBase(BaseModel):
    content: str

class AnswerCreate(AnswerBase):
    pass

class Answer(AnswerBase):
    id: int
    user_id: int
    question_id: int
    timestamp: datetime
    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    content: str

class QuestionCreate(QuestionBase):
    is_anonymous: Optional[bool] = True

class Question(QuestionBase):
    id: int
    timestamp: datetime
    status: QuestionStatus
    user_id: Optional[int]
    is_anonymous: bool
    sentiment: Optional[str] = "Neutral"
    answers: List[Answer] = []
    class Config:
        from_attributes = True
