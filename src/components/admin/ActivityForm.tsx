'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Module {
  id: string;
  title: string;
  order: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface Activity {
  id?: string;
  title: string;
  description: string;
  type: 'LEARN_QUIZ' | 'PRACTICE_DRILL' | 'APPLY_CHALLENGE' | 'ASSESS_TEST';
  moduleId: string;
  order: number;
  xpReward: number;
  content: any;
  skills: string[];
}

interface ActivityFormProps {
  activity?: Activity;
  isEditing?: boolean;
  modules: Module[];
  skills: Skill[];
}

export default function ActivityForm({
  activity,
  isEditing = false,
  modules,
  skills,
}: ActivityFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Activity>({
    title: '',
    description: '',
    type: 'LEARN_QUIZ',
    moduleId: modules.length > 0 ? modules[0].id : '',
    order: 1,
    xpReward: 100,
    content: {},
    skills: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentJson, setContentJson] = useState('{}');
  const [contentError, setContentError] = useState<string | null>(null);

  // Group skills by category for easier selection
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  useEffect(() => {
    if (activity) {
      setFormData({
        ...activity,
        skills: activity.skills || [],
      });
      setContentJson(JSON.stringify(activity.content, null, 2));
    }
  }, [activity]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'order' || name === 'xpReward'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentJson(e.target.value);
    try {
      JSON.parse(e.target.value);
      setContentError(null);
    } catch (err) {
      setContentError('Invalid JSON format');
    }
  };

  const handleSkillChange = (skillId: string) => {
    setFormData((prev) => {
      const skills = [...prev.skills];
      const index = skills.indexOf(skillId);
      if (index === -1) {
        skills.push(skillId);
      } else {
        skills.splice(index, 1);
      }
      return { ...prev, skills };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contentError) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Parse content JSON
      const content = JSON.parse(contentJson);

      const dataToSubmit = {
        ...formData,
        content,
      };

      const url = isEditing
        ? `/api/admin/activities/${activity?.id}`
        : '/api/admin/activities';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save activity');
      }

      router.push('/admin/activities');
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate content template based on activity type
  const generateTemplate = () => {
    let template = {};

    switch (formData.type) {
      case 'LEARN_QUIZ':
        template = {
          questions: [
            {
              id: '1',
              text: 'Question text goes here',
              options: [
                { id: 'a', text: 'Option A' },
                { id: 'b', text: 'Option B' },
                { id: 'c', text: 'Option C' },
                { id: 'd', text: 'Option D' },
              ],
            },
          ],
          correctAnswers: {
            '1': 'a',
          },
        };
        break;
      case 'PRACTICE_DRILL':
        template = {
          instructions: '<p>Instructions for the practice drill go here.</p>',
          initialCode: '# Your code here\n\n',
          testCases: [
            {
              input: 'example input',
              expectedOutput: 'example output',
            },
          ],
        };
        break;
      case 'APPLY_CHALLENGE':
        template = {
          steps: [
            {
              id: '1',
              title: 'Step 1',
              instructions: '<p>Instructions for step 1 go here.</p>',
              initialCode: '# Your code here\n\n',
            },
            {
              id: '2',
              title: 'Step 2',
              instructions: '<p>Instructions for step 2 go here.</p>',
              initialCode: '# Your code here\n\n',
            },
          ],
          expectedOutputs: {
            '1': 'expected output for step 1',
            '2': 'expected output for step 2',
          },
        };
        break;
      case 'ASSESS_TEST':
        template = {
          instructions: '<p>Instructions for the assessment test go here.</p>',
          initialCode: '# Your code here\n\n',
          assessmentCriteria: [
            {
              name: 'Functionality',
              description: 'Code correctly implements the required functionality',
              weight: 0.5,
            },
            {
              name: 'Efficiency',
              description: 'Solution is efficient',
              weight: 0.3,
            },
            {
              name: 'Code Quality',
              description: 'Code is well-structured and follows best practices',
              weight: 0.2,
            },
          ],
        };
        break;
    }

    setContentJson(JSON.stringify(template, null, 2));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <div className="mt-1">
            <textarea
              name="description"
              id="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Activity Type
          </label>
          <div className="mt-1">
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="LEARN_QUIZ">Learn Quiz</option>
              <option value="PRACTICE_DRILL">Practice Drill</option>
              <option value="APPLY_CHALLENGE">Apply Challenge</option>
              <option value="ASSESS_TEST">Assess Test</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="moduleId"
            className="block text-sm font-medium text-gray-700"
          >
            Module
          </label>
          <div className="mt-1">
            <select
              id="moduleId"
              name="moduleId"
              required
              value={formData.moduleId}
              onChange={handleChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.order}: {module.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="order"
            className="block text-sm font-medium text-gray-700"
          >
            Order
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="order"
              id="order"
              min="1"
              required
              value={formData.order}
              onChange={handleChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="xpReward"
            className="block text-sm font-medium text-gray-700"
          >
            XP Reward
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="xpReward"
              id="xpReward"
              min="0"
              required
              value={formData.xpReward}
              onChange={handleChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700">
            Associated Skills
          </label>
          <div className="mt-2 space-y-4">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category} className="border rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {category}
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`skill-${skill.id}`}
                          name={`skill-${skill.id}`}
                          type="checkbox"
                          checked={formData.skills.includes(skill.id)}
                          onChange={() => handleSkillChange(skill.id)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor={`skill-${skill.id}`}
                          className="font-medium text-gray-700"
                        >
                          {skill.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:col-span-6">
          <div className="flex justify-between items-center">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content (JSON)
            </label>
            <button
              type="button"
              onClick={generateTemplate}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Generate Template
            </button>
          </div>
          <div className="mt-1">
            <textarea
              name="content"
              id="content"
              rows={12}
              required
              value={contentJson}
              onChange={handleContentChange}
              className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md font-mono ${
                contentError ? 'border-red-300' : ''
              }`}
            />
          </div>
          {contentError && (
            <p className="mt-2 text-sm text-red-600">{contentError}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Enter the activity content in JSON format. Use the "Generate Template" button to create a template based on the selected activity type.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !!contentError}
          className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            isSubmitting || contentError
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {isSubmitting
            ? 'Saving...'
            : isEditing
            ? 'Update Activity'
            : 'Create Activity'}
        </button>
      </div>
    </form>
  );
}
