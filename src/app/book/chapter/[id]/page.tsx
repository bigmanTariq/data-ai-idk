import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import MainLayout from '@/components/layout/MainLayout';
import { bookStructure, getChapterById } from '@/lib/bookStructure';
import BookNavigator from '@/components/book/BookNavigator';
import Link from 'next/link';

export default async function ChapterPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // In Next.js 15, we need to properly handle params
  const chapterId = params.id;
  const chapter = getChapterById(chapterId);

  if (!chapter) {
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
                  Chapter {chapter.number}: {chapter.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {chapter.description}
                </p>

                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Sections in this Chapter
                </h3>

                <div className="space-y-4">
                  {chapter.sections.map((section) => (
                    <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                        {section.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {section.description}
                      </p>

                      <Link
                        href={`/book/section/${section.id}`}
                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                      >
                        View Section →
                      </Link>

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Key Concepts:
                        </p>
                        <ul className="space-y-1">
                          {section.concepts.map((concept) => (
                            <li key={concept.id}>
                              <Link
                                href={`/book/concept/${concept.id}`}
                                className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                              >
                                • {concept.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
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
