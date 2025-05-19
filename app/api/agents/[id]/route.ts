// app/api/agents/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';

// Schema for agent updates
const agentUpdateSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).optional(),
  description: z.string().optional(),
  modelType: z
    .enum(['gpt-4o', 'claude-3-opus', 'mistral-large', 'gemini-pro', 'custom'])
    .optional(),
  modelConfig: z
    .object({
      temperature: z.number().min(0).max(1),
      maxTokens: z.number().optional(),
      topP: z.number().min(0).max(1).optional(),
      presencePenalty: z.number().min(-2).max(2).optional(),
      frequencyPenalty: z.number().min(-2).max(2).optional(),
    })
    .optional(),
  systemPrompt: z.string().optional(),
  isActive: z.boolean().optional(),
  capabilities: z
    .array(
      z.object({
        key: z.string(),
        name: z.string(),
        description: z.string().optional(),
        isEnabled: z.boolean(),
        settings: z.record(z.any()).optional(),
      })
    )
    .optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the agent
    const agent = await prisma.agent.findUnique({
      where: {
        id: params.id,
      },
      include: {
        capabilities: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if the user has access to the agent's workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: agent.workspaceId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Access denied to this agent' }, { status: 403 });
    }

    // Transform to the expected format
    const transformedAgent = {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      modelType: agent.type,
      modelConfig: agent.modelConfig,
      systemPrompt: agent.prompt,
      isActive: agent.status === 'ACTIVE',
      capabilities: agent.capabilities.map((cap: any) => ({
        key: cap.type.toLowerCase(),
        name: cap.name,
        description: cap.description,
        isEnabled: true,
        settings: cap.config,
      })),
      avatarUrl: agent.avatarUrl,
      metadata: {},
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedAgent);
  } catch (error: any) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch agent' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the agent
    const agent = await prisma.agent.findUnique({
      where: {
        id: params.id,
      },
      include: {
        capabilities: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if the user has access to the agent's workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: agent.workspaceId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Access denied to this agent' }, { status: 403 });
    }

    // Get the request body
    const body = await request.json();

    // Validate the input
    const validatedData = agentUpdateSchema.parse(body);

    // Update the agent
    const updatedAgent = await prisma.agent.update({
      where: {
        id: params.id,
      },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.modelType,
        status:
          validatedData.isActive !== undefined
            ? validatedData.isActive
              ? 'ACTIVE'
              : 'DRAFT'
            : undefined,
        prompt: validatedData.systemPrompt,
        modelConfig: validatedData.modelConfig || agent.modelConfig,
      },
    });

    // If capabilities are provided, update them
    if (validatedData.capabilities) {
      // Delete existing capabilities
      await prisma.agentCapability.deleteMany({
        where: {
          agentId: agent.id,
        },
      });

      // Create new capabilities
      await Promise.all(
        validatedData.capabilities.map(async cap => {
          return prisma.agentCapability.create({
            data: {
              name: cap.name,
              description: cap.description || '',
              type: cap.key.toUpperCase(),
              config: cap.settings || {},
              agentId: agent.id,
            },
          });
        })
      );
    }

    // Get the updated agent with capabilities
    const updatedAgentWithCapabilities = await prisma.agent.findUnique({
      where: {
        id: params.id,
      },
      include: {
        capabilities: true,
      },
    });

    if (!updatedAgentWithCapabilities) {
      return NextResponse.json({ error: 'Failed to retrieve updated agent' }, { status: 500 });
    }

    // Transform to the expected format
    const transformedAgent = {
      id: updatedAgentWithCapabilities.id,
      name: updatedAgentWithCapabilities.name,
      description: updatedAgentWithCapabilities.description,
      modelType: updatedAgentWithCapabilities.type,
      modelConfig: updatedAgentWithCapabilities.modelConfig,
      systemPrompt: updatedAgentWithCapabilities.prompt,
      isActive: updatedAgentWithCapabilities.status === 'ACTIVE',
      capabilities: updatedAgentWithCapabilities.capabilities.map((cap: any) => ({
        key: cap.type.toLowerCase(),
        name: cap.name,
        description: cap.description,
        isEnabled: true,
        settings: cap.config,
      })),
      avatarUrl: updatedAgentWithCapabilities.avatarUrl,
      metadata: {},
      createdAt: updatedAgentWithCapabilities.createdAt.toISOString(),
      updatedAt: updatedAgentWithCapabilities.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedAgent);
  } catch (error: any) {
    console.error('Error updating agent:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message || 'Failed to update agent' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the agent
    const agent = await prisma.agent.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if the user has access to the agent's workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: agent.workspaceId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                role: 'admin',
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Access denied to this agent or insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete the agent's capabilities first (to avoid foreign key constraints)
    await prisma.agentCapability.deleteMany({
      where: {
        agentId: agent.id,
      },
    });

    // Delete the agent
    await prisma.agent.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete agent' }, { status: 500 });
  }
}
