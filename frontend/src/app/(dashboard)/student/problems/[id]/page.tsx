'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Question, DifficultyLevel } from '@/types/question';
import CodeEditor from '@/components/student/CodeEditor';
import toast from 'react-hot-toast';

export default function ProblemPage() {
  const params = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');

  useEffect(() => {
    fetchQuestion();
  }, [params.id]);

  const fetchQuestion = async () => {
    try {
      const response = await api.get(`/api/v1/questions/${params.id}`);
      setQuestion(response.data);
    } catch (error) {
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">Question not found</p>
      </div>
    );
  }

  const difficultyColors = {
    [DifficultyLevel.EASY]: 'text-green-600 bg-green-100',
    [DifficultyLevel.MEDIUM]: 'text-yellow-600 bg-yellow-100',
    [DifficultyLevel.HARD]: 'text-red-600 bg-red-100',
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 overflow-y-auto border-r">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{question.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[question.difficulty]}`}>
              {question.difficulty.toUpperCase()}
            </span>
          </div>

          <div className="flex gap-4 mb-6 text-sm text-gray-600">
            <span>Points: {question.points}</span>
            <span>Time Limit: {question.time_limit}s</span>
            <span>Memory: {question.memory_limit}MB</span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: question.description }} />
          </div>

          {question.constraints && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Constraints</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm">{question.constraints}</pre>
              </div>
            </div>
          )}

          {question.examples && question.examples.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Examples</h2>
              {question.examples.map((example: any, index: number) => (
                <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Example {index + 1}:</p>
                  <div className="mb-2">
                    <span className="font-medium">Input:</span>
                    <pre className="mt-1 bg-white p-2 rounded">{example.input}</pre>
                  </div>
                  <div>
                    <span className="font-medium">Output:</span>
                    <pre className="mt-1 bg-white p-2 rounded">{example.output}</pre>
                  </div>
                  {example.explanation && (
                    <div className="mt-2">
                      <span className="font-medium">Explanation:</span>
                      <p className="mt-1">{example.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {question.hints && question.hints.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Hints</h2>
              {question.hints.map((hint: string, index: number) => (
                <details key={index} className="mb-2 bg-blue-50 p-4 rounded-lg cursor-pointer">
                  <summary className="font-medium">Hint {index + 1}</summary>
                  <p className="mt-2 text-gray-700">{hint}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col">
        <CodeEditor questionId={question.id} starterCode={question.starter_code} />
      </div>
    </div>
  );
}