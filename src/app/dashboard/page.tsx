import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import MainLayout from '@/components/layout/MainLayout';
import SkillMatrixVisualizer from '@/components/dashboard/SkillMatrixVisualizer';
import ModuleNavigator from '@/components/dashboard/ModuleNavigator';
import GeminiApiSection from '@/components/dashboard/GeminiApiSection';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Get user profile with skill proficiencies
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      skillProficiencies: {
        include: {
          skill: true,
        },
      },
      currentModule: true,
    },
  });

  // If user profile doesn't exist, create one
  if (!userProfile) {
    await prisma.userProfile.create({
      data: {
        userId: session.user.id,
        level: 1,
        xp: 0,
      },
    });
  }

  // Get recent activity progress
  const recentActivity = await prisma.userActivityProgress.findMany({
    where: {
      userId: userProfile?.id || '',
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 5,
    include: {
      activity: true,
    },
  });

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back, {session.user.name || 'Student'}!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Continue your data analysis journey. Your current level:{' '}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {userProfile?.level || 1}
              </span>
            </p>

            {userProfile?.currentModule ? (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-md transition-colors duration-200">
                <h3 className="text-md font-medium text-indigo-800 dark:text-indigo-300 mb-2">
                  Current Module: {userProfile.currentModule.title}
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">
                  {userProfile.currentModule.description}
                </p>
                <a
                  href={`/modules/${userProfile.currentModule.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-150"
                >
                  Continue Learning
                </a>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md transition-colors duration-200">
                <h3 className="text-md font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                  No active module
                </h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
                  Start your learning journey by selecting a module.
                </p>
                <a
                  href="/modules"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-150"
                >
                  Browse Modules
                </a>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivity.map((progress) => (
                  <div key={progress.id} className="py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {progress.activity.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(progress.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {progress.completed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                            In Progress
                          </span>
                        )}
                        {progress.score !== null && (
                          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {progress.score}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <a
                        href={`/activities/${progress.activity.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-150"
                      >
                        Continue →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No recent activity. Start learning to see your progress here.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <SkillMatrixVisualizer
            skillProficiencies={userProfile?.skillProficiencies || []}
          />
          <ModuleNavigator />
          <GeminiApiSection />
        </div>
      </div>
    </MainLayout>
  );
}
