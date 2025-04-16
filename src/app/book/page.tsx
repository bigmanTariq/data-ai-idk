import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import MainLayout from '@/components/layout/MainLayout';
import { bookStructure } from '@/lib/bookStructure';
import BookNavigator from '@/components/book/BookNavigator';
import ResourceRecommendations from '@/components/book/ResourceRecommendations';

export default async function BookPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Data Analysis from Scratch with Python
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              An interactive learning experience with AI-powered explanations and examples.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <BookNavigator bookStructure={bookStructure} />
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Welcome to Your Interactive Book
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  This interactive book combines the content of "Data Analysis from Scratch with Python"
                  with AI-powered explanations, examples, and practice exercises.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Select a chapter and concept from the navigation menu to get started.
                </p>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Features
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Dynamic explanations tailored to your learning style</li>
                    <li>Interactive code examples you can modify and run</li>
                    <li>Practice exercises with automated feedback</li>
                    <li>Ask questions about any concept</li>
                    <li>Simplified or elaborate explanations based on your needs</li>
                    <li>Access to related PDF resources with AI explanations</li>
                  </ul>
                </div>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <ResourceRecommendations />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
