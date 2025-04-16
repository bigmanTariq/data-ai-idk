import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/modules/[id] - Get a specific module
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const moduleId = params.id;

    const module = await prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      include: {
        activities: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { error: 'Failed to fetch module' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/modules/[id] - Update a module
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const moduleId = params.id;
    const data = await request.json();
    const { title, description, order } = data;

    // Validate input
    if (!title || !description || !order) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Check if another module with the same order exists (excluding this one)
    const conflictingModule = await prisma.module.findFirst({
      where: {
        order,
        id: { not: moduleId },
      },
    });

    if (conflictingModule) {
      return NextResponse.json(
        { error: 'Another module with this order already exists' },
        { status: 409 }
      );
    }

    // Update the module
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title,
        description,
        order,
      },
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/modules/[id] - Delete a module
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const moduleId = params.id;

    // Check if the module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });

    if (!existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Check if the module has activities
    if (existingModule._count.activities > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete module with activities. Delete the activities first.',
        },
        { status: 400 }
      );
    }

    // Delete the module
    await prisma.module.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
}
