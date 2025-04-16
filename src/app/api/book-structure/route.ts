import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { bookStructure, getChapterById, getSectionById, getConceptById } from '@/lib/bookStructure';

// GET /api/book-structure - Get the entire book structure
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const chapterId = searchParams.get('chapterId');
    const sectionId = searchParams.get('sectionId');
    const conceptId = searchParams.get('conceptId');
    
    // Return specific concept if conceptId is provided
    if (conceptId) {
      const concept = getConceptById(conceptId);
      if (!concept) {
        return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
      }
      return NextResponse.json(concept);
    }
    
    // Return specific section if sectionId is provided
    if (sectionId) {
      const section = getSectionById(sectionId);
      if (!section) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }
      return NextResponse.json(section);
    }
    
    // Return specific chapter if chapterId is provided
    if (chapterId) {
      const chapter = getChapterById(chapterId);
      if (!chapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }
      return NextResponse.json(chapter);
    }
    
    // Return the entire book structure
    return NextResponse.json(bookStructure);
  } catch (error) {
    console.error('Error fetching book structure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
