export enum SubmissionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  ACCEPTED = 'accepted',
  WRONG_ANSWER = 'wrong_answer',
  TIME_LIMIT_EXCEEDED = 'time_limit_exceeded',
  MEMORY_LIMIT_EXCEEDED = 'memory_limit_exceeded',
  RUNTIME_ERROR = 'runtime_error',
  COMPILATION_ERROR = 'compilation_error'
}

export enum ProgrammingLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  JAVA = 'java',
  CPP = 'cpp'
}

export interface Submission {
  id: number;
  code: string;
  language: ProgrammingLanguage;
  status: SubmissionStatus;
  test_cases_passed: number;
  total_test_cases: number;
  execution_time?: number;
  memory_used?: number;
  score: number;
  error_message?: string;
  ai_feedback?: string;
  submitted_at: string;
  question_id: number;
}

export interface SubmissionCreate {
  code: string;
  language: ProgrammingLanguage;
  question_id: number;
}