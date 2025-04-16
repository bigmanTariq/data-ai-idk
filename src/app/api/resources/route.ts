import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { queuePDFProcessing } from '@/lib/ai-pdf-processor';

// Helper function to ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
    return uploadDir;
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw new Error('Failed to create upload directory');
  }
}

// GET /api/resources - Get all resources
export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Upload a new resource
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const file = formData.get('file') as File;

    if (!title || !description || !category || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size should not exceed 10MB' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir();

    // Save file to disk
    const filePath = path.join('uploads', fileName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), fileBuffer);

    // Create resource record in database
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath,
        category: category as any, // Cast to ResourceCategory enum
        uploadedById: session.user.id,
        aiProcessed: false,
      },
    });

    // Queue the PDF for AI processing
    // This is done asynchronously so it doesn't block the response
    queuePDFProcessing(resource.id).catch(error => {
      console.error('Error queuing PDF for AI processing:', error);
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error uploading resource:', error);
    return NextResponse.json(
      { error: 'Failed to upload resource' },
      { status: 500 }
    );
  }
}
