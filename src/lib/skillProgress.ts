/**
 * Skill Progress Tracking Utility
 * 
 * This module provides functions for tracking and updating user skill proficiency.
 */

import { PrismaClient, ProficiencyLevel, ActivityType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Updates a user's skill proficiency based on activity completion
 * 
 * @param userId The user's ID
 * @param activityId The completed activity's ID
 * @param passed Whether the user passed the activity
 * @param score The user's score on the activity
 */
export async function updateSkillProficiency(
  userId: string,
  activityId: string,
  passed: boolean,
  score: number
): Promise<void> {
  // Get the activity with its associated skills
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

  if (!activity || !activity.activitySkills.length) {
    return;
  }

  // Get the user's current skill proficiencies
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      skillProficiencies: true,
    },
  });

  if (!userProfile) {
    return;
  }

  // For each skill associated with the activity
  for (const activitySkill of activity.activitySkills) {
    const skillId = activitySkill.skillId;
    
    // Find the user's current proficiency for this skill
    const currentProficiency = userProfile.skillProficiencies.find(
      (p) => p.skillId === skillId
    );
    
    // Determine the new proficiency level based on activity type, score, and current level
    let newProficiencyLevel = currentProficiency?.proficiencyLevel || ProficiencyLevel.NOVICE;
    
    if (passed) {
      // Only update proficiency if the user passed the activity
      switch (activity.type) {
        case ActivityType.LEARN_QUIZ:
          // Learn quizzes can get you to APPRENTICE level
          if (
            newProficiencyLevel === ProficiencyLevel.NOVICE &&
            score >= 80
          ) {
            newProficiencyLevel = ProficiencyLevel.APPRENTICE;
          }
          break;
          
        case ActivityType.PRACTICE_DRILL:
          // Practice drills can get you to JOURNEYMAN level
          if (
            newProficiencyLevel === ProficiencyLevel.NOVICE &&
            score >= 70
          ) {
            newProficiencyLevel = ProficiencyLevel.APPRENTICE;
          } else if (
            newProficiencyLevel === ProficiencyLevel.APPRENTICE &&
            score >= 90
          ) {
            newProficiencyLevel = ProficiencyLevel.JOURNEYMAN;
          }
          break;
          
        case ActivityType.APPLY_CHALLENGE:
          // Apply challenges can get you to JOURNEYMAN level
          if (
            newProficiencyLevel === ProficiencyLevel.APPRENTICE &&
            score >= 80
          ) {
            newProficiencyLevel = ProficiencyLevel.JOURNEYMAN;
          }
          break;
          
        case ActivityType.ASSESS_TEST:
          // Only assessment tests can get you to MASTER level
          if (
            newProficiencyLevel === ProficiencyLevel.JOURNEYMAN &&
            score >= 90
          ) {
            newProficiencyLevel = ProficiencyLevel.MASTER;
          }
          break;
      }
    }
    
    // Update or create the user's proficiency for this skill
    if (currentProficiency) {
      // Only update if the new level is higher than the current level
      const proficiencyRanking = {
        [ProficiencyLevel.NOVICE]: 1,
        [ProficiencyLevel.APPRENTICE]: 2,
        [ProficiencyLevel.JOURNEYMAN]: 3,
        [ProficiencyLevel.MASTER]: 4,
      };
      
      if (proficiencyRanking[newProficiencyLevel] > proficiencyRanking[currentProficiency.proficiencyLevel]) {
        await prisma.userSkillProficiency.update({
          where: { id: currentProficiency.id },
          data: { proficiencyLevel: newProficiencyLevel },
        });
      }
    } else {
      // Create a new proficiency record
      await prisma.userSkillProficiency.create({
        data: {
          userId: userProfile.id,
          skillId,
          proficiencyLevel: newProficiencyLevel,
        },
      });
    }
  }
}

/**
 * Gets a summary of a user's skill proficiency levels
 * 
 * @param userId The user's ID
 * @returns A summary of the user's skill proficiency levels
 */
export async function getSkillProficiencySummary(userId: string) {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      skillProficiencies: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!userProfile) {
    return {
      totalSkills: 0,
      proficiencyLevels: {
        NOVICE: 0,
        APPRENTICE: 0,
        JOURNEYMAN: 0,
        MASTER: 0,
      },
      skillsByCategory: {},
    };
  }

  // Count skills by proficiency level
  const proficiencyLevels = {
    NOVICE: 0,
    APPRENTICE: 0,
    JOURNEYMAN: 0,
    MASTER: 0,
  };

  // Group skills by category
  const skillsByCategory: Record<string, {
    name: string;
    proficiencyLevel: ProficiencyLevel;
  }[]> = {};

  for (const proficiency of userProfile.skillProficiencies) {
    // Count by proficiency level
    proficiencyLevels[proficiency.proficiencyLevel]++;

    // Group by category
    const category = proficiency.skill.category;
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    
    skillsByCategory[category].push({
      name: proficiency.skill.name,
      proficiencyLevel: proficiency.proficiencyLevel,
    });
  }

  return {
    totalSkills: userProfile.skillProficiencies.length,
    proficiencyLevels,
    skillsByCategory,
  };
}
