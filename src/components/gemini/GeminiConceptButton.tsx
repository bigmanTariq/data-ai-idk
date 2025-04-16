'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface GeminiConceptButtonProps {
  concept_name: string;
  context?: string;
}

export default function GeminiConceptButton({
  concept_name,
  context = 'data analysis',
}: GeminiConceptButtonProps) {
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
      const response = await fetch('/api/explain/concept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept_name,
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to explain concept');
      }

      setExplanation(data.explanation);
      setShowExplanation(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while explaining the concept');
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Elaborate with Gemini
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
