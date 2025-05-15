'use client';

import React, { useEffect } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { MailInbox } from '@/components/mail/mail-inbox';
import { MailSent } from '@/components/mail/mail-sent';
import { MailDrafts } from '@/components/mail/mail-drafts';
import { MailTrash } from '@/components/mail/mail-trash';
import { MailCompose } from '@/components/mail/mail-compose';
import { MailImportant } from '@/components/mail/mail-important';
import { ContactsOverview } from '@/components/contacts/contacts-overview';
import { ContactsImport } from '@/components/contacts/contacts-import';

// Direct imports for template components to ensure they're properly loaded
// Instead of using the index.ts barrel file which might be causing issues
import { TemplatesOverview } from '@/components/templates/TemplatesOverview';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { TemplateCategories } from '@/components/templates/TemplateCategories';
import { PresetSelector } from '@/components/templates/PresetSelector';

// Import for templates-email if it exists
import TemplatesEmail from '@/components/templates/templates-email';

import { AgentsOverview } from '@/components/agents/agents-overview';
import { AgentsTeams } from '@/components/agents/agents-teams';
import { AgentsTraining } from '@/components/agents/agents-training';
import { AgentsMy } from '@/components/agents/agents-my';
import { WorkflowsOverview } from '@/components/workflows/workflows-overview';
import { SettingsOverview } from '@/components/settings/settings-overview';
import { SettingsEmail } from '@/components/settings/settings-email';
import { WorkspaceSettings } from '@/components/workspace/workspace-settings';

interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
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

      // Contact sections
      case 'contacts':
        return <ContactsOverview />;
      case 'contacts-import':
        return <ContactsImport />;

      // Template sections
      case 'templates':
        // Check if we should go directly to create mode
        if (sectionParams?.action === 'create') {
          console.log('Redirecting to template editor from templates route with create action');
          // We need to use setTimeout to avoid rendering issues during the current render cycle
          setTimeout(() => changeSection('templates-create'), 0);
          return <div>Redirecting to template editor...</div>;
        }
        return <TemplatesOverview />;

      case 'templates-email':
        // If specific action is requested via params
        if (sectionParams?.action === 'create') {
          console.log('Rendering template editor with create action from templates-email');
          return <TemplateEditor currentTemplate={null} />;
        } else if (sectionParams?.templateId) {
          console.log('Editing template with ID:', sectionParams.templateId);
          // Edit existing template
          return <TemplateEditor templateId={sectionParams.templateId} />;
        }
        // Default template list
        return <TemplatesEmail />;

      case 'templates-create':
        console.log('Rendering template editor from templates-create route');
        // Create new template
        return <TemplateEditor currentTemplate={null} />;

      case 'templates-library':
        return <TemplateLibrary />;

      case 'templates-categories':
        return <TemplateCategories />;

      case 'templates-presets':
        return (
          <PresetSelector
            onSelectPreset={preset => {
              // Navigate to editor with selected preset
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

      // Workflows section
      case 'workflows':
        return <WorkflowsOverview />;

      // Settings sections
      case 'settings':
        return <SettingsOverview />;
      case 'settings-email':
        return <SettingsEmail />;
      case 'settings-workspace':
        console.log('Rendering WorkspaceSettings component');
        return <WorkspaceSettings />;

      default:
        // Fallback to the children prop for regular page routes
        return children;
    }
  };

  // We only show the dynamic content if we have a specific section selected
  // Otherwise, we render the children (regular Next.js pages)
  const content = currentSection ? renderContent() : children;

  return <div className="p-6">{content}</div>;
}
