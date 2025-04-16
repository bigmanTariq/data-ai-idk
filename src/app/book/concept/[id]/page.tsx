import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import MainLayout from '@/components/layout/MainLayout';
import { bookStructure, getConceptById } from '@/lib/bookStructure';
import BookNavigator from '@/components/book/BookNavigator';
import DynamicContentWrapper from '@/components/book/DynamicContentWrapper';

export default async function ConceptPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Get the concept directly using the id from params
  // In Next.js, we need to be careful with how we access params
  const concept = getConceptById(params.id);

  if (!concept) {
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
              <DynamicContentWrapper concept={concept} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
