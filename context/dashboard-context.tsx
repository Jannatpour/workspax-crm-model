'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from 'react';

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
import { ContactsImport } from '@/components/dashboard/contacts/contacts-import';
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
import { ContactsDetail } from '@/components/contacts/contacts-detail';
import { ContactsExport } from '@/components/contacts/contacts-export';
import { ContactsForm } from '@/components/contacts/contacts-form';
import { ContactsImport as ContactsComponentImport } from '@/components/contacts/contacts-import';
import { ContactsOverview as ContactsComponentOverview } from '@/components/contacts/contacts-overview';
import { ContactsPage } from '@/components/contacts/contacts-page';

// Lead Components
import { LeadManager } from '@/components/leads/LeadManager';

// Template Components
import { ComponentPanel } from '@/components/templates/ComponentPanel';
import { PresetSelector } from '@/components/templates/PresetSelector';
import { PropertyEditor } from '@/components/templates/PropertyEditor';
import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { TemplatesEmail } from '@/components/templates/templates-email';
import { TemplatesOverview } from '@/components/templates/templates-overview';

// Agent Components
import { AgentConfigurationForm } from '@/components/agents/agent-configuration-form';
import { AgentEdit } from '@/components/agents/agent-edit';
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

// Notification Components
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

// Other Components
import { ThemeToggle } from '@/components/theme-toggle';

// Define the types for dashboard sections
export type DashboardSection =
  | 'overview'
  | 'mail-inbox'
  | 'mail-sent'
  | 'mail-drafts'
  | 'mail-important'
  | 'mail-insights'
  | 'mail-attention'
  | 'mail-trash'
  | 'mail-compose'
  | 'contacts'
  | 'contacts-import'
  | 'leads'
  | 'leads-new'
  | 'leads-qualified'
  | 'leads-contacted'
  | 'leads-email'
  | 'leads-hot'
  | 'templates'
  | 'templates-recent'
  | 'templates-email'
  | 'templates-email-marketing'
  | 'templates-email-newsletters'
  | 'templates-email-onboarding'
  | 'templates-email-transactional'
  | 'templates-email-notifications'
  | 'templates-create'
  | 'templates-library'
  | 'templates-categories'
  | 'templates-presets'
  | 'agents'
  | 'agents-my'
  | 'agents-training'
  | 'agents-teams'
  | 'agents-email'
  | 'workflows'
  | 'workflows-my'
  | 'workflows-automations'
  | 'workflows-templates'
  | 'workflows-create'
  | 'notifications'
  | 'notifications-leads'
  | 'notifications-tasks'
  | 'notifications-events'
  | 'notifications-urgent'
  | 'settings'
  | 'settings-workspace'
  | 'settings-email'
  | 'settings-ai'
  | 'settings-profile'
  | 'settings-integrations'
  | 'settings-notifications';

// Define the type for the dashboard context
interface DashboardContextType {
  currentSection: DashboardSection;
  sectionParams: Record<string, any> | null;
  changeSection: (section: DashboardSection, params?: Record<string, any>) => void;
  goBack: () => void;
  canGoBack: boolean;
  history: Array<{ section: DashboardSection; params: Record<string, any> | null }>;
  clearHistory: () => void;
  refreshUI: () => void;
}

// Create the context with default values
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider props interface
interface DashboardProviderProps {
  children: ReactNode;
  initialSection?: DashboardSection;
}

// Create the provider component
export function DashboardProvider({
  children,
  initialSection = 'overview',
}: DashboardProviderProps) {
  // State for section and params - use direct state instead of history-based approach
  const [currentSection, setCurrentSection] = useState<DashboardSection>(initialSection);
  const [sectionParams, setSectionParams] = useState<Record<string, any> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track navigation history
  const [history, setHistory] = useState<
    Array<{
      section: DashboardSection;
      params: Record<string, any> | null;
    }>
  >([{ section: initialSection, params: null }]);

  // Debug log for section changes
  useEffect(() => {
    console.log('DashboardContext - Section changed:', currentSection);
    console.log('DashboardContext - Params:', sectionParams);
  }, [currentSection, sectionParams]);

  // Change section with proper cleanup and history tracking
  const changeSection = useCallback((section: DashboardSection, params?: Record<string, any>) => {
    console.log(`DashboardContext: Changing section to ${section}`, params);

    // Clear any previous timeouts to avoid race conditions
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the current section and params directly
    setCurrentSection(section);
    setSectionParams(params || null);

    // Add to history
    setHistory(prev => [...prev, { section, params: params || null }]);

    // Force UI refresh
    window.dispatchEvent(new Event('resize'));

    return true; // Indicate success
  }, []);

  // Go back in history
  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;

      const newHistory = prev.slice(0, -1);
      const current = newHistory[newHistory.length - 1];

      // Update current section and params
      setCurrentSection(current.section);
      setSectionParams(current.params);

      return newHistory;
    });
  }, []);

  // Clear history except current
  const clearHistory = useCallback(() => {
    setHistory([{ section: currentSection, params: sectionParams }]);
  }, [currentSection, sectionParams]);

  // Force UI refresh
  const refreshUI = useCallback(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  // Check if we can go back
  const canGoBack = history.length > 1;

  // Create context value
  const contextValue: DashboardContextType = {
    currentSection,
    sectionParams,
    changeSection,
    goBack,
    canGoBack,
    history,
    clearHistory,
    refreshUI,
  };

  return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>;
}

// Hook to use the dashboard context
export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
