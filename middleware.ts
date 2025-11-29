import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const { pathname } = request.nextUrl;

  // Root path
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard');

  // Auth routes
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isProtectedRoute && !token) {
    // Redirect to login if accessing protected route without auth
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && token) {
    // Redirect to dashboard if accessing auth routes while authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/login/:path*',
    '/register/:path*',
  ],
};

