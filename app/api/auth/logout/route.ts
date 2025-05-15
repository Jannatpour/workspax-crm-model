mport { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';

/**
 * Custom implementation for logout that bypasses NextAuth
 */
export async function POST() {
  try {
    // Using an IIFE to properly await cookies()
    const sessionToken = await (async () => {
      const cookieStore = cookies();
      return cookieStore.get('app-session')?.value;
    })();

    if (sessionToken) {
      console.log('Logout: Deleting session from database');

      // Delete the session from the database
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
    }

    // Clear the session cookie - must use an IIFE to properly await cookies()
    await (async () => {
      const cookieStore = cookies();
      cookieStore.delete('app-session');
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Something went wrong during logout' }, { status: 500 });
  }
}
