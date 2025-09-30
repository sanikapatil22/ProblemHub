from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class SubmissionStatus(enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    MEMORY_LIMIT_EXCEEDED = "memory_limit_exceeded"
    RUNTIME_ERROR = "runtime_error"
    COMPILATION_ERROR = "compilation_error"

class ProgrammingLanguage(enum.Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    JAVA = "java"
    CPP = "cpp"

class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(Text, nullable=False)
    language = Column(Enum(ProgrammingLanguage), nullable=False)
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.PENDING)
    
    # Results
    test_cases_passed = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    execution_time = Column(Float)  # seconds
    memory_used = Column(Float)  # MB
    score = Column(Float, default=0.0)
    
    # Error details
    error_message = Column(Text)
    
    # AI feedback
    ai_feedback = Column(Text)
    
    # Timestamps
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    student_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    
    # Relationships
    student = relationship("User", back_populates="submissions")
    question = relationship("Question", back_populates="submissions")