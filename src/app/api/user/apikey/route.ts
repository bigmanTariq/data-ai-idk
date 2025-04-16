import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';

// GET /api/user/apikey - Get user's API key for a service
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const service = searchParams.get('service');
    
    if (!service) {
      return NextResponse.json({ error: 'Service parameter is required' }, { status: 400 });
    }

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get API key for the specified service
    const apiKey = await prisma.userApiKey.findUnique({
      where: {
        userId_service: {
          userId: userProfile.id,
          service: service,
        },
      },
    });

    if (!apiKey) {
      return NextResponse.json({ hasKey: false }, { status: 200 });
    }

    // Return that the user has a key, but don't return the actual key for security
    return NextResponse.json({ hasKey: true }, { status: 200 });
  } catch (error) {
    console.error('Error getting API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/apikey - Save or update user's API key for a service
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

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey);

    // Save or update the API key
    await prisma.userApiKey.upsert({
      where: {
        userId_service: {
          userId: userProfile.id,
          service: service,
        },
      },
      update: {
        encryptedKey,
        updatedAt: new Date(),
      },
      create: {
        userId: userProfile.id,
        service,
        encryptedKey,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/apikey - Delete user's API key for a service
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const service = searchParams.get('service');
    
    if (!service) {
      return NextResponse.json({ error: 'Service parameter is required' }, { status: 400 });
    }

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Delete the API key
    await prisma.userApiKey.delete({
      where: {
        userId_service: {
          userId: userProfile.id,
          service: service,
        },
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
