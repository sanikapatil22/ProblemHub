export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface TestCase {
  input: string;
  output: string;
  is_sample: boolean;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  points: number;
  time_limit: number;
  memory_limit: number;
  constraints?: string;
  test_cases: TestCase[];
  examples?: any[];
  hints?: string[];
  starter_code?: Record<string, string>;
  teacher_id: number;
}

export interface QuestionCreate {
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  points: number;
  time_limit: number;
  memory_limit: number;
  constraints?: string;
  test_cases: TestCase[];
  examples?: any[];
  hints?: string[];
  starter_code?: Record<string, string>;
}