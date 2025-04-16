'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chapter } from '@/lib/bookStructure';

interface BookNavigatorProps {
  bookStructure: Chapter[];
}

export default function BookNavigator({ bookStructure }: BookNavigatorProps) {
  const pathname = usePathname();
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-100 dark:border-indigo-800">
        <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-300">
          Table of Contents
        </h3>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {bookStructure.map((chapter) => (
            <li key={chapter.id} className="rounded-md overflow-hidden">
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                <span>
                  Chapter {chapter.number}: {chapter.title}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform ${
                    expandedChapters[chapter.id] ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {expandedChapters[chapter.id] && (
                <ul className="pl-4 mt-1 space-y-1">
                  <li>
                    <Link
                      href={`/book/chapter/${chapter.id}`}
                      className={`block px-3 py-2 text-sm rounded-md ${
                        pathname === `/book/chapter/${chapter.id}`
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      Overview
                    </Link>
                  </li>
                  
                  {chapter.sections.map((section) => (
                    <li key={section.id} className="mt-1">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                      >
                        <span>{section.title}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 transition-transform ${
                            expandedSections[section.id] ? 'transform rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      
                      {expandedSections[section.id] && (
                        <ul className="pl-4 mt-1 space-y-1">
                          <li>
                            <Link
                              href={`/book/section/${section.id}`}
                              className={`block px-3 py-2 text-sm rounded-md ${
                                pathname === `/book/section/${section.id}`
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                              }`}
                            >
                              Section Overview
                            </Link>
                          </li>
                          
                          {section.concepts.map((concept) => (
                            <li key={concept.id}>
                              <Link
                                href={`/book/concept/${concept.id}`}
                                className={`block px-3 py-2 text-sm rounded-md ${
                                  pathname === `/book/concept/${concept.id}`
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                              >
                                {concept.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
