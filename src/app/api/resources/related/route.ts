import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Helper function to calculate relevance score between resource and concept
function calculateRelevanceScore(
  resource: {
    title: string;
    description: string;
    category: string;
    aiExplanation: string | null;
  },
  conceptName: string,
  conceptTags: string[]
): number {
  let score = 0;
  const lowerTitle = resource.title.toLowerCase();
  const lowerDescription = resource.description.toLowerCase();
  const lowerConceptName = conceptName.toLowerCase();
  const lowerCategory = resource.category.toLowerCase().replace('_', ' ');
  const lowerAiExplanation = resource.aiExplanation?.toLowerCase() || '';

  // Check for exact matches in title (highest weight)
  if (lowerTitle.includes(lowerConceptName)) {
    score += 10;
  }

  // Check for partial matches in title
  for (const word of lowerConceptName.split(' ')) {
    if (word.length > 3 && lowerTitle.includes(word)) {
      score += 3;
    }
  }

  // Check for matches in description
  if (lowerDescription.includes(lowerConceptName)) {
    score += 5;
  }

  // Check for partial matches in description
  for (const word of lowerConceptName.split(' ')) {
    if (word.length > 3 && lowerDescription.includes(word)) {
      score += 2;
    }
  }

  // Check for matches in AI explanation (if available)
  if (lowerAiExplanation && lowerAiExplanation.includes(lowerConceptName)) {
    score += 7;
  }

  // Check for tag matches
  for (const tag of conceptTags) {
    const lowerTag = tag.toLowerCase();
    
    // Direct category match
    if (lowerCategory.includes(lowerTag)) {
      score += 8;
    }
    
    // Title contains tag
    if (lowerTitle.includes(lowerTag)) {
      score += 4;
    }
    
    // Description contains tag
    if (lowerDescription.includes(lowerTag)) {
      score += 3;
    }
    
    // AI explanation contains tag
    if (lowerAiExplanation && lowerAiExplanation.includes(lowerTag)) {
      score += 5;
    }
  }

  return score;
}

// GET /api/resources/related - Get resources related to a concept
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const tagsParam = url.searchParams.get('tags');
    const conceptParam = url.searchParams.get('concept');
    
    if (!tagsParam && !conceptParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: tags or concept' },
        { status: 400 }
      );
    }

    const tags = tagsParam ? tagsParam.split(',') : [];
    const concept = conceptParam || '';

    // Get all resources
    const resources = await prisma.resource.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        aiExplanation: true,
        aiProcessed: true,
      },
    });

    // Calculate relevance score for each resource
    const scoredResources = resources.map(resource => ({
      ...resource,
      relevanceScore: calculateRelevanceScore(resource, concept, tags)
    }));

    // Sort by relevance score (descending) and take top 5
    const relatedResources = scoredResources
      .filter(resource => resource.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    return NextResponse.json(relatedResources);
  } catch (error) {
    console.error('Error fetching related resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related resources' },
      { status: 500 }
    );
  }
}
