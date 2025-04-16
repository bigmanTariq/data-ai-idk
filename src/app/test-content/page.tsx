'use client';

import { useEffect, useState } from 'react';
import { getActivityById } from '@/lib/moduleGenerator';
import ReactMarkdown from 'react-markdown';

export default function TestContentPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate content directly
    const activity = getActivityById('learn-concept-1-1-1');
    setContent(activity);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!content) {
    return <div className="p-8">No content found</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{content.title}</h1>
      <div className="mb-8 prose prose-indigo max-w-none">
        <div className="text-gray-800 dark:text-gray-200">
          <ReactMarkdown>{content.content.instructions}</ReactMarkdown>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Quiz Questions</h2>
      {content.content.quizQuestions?.map((question: any, index: number) => (
        <div key={index} className="mb-6 p-4 border rounded-lg">
          <h3 className="font-medium mb-2">{question.question}</h3>
          <ul className="list-disc pl-5">
            {question.options.map((option: string, optIndex: number) => (
              <li key={optIndex} className={optIndex === question.correctOptionIndex ? "text-green-600 font-medium" : ""}>
                {option} {optIndex === question.correctOptionIndex && "(Correct)"}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-gray-600">{question.explanation}</p>
        </div>
      ))}
    </div>
  );
}
