import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ActivityType } from '@prisma/client';
import { gradeSubmission as gradeSubmissionUtil } from '@/lib/codeExecution';
import { updateSkillProficiency } from '@/lib/skillProgress';

// Helper function to update user XP and level
async function updateUserProgress(
  userId: string,
  xpGained: number,
  activityId: string,
  score: number,
  passed: boolean
) {
  // Get current user profile
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!userProfile) {
    throw new Error('User profile not found');
  }

  // Calculate new XP and level
  const currentXp = userProfile.xp;
  const currentLevel = userProfile.level;
  const newXp = currentXp + xpGained;

  // Simple level calculation (can be adjusted)
  // Level N requires N*100 XP
  const xpForNextLevel = currentLevel * 100;
  const newLevel = newXp >= xpForNextLevel ? currentLevel + 1 : currentLevel;

  // Update user profile
  const updatedProfile = await prisma.userProfile.update({
    where: { userId },
    data: {
      xp: newXp,
      level: newLevel,
    },
  });

  // Update or create activity progress
  const activityProgress = await prisma.userActivityProgress.upsert({
    where: {
      userId_activityId: {
        userId,
        activityId,
      },
    },
    update: {
      score,
      completed: passed,
      attempts: { increment: 1 },
      lastAttempt: new Date(),
    },
    create: {
      userId,
      activityId,
      score,
      completed: passed,
      attempts: 1,
      lastAttempt: new Date(),
    },
  });

  return {
    updatedProfile,
    activityProgress,
  };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activityId = params.id;
    const userId = session.user.id;
    const body = await request.json();
    const { submission } = body;

    // Get activity details
    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Grade the submission
    const gradingResult = gradeSubmissionUtil(
      activity.type,
      submission,
      activity.content
    );

    // Update user progress
    const xpGained = gradingResult.passed ? activity.xpReward : Math.floor(activity.xpReward * 0.1);
    const progressUpdate = await updateUserProgress(
      userId,
      xpGained,
      activityId,
      gradingResult.score,
      gradingResult.passed
    );

    // Update skill proficiency if the user passed the activity
    if (gradingResult.passed) {
      await updateSkillProficiency(
        userId,
        activityId,
        gradingResult.passed,
        gradingResult.score
      );
    }

    return NextResponse.json({
      success: true,
      result: gradingResult,
      xpGained,
      newLevel: progressUpdate.updatedProfile.level,
      newXp: progressUpdate.updatedProfile.xp,
    });
  } catch (error) {
    console.error('Error submitting activity:', error);
    return NextResponse.json(
      { error: 'Failed to submit activity' },
      { status: 500 }
    );
  }
}
