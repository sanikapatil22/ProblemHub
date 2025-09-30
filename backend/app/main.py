from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api.v1 import auth, questions, submissions

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coding Platform API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(questions.router, prefix="/api/v1/questions", tags=["questions"])
app.include_router(submissions.router, prefix="/api/v1/submissions", tags=["submissions"])

@app.get("/")
def root():
    return {"message": "Coding Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}