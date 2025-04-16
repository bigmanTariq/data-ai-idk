import { bookStructure, Chapter, Section, Concept } from '@/lib/bookStructure';

export interface Module {
  id: string;
  title: string;
  description: string;
  level: number;
  order: number;
  skills: Skill[];
  activities: Activity[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'learn' | 'practice' | 'apply' | 'assess';
  skillIds: string[];
  content: ActivityContent;
  order: number;
}

export interface ActivityContent {
  instructions: string;
  initialCode?: string;
  solution?: string;
  testCases?: TestCase[];
  quizQuestions?: QuizQuestion[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

// Generate a module from a chapter
export function generateModuleFromChapter(chapter: Chapter, level: number): Module {
  const skills: Skill[] = [];
  const activities: Activity[] = [];
  let activityOrder = 1;

  // Create a skill for each concept in the chapter
  chapter.sections.forEach((section) => {
    section.concepts.forEach((concept) => {
      const skill: Skill = {
        id: `skill-${concept.id}`,
        name: concept.name,
        description: concept.description,
        category: section.title,
      };
      skills.push(skill);

      // Create learning activity for each concept
      const learnActivity: Activity = {
        id: `learn-${concept.id}`,
        title: `Learn: ${concept.name}`,
        description: `Learn about ${concept.name} through interactive content.`,
        type: 'learn',
        skillIds: [skill.id],
        content: {
          instructions: generateInstructions(concept, 'learn'),
          quizQuestions: generateQuizQuestions(concept),
        },
        order: activityOrder++,
      };
      activities.push(learnActivity);

      // Create practice activity for each concept
      const practiceActivity: Activity = {
        id: `practice-${concept.id}`,
        title: `Practice: ${concept.name}`,
        description: `Practice ${concept.name} with coding exercises.`,
        type: 'practice',
        skillIds: [skill.id],
        content: {
          instructions: generateInstructions(concept, 'practice'),
          initialCode: generateInitialCode(concept),
          solution: generateSolution(concept),
          testCases: generateTestCases(concept),
        },
        order: activityOrder++,
      };
      activities.push(practiceActivity);
    });
  });

  // Create apply activity for the section
  chapter.sections.forEach((section) => {
    const sectionSkillIds = section.concepts.map((concept) => `skill-${concept.id}`);

    const applyActivity: Activity = {
      id: `apply-${section.id}`,
      title: `Apply: ${section.title}`,
      description: `Apply your knowledge of ${section.title} in a mini-project.`,
      type: 'apply',
      skillIds: sectionSkillIds,
      content: {
        instructions: generateSectionInstructions(section, 'apply'),
        initialCode: generateSectionInitialCode(section),
        solution: generateSectionSolution(section),
      },
      order: activityOrder++,
    };
    activities.push(applyActivity);
  });

  // Create assessment activity for the chapter
  const chapterSkillIds = skills.map((skill) => skill.id);
  const assessActivity: Activity = {
    id: `assess-${chapter.id}`,
    title: `Assessment: ${chapter.title}`,
    description: `Demonstrate your mastery of ${chapter.title}.`,
    type: 'assess',
    skillIds: chapterSkillIds,
    content: {
      instructions: generateChapterInstructions(chapter),
      initialCode: generateChapterInitialCode(chapter),
      solution: generateChapterSolution(chapter),
      testCases: generateChapterTestCases(chapter),
    },
    order: activityOrder++,
  };
  activities.push(assessActivity);

  return {
    id: `module-${chapter.id}`,
    title: chapter.title,
    description: chapter.description,
    level,
    order: chapter.number,
    skills,
    activities,
  };
}

// Generate all modules from the book structure
export function generateAllModules(): Module[] {
  return bookStructure.map((chapter, index) =>
    generateModuleFromChapter(chapter, index + 1)
  );
}

// Helper functions to generate content
function generateInstructions(concept: Concept, type: 'learn' | 'practice'): string {
  if (type === 'learn') {
    // Generate more detailed learning content based on the concept
    let content = `# ${concept.name}\n\n## Overview\n${concept.description}\n\n`;

    // Add more specific content based on concept tags and name
    if (concept.name.includes('Definition')) {
      content += `## Key Points\n\n* Data analysis is the process of examining, cleaning, transforming, and interpreting data to discover valuable insights and support decision-making.\n* It involves both qualitative and quantitative techniques to identify patterns and trends.\n* Modern data analysis relies heavily on computational tools and statistical methods.\n\n## Importance\n\n* Helps businesses make informed decisions based on evidence rather than intuition\n* Enables scientific discoveries by finding patterns in experimental data\n* Supports policy-making by analyzing social and economic trends\n* Drives innovation by identifying gaps and opportunities in various fields\n\n`;
    } else if (concept.name.includes('Process')) {
      content += `## The Data Analysis Process\n\n1. **Data Collection**: Gathering relevant data from various sources\n2. **Data Cleaning**: Handling missing values, removing duplicates, and correcting errors\n3. **Data Exploration**: Understanding the structure and patterns in the data\n4. **Data Analysis**: Applying statistical methods and models to extract insights\n5. **Data Interpretation**: Drawing conclusions and making recommendations\n6. **Communication**: Presenting findings through reports, visualizations, and presentations\n\n## Best Practices\n\n* Always start with clear questions or objectives\n* Document your process and decisions\n* Validate your findings with different methods\n* Consider ethical implications of your analysis\n* Be transparent about limitations and assumptions\n\n`;
    } else if (concept.name.includes('Descriptive')) {
      content += `## Descriptive Analysis\n\n* Focuses on summarizing and describing the main features of a dataset\n* Uses measures like mean, median, mode, standard deviation, and percentiles\n* Creates visualizations such as histograms, box plots, and scatter plots\n* Answers questions like "What happened?" or "What is the current state?"\n\n## Common Techniques\n\n* Frequency distributions\n* Central tendency measures\n* Dispersion measures\n* Correlation analysis\n* Data visualization\n\n## Applications\n\n* Business reports and dashboards\n* Population studies\n* Quality control in manufacturing\n* Performance metrics in various fields\n\n`;
    } else if (concept.name.includes('Predictive')) {
      content += `## Predictive Analysis\n\n* Uses historical data to forecast future outcomes or trends\n* Employs statistical models and machine learning algorithms\n* Focuses on probability and likelihood of different scenarios\n* Answers questions like "What might happen next?"\n\n## Common Techniques\n\n* Regression analysis\n* Time series forecasting\n* Classification algorithms\n* Ensemble methods\n* Neural networks\n\n## Applications\n\n* Sales forecasting\n* Risk assessment\n* Demand prediction\n* Preventive maintenance\n* Customer behavior prediction\n\n`;
    } else if (concept.name.includes('Prescriptive')) {
      content += `## Prescriptive Analysis\n\n* Recommends actions to take based on predictive insights\n* Considers multiple possible scenarios and their outcomes\n* Often uses optimization techniques and decision theory\n* Answers questions like "What should we do?"\n\n## Common Techniques\n\n* Optimization algorithms\n* Simulation models\n* Decision trees\n* Linear and integer programming\n* Multi-criteria decision analysis\n\n## Applications\n\n* Resource allocation\n* Treatment selection in healthcare\n* Portfolio optimization in finance\n* Supply chain optimization\n* Marketing campaign optimization\n\n`;
    } else if (concept.name.includes('Python')) {
      content += `## Python for Data Analysis\n\n* Python has become the leading language for data analysis due to its simplicity and powerful libraries\n* Offers an extensive ecosystem of data-focused tools and packages\n* Supports the entire data analysis workflow from collection to visualization\n\n## Key Libraries\n\n* **Pandas**: Data manipulation and analysis\n* **NumPy**: Numerical computing and array operations\n* **Matplotlib** and **Seaborn**: Data visualization\n* **Scikit-learn**: Machine learning algorithms\n* **SciPy**: Scientific computing\n* **Statsmodels**: Statistical models and tests\n\n## Advantages\n\n* Open-source and free to use\n* Large and active community support\n* Extensive documentation and learning resources\n* Integration with other tools and systems\n* Scalable from small to big data applications\n\n`;
    } else {
      // Generic additional content for other concepts
      content += `## Key Concepts\n\n* Understanding the fundamental principles is essential for effective data analysis\n* Practical application requires both theoretical knowledge and technical skills\n* Continuous learning is important as methods and tools evolve rapidly\n\n## Applications in Data Science\n\n* Business intelligence and analytics\n* Scientific research and experimentation\n* Social and economic policy analysis\n* Healthcare and medical research\n* Environmental monitoring and modeling\n\n`;
    }

    content += `In this activity, you'll learn about ${concept.name} and its importance in data analysis. Read through the material above and answer the quiz questions to test your understanding.`;

    return content;
  } else {
    return `# Practice: ${concept.name}\n\n## Overview\n${concept.description}\n\n## Instructions\nIn this exercise, you'll practice using ${concept.name} in Python. Complete the code below to solve the given problem. Pay attention to the comments that guide you through the exercise.`;
  }
}

function generateQuizQuestions(concept: Concept): QuizQuestion[] {
  // Generate quiz questions based on the concept
  let questions: QuizQuestion[] = [];

  // Common question for all concepts
  questions.push({
    question: `What is the primary purpose of ${concept.name}?`,
    options: [
      `To analyze data and extract insights`,
      `To visualize data in charts and graphs`,
      `To clean and preprocess data`,
      `To store data efficiently`,
    ],
    correctOptionIndex: 0,
    explanation: `${concept.name} is primarily used to analyze data and extract meaningful insights.`,
  });

  // Add concept-specific questions
  if (concept.name.includes('Definition')) {
    questions = [
      {
        question: 'What is data analysis?',
        options: [
          'The process of inspecting, cleaning, transforming, and modeling data to discover useful information',
          'The process of collecting large amounts of data from various sources',
          'The process of creating visual representations of data',
          'The process of storing and retrieving data efficiently',
        ],
        correctOptionIndex: 0,
        explanation: 'Data analysis involves examining data to extract meaningful insights, identify patterns, and support decision-making.',
      },
      {
        question: 'Which of the following is NOT typically considered a part of data analysis?',
        options: [
          'Hardware maintenance and network configuration',
          'Data cleaning and preprocessing',
          'Statistical modeling and hypothesis testing',
          'Data visualization and interpretation',
        ],
        correctOptionIndex: 0,
        explanation: 'While technical infrastructure supports data analysis, hardware maintenance and network configuration are IT operations tasks rather than data analysis activities.',
      },
      {
        question: 'Why is data analysis important in modern business?',
        options: [
          'It enables evidence-based decision making',
          'It eliminates the need for human expertise',
          'It guarantees successful outcomes for all projects',
          'It reduces the need for specialized skills',
        ],
        correctOptionIndex: 0,
        explanation: 'Data analysis provides objective evidence to inform decisions, but it complements rather than replaces human expertise and doesn\'t guarantee success in all cases.',
      },
    ];
  } else if (concept.name.includes('Process')) {
    questions = [
      {
        question: 'What is typically the first step in the data analysis process?',
        options: [
          'Defining the question or problem',
          'Data visualization',
          'Statistical modeling',
          'Presenting results',
        ],
        correctOptionIndex: 0,
        explanation: 'A clear definition of the question or problem guides the entire analysis process and helps determine what data is needed.',
      },
      {
        question: 'Which of the following best describes the data cleaning step?',
        options: [
          'Identifying and correcting errors, handling missing values, and standardizing data formats',
          'Creating visual representations of the data',
          'Applying statistical models to make predictions',
          'Collecting data from various sources',
        ],
        correctOptionIndex: 0,
        explanation: 'Data cleaning ensures the quality and consistency of data before analysis by addressing issues like errors, missing values, and inconsistent formats.',
      },
      {
        question: 'What is the purpose of exploratory data analysis (EDA)?',
        options: [
          'To understand the structure, patterns, and relationships in the data',
          'To create final reports and presentations',
          'To implement the findings in production systems',
          'To collect additional data from new sources',
        ],
        correctOptionIndex: 0,
        explanation: 'EDA helps analysts understand what the data contains, identify patterns, and formulate hypotheses before applying more complex analytical methods.',
      },
    ];
  } else if (concept.name.includes('Descriptive')) {
    questions = [
      {
        question: 'What type of question does descriptive analysis answer?',
        options: [
          '"What happened?" or "What is the current state?"',
          '"Why did it happen?"',
          '"What will happen next?"',
          '"What should we do about it?"',
        ],
        correctOptionIndex: 0,
        explanation: 'Descriptive analysis summarizes historical or current data to describe what has happened or the current state of affairs.',
      },
      {
        question: 'Which of the following is NOT a measure used in descriptive statistics?',
        options: [
          'Regression coefficient',
          'Mean',
          'Median',
          'Standard deviation',
        ],
        correctOptionIndex: 0,
        explanation: 'Regression coefficients are used in predictive modeling rather than descriptive statistics, which typically uses measures like mean, median, and standard deviation.',
      },
      {
        question: 'Which visualization is most appropriate for showing the distribution of a continuous variable?',
        options: [
          'Histogram',
          'Pie chart',
          'Network diagram',
          'Treemap',
        ],
        correctOptionIndex: 0,
        explanation: 'Histograms show the distribution of continuous variables by dividing the range into bins and showing the frequency of values in each bin.',
      },
    ];
  } else if (concept.name.includes('Predictive')) {
    questions = [
      {
        question: 'What is the main goal of predictive analysis?',
        options: [
          'To forecast future outcomes based on historical data',
          'To describe what happened in the past',
          'To explain why something happened',
          'To recommend optimal actions',
        ],
        correctOptionIndex: 0,
        explanation: 'Predictive analysis uses historical data and statistical models to forecast future events, trends, or behaviors.',
      },
      {
        question: 'Which of the following is a common predictive modeling technique?',
        options: [
          'Linear regression',
          'Frequency distribution',
          'Pivot tables',
          'Box plots',
        ],
        correctOptionIndex: 0,
        explanation: 'Linear regression is a statistical method used to predict a continuous outcome variable based on one or more predictor variables.',
      },
      {
        question: 'In the context of predictive modeling, what is overfitting?',
        options: [
          'When a model performs well on training data but poorly on new data',
          'When a model is too simple to capture the underlying patterns',
          'When the dataset is too small for analysis',
          'When the prediction horizon is too far in the future',
        ],
        correctOptionIndex: 0,
        explanation: 'Overfitting occurs when a model learns the training data too well, including its noise and outliers, making it perform poorly on new, unseen data.',
      },
    ];
  } else if (concept.name.includes('Prescriptive')) {
    questions = [
      {
        question: 'What distinguishes prescriptive analytics from other types of analytics?',
        options: [
          'It recommends actions to take based on predicted outcomes',
          'It only describes what happened in the past',
          'It focuses solely on predicting future events',
          'It is concerned only with data collection',
        ],
        correctOptionIndex: 0,
        explanation: 'Prescriptive analytics goes beyond prediction to recommend specific actions that will lead to desired outcomes.',
      },
      {
        question: 'Which of the following is a common technique used in prescriptive analytics?',
        options: [
          'Linear programming',
          'Descriptive statistics',
          'Frequency analysis',
          'Data visualization',
        ],
        correctOptionIndex: 0,
        explanation: 'Linear programming is an optimization technique used to find the best outcome in a mathematical model with linear relationships.',
      },
      {
        question: 'In which field was prescriptive analytics first widely adopted?',
        options: [
          'Operations research and supply chain management',
          'Social media marketing',
          'Human resources',
          'Website design',
        ],
        correctOptionIndex: 0,
        explanation: 'Prescriptive analytics has its roots in operations research and was first widely adopted for optimizing supply chains, logistics, and resource allocation.',
      },
    ];
  } else if (concept.name.includes('Python')) {
    questions = [
      {
        question: 'Which Python library is primarily used for data manipulation and analysis?',
        options: [
          'Pandas',
          'Matplotlib',
          'Scikit-learn',
          'TensorFlow',
        ],
        correctOptionIndex: 0,
        explanation: 'Pandas provides data structures like DataFrames and Series, along with functions for manipulating, cleaning, and analyzing structured data.',
      },
      {
        question: 'What is the primary purpose of NumPy in data analysis?',
        options: [
          'Efficient numerical computations with arrays and matrices',
          'Creating interactive visualizations',
          'Building machine learning models',
          'Web scraping and data collection',
        ],
        correctOptionIndex: 0,
        explanation: 'NumPy provides support for large, multi-dimensional arrays and matrices, along with mathematical functions to operate on these elements efficiently.',
      },
      {
        question: 'Which of the following is NOT a key advantage of using Python for data analysis?',
        options: [
          'Superior performance compared to compiled languages like C++ for all computational tasks',
          'Rich ecosystem of specialized libraries',
          'Easy integration with other systems and data sources',
          'Strong community support and extensive documentation',
        ],
        correctOptionIndex: 0,
        explanation: 'While Python is versatile and widely used, it is generally slower than compiled languages like C++ for computationally intensive tasks, though this gap is often bridged by libraries with optimized C/C++ backends.',
      },
    ];
  } else {
    // Add a library-related question for other concepts
    questions.push({
      question: `Which Python library is commonly used for ${concept.name.toLowerCase()}?`,
      options: [
        `Pandas`,
        `NumPy`,
        `Matplotlib`,
        `Scikit-learn`,
      ],
      correctOptionIndex: getLibraryIndex(concept),
      explanation: `The correct library depends on the specific concept and its application in data analysis.`,
    });

    // Add a generic third question
    questions.push({
      question: `Which of the following best describes a challenge when working with ${concept.name.toLowerCase()}?`,
      options: [
        `Ensuring data quality and consistency`,
        `Limited computational resources`,
        `Lack of standardized approaches`,
        `Difficulty in interpreting results`,
      ],
      correctOptionIndex: 0,
      explanation: `Data quality and consistency are fundamental challenges in all aspects of data analysis, including ${concept.name}.`,
    });
  }

  return questions;
}

function getLibraryIndex(concept: Concept): number {
  const name = concept.name.toLowerCase();
  if (name.includes('dataframe') || name.includes('series') || name.includes('data manipulation')) {
    return 0; // Pandas
  } else if (name.includes('array') || name.includes('numerical') || name.includes('computation')) {
    return 1; // NumPy
  } else if (name.includes('visual') || name.includes('plot') || name.includes('chart')) {
    return 2; // Matplotlib
  } else if (name.includes('machine learning') || name.includes('model') || name.includes('predict')) {
    return 3; // Scikit-learn
  }
  return 0; // Default to Pandas
}

function generateInitialCode(concept: Concept): string {
  const name = concept.name.toLowerCase();

  if (name.includes('pandas') || name.includes('dataframe') || name.includes('series')) {
    return `import pandas as pd
import numpy as np

# Sample data
data = {'Name': ['John', 'Anna', 'Peter', 'Linda'],
        'Age': [28, 34, 29, 42],
        'City': ['New York', 'Boston', 'Chicago', 'Seattle'],
        'Salary': [65000, 78000, 59000, 92000]}

# Create a DataFrame
df = pd.DataFrame(data)

# TODO: Implement your solution here
# For example, if working with DataFrames, you might need to:
# 1. Filter the data
# 2. Calculate statistics
# 3. Transform the data

# Your code here:


# Display the result
print(df)
`;
  } else if (name.includes('numpy') || name.includes('array')) {
    return `import numpy as np

# Create sample arrays
array1 = np.array([1, 2, 3, 4, 5])
array2 = np.array([6, 7, 8, 9, 10])
matrix1 = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

# TODO: Implement your solution here
# For example, you might need to:
# 1. Perform array operations
# 2. Reshape arrays
# 3. Apply mathematical functions

# Your code here:


# Display the result
print("Result:")
`;
  } else if (name.includes('matplotlib') || name.includes('plot') || name.includes('visual')) {
    return `import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Sample data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# TODO: Create a visualization
# For example, you might need to:
# 1. Create a plot
# 2. Add labels and title
# 3. Customize the appearance

# Your code here:


# Show the plot
plt.show()
`;
  } else {
    return `# ${concept.name} Exercise

# Import necessary libraries
import pandas as pd
import numpy as np

# TODO: Implement your solution for ${concept.name}

# Your code here:


# Display your results
print("Results:")
`;
  }
}

function generateSolution(concept: Concept): string {
  const name = concept.name.toLowerCase();

  if (name.includes('pandas') || name.includes('dataframe') || name.includes('series')) {
    return `import pandas as pd
import numpy as np

# Sample data
data = {'Name': ['John', 'Anna', 'Peter', 'Linda'],
        'Age': [28, 34, 29, 42],
        'City': ['New York', 'Boston', 'Chicago', 'Seattle'],
        'Salary': [65000, 78000, 59000, 92000]}

# Create a DataFrame
df = pd.DataFrame(data)

# Solution
# 1. Filter for people older than 30
filtered_df = df[df['Age'] > 30]

# 2. Calculate average salary
avg_salary = df['Salary'].mean()

# 3. Add a new column for salary category
df['Salary_Category'] = df['Salary'].apply(lambda x: 'High' if x > 70000 else 'Medium' if x > 50000 else 'Low')

# Display the results
print("Filtered DataFrame (Age > 30):")
print(filtered_df)
print("\nAverage Salary:", avg_salary)
print("\nDataFrame with Salary Categories:")
print(df)
`;
  } else if (name.includes('numpy') || name.includes('array')) {
    return `import numpy as np

# Create sample arrays
array1 = np.array([1, 2, 3, 4, 5])
array2 = np.array([6, 7, 8, 9, 10])
matrix1 = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

# Solution
# 1. Array operations
sum_arrays = array1 + array2
product = array1 * array2
dot_product = np.dot(array1, array2)

# 2. Matrix operations
transposed = matrix1.T
matrix_sum = matrix1 + matrix1
matrix_product = np.matmul(matrix1, matrix1)

# 3. Statistical operations
mean_value = np.mean(matrix1)
max_value = np.max(matrix1)
min_value = np.min(matrix1)

# Display the results
print("Sum of arrays:", sum_arrays)
print("Product of arrays:", product)
print("Dot product:", dot_product)
print("\nTransposed matrix:\n", transposed)
print("\nMatrix sum:\n", matrix_sum)
print("\nMatrix product:\n", matrix_product)
print("\nStatistics - Mean:", mean_value, "Max:", max_value, "Min:", min_value)
`;
  } else if (name.includes('matplotlib') || name.includes('plot') || name.includes('visual')) {
    return `import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Sample data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Solution
# Create a figure and axis
fig, ax = plt.subplots(figsize=(10, 6))

# Plot the data
ax.plot(x, y, label='sin(x)', color='blue', linewidth=2)
ax.plot(x, np.cos(x), label='cos(x)', color='red', linestyle='--', linewidth=2)

# Add grid, legend, and labels
ax.grid(True, linestyle='--', alpha=0.7)
ax.legend(fontsize=12)
ax.set_xlabel('X-axis', fontsize=14)
ax.set_ylabel('Y-axis', fontsize=14)
ax.set_title('Sine and Cosine Functions', fontsize=16)

# Customize the appearance
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()

# Show the plot
plt.show()
`;
  } else {
    return `# ${concept.name} Solution

# Import necessary libraries
import pandas as pd
import numpy as np

# Sample solution for ${concept.name}
print("This is a sample solution for ${concept.name}")
print("In a real implementation, this would contain code specific to the concept.")

# Display results
print("Results: Success!")
`;
  }
}

function generateTestCases(concept: Concept): TestCase[] {
  return [
    {
      input: "Sample input for test case 1",
      expectedOutput: "Expected output for test case 1",
      description: `Test case 1 for ${concept.name}`,
    },
    {
      input: "Sample input for test case 2",
      expectedOutput: "Expected output for test case 2",
      description: `Test case 2 for ${concept.name}`,
    },
  ];
}

function generateSectionInstructions(section: Section, type: 'apply'): string {
  return `# Apply Your Knowledge: ${section.title}\n\n${section.description}\n\nIn this activity, you'll apply what you've learned about ${section.title} to solve a real-world data analysis problem. You'll need to combine multiple concepts and techniques to complete this mini-project.`;
}

function generateSectionInitialCode(section: Section): string {
  return `# ${section.title} - Mini Project

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load the dataset
# Typically, you would load a real dataset here
# For this exercise, we'll create a sample dataset
np.random.seed(42)
data = {
    'id': range(1, 101),
    'value_a': np.random.normal(0, 1, 100),
    'value_b': np.random.normal(5, 2, 100),
    'category': np.random.choice(['A', 'B', 'C'], 100)
}
df = pd.DataFrame(data)

# TODO: Implement your solution
# 1. Explore the dataset
# 2. Clean and preprocess the data if needed
# 3. Analyze the data
# 4. Visualize your findings

# Your code here:


# Display your results
`;
}

function generateSectionSolution(section: Section): string {
  return `# ${section.title} - Mini Project (Solution)

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load the dataset
np.random.seed(42)
data = {
    'id': range(1, 101),
    'value_a': np.random.normal(0, 1, 100),
    'value_b': np.random.normal(5, 2, 100),
    'category': np.random.choice(['A', 'B', 'C'], 100)
}
df = pd.DataFrame(data)

# Solution
# 1. Explore the dataset
print("Dataset shape:", df.shape)
print("\\nDataset info:")
print(df.info())
print("\\nDescriptive statistics:")
print(df.describe())

# 2. Clean and preprocess the data
# Check for missing values
print("\\nMissing values:")
print(df.isnull().sum())

# 3. Analyze the data
# Group by category and calculate statistics
grouped_stats = df.groupby('category').agg({
    'value_a': ['mean', 'std', 'min', 'max'],
    'value_b': ['mean', 'std', 'min', 'max']
})
print("\\nStatistics by category:")
print(grouped_stats)

# Calculate correlation
correlation = df[['value_a', 'value_b']].corr()
print("\\nCorrelation between value_a and value_b:")
print(correlation)

# 4. Visualize findings
# Create a figure with multiple subplots
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Histogram of value_a
axes[0, 0].hist(df['value_a'], bins=15, alpha=0.7)
axes[0, 0].set_title('Distribution of value_a')
axes[0, 0].set_xlabel('Value')
axes[0, 0].set_ylabel('Frequency')

# Histogram of value_b
axes[0, 1].hist(df['value_b'], bins=15, alpha=0.7, color='green')
axes[0, 1].set_title('Distribution of value_b')
axes[0, 1].set_xlabel('Value')
axes[0, 1].set_ylabel('Frequency')

# Scatter plot
axes[1, 0].scatter(df['value_a'], df['value_b'], alpha=0.7, c=df['category'].astype('category').cat.codes)
axes[1, 0].set_title('Scatter plot: value_a vs value_b')
axes[1, 0].set_xlabel('value_a')
axes[1, 0].set_ylabel('value_b')

# Box plot by category
df.boxplot(column=['value_a', 'value_b'], by='category', ax=axes[1, 1])
axes[1, 1].set_title('Box plot by category')

plt.tight_layout()
plt.show()

# Summary of findings
print("\\nSummary of findings:")
print("1. The distributions of value_a and value_b follow normal distributions.")
print("2. There appears to be a weak correlation between value_a and value_b.")
print("3. The categories show some differences in their value distributions.")
`;
}

function generateChapterInstructions(chapter: Chapter): string {
  return `# Chapter Assessment: ${chapter.title}\n\n${chapter.description}\n\nThis assessment will test your understanding of all the concepts covered in this chapter. You'll need to apply what you've learned to solve a comprehensive data analysis problem.`;
}

function generateChapterInitialCode(chapter: Chapter): string {
  return `# ${chapter.title} - Comprehensive Assessment

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Load the dataset
# For this assessment, we'll create a synthetic dataset
np.random.seed(42)
n_samples = 200

# Create features
X = np.random.rand(n_samples, 3) * 10  # 3 features
noise = np.random.randn(n_samples) * 2

# Create target variable with some relationship to features
y = 5 + 2 * X[:, 0] - 1 * X[:, 1] + 0.5 * X[:, 2] + noise

# Create a DataFrame
feature_names = ['feature_1', 'feature_2', 'feature_3']
df = pd.DataFrame(X, columns=feature_names)
df['target'] = y
df['category'] = pd.cut(df['target'], bins=3, labels=['Low', 'Medium', 'High'])

# TODO: Complete the assessment tasks
# 1. Explore and visualize the dataset
# 2. Preprocess the data
# 3. Build a regression model
# 4. Evaluate the model
# 5. Visualize the results

# Your code here:


# Display your results
`;
}

function generateChapterSolution(chapter: Chapter): string {
  return `# ${chapter.title} - Comprehensive Assessment (Solution)

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Set style for plots
sns.set(style="whitegrid")

# Load the dataset
np.random.seed(42)
n_samples = 200

# Create features
X = np.random.rand(n_samples, 3) * 10  # 3 features
noise = np.random.randn(n_samples) * 2

# Create target variable with some relationship to features
y = 5 + 2 * X[:, 0] - 1 * X[:, 1] + 0.5 * X[:, 2] + noise

# Create a DataFrame
feature_names = ['feature_1', 'feature_2', 'feature_3']
df = pd.DataFrame(X, columns=feature_names)
df['target'] = y
df['category'] = pd.cut(df['target'], bins=3, labels=['Low', 'Medium', 'High'])

# Solution

# 1. Explore and visualize the dataset
print("Dataset shape:", df.shape)
print("\\nFirst 5 rows:")
print(df.head())
print("\\nDataset info:")
print(df.info())
print("\\nDescriptive statistics:")
print(df.describe())

# Check for missing values
print("\\nMissing values:")
print(df.isnull().sum())

# Visualize distributions
plt.figure(figsize=(15, 10))

# Histograms for each feature
for i, feature in enumerate(feature_names + ['target']):
    plt.subplot(2, 2, i+1)
    sns.histplot(df[feature], kde=True)
    plt.title(f'Distribution of {feature}')
    plt.xlabel(feature)
    plt.ylabel('Frequency')

plt.tight_layout()
plt.show()

# Correlation matrix
plt.figure(figsize=(10, 8))
correlation_matrix = df[feature_names + ['target']].corr()
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', linewidths=0.5)
plt.title('Correlation Matrix')
plt.show()

# Pairplot
sns.pairplot(df[feature_names + ['target']], height=2.5)
plt.suptitle('Pairwise Relationships', y=1.02)
plt.show()

# 2. Preprocess the data
# Split the data into features and target
X = df[feature_names]
y = df['target']

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print("Training set shape:", X_train.shape)
print("Testing set shape:", X_test.shape)

# 3. Build a regression model
model = LinearRegression()
model.fit(X_train, y_train)

# Print model coefficients
print("\\nModel Coefficients:")
for feature, coef in zip(feature_names, model.coef_):
    print(f"{feature}: {coef:.4f}")
print(f"Intercept: {model.intercept_:.4f}")

# 4. Evaluate the model
y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

# Calculate metrics
train_mse = mean_squared_error(y_train, y_train_pred)
test_mse = mean_squared_error(y_test, y_test_pred)
train_r2 = r2_score(y_train, y_train_pred)
test_r2 = r2_score(y_test, y_test_pred)

print("\\nModel Evaluation:")
print(f"Training MSE: {train_mse:.4f}")
print(f"Testing MSE: {test_mse:.4f}")
print(f"Training R²: {train_r2:.4f}")
print(f"Testing R²: {test_r2:.4f}")

# 5. Visualize the results
plt.figure(figsize=(12, 6))

# Actual vs Predicted plot
plt.subplot(1, 2, 1)
plt.scatter(y_test, y_test_pred, alpha=0.7)
plt.plot([y.min(), y.max()], [y.min(), y.max()], 'k--', lw=2)
plt.xlabel('Actual')
plt.ylabel('Predicted')
plt.title('Actual vs Predicted Values')

# Residuals plot
plt.subplot(1, 2, 2)
residuals = y_test - y_test_pred
sns.histplot(residuals, kde=True)
plt.xlabel('Residuals')
plt.ylabel('Frequency')
plt.title('Residuals Distribution')

plt.tight_layout()
plt.show()

# Feature importance visualization
plt.figure(figsize=(10, 6))
importance = np.abs(model.coef_)
plt.bar(feature_names, importance)
plt.xlabel('Features')
plt.ylabel('Absolute Coefficient Value')
plt.title('Feature Importance')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# Summary of findings
print("\\nSummary of findings:")
print("1. The model successfully captured the relationships between features and target.")
print(f"2. Feature 1 has a positive coefficient ({model.coef_[0]:.4f}), matching the true coefficient (2.0).")
print(f"3. Feature 2 has a negative coefficient ({model.coef_[1]:.4f}), matching the true coefficient (-1.0).")
print(f"4. Feature 3 has a positive coefficient ({model.coef_[2]:.4f}), matching the true coefficient (0.5).")
print(f"5. The model explains approximately {test_r2:.2%} of the variance in the test data.")
`;
}

function generateChapterTestCases(chapter: Chapter): TestCase[] {
  return [
    {
      input: "Sample input for chapter test case 1",
      expectedOutput: "Expected output for chapter test case 1",
      description: `Test case 1 for ${chapter.title}`,
    },
    {
      input: "Sample input for chapter test case 2",
      expectedOutput: "Expected output for chapter test case 2",
      description: `Test case 2 for ${chapter.title}`,
    },
  ];
}

// Get a specific module by ID
export function getModuleById(moduleId: string): Module | null {
  const modules = generateAllModules();
  return modules.find(module => module.id === moduleId) || null;
}

// Get a specific activity by ID
export function getActivityById(activityId: string): Activity | null {
  const modules = generateAllModules();
  for (const module of modules) {
    const activity = module.activities.find(activity => activity.id === activityId);
    if (activity) {
      return activity;
    }
  }
  return null;
}

// Get all skills
export function getAllSkills(): Skill[] {
  const modules = generateAllModules();
  const skills: Skill[] = [];

  modules.forEach(module => {
    module.skills.forEach(skill => {
      if (!skills.some(s => s.id === skill.id)) {
        skills.push(skill);
      }
    });
  });

  return skills;
}

// Get a specific skill by ID
export function getSkillById(skillId: string): Skill | null {
  const skills = getAllSkills();
  return skills.find(skill => skill.id === skillId) || null;
}
