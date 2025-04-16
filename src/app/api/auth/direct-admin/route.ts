import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { PrismaClient } from '@prisma/client';

// This is a direct SQL approach to create an admin user
export async function GET() {
  try {
    console.log('Starting direct admin user creation process');
    
    // Create a new Prisma client
    const prisma = new PrismaClient();
    
    // Create an admin user with a known password
    const hashedPassword = await hash('admin123', 10);
    console.log('Password hashed successfully');
    
    // Use direct SQL to create the user
    const email = 'admin3@example.com';
    const name = 'Admin User 3';
    
    // Create the user
    const user = await prisma.$queryRaw`
      INSERT INTO "User" (email, name, password, "isAdmin", "emailVerified", "image")
      VALUES (${email}, ${name}, ${hashedPassword}, true, NULL, NULL)
      RETURNING id, email, name, "isAdmin"
    `;
    
    console.log('User created with direct SQL:', user);
    
    // Get the user ID
    const userId = user[0].id;
    
    // Create the user profile
    const userProfile = await prisma.$queryRaw`
      INSERT INTO "UserProfile" ("userId", level, xp)
      VALUES (${userId}, 10, 5000)
      RETURNING "userId", level, xp
    `;
    
    console.log('User profile created with direct SQL:', userProfile);
    
    // Close the Prisma client
    await prisma.$disconnect();
    
    return NextResponse.json({
      message: 'Admin user created successfully with direct SQL',
      user: user[0],
      loginCredentials: {
        email: email,
        password: 'admin123',
      },
    });
  } catch (error) {
    console.error('Error creating direct admin user:', error);
    
    // Get more detailed error information
    let errorMessage = 'Failed to create admin user with direct SQL';
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
