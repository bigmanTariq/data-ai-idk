import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { createGeminiClient } from '@/lib/gemini';
import { getConceptById } from '@/lib/bookStructure';

// Function to generate an explanation using Gemini API
async function generateConceptExplanationWithAI(
  conceptName: string,
  conceptDescription: string,
  tags: string[],
  apiKey: string
): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error('Gemini API key is not provided');
    }

    // Create Gemini client
    const genAI = createGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    // Create a detailed prompt for concept explanation
    const prompt = `You are an expert data science educator with extensive knowledge in ${tags.join(', ')}. 
Your task is to provide a comprehensive explanation of the concept "${conceptName}" for a student learning data analysis.

Concept Description: ${conceptDescription}

Please provide a detailed explanation that includes:

1. A clear definition of "${conceptName}" in simple terms
2. The importance and relevance of this concept in data analysis
3. How this concept is applied in practical data science scenarios
4. Key principles or techniques associated with this concept
5. Common challenges or misconceptions about this concept
6. How this concept relates to other areas in data science (${tags.join(', ')})

Format your response with clear headings and bullet points where appropriate. Make complex topics accessible while maintaining technical accuracy.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error('Error generating explanation with Gemini:', error);
    return 'Failed to generate an explanation with AI. Please try again later.';
  }
}

// POST /api/book/concept/[id]/explain - Generate an AI explanation for a book concept
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the concept ID from the URL params
    const { id: conceptId } = params;

    // Get the concept from the book structure
    const concept = getConceptById(conceptId);
    if (!concept) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      );
    }

    // Get the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get the user's Gemini API key
    const apiKeyRecord = await prisma.userApiKey.findUnique({
      where: {
        userId_service: {
          userId: userProfile.id,
          service: 'gemini',
        },
      },
    });

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: 'Gemini API key not found' },
        { status: 400 }
      );
    }

    // Decrypt the API key
    const apiKey = decrypt(apiKeyRecord.encryptedKey);

    // Generate an explanation with AI
    const explanation = await generateConceptExplanationWithAI(
      concept.name,
      concept.description,
      concept.tags,
      apiKey
    );

    // Store the explanation in the database for future use
    await prisma.conceptExplanation.upsert({
      where: {
        conceptId_userId: {
          conceptId: concept.id,
          userId: session.user.id,
        },
      },
      update: {
        explanation,
        updatedAt: new Date(),
      },
      create: {
        conceptId: concept.id,
        userId: session.user.id,
        explanation,
      },
    });

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error generating concept explanation:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
