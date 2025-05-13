import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';

/**
 * Get the current user's information
 */
export async function GET() {
  try {
    // Get the session token from cookies - await cookies() function
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('app-session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 401 });
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
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
