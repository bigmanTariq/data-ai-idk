import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/modules - Get all modules
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const modules = await prisma.module.findMany({
      orderBy: {
        order: 'asc',
      },
      include: {
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

// POST /api/admin/modules - Create a new module
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, order } = data;

    // Validate input
    if (!title || !description || !order) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if a module with the same order already exists
    const existingModule = await prisma.module.findUnique({
      where: { order },
    });

    if (existingModule) {
      return NextResponse.json(
        { error: 'A module with this order already exists' },
        { status: 409 }
      );
    }

    // Create the module
    const module = await prisma.module.create({
      data: {
        title,
        description,
        order,
      },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}
