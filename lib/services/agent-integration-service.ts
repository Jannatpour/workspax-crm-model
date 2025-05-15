// src/lib/services/agent-integration-service.ts

import { AgentService } from './agent-service';
import { AiService } from './ai-service';
import { AgentType, CapabilityType } from '@prisma/client';
import { prisma as db } from '@/lib/db/prisma';

/**
 * Integration Types for connecting agents with CRM modules
 */

export type ModuleType =
  | 'email'
  | 'contact'
  | 'template'
  | 'workflow'
  | 'calendar'
  | 'lead'
  | 'task';

export type ModuleAgentAssignment = {
  id: string;
  agentId: string;
  teamId?: string;
  moduleType: ModuleType;
  moduleId?: string; // Optional specific module instance ID
  isActive: boolean;
  priority: number; // Higher number = higher priority
  capabilities: string[]; // Required capabilities for this assignment
  createdAt: Date;
  updatedAt: Date;
};

export type ModuleTaskDefinition = {
  id: string;
  name: string;
  description: string;
  moduleType: ModuleType;
  requiredCapabilities: string[];
  isSystem: boolean; // Whether this is a system-defined task or custom
  isActive: boolean;
};

export type AgentTaskRequest = {
  taskType: string;
  moduleType: ModuleType;
  moduleId?: string;
  input: any;
  userId: string;
  workspaceId: string;
  priority?: 'low' | 'normal' | 'high';
  requiredCapabilities?: string[];
  preferredAgentId?: string;
  preferredTeamId?: string;
};

export type AgentTaskResult = {
  success: boolean;
  agentId: string;
  teamId?: string;
  output: any;
  error?: string;
  completedAt: Date;
  metrics?: any;
};

/**
 * AgentIntegration Service
 * Handles integration between AI agents and other CRM modules
 */
export const AgentIntegrationService = {
  /**
   * Find agents suitable for a specific module and task
   */
  async findSuitableAgents(
    moduleType: ModuleType,
    requiredCapabilities: string[] = [],
    workspaceId: string
  ) {
    try {
      // First check for agents that are explicitly assigned to this module type
      const assignments = await db.moduleAgentAssignment.findMany({
        where: {
          moduleType,
          isActive: true,
        },
        include: {
          agent: {
            include: {
              capabilities: true,
            },
          },
          team: {
            include: {
              members: {
                include: {
                  agent: {
                    include: {
                      capabilities: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          priority: 'desc',
        },
      });

      // Process assignments into a list of suitable agents or teams
      const suitableOptions = assignments
        .filter(assignment => {
          // If this is a team assignment, check that the team has members with the required capabilities
          if (assignment.teamId) {
            // Skip if the team doesn't exist or has no members
            if (!assignment.team || !assignment.team.members.length) return false;

            // Check if the team collectively has all required capabilities
            const teamCapabilities = new Set<string>();
            assignment.team.members.forEach(member => {
              if (member.agent?.capabilities) {
                member.agent.capabilities.forEach(cap => {
                  teamCapabilities.add(`${cap.type.toLowerCase()}_${cap.name.toLowerCase()}`);
                });
              }
            });

            return requiredCapabilities.every(cap => teamCapabilities.has(cap.toLowerCase()));
          }

          // Otherwise, check if the individual agent has the required capabilities
          if (!assignment.agent) return false;

          const agentCapabilities = new Set<string>();
          if (assignment.agent.capabilities) {
            assignment.agent.capabilities.forEach(cap => {
              agentCapabilities.add(`${cap.type.toLowerCase()}_${cap.name.toLowerCase()}`);
            });
          }

          return requiredCapabilities.every(cap => agentCapabilities.has(cap.toLowerCase()));
        })
        .map(assignment => ({
          type: assignment.teamId ? 'team' : 'agent',
          id: assignment.teamId || assignment.agentId,
          priority: assignment.priority,
          name: assignment.teamId ? assignment.team?.name : assignment.agent?.name,
          description: assignment.teamId
            ? assignment.team?.description
            : assignment.agent?.description,
        }));

      // If no explicitly assigned agents/teams found, look for agents with matching capabilities
      if (suitableOptions.length === 0 && requiredCapabilities.length > 0) {
        const agents = await db.agent.findMany({
          where: {
            workspaceId,
            status: 'ACTIVE',
          },
          include: {
            capabilities: true,
          },
        });

        const suitableAgents = agents.filter(agent => {
          const agentCapabilities = new Set<string>();
          if (agent.capabilities) {
            agent.capabilities.forEach(cap => {
              agentCapabilities.add(`${cap.type.toLowerCase()}_${cap.name.toLowerCase()}`);
            });
          }

          return requiredCapabilities.every(cap => agentCapabilities.has(cap.toLowerCase()));
        });

        suitableAgents.forEach(agent => {
          suitableOptions.push({
            type: 'agent',
            id: agent.id,
            priority: 0, // Default priority for unassigned agents
            name: agent.name,
            description: agent.description,
          });
        });

        // Also look for teams
        const teams = await db.agentTeam.findMany({
          where: {
            workspaceId,
          },
          include: {
            members: {
              include: {
                agent: {
                  include: {
                    capabilities: true,
                  },
                },
              },
            },
          },
        });

        const suitableTeams = teams.filter(team => {
          const teamCapabilities = new Set<string>();
          team.members.forEach(member => {
            if (member.agent?.capabilities) {
              member.agent.capabilities.forEach(cap => {
                teamCapabilities.add(`${cap.type.toLowerCase()}_${cap.name.toLowerCase()}`);
              });
            }
          });

          return requiredCapabilities.every(cap => teamCapabilities.has(cap.toLowerCase()));
        });

        suitableTeams.forEach(team => {
          suitableOptions.push({
            type: 'team',
            id: team.id,
            priority: 0, // Default priority for unassigned teams
            name: team.name,
            description: team.description,
          });
        });
      }

      return suitableOptions;
    } catch (error) {
      console.error('Error finding suitable agents:', error);
      throw error;
    }
  },

  /**
   * Assign an agent or team to a module
   */
  async assignAgentToModule(
    agentId: string | null,
    teamId: string | null,
    moduleType: ModuleType,
    moduleId: string | null = null,
    priority: number = 1,
    capabilities: string[] = []
  ) {
    try {
      if (!agentId && !teamId) {
        throw new Error('Either agentId or teamId must be provided');
      }

      const assignment = await db.moduleAgentAssignment.create({
        data: {
          agentId: agentId || undefined,
          teamId: teamId || undefined,
          moduleType,
          moduleId: moduleId || undefined,
          isActive: true,
          priority,
          capabilities,
        },
      });

      return assignment;
    } catch (error) {
      console.error('Error assigning agent to module:', error);
      throw error;
    }
  },

  /**
   * Remove agent or team assignment from a module
   */
  async removeAgentFromModule(assignmentId: string) {
    try {
      const result = await db.moduleAgentAssignment.update({
        where: { id: assignmentId },
        data: { isActive: false },
      });

      return result;
    } catch (error) {
      console.error('Error removing agent from module:', error);
      throw error;
    }
  },

  /**
   * Get all agents assigned to a specific module
   */
  async getAgentsForModule(moduleType: ModuleType, moduleId?: string) {
    try {
      const query = {
        where: {
          moduleType,
          isActive: true,
          ...(moduleId ? { moduleId } : {}),
        },
        include: {
          agent: true,
          team: {
            include: {
              members: {
                include: {
                  agent: true,
                },
              },
            },
          },
        },
        orderBy: {
          priority: 'desc',
        },
      };

      const assignments = await db.moduleAgentAssignment.findMany(query);

      return assignments;
    } catch (error) {
      console.error('Error getting agents for module:', error);
      throw error;
    }
  },

  /**
   * Execute a task using an appropriate agent
   */
  async executeTask(request: AgentTaskRequest): Promise<AgentTaskResult> {
    try {
      // Find suitable agents or teams
      const suitableOptions = await this.findSuitableAgents(
        request.moduleType,
        request.requiredCapabilities || [],
        request.workspaceId
      );

      if (suitableOptions.length === 0) {
        throw new Error('No suitable agents found for this task');
      }

      // Sort by priority and preference
      let sortedOptions = [...suitableOptions].sort((a, b) => b.priority - a.priority);

      // If preferred agent/team is specified, prioritize it
      if (request.preferredAgentId) {
        sortedOptions = sortedOptions.sort((a, b) => {
          if (a.type === 'agent' && a.id === request.preferredAgentId) return -1;
          if (b.type === 'agent' && b.id === request.preferredAgentId) return 1;
          return 0;
        });
      }

      if (request.preferredTeamId) {
        sortedOptions = sortedOptions.sort((a, b) => {
          if (a.type === 'team' && a.id === request.preferredTeamId) return -1;
          if (b.type === 'team' && b.id === request.preferredTeamId) return 1;
          return 0;
        });
      }

      // Get the best option
      const best = sortedOptions[0];

      // Prepare task-specific context
      const taskContext = {
        taskType: request.taskType,
        moduleType: request.moduleType,
        moduleId: request.moduleId,
        priority: request.priority || 'normal',
      };

      // Execute the task with the selected agent or team
      if (best.type === 'agent') {
        // Run the individual agent
        const runData = {
          agentId: best.id,
          input: {
            ...request.input,
            taskContext,
          },
        };

        const run = await AgentService.runAgent(runData);

        // Since runAgent is asynchronous in a real implementation,
        // we'll simulate a successful completion for demonstration
        const result: AgentTaskResult = {
          success: true,
          agentId: best.id,
          output: { message: `Task completed by agent ${best.name}`, data: {} },
          completedAt: new Date(),
          metrics: {
            executionTime: 1.2, // seconds
            tokensUsed: 250,
          },
        };

        return result;
      } else {
        // For teams, we'd implement a workflow that coordinates multiple agents
        // This is a simplified version for demonstration
        const teamMembers = await db.agentTeamMember.findMany({
          where: { teamId: best.id },
          include: { agent: true },
        });

        if (teamMembers.length === 0) {
          throw new Error('Team has no members');
        }

        // Find the lead agent or use the first one
        const leadMember = teamMembers.find(m => m.role === 'lead') || teamMembers[0];

        // Run the lead agent
        const runData = {
          agentId: leadMember.agentId,
          input: {
            ...request.input,
            taskContext,
            isTeamLead: true,
            teamContext: {
              teamId: best.id,
              teamName: best.name,
              members: teamMembers.map(m => ({
                id: m.agentId,
                name: m.agent.name,
                role: m.role,
              })),
            },
          },
        };

        const run = await AgentService.runAgent(runData);

        // Simulate team execution result
        const result: AgentTaskResult = {
          success: true,
          agentId: leadMember.agentId,
          teamId: best.id,
          output: { message: `Task completed by team ${best.name}`, data: {} },
          completedAt: new Date(),
          metrics: {
            executionTime: 2.5, // seconds
            tokensUsed: 450,
            teamMembers: teamMembers.length,
          },
        };

        return result;
      }
    } catch (error: any) {
      console.error('Error executing task:', error);

      // Return error result
      return {
        success: false,
        agentId: '',
        output: null,
        error: error.message || 'Unknown error occurred',
        completedAt: new Date(),
      };
    }
  },

  /**
   * Define a module task
   */
  async defineModuleTask(
    name: string,
    description: string,
    moduleType: ModuleType,
    requiredCapabilities: string[] = [],
    isSystem: boolean = false
  ) {
    try {
      const task = await db.moduleTaskDefinition.create({
        data: {
          name,
          description,
          moduleType,
          requiredCapabilities,
          isSystem,
          isActive: true,
        },
      });

      return task;
    } catch (error) {
      console.error('Error defining module task:', error);
      throw error;
    }
  },

  /**
   * Get all tasks defined for a module
   */
  async getModuleTasks(moduleType: ModuleType) {
    try {
      const tasks = await db.moduleTaskDefinition.findMany({
        where: {
          moduleType,
          isActive: true,
        },
      });

      return tasks;
    } catch (error) {
      console.error('Error getting module tasks:', error);
      throw error;
    }
  },

  /**
   * Generate email responses using assigned agents
   * Example of module-specific integration function
   */
  async generateEmailResponse(
    emailId: string,
    userId: string,
    workspaceId: string,
    preferredAgentId?: string
  ) {
    try {
      // Get the email content
      const email = await db.email.findUnique({
        where: { id: emailId },
        include: {
          thread: {
            include: {
              emails: {
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      });

      if (!email) {
        throw new Error('Email not found');
      }

      // Create task request
      const taskRequest: AgentTaskRequest = {
        taskType: 'generate_email_response',
        moduleType: 'email',
        moduleId: emailId,
        input: {
          emailSubject: email.subject,
          emailBody: email.body,
          threadHistory: email.thread?.emails.map(e => ({
            from: e.fromEmail,
            to: e.toEmails,
            subject: e.subject,
            body: e.body,
            sentAt: e.sentAt,
          })),
        },
        userId,
        workspaceId,
        requiredCapabilities: ['email_access'],
        preferredAgentId,
      };

      // Execute the task
      const result = await this.executeTask(taskRequest);

      return result;
    } catch (error) {
      console.error('Error generating email response:', error);
      throw error;
    }
  },

  /**
   * Qualify a lead using assigned agents
   * Another example of module-specific integration
   */
  async qualifyLead(contactId: string, userId: string, workspaceId: string, additionalInfo?: any) {
    try {
      // Get the contact information
      const contact = await db.contact.findUnique({
        where: { id: contactId },
      });

      if (!contact) {
        throw new Error('Contact not found');
      }

      // Create task request
      const taskRequest: AgentTaskRequest = {
        taskType: 'qualify_lead',
        moduleType: 'contact',
        moduleId: contactId,
        input: {
          contact: {
            name: `${contact.firstName} ${contact.lastName}`,
            email: contact.email,
            company: contact.company,
            title: contact.title,
            industry: contact.industry,
            phone: contact.phone,
            notes: contact.notes,
          },
          additionalInfo,
        },
        userId,
        workspaceId,
        requiredCapabilities: ['web_search', 'database_access'],
      };

      // Execute the task
      const result = await this.executeTask(taskRequest);

      // Update contact with qualification results if successful
      if (result.success && result.output?.qualification) {
        await db.contact.update({
          where: { id: contactId },
          data: {
            notes: contact.notes
              ? `${contact.notes}\n\n--- AI Qualification ---\n${result.output.qualification}`
              : `--- AI Qualification ---\n${result.output.qualification}`,
          },
        });
      }

      return result;
    } catch (error) {
      console.error('Error qualifying lead:', error);
      throw error;
    }
  },
};
