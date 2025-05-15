// app/api/workspaces/[id]/invite/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;

    // Check if user has permission to invite (owner or admin)
    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: 'Unauthorized - Insufficient permissions' },
        { status: 403 }
      );
    }

    const { email, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!['member', 'admin', 'guest'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // In a real-world app, you might want to send an invitation email here
      return NextResponse.json(
        { error: 'User not found. Send them an invitation to join the platform.' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
    });

    if (existingMembership) {
      // Update role if different
      if (existingMembership.role !== role) {
        await prisma.workspaceMember.update({
          where: { id: existingMembership.id },
          data: { role },
        });
        return NextResponse.json({ success: true, message: 'Member role updated' });
      }

      return NextResponse.json(
        { error: 'User is already a member of this workspace' },
        { status: 400 }
      );
    }

    // Add user to workspace
    await prisma.workspaceMember.create({
      data: {
        role,
        user: {
          connect: { id: user.id },
        },
        workspace: {
          connect: { id: workspaceId },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error inviting user to workspace:', error);
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 });
  }
}
