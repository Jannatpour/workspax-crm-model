// src/lib/services/email-ai-service.ts

import { AgentService } from './agent-service';
import { AiService } from './ai-service';
import { db } from '@/lib/db';
import {
  AIProcessingStatus,
  AIReviewStatus,
  LeadStatus,
  NotificationType,
  NotificationPriority,
  TaskPriority,
} from '@prisma/client';

export interface EmailAnalysisParams {
  emailId: string;
  fullText?: boolean;
  processAttachments?: boolean;
  detectLeads?: boolean;
  extractTasks?: boolean;
  extractEvents?: boolean;
  generateResponse?: boolean;
  userId: string;
  workspaceId: string;
}

export interface ResponseGenerationParams {
  emailId: string;
  tone?: 'professional' | 'friendly' | 'formal' | 'casual' | 'persuasive';
  includeGreeting?: boolean;
  includeSignature?: boolean;
  referencePreviousEmails?: boolean;
  responseType?: 'full' | 'points' | 'acknowledge';
  userId: string;
}

export interface LeadExtractionResult {
  detected: boolean;
  confidence: number;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  position?: string;
  leadType?: string;
  value?: number;
  notes?: string;
}

export interface TaskExtractionResult {
  title: string;
  description: string;
  dueDate?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignTo?: string;
}

export interface EventExtractionResult {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  allDay: boolean;
  location?: string;
  virtual: boolean;
  meetingLink?: string;
  attendees?: Array<{ name?: string; email: string }>;
}

export class EmailAIService {
  private static agentService = new AgentService();
  private static aiService = new AiService();

  /**
   * Analyzes an email using AI to extract important information
   */
  public static async analyzeEmail(params: EmailAnalysisParams): Promise<string> {
    try {
      // Create initial analysis record
      const analysis = await db.emailAIAnalysis.create({
        data: {
          emailId: params.emailId,
          processingStatus: AIProcessingStatus.PROCESSING,
        },
      });

      // Fetch the email with necessary relations
      const email = await db.email.findUnique({
        where: { id: params.emailId },
        include: {
          attachments: true,
          contact: true,
          thread: {
            include: {
              emails: {
                orderBy: { sentAt: 'desc' },
                take: 5,
              },
            },
          },
        },
      });

      if (!email) {
        throw new Error('Email not found');
      }

      // Find the best agent for email analysis
      const agent = await this.getBestEmailAnalysisAgent(params.workspaceId);

      if (!agent) {
        throw new Error('No suitable agent found for email analysis');
      }

      // Generate AI context from the email
      const emailContext = this.generateEmailAnalysisContext(email, params);

      // Run the AI analysis
      const analysisResult = await this.agentService.runAgent({
        agentId: agent.id,
        input: {
          type: 'email_analysis',
          email: emailContext,
          options: {
            detectLeads: params.detectLeads,
            extractTasks: params.extractTasks,
            extractEvents: params.extractEvents,
            generateResponse: params.generateResponse,
          },
        },
        userId: params.userId,
        conversationId: null,
      });

      // Process and save the results
      await this.processAnalysisResults(analysis.id, analysisResult, params);

      return analysis.id;
    } catch (error) {
      console.error('Error analyzing email:', error);

      // Update analysis record with error
      await db.emailAIAnalysis.update({
        where: { id: params.emailId },
        data: {
          processingStatus: AIProcessingStatus.FAILED,
          processingErrors: error.message || 'Unknown error during email analysis',
        },
      });

      throw error;
    }
  }

  /**
   * Generates an AI response to an email
   */
  public static async generateEmailResponse(params: ResponseGenerationParams): Promise<string> {
    try {
      // Fetch the email and its analysis
      const email = await db.email.findUnique({
        where: { id: params.emailId },
        include: {
          aiAnalysis: true,
          thread: {
            include: {
              emails: {
                orderBy: { sentAt: 'desc' },
                take: 5,
              },
            },
          },
          contact: true,
        },
      });

      if (!email) {
        throw new Error('Email not found');
      }

      // If we already have a suggested response and it's not a specialized request, return it
      if (
        email.aiAnalysis?.suggestedResponse &&
        params.tone === 'professional' &&
        params.responseType === 'full'
      ) {
        return email.aiAnalysis.suggestedResponse;
      }

      // Find the best agent for response generation
      const agent = await this.getBestEmailResponseAgent(params.userId);

      if (!agent) {
        throw new Error('No suitable agent found for email response generation');
      }

      // Generate context for response generation
      const responseContext = this.generateResponseContext(email, params);

      // Run the AI for response generation
      const responseResult = await this.agentService.runAgent({
        agentId: agent.id,
        input: {
          type: 'email_response',
          email: responseContext,
          options: {
            tone: params.tone || 'professional',
            includeGreeting: params.includeGreeting ?? true,
            includeSignature: params.includeSignature ?? true,
            responseType: params.responseType || 'full',
          },
        },
        userId: params.userId,
        conversationId: null,
      });

      // Extract the response from the result
      const generatedResponse = responseResult.output?.response || '';

      // Update the analysis with the generated response if it exists
      if (email.aiAnalysis) {
        await db.emailAIAnalysis.update({
          where: { id: email.aiAnalysis.id },
          data: {
            suggestedResponse: generatedResponse,
          },
        });
      }

      return generatedResponse;
    } catch (error) {
      console.error('Error generating email response:', error);
      throw error;
    }
  }

  /**
   * Creates a lead from email analysis
   */
  public static async createLeadFromEmail(
    analysisId: string,
    leadData: LeadExtractionResult
  ): Promise<string> {
    try {
      const lead = await db.emailLead.create({
        data: {
          emailAnalysisId: analysisId,
          name: leadData.name || 'Unknown',
          company: leadData.company,
          email: leadData.email || 'unknown@example.com',
          phone: leadData.phone,
          website: leadData.website,
          position: leadData.position,
          leadType: leadData.leadType,
          value: leadData.value,
          confidence: leadData.confidence,
          notes: leadData.notes,
          status: LeadStatus.NEW,
        },
      });

      // Create notification for the lead
      const analysis = await db.emailAIAnalysis.findUnique({
        where: { id: analysisId },
        include: { email: true },
      });

      if (analysis?.email?.userId) {
        await db.emailNotification.create({
          data: {
            emailAnalysisId: analysisId,
            userId: analysis.email.userId,
            type: NotificationType.LEAD_DETECTED,
            title: 'New Lead Detected',
            content: `A new lead (${leadData.name || 'Unknown'} from ${
              leadData.company || 'Unknown Company'
            }) was detected in your email.`,
            priority: NotificationPriority.HIGH,
            actionType: 'view_lead',
          },
        });
      }

      return lead.id;
    } catch (error) {
      console.error('Error creating lead from email:', error);
      throw error;
    }
  }

  /**
   * Creates tasks from email analysis
   */
  public static async createTasksFromEmail(
    analysisId: string,
    tasks: TaskExtractionResult[]
  ): Promise<string[]> {
    try {
      const taskIds: string[] = [];
      const analysis = await db.emailAIAnalysis.findUnique({
        where: { id: analysisId },
        include: { email: true },
      });

      if (!analysis) {
        throw new Error('Analysis not found');
      }

      for (const task of tasks) {
        const createdTask = await db.emailTask.create({
          data: {
            emailAnalysisId: analysisId,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority as TaskPriority,
            assignedTo: task.assignTo || analysis.email?.userId,
          },
        });

        taskIds.push(createdTask.id);

        // Create notification for the task if it's high priority
        if (task.priority === 'HIGH' || task.priority === 'URGENT') {
          await db.emailNotification.create({
            data: {
              emailAnalysisId: analysisId,
              userId: analysis.email?.userId,
              type: NotificationType.TASK_CREATED,
              title: `${task.priority} Priority Task Created`,
              content: `"${
                task.title
              }" was extracted from your email as a ${task.priority.toLowerCase()} priority task.`,
              priority:
                task.priority === 'URGENT'
                  ? NotificationPriority.URGENT
                  : NotificationPriority.HIGH,
              actionType: 'view_task',
            },
          });
        }
      }

      return taskIds;
    } catch (error) {
      console.error('Error creating tasks from email:', error);
      throw error;
    }
  }

  /**
   * Creates events from email analysis
   */
  public static async createEventsFromEmail(
    analysisId: string,
    events: EventExtractionResult[]
  ): Promise<string[]> {
    try {
      const eventIds: string[] = [];
      const analysis = await db.emailAIAnalysis.findUnique({
        where: { id: analysisId },
        include: { email: true },
      });

      if (!analysis) {
        throw new Error('Analysis not found');
      }

      for (const event of events) {
        const createdEvent = await db.emailEvent.create({
          data: {
            emailAnalysisId: analysisId,
            title: event.title,
            description: event.description,
            startTime: event.startTime,
            endTime: event.endTime,
            allDay: event.allDay,
            location: event.location,
            virtual: event.virtual,
            meetingLink: event.meetingLink,
            attendees: event.attendees ? JSON.stringify(event.attendees) : null,
          },
        });

        eventIds.push(createdEvent.id);

        // Create notification for the event
        if (analysis.email?.userId) {
          const isUpcoming = event.startTime < new Date(Date.now() + 48 * 60 * 60 * 1000); // within 48 hours

          await db.emailNotification.create({
            data: {
              emailAnalysisId: analysisId,
              userId: analysis.email.userId,
              type: NotificationType.EVENT_CREATED,
              title: `${isUpcoming ? 'Upcoming ' : ''}Event Detected: ${event.title}`,
              content: `Event on ${event.startTime.toLocaleString()} was detected in your email.`,
              priority: isUpcoming ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
              actionType: 'view_event',
            },
          });
        }
      }

      return eventIds;
    } catch (error) {
      console.error('Error creating events from email:', error);
      throw error;
    }
  }

  /**
   * Marks an email as requiring attention
   */
  public static async markEmailForAttention(analysisId: string, reason: string): Promise<void> {
    try {
      const analysis = await db.emailAIAnalysis.findUnique({
        where: { id: analysisId },
        include: { email: true },
      });

      if (!analysis) {
        throw new Error('Analysis not found');
      }

      // Update the analysis to require attention
      await db.emailAIAnalysis.update({
        where: { id: analysisId },
        data: {
          requiresAttention: true,
          attentionReason: reason,
        },
      });

      // Create notification for urgent attention
      if (analysis.email?.userId) {
        await db.emailNotification.create({
          data: {
            emailAnalysisId: analysisId,
            userId: analysis.email.userId,
            type: NotificationType.URGENT_EMAIL,
            title: 'Email Requires Attention',
            content: `An email requires your urgent attention: ${reason}`,
            priority: NotificationPriority.URGENT,
            actionType: 'view_email',
          },
        });
      }
    } catch (error) {
      console.error('Error marking email for attention:', error);
      throw error;
    }
  }

  // Helper methods
  private static async getBestEmailAnalysisAgent(workspaceId: string) {
    // Find agents with email analysis capability
    const agents = await db.agent.findMany({
      where: {
        workspaceId,
        status: 'ACTIVE',
        capabilities: {
          some: {
            type: 'EMAIL_ANALYSIS',
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
      take: 1,
    });

    return agents[0] || null;
  }

  private static async getBestEmailResponseAgent(userId: string) {
    // Try to find user's preferred agent first
    const userPrefs = await db.userAIPreferences.findUnique({
      where: { userId },
      include: { defaultAgent: true },
    });

    if (userPrefs?.defaultAgent) {
      return userPrefs.defaultAgent;
    }

    // Otherwise find any agent with response generation capability
    const agents = await db.agent.findMany({
      where: {
        capabilities: {
          some: {
            type: 'RESPONSE_GENERATION',
          },
        },
        status: 'ACTIVE',
      },
      orderBy: {
        rating: 'desc',
      },
      take: 1,
    });

    return agents[0] || null;
  }

  private static generateEmailAnalysisContext(email: any, params: EmailAnalysisParams) {
    // Build a rich context object for the AI
    return {
      id: email.id,
      subject: email.subject,
      body: email.body,
      bodyText: email.bodyText || '',
      fromEmail: email.fromEmail,
      toEmails: email.toEmails,
      sentAt: email.sentAt,
      receivedAt: email.receivedAt,
      isImportant: email.isImportant,
      attachments: email.attachments.map(a => ({
        filename: a.filename,
        mimeType: a.mimeType,
        size: a.size,
      })),
      contact: email.contact
        ? {
            id: email.contact.id,
            name: `${email.contact.firstName} ${email.contact.lastName}`,
            company: email.contact.company,
            title: email.contact.title,
          }
        : null,
      thread: email.thread
        ? {
            id: email.thread.id,
            subject: email.thread.subject,
            recentEmails: email.thread.emails.map(e => ({
              id: e.id,
              fromEmail: e.fromEmail,
              subject: e.subject,
              bodyText: e.bodyText || '',
              sentAt: e.sentAt,
            })),
          }
        : null,
      analysisOptions: {
        fullText: params.fullText || false,
        processAttachments: params.processAttachments || false,
        detectLeads: params.detectLeads || true,
        extractTasks: params.extractTasks || true,
        extractEvents: params.extractEvents || true,
        generateResponse: params.generateResponse || true,
      },
    };
  }

  private static generateResponseContext(email: any, params: ResponseGenerationParams) {
    // Build a context object for response generation
    return {
      id: email.id,
      subject: email.subject,
      body: email.body,
      bodyText: email.bodyText || '',
      fromEmail: email.fromEmail,
      toEmails: email.toEmails,
      sentAt: email.sentAt,
      receivedAt: email.receivedAt,
      contact: email.contact
        ? {
            id: email.contact.id,
            name: `${email.contact.firstName} ${email.contact.lastName}`,
            company: email.contact.company,
            title: email.contact.title,
          }
        : null,
      thread: email.thread
        ? {
            id: email.thread.id,
            subject: email.thread.subject,
            recentEmails: email.thread.emails.map(e => ({
              id: e.id,
              fromEmail: e.fromEmail,
              subject: e.subject,
              bodyText: e.bodyText || '',
              sentAt: e.sentAt,
            })),
          }
        : null,
      analysis: email.aiAnalysis
        ? {
            sentiment: email.aiAnalysis.sentiment,
            intent: email.aiAnalysis.intent,
            urgency: email.aiAnalysis.urgency,
            summary: email.aiAnalysis.summary,
            keyPoints: email.aiAnalysis.keyPoints,
          }
        : null,
      responseOptions: {
        tone: params.tone || 'professional',
        includeGreeting: params.includeGreeting ?? true,
        includeSignature: params.includeSignature ?? true,
        referencePreviousEmails: params.referencePreviousEmails ?? true,
        responseType: params.responseType || 'full',
      },
    };
  }

  private static async processAnalysisResults(
    analysisId: string,
    results: any,
    params: EmailAnalysisParams
  ) {
    // Extract data from AI results
    const output = results.output || {};

    // Update the analysis record with the extracted information
    await db.emailAIAnalysis.update({
      where: { id: analysisId },
      data: {
        sentiment: output.sentiment,
        intent: output.intent,
        urgency: output.urgency,
        summary: output.summary,
        keyPoints: output.keyPoints || [],
        detectedEntities: output.entities || {},
        suggestedTags: output.tags || [],
        suggestedResponse: output.suggestedResponse,
        actionItems: output.actionItems || {},
        languageDetected: output.language,
        confidence: output.confidence || 0.7,
        requiresAttention: output.requiresAttention || false,
        attentionReason: output.attentionReason,
        processingStatus: AIProcessingStatus.COMPLETED,
        processingTime: output.processingTime || 0,
        reviewStatus: AIReviewStatus.PENDING,
      },
    });

    // Process leads if detected
    if (params.detectLeads && output.lead && output.lead.detected) {
      await this.createLeadFromEmail(analysisId, output.lead);
    }

    // Process tasks if extracted
    if (params.extractTasks && output.tasks && output.tasks.length > 0) {
      await this.createTasksFromEmail(analysisId, output.tasks);
    }

    // Process events if extracted
    if (params.extractEvents && output.events && output.events.length > 0) {
      await this.createEventsFromEmail(analysisId, output.events);
    }

    // Mark for attention if needed
    if (output.requiresAttention && output.attentionReason) {
      await this.markEmailForAttention(analysisId, output.attentionReason);
    }
  }
}
