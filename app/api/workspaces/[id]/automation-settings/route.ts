import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { z } from 'zod';
import { automationService } from '@/lib/services/automation/automation-service';

// Schema for validation
const automationSettingsSchema = z.object({
  emailAnalysisEnabled: z.boolean().optional(),
  leadDetectionEnabled: z.boolean().optional(),
  taskExtractionEnabled: z.boolean().optional(),
  eventDetectionEnabled: z.boolean().optional(),
  responseGenEnabled: z.boolean().optional(),
  scheduledJobsEnabled: z.boolean().optional(),
  dataEnrichmentEnabled: z.boolean().optional(),
  reminderJobsEnabled: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
});

// Handler for getting workspace automation settings
export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Check if user has access to this workspace
    const membership = await db.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: user.id,
      },
    });

    if (!membership) {
      return new NextResponse(JSON.stringify({ error: 'Workspace not found or access denied' }), {
        status: 404,
      });
    }

    // Get workspace automation settings
    const settings = await automationService.getWorkspaceSettings(params.workspaceId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching workspace automation settings:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch automation settings' }), {
      status: 500,
    });
  }
}

// Handler for updating workspace automation settings
export async function PATCH(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Check if user has admin access to this workspace
    const membership = await db.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: user.id,
        role: 'admin', // Only workspace admins can update workspace settings
      },
    });

    if (!membership) {
      return new NextResponse(JSON.stringify({ error: 'Permission denied' }), {
        status: 403,
      });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = automationSettingsSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request data', details: validation.error.format() }),
        { status: 400 }
      );
    }

    // Update workspace settings
    const updatedSettings = await db.workspaceAutomationSettings.upsert({
      where: { workspaceId: params.workspaceId },
      update: validation.data,
      create: {
        workspaceId: params.workspaceId,
        ...validation.data,
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating workspace automation settings:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update automation settings' }), {
      status: 500,
    });
  }
}

// Apply authentication middleware
export const middleware = withAuth;
