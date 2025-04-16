import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/skills - Get all skills
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skills = await prisma.skill.findMany({
      orderBy: [
        {
          category: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      include: {
        _count: {
          select: {
            activitySkills: true,
            userProficiencies: true,
          },
        },
      },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

// POST /api/admin/skills - Create a new skill
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, category } = data;

    // Validate input
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if a skill with the same name already exists
    const existingSkill = await prisma.skill.findUnique({
      where: { name },
    });

    if (existingSkill) {
      return NextResponse.json(
        { error: 'A skill with this name already exists' },
        { status: 409 }
      );
    }

    // Create the skill
    const skill = await prisma.skill.create({
      data: {
        name,
        description,
        category,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}
