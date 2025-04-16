'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { use } from 'react';
import GeminiFloatingButton from '@/components/gemini/GeminiFloatingButton';
import LearnQuiz from '@/components/activities/LearnQuiz';
import PracticeDrill from '@/components/activities/PracticeDrill';
import ApplyChallenge from '@/components/activities/ApplyChallenge';
import AssessTest from '@/components/activities/AssessTest';

interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'LEARN_QUIZ' | 'PRACTICE_DRILL' | 'APPLY_CHALLENGE' | 'ASSESS_TEST' | 'learn' | 'practice' | 'apply' | 'assess';
  content: any;
  moduleId?: string;
  module?: {
    id: string;
    title: string;
  };
  activitySkills?: {
    id: string;
    skill: {
      id: string;
      name: string;
    };
  }[];
  skillIds?: string[];
  skills?: {
    id: string;
    name: string;
  }[];
  userProgress?: {
    id: string;
    completed: boolean;
    score: number | null;
    attempts: number;
  }[];
}

interface Module {
  id: string;
  title: string;
  order: number;
}

export default function ActivityPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const activityId = unwrappedParams.id;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    const fetchActivity = async () => {
      try {
        // Try to fetch from generated content first
        const response = await fetch(`/api/activities/${activityId}?generated=true`);
        if (!response.ok) {
          throw new Error('Failed to fetch activity');
        }
        const data = await response.json();
        setActivity(data);

        // For generated activities, we need to handle skills differently
        if (data.skillIds) {
          // This is a generated activity
          const skills = [];
          for (const skillId of data.skillIds) {
            const skillResponse = await fetch(`/api/skills?id=${skillId}&generated=true`);
            if (skillResponse.ok) {
              const skillData = await skillResponse.json();
              skills.push(skillData);
            }
          }
          data.skills = skills;
          setActivity(data);
        }

        // Fetch module info
        if (data.moduleId) {
          const moduleResponse = await fetch(`/api/modules/${data.moduleId}`);
          if (moduleResponse.ok) {
            const moduleData = await moduleResponse.json();
            setModule(moduleData);
          }
        } else if (data.module) {
          // For generated activities, the module info is already included
          setModule(data.module);
        }
      } catch (err) {
        setError('Error loading activity. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchActivity();
    }
  }, [activityId, router, session, status]);

  const handleSubmit = async (submission: any) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      // For generated activities, we'll validate the answers
      if (activity?.skillIds) {
        // This is a generated activity
        setTimeout(() => {
          // For quiz activities, validate the answers
          if (activity.type === 'learn' && activity.content.quizQuestions) {
            const quizQuestions = activity.content.quizQuestions;
            let correctAnswers = 0;
            let totalQuestions = quizQuestions.length;

            // Check each answer against the correct option
            Object.entries(submission).forEach(([questionId, answerId]) => {
              // Extract the question index from the ID (format: generated-X)
              const questionIndex = parseInt(questionId.split('-')[1]);
              // Extract the option index from the ID (format: opt-X-Y)
              const optionIndex = parseInt(answerId.split('-')[2]);

              // Check if the selected option is correct
              if (quizQuestions[questionIndex] &&
                  optionIndex === quizQuestions[questionIndex].correctOptionIndex) {
                correctAnswers++;
              }
            });

            // Calculate score as a percentage
            const score = Math.round((correctAnswers / totalQuestions) * 100);
            const passed = score >= 70; // Pass threshold is 70%

            setResult({
              success: true,
              result: {
                passed: passed,
                score: score,
                feedback: passed
                  ? `You got ${correctAnswers} out of ${totalQuestions} questions correct!`
                  : `You got ${correctAnswers} out of ${totalQuestions} questions correct. Try again to improve your score.`,
              },
              xpGained: passed ? 10 : 5,
              completed: passed,
            });
          } else {
            // For other activity types, simulate success
            setResult({
              success: true,
              result: {
                passed: true,
                score: 100,
                feedback: 'Great job! Your submission was successful.',
              },
              xpGained: 10,
              completed: true,
            });
          }
          setIsSubmitting(false);
        }, 1500);
        return;
      }

      // For database activities, use the API
      const response = await fetch(`/api/activities/${activityId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submission }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit activity');
      }

      const data = await response.json();
      setResult(data);

      // Update activity with new progress
      setActivity((prev) => {
        if (!prev) return null;

        const updatedProgress = prev.userProgress?.length
          ? [
              {
                ...prev.userProgress[0],
                completed: data.result.passed,
                score: data.result.score,
                attempts: (prev.userProgress[0].attempts || 0) + 1,
              },
            ]
          : [
              {
                id: 'temp-id',
                completed: data.result.passed,
                score: data.result.score,
                attempts: 1,
              },
            ];

        return {
          ...prev,
          userProgress: updatedProgress,
        };
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during submission');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-medium text-red-600 mb-4">Error</h2>
            <p className="text-gray-700">
              {error || 'Activity not found. Please try again later.'}
            </p>
            <div className="mt-6">
              <Link
                href="/modules"
                className="text-indigo-600 hover:text-indigo-800"
              >
                Return to Modules
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract skills from activity
  const skills = activity.skills
    ? activity.skills
    : activity.activitySkills
    ? activity.activitySkills.map((as) => ({
        id: as.skill.id,
        name: as.skill.name,
      }))
    : [];

  // Determine if activity is completed
  const isCompleted = activity.userProgress
    ? activity.userProgress.length > 0 && activity.userProgress[0].completed
    : false;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <Link
              href={module ? `/modules/${module.id}` : '/modules'}
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {module ? `Back to Module ${module.order}: ${module.title}` : 'Back to Module'}
            </Link>
            {isCompleted && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Completed
              </span>
            )}
          </div>
        </div>

        {result && (
          <div
            className={`mb-8 p-4 rounded-md ${
              result.result && result.result.passed
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex">
              <div
                className={`flex-shrink-0 ${
                  result.result && result.result.passed ? 'text-green-600' : 'text-yellow-600'
                }`}
              >
                {result.result && result.result.passed ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    ></path>
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3
                  className={`text-sm font-medium ${
                    result.result && result.result.passed ? 'text-green-800' : 'text-yellow-800'
                  }`}
                >
                  {result.result && result.result.passed
                    ? 'Success! Activity completed.'
                    : 'Not quite there yet.'}
                </h3>
                <div
                  className={`mt-2 text-sm ${
                    result.result && result.result.passed ? 'text-green-700' : 'text-yellow-700'
                  }`}
                >
                  <p>{result.result && result.result.feedback}</p>
                  <p className="mt-1">
                    Score: {result.result && result.result.score ? result.result.score : 0}% | XP Gained: {result.xpGained || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activity.type === 'LEARN_QUIZ' || activity.type === 'learn') && (
          <LearnQuiz
            questions={activity.content.quizQuestions || activity.content.questions}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {(activity.type === 'PRACTICE_DRILL' || activity.type === 'practice') && (
          <PracticeDrill
            instructions={activity.content.instructions}
            initialCode={activity.content.initialCode}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            skills={skills}
          />
        )}

        {(activity.type === 'APPLY_CHALLENGE' || activity.type === 'apply') && (
          <ApplyChallenge
            title={activity.title}
            description={activity.description}
            steps={activity.content.steps || []}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            skills={skills}
          />
        )}

        {(activity.type === 'ASSESS_TEST' || activity.type === 'assess') && (
          <AssessTest
            title={activity.title}
            description={activity.description}
            instructions={activity.content.instructions}
            initialCode={activity.content.initialCode}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            skills={skills}
          />
        )}
      </div>
      <GeminiFloatingButton />
    </div>
  );
}
