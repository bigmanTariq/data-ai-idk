'use client';

import React from 'react';
import Link from 'next/link';

interface SkillProficiency {
  id: string;
  skillId: string;
  userId: string;
  proficiencyLevel: 'NOVICE' | 'APPRENTICE' | 'PRACTITIONER' | 'EXPERT' | 'MASTER';
  skill: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
}

interface SkillMatrixVisualizerProps {
  skillProficiencies: SkillProficiency[];
}

export default function SkillMatrixVisualizer({
  skillProficiencies,
}: SkillMatrixVisualizerProps) {
  // Group skills by category
  const skillsByCategory = skillProficiencies.reduce((acc, proficiency) => {
    const category = proficiency.skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(proficiency);
    return acc;
  }, {} as Record<string, SkillProficiency[]>);

  // Get proficiency level color
  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'NOVICE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'APPRENTICE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'PRACTITIONER':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'EXPERT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
      case 'MASTER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Your Skills
        </h3>
        <Link
          href="/skills"
          className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-150"
        >
          View All Skills →
        </Link>
      </div>

      {Object.keys(skillsByCategory).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((proficiency) => (
                  <div
                    key={proficiency.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md transition-colors duration-200"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {proficiency.skill.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {proficiency.skill.description}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProficiencyColor(
                        proficiency.proficiencyLevel
                      )}`}
                    >
                      {proficiency.proficiencyLevel.charAt(0) +
                        proficiency.proficiencyLevel.slice(1).toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You haven't acquired any skills yet.
          </p>
          <Link
            href="/modules"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-150"
          >
            Start Learning
          </Link>
        </div>
      )}
    </div>
  );
}
