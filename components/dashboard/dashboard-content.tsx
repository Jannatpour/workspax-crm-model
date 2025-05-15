'use client';
import React, { useEffect } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';

// Mail components
import { MailInbox } from '@/components/mail/mail-inbox';
import { MailSent } from '@/components/mail/mail-sent';
import { MailDrafts } from '@/components/mail/mail-drafts';
import { MailTrash } from '@/components/mail/mail-trash';
import { MailCompose } from '@/components/mail/mail-compose';
import { MailImportant } from '@/components/mail/mail-important';
// import { MailInsights } from '@/components/mail/mailinsights';
// import { MailAttention } from '@/components/mail/mail-attention';

// Contact components
import { ContactsOverview } from '@/components/contacts/contacts-overview';
import { ContactsImport } from '@/components/contacts/contacts-import';

// Leads components
// import { LeadsOverview } from '@/components/leads/leads-overview';
// import { LeadsNew } from '@/components/leads/leads-new';
// import { LeadsQualified } from '@/components/leads/leads-qualified';
// import { LeadsContacted } from '@/components/leads/leads-contacted';
// import { LeadsEmail } from '@/components/leads/leads-email';
// import { LeadsHot } from '@/components/leads/leads-hot';

// Template components - Using your existing naming convention
import { TemplatesOverview } from '@/components/templates/TemplatesOverview';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { TemplateCategories } from '@/components/templates/TemplateCategories';
import { PresetSelector } from '@/components/templates/PresetSelector';

// Import for templates-email if it exists
import TemplatesEmail from '@/components/templates/templates-email';

// Template email subsection components
// import { TemplatesEmailMarketing } from '@/components/templates/templates-email-marketing';
// import { TemplatesEmailNewsletters } from '@/components/templates/templates-email-newsletters';
// import { TemplatesEmailOnboarding } from '@/components/templates/templates-email-onboarding';
// import { TemplatesEmailTransactional } from '@/components/templates/templates-email-transactional';
// import { TemplatesEmailNotifications } from '@/components/templates/templates-email-notifications';

// Agent components
import { AgentsOverview } from '@/components/agents/agents-overview';
import { AgentsTeams } from '@/components/agents/agents-teams';
import { AgentsTraining } from '@/components/agents/agents-training';
import { AgentsMy } from '@/components/agents/agents-my';
// import { AgentsEmail } from '@/components/agents/agents-email';

// Workflow components
// import { WorkflowsOverview } from '@/components/workflows/workflows-overview';
// import { WorkflowsMy } from '@/components/workflows/workflows-my';
// import { WorkflowsAutomations } from '@/components/workflows/workflows-automations';
// import { WorkflowsTemplates } from '@/components/workflows/workflows-templates';
// import { WorkflowsCreate } from '@/components/workflows/workflows-create';

// Notification components
// import { NotificationsOverview } from '@/components/notifications/notifications-overview';
// import { NotificationsLeads } from '@/components/notifications/notifications-leads';
// import { NotificationsTasks } from '@/components/notifications/notifications-tasks';
// import { NotificationsEvents } from '@/components/notifications/notifications-events';
// import { NotificationsUrgent } from '@/components/notifications/notifications-urgent';

// Settings components
import { SettingsOverview } from '@/components/settings/settings-overview';
import { SettingsWorkspace } from '@/components/workspace/workspace-settings';
import { SettingsEmail } from '@/components/settings/settings-email';
// import { SettingsAI } from '@/components/settings/settings-ai';
// import { SettingsProfile } from '@/components/settings/settings-profile';
// import { SettingsIntegrations } from '@/components/settings/settings-integrations';
// import { SettingsNotifications } from '@/components/settings/settings-notifications';

export function DashboardContent() {
  const { currentSection, sectionParams, changeSection } = useDashboard();

  // Debug logging
  useEffect(() => {
    console.log('DashboardContent - Current section:', currentSection, 'Params:', sectionParams);
  }, [currentSection, sectionParams]);

  // Define the content to render based on the current section
  const renderContent = () => {
    console.log('Rendering content for section:', currentSection);

    switch (currentSection) {
      case 'overview':
        return <DashboardOverview />;

      // Mail sections
      case 'mail-inbox':
        return <MailInbox />;
      case 'mail-sent':
        return <MailSent />;
      case 'mail-drafts':
        return <MailDrafts />;
      case 'mail-trash':
        return <MailTrash />;
      case 'mail-compose':
        return <MailCompose />;
      case 'mail-important':
        return <MailImportant />;
      case 'mail-insights':
        return <MailInsights />;
      case 'mail-attention':
        return <MailAttention />;

      // Contact sections
      case 'contacts':
        return <ContactsOverview />;
      case 'contacts-import':
        return <ContactsImport />;

      // Leads sections
      case 'leads':
        if (sectionParams?.action === 'create') {
          return <LeadsNew isCreate={true} />;
        }
        return <LeadsOverview />;
      case 'leads-new':
        return <LeadsNew />;
      case 'leads-qualified':
        return <LeadsQualified />;
      case 'leads-contacted':
        return <LeadsContacted />;
      case 'leads-email':
        return <LeadsEmail />;
      case 'leads-hot':
        return <LeadsHot />;

      // Template sections
      case 'templates':
        if (sectionParams?.action === 'create') {
          console.log('Redirecting to template editor from templates route with create action');
          setTimeout(() => changeSection('templates-create'), 0);
          return <div>Redirecting to template editor...</div>;
        }
        return <TemplatesOverview />;

      case 'templates-email':
        if (sectionParams?.action === 'create') {
          console.log('Rendering template editor with create action from templates-email');
          return <TemplateEditor currentTemplate={null} />;
        } else if (sectionParams?.templateId) {
          console.log('Editing template with ID:', sectionParams.templateId);
          return <TemplateEditor templateId={sectionParams.templateId} />;
        }
        return <TemplatesEmail />;

      // Email template subsections
      case 'templates-email-marketing':
        return <TemplatesEmailMarketing />;
      case 'templates-email-newsletters':
        return <TemplatesEmailNewsletters />;
      case 'templates-email-onboarding':
        return <TemplatesEmailOnboarding />;
      case 'templates-email-transactional':
        return <TemplatesEmailTransactional />;
      case 'templates-email-notifications':
        return <TemplatesEmailNotifications />;

      case 'templates-create':
        console.log('Rendering template editor from templates-create route');
        return <TemplateEditor currentTemplate={null} />;

      case 'templates-library':
        return <TemplateLibrary />;

      case 'templates-categories':
        return <TemplateCategories />;

      case 'templates-presets':
        return (
          <PresetSelector
            onSelectPreset={preset => {
              changeSection('templates-create', { presetId: preset.id });
            }}
            onStartFromScratch={() => {
              changeSection('templates-create');
            }}
            onCancel={() => {
              changeSection('templates');
            }}
          />
        );

      // Agent sections
      case 'agents':
        return <AgentsOverview />;
      case 'agents-my':
        return <AgentsMy />;
      case 'agents-teams':
        return <AgentsTeams />;
      case 'agents-training':
        return <AgentsTraining />;
      case 'agents-email':
        return <AgentsEmail />;

      // Workflow sections
      case 'workflows':
        return <WorkflowsOverview />;
      case 'workflows-my':
        return <WorkflowsMy />;
      case 'workflows-automations':
        return <WorkflowsAutomations />;
      case 'workflows-templates':
        return <WorkflowsTemplates />;
      case 'workflows-create':
        return <WorkflowsCreate />;

      // Notification sections
      case 'notifications':
        return <NotificationsOverview />;
      case 'notifications-leads':
        return <NotificationsLeads />;
      case 'notifications-tasks':
        return <NotificationsTasks />;
      case 'notifications-events':
        return <NotificationsEvents />;
      case 'notifications-urgent':
        return <NotificationsUrgent />;

      // Settings sections
      case 'settings':
        return <SettingsOverview />;
      case 'settings-workspace':
        return <SettingsWorkspace />;
      case 'settings-email':
        return <SettingsEmail />;
      case 'settings-ai':
        return <SettingsAI />;
      case 'settings-profile':
        return <SettingsProfile />;
      case 'settings-integrations':
        return <SettingsIntegrations />;
      case 'settings-notifications':
        return <SettingsNotifications />;

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 bg-muted rounded-lg">
              <h2 className="text-2xl font-semibold mb-2">Section Not Found</h2>
              <p className="text-muted-foreground">
                The section "{currentSection}" is not available or still under development.
              </p>
              <button
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                onClick={() => changeSection('overview')}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return <div className="p-6 h-full overflow-auto">{renderContent()}</div>;
}
