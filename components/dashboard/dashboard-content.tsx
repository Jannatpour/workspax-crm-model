'use client';
import React from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { MailInbox } from '@/components/mail/mail-inbox';
import { MailSent } from '@/components/mail/mail-sent';
import { MailDrafts } from '@/components/mail/mail-drafts';
import { MailTrash } from '@/components/mail/mail-trash';
import { MailCompose } from '@/components/mail/mail-compose';
import { ContactsOverview } from '@/components/contacts/contacts-overview';
import { ContactsImport } from '@/components/contacts/contacts-import';
import { AgentsOverview } from '@/components/agents/agents-overview';
import { AgentsTeams } from '@/components/agents/agents-teams';
import { AgentsTraining } from '@/components/agents/agents-training';
import { SettingsOverview } from '@/components/settings/settings-overview';
import { SettingsEmail } from '@/components/settings/settings-email';

interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  const { currentSection, sectionParams } = useDashboard();

  // Define the content to render based on the current section
  const renderContent = () => {
    switch (currentSection) {
      case 'overview':
        return <DashboardOverview />;
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
      case 'contacts':
        return <ContactsOverview />;
      case 'contacts-import':
        return <ContactsImport />;
      case 'agents':
        return <AgentsOverview />;
      case 'agents-teams':
        return <AgentsTeams />;
      case 'agents-training':
        return <AgentsTraining />;
      case 'settings':
        return <SettingsOverview />;
      case 'settings-email':
        return <SettingsEmail />;
      default:
        // Fallback to the children prop for regular page routes
        return children;
    }
  };

  // We only show the dynamic content if we have a specific section selected
  // Otherwise, we render the children (regular Next.js pages)
  const content =
    Object.values(useDashboard().currentSection).length > 0 ? renderContent() : children;

  return <>{content}</>;
}
