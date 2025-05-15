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
import { MailInsights } from '@/components/mail/MailInsights';
import { MailAttention } from '@/components/mail/mail-attention';

// Contact components
import { ContactsOverview } from '@/components/contacts/contacts-overview';
import { ContactsImport } from '@/components/contacts/contacts-import';

// Template components
import { TemplatesOverview } from '@/components/templates/TemplatesOverview';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { TemplateCategories } from '@/components/templates/TemplateCategories';
import { PresetSelector } from '@/components/templates/PresetSelector';

// Import for templates-email if it exists
import TemplatesEmail from '@/components/templates/templates-email';

// Agent components
import { AgentsOverview } from '@/components/agents/agents-overview';
import { AgentsTeams } from '@/components/agents/agents-teams';
import { AgentsTraining } from '@/components/agents/agents-training';
import { AgentsMy } from '@/components/agents/agents-my';

// Settings components
import { SettingsOverview } from '@/components/settings/settings-overview';
import { SettingsWorkspace } from '@/components/workspace/workspace-settings';
import { SettingsEmail } from '@/components/settings/settings-email';

// Define types for the section parameters
interface SectionParams {
  action?: string;
  templateId?: string;
  presetId?: string;
}

// Define type for preset
interface Preset {
  id: string;
  [key: string]: any;
}

// Create placeholder component
const PlaceholderComponent = ({ title }: { title: string }) => (
  <div className="p-6 bg-muted rounded-lg">{title} (Coming Soon)</div>
);

export function DashboardContent(): JSX.Element {
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
        if ((sectionParams as SectionParams)?.action === 'create') {
          return <PlaceholderComponent title="New Lead Form" />;
        }
        return <PlaceholderComponent title="Leads Overview Component" />;
      case 'leads-new':
        return <PlaceholderComponent title="New Leads Component" />;
      case 'leads-qualified':
        return <PlaceholderComponent title="Qualified Leads Component" />;
      case 'leads-contacted':
        return <PlaceholderComponent title="Contacted Leads Component" />;
      case 'leads-email':
        return <PlaceholderComponent title="Email Leads Component" />;
      case 'leads-hot':
        return <PlaceholderComponent title="Hot Leads Component" />;

      // Template sections
      case 'templates':
        if ((sectionParams as SectionParams)?.action === 'create') {
          console.log('Redirecting to template editor from templates route with create action');
          setTimeout(() => changeSection('templates-create'), 0);
          return <div>Redirecting to template editor...</div>;
        }
        return <TemplatesOverview />;

      case 'templates-email':
        if ((sectionParams as SectionParams)?.action === 'create') {
          console.log('Rendering template editor with create action from templates-email');
          return <TemplateEditor currentTemplate={null} />;
        } else if ((sectionParams as SectionParams)?.templateId) {
          console.log('Editing template with ID:', (sectionParams as SectionParams).templateId);
          return <TemplateEditor templateId={(sectionParams as SectionParams).templateId} />;
        }
        return <TemplatesEmail />;

      // Email template subsections
      case 'templates-email-marketing':
        return <PlaceholderComponent title="Email Marketing Templates" />;
      case 'templates-email-newsletters':
        return <PlaceholderComponent title="Email Newsletter Templates" />;
      case 'templates-email-onboarding':
        return <PlaceholderComponent title="Email Onboarding Templates" />;
      case 'templates-email-transactional':
        return <PlaceholderComponent title="Email Transactional Templates" />;
      case 'templates-email-notifications':
        return <PlaceholderComponent title="Email Notification Templates" />;

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
            onSelectPreset={(preset: Preset) => {
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
        return <PlaceholderComponent title="Email Agents Component" />;

      // Workflow sections
      case 'workflows':
        return <PlaceholderComponent title="Workflows Overview Component" />;
      case 'workflows-my':
        return <PlaceholderComponent title="My Workflows Component" />;
      case 'workflows-automations':
        return <PlaceholderComponent title="Workflow Automations Component" />;
      case 'workflows-templates':
        return <PlaceholderComponent title="Workflow Templates Component" />;
      case 'workflows-create':
        return <PlaceholderComponent title="Create Workflow Component" />;

      // Notification sections
      case 'notifications':
        return <PlaceholderComponent title="Notifications Overview Component" />;
      case 'notifications-leads':
        return <PlaceholderComponent title="Lead Notifications Component" />;
      case 'notifications-tasks':
        return <PlaceholderComponent title="Task Notifications Component" />;
      case 'notifications-events':
        return <PlaceholderComponent title="Event Notifications Component" />;
      case 'notifications-urgent':
        return <PlaceholderComponent title="Urgent Notifications Component" />;

      // Settings sections
      case 'settings':
        return <SettingsOverview />;
      case 'settings-workspace':
        return <SettingsWorkspace />;
      case 'settings-email':
        return <SettingsEmail />;
      case 'settings-ai':
        return <PlaceholderComponent title="AI Settings Component" />;
      case 'settings-profile':
        return <PlaceholderComponent title="Profile Settings Component" />;
      case 'settings-integrations':
        return <PlaceholderComponent title="Integrations Settings Component" />;
      case 'settings-notifications':
        return <PlaceholderComponent title="Notification Settings Component" />;

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
