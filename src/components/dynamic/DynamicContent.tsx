'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Concept } from '@/lib/bookStructure';
import { ContentType } from '@/lib/dynamicContent';
import DynamicContentDisplay from './DynamicContentDisplay';
import AddGeminiApiKeyButton from '@/components/gemini/AddGeminiApiKeyButton';

// Fallback content when API is unavailable or key is invalid
function getFallbackContent(conceptName: string, contentType: ContentType): string {
  switch (contentType) {
    case 'explanation':
      return `# ${conceptName}

Data Analysis is the process of inspecting, cleaning, transforming, and modeling data to discover useful information, draw conclusions, and support decision-making.

It involves applying statistical methods and computational techniques to extract meaningful patterns and insights from raw data. The goal is to uncover trends, relationships, and anomalies that can inform business strategies, scientific research, or other applications.`;

    case 'example':
      return `# Example Code for ${conceptName}

\`\`\`python
# Basic data analysis example
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load sample data (you can replace this with your own dataset)
data = pd.read_csv('sample_data.csv')

# Display basic information about the dataset
print("Dataset shape:", data.shape)
print("\nFirst 5 rows:")
print(data.head())

# Check for missing values
print("\nMissing values:")
print(data.isnull().sum())

# Generate descriptive statistics
print("\nDescriptive statistics:")
print(data.describe())

# Visualize the distribution of a numerical column
plt.figure(figsize=(10, 6))
data['numeric_column'].hist(bins=20)
plt.title('Distribution of Values')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.show()
\`\`\``;

    case 'practice':
      return `# Practice Exercise for ${conceptName}

## Exercise: Basic Data Analysis

1. Download the 'Iris' dataset or use any dataset of your choice.
2. Load the dataset using pandas.
3. Perform the following tasks:
   - Display the first 10 rows of the dataset
   - Check for missing values and handle them appropriately
   - Calculate basic statistics (mean, median, standard deviation) for each numerical column
   - Create at least one visualization (histogram, scatter plot, or box plot)
   - Identify any patterns or insights from your analysis

## Starter Code

\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt

# Load the dataset
# Your code here

# Display the first 10 rows
# Your code here

# Check for missing values
# Your code here

# Calculate statistics
# Your code here

# Create visualization
# Your code here
\`\`\``;

    case 'simplify':
      return `# ${conceptName} Simplified

Okay, imagine you're a detective solving a mystery. "Data Analysis" is like your detective work with numbers and information instead of clues.

**Here's the definition in the context of learning Python for Data Analysis:**

**Data Analysis is the process of inspecting, cleaning, transforming, and modeling data with the goal of discovering useful information, drawing conclusions, and supporting decision-making.**

**Key takeaways for a beginner:**

* **Inspecting:** Looking at the raw data to understand what you have.
* **Cleaning:** Fixing errors, filling in missing pieces, and making the data consistent.
* **Transforming:** Changing the data into a format that's easier to work with (e.g., converting units, creating new columns).
* **Modeling:** Using tools (like Python) to find patterns, relationships, and trends in the data.
* **Goal:** The whole point is to get *useful* insights. You want to answer questions, make predictions, or help someone make a better choice based on what the data tells you.

In short, you're taking raw data and turning it into something meaningful and actionable. Python helps you do all the hard work efficiently.`;

    case 'elaborate':
      return `# Detailed Explanation of ${conceptName}

## What is Data Analysis?

Data analysis is the systematic process of applying statistical and logical techniques to describe, illustrate, condense, recap, and evaluate data. It's a multifaceted approach that combines various methodologies to extract meaningful insights from raw information.

## The Data Analysis Process

1. **Data Requirements Specification**: Defining the questions that need answers and determining what data is needed.

2. **Data Collection**: Gathering data from various sources, which may include surveys, experiments, observations, or existing databases.

3. **Data Processing**: Cleaning and organizing the raw data to make it suitable for analysis.
   - Handling missing values
   - Removing duplicates
   - Correcting errors
   - Standardizing formats

4. **Data Cleaning**: Ensuring data quality by addressing inconsistencies and inaccuracies.

5. **Exploratory Data Analysis (EDA)**: Preliminary investigations to discover patterns, spot anomalies, test hypotheses, and check assumptions.
   - Descriptive statistics (mean, median, mode, standard deviation)
   - Data visualization (histograms, scatter plots, box plots)

6. **Data Modeling**: Applying statistical models and algorithms to identify relationships and patterns.
   - Regression analysis
   - Classification
   - Clustering
   - Time series analysis

7. **Interpretation**: Drawing conclusions from the analysis and relating them back to the original questions.

8. **Communication**: Presenting findings in a clear, concise manner through reports, dashboards, or visualizations.

## Key Statistical Concepts in Data Analysis

- **Measures of Central Tendency**: Mean, median, and mode
- **Measures of Dispersion**: Range, variance, standard deviation
- **Correlation and Covariance**: Measuring relationships between variables
- **Hypothesis Testing**: Evaluating statistical hypotheses
- **Confidence Intervals**: Estimating parameters with a degree of confidence

## Tools and Technologies

- **Programming Languages**: Python, R
- **Libraries**: Pandas, NumPy, SciPy, Scikit-learn
- **Visualization Tools**: Matplotlib, Seaborn, Plotly
- **Business Intelligence Tools**: Tableau, Power BI
- **Big Data Technologies**: Hadoop, Spark

Data analysis is essential across numerous fields, including business, science, social science, healthcare, and government, enabling data-driven decision-making and discovery of valuable insights.

In real-world applications, ${conceptName} is often the first step in any data analysis project, providing a foundation for more advanced analyses.`;

    case 'question':
      return `# Answer to Your Question About ${conceptName}

Thank you for your question about data analysis. While I can't generate a personalized response without a valid API key, here are some common questions and answers about data analysis:

## Common Questions About Data Analysis

### What's the difference between data analysis and data science?

Data analysis focuses on processing historical data to uncover insights and answer specific questions. Data science is broader, encompassing data analysis but also including machine learning, algorithm development, and predictive modeling to make future predictions.

### What programming languages are best for data analysis?

Python and R are the most popular languages for data analysis. Python offers libraries like Pandas, NumPy, and Matplotlib, while R was specifically designed for statistical analysis and has packages like dplyr and ggplot2.

### What's the difference between descriptive and inferential statistics?

Descriptive statistics summarize and describe the main features of a dataset (mean, median, standard deviation). Inferential statistics use sample data to make predictions or inferences about a larger population.

### How do I handle missing data?

Common approaches include:
- Removing rows with missing values
- Imputing missing values (using mean, median, or predicted values)
- Using algorithms that can handle missing values
- Analyzing the pattern of missingness to understand if it's random or systematic

### What visualization tools are best for data analysis?

Popular visualization tools include:
- Matplotlib and Seaborn (Python libraries)
- ggplot2 (R package)
- Tableau (commercial software)
- Power BI (Microsoft's business analytics tool)
- D3.js (JavaScript library for web-based visualizations)

For more specific questions about data analysis, please add a valid Gemini API key to get personalized responses.`;

    default:
      return '';
  }
}

interface DynamicContentProps {
  concept: Concept;
  initialContentType?: ContentType;
}

export default function DynamicContent({
  concept,
  initialContentType = 'explanation',
}: DynamicContentProps) {
  const { data: session } = useSession();
  const [contentType, setContentType] = useState<ContentType>(initialContentType);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);
  const [userQuestion, setUserQuestion] = useState('');

  // Check if the user has a Gemini API key
  React.useEffect(() => {
    const checkGeminiKey = async () => {
      if (!session) {
        return;
      }

      try {
        const response = await fetch('/api/user/apikey?service=gemini');
        const data = await response.json();

        if (response.ok) {
          setHasGeminiKey(data.hasKey);

          // If the user has a key, automatically generate the initial content
          if (data.hasKey) {
            generateContent(initialContentType);
          }
        }
      } catch (error) {
        console.error('Error checking Gemini API key:', error);
      }
    };

    checkGeminiKey();
  }, [session, initialContentType]);

  const generateContent = async (type: ContentType) => {
    if (!session) {
      setError('You must be logged in to use this feature');
      return;
    }

    setLoading(true);
    setError(null);
    setContentType(type);

    try {
      const response = await fetch('/api/dynamic-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conceptName: concept.name,
          contentType: type,
          context: concept.tags.join(', '),
          userQuestion: type === 'question' ? userQuestion : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      setContent(data.content);
    } catch (err: any) {
      console.error('Error generating content:', err);
      setError(err.message || 'An error occurred while generating content');

      // Always provide fallback content when there's an error
      const fallbackContent = getFallbackContent(concept.name, contentType);
      if (fallbackContent) {
        setContent(fallbackContent);
        setError('Using fallback content for development. ' + err.message);
      }

      // If the error is related to the API key, update the hasGeminiKey state
      if (err.message?.includes('API key')) {
        setHasGeminiKey(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userQuestion.trim()) {
      generateContent('question');
    }
  };

  if (!session) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-700 dark:text-gray-300">
          Please <Link href="/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">sign in</Link> to access dynamic content.
        </p>
      </div>
    );
  }

  if (hasGeminiKey === false) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Dynamic Content Generation
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          To access dynamic content for <span className="font-medium">{concept.name}</span>, you need to add your Gemini API key.
        </p>
        <div className="flex space-x-4">
          <AddGeminiApiKeyButton
            onApiKeyAdded={() => setHasGeminiKey(true)}
          />
          <Link
            href="/settings"
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Learn more
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {concept.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {concept.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {concept.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => generateContent('explanation')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            contentType === 'explanation'
              ? 'bg-indigo-600 text-white dark:bg-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Explanation
        </button>
        <button
          onClick={() => generateContent('example')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            contentType === 'example'
              ? 'bg-indigo-600 text-white dark:bg-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Code Example
        </button>
        <button
          onClick={() => generateContent('practice')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            contentType === 'practice'
              ? 'bg-indigo-600 text-white dark:bg-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Practice Idea
        </button>
        <button
          onClick={() => generateContent('simplify')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            contentType === 'simplify'
              ? 'bg-indigo-600 text-white dark:bg-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Simplify
        </button>
        <button
          onClick={() => generateContent('elaborate')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            contentType === 'elaborate'
              ? 'bg-indigo-600 text-white dark:bg-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Elaborate
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : content ? (
        <DynamicContentDisplay content={content} contentType={contentType} />
      ) : hasGeminiKey && !loading && !error ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Select a content type above to generate content for this concept.
          </p>
        </div>
      ) : null}

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Ask a Question
        </h4>
        <form onSubmit={handleQuestionSubmit} className="flex gap-2">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder={`Ask about ${concept.name}...`}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!userQuestion.trim() || loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
