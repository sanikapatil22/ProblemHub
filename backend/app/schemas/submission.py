from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.submission import SubmissionStatus, ProgrammingLanguage

class SubmissionCreate(BaseModel):
    code: str
    language: ProgrammingLanguage
    question_id: int

class SubmissionResponse(BaseModel):
    id: int
    code: str
    language: ProgrammingLanguage
    status: SubmissionStatus
    test_cases_passed: int
    total_test_cases: int
    execution_time: Optional[float]
    memory_used: Optional[float]
    score: float
    error_message: Optional[str]
    ai_feedback: Optional[str]
    submitted_at: datetime
    question_id: int
    
    class Config:
        from_attributes = True