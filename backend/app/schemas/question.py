from pydantic import BaseModel
from typing import Optional, List, Dict
from app.models.question import DifficultyLevel

class TestCase(BaseModel):
    input: str
    output: str
    is_sample: bool = False

class QuestionBase(BaseModel):
    title: str
    description: str
    difficulty: DifficultyLevel
    points: int = 10
    time_limit: int = 2
    memory_limit: int = 256
    constraints: Optional[str] = None

class QuestionCreate(QuestionBase):
    test_cases: List[TestCase]
    examples: Optional[List[Dict]] = None
    hints: Optional[List[str]] = None
    starter_code: Optional[Dict[str, str]] = None

class QuestionResponse(QuestionBase):
    id: int
    teacher_id: int
    test_cases: List[TestCase]
    examples: Optional[List[Dict]] = None
    hints: Optional[List[str]] = None
    starter_code: Optional[Dict[str, str]] = None
    
    class Config:
        from_attributes = True

class QuestionListResponse(BaseModel):
    id: int
    title: str
    difficulty: DifficultyLevel
    points: int
    
    class Config:
        from_attributes = True