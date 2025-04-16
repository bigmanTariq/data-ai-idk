import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define paths that are protected
  const isAdminPath = path.startsWith('/admin');
  
  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if the user is authenticated and is an admin
    const isAuthenticated = !!token;
    const isAdmin = token?.isAdmin === true;

    // If not authenticated or not an admin, redirect to login
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/admin/:path*'],
};
