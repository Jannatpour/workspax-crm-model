import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';

/**
 * API route to get the current user session
 * This is used by the client-side auth context
 */
export async function GET() {
  try {
    // Get session token from cookies
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('app-session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Validate token format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionToken)) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Check if session exists and is valid
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

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Return user data
    return NextResponse.json({ user: session.user }, { status: 200 });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
