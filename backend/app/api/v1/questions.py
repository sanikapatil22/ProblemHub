from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionResponse, QuestionListResponse
from app.api.deps import get_current_teacher, get_current_user

router = APIRouter()

@router.post("/", response_model=QuestionResponse)
def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    db_question = Question(
        title=question.title,
        description=question.description,
        difficulty=question.difficulty,
        points=question.points,
        time_limit=question.time_limit,
        memory_limit=question.memory_limit,
        test_cases=[tc.dict() for tc in question.test_cases],
        constraints=question.constraints,
        examples=question.examples,
        hints=question.hints,
        starter_code=question.starter_code,
        teacher_id=current_teacher.id
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    return db_question

@router.get("/", response_model=List[QuestionListResponse])
def get_questions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    questions = db.query(Question).offset(skip).limit(limit).all()
    return questions

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    return question

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int,
    question_update: QuestionCreate,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    if db_question.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this question"
        )
    
    for key, value in question_update.dict().items():
        if key == "test_cases":
            value = [tc.dict() for tc in value]
        setattr(db_question, key, value)
    
    db.commit()
    db.refresh(db_question)
    
    return db_question

@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(get_current_teacher)
):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    if db_question.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this question"
        )
    
    db.delete(db_question)
    db.commit()
    
    return {"message": "Question deleted successfully"}