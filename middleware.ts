import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simple middleware that checks for custom session cookie
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define protected routes that require authentication
  const isProtectedPath =
    path.startsWith('/dashboard') || path.startsWith('/account') || path.startsWith('/api/private');

  // Auth-related routes
  const isAuthPath =
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password');

  // Get our custom session token from cookies
  const sessionToken = request.cookies.get('app-session')?.value;

  // Simple check if user has a session cookie
  const isLoggedIn = !!sessionToken;

  // Protect routes that require authentication
  if (isProtectedPath && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    // Include the original URL as a callback parameter
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to proceed normally
  return NextResponse.next();
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    '/((?!api/auth/login|api/auth/logout|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};
