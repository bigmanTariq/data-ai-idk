// Structure based on "Data Analysis from Scratch with Python" book
// This serves as the source of truth for the learning path

export interface Concept {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  concepts: Concept[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  sections: Section[];
}

// The book's table of contents structure
export const bookStructure: Chapter[] = [
  {
    id: 'chapter-1',
    number: 1,
    title: 'Introduction to Data Analysis',
    description: 'An overview of data analysis and its importance in various fields.',
    sections: [
      {
        id: 'section-1-1',
        title: 'What is Data Analysis?',
        description: 'Understanding the fundamentals of data analysis and its applications.',
        concepts: [
          {
            id: 'concept-1-1-1',
            name: 'Definition of Data Analysis',
            description: 'The process of inspecting, cleaning, transforming, and modeling data to discover useful information.',
            tags: ['fundamentals', 'definition']
          },
          {
            id: 'concept-1-1-2',
            name: 'Data Analysis Process',
            description: 'The steps involved in the data analysis process: data collection, cleaning, exploration, analysis, and interpretation.',
            tags: ['process', 'methodology']
          }
        ]
      },
      {
        id: 'section-1-2',
        title: 'Types of Data Analysis',
        description: 'Different approaches to analyzing data.',
        concepts: [
          {
            id: 'concept-1-2-1',
            name: 'Descriptive Analysis',
            description: 'Summarizing the main characteristics of a dataset using statistics and visualizations.',
            tags: ['analysis-types', 'descriptive']
          },
          {
            id: 'concept-1-2-2',
            name: 'Exploratory Analysis',
            description: 'Exploring data to discover patterns, anomalies, and relationships.',
            tags: ['analysis-types', 'exploratory']
          },
          {
            id: 'concept-1-2-3',
            name: 'Inferential Analysis',
            description: 'Using sample data to make inferences about a larger population.',
            tags: ['analysis-types', 'inferential']
          },
          {
            id: 'concept-1-2-4',
            name: 'Predictive Analysis',
            description: 'Using historical data to predict future outcomes.',
            tags: ['analysis-types', 'predictive']
          }
        ]
      }
    ]
  },
  {
    id: 'chapter-2',
    number: 2,
    title: 'Setting Up Your Environment',
    description: 'Preparing your computer for data analysis with Python.',
    sections: [
      {
        id: 'section-2-1',
        title: 'Installing Python',
        description: 'How to install Python and set up a development environment.',
        concepts: [
          {
            id: 'concept-2-1-1',
            name: 'Python Installation',
            description: 'Installing Python on different operating systems.',
            tags: ['setup', 'installation']
          },
          {
            id: 'concept-2-1-2',
            name: 'Virtual Environments',
            description: 'Creating isolated Python environments for different projects.',
            tags: ['setup', 'virtual-environments']
          }
        ]
      },
      {
        id: 'section-2-2',
        title: 'Essential Libraries for Data Analysis',
        description: 'Introduction to key Python libraries used in data analysis.',
        concepts: [
          {
            id: 'concept-2-2-1',
            name: 'NumPy Overview',
            description: 'Introduction to NumPy, a library for numerical computing in Python.',
            tags: ['libraries', 'numpy']
          },
          {
            id: 'concept-2-2-2',
            name: 'Pandas Overview',
            description: 'Introduction to Pandas, a library for data manipulation and analysis.',
            tags: ['libraries', 'pandas']
          },
          {
            id: 'concept-2-2-3',
            name: 'Matplotlib Overview',
            description: 'Introduction to Matplotlib, a library for creating visualizations.',
            tags: ['libraries', 'matplotlib']
          }
        ]
      }
    ]
  },
  {
    id: 'chapter-3',
    number: 3,
    title: 'Python Quick Review',
    description: 'A refresher on Python programming fundamentals.',
    sections: [
      {
        id: 'section-3-1',
        title: 'Python Basics',
        description: 'Fundamental Python concepts for data analysis.',
        concepts: [
          {
            id: 'concept-3-1-1',
            name: 'Python Variables and Data Types',
            description: 'Understanding variables, integers, floats, strings, booleans, and None in Python.',
            tags: ['python-basics', 'data-types']
          },
          {
            id: 'concept-3-1-2',
            name: 'Python Lists',
            description: 'Working with lists in Python: creation, indexing, slicing, and methods.',
            tags: ['python-basics', 'lists']
          },
          {
            id: 'concept-3-1-3',
            name: 'Python Dictionaries',
            description: 'Using dictionaries for key-value pair storage in Python.',
            tags: ['python-basics', 'dictionaries']
          }
        ]
      },
      {
        id: 'section-3-2',
        title: 'Control Flow',
        description: 'Controlling the flow of execution in Python programs.',
        concepts: [
          {
            id: 'concept-3-2-1',
            name: 'Conditional Statements',
            description: 'Using if, elif, and else statements for decision making in Python.',
            tags: ['python-basics', 'control-flow']
          },
          {
            id: 'concept-3-2-2',
            name: 'Loops in Python',
            description: 'Using for and while loops for iteration in Python.',
            tags: ['python-basics', 'loops']
          }
        ]
      },
      {
        id: 'section-3-3',
        title: 'Functions and Modules',
        description: 'Creating reusable code with functions and modules.',
        concepts: [
          {
            id: 'concept-3-3-1',
            name: 'Python Functions',
            description: 'Defining and calling functions in Python.',
            tags: ['python-basics', 'functions']
          },
          {
            id: 'concept-3-3-2',
            name: 'Python Modules and Imports',
            description: 'Organizing code with modules and importing functionality.',
            tags: ['python-basics', 'modules']
          }
        ]
      }
    ]
  },
  {
    id: 'chapter-4',
    number: 4,
    title: 'NumPy Fundamentals',
    description: 'Working with numerical data using NumPy.',
    sections: [
      {
        id: 'section-4-1',
        title: 'NumPy Arrays',
        description: 'Understanding and working with NumPy arrays.',
        concepts: [
          {
            id: 'concept-4-1-1',
            name: 'Creating NumPy Arrays',
            description: 'Different ways to create NumPy arrays.',
            tags: ['numpy', 'arrays']
          },
          {
            id: 'concept-4-1-2',
            name: 'NumPy Array Indexing and Slicing',
            description: 'Accessing elements and subarrays in NumPy arrays.',
            tags: ['numpy', 'indexing']
          }
        ]
      },
      {
        id: 'section-4-2',
        title: 'NumPy Operations',
        description: 'Performing operations on NumPy arrays.',
        concepts: [
          {
            id: 'concept-4-2-1',
            name: 'NumPy Array Operations',
            description: 'Arithmetic operations with NumPy arrays.',
            tags: ['numpy', 'operations']
          },
          {
            id: 'concept-4-2-2',
            name: 'NumPy Broadcasting',
            description: 'Understanding broadcasting in NumPy operations.',
            tags: ['numpy', 'broadcasting']
          }
        ]
      }
    ]
  },
  {
    id: 'chapter-5',
    number: 5,
    title: 'Pandas for Data Manipulation',
    description: 'Using Pandas for data manipulation and analysis.',
    sections: [
      {
        id: 'section-5-1',
        title: 'Pandas Series and DataFrames',
        description: 'Understanding the core data structures in Pandas.',
        concepts: [
          {
            id: 'concept-5-1-1',
            name: 'Pandas Series',
            description: 'Working with one-dimensional labeled arrays in Pandas.',
            tags: ['pandas', 'series']
          },
          {
            id: 'concept-5-1-2',
            name: 'Pandas DataFrames',
            description: 'Working with two-dimensional labeled data structures in Pandas.',
            tags: ['pandas', 'dataframes']
          }
        ]
      },
      {
        id: 'section-5-2',
        title: 'Data Selection and Filtering',
        description: 'Selecting and filtering data in Pandas.',
        concepts: [
          {
            id: 'concept-5-2-1',
            name: 'Indexing in Pandas',
            description: 'Different ways to index and select data in Pandas.',
            tags: ['pandas', 'indexing']
          },
          {
            id: 'concept-5-2-2',
            name: 'Boolean Indexing',
            description: 'Filtering data based on conditions in Pandas.',
            tags: ['pandas', 'filtering']
          }
        ]
      }
    ]
  }
];

// Function to get a specific concept by ID
export function getConceptById(conceptId: string): Concept | null {
  for (const chapter of bookStructure) {
    for (const section of chapter.sections) {
      const concept = section.concepts.find(c => c.id === conceptId);
      if (concept) {
        return concept;
      }
    }
  }
  return null;
}

// Function to get a specific section by ID
export function getSectionById(sectionId: string): Section | null {
  for (const chapter of bookStructure) {
    const section = chapter.sections.find(s => s.id === sectionId);
    if (section) {
      return section;
    }
  }
  return null;
}

// Function to get a specific chapter by ID
export function getChapterById(chapterId: string): Chapter | null {
  return bookStructure.find(c => c.id === chapterId) || null;
}
