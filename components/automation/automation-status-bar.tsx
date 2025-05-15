'use client';

import React from 'react';
import { EmailAutomationToggle } from '@/components/automation/email-automation-components';
import { JobAutomationToggle } from '@/components/automation/job-automation-components';
import { useAutomation } from '@/context/automation-context';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AutomationStatusBar() {
  const { settings, isLoading } = useAutomation();

  if (isLoading) {
    return (
      <div className="w-full bg-muted py-2 px-4 flex items-center justify-center text-sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Loading automation settings...</span>
      </div>
    );
  }

  // Check if all automation is disabled
  const allDisabled =
    !settings.emailAnalysisEnabled &&
    !settings.leadDetectionEnabled &&
    !settings.taskExtractionEnabled &&
    !settings.eventDetectionEnabled &&
    !settings.responseGenEnabled &&
    !settings.scheduledJobsEnabled &&
    !settings.dataEnrichmentEnabled &&
    !settings.reminderJobsEnabled;

  if (allDisabled) {
    return (
      <div className="w-full bg-yellow-50 border-b border-yellow-200 py-2 px-4 flex items-center justify-between text-sm">
        <div className="flex items-center">
          <Badge
            variant="outline"
            className="mr-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            Automation Off
          </Badge>
          <span className="text-yellow-800">All automations are currently disabled</span>
        </div>
        <Link href="/settings/automation">
          <Button variant="ghost" size="sm" className="text-yellow-800">
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-muted py-2 px-4 flex flex-wrap items-center justify-between text-sm">
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <Badge
            variant="outline"
            className={`mr-2 ${
              settings.emailAnalysisEnabled
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {settings.emailAnalysisEnabled ? 'On' : 'Off'}
          </Badge>
          <EmailAutomationToggle />
        </div>

        <div className="flex items-center">
          <Badge
            variant="outline"
            className={`mr-2 ${
              settings.scheduledJobsEnabled
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {settings.scheduledJobsEnabled ? 'On' : 'Off'}
          </Badge>
          <JobAutomationToggle />
        </div>
      </div>

      <Link href="/settings/automation">
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4 mr-1" />
          Advanced Settings
        </Button>
      </Link>
    </div>
  );
}
