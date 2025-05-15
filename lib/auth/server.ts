// lib/auth/server.ts - FIXED SERVER AUTH MODULE
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
 * Server-only implementation using next/headers
 */
async function getSessionToken() {
  try {
    // FIXED: await the cookies() function
    const cookieStore = await cookies();
    const token = cookieStore.get('app-session')?.value;

    if (token) {
      console.log('Auth: Found session token using next/headers');
      return token;
    }
  } catch (error) {
    console.log('Auth: Error reading cookies:', error);
  }

  console.log('Auth: No session token found in cookies');
  return null;
}

/**
 * Cached version of getSession to prevent multiple database calls
 * This is important to prevent redirect loops
 * SERVER-ONLY FUNCTION
 */
export const getSession = cache(async (): Promise<SessionData> => {
  try {
    const sessionToken = await getSessionToken();

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
 * SERVER-ONLY FUNCTION
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  const authenticated = !!session;
  console.log('Auth: Authentication check result:', authenticated);
  return authenticated;
}

/**
 * Retrieves the current authenticated user
 * SERVER-ONLY FUNCTION
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  // Return the user from the session directly
  return session.user;
}

/**
 * Get the full user record from the database with additional data
 * SERVER-ONLY FUNCTION
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
