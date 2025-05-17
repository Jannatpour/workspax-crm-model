// app/api/workspaces/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Function to handle file uploads
async function handleFileUpload(file: File, workspaceId: string): Promise<string> {
  try {
    // Create directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'workspaces', workspaceId);
    fs.mkdirSync(uploadsDir, { recursive: true });

    // Generate unique filename
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9-.]/g, '')}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Return relative path for storage in DB
    return `/uploads/workspaces/${workspaceId}/${fileName}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

// GET all workspaces for current user
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all workspaces where user is owner or member
    const workspaces = await prisma.workspace.findMany({
      where: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform workspaces to return user data in members
    const transformedWorkspaces = workspaces.map(workspace => ({
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
        email: member.user.email,
        avatar: member.user.image || undefined,
      })),
    }));

    return NextResponse.json(transformedWorkspaces);
  } catch (error) {
    console.error('Error getting workspaces:', error);
    return NextResponse.json({ error: 'Failed to get workspaces' }, { status: 500 });
  }
}

// CREATE a new workspace
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let name, description, logoPath;

    // Handle form data (for file uploads)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name') as string;
      description = formData.get('description') as string;

      const logoFile = formData.get('logo') as File | null;
      if (logoFile && logoFile instanceof File) {
        // Generate a temporary ID for the workspace
        const tempId = uuidv4();
        logoPath = await handleFileUpload(logoFile, tempId);
      }
    } else {
      // Handle JSON data
      const body = await request.json();
      name = body.name;
      description = body.description;
      logoPath = body.logo;
    }

    if (!name) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    // Generate a unique slug
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (existingWorkspace) {
      // Append random string to make slug unique
      slug = `${slug}-${Date.now().toString().slice(-6)}`;
    }

    // Create the workspace
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        logo: logoPath,
        slug,
        owner: {
          connect: { id: session.user.id },
        },
        // Add the creator as an owner member
        members: {
          create: {
            role: 'owner',
            user: {
              connect: { id: session.user.id },
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

    // Create default automation settings for the workspace
    await prisma.workspaceAutomationSettings.create({
      data: {
        workspaceId: workspace.id,
      },
    });

    // Transform workspace to include user data in members
    const transformedWorkspace = {
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
        email: member.user.email,
        avatar: member.user.image || undefined,
      })),
    };

    return NextResponse.json(transformedWorkspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
