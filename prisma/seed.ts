import { PrismaClient, ActivityType, ProficiencyLevel } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a demo user
  const hashedPassword = await hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  console.log('Created demo user:', user.email);

  // Create an admin user
  const adminHashedPassword = await hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      isAdmin: true,
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminHashedPassword,
      isAdmin: true,
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create user profiles
  // For demo user
  const userProfile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      level: 1,
      xp: 0,
    },
  });

  console.log('Created user profile for:', user.email);

  // For admin user
  const adminUserProfile = await prisma.userProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      level: 10, // Admin starts at a higher level
      xp: 1000,
    },
  });

  console.log('Created user profile for admin:', adminUser.email);

  // Create skills
  const skills = [
    // Pandas skills
    {
      name: 'pandas-io',
      description: 'Reading and writing data with pandas',
      category: 'Pandas',
    },
    {
      name: 'pandas-filtering',
      description: 'Filtering and selecting data in pandas',
      category: 'Pandas',
    },
    {
      name: 'pandas-transformation',
      description: 'Transforming and cleaning data with pandas',
      category: 'Pandas',
    },
    {
      name: 'pandas-groupby',
      description: 'Grouping and aggregating data with pandas',
      category: 'Pandas',
    },
    // NumPy skills
    {
      name: 'numpy-arrays',
      description: 'Creating and manipulating NumPy arrays',
      category: 'NumPy',
    },
    {
      name: 'numpy-math',
      description: 'Mathematical operations with NumPy',
      category: 'NumPy',
    },
    // Matplotlib skills
    {
      name: 'matplotlib-basic',
      description: 'Creating basic plots with Matplotlib',
      category: 'Visualization',
    },
    {
      name: 'matplotlib-advanced',
      description: 'Advanced plotting techniques with Matplotlib',
      category: 'Visualization',
    },
    // Scikit-learn skills
    {
      name: 'sklearn-preprocessing',
      description: 'Data preprocessing with scikit-learn',
      category: 'Machine Learning',
    },
    {
      name: 'sklearn-models',
      description: 'Building and training ML models with scikit-learn',
      category: 'Machine Learning',
    },
    {
      name: 'sklearn-evaluation',
      description: 'Evaluating ML models with scikit-learn',
      category: 'Machine Learning',
    },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }

  console.log(`Created ${skills.length} skills`);

  // Create modules
  const modules = [
    {
      title: 'Introduction to Data Analysis with Python',
      description:
        'Learn the fundamentals of data analysis with Python, including basic data structures and libraries.',
      order: 1,
    },
    {
      title: 'Data Manipulation with Pandas',
      description:
        'Master data manipulation techniques using the pandas library.',
      order: 2,
    },
    {
      title: 'Data Visualization',
      description:
        'Create insightful visualizations using Matplotlib and other libraries.',
      order: 3,
    },
    {
      title: 'Introduction to Machine Learning',
      description:
        'Learn the basics of machine learning with scikit-learn.',
      order: 4,
    },
  ];

  const createdModules = [];
  for (const module of modules) {
    const createdModule = await prisma.module.upsert({
      where: { order: module.order },
      update: {},
      create: module,
    });
    createdModules.push(createdModule);
  }

  console.log(`Created ${modules.length} modules`);

  // Create activities for Module 1
  const module1Activities = [
    // Learn activities
    {
      title: 'Python Data Structures Quiz',
      description: 'Test your knowledge of Python data structures.',
      type: ActivityType.LEARN_QUIZ,
      content: {
        questions: [
          {
            id: '1',
            text: 'Which of the following is a mutable data structure in Python?',
            options: [
              { id: 'a', text: 'Tuple' },
              { id: 'b', text: 'String' },
              { id: 'c', text: 'List' },
              { id: 'd', text: 'Frozen Set' },
            ],
          },
          {
            id: '2',
            text: 'What is the primary difference between a list and a tuple in Python?',
            options: [
              { id: 'a', text: 'Lists can contain multiple data types, tuples cannot' },
              { id: 'b', text: 'Tuples are immutable, lists are mutable' },
              { id: 'c', text: 'Lists are ordered, tuples are unordered' },
              { id: 'd', text: 'Tuples can be nested, lists cannot' },
            ],
          },
        ],
        correctAnswers: {
          '1': 'c',
          '2': 'b',
        },
      },
      moduleId: createdModules[0].id,
      order: 1,
      xpReward: 50,
      skills: ['numpy-arrays'],
    },
    // Practice activities
    {
      title: 'Creating NumPy Arrays',
      description: 'Practice creating and manipulating NumPy arrays.',
      type: ActivityType.PRACTICE_DRILL,
      content: {
        instructions: `
          <p>In this exercise, you'll practice creating NumPy arrays.</p>
          <p>Complete the function <code>create_array</code> that:</p>
          <ol>
            <li>Creates a 1D NumPy array from the input list</li>
            <li>Reshapes it into a 2D array with 2 rows</li>
            <li>Returns the reshaped array</li>
          </ol>
        `,
        initialCode: `
import numpy as np

def create_array(input_list):
    # Create a 1D NumPy array from the input list
    # YOUR CODE HERE

    # Reshape it into a 2D array with 2 rows
    # YOUR CODE HERE

    # Return the reshaped array
    # YOUR CODE HERE

# Example usage (don't modify this)
test_array = create_array([1, 2, 3, 4, 5, 6])
print(test_array)
`,
      },
      moduleId: createdModules[0].id,
      order: 2,
      xpReward: 100,
      skills: ['numpy-arrays'],
    },
    // Apply activities
    {
      title: 'Data Analysis with NumPy',
      description: 'Apply NumPy to analyze a dataset.',
      type: ActivityType.APPLY_CHALLENGE,
      content: {
        steps: [
          {
            id: '1',
            title: 'Load and Explore Data',
            instructions: `
              <p>In this step, you'll load a dataset using NumPy and explore its basic properties.</p>
              <p>Complete the code to:</p>
              <ol>
                <li>Load the data from the URL using <code>np.loadtxt</code></li>
                <li>Print the shape of the data</li>
                <li>Print the first 5 rows of the data</li>
              </ol>
            `,
            initialCode: `
import numpy as np

# URL to the data
url = 'https://raw.githubusercontent.com/numpy/numpy/main/doc/example_data/iris.csv'

# Load the data using np.loadtxt
# YOUR CODE HERE

# Print the shape of the data
# YOUR CODE HERE

# Print the first 5 rows
# YOUR CODE HERE
`,
          },
          {
            id: '2',
            title: 'Analyze the Data',
            instructions: `
              <p>Now that you've loaded the data, let's analyze it.</p>
              <p>Complete the code to:</p>
              <ol>
                <li>Calculate the mean of each column</li>
                <li>Calculate the standard deviation of each column</li>
                <li>Find the minimum and maximum values in the dataset</li>
              </ol>
            `,
            initialCode: `
import numpy as np

# Assuming data is already loaded
data = np.loadtxt('https://raw.githubusercontent.com/numpy/numpy/main/doc/example_data/iris.csv', delimiter=',', skiprows=1)

# Calculate the mean of each column
# YOUR CODE HERE

# Calculate the standard deviation of each column
# YOUR CODE HERE

# Find the minimum and maximum values in the dataset
# YOUR CODE HERE
`,
          },
        ],
      },
      moduleId: createdModules[0].id,
      order: 3,
      xpReward: 200,
      skills: ['numpy-arrays', 'numpy-math'],
    },
    // Assess activities
    {
      title: 'NumPy Fundamentals Assessment',
      description: 'Demonstrate your mastery of NumPy fundamentals.',
      type: ActivityType.ASSESS_TEST,
      content: {
        instructions: `
          <p>In this assessment, you'll demonstrate your mastery of NumPy fundamentals.</p>
          <p>Complete the following tasks:</p>
          <ol>
            <li>Create a 3x3 identity matrix</li>
            <li>Create a 1D array of 10 evenly spaced values between 0 and 1</li>
            <li>Create a 5x5 array of random integers between 1 and 100</li>
            <li>Calculate the mean, median, and standard deviation of the random array</li>
          </ol>
        `,
        initialCode: `
import numpy as np

# Create a 3x3 identity matrix
# YOUR CODE HERE

# Create a 1D array of 10 evenly spaced values between 0 and 1
# YOUR CODE HERE

# Create a 5x5 array of random integers between 1 and 100
# YOUR CODE HERE

# Calculate the mean, median, and standard deviation of the random array
# YOUR CODE HERE
`,
      },
      moduleId: createdModules[0].id,
      order: 4,
      xpReward: 300,
      skills: ['numpy-arrays', 'numpy-math'],
    },
  ];

  for (const activity of module1Activities) {
    const { skills: activitySkills, ...activityData } = activity;

    const createdActivity = await prisma.activity.upsert({
      where: {
        moduleId_order: {
          moduleId: activityData.moduleId,
          order: activityData.order,
        },
      },
      update: {},
      create: activityData,
    });

    // Link activity to skills
    for (const skillName of activitySkills) {
      const skill = await prisma.skill.findUnique({
        where: { name: skillName },
      });

      if (skill) {
        await prisma.activitySkill.upsert({
          where: {
            activityId_skillId: {
              activityId: createdActivity.id,
              skillId: skill.id,
            },
          },
          update: {},
          create: {
            activityId: createdActivity.id,
            skillId: skill.id,
          },
        });
      }
    }
  }

  console.log(`Created activities for Module 1`);

  // Set user's current module
  await prisma.userProfile.update({
    where: { userId: user.id },
    data: {
      currentModuleId: createdModules[0].id,
    },
  });

  // Add some skill proficiencies for the user
  const skillProficiencies = [
    {
      skillName: 'numpy-arrays',
      proficiencyLevel: ProficiencyLevel.APPRENTICE,
    },
    {
      skillName: 'numpy-math',
      proficiencyLevel: ProficiencyLevel.NOVICE,
    },
  ];

  for (const { skillName, proficiencyLevel } of skillProficiencies) {
    const skill = await prisma.skill.findUnique({
      where: { name: skillName },
    });

    if (skill) {
      await prisma.userSkillProficiency.upsert({
        where: {
          userId_skillId: {
            userId: userProfile.id,
            skillId: skill.id,
          },
        },
        update: {
          proficiencyLevel,
        },
        create: {
          userId: userProfile.id,
          skillId: skill.id,
          proficiencyLevel,
        },
      });
    }
  }

  console.log('Added skill proficiencies for user');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
