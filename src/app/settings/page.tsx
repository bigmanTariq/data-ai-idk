import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import MainLayout from '@/components/layout/MainLayout';
import GeminiApiKeyForm from '@/components/settings/GeminiApiKeyForm';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Gemini API Integration
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Add your Gemini API key to enable AI-powered explanations and suggestions.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
              <GeminiApiKeyForm />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
