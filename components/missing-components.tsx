'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/dashboard-context';
import { ArrowLeft } from 'lucide-react';

// Utility function to create placeholder components
function createPlaceholderComponent(
  title: string,
  description: string = 'This feature is coming soon'
) {
  return function PlaceholderComponent() {
    const { goBack, canGoBack } = useDashboard();

    return (
      <div className="space-y-4">
        {canGoBack && (
          <Button variant="ghost" onClick={goBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/40 rounded-lg">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary text-2xl">✨</span>
                </div>
                <h3 className="text-lg font-medium mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground max-w-md">{description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
}

// Missing Mail Components
export const MailInsights = createPlaceholderComponent(
  'Email Insights',
  'AI-powered analytics for your emails'
);
export const MailAttention = createPlaceholderComponent(
  'Needs Attention',
  'Emails that require your attention'
);

// Leads Components
export const LeadsOverview = createPlaceholderComponent('Leads', 'Manage your sales leads');
export const LeadsNew = ({ isCreate = false }: { isCreate?: boolean }) =>
  createPlaceholderComponent(
    isCreate ? 'Create New Lead' : 'New Leads',
    isCreate ? 'Add a new sales lead to your pipeline' : 'View your new leads'
  )();
export const LeadsQualified = createPlaceholderComponent(
  'Qualified Leads',
  'View your qualified leads'
);
export const LeadsContacted = createPlaceholderComponent(
  'Contacted Leads',
  "View leads you've contacted"
);
export const LeadsEmail = createPlaceholderComponent('Email Leads', 'Leads from email campaigns');
export const LeadsHot = createPlaceholderComponent('Hot Leads', 'View your high-priority leads');

// Missing Template Components
export const TemplatesEmailMarketing = createPlaceholderComponent(
  'Marketing Email Templates',
  'Email templates for marketing campaigns'
);
export const TemplatesEmailNewsletters = createPlaceholderComponent(
  'Newsletter Templates',
  'Email templates for newsletters'
);
export const TemplatesEmailOnboarding = createPlaceholderComponent(
  'Onboarding Email Templates',
  'Email templates for customer onboarding'
);
export const TemplatesEmailTransactional = createPlaceholderComponent(
  'Transactional Email Templates',
  'Email templates for transactions'
);
export const TemplatesEmailNotifications = createPlaceholderComponent(
  'Notification Email Templates',
  'Email templates for notifications'
);

// Missing Agent Component
export const AgentsEmail = createPlaceholderComponent(
  'Email Agents',
  'AI agents for email processing'
);

// Workflow Components
export const WorkflowsMy = createPlaceholderComponent(
  'My Workflows',
  'View and manage your personal workflows'
);
export const WorkflowsAutomations = createPlaceholderComponent(
  'Automations',
  'Manage your workflow automations'
);
export const WorkflowsTemplates = createPlaceholderComponent(
  'Workflow Templates',
  'Browse workflow templates'
);
export const WorkflowsCreate = createPlaceholderComponent(
  'Create Workflow',
  'Create a new workflow'
);

// Notifications Components
export const NotificationsOverview = createPlaceholderComponent(
  'Notifications',
  'View all notifications'
);
export const NotificationsLeads = createPlaceholderComponent(
  'Lead Notifications',
  'Notifications related to leads'
);
export const NotificationsTasks = createPlaceholderComponent(
  'Task Notifications',
  'Notifications related to tasks'
);
export const NotificationsEvents = createPlaceholderComponent(
  'Event Notifications',
  'Notifications related to events'
);
export const NotificationsUrgent = createPlaceholderComponent(
  'Urgent Notifications',
  'High-priority notifications'
);

// Missing Settings Components
export const SettingsWorkspace = createPlaceholderComponent(
  'Workspace Settings',
  'Manage workspace settings'
);
export const SettingsAI = createPlaceholderComponent('AI Settings', 'Manage AI settings');
export const SettingsProfile = createPlaceholderComponent(
  'Profile Settings',
  'Manage your profile'
);
export const SettingsIntegrations = createPlaceholderComponent(
  'Integrations',
  'Manage integrations'
);
export const SettingsNotifications = createPlaceholderComponent(
  'Notification Settings',
  'Manage notification settings'
);
