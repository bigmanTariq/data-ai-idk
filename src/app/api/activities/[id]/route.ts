import { getServerSession } from 'next-auth/next';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getActivityById } from '@/lib/moduleGenerator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the activity ID from params
    const activityId = params.id;
    const useGenerated = request.nextUrl.searchParams.get('generated') === 'true';

    // Use generated activity if specified
    if (useGenerated) {
      const activity = getActivityById(activityId);
      if (!activity) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }
      return NextResponse.json(activity);
    }

    // Otherwise, try to get activity from the database
    try {
      const activity = await prisma.activity.findUnique({
        where: {
          id: activityId,
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
      });

      if (!activity) {
        // If not found in database, try generated activity
        const generatedActivity = getActivityById(activityId);
        if (generatedActivity) {
          return NextResponse.json(generatedActivity);
        }
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }

      return NextResponse.json(activity);
    } catch (dbError) {
      console.error('Database error, falling back to generated activity:', dbError);
      const generatedActivity = getActivityById(activityId);
      if (generatedActivity) {
        return NextResponse.json(generatedActivity);
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
