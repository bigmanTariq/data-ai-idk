import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';

// This is a development-only endpoint to create a test user
// It should be removed in production
export async function GET() {
  // Check if we're in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Create a test user with a known password
    const hashedPassword = await hash('password123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      },
    });

    // Create a user profile if it doesn't exist
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        level: 1,
        xp: 0,
      },
    });

    return NextResponse.json({
      message: 'Test user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      loginCredentials: {
        email: 'test@example.com',
        password: 'password123',
      },
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json(
      { error: 'Failed to create test user' },
      { status: 500 }
    );
  }
}
