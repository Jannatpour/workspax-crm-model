// app/api/agents/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';

// Schema for agent creation/updates
const agentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  description: z.string().optional(),
  modelType: z.enum(['gpt-4o', 'claude-3-opus', 'mistral-large', 'gemini-pro', 'custom']),
  modelConfig: z.object({
    temperature: z.number().min(0).max(1),
    maxTokens: z.number().optional(),
    topP: z.number().min(0).max(1).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
  }),
  systemPrompt: z.string(),
  isActive: z.boolean(),
  capabilities: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      description: z.string().optional(),
      isEnabled: z.boolean(),
      settings: z.record(z.any()).optional(),
    })
  ),
});

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workspace ID from query parameter
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId');

    // If no workspace ID, get all agents for the user across workspaces
    if (!workspaceId) {
      const userAgents = await prisma.agent.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      // Transform agents to the expected format
      const transformedAgents = userAgents.map(agent => ({
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
      }));

      return NextResponse.json({ agents: transformedAgents });
    }

    // Get agents for the specific workspace
    const workspaceAgents = await prisma.agent.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform agents to the expected format
    const transformedAgents = workspaceAgents.map(agent => ({
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
    }));

    return NextResponse.json({ agents: transformedAgents });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();

    // Validate the input
    const validatedData = agentSchema.parse(body);

    // Get workspace ID from query parameter or body
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId') || body.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    // Verify the user has access to the workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
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
      return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 403 });
    }

    // Create the agent
    const newAgent = await prisma.agent.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || '',
        type: validatedData.modelType,
        status: validatedData.isActive ? 'ACTIVE' : 'DRAFT',
        prompt: validatedData.systemPrompt,
        modelConfig: validatedData.modelConfig,
        settings: {},
        userId: user.id,
        workspaceId,
      },
    });

    // Create capabilities for the agent
    const capabilities = await Promise.all(
      validatedData.capabilities.map(async cap => {
        return prisma.agentCapability.create({
          data: {
            name: cap.name,
            description: cap.description || '',
            type: cap.key.toUpperCase(),
            config: cap.settings || {},
            agentId: newAgent.id,
          },
        });
      })
    );

    // Transform to the expected format
    const transformedAgent = {
      id: newAgent.id,
      name: newAgent.name,
      description: newAgent.description,
      modelType: newAgent.type,
      modelConfig: newAgent.modelConfig,
      systemPrompt: newAgent.prompt,
      isActive: newAgent.status === 'ACTIVE',
      capabilities: capabilities.map(cap => ({
        key: cap.type.toLowerCase(),
        name: cap.name,
        description: cap.description,
        isEnabled: true,
        settings: cap.config,
      })),
      avatarUrl: newAgent.avatarUrl,
      metadata: {},
      createdAt: newAgent.createdAt.toISOString(),
      updatedAt: newAgent.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedAgent, { status: 201 });
  } catch (error: any) {
    console.error('Error creating agent:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message || 'Failed to create agent' }, { status: 500 });
  }
}
