'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Question, DifficultyLevel } from '@/types/question';
import toast from 'react-hot-toast';

export default function ProblemsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DifficultyLevel | 'all'>('all');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/api/v1/questions/');
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = filter === 'all' 
    ? questions 
    : questions.filter(q => q.difficulty === filter);

  const difficultyColors = {
    [DifficultyLevel.EASY]: 'text-green-600 bg-green-100',
    [DifficultyLevel.MEDIUM]: 'text-yellow-600 bg-yellow-100',
    [DifficultyLevel.HARD]: 'text-red-600 bg-red-100',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Problems</h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            All
          </button>
          {Object.values(DifficultyLevel).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-2 rounded-lg ${
                filter === level ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(`/student/problems/${question.id}`)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{question.title}</h3>
                  <p className="text-gray-600 line-clamp-2">{question.description.replace(/<[^>]*>/g, '')}</p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[question.difficulty]}`}>
                    {question.difficulty.toUpperCase()}
                  </span>
                  <span className="text-gray-600 font-medium">{question.points} pts</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No problems found</p>
          </div>
        )}
      </div>
    </div>
  );
}