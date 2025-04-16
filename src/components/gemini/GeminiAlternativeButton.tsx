'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface GeminiAlternativeButtonProps {
  code_snippet: string;
  context?: string;
}

export default function GeminiAlternativeButton({
  code_snippet,
  context = 'data analysis',
}: GeminiAlternativeButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleSuggest = async () => {
    if (!session) {
      setError('You must be logged in to use this feature');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/suggest/alternative', {
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
        throw new Error(data.error || 'Failed to suggest alternative');
      }

      setSuggestion(data.suggestion);
      setShowSuggestion(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while suggesting an alternative');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleSuggest}
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
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
            Suggesting...
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            Suggest Alternative
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      {showSuggestion && suggestion && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Alternative Approach by Gemini
            </h4>
            <button
              onClick={() => setShowSuggestion(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Hide
            </button>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-100 dark:border-green-800">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {suggestion.split('\n').map((line, i) => (
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
