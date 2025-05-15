import { parseCookies } from 'nookies';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { cache } from 'react';

/**
 * Type for the session data
 */
export type SessionData = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string | null;
  };
} | null;

/**
 * Helper function to get the session token from cookies
 * This uses multiple methods to try to get the cookie in different contexts
 */
async function getSessionToken(ctx = null) {
  let sessionToken = null;

  // Method 1: Try using next/headers (works in server components/routes)
  try {
    // Must use an immediately invoked async function to properly await cookies()
    sessionToken = await (async () => {
      const cookieStore = cookies();
      const token = cookieStore.get('app-session')?.value;
      if (token) {
        console.log('Auth: Found session token using next/headers');
      }
      return token;
    })();

    if (sessionToken) {
      return sessionToken;
    }
  } catch (error) {
    console.log('Auth: Error reading cookies with next/headers:', error);
  }

  // Method 2: Try using nookies (works in pages router and some contexts)
  try {
    const nookiesCookies = parseCookies(ctx);
    sessionToken = nookiesCookies['app-session'];
    if (sessionToken) {
      console.log('Auth: Found session token using nookies');
      return sessionToken;
    }
  } catch (error) {
    console.log('Auth: Error reading cookies with nookies:', error);
  }

  // No session token found with any method
  console.log('Auth: No session token found in cookies with any method');
  return null;
}

/**
 * Cached version of getSession to prevent multiple database calls
 * This is important to prevent redirect loops
 */
export const getSession = cache(async (ctx = null): Promise<SessionData> => {
  try {
    const sessionToken = await getSessionToken(ctx);

    if (!sessionToken) {
      console.log('Auth: No session token found in cookies');
      return null;
    }

    // Validate token format (UUID)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionToken)) {
      console.log('Auth: Invalid session token format');
      return null;
    }

    console.log('Auth: Fetching session with token:', sessionToken.slice(0, 8) + '...');

    // Find the session in the database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Check if session exists and is not expired
    if (!session) {
      console.log('Auth: No session found in database for token');
      return null;
    }

    if (session.expires < new Date()) {
      console.log('Auth: Session has expired');
      return null;
    }

    // Debug point
    console.log('Auth: Valid session found for user:', session.user.email);

    return {
      user: session.user,
    };
  } catch (error) {
    console.error('Auth: Error getting session:', error);
    return null;
  }
});

/**
 * Function to check if user is authenticated
 */
export async function isAuthenticated(ctx = null): Promise<boolean> {
  const session = await getSession(ctx);
  const authenticated = !!session;
  console.log('Auth: Authentication check result:', authenticated);
  return authenticated;
}

/**
 * Retrieves the current authenticated user
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(ctx = null) {
  const session = await getSession(ctx);

  if (!session?.user?.id) {
    return null;
  }

  // Return the user from the session directly
  return session.user;
}

/**
 * Get the full user record from the database with additional data
 * Useful when you need more than just the basic user info from the session
 */
export async function getFullUserRecord() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  // Get the complete user record from the database
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      workspaceMemberships: {
        include: {
          workspace: true,
        },
      },
      // Add any other relations you need
    },
  });

  return user;
}
