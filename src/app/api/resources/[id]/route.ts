import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';

// GET /api/resources/[id] - Get a specific resource
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

    const resource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
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

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/[id] - Delete a resource (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can delete resources' },
        { status: 403 }
      );
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

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'public', resource.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete resource from database
    await prisma.resource.delete({
      where: {
        id: resourceId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
