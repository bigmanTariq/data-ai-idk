import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import MainLayout from '@/components/layout/MainLayout';
import SkillMatrixVisualizer from '@/components/skills/SkillMatrixVisualizer';

export default async function SkillsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Get user profile with skill proficiencies
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      skillProficiencies: {
        include: {
          skill: true,
        },
      },
    },
  });

  // Get all skills grouped by category
  const allSkills = await prisma.skill.findMany({
    orderBy: {
      category: 'asc',
    },
  });

  // Group skills by category
  const skillsByCategory = allSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof allSkills>);

  // Map proficiency levels to numeric values for display
  const proficiencyLevels = {
    NOVICE: 1,
    APPRENTICE: 2,
    JOURNEYMAN: 3,
    MASTER: 4,
  };

  // Get user's proficiency for each skill
  const skillProficiencyMap = userProfile?.skillProficiencies.reduce(
    (acc, proficiency) => {
      acc[proficiency.skillId] = proficiency.proficiencyLevel;
      return acc;
    },
    {} as Record<string, keyof typeof proficiencyLevels>
  ) || {};

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Skill Matrix</h1>

        <div className="mb-12">
          <SkillMatrixVisualizer
            skillProficiencies={userProfile?.skillProficiencies || []}
          />
        </div>

        <div className="space-y-12">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {category}
              </h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Skill
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Proficiency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {skills.map((skill) => {
                      const proficiencyLevel =
                        skillProficiencyMap[skill.id] || 'NOVICE';
                      return (
                        <tr key={skill.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {skill.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {skill.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-full bg-indigo-600 rounded-full"
                                  style={{
                                    width: `${
                                      (proficiencyLevels[proficiencyLevel] /
                                        4) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-3 text-sm font-medium text-gray-700">
                                {proficiencyLevel.charAt(0) +
                                  proficiencyLevel
                                    .slice(1)
                                    .toLowerCase()
                                    .replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Proficiency Levels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Novice</h3>
              <p className="text-gray-600">
                Basic understanding of the concept. Can use the skill with
                guidance and in simple contexts.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Apprentice
              </h3>
              <p className="text-gray-600">
                Working knowledge of the skill. Can apply it independently in
                standard situations.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Journeyman
              </h3>
              <p className="text-gray-600">
                Solid proficiency. Can apply the skill in complex situations and
                adapt it to different contexts.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Master</h3>
              <p className="text-gray-600">
                Expert level. Deep understanding of the skill, can teach others,
                and apply it creatively in novel situations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
