'use client';

import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import CodeExplainer from './CodeExplainer';

interface PracticeDrillProps {
  instructions: string;
  initialCode: string;
  onSubmit: (code: string) => void;
  isSubmitting: boolean;
  skills: {
    id: string;
    name: string;
  }[];
}

export default function PracticeDrill({
  instructions,
  initialCode,
  onSubmit,
  isSubmitting,
  skills,
}: PracticeDrillProps) {
  const [code, setCode] = useState(initialCode);

  const handleSubmit = (code: string) => {
    setCode(code);
    onSubmit(code);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Practice Drill
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
            >
              {skill.name}
            </span>
          ))}
        </div>
        <div className="prose max-w-none">
          <div
            dangerouslySetInnerHTML={{ __html: instructions }}
            className="text-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
      <CodeEditor
        initialCode={initialCode}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          AI Assistance
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Get help understanding the code or exploring alternative approaches using Gemini AI.
        </p>
        <CodeExplainer
          code={code}
          context={skills.map(s => s.name).join(', ')}
        />
      </div>
    </div>
  );
}
