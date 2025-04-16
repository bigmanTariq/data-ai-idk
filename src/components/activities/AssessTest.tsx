'use client';

import React, { useState } from 'react';
import CodeEditor from './CodeEditor';

interface AssessTestProps {
  title: string;
  description: string;
  instructions: string;
  initialCode: string;
  onSubmit: (code: string) => void;
  isSubmitting: boolean;
  skills: {
    id: string;
    name: string;
  }[];
}

export default function AssessTest({
  title,
  description,
  instructions,
  initialCode,
  onSubmit,
  isSubmitting,
  skills,
}: AssessTestProps) {
  const handleSubmit = (code: string) => {
    onSubmit(code);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium mr-3">
            Belt Test
          </div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {skill.name}
            </span>
          ))}
        </div>
        
        <div className="prose max-w-none mb-6">
          <div
            dangerouslySetInnerHTML={{ __html: description }}
            className="text-gray-700"
          />
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This is an assessment test. You need to pass this test to earn your belt and unlock the next module.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            Instructions
          </h4>
          <div
            dangerouslySetInnerHTML={{ __html: instructions }}
            className="text-gray-700"
          />
        </div>
      </div>

      <CodeEditor
        initialCode={initialCode}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
