import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth'; // Use your custom session mechanism
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    console.log('GET /api/workspaces - Starting...');

    // Use your custom session implementation instead of NextAuth
    const session = await getSession();
    console.log('Session retrieved:', session ? 'Yes' : 'No');

    if (!session || !session.user) {
      console.log('GET /api/workspaces - No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user ID from the session
    const userId = session.user.id;

    if (!userId) {
      console.log('GET /api/workspaces - No user ID in session');
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    console.log(`GET /api/workspaces - Fetching for user ${userId}`);

    // Fetch workspaces where the user is a member or owner
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
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

    console.log(`GET /api/workspaces - Found ${workspaces.length} workspaces`);

    // If user has no workspaces, create a default one
    if (workspaces.length === 0) {
      console.log('GET /api/workspaces - Creating default workspace');

      const defaultWorkspace = await prisma.workspace.create({
        data: {
          name: 'My Workspace',
          slug: `my-workspace-${Date.now()}`, // Ensure uniqueness
          owner: {
            connect: { id: userId },
          },
          members: {
            create: {
              role: 'owner',
              user: {
                connect: { id: userId },
              },
            },
          },
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

      // Return just the default workspace
      const formattedDefaultWorkspace = {
        id: defaultWorkspace.id,
        name: defaultWorkspace.name,
        slug: defaultWorkspace.slug,
        logo: defaultWorkspace.logo,
        createdAt: defaultWorkspace.createdAt,
        updatedAt: defaultWorkspace.updatedAt,
        ownerId: defaultWorkspace.ownerId,
        members: defaultWorkspace.members.map(member => ({
          id: member.id,
          userId: member.userId,
          workspaceId: member.workspaceId,
          role: member.role,
          name: member.user.name || undefined,
          email: member.user.email || undefined,
          avatar: member.user.image || undefined,
        })),
      };

      return NextResponse.json([formattedDefaultWorkspace]);
    }

    // Transform the data to match your Workspace interface
    const formattedWorkspaces = workspaces.map(workspace => ({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logo: workspace.logo,
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
    }));

    return NextResponse.json(formattedWorkspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}
