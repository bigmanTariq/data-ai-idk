import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import SkillForm from '@/components/admin/SkillForm';

export default async function EditSkillPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect('/login');
  }

  const skillId = params.id;

  // Fetch the skill
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  if (!skill) {
    notFound();
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

  const categories = skills.map((s) => s.category);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Skill</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <SkillForm skill={skill} isEditing={true} categories={categories} />
        </div>
      </div>
    </div>
  );
}
