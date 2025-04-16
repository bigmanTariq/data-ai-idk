import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user profile with skill proficiencies
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        skillProficiencies: {
          include: {
            skill: true,
          },
        },
        currentModule: true,
      },
    });

    // If user profile doesn't exist, create one
    if (!userProfile) {
      const newUserProfile = await prisma.userProfile.create({
        data: {
          userId,
          level: 1,
          xp: 0,
        },
        include: {
          skillProficiencies: {
            include: {
              skill: true,
            },
          },
          currentModule: true,
        },
      });

      return NextResponse.json(newUserProfile);
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
