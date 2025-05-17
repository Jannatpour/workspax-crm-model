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

// Contact components
import { ContactsPage } from '@/components/contacts/contacts-page';
import { ContactDetail } from '@/components/contacts/contacts-detail';
import { ContactForm } from '@/components/contacts/contacts-form';
import { ContactsImport } from '@/components/contacts/contacts-import';
import { ContactsExport } from '@/components/contacts/contacts-export';

// Template components
import { TemplatesOverview } from '@/components/templates/templatesOverview';
import { TemplateEditor } from '@/components/templates/templateEditor';
import { TemplateLibrary } from '@/components/templates/templateLibrary';

// Agent components
import { AgentsOverview } from '@/components/agents/agents-overview';

// Settings components
import { SettingsOverview } from '@/components/settings/settings-overview';
import { WorkspaceSettings } from '@/components/workspace/workspace-settings';
import { SettingsEmail } from '@/components/settings/settings-email';
import { SettingsIntegrations } from '@/components/settings/settings-integrations';
import { SettingsNotifications } from '@/components/settings/settings-notifications';
import { SettingsAI } from '@/components/settings/settings-ai';
import { SettingsProfile } from '@/components/settings/settings-profile';
// Create placeholder component
const PlaceholderComponent = ({ title }: { title: string }) => (
  <div className="p-6 bg-muted rounded-lg">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-muted-foreground">This feature is coming soon.</p>
  </div>
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
        return <PlaceholderComponent title="Mail Insights" />;
      case 'mail-attention':
        return <PlaceholderComponent title="Attention Required" />;

      // Contact sections
      case 'contacts':
        return <ContactsPage />;
      case 'contacts-detail':
        return <ContactDetail />;
      case 'contacts-new':
        return <ContactForm />;
      case 'contacts-edit':
        return <ContactForm />;
      case 'contacts-import':
        return <ContactsImport />;
      case 'contacts-export':
        return <ContactsExport />;
      case 'contacts-tags':
        return <PlaceholderComponent title="Contact Tags" />;
      case 'contacts-groups':
        return <PlaceholderComponent title="Contact Groups" />;

      // Leads sections
      case 'leads':
        if (sectionParams?.action === 'create') {
          return <PlaceholderComponent title="New Lead Form" />;
        }
        return <PlaceholderComponent title="Leads Overview" />;
      case 'leads-new':
        return <PlaceholderComponent title="New Leads" />;
      case 'leads-qualified':
        return <PlaceholderComponent title="Qualified Leads" />;
      case 'leads-contacted':
        return <PlaceholderComponent title="Contacted Leads" />;
      case 'leads-email':
        return <PlaceholderComponent title="Email Leads" />;
      case 'leads-hot':
        return <PlaceholderComponent title="Hot Leads" />;

      // Template sections
      case 'templates':
        if (sectionParams?.action === 'create') {
          setTimeout(() => changeSection('templates-create'), 0);
          return <div>Redirecting to template editor...</div>;
        }
        return <TemplatesOverview />;
      case 'templates-email':
        if (sectionParams?.action === 'create') {
          return <TemplateEditor />;
        } else if (sectionParams?.templateId) {
          return <TemplateEditor templateId={sectionParams.templateId} />;
        }
        return <PlaceholderComponent title="Email Templates" />;
      case 'templates-create':
        return <TemplateEditor />;
      case 'templates-library':
        return <TemplateLibrary />;
      case 'templates-categories':
        return <PlaceholderComponent title="Template Categories" />;
      case 'templates-presets':
        return <PlaceholderComponent title="Template Presets" />;

      // Agent sections
      case 'agents':
        return <AgentsOverview />;
      case 'agents-my':
        return <PlaceholderComponent title="My Agents" />;
      case 'agents-teams':
        return <PlaceholderComponent title="Agent Teams" />;
      case 'agents-training':
        return <PlaceholderComponent title="Agent Training" />;
      case 'agents-email':
        return <PlaceholderComponent title="Email Agents" />;

      // Workflow sections
      case 'workflows':
        return <PlaceholderComponent title="Workflows Overview" />;
      case 'workflows-my':
        return <PlaceholderComponent title="My Workflows" />;
      case 'workflows-automations':
        return <PlaceholderComponent title="Workflow Automations" />;
      case 'workflows-templates':
        return <PlaceholderComponent title="Workflow Templates" />;
      case 'workflows-create':
        return <PlaceholderComponent title="Create Workflow" />;

      // Notification sections
      case 'notifications':
        return <PlaceholderComponent title="Notifications Overview" />;
      case 'notifications-leads':
        return <PlaceholderComponent title="Lead Notifications" />;
      case 'notifications-tasks':
        return <PlaceholderComponent title="Task Notifications" />;
      case 'notifications-events':
        return <PlaceholderComponent title="Event Notifications" />;
      case 'notifications-urgent':
        return <PlaceholderComponent title="Urgent Notifications" />;

      // Settings sections
      case 'settings':
        return <SettingsOverview />;
      case 'settings-workspace':
        return <WorkspaceSettings />;
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

  return <div className="h-full overflow-auto">{renderContent()}</div>;
}
