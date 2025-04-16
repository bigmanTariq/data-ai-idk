import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import MainLayout from '@/components/layout/MainLayout';
import { getModuleById } from '@/lib/moduleGenerator';

export default async function ModuleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Get the ID from params
  const { id } = params;
  const moduleId = id;
  let module;
  let isGenerated = false;

  // Check if this is a generated module (module-chapter-X format)
  if (moduleId.startsWith('module-')) {
    const generatedModule = getModuleById(moduleId);
    if (generatedModule) {
      module = generatedModule;
      isGenerated = true;
    }
  }

  // If not a generated module or not found, try to get from database
  if (!module) {
    try {
      module = await prisma.module.findUnique({
        where: {
          id: moduleId,
        },
        include: {
          activities: {
            orderBy: {
              order: 'asc',
            },
        include: {
          activitySkills: {
            include: {
              skill: true,
            },
          },
        },
      },
    },
  });
    } catch (error) {
      console.error('Error fetching module from database:', error);
      // If database error and not already checked for generated module, try generated
      if (!moduleId.startsWith('module-')) {
        const generatedModuleId = `module-${moduleId}`;
        const generatedModule = getModuleById(generatedModuleId);
        if (generatedModule) {
          module = generatedModule;
          isGenerated = true;
        }
      }
    }
  }

  if (!module) {
    notFound();
  }

  // Get user progress for this module's activities
  let userProgress = [];
  if (!isGenerated) {
    try {
      userProgress = await prisma.userActivityProgress.findMany({
        where: {
          userId: session.user.id,
          activity: {
            moduleId,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  }

  // Update user's current module if not a generated module
  if (!isGenerated) {
    try {
      await prisma.userProfile.update({
        where: {
          userId: session.user.id,
        },
        data: {
          currentModuleId: moduleId,
        },
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  // Group activities by type
  const learnActivities = module.activities.filter(
    (activity) => activity.type === 'LEARN_QUIZ' || activity.type === 'learn'
  );
  const practiceActivities = module.activities.filter(
    (activity) => activity.type === 'PRACTICE_DRILL' || activity.type === 'practice'
  );
  const applyActivities = module.activities.filter(
    (activity) => activity.type === 'APPLY_CHALLENGE' || activity.type === 'apply'
  );
  const assessActivities = module.activities.filter(
    (activity) => activity.type === 'ASSESS_TEST' || activity.type === 'assess'
  );

  // Helper function to get activity status
  const getActivityStatus = (activityId: string) => {
    // For generated modules, always return NOT_STARTED
    if (isGenerated) return 'NOT_STARTED';

    const progress = userProgress.find(
      (progress) => progress.activityId === activityId
    );
    if (!progress) return 'NOT_STARTED';
    if (progress.completed) return 'COMPLETED';
    return 'IN_PROGRESS';
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/modules"
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
            Back to Modules
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Module {module.order}: {module.title}
          </h1>
          <p className="text-gray-600 mb-6">{module.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-1">Learn</h3>
              <p className="text-sm text-blue-600">
                {learnActivities.length} quizzes
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-1">
                Practice
              </h3>
              <p className="text-sm text-green-600">
                {practiceActivities.length} drills
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-800 mb-1">
                Apply
              </h3>
              <p className="text-sm text-yellow-600">
                {applyActivities.length} challenges
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-red-800 mb-1">Assess</h3>
              <p className="text-sm text-red-600">
                {assessActivities.length} tests
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Learn Section */}
          <div>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              1. Learn: Understand the Concepts
            </h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {learnActivities.map((activity) => {
                  const status = getActivityStatus(activity.id);
                  return (
                    <li key={activity.id}>
                      <Link
                        href={`/activities/${activity.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-600'
                                  : status === 'IN_PROGRESS'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {status === 'COMPLETED' ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
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
                              )}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900">
                                {activity.title}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {isGenerated && activity.skillIds ? (
                                  // For generated activities
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Related Skills
                                  </span>
                                ) : activity.activitySkills ? (
                                  // For database activities
                                  activity.activitySkills.map((activitySkill) => (
                                    <span
                                      key={activitySkill.id}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {activitySkill.skill.name}
                                    </span>
                                  ))
                                ) : (
                                  // Fallback
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Skill
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Practice Section */}
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              2. Practice: Develop Skills
            </h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {practiceActivities.map((activity) => {
                  const status = getActivityStatus(activity.id);
                  return (
                    <li key={activity.id}>
                      <Link
                        href={`/activities/${activity.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-600'
                                  : status === 'IN_PROGRESS'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {status === 'COMPLETED' ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
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
                              )}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900">
                                {activity.title}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {isGenerated && activity.skillIds ? (
                                  // For generated activities
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Related Skills
                                  </span>
                                ) : activity.activitySkills ? (
                                  // For database activities
                                  activity.activitySkills.map((activitySkill) => (
                                    <span
                                      key={activitySkill.id}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                    >
                                      {activitySkill.skill.name}
                                    </span>
                                  ))
                                ) : (
                                  // Fallback
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Skill
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Apply Section */}
          <div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">
              3. Apply: Integrate Skills
            </h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {applyActivities.map((activity) => {
                  const status = getActivityStatus(activity.id);
                  return (
                    <li key={activity.id}>
                      <Link
                        href={`/activities/${activity.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                status === 'COMPLETED'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : status === 'IN_PROGRESS'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {status === 'COMPLETED' ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
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
                              )}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900">
                                {activity.title}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {isGenerated && activity.skillIds ? (
                                  // For generated activities
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Related Skills
                                  </span>
                                ) : activity.activitySkills ? (
                                  // For database activities
                                  activity.activitySkills.map((activitySkill) => (
                                    <span
                                      key={activitySkill.id}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                                    >
                                      {activitySkill.skill.name}
                                    </span>
                                  ))
                                ) : (
                                  // Fallback
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Skill
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Assess Section */}
          <div>
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              4. Assess: Demonstrate Mastery
            </h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {assessActivities.map((activity) => {
                  const status = getActivityStatus(activity.id);
                  return (
                    <li key={activity.id}>
                      <Link
                        href={`/activities/${activity.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                status === 'COMPLETED'
                                  ? 'bg-red-100 text-red-600'
                                  : status === 'IN_PROGRESS'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {status === 'COMPLETED' ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
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
                              )}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900">
                                {activity.title}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {isGenerated && activity.skillIds ? (
                                  // For generated activities
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Related Skills
                                  </span>
                                ) : activity.activitySkills ? (
                                  // For database activities
                                  activity.activitySkills.map((activitySkill) => (
                                    <span
                                      key={activitySkill.id}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                    >
                                      {activitySkill.skill.name}
                                    </span>
                                  ))
                                ) : (
                                  // Fallback
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Skill
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
