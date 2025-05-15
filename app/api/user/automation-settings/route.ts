import { NextResponse } from 'next/server';
import { automationService } from '@/lib/services/automation/automation-service';
import { getCurrentUser } from '@/lib/session';

// GET /api/user/automation-settings
// Get current user's automation settings
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const settings = await automationService.getUserSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching automation settings:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch automation settings' }), {
      status: 500,
    });
  }
}

// PATCH /api/user/automation-settings
// Update user automation settings
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const body = await req.json();
    const updatedSettings = await automationService.updateUserSettings(body);

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating automation settings:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update automation settings' }), {
      status: 500,
    });
  }
}
