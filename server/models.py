from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    GUEST = "guest"

class QuestionStatus(str, enum.Enum):
    PENDING = "Pending"
    ANSWERED = "Answered"
    ESCALATED = "Escalated"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.GUEST)

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(QuestionStatus), default=QuestionStatus.PENDING)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # If logged in
    is_anonymous = Column(Boolean, default=True)
    sentiment = Column(String, default="Neutral") # Positive, Neutral, Negative
    
    # Relationship to user if logged in
    user = relationship("User")
    answers = relationship("Answer", back_populates="question")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_id = Column(Integer, ForeignKey("users.id")) # Helpers/Admins
    timestamp = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="answers")
    user = relationship("User")
