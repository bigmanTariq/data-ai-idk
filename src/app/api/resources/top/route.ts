import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/resources/top - Get top resources with AI explanations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get resources that have been processed by AI
    const resources = await prisma.resource.findMany({
      where: {
        aiProcessed: true,
        aiExplanation: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        aiProcessed: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4, // Limit to 4 resources
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching top resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top resources' },
      { status: 500 }
    );
  }
}
