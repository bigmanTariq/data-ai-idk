'use client';

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserSkillProficiency {
  id: string;
  skillId: string;
  proficiencyLevel: 'NOVICE' | 'APPRENTICE' | 'JOURNEYMAN' | 'MASTER';
  skill: Skill;
}

interface SkillMatrixVisualizerProps {
  skillProficiencies: UserSkillProficiency[];
}

// Map proficiency levels to numeric values
const proficiencyValues = {
  NOVICE: 1,
  APPRENTICE: 2,
  JOURNEYMAN: 3,
  MASTER: 4,
};

// Group skills by category
const groupSkillsByCategory = (
  skillProficiencies: UserSkillProficiency[]
): Record<string, UserSkillProficiency[]> => {
  return skillProficiencies.reduce(
    (acc, proficiency) => {
      const category = proficiency.skill.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(proficiency);
      return acc;
    },
    {} as Record<string, UserSkillProficiency[]>
  );
};

export default function SkillMatrixVisualizer({
  skillProficiencies,
}: SkillMatrixVisualizerProps) {
  // If no skills, show a message
  if (!skillProficiencies || skillProficiencies.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Matrix</h3>
        <p className="text-gray-500">
          No skills acquired yet. Complete activities to build your skill matrix.
        </p>
      </div>
    );
  }

  // Group skills by category
  const skillsByCategory = groupSkillsByCategory(skillProficiencies);

  // Create radar charts for each category
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Matrix</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div key={category} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-800 mb-2">
              {category}
            </h4>
            <div className="h-64">
              <Radar
                data={{
                  labels: skills.map((s) => s.skill.name),
                  datasets: [
                    {
                      label: 'Proficiency',
                      data: skills.map(
                        (s) => proficiencyValues[s.proficiencyLevel]
                      ),
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      borderColor: 'rgba(99, 102, 241, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  scales: {
                    r: {
                      angleLines: {
                        display: true,
                      },
                      suggestedMin: 0,
                      suggestedMax: 4,
                      ticks: {
                        stepSize: 1,
                        callback: function (value) {
                          const labels = ['', 'Novice', 'Apprentice', 'Journeyman', 'Master'];
                          return labels[value as number];
                        },
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-800 mb-2">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
            <span className="text-sm text-gray-600">Novice</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-300 mr-2"></div>
            <span className="text-sm text-gray-600">Apprentice</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-400 mr-2"></div>
            <span className="text-sm text-gray-600">Journeyman</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
            <span className="text-sm text-gray-600">Master</span>
          </div>
        </div>
      </div>
    </div>
  );
}
