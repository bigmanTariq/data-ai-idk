import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/activities - Get all activities
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activities = await prisma.activity.findMany({
      orderBy: [
        {
          moduleId: 'asc',
        },
        {
          order: 'asc',
        },
      ],
      include: {
        module: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
        activitySkills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            userProgress: true,
          },
        },
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/admin/activities - Create a new activity
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, type, moduleId, order, xpReward, content, skills } = data;

    // Validate input
    if (!title || !description || !type || !moduleId || !order || xpReward === undefined || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if an activity with the same order in the same module already exists
    const existingActivity = await prisma.activity.findFirst({
      where: {
        moduleId,
        order,
      },
    });

    if (existingActivity) {
      return NextResponse.json(
        { error: 'An activity with this order already exists in this module' },
        { status: 409 }
      );
    }

    // Create the activity
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        type,
        moduleId,
        order,
        xpReward,
        content,
      },
    });

    // Link skills to the activity if provided
    if (skills && skills.length > 0) {
      const skillConnections = skills.map((skillId: string) => ({
        activityId: activity.id,
        skillId,
      }));

      await prisma.activitySkill.createMany({
        data: skillConnections,
      });
    }

    // Fetch the created activity with its skills
    const createdActivity = await prisma.activity.findUnique({
      where: { id: activity.id },
      include: {
        activitySkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return NextResponse.json(createdActivity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
