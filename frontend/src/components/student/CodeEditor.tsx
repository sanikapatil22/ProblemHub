'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { ProgrammingLanguage } from '@/types/submission';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface CodeEditorProps {
  questionId: number;
  starterCode?: Record<string, string>;
}

export default function CodeEditor({ questionId, starterCode }: CodeEditorProps) {
  const [code, setCode] = useState(starterCode?.python || '');
  const [language, setLanguage] = useState<ProgrammingLanguage>(ProgrammingLanguage.PYTHON);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languageMap = {
    [ProgrammingLanguage.PYTHON]: 'python',
    [ProgrammingLanguage.JAVASCRIPT]: 'javascript',
    [ProgrammingLanguage.JAVA]: 'java',
    [ProgrammingLanguage.CPP]: 'cpp',
  };

  const handleLanguageChange = (newLang: ProgrammingLanguage) => {
    setLanguage(newLang);
    if (starterCode && starterCode[newLang]) {
      setCode(starterCode[newLang]);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/v1/submissions/', {
        code,
        language,
        question_id: questionId,
      });

      toast.success('Code submitted! Processing...');
      
      // Poll for results
      pollSubmissionStatus(response.data.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Submission failed');
      setIsSubmitting(false);
    }
  };

  const pollSubmissionStatus = async (submissionId: number) => {
    const maxAttempts = 30;
    let attempts = 0;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/api/v1/submissions/${submissionId}`);
        const submission = response.data;

        if (submission.status !== 'pending' && submission.status !== 'running') {
          clearInterval(interval);
          setIsSubmitting(false);

          if (submission.status === 'accepted') {
            toast.success(`✅ All test cases passed! Score: ${submission.score}`);
          } else {
            toast.error(`❌ ${submission.error_message || submission.status}`);
          }
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsSubmitting(false);
          toast.error('Submission timeout. Please check submissions page.');
        }
      } catch (error) {
        clearInterval(interval);
        setIsSubmitting(false);
        toast.error('Error checking submission status');
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
        <div className="flex gap-2">
          {Object.values(ProgrammingLanguage).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-4 py-2 rounded ${
                language === lang
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Code'}
        </button>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          language={languageMap[language]}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}