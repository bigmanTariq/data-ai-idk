import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getAllSkills, getSkillById } from '@/lib/moduleGenerator';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const skillId = searchParams.get('id');
    const useGenerated = searchParams.get('generated') === 'true';

    // Use generated skills if specified
    if (useGenerated) {
      if (skillId) {
        const skill = getSkillById(skillId);
        if (!skill) {
          return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
        }
        return NextResponse.json(skill);
      }

      const skills = getAllSkills();
      return NextResponse.json(skills);
    }

    // Otherwise, try to get skills from the database
    try {
      if (skillId) {
        const skill = await prisma.skill.findUnique({
          where: {
            id: skillId,
          },
        });

        if (!skill) {
          // If not found in database, try generated skill
          const generatedSkill = getSkillById(skillId);
          if (generatedSkill) {
            return NextResponse.json(generatedSkill);
          }
          return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
        }

        return NextResponse.json(skill);
      }

      const skills = await prisma.skill.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      // If no skills in database, fall back to generated skills
      if (skills.length === 0) {
        const generatedSkills = getAllSkills();
        return NextResponse.json(generatedSkills);
      }

      return NextResponse.json(skills);
    } catch (dbError) {
      console.error('Database error, falling back to generated skills:', dbError);
      if (skillId) {
        const generatedSkill = getSkillById(skillId);
        if (generatedSkill) {
          return NextResponse.json(generatedSkill);
        }
      } else {
        const generatedSkills = getAllSkills();
        return NextResponse.json(generatedSkills);
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
