import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';

/**
 * Custom implementation for logout that bypasses NextAuth
 */
export async function POST() {
  try {
    // Get the session token from cookies - await cookies() function
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('app-session')?.value;

    if (sessionToken) {
      // Delete the session from the database
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
    }

    // Clear the session cookie
    cookies().delete('app-session');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Something went wrong during logout' }, { status: 500 });
  }
}
