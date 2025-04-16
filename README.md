# Data Analysis Dojo - Mastery Edition

A gamified learning web app for data analysis with Python, following Learn->Practice->Apply->Assess structure, using core Python libraries (Pandas, NumPy, Matplotlib, Scikit-learn, NLTK) with focus on skill mastery and auto-gradable exercises.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

Data Analysis Dojo is a web application designed to help users master data analysis skills through a structured, gamified learning experience. The application follows a Learn -> Practice -> Apply -> Assess (L->P->A->A) cycle for each module.

### Key Features

- **Structured Learning Path**: Content follows a Learn -> Practice -> Apply -> Assess cycle per module
- **Skill Matrix**: Track proficiency levels (Novice, Apprentice, Journeyman, Master) for specific skills
- **Gamification**: Earn XP, level up, and earn belts by completing activities and passing assessments
- **Interactive Coding**: Practice Python data analysis skills with an integrated code editor
- **Auto-Grading**: Automated evaluation of code submissions for immediate feedback
- **AI-Powered Assistance**: Optional Gemini API integration for code explanations and concept elaboration

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Code Editor**: Monaco Editor
- **AI Integration**: Google Gemini API (optional)

## Features

- Interactive learning modules for data analysis
- AI-powered explanations using the Gemini API
- PDF upload and analysis for data science documents
- Skill tracking and progress visualization
- Gamified learning experience

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/bigmanTariq/data-ai-idk.git
   cd data-analysis-dojo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/data_analysis_dojo?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   ENCRYPTION_KEY="your-encryption-key-for-api-keys"
   ENCRYPTION_IV="your-encryption-iv"
   ```

4. Set up the database:
   ```
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. Seed the database with sample data:
   ```
   npm run prisma:seed
   ```

6. Start the development server:
   ```
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Account

You can use the following demo account to explore the application:
- Email: demo@example.com
- Password: password123

## Project Structure

- `/src/app`: Next.js app router pages
- `/src/components`: React components
- `/src/lib`: Utility functions and shared code
- `/prisma`: Database schema and migrations

## Learning Path Structure

The application follows a structured learning path:

1. **Learn**: Conceptual quizzes to test understanding of core concepts
2. **Practice**: Focused coding exercises targeting specific skills
3. **Apply**: Integrated challenges combining multiple skills
4. **Assess**: Comprehensive tests to demonstrate mastery (Belt Tests)

## Gemini API Integration

The application includes optional integration with Google's Gemini API to provide AI-powered assistance:

- **Code Explanations**: Get detailed explanations of code snippets during practice exercises
- **Concept Elaboration**: Receive in-depth explanations of data analysis concepts
- **Alternative Approaches**: Explore different ways to solve coding problems

### Setting Up Gemini API

1. Obtain a Gemini API key from [Google AI Studio](https://ai.google.dev/)
2. Log in to the Data Analysis Dojo application
3. Navigate to Settings > Gemini API Integration
4. Enter your API key (stored securely and encrypted)

**Note**: The Gemini API integration is entirely optional. All core learning features work without it.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
