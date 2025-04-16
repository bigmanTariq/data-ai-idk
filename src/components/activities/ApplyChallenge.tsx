'use client';

import React, { useState } from 'react';
import CodeEditor from './CodeEditor';

interface Step {
  id: string;
  title: string;
  instructions: string;
  initialCode: string;
}

interface ApplyChallengeProps {
  title: string;
  description: string;
  steps: Step[];
  onSubmit: (stepId: string, code: string) => void;
  isSubmitting: boolean;
  skills: {
    id: string;
    name: string;
  }[];
}

export default function ApplyChallenge({
  title,
  description,
  steps,
  onSubmit,
  isSubmitting,
  skills,
}: ApplyChallengeProps) {
  const [activeStep, setActiveStep] = useState(0);

  const handleSubmit = (code: string) => {
    onSubmit(steps[activeStep].id, code);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
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

        <div className="border-t border-gray-200 pt-4">
          <div className="flex mb-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`px-4 py-2 text-sm font-medium ${
                  activeStep === index
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Step {index + 1}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h4 className="text-md font-medium text-gray-800 mb-2">
              {steps[activeStep].title}
            </h4>
            <div
              dangerouslySetInnerHTML={{
                __html: steps[activeStep].instructions,
              }}
              className="text-gray-700"
            />
          </div>
        </div>
      </div>

      <CodeEditor
        initialCode={steps[activeStep].initialCode}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
