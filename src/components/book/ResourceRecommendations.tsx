'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  aiProcessed: boolean;
}

export default function ResourceRecommendations() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopResources = async () => {
      try {
        setLoading(true);
        // Fetch top resources with AI explanations
        const response = await fetch('/api/resources/top');

        if (!response.ok) {
          throw new Error('Failed to fetch top resources');
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

        setResources(data);
      } catch (err) {
        console.error('Error fetching top resources:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTopResources();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || resources.length === 0) {
    return null; // Don't show anything if there's an error or no resources
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Recommended Resources
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <Link
            key={resource.id}
            href={`/resources/${resource.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-md">
                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {resource.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {resource.description}
                </p>
                {resource.aiProcessed && (
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <svg className="mr-1 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    AI Explained
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 text-right">
        <Link
          href="/resources"
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center justify-end"
        >
          <span>Browse all resources</span>
          <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
