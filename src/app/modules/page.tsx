import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import MainLayout from '@/components/layout/MainLayout';
import { generateAllModules } from '@/lib/moduleGenerator';

export default async function ModulesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Try to get modules from the database, fall back to generated modules if needed
  let modules;
  let useGenerated = false;

  try {
    modules = await prisma.module.findMany({
      orderBy: {
        order: 'asc',
      },
      include: {
        _count: {
          select: {
            activities: true,
          },
        },
        activities: {
          select: {
            id: true,
            type: true,
          },
      },
    },
  });

    // If no modules in database, use generated modules
    if (modules.length === 0) {
      useGenerated = true;
      const generatedModules = generateAllModules();
      modules = generatedModules.map(module => ({
        ...module,
        _count: { activities: module.activities.length },
      }));
    }
  } catch (error) {
    console.error('Error fetching modules from database:', error);
    useGenerated = true;
    const generatedModules = generateAllModules();
    modules = generatedModules.map(module => ({
      ...module,
      _count: { activities: module.activities.length },
    }));
  }

  // Get user progress for each module
  let userProfile;
  try {
    userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        activityProgress: true,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    userProfile = { activityProgress: [] };
  }

  // Calculate progress for each module
  const modulesWithProgress = modules.map((module) => {
    const totalActivities = module._count.activities;
    const completedActivities = userProfile?.activityProgress.filter(
      (progress) =>
        progress.completed &&
        module.activities.some((activity) => activity.id === progress.activityId)
    ).length || 0;

    const progressPercentage =
      totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

    // Count activities by type
    const activityCounts = useGenerated
      ? module.activities.reduce(
          (acc, activity) => {
            // Map generated types to UI types
            if (activity.type === 'learn') acc.LEARN_QUIZ++;
            else if (activity.type === 'practice') acc.PRACTICE_DRILL++;
            else if (activity.type === 'apply') acc.APPLY_CHALLENGE++;
            else if (activity.type === 'assess') acc.ASSESS_TEST++;
            return acc;
          },
          {
            LEARN_QUIZ: 0,
            PRACTICE_DRILL: 0,
            APPLY_CHALLENGE: 0,
            ASSESS_TEST: 0,
          }
        )
      : module.activities.reduce(
          (acc, activity) => {
            acc[activity.type]++;
            return acc;
          },
          {
            LEARN_QUIZ: 0,
            PRACTICE_DRILL: 0,
            APPLY_CHALLENGE: 0,
            ASSESS_TEST: 0,
          }
        );

    return {
      ...module,
      completedActivities,
      totalActivities,
      progressPercentage,
      activityCounts,
    };
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Learning Modules
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulesWithProgress.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Module {module.order}: {module.title}
                </h2>
                <p className="text-gray-600 mb-4">{module.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>
                      {module.completedActivities}/{module.totalActivities}{' '}
                      activities
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${module.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-blue-50 p-2 rounded">
                    <span className="text-xs text-blue-700 font-medium">
                      Learn
                    </span>
                    <p className="text-sm text-blue-800">
                      {module.activityCounts.LEARN_QUIZ} quizzes
                    </p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <span className="text-xs text-green-700 font-medium">
                      Practice
                    </span>
                    <p className="text-sm text-green-800">
                      {module.activityCounts.PRACTICE_DRILL} drills
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <span className="text-xs text-yellow-700 font-medium">
                      Apply
                    </span>
                    <p className="text-sm text-yellow-800">
                      {module.activityCounts.APPLY_CHALLENGE} challenges
                    </p>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <span className="text-xs text-red-700 font-medium">
                      Assess
                    </span>
                    <p className="text-sm text-red-800">
                      {module.activityCounts.ASSESS_TEST} tests
                    </p>
                  </div>
                </div>

                <Link
                  href={`/modules/${module.id}`}
                  className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
                >
                  {module.progressPercentage > 0 ? 'Continue' : 'Start'} Module
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
