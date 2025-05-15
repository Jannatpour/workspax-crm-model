// src/lib/services/agent-service.ts

import { prisma as db } from '@/lib/db/prisma';
import {
  AgentType,
  AgentStatus,
  CapabilityType,
  RunStatus,
  TrainingDataType,
  WorkflowStatus,
} from '@prisma/client';

/**
 * Types for Agent Service
 */

export type AgentInput = {
  name: string;
  description?: string;
  type: AgentType;
  status: AgentStatus;
  prompt: string;
  modelConfig: {
    provider: string;
    modelName: string;
    temperature: number;
    maxTokens: number;
    systemMessage?: string;
  };
  settings: {
    requiresTraining: boolean;
    isPublic: boolean;
  };
  capabilities: string[];
  avatarUrl?: string;
  userId: string;
  workspaceId: string;
};

export type AgentUpdateInput = Partial<AgentInput> & {
  id: string;
};

export type AgentCapabilityInput = {
  name: string;
  description?: string;
  type: CapabilityType;
  config: any;
  agentId: string;
};

export type AgentRunInput = {
  agentId: string;
  input: any;
  workflowId?: string;
  conversationId?: string;
};

export type AgentTeamInput = {
  name: string;
  description?: string;
  userId: string;
  workspaceId: string;
};

export type AgentTeamMemberInput = {
  agentId: string;
  teamId: string;
  role?: string;
};

export type AgentTrainingDataInput = {
  name: string;
  description?: string;
  type: TrainingDataType;
  content: string;
  metadata?: any;
  agentId: string;
  userId: string;
};

/**
 * Agent Service
 */
export const AgentService = {
  /**
   * Create a new agent
   */
  async createAgent(data: AgentInput) {
    try {
      // Create the agent
      const agent = await db.agent.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          status: data.status,
          prompt: data.prompt,
          modelConfig: data.modelConfig,
          settings: data.settings,
          avatarUrl: data.avatarUrl,
          user: { connect: { id: data.userId } },
          workspace: { connect: { id: data.workspaceId } },
        },
      });

      // Create capabilities if provided
      if (data.capabilities && data.capabilities.length > 0) {
        // Create capabilities as separate entries
        await Promise.all(
          data.capabilities.map(capability => {
            const [type, name] = capability.split('_');
            return db.agentCapability.create({
              data: {
                name: name || capability,
                type: type.toUpperCase() as CapabilityType,
                config: {},
                agent: { connect: { id: agent.id } },
              },
            });
          })
        );
      }

      return agent;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  },

  /**
   * Get an agent by ID
   */
  async getAgent(id: string) {
    try {
      const agent = await db.agent.findUnique({
        where: { id },
        include: {
          capabilities: true,
          runs: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          feedbacks: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      return agent;
    } catch (error) {
      console.error('Error getting agent:', error);
      throw error;
    }
  },

  /**
   * Get all agents for a workspace
   */
  async getAgents(workspaceId: string) {
    try {
      const agents = await db.agent.findMany({
        where: { workspaceId },
        include: {
          capabilities: true,
          _count: {
            select: {
              runs: true,
              feedbacks: true,
              teamMemberships: true,
              conversations: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      return agents;
    } catch (error) {
      console.error('Error getting agents:', error);
      throw error;
    }
  },

  /**
   * Get agents for a user
   */
  async getUserAgents(userId: string, workspaceId: string) {
    try {
      const agents = await db.agent.findMany({
        where: {
          userId,
          workspaceId,
        },
        include: {
          capabilities: true,
          _count: {
            select: {
              runs: true,
              feedbacks: true,
              teamMemberships: true,
              conversations: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      return agents;
    } catch (error) {
      console.error('Error getting user agents:', error);
      throw error;
    }
  },

  /**
   * Update an agent
   */
  async updateAgent(data: AgentUpdateInput) {
    try {
      // Update agent's main data
      const agent = await db.agent.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          status: data.status,
          prompt: data.prompt,
          modelConfig: data.modelConfig,
          settings: data.settings,
          avatarUrl: data.avatarUrl,
        },
      });

      // Update capabilities if provided
      if (data.capabilities) {
        // First delete existing capabilities
        await db.agentCapability.deleteMany({
          where: { agentId: data.id },
        });

        // Then create new ones
        await Promise.all(
          data.capabilities.map(capability => {
            const [type, name] = capability.split('_');
            return db.agentCapability.create({
              data: {
                name: name || capability,
                type: type.toUpperCase() as CapabilityType,
                config: {},
                agent: { connect: { id: agent.id } },
              },
            });
          })
        );
      }

      return agent;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  },

  /**
   * Delete an agent
   */
  async deleteAgent(id: string) {
    try {
      // Cascade delete will handle related records
      const agent = await db.agent.delete({
        where: { id },
      });
      return agent;
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  },

  /**
   * Run an agent
   */
  async runAgent(data: AgentRunInput) {
    try {
      // Create a run record
      const run = await db.agentRun.create({
        data: {
          status: RunStatus.PENDING,
          input: data.input,
          agent: { connect: { id: data.agentId } },
          ...(data.workflowId ? { workflow: { connect: { id: data.workflowId } } } : {}),
          ...(data.conversationId
            ? { conversation: { connect: { id: data.conversationId } } }
            : {}),
          startedAt: new Date(),
        },
      });

      // In a real implementation, you would now trigger the agent execution
      // This could be through a background job, webhook, etc.
      // For now, we'll simulate the agent running with a timeout

      setTimeout(async () => {
        // Simulate success or failure randomly
        const success = Math.random() > 0.1; // 90% success rate

        if (success) {
          await db.agentRun.update({
            where: { id: run.id },
            data: {
              status: RunStatus.COMPLETED,
              output: { result: 'This is a simulated response from the agent.' },
              completedAt: new Date(),
              metrics: {
                latency_ms: Math.floor(Math.random() * 500) + 100,
                tokens_used: Math.floor(Math.random() * 1000) + 100,
              },
            },
          });

          // Increment usage count on agent
          await db.agent.update({
            where: { id: data.agentId },
            data: { usageCount: { increment: 1 } },
          });
        } else {
          await db.agentRun.update({
            where: { id: run.id },
            data: {
              status: RunStatus.FAILED,
              error: 'Simulated error during agent execution.',
              completedAt: new Date(),
            },
          });
        }
      }, 2000);

      return run;
    } catch (error) {
      console.error('Error running agent:', error);
      throw error;
    }
  },

  /**
   * Create an agent team
   */
  async createTeam(data: AgentTeamInput) {
    try {
      const team = await db.agentTeam.create({
        data: {
          name: data.name,
          description: data.description,
          user: { connect: { id: data.userId } },
          workspace: { connect: { id: data.workspaceId } },
        },
      });
      return team;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  /**
   * Get all teams for a workspace
   */
  async getTeams(workspaceId: string) {
    try {
      const teams = await db.agentTeam.findMany({
        where: { workspaceId },
        include: {
          members: {
            include: {
              agent: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      return teams;
    } catch (error) {
      console.error('Error getting teams:', error);
      throw error;
    }
  },

  /**
   * Add agent to team
   */
  async addAgentToTeam(data: AgentTeamMemberInput) {
    try {
      const teamMember = await db.agentTeamMember.create({
        data: {
          role: data.role || 'member',
          agent: { connect: { id: data.agentId } },
          team: { connect: { id: data.teamId } },
        },
      });
      return teamMember;
    } catch (error) {
      console.error('Error adding agent to team:', error);
      throw error;
    }
  },

  /**
   * Remove agent from team
   */
  async removeAgentFromTeam(agentId: string, teamId: string) {
    try {
      const teamMember = await db.agentTeamMember.deleteMany({
        where: {
          agentId,
          teamId,
        },
      });
      return teamMember;
    } catch (error) {
      console.error('Error removing agent from team:', error);
      throw error;
    }
  },

  /**
   * Delete a team
   */
  async deleteTeam(id: string) {
    try {
      // Cascade delete will handle team members
      const team = await db.agentTeam.delete({
        where: { id },
      });
      return team;
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  },

  /**
   * Add training data to agent
   */
  async addTrainingData(data: AgentTrainingDataInput) {
    try {
      const trainingData = await db.agentTrainingData.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          content: data.content,
          metadata: data.metadata || {},
          agent: { connect: { id: data.agentId } },
          user: { connect: { id: data.userId } },
        },
      });

      // Set agent to training status
      await db.agent.update({
        where: { id: data.agentId },
        data: { status: AgentStatus.TRAINING },
      });

      // In a real implementation, you would now trigger the training process
      // This could be through a background job, webhook, etc.

      return trainingData;
    } catch (error) {
      console.error('Error adding training data:', error);
      throw error;
    }
  },

  /**
   * Get training data for an agent
   */
  async getTrainingData(agentId: string) {
    try {
      const trainingData = await db.agentTrainingData.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
      });
      return trainingData;
    } catch (error) {
      console.error('Error getting training data:', error);
      throw error;
    }
  },

  /**
   * Create a conversation with an agent
   */
  async createConversation(agentId: string, userId: string, title?: string) {
    try {
      const conversation = await db.agentConversation.create({
        data: {
          title: title || 'New Conversation',
          messages: [],
          agent: { connect: { id: agentId } },
          user: { connect: { id: userId } },
        },
      });
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  /**
   * Add message to conversation
   */
  async addMessageToConversation(
    conversationId: string,
    message: { role: 'user' | 'assistant'; content: string }
  ) {
    try {
      // Get current messages
      const conversation = await db.agentConversation.findUnique({
        where: { id: conversationId },
        select: { messages: true },
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Add new message
      const messages = [...(conversation.messages as any[]), message];

      // Update conversation
      const updatedConversation = await db.agentConversation.update({
        where: { id: conversationId },
        data: {
          messages: messages,
          updatedAt: new Date(),
        },
      });

      return updatedConversation;
    } catch (error) {
      console.error('Error adding message to conversation:', error);
      throw error;
    }
  },

  /**
   * Get conversations for a user
   */
  async getUserConversations(userId: string, agentId?: string) {
    try {
      const conversations = await db.agentConversation.findMany({
        where: {
          userId,
          ...(agentId ? { agentId } : {}),
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });
      return conversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  },

  /**
   * Get a conversation by ID
   */
  async getConversation(id: string) {
    try {
      const conversation = await db.agentConversation.findUnique({
        where: { id },
        include: {
          agent: true,
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
      return conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  },

  /**
   * Submit feedback for an agent
   */
  async submitFeedback(agentId: string, userId: string, rating: number, comment?: string) {
    try {
      const feedback = await db.agentFeedback.create({
        data: {
          rating,
          comment,
          agent: { connect: { id: agentId } },
          user: { connect: { id: userId } },
        },
      });

      // Update agent's average rating
      const feedbacks = await db.agentFeedback.findMany({
        where: { agentId },
        select: { rating: true },
      });

      const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

      await db.agent.update({
        where: { id: agentId },
        data: { rating: parseFloat(averageRating.toFixed(1)) },
      });

      return feedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },
};
