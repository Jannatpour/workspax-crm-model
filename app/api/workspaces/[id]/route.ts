// app/api/workspaces/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

// GET a single workspace
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;

    // Check if user has access to this workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        members: {
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
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logo: workspace.logo,
      description: workspace.description,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      ownerId: workspace.ownerId,
      members: workspace.members.map(member => ({
        id: member.id,
        userId: member.userId,
        workspaceId: member.workspaceId,
        role: member.role,
        name: member.user.name || undefined,
        email: member.user.email || undefined,
        avatar: member.user.image || undefined,
      })),
    });
  } catch (error) {
    console.error('Error getting workspace:', error);
    return NextResponse.json({ error: 'Failed to get workspace' }, { status: 500 });
  }
}

// PATCH to update a workspace
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;

    // Check if user is owner or admin
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

    // Check if it's a form data request (for file uploads) or a JSON request
    const contentType = request.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());

      // Handle file upload
      const logoFile = formData.get('logo') as File | null;
      if (logoFile && logoFile instanceof File) {
        // Here you would typically upload the file to a storage service
        // For simplicity, we'll just use a placeholder
        data.logo = `/uploads/workspaces/${workspaceId}/${Date.now()}-${logoFile.name}`;
      }
    } else {
      data = await request.json();
    }

    // Update the slug if name is changed
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if slug is unique (excluding current workspace)
      const existingWorkspace = await prisma.workspace.findFirst({
        where: {
          slug: data.slug,
          NOT: { id: workspaceId },
        },
      });

      if (existingWorkspace) {
        data.slug = `${data.slug}-${Date.now().toString().slice(-6)}`;
      }
    }

    // Update the workspace
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data,
      include: {
        members: {
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
        },
      },
    });

    return NextResponse.json({
      id: updatedWorkspace.id,
      name: updatedWorkspace.name,
      slug: updatedWorkspace.slug,
      logo: updatedWorkspace.logo,
      description: updatedWorkspace.description,
      createdAt: updatedWorkspace.createdAt,
      updatedAt: updatedWorkspace.updatedAt,
      ownerId: updatedWorkspace.ownerId,
      members: updatedWorkspace.members.map(member => ({
        id: member.id,
        userId: member.userId,
        workspaceId: member.workspaceId,
        role: member.role,
        name: member.user.name || undefined,
        email: member.user.email || undefined,
        avatar: member.user.image || undefined,
      })),
    });
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
  }
}

// DELETE a workspace
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;

    // Check if user is the owner
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: session.user.id,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Unauthorized or workspace not found' }, { status: 403 });
    }

    // Delete the workspace
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 });
  }
}
