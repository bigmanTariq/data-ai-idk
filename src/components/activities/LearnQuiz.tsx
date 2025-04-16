'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// Original question format from database
interface DatabaseQuestion {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
}

// New question format from generated content
interface GeneratedQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

// Union type to handle both formats
type Question = DatabaseQuestion | GeneratedQuestion;

interface LearnQuizProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
  isSubmitting: boolean;
}

export default function LearnQuiz({
  questions,
  onSubmit,
  isSubmitting,
}: LearnQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [processedQuestions, setProcessedQuestions] = useState<any[]>([]);

  // Process questions to handle both formats
  useEffect(() => {
    if (!questions || questions.length === 0) return;

    const processed = questions.map((q, index) => {
      // Check if it's a generated question (has 'question' property)
      if ('question' in q) {
        // Convert generated question to a format compatible with the component
        return {
          id: `generated-${index}`,
          text: q.question,
          options: q.options.map((opt: string, optIndex: number) => ({
            id: `opt-${index}-${optIndex}`,
            text: opt,
            isCorrect: optIndex === q.correctOptionIndex,
            explanation: q.explanation
          })),
          explanation: q.explanation
        };
      } else {
        // It's already in the database format
        return q;
      }
    });

    setProcessedQuestions(processed);
  }, [questions]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  if (processedQuestions.length === 0) {
    return <div className="bg-white rounded-lg shadow-md p-6">Loading questions...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Concept Quiz
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {processedQuestions.map((question, index) => (
            <div key={question.id} className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-md font-medium text-gray-800 mb-3">
                {index + 1}. {question.text}
              </h4>
              <div className="space-y-2">
                {question.options.map((option: any) => (
                  <div key={option.id} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={`question-${question.id}-option-${option.id}`}
                        name={`question-${question.id}`}
                        type="radio"
                        checked={answers[question.id] === option.id}
                        onChange={() =>
                          handleOptionSelect(question.id, option.id)
                        }
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor={`question-${question.id}-option-${option.id}`}
                        className="text-gray-700"
                      >
                        {option.text}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              Object.keys(answers).length !== processedQuestions.length
            }
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting ||
              Object.keys(answers).length !== processedQuestions.length
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      </form>
    </div>
  );
}
