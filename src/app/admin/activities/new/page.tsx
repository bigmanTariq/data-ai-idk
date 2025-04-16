import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ActivityForm from '@/components/admin/ActivityForm';

export default async function NewActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect('/login');
  }

  // Get modules for the dropdown
  const modules = await prisma.module.findMany({
    orderBy: {
      order: 'asc',
    },
  });

  // Get skills for the checkboxes
  const skills = await prisma.skill.findMany({
    orderBy: [
      {
        category: 'asc',
      },
      {
        name: 'asc',
      },
    ],
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Activity</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ActivityForm modules={modules} skills={skills} />
        </div>
      </div>
    </div>
  );
}
