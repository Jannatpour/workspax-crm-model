'use client';

import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ColorPicker } from '@/components/ui/color-picker';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Dashboard Components
import { CalendarView } from '@/components/dashboard/calendar-view';
import { ClientDashboardLayout } from '@/components/dashboard/client-dashboard-layout';
import { ClientSidebar } from '@/components/dashboard/client-sidebar';
import { ContactDetailHeader } from '@/components/dashboard/contacts/contact-detail-header';
import { ContactDetailInfo } from '@/components/dashboard/contacts/contact-detail-info';
import { ContactList } from '@/components/dashboard/contacts/contact-list';
import { ContactListTable } from '@/components/dashboard/contacts/contact-list-table';
import { ContactsHeader } from '@/components/dashboard/contacts/contacts-header';
import { ContactsImport as DashboardContactsImport } from '@/components/dashboard/contacts/contacts-import';
import { ContactsOverview } from '@/components/dashboard/contacts-overview';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { DynamicSidebar } from '@/components/dashboard/dynamic-sidebar';
import { EmailStats } from '@/components/dashboard/email-stats';
import { Header } from '@/components/dashboard/header';
import { RecentEmails } from '@/components/dashboard/recent-emails';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TagsSelect } from '@/components/dashboard/tags/tags-select';
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks';
import { UserMenu } from '@/components/dashboard/user-menu';

// Mail Components
import { EmailAiActionButtons } from '@/components/mail/email-ai-action-buttons';
import { EmailInsight } from '@/components/mail/EmailInsight';
import { EmailComposer } from '@/components/mail/editor/email-composer';
import { RecipientAutocomplete } from '@/components/mail/editor/recipient-autocomplete';
import { RichTextEditor } from '@/components/mail/editor/rich-text-editor';
import { MailAttention } from '@/components/mail/mail-attention';
import { MailCompose } from '@/components/mail/mail-compose';
import { MailDrafts } from '@/components/mail/mail-drafts';
import { MailImportant } from '@/components/mail/mail-important';
import { MailInbox } from '@/components/mail/mail-inbox';
import { MailInsights } from '@/components/mail/MailInsights';
import { MailSent } from '@/components/mail/mail-sent';
import { MailTrash } from '@/components/mail/mail-trash';

// Contact Components
import { ContactList as ContactsComponentList } from '@/components/contacts/contact-list';
import { ContactDetail } from '@/components/contacts/contacts-detail';
import { ContactsExport } from '@/components/contacts/contacts-export';
import { ContactForm } from '@/components/contacts/contacts-form';
import { ContactsImport } from '@/components/contacts/contacts-import';
import { ContactsOverview as ContactsComponentOverview } from '@/components/contacts/contacts-overview';
import { ContactsPage } from '@/components/contacts/contacts-page';

// Lead Components
import { LeadManager } from '@/components/leads/LeadManager';

// Template Components
import { ComponentPanel } from '@/components/templates/ComponentPanel';
import { PresetSelector } from '@/components/templates/PresetSelector';
import { PropertyEditor } from '@/components/templates/PropertyEditor';
import { TemplateCategories } from '@/components/templates/TemplateCategories';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { TemplatesEmail } from '@/components/templates/templates-email';
import { TemplatesOverview } from '@/components/templates/TemplatesOverview';

// Agent Components
import { AgentConfigurationForm } from '@/components/agents/agent-configuration-form';
import { AgentEdit } from '@/components/agents/agent-edit';
import { AgentService } from '@/components/agents/agent-create';
import { AgentsDashboard } from '@/components/agents/agents-dashboard';
import { AgentsMy } from '@/components/agents/agents-my';
import { AgentsOverview } from '@/components/agents/agents-overview';
import { AgentsTeams } from '@/components/agents/agents-teams';
import { AgentsTraining } from '@/components/agents/agents-training';
import { EmailAgent } from '@/components/agents/email-agent';
import { ModuleAgentSelector } from '@/components/agents/module-agent-selector';

// Automation Components
import { AutomationStatusBar } from '@/components/automation/automation-status-bar';
import { EmailAutomationComponents } from '@/components/automation/email-automation-components';
import { JobAutomationComponents } from '@/components/automation/job-automation-components';
import { ModuleAgentSelector as AutomationModuleAgentSelector } from '@/components/automation/module-agent-selector';

// Settings Components
import { SettingsAI } from '@/components/settings/settings-ai';
import { SettingsEmail } from '@/components/settings/settings-email';
import { SettingsIntegrations } from '@/components/settings/settings-integrations';
import { SettingsNotifications } from '@/components/settings/settings-notifications';
import { SettingsOverview } from '@/components/settings/settings-overview';
import { SettingsProfile } from '@/components/settings/settings-profile';
import { SettingsWorkspace } from '@/components/settings/settings-workspace';

// Workspace Components
import { AcceptInvitation } from '@/components/workspace/invitation/accept-invitation';
import { InvitationForm } from '@/components/workspace/invitation/invitation-form';
import { InvitationList } from '@/components/workspace/invitation/invitation-list';
import { MembersSection } from '@/components/workspace/members/members-section';
import { PermissionGate } from '@/components/workspace/permissions/permission-gate';
import { CreateWorkspace } from '@/components/workspace/create-workspace';
import { WorkspaceCheck } from '@/components/workspace/workspace-check';
import { WorkspaceSelector } from '@/components/workspace/workspace-selector';
import { WorkspaceSettings } from '@/components/workspace/workspace-settings';

// Workflow Components
import { WorkflowsOverview } from '@/components/workflows/workflows-overview';
import { WorkflowsMy } from '@/components/workflows/workflows-my';
import { WorkflowsAutomations } from '@/components/workflows/workflows-automations';
import { WorkflowsTemplates } from '@/components/workflows/workflows-templates';
import { WorkflowsCreate } from '@/components/workflows/workflows-create';

// Notification Components
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationsOverview } from '@/components/notifications/notifications-overview';
import { NotificationsLeads } from '@/components/notifications/notifications-leads';
import { NotificationsTasks } from '@/components/notifications/notifications-tasks';
import { NotificationsEvents } from '@/components/notifications/notifications-events';
import { NotificationsUrgent } from '@/components/notifications/notifications-urgent';

// Other Components
import { ThemeToggle } from '@/components/theme-toggle';

// Import placeholder components from missing-components
import {
  MailInsights as MailInsightsPlaceholder,
  MailAttention as MailAttentionPlaceholder,
  LeadsOverview,
  LeadsNew,
  LeadsQualified,
  LeadsContacted,
  LeadsEmail,
  LeadsHot,
  TemplatesEmailMarketing,
  TemplatesEmailNewsletters,
  TemplatesEmailOnboarding,
  TemplatesEmailTransactional,
  TemplatesEmailNotifications,
  AgentsEmail,
} from '@/components/missing-components';

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
      case 'mail-smart-replies':
        return <MailInsightsPlaceholder />;
      case 'mail-categorize':
        return <MailAttentionPlaceholder />;

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
        return <NotificationsTasks />;
      case 'contacts-groups':
        return <NotificationsEvents />;

      // Leads sections
      case 'leads':
        if (sectionParams?.action === 'create') {
          return <LeadsNew isCreate={true} />;
        }
        return <LeadManager />;
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
        return <TemplatesOverview />;
      case 'templates-email-marketing':
        return <TemplatesOverview isFiltered={true} category="marketing" />;
      case 'templates-email-newsletters':
        return <TemplatesOverview isFiltered={true} category="newsletter" />;
      case 'templates-email-onboarding':
        return <TemplatesOverview isFiltered={true} category="onboarding" />;
      case 'templates-create':
        return <TemplateEditor />;
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
      case 'templates-ai-generator':
        return <TemplateEditor aiAssisted={true} />;

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
        return <EmailAgent />;
      case 'agents-leads':
        return <AgentsDashboard type="leads" />;
      case 'agents-create':
        return (
          <AgentConfigurationForm
            onSubmit={data => {
              AgentService.createAgent(data)
                .then(() => {
                  changeSection('agents');
                })
                .catch(error => {
                  console.error('Error creating agent:', error);
                });
            }}
          />
        );
      case 'agents-edit':
        return sectionParams?.agentId ? (
          <AgentEdit agentId={sectionParams.agentId} />
        ) : (
          <AgentsOverview />
        );

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

  return <div className="h-full overflow-auto">{renderContent()}</div>;
}
