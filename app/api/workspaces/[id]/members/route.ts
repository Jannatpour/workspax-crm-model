// app/api/workspaces/[id]/members/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;

    // Check if user has access to this workspace
    const userAccess = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    });

    if (!userAccess) {
      return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
    }

    // Get all members of the workspace
    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        role: 'asc', // Sort by role (owner first, then admin, etc.)
      },
    });

    // Transform to include user data
    const transformedMembers = members.map(member => ({
      id: member.id,
      userId: member.user.id,
      workspaceId: member.workspaceId,
      role: member.role,
      name: member.user.name || undefined,
      email: member.user.email,
      avatar: member.user.image || undefined,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }));

    return NextResponse.json(transformedMembers);
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    return NextResponse.json({ error: 'Failed to fetch workspace members' }, { status: 500 });
  }
}

// Update a specific member's role
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;
    const memberId = params.memberId;

    // Check if user has admin access to this workspace
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

    // Get the target member
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: {
        workspace: true,
      },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Don't allow changing the owner's role unless the current user is the owner
    if (targetMember.workspace.ownerId === targetMember.userId && userMembership.role !== 'owner') {
      return NextResponse.json(
        { error: "Cannot change the workspace owner's role" },
        { status: 403 }
      );
    }

    const { role } = await request.json();

    if (!['admin', 'member', 'guest'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update member role
    const updatedMember = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedMember.id,
      userId: updatedMember.user.id,
      workspaceId: updatedMember.workspaceId,
      role: updatedMember.role,
      name: updatedMember.user.name || undefined,
      email: updatedMember.user.email,
      avatar: updatedMember.user.image || undefined,
      createdAt: updatedMember.createdAt,
      updatedAt: updatedMember.updatedAt,
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 });
  }
}

// Remove a member from the workspace
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;
    const memberId = params.memberId;

    // Check if user has admin access to this workspace
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

    // Get the target member
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: {
        workspace: true,
      },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Don't allow removing the owner
    if (targetMember.workspace.ownerId === targetMember.userId) {
      return NextResponse.json({ error: 'Cannot remove the workspace owner' }, { status: 403 });
    }

    // Don't allow self-removal
    if (targetMember.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the workspace' },
        { status: 403 }
      );
    }

    // Remove member
    await prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
