'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { DifficultyLevel, TestCase } from '@/types/question';
import toast from 'react-hot-toast';

export default function CreateQuestionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: DifficultyLevel.EASY,
    points: 10,
    time_limit: 2,
    memory_limit: 256,
    constraints: '',
  });

  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', output: '', is_sample: true }
  ]);

  const [starterCode, setStarterCode] = useState({
    python: '',
    javascript: '',
    java: '',
    cpp: '',
  });

  const [hints, setHints] = useState<string[]>(['']);

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', output: '', is_sample: false }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const handleAddHint = () => {
    setHints([...hints, '']);
  };

  const handleRemoveHint = (index: number) => {
    setHints(hints.filter((_, i) => i !== index));
  };

  const handleHintChange = (index: number, value: string) => {
    const updated = [...hints];
    updated[index] = value;
    setHints(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (testCases.length === 0) {
      toast.error('Please add at least one test case');
      return;
    }

    if (testCases.some(tc => !tc.input.trim() || !tc.output.trim())) {
      toast.error('All test cases must have input and output');
      return;
    }

    try {
      const payload = {
        ...formData,
        test_cases: testCases,
        starter_code: starterCode,
        hints: hints.filter(h => h.trim() !== ''),
      };

      await api.post('/api/v1/questions/', payload);
      toast.success('Question created successfully!');
      router.push('/teacher/questions');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create question');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Create New Question</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(DifficultyLevel).map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Points</label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Time Limit (seconds)</label>
              <input
                type="number"
                value={formData.time_limit}
                onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Memory Limit (MB)</label>
              <input
                type="number"
                value={formData.memory_limit}
                onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Constraints</label>
            <textarea
              value={formData.constraints}
              onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1 <= n <= 1000"
            />
          </div>

          {/* Test Cases */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Test Cases</h3>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Test Case
              </button>
            </div>

            {testCases.map((testCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 mb-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Test Case {index + 1}</h4>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={testCase.is_sample}
                        onChange={(e) => handleTestCaseChange(index, 'is_sample', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Sample</span>
                    </label>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Input</label>
                    <textarea
                      value={testCase.input}
                      onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Output</label>
                    <textarea
                      value={testCase.output}
                      onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Starter Code */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Starter Code (Optional)</h3>
            
            {Object.keys(starterCode).map((lang) => (
              <div key={lang} className="mb-4">
                <label className="block text-sm font-medium mb-2 capitalize">{lang}</label>
                <textarea
                  value={starterCode[lang as keyof typeof starterCode]}
                  onChange={(e) => setStarterCode({ ...starterCode, [lang]: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={`Starter code for ${lang}...`}
                />
              </div>
            ))}
          </div>

          {/* Hints */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Hints (Optional)</h3>
              <button
                type="button"
                onClick={handleAddHint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Hint
              </button>
            </div>

            {hints.map((hint, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => handleHintChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Hint ${index + 1}`}
                />
                {hints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveHint(index)}
                    className="px-4 py-2 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Question
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}