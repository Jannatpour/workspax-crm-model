import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { cache } from 'react';

/**
 * Custom function to get the current session without using NextAuth
 * This directly queries the database for the session
 */
export const getSession = cache(async () => {
  try {
    // Get the session token from cookies - await cookies() function
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('app-session')?.value;

    if (!sessionToken) {
      return null;
    }

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
    if (!session || session.expires < new Date()) {
      return null;
    }

    return {
      user: session.user,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
});

/**
 * Function to check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

/**
 * Type for the session data
 */
export type SessionData = Awaited<ReturnType<typeof getSession>>;
