'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Submission, SubmissionStatus } from '@/types/submission';
import { formatDate, formatExecutionTime } from '@/lib/utils';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    totalScore: 0,
  });

  useEffect(() => {
    fetchRecentSubmissions();
  }, []);

  const fetchRecentSubmissions = async () => {
    try {
      const response = await api.get('/api/v1/submissions/', {
        params: { limit: 5 }
      });
      setRecentSubmissions(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const accepted = response.data.filter((s: Submission) => s.status === SubmissionStatus.ACCEPTED).length;
      const score = response.data.reduce((sum: number, s: Submission) => sum + s.score, 0);
      
      setStats({
        totalSubmissions: total,
        acceptedSubmissions: accepted,
        totalScore: score,
      });
    } catch (error) {
      console.error('Failed to fetch submissions');
    }
  };

  const statusColors = {
    [SubmissionStatus.ACCEPTED]: 'bg-green-100 text-green-800',
    [SubmissionStatus.WRONG_ANSWER]: 'bg-red-100 text-red-800',
    [SubmissionStatus.TIME_LIMIT_EXCEEDED]: 'bg-yellow-100 text-yellow-800',
    [SubmissionStatus.RUNTIME_ERROR]: 'bg-red-100 text-red-800',
    [SubmissionStatus.PENDING]: 'bg-gray-100 text-gray-800',
    [SubmissionStatus.RUNNING]: 'bg-blue-100 text-blue-800',
    [SubmissionStatus.MEMORY_LIMIT_EXCEEDED]: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Welcome back, {user?.full_name || user?.username}!</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-gray-600 mb-2">Total Submissions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalSubmissions}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-gray-600 mb-2">Accepted</h3>
            <p className="text-3xl font-bold text-green-600">{stats.acceptedSubmissions}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-gray-600 mb-2">Total Score</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalScore}</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/student/problems')}
            className="bg-blue-600 text-white p-8 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            <h3 className="text-2xl font-bold mb-2">Browse Problems</h3>
            <p className="text-blue-100">Find new coding challenges to solve</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/student/submissions')}
            className="bg-purple-600 text-white p-8 rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
          >
            <h3 className="text-2xl font-bold mb-2">View Submissions</h3>
            <p className="text-purple-100">Check your submission history</p>
          </motion.button>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Submissions</h2>
          
          {recentSubmissions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No submissions yet. Start solving problems!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Problem</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Language</th>
                    <th className="text-left py-3 px-4">Time</th>
                    <th className="text-left py-3 px-4">Score</th>
                    <th className="text-left py-3 px-4">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">Problem #{submission.question_id}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[submission.status]}`}>
                          {submission.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">{submission.language.toUpperCase()}</td>
                      <td className="py-3 px-4">
                        {submission.execution_time ? formatExecutionTime(submission.execution_time) : '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold">{submission.score}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(submission.submitted_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}