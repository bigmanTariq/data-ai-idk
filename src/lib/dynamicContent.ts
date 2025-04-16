import { GoogleGenerativeAI } from '@google/generative-ai';
import { decrypt } from './encryption';

// Types for dynamic content generation
export type ContentType = 'explanation' | 'example' | 'practice' | 'simplify' | 'elaborate' | 'question';

export interface DynamicContentRequest {
  conceptName: string;
  contentType: ContentType;
  context?: string;
  userQuestion?: string;
}

export interface DynamicContentResponse {
  content: string;
  source: 'gemini';
  timestamp: string;
}

// Function to generate dynamic content using Gemini
export async function generateDynamicContent(
  apiKey: string,
  request: DynamicContentRequest
): Promise<DynamicContentResponse> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use Gemini 2.0 Flash which is the current model name
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    // Build the prompt based on the content type
    const prompt = buildPrompt(request);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      source: 'gemini',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error generating dynamic content with Gemini:', error);

    // Provide more helpful error messages
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your Gemini API key in settings.');
    } else if (error.message?.includes('rate limit') || error.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    } else if (error.status === 404) {
      throw new Error('The Gemini model is not available. Please check if your API key has access to the gemini-2.0-flash model.');
    } else {
      throw new Error('Failed to generate content. ' + (error.message || 'Please try again later.'));
    }
  }
}

// Function to build prompts based on content type
function buildPrompt(request: DynamicContentRequest): string {
  const { conceptName, contentType, context, userQuestion } = request;

  // Base context from the book
  const bookContext = "Based on the context of 'Data Analysis from Scratch with Python'";

  // Build prompt based on content type
  switch (contentType) {
    case 'explanation':
      return `Explain the concept of "${conceptName}" for a beginner data analyst, ${bookContext}. Keep it concise and focus on the key points that are most relevant for data analysis.`;

    case 'example':
      return `Provide a simple, clear Python code example demonstrating "${conceptName}". Add brief comments to explain each step. ${bookContext}, ensure the example is practical for data analysis tasks.`;

    case 'practice':
      return `Suggest a very simple practice exercise idea (not the code) for "${conceptName}" that would be appropriate for a beginner learning data analysis with Python. ${bookContext}, focus on a task that reinforces the core concept.`;

    case 'simplify':
      return `Provide a simplified explanation of "${conceptName}" for someone who is completely new to programming and data analysis. Use analogies and avoid technical jargon where possible. ${bookContext}.`;

    case 'elaborate':
      return `Provide a more detailed explanation of "${conceptName}" with additional context and nuance. ${bookContext}, include information about how this concept is used in real-world data analysis scenarios.`;

    case 'question':
      if (!userQuestion) {
        throw new Error('User question is required for question content type');
      }
      return `The user is learning about "${conceptName}" in the context of data analysis with Python and has the following question: "${userQuestion}". Please provide a clear, accurate answer. ${bookContext}.`;

    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

// Function to get user's Gemini API key from the database
export async function getUserGeminiApiKey(userId: string): Promise<string | null> {
  try {
    // Import prisma here to avoid circular dependencies
    const { prisma } = await import('@/lib/prisma');

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      return null;
    }

    // Get Gemini API key
    const apiKeyRecord = await prisma.userApiKey.findUnique({
      where: {
        userId_service: {
          userId: userProfile.id,
          service: 'gemini',
        },
      },
    });

    if (!apiKeyRecord) {
      return null;
    }

    // Decrypt the API key
    return decrypt(apiKeyRecord.encryptedKey);
  } catch (error) {
    console.error('Error getting user Gemini API key:', error);
    return null;
  }
}
