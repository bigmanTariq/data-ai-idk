import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { processPDFWithAI } from '@/lib/ai-pdf-processor';

// POST /api/resources/[id]/explain - Generate AI explanation for a resource
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In Next.js 15, we need to await the params object
    const { id: resourceId } = await params;

    // Check if we should force regeneration
    const searchParams = request.nextUrl.searchParams;
    const forceRegenerate = searchParams.get('force') === 'true';

    // Get resource from database
    const resource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // If the resource already has an explanation and we're not forcing regeneration, return it
    if (resource.aiProcessed && resource.aiExplanation && !forceRegenerate) {
      console.log('Resource already has an explanation, returning existing one');
      return NextResponse.json(resource);
    }

    // Process the PDF with AI
    await processPDFWithAI(resourceId, forceRegenerate);

    // Get the updated resource with the explanation
    const updatedResource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
      },
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error('Error generating AI explanation:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI explanation' },
      { status: 500 }
    );
  }
}
