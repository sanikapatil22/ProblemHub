from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class DifficultyLevel(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.EASY)
    points = Column(Integer, default=10)
    time_limit = Column(Integer, default=2)  # seconds
    memory_limit = Column(Integer, default=256)  # MB
    
    # Test cases stored as JSON
    test_cases = Column(JSON)  # [{"input": "", "output": "", "is_sample": true}]
    
    # Constraints and examples
    constraints = Column(Text)
    examples = Column(JSON)
    
    # AI-assisted features
    hints = Column(JSON)
    starter_code = Column(JSON)  # {"python": "", "javascript": "", "java": ""}
    
    teacher_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    teacher = relationship("User", back_populates="questions")
    submissions = relationship("Submission", back_populates="question")