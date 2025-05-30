import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { generateDynamicContent, DynamicContentRequest } from '@/lib/dynamicContent';

// POST /api/dynamic-content - Generate dynamic content using Gemini
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    const { conceptName, contentType, context, userQuestion } = requestData as DynamicContentRequest;
    
    if (!conceptName || !contentType) {
      return NextResponse.json({ error: 'Concept name and content type are required' }, { status: 400 });
    }

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
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
      return NextResponse.json(
        { error: 'Gemini API key not found. Please add your API key in settings.' },
        { status: 404 }
      );
    }

    // Decrypt the API key
    const apiKey = decrypt(apiKeyRecord.encryptedKey);

    // Generate dynamic content
    const dynamicContent = await generateDynamicContent(
      apiKey,
      { conceptName, contentType, context, userQuestion }
    );

    return NextResponse.json(dynamicContent, { status: 200 });
  } catch (error: any) {
    console.error('Error generating dynamic content:', error);
    
    // Handle specific API errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid Gemini API key. Please check your API key in settings.' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Gemini API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate content. Please try again later.' },
      { status: 500 }
    );
  }
}
