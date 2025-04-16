'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Concept } from '@/lib/bookStructure';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface BookExplanationProps {
  concept: Concept;
  initialExplanation?: string | null;
}

export default function BookExplanation({
  concept,
  initialExplanation,
}: BookExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(initialExplanation || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);

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

  const generateExplanation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/book/concept/${concept.id}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conceptId: concept.id,
          conceptName: concept.name,
          conceptDescription: concept.description,
          tags: concept.tags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.error || 'Failed to generate explanation';
        } catch (e) {
          errorMessage = 'Failed to generate explanation';
        }
        throw new Error(errorMessage);
      }

      // Safely parse JSON response
      let data;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response format from server');
      }

      setExplanation(data.explanation);
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

  if (!explanation) {
    return (
      <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Explanation</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Get an AI-powered explanation of this concept.
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
          <div className="mt-3 text-sm text-red-600 dark:text-red-400">
            Error: {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800 relative">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Explanation</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
      <div className={`mt-2 prose dark:prose-invert max-w-none ${isExpanded ? '' : 'max-h-32 overflow-hidden'}`}>
        {explanation ? (
          <div className="text-gray-700 dark:text-gray-300">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Handle code blocks separately to avoid nesting <pre> inside <p>
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : 'python';

                  // Only apply inline styling for inline code
                  if (inline) {
                    return (
                      <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded" {...props}>
                        {children}
                      </code>
                    );
                  }

                  // For code blocks, return null to prevent rendering inside <p>
                  // The actual code block will be handled by the pre component
                  return null;
                },
                // Handle pre blocks directly to avoid nesting issues
                pre({ children, ...props }) {
                  // Extract the code content and language from children
                  const childArray = React.Children.toArray(children);
                  let language = 'python';
                  let codeContent = '';

                  // Find the code element and extract its content
                  React.Children.forEach(childArray, (child) => {
                    if (React.isValidElement(child) && child.type === 'code') {
                      const className = child.props.className || '';
                      const match = /language-(\w+)/.exec(className);
                      if (match) language = match[1];
                      codeContent = child.props.children;
                    }
                  });

                  return (
                    <div className="my-4 rounded-md overflow-hidden">
                      <SyntaxHighlighter
                        language={language}
                        style={tomorrow}
                        customStyle={{
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        {String(codeContent).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
                p({ children }) {
                  return <p className="my-2">{children}</p>;
                },
                h1({ children }) {
                  return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>;
                },
                ul({ children }) {
                  return <ul className="list-disc pl-6 my-3">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-6 my-3">{children}</ol>;
                },
                li({ children }) {
                  return <li className="my-1">{children}</li>;
                },
                blockquote({ children }) {
                  return <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4">{children}</blockquote>;
                },
                strong({ children }) {
                  return <strong className="font-bold">{children}</strong>;
                },
                em({ children }) {
                  return <em className="italic">{children}</em>;
                }
              }}
            >
              {explanation}
            </ReactMarkdown>
          </div>
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
        <div className="mt-3 text-sm text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      )}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        This explanation was generated by Google Gemini AI and may not be completely accurate.
      </div>
    </div>
  );
}
