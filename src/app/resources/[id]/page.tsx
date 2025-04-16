import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import MainLayout from '@/components/layout/MainLayout';
import ResourceExplanation from '@/components/resources/ResourceExplanation';
import RelatedConcepts from '@/components/resources/RelatedConcepts';
import Link from 'next/link';

// Define the params type according to Next.js recommendations
type PageParams = {
  params: {
    id: string;
  };
};

export default async function ResourceDetailPage({ params }: PageParams) {
  // In Next.js 15, we need to await the params object
  const { id } = await params;
  // First, await the session to ensure we're properly handling async operations
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Get the resource from the database
  const resource = await prisma.resource.findUnique({
    where: {
      id,
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

  if (!resource) {
    notFound();
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/resources"
              className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <svg
                className="mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Resources
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {resource.title}
            </h1>
          </div>
          <Link
            href={`/api/resources/${resource.id}/download`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Download PDF
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Resource Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Details about the PDF resource.
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Title
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {resource.title}
                </dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {resource.description}
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Category
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {resource.category.replace('_', ' ')}
                </dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  File Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {resource.fileName} ({formatFileSize(resource.fileSize)})
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Uploaded By
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {resource.uploadedBy.name || resource.uploadedBy.email || 'Unknown'}
                </dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Upload Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {formatDate(resource.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              AI-Powered Document Analysis
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Our AI analyzes the PDF content to provide insights and explanations.
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <ResourceExplanation
              resourceId={resource.id}
              initialExplanation={resource.aiExplanation}
              aiProcessed={resource.aiProcessed}
              resourceTitle={resource.title}
            />

            {resource.aiProcessed && resource.aiExplanation && (
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">How this helps you:</h4>
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Quickly understand complex PDF content without reading the entire document</li>
                  <li>Identify key concepts and terminology relevant to your data analysis learning</li>
                  <li>See practical applications and connections to other data science topics</li>
                  <li>Get a structured breakdown of methodologies and frameworks mentioned</li>
                </ul>
              </div>
            )}

            <RelatedConcepts
              resourceTitle={resource.title}
              resourceDescription={resource.description}
              resourceCategory={resource.category}
              aiExplanation={resource.aiExplanation}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
