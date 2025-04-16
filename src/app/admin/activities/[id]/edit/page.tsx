import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ActivityForm from '@/components/admin/ActivityForm';

export default async function EditActivityPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect('/login');
  }

  const activityId = params.id;

  // Fetch the activity with its skills
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      activitySkills: true,
    },
  });

  if (!activity) {
    notFound();
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

  // Format the activity data for the form
  const formattedActivity = {
    ...activity,
    skills: activity.activitySkills.map((as) => as.skillId),
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Activity</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ActivityForm
            activity={formattedActivity}
            isEditing={true}
            modules={modules}
            skills={skills}
          />
        </div>
      </div>
    </div>
  );
}
