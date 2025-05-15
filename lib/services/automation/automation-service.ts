'use client';

import { prisma } from '@/lib/db/prisma-client';
import { getCurrentUser } from '@/lib/auth/client';
import { AutomationSettings } from '@/context/automation-context';

interface AutomationService {
  getUserSettings(): Promise<AutomationSettings>;
  updateUserSettings(settings: Partial<AutomationSettings>): Promise<AutomationSettings>;
  getWorkspaceSettings(workspaceId: string): Promise<any>;
  isFeatureEnabled(
    feature: keyof AutomationSettings,
    userId?: string,
    workspaceId?: string
  ): Promise<boolean>;
  logAutomationJob(options: LogJobOptions): Promise<any>;
}

interface LogJobOptions {
  jobType: string;
  status: string;
  workspaceId: string;
  userId?: string;
  emailId?: string;
  metadata?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  success?: boolean;
}

export class AutomationServiceImpl implements AutomationService {
  /**
   * Get automation settings for the current user
   */
  async getUserSettings(): Promise<AutomationSettings> {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Find existing settings or create default ones
    let settings = await prisma.userAutomationSettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.userAutomationSettings.create({
        data: {
          userId: user.id,
          // Default values will be provided by the schema
        },
      });
    }

    return {
      emailAnalysisEnabled: settings.emailAnalysisEnabled,
      leadDetectionEnabled: settings.leadDetectionEnabled,
      taskExtractionEnabled: settings.taskExtractionEnabled,
      eventDetectionEnabled: settings.eventDetectionEnabled,
      responseGenEnabled: settings.responseGenEnabled,
      scheduledJobsEnabled: settings.scheduledJobsEnabled,
      dataEnrichmentEnabled: settings.dataEnrichmentEnabled,
      reminderJobsEnabled: settings.reminderJobsEnabled,
      notificationsEnabled: settings.notificationsEnabled,
    };
  }

  /**
   * Update user automation settings
   */
  async updateUserSettings(settings: Partial<AutomationSettings>): Promise<AutomationSettings> {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const updatedSettings = await prisma.userAutomationSettings.upsert({
      where: { userId: user.id },
      update: settings,
      create: {
        userId: user.id,
        ...settings,
      },
    });

    return {
      emailAnalysisEnabled: updatedSettings.emailAnalysisEnabled,
      leadDetectionEnabled: updatedSettings.leadDetectionEnabled,
      taskExtractionEnabled: updatedSettings.taskExtractionEnabled,
      eventDetectionEnabled: updatedSettings.eventDetectionEnabled,
      responseGenEnabled: updatedSettings.responseGenEnabled,
      scheduledJobsEnabled: updatedSettings.scheduledJobsEnabled,
      dataEnrichmentEnabled: updatedSettings.dataEnrichmentEnabled,
      reminderJobsEnabled: updatedSettings.reminderJobsEnabled,
      notificationsEnabled: updatedSettings.notificationsEnabled,
    };
  }

  /**
   * Get workspace-level automation settings
   */
  async getWorkspaceSettings(workspaceId: string): Promise<any> {
    const settings = await prisma.workspaceAutomationSettings.findUnique({
      where: { workspaceId },
    });

    if (!settings) {
      // Create default workspace settings
      return prisma.workspaceAutomationSettings.create({
        data: {
          workspaceId,
          // Default values from schema
        },
      });
    }

    return settings;
  }

  /**
   * Check if a specific automation feature is enabled
   * Checks both user and workspace settings
   */
  async isFeatureEnabled(
    feature: keyof AutomationSettings,
    userId?: string,
    workspaceId?: string
  ): Promise<boolean> {
    // If no IDs provided, get current user
    if (!userId) {
      const user = await getCurrentUser();
      if (!user) return false;
      userId = user.id;

      // Get user's active workspace if not provided
      if (!workspaceId) {
        const userWithWorkspace = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            workspaceMemberships: {
              take: 1,
              include: { workspace: true },
            },
          },
        });
        workspaceId = userWithWorkspace?.workspaceMemberships[0]?.workspaceId;
      }
    }

    if (!workspaceId) {
      return false;
    }

    // Get user settings
    const userSettings = await prisma.userAutomationSettings.findUnique({
      where: { userId },
    });

    // Get workspace settings
    const workspaceSettings = await prisma.workspaceAutomationSettings.findUnique({
      where: { workspaceId },
    });

    // User settings override workspace settings if they exist
    if (userSettings && feature in userSettings) {
      return userSettings[feature as keyof typeof userSettings] as boolean;
    }

    // Fall back to workspace settings
    if (workspaceSettings && feature in workspaceSettings) {
      return workspaceSettings[feature as keyof typeof workspaceSettings] as boolean;
    }

    // Default to enabled if no settings found
    return true;
  }

  /**
   * Log an automation job execution
   */
  async logAutomationJob(options: LogJobOptions): Promise<any> {
    const {
      jobType,
      status,
      workspaceId,
      userId,
      emailId,
      metadata = {},
      error,
      startTime,
      endTime,
      duration,
      success,
    } = options;

    return prisma.automationJobLog.create({
      data: {
        jobType,
        status,
        workspaceId,
        userId,
        emailId,
        metadata,
        error,
        startTime,
        endTime,
        duration,
        success,
      },
    });
  }
}

// Singleton instance
export const automationService = new AutomationServiceImpl();
