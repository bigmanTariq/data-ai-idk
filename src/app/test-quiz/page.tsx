'use client';

import { useEffect, useState } from 'react';
import { getActivityById } from '@/lib/moduleGenerator';
import LearnQuiz from '@/components/activities/LearnQuiz';

export default function TestQuizPage() {
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Generate content directly
    const generatedActivity = getActivityById('learn-concept-1-1-1');
    setActivity(generatedActivity);
    setLoading(false);
  }, []);

  const handleSubmit = (answers: Record<string, string>) => {
    console.log('Submitted answers:', answers);
    setResult({
      score: 100,
      message: 'Great job!'
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!activity) {
    return <div className="p-8">No activity found</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{activity.title}</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quiz Component Test</h2>
        <LearnQuiz 
          questions={activity.content.quizQuestions} 
          onSubmit={handleSubmit}
          isSubmitting={false}
        />
      </div>

      {result && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <h3 className="font-medium text-green-800">Result</h3>
          <p>Score: {result.score}%</p>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}
