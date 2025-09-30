from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.question import Question
from app.models.submission import Submission, SubmissionStatus
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.api.deps import get_current_student, get_current_user
from app.services.test_runner import TestRunner

router = APIRouter()

def process_submission(submission_id: int, db: Session):
    """Background task to process submission"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        return
    
    question = db.query(Question).filter(Question.id == submission.question_id).first()
    if not question:
        return
    
    # Update status to running
    submission.status = SubmissionStatus.RUNNING
    db.commit()
    
    # Run tests
    test_runner = TestRunner(
        time_limit=question.time_limit,
        memory_limit=question.memory_limit
    )
    
    status, passed, total, exec_time, error_msg = test_runner.run_tests(
        submission.code,
        submission.language,
        question.test_cases
    )
    
    # Update submission
    submission.status = status
    submission.test_cases_passed = passed
    submission.total_test_cases = total
    submission.execution_time = exec_time
    submission.error_message = error_msg if status != SubmissionStatus.ACCEPTED else None
    
    # Calculate score
    if status == SubmissionStatus.ACCEPTED:
        submission.score = question.points
    else:
        submission.score = (passed / total) * question.points if total > 0 else 0
    
    db.commit()

@router.post("/", response_model=SubmissionResponse)
def submit_code(
    submission: SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_student: User = Depends(get_current_student)
):
    # Check if question exists
    question = db.query(Question).filter(Question.id == submission.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Create submission
    db_submission = Submission(
        code=submission.code,
        language=submission.language,
        question_id=submission.question_id,
        student_id=current_student.id,
        status=SubmissionStatus.PENDING,
        total_test_cases=len(question.test_cases)
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    # Process in background
    background_tasks.add_task(process_submission, db_submission.id, db)
    
    return db_submission

@router.get("/", response_model=List[SubmissionResponse])
def get_my_submissions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    submissions = db.query(Submission).filter(
        Submission.student_id == current_user.id
    ).order_by(Submission.submitted_at.desc()).offset(skip).limit(limit).all()
    
    return submissions

@router.get("/{submission_id}", response_model=SubmissionResponse)
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Students can only see their own submissions
    if current_user.role.value == "student" and submission.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this submission"
        )
    
    return submission

@router.get("/question/{question_id}", response_model=List[SubmissionResponse])
def get_question_submissions(
    question_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Teachers can see all submissions for their questions
    if current_user.role.value == "teacher":
        question = db.query(Question).filter(
            Question.id == question_id,
            Question.teacher_id == current_user.id
        ).first()
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found or not authorized"
            )
        
        submissions = db.query(Submission).filter(
            Submission.question_id == question_id
        ).order_by(Submission.submitted_at.desc()).offset(skip).limit(limit).all()
    else:
        # Students can only see their own submissions
        submissions = db.query(Submission).filter(
            Submission.question_id == question_id,
            Submission.student_id == current_user.id
        ).order_by(Submission.submitted_at.desc()).offset(skip).limit(limit).all()
    
    return submissions