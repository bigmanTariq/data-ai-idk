import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createGeminiClient } from '@/lib/gemini';

// POST /api/user/validate-apikey - Validate an API key before saving it
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { service, apiKey } = await request.json();

    if (!service || !apiKey) {
      return NextResponse.json({ error: 'Service and API key are required' }, { status: 400 });
    }

    // Currently only supporting Gemini
    if (service !== 'gemini') {
      return NextResponse.json({ error: 'Unsupported service' }, { status: 400 });
    }

    // Validate the Gemini API key by making a simple request
    try {
      const genAI = createGeminiClient(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Make a simple request to validate the API key
      const result = await model.generateContent('Hello, please respond with "valid" if you can read this message.');
      const response = await result.response;
      const text = response.text();

      // If we get here, the API key is valid
      return NextResponse.json({ valid: true }, { status: 200 });
    } catch (error: any) {
      console.error('Error validating Gemini API key:', error);

      // Check for specific error messages
      const errorMessage = error.message || '';
      if (errorMessage.includes('API key')) {
        return NextResponse.json({
          valid: false,
          error: 'Invalid API key. Please check your Gemini API key and try again.'
        }, { status: 200 });
      }

      if (errorMessage.includes('rate limit')) {
        return NextResponse.json({
          valid: false,
          error: 'API rate limit exceeded. Please try again later.'
        }, { status: 200 });
      }

      return NextResponse.json({
        valid: false,
        error: 'Failed to validate API key. Please check your API key and try again.'
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in validate-apikey endpoint:', error);
    return NextResponse.json({
      valid: false,
      error: 'An unexpected error occurred while validating the API key.'
    }, { status: 500 });
  }
}
