import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';

// This is a simplified endpoint to create an admin user
export async function GET() {
  try {
    console.log('Starting simple admin user creation process');
    
    // Create an admin user with a known password
    const hashedPassword = await hash('admin123', 10);
    console.log('Password hashed successfully');
    
    // Create the user directly without upsert
    const user = await prisma.user.create({
      data: {
        email: 'admin2@example.com',
        name: 'Admin User 2',
        password: hashedPassword,
        isAdmin: true,
      },
    });
    
    console.log('Admin user created successfully:', user);
    
    // Create a user profile
    console.log('Creating user profile for user ID:', user.id);
    
    const userProfile = await prisma.userProfile.create({
      data: {
        userId: user.id,
        level: 10,
        xp: 5000,
      },
    });
    
    console.log('User profile created successfully:', userProfile);
    
    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
      loginCredentials: {
        email: 'admin2@example.com',
        password: 'admin123',
      },
    });
  } catch (error) {
    console.error('Error creating simple admin user:', error);
    
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
