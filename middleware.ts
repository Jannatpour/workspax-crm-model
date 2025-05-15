import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simple middleware that checks for custom session cookie
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for API routes and static assets
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path === '/favicon.ico' ||
    path === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  // Get our custom session token from cookies with more stringent validation
  const sessionToken = request.cookies.get('app-session')?.value;

  // Only consider valid session tokens (must be UUID-like)
  const hasValidSessionCookie =
    !!sessionToken &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionToken);

  console.log(
    `Middleware: Path=${path}, HasValidCookie=${hasValidSessionCookie}, Token=${
      sessionToken ? sessionToken.slice(0, 8) + '...' : 'none'
    }`
  );

  // Handle login page access
  if (path === '/login') {
    // If user has a valid session cookie, redirect to dashboard
    if (hasValidSessionCookie) {
      console.log('Middleware: Valid session cookie found, redirecting from login to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Otherwise, allow access to login page
    return NextResponse.next();
  }

  // Handle dashboard access
  if (path.startsWith('/dashboard')) {
    // If user doesn't have a valid session cookie, redirect to login
    if (!hasValidSessionCookie) {
      console.log('Middleware: No valid session cookie, redirecting from dashboard to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Otherwise, allow access to dashboard
    return NextResponse.next();
  }

  // For the root path, redirect based on session status
  if (path === '/') {
    if (hasValidSessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // For all other paths, allow access
  return NextResponse.next();
}

// Configure which routes this middleware applies to
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
