'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Concept } from '@/lib/bookStructure';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  aiProcessed: boolean;
  aiExplanation: string | null;
}

interface RelatedResourcesProps {
  concept: Concept;
}

export default function RelatedResources({ concept }: RelatedResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedResources = async () => {
      try {
        setLoading(true);
        // Fetch resources that match the concept tags or name
        const response = await fetch(`/api/resources/related?tags=${concept.tags.join(',')}&concept=${encodeURIComponent(concept.name)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch related resources');
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
        console.error('Error fetching related resources:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedResources();
  }, [concept]);

  if (loading) {
    return (
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Related Resources
        </h3>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
          Related Resources
        </h3>
        <p className="text-sm text-red-500 dark:text-red-400">
          Error loading related resources: {error}
        </p>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
          Related Resources
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No related resources found for this concept.
        </p>
        <div className="mt-3">
          <Link
            href="/resources"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Browse all resources
          </Link>
          <span className="mx-2 text-gray-400">|</span>
          <Link
            href="/resources"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Upload a resource
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
        Related Resources
      </h3>
      <ul className="space-y-3">
        {resources.map((resource) => (
          <li key={resource.id} className="border-l-2 border-indigo-500 pl-3 py-1">
            <Link
              href={`/resources/${resource.id}`}
              className="block"
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                {resource.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {resource.description}
              </p>
              {resource.aiProcessed && resource.aiExplanation && (
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <svg className="mr-1 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  AI Explained
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/resources"
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
        >
          <span>View all resources</span>
          <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
