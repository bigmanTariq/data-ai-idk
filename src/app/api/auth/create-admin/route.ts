import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';

// This is a development-only endpoint to create an admin user
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
    console.log('Starting admin user creation process');

    // Create an admin user with a known password
    const hashedPassword = await hash('admin123', 10);
    console.log('Password hashed successfully');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    console.log('Existing user check:', existingUser ? 'User exists' : 'User does not exist');

    const user = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        password: hashedPassword,
        isAdmin: true,
      },
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
      },
    });

    console.log('User upsert completed:', user);

    // Create a user profile if it doesn't exist
    console.log('Creating user profile for user ID:', user.id);

    try {
      const userProfile = await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          level: 10,
          xp: 5000,
        },
      });

      console.log('User profile created/updated successfully:', userProfile);
    } catch (profileError) {
      console.error('Error creating user profile:', profileError);
      throw profileError; // Re-throw to be caught by the outer catch block
    }

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
      loginCredentials: {
        email: 'admin@example.com',
        password: 'admin123',
      },
    });
  } catch (error) {
    console.error('Error creating admin user:', error);

    // Get more detailed error information
    let errorMessage = 'Failed to create admin user';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
