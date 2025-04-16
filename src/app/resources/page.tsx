import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import MainLayout from '@/components/layout/MainLayout';
import FileUploadForm from '@/components/resources/FileUploadForm';
import ResourceList from '@/components/resources/ResourceList';

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Get all resources
  const resources = await prisma.resource.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      uploadedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Check if user is admin
  const isAdmin = session.user.isAdmin;

  return (
    <MainLayout>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Knowledge Resources</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Access and share PDF resources on data science, data analysis, data engineering, and data architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Available Resources</h2>
                <ResourceList resources={resources} isAdmin={isAdmin} />
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden sticky top-24">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Upload New Resource</h2>
                <FileUploadForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
