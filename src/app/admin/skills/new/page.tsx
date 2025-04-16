import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import SkillForm from '@/components/admin/SkillForm';

export default async function NewSkillPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect('/login');
  }

  // Get existing categories for the dropdown
  const skills = await prisma.skill.findMany({
    select: {
      category: true,
    },
    distinct: ['category'],
    orderBy: {
      category: 'asc',
    },
  });

  const categories = skills.map((skill) => skill.category);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Skill</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <SkillForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
