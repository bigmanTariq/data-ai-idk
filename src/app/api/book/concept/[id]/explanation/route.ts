import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getConceptById } from '@/lib/bookStructure';

// GET /api/book/concept/[id]/explanation - Get an existing AI explanation for a book concept
export async function GET(
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

    // Get the existing explanation from the database
    const explanation = await prisma.conceptExplanation.findUnique({
      where: {
        conceptId_userId: {
          conceptId: concept.id,
          userId: session.user.id,
        },
      },
    });

    if (!explanation) {
      return NextResponse.json({ explanation: null });
    }

    return NextResponse.json({ explanation: explanation.explanation });
  } catch (error) {
    console.error('Error fetching concept explanation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch explanation' },
      { status: 500 }
    );
  }
}
