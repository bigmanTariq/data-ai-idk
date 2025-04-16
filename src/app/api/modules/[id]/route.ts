import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
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
          include: {
            activitySkills: {
              include: {
                skill: true,
              },
            },
            userProgress: {
              where: {
                userId: session.user.id,
              },
            },
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
