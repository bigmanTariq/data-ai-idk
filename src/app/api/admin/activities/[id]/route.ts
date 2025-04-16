import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/activities/[id] - Get a specific activity
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activityId = params.id;

    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
      include: {
        module: true,
        activitySkills: {
          include: {
            skill: true,
          },
        },
        userProgress: {
          include: {
            userProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          take: 10,
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/activities/[id] - Update an activity
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activityId = params.id;
    const data = await request.json();
    const { title, description, type, moduleId, order, xpReward, content, skills } = data;

    // Validate input
    if (!title || !description || !type || !moduleId || !order || xpReward === undefined || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the activity exists
    const existingActivity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
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

    // Check if another activity with the same order in the same module exists (excluding this one)
    if (moduleId === existingActivity.moduleId && order !== existingActivity.order) {
      const conflictingActivity = await prisma.activity.findFirst({
        where: {
          moduleId,
          order,
          id: { not: activityId },
        },
      });

      if (conflictingActivity) {
        return NextResponse.json(
          { error: 'Another activity with this order already exists in this module' },
          { status: 409 }
        );
      }
    }

    // Update the activity
    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
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

    // Update skills if provided
    if (skills) {
      // Delete existing skill connections
      await prisma.activitySkill.deleteMany({
        where: { activityId },
      });

      // Create new skill connections
      if (skills.length > 0) {
        const skillConnections = skills.map((skillId: string) => ({
          activityId,
          skillId,
        }));

        await prisma.activitySkill.createMany({
          data: skillConnections,
        });
      }
    }

    // Fetch the updated activity with its skills
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        activitySkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/activities/[id] - Delete an activity
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activityId = params.id;

    // Check if the activity exists
    const existingActivity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        _count: {
          select: {
            userProgress: true,
          },
        },
      },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if the activity has user progress
    if (existingActivity._count.userProgress > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete activity with user progress. Consider disabling it instead.',
        },
        { status: 400 }
      );
    }

    // Delete activity skills
    await prisma.activitySkill.deleteMany({
      where: { activityId },
    });

    // Delete the activity
    await prisma.activity.delete({
      where: { id: activityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
