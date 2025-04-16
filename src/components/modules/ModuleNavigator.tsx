'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Activity {
  id: string;
  title: string;
  type: 'LEARN_QUIZ' | 'PRACTICE_DRILL' | 'APPLY_CHALLENGE' | 'ASSESS_TEST';
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  activities: Activity[];
}

export default function ModuleNavigator() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('/api/modules');
        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }
        const data = await response.json();
        setModules(data);
      } catch (err) {
        setError('Error loading modules. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Helper function to get activity type icon
  const getActivityTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'LEARN_QUIZ':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case 'PRACTICE_DRILL':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case 'APPLY_CHALLENGE':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        );
      case 'ASSESS_TEST':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Helper function to get activity type label
  const getActivityTypeLabel = (type: Activity['type']) => {
    switch (type) {
      case 'LEARN_QUIZ':
        return 'Learn';
      case 'PRACTICE_DRILL':
        return 'Practice';
      case 'APPLY_CHALLENGE':
        return 'Apply';
      case 'ASSESS_TEST':
        return 'Assess';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Path</h3>
      <div className="space-y-4">
        {modules.map((module) => (
          <div key={module.id} className="border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <Link
                href={`/modules/${module.id}`}
                className="text-md font-medium text-indigo-600 hover:text-indigo-800"
              >
                Module {module.order}: {module.title}
              </Link>
            </div>
            <ul className="divide-y divide-gray-200">
              {module.activities.map((activity) => {
                const isActive = pathname === `/activities/${activity.id}`;
                return (
                  <li key={activity.id}>
                    <Link
                      href={`/activities/${activity.id}`}
                      className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
                        isActive ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                          isActive
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {getActivityTypeIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            isActive ? 'text-indigo-600' : 'text-gray-700'
                          }`}
                        >
                          {activity.title}
                        </p>
                        <p
                          className={`text-xs ${
                            isActive ? 'text-indigo-500' : 'text-gray-500'
                          }`}
                        >
                          {getActivityTypeLabel(activity.type)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
