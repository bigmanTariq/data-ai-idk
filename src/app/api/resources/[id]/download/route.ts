import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In Next.js 15, we need to await params
    const { id: resourceId } = params;

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

    // Construct file path
    const filePath = path.join(process.cwd(), 'public', resource.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Create response with file
    const response = new NextResponse(fileBuffer);

    // Set headers
    response.headers.set('Content-Type', resource.fileType);
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${resource.fileName}"`
    );
    response.headers.set('Content-Length', resource.fileSize.toString());

    return response;
  } catch (error) {
    console.error('Error downloading resource:', error);
    return NextResponse.json(
      { error: 'Failed to download resource' },
      { status: 500 }
    );
  }
}
