import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log('Direct login attempt for:', email);
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user || !user.password) {
      console.log('User not found or no password set');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check password
    const isPasswordValid = await compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('Login successful for user:', user.email);
    
    // Return user info (excluding password)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    });
    
  } catch (error) {
    console.error('Error in direct login:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
