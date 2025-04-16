import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/skills/[id] - Get a specific skill
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skillId = params.id;

    const skill = await prisma.skill.findUnique({
      where: {
        id: skillId,
      },
      include: {
        activitySkills: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
        },
        userProficiencies: {
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
        },
      },
    });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/skills/[id] - Update a skill
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skillId = params.id;
    const data = await request.json();
    const { name, description, category } = data;

    // Validate input
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the skill exists
    const existingSkill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!existingSkill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Check if another skill with the same name exists (excluding this one)
    if (name !== existingSkill.name) {
      const conflictingSkill = await prisma.skill.findUnique({
        where: { name },
      });

      if (conflictingSkill) {
        return NextResponse.json(
          { error: 'Another skill with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update the skill
    const updatedSkill = await prisma.skill.update({
      where: { id: skillId },
      data: {
        name,
        description,
        category,
      },
    });

    return NextResponse.json(updatedSkill);
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/skills/[id] - Delete a skill
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skillId = params.id;

    // Check if the skill exists
    const existingSkill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: {
        _count: {
          select: {
            activitySkills: true,
            userProficiencies: true,
          },
        },
      },
    });

    if (!existingSkill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Check if the skill is used in activities or user proficiencies
    if (
      existingSkill._count.activitySkills > 0 ||
      existingSkill._count.userProficiencies > 0
    ) {
      return NextResponse.json(
        {
          error:
            'Cannot delete skill that is in use. Remove all references to this skill first.',
        },
        { status: 400 }
      );
    }

    // Delete the skill
    await prisma.skill.delete({
      where: { id: skillId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill' },
      { status: 500 }
    );
  }
}
