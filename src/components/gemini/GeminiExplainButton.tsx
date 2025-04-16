'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface GeminiExplainButtonProps {
  code_snippet: string;
  context?: string;
}

export default function GeminiExplainButton({
  code_snippet,
  context = 'data analysis',
}: GeminiExplainButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleExplain = async () => {
    if (!session) {
      setError('You must be logged in to use this feature');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/explain/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code_snippet,
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to explain code');
      }

      setExplanation(data.explanation);
      setShowExplanation(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while explaining the code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleExplain}
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Explaining...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Explain with Gemini
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      {showExplanation && explanation && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Explanation by Gemini
            </h4>
            <button
              onClick={() => setShowExplanation(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Hide
            </button>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {explanation.split('\n').map((line, i) => (
                <p key={i} className="my-1 text-sm text-gray-800 dark:text-gray-200">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
