'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ResourceExplanationProps {
  resourceId: string;
  initialExplanation: string | null;
  aiProcessed: boolean;
  resourceTitle?: string;
}

export default function ResourceExplanation({
  resourceId,
  initialExplanation,
  aiProcessed,
  resourceTitle = '',
}: ResourceExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(initialExplanation);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);

  // We now handle all content types equally, so we don't need to detect mathematical content

  // Check if the user has a Gemini API key
  useEffect(() => {
    const checkGeminiKey = async () => {
      try {
        const response = await fetch('/api/user/apikey?service=gemini');
        const data = await response.json();
        setHasGeminiKey(data.hasKey || false);
      } catch (error) {
        console.error('Error checking Gemini API key:', error);
        setHasGeminiKey(false);
      }
    };

    checkGeminiKey();
  }, []);

  const generateExplanation = async (forceRegenerate = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = forceRegenerate
        ? `/api/resources/${resourceId}/explain?force=true`
        : `/api/resources/${resourceId}/explain`;

      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate explanation');
      }

      const data = await response.json();
      setExplanation(data.aiExplanation);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle regeneration specifically
  const handleRegenerate = () => {
    generateExplanation(true);
  };

  if (!aiProcessed && !explanation) {
    return (
      <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Explanation</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This PDF hasn't been analyzed by AI yet.
        </p>

        {hasGeminiKey === false ? (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              You need to add a Gemini API key to generate AI explanations.
            </p>
            <Link
              href="/settings"
              className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Go to Settings
              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        ) : (
          <button
            onClick={generateExplanation}
            disabled={isLoading || hasGeminiKey === false}
            className={`mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800 ${
              isLoading || hasGeminiKey === false ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate AI Explanation'
            )}
          </button>
        )}

        {error && (
          <div className="mt-3">
            <div className="text-sm text-red-600 dark:text-red-400 mb-3">
              Error: {error}
            </div>

            {/* Show API key setup link if explanation generation failed due to API key issues */}
            {error.includes('API key') && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">You need to set up your Gemini API key:</p>
                <Link
                  href="/settings"
                  className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Go to Settings
                  <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800 relative">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Explanation</h3>
        <div className="flex space-x-4">
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Regenerating...
              </>
            ) : (
              <>
                <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </>
            )}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      </div>
      <div className={`mt-2 prose dark:prose-invert max-w-none ${isExpanded ? '' : 'max-h-32 overflow-hidden'}`}>
        {explanation ? (
          <div className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{
            __html: explanation
              .replace(/\n\n/g, '</p><p>')
              .replace(/\n/g, '<br>')
              .replace(/^(.+)$/gm, (_, line) => {
                // Convert markdown-style headers to HTML
                if (line.startsWith('# ')) return `<h2>${line.substring(2)}</h2>`;
                if (line.startsWith('## ')) return `<h3>${line.substring(3)}</h3>`;
                if (line.startsWith('### ')) return `<h4>${line.substring(4)}</h4>`;
                // Convert bullet points
                if (line.startsWith('* ')) return `<li>${line.substring(2)}</li>`;
                if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
                if (line.match(/^\d+\.\s/)) return `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
                return line;
              })
              .replace(/<li>/g, '<ul><li>')
              .replace(/<\/li>/g, '</li></ul>')
              .replace(/<\/ul><ul>/g, '')
          }} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No explanation available.</p>
        )}
      </div>
      {explanation && !isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-800 to-transparent pointer-events-none"></div>
      )}
      {!isExpanded && explanation && explanation.length > 150 && (
        <div className="mt-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
          >
            Read More
          </button>
        </div>
      )}
      {error && (
        <div className="mt-3">
          <div className="text-sm text-red-600 dark:text-red-400 mb-3">
            Error: {error}
          </div>

          {/* Show API key setup if explanation generation failed due to API key issues */}
          {error.includes('API key') && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Set up your Gemini API key:</p>
              <GeminiApiKeySetup />
            </div>
          )}
        </div>
      )}
      {aiProcessed && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          This explanation was generated by Google Gemini AI and may not be completely accurate.
        </div>
      )}
    </div>
  );
}
