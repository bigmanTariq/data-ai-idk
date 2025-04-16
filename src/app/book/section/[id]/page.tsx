import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import MainLayout from '@/components/layout/MainLayout';
import { bookStructure, getSectionById } from '@/lib/bookStructure';
import BookNavigator from '@/components/book/BookNavigator';
import Link from 'next/link';

export default async function SectionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Use the awaited params
  const { id } = params;
  const section = getSectionById(id);

  if (!section) {
    redirect('/book');
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <BookNavigator bookStructure={bookStructure} />
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {section.description}
                </p>

                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Concepts in this Section
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.concepts.map((concept) => (
                    <div key={concept.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                        {concept.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {concept.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {concept.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/book/concept/${concept.id}`}
                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                      >
                        Learn with AI →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
