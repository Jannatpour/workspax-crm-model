'use client';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Mail,
  Users,
  FileText,
  Settings,
  PlusCircle,
  Inbox,
  Send,
  File,
  Trash2,
  Star,
  Bot,
  BrainCircuit,
  Workflow,
  BarChart2,
  ArrowRightToLine,
  ChevronDown,
  ChevronRight,
  Building2,
  LayoutTemplate,
  PenTool,
  BookOpen,
  Sparkles,
  Palette,
  Heart,
  Gift,
  Calendar,
  BarChart3,
  FolderPlus,
  ListFilter,
  Grid,
  Layers,
  TemplateIcon,
  Focus,
  SlidersHorizontal,
  Library,
  FolderHeart,
  FolderArchive,
  Image,
  MessageSquare,
  ShoppingBag,
  Clock,
  Zap,
  Tags,
  Newspaper,
  ScrollText,
  UserPlus,
  AlertCircle,
  Bell,
  Briefcase,
  Check,
  CircleDashed,
  Filter,
  FlameKindling,
  Gauge,
  LucideCalendarCheck,
  CalendarDays,
  ScrollIcon,
  InboxIcon,
  ListTodo,
  BellRing,
  UserCircle,
  MonitorPlay,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDashboard, DashboardSection } from '@/context/dashboard-context';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

interface DynamicSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function DynamicSidebar({ className, collapsed = false, onToggle }: DynamicSidebarProps) {
  const { currentSection, changeSection, sectionParams, refreshUI } = useDashboard();
  const router = useRouter(); // Get router for navigation support

  // Set all section states to true to show all sections
  const [mailOpen, setMailOpen] = React.useState(true);
  const [agentsOpen, setAgentsOpen] = React.useState(true);
  const [workflowsOpen, setWorkflowsOpen] = React.useState(true);
  const [settingsOpen, setSettingsOpen] = React.useState(true);
  const [templatesOpen, setTemplatesOpen] = React.useState(true);
  const [leadsOpen, setLeadsOpen] = React.useState(true);
  const [notificationsOpen, setNotificationsOpen] = React.useState(true);
  const [emailTemplatesOpen, setEmailTemplatesOpen] = React.useState(true);

  // Log current section for debugging
  useEffect(() => {
    console.log('Sidebar - Current section:', currentSection);
    console.log('Sidebar - Section params:', sectionParams);
  }, [currentSection, sectionParams]);

  // Function to check if a section is active
  const isActive = (section: DashboardSection) => {
    return currentSection === section;
  };

  // Check if a parent section is active
  const isParentActive = (sectionPrefix: string) => {
    return typeof currentSection === 'string' && currentSection.startsWith(sectionPrefix);
  };

  // Handle rendering different badge types
  const renderBadge = (badge: string | number, color: string = 'bg-primary') => {
    return (
      <span
        className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full ${color} text-xs text-primary-foreground`}
      >
        {badge}
      </span>
    );
  };

  // Enhanced navigation handler with data-attributes for debugging
  const handleNavigation = (
    section: DashboardSection,
    params?: Record<string, any>,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log(`Navigation requested to: ${section}`, params);

    // Add data attributes for debugging - this helps identify navigation issues
    if (e && e.currentTarget) {
      e.currentTarget.setAttribute('data-last-clicked', new Date().toISOString());
      e.currentTarget.setAttribute('data-clicked-section', section);
    }

    // Don't trigger multiple times for the same section without params
    if (section !== currentSection || params) {
      changeSection(section, params);

      // Force a UI refresh after navigation
      refreshUI();
    }
  };

  const mainNavItems = [
    {
      title: 'Dashboard',
      section: 'overview' as DashboardSection,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Mail',
      section: 'mail-inbox' as DashboardSection,
      icon: Mail,
      badge: '5',
      hasSubmenu: true,
      open: mailOpen,
      setOpen: setMailOpen,
    },
    {
      title: 'Contacts',
      section: 'contacts' as DashboardSection,
      icon: Users,
    },
    {
      title: 'Leads',
      section: 'leads' as DashboardSection,
      icon: Briefcase,
      badge: 'New',
      badgeColor: 'bg-green-500',
      hasSubmenu: true,
      open: leadsOpen,
      setOpen: setLeadsOpen,
    },
    {
      title: 'Templates',
      section: 'templates' as DashboardSection,
      icon: LayoutTemplate,
      hasSubmenu: true,
      open: templatesOpen,
      setOpen: setTemplatesOpen,
    },
    {
      title: 'AI Agents',
      section: 'agents' as DashboardSection,
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-purple-500',
      hasSubmenu: true,
      open: agentsOpen,
      setOpen: setAgentsOpen,
    },
    {
      title: 'Workflows',
      section: 'workflows' as DashboardSection,
      icon: Workflow,
      hasSubmenu: true,
      open: workflowsOpen,
      setOpen: setWorkflowsOpen,
    },
    {
      title: 'Notifications',
      section: 'notifications' as DashboardSection,
      icon: Bell,
      badge: '8',
      badgeColor: 'bg-amber-500',
      hasSubmenu: true,
      open: notificationsOpen,
      setOpen: setNotificationsOpen,
    },
    {
      title: 'Settings',
      section: 'settings' as DashboardSection,
      icon: Settings,
      hasSubmenu: true,
      open: settingsOpen,
      setOpen: setSettingsOpen,
    },
  ];

  const mailNavItems = [
    {
      title: 'Inbox',
      section: 'mail-inbox' as DashboardSection,
      icon: Inbox,
      badge: '3',
    },
    {
      title: 'Sent',
      section: 'mail-sent' as DashboardSection,
      icon: Send,
    },
    {
      title: 'Drafts',
      section: 'mail-drafts' as DashboardSection,
      icon: File,
      badge: '2',
    },
    {
      title: 'Important',
      section: 'mail-important' as DashboardSection,
      icon: Star,
    },
    {
      title: 'AI Insights',
      section: 'mail-insights' as DashboardSection,
      icon: Sparkles,
      badge: '5',
      badgeColor: 'bg-purple-500',
    },
    {
      title: 'Needs Attention',
      section: 'mail-attention' as DashboardSection,
      icon: AlertCircle,
      badge: '2',
      badgeColor: 'bg-red-500',
    },
    {
      title: 'Trash',
      section: 'mail-trash' as DashboardSection,
      icon: Trash2,
    },
  ];

  // Leads navigation items
  const leadsNavItems = [
    {
      title: 'All Leads',
      section: 'leads' as DashboardSection,
      icon: InboxIcon,
      exact: true,
    },
    {
      title: 'New Leads',
      section: 'leads-new' as DashboardSection,
      icon: UserPlus,
      badge: '4',
      badgeColor: 'bg-green-500',
    },
    {
      title: 'Qualified',
      section: 'leads-qualified' as DashboardSection,
      icon: Check,
    },
    {
      title: 'Contacted',
      section: 'leads-contacted' as DashboardSection,
      icon: MessageSquare,
    },
    {
      title: 'From Email',
      section: 'leads-email' as DashboardSection,
      icon: Mail,
      badge: '2',
      badgeColor: 'bg-blue-500',
    },
    {
      title: 'Hot Leads',
      section: 'leads-hot' as DashboardSection,
      icon: FlameKindling,
      badge: '1',
      badgeColor: 'bg-red-500',
    },
  ];

  // Notification navigation items
  const notificationNavItems = [
    {
      title: 'All',
      section: 'notifications' as DashboardSection,
      icon: Bell,
      exact: true,
      badge: '8',
    },
    {
      title: 'Leads',
      section: 'notifications-leads' as DashboardSection,
      icon: Briefcase,
      badge: '3',
    },
    {
      title: 'Tasks',
      section: 'notifications-tasks' as DashboardSection,
      icon: ListTodo,
      badge: '2',
    },
    {
      title: 'Events',
      section: 'notifications-events' as DashboardSection,
      icon: CalendarDays,
      badge: '1',
    },
    {
      title: 'Urgent',
      section: 'notifications-urgent' as DashboardSection,
      icon: AlertCircle,
      badge: '2',
      badgeColor: 'bg-red-500',
    },
  ];

  // Template navigation items with improved organization and submenus
  const templateNavItems = [
    {
      title: 'All Templates',
      section: 'templates' as DashboardSection,
      icon: Grid,
      exact: true,
    },
    {
      title: 'Recently Used',
      section: 'templates-recent' as DashboardSection,
      icon: Clock,
    },
    {
      title: 'Email Templates',
      section: 'templates-email' as DashboardSection,
      icon: Mail,
      badge: '32',
      hasSubmenu: true,
      open: emailTemplatesOpen,
      setOpen: setEmailTemplatesOpen,
    },
    {
      title: 'Create New',
      section: 'templates-create' as DashboardSection,
      icon: PlusCircle,
      badge: 'UI',
      badgeColor: 'bg-blue-500',
      action: () => handleNavigation('templates-email', { action: 'create' }),
    },
    {
      title: 'Template Library',
      section: 'templates-library' as DashboardSection,
      icon: Library,
    },
    {
      title: 'Categories',
      section: 'templates-categories' as DashboardSection,
      icon: Tags,
    },
  ];

  // Email templates submenu items
  const emailTemplateItems = [
    {
      title: 'Marketing',
      section: 'templates-email-marketing' as DashboardSection,
      icon: Zap,
      badge: '12',
    },
    {
      title: 'Newsletters',
      section: 'templates-email-newsletters' as DashboardSection,
      icon: Newspaper,
      badge: '8',
    },
    {
      title: 'Onboarding',
      section: 'templates-email-onboarding' as DashboardSection,
      icon: Focus,
      badge: '6',
    },
    {
      title: 'Transactional',
      section: 'templates-email-transactional' as DashboardSection,
      icon: ShoppingBag,
      badge: '4',
    },
    {
      title: 'Notifications',
      section: 'templates-email-notifications' as DashboardSection,
      icon: MessageSquare,
      badge: '2',
    },
  ];

  const agentNavItems = [
    {
      title: 'Overview',
      section: 'agents' as DashboardSection,
      icon: BarChart2,
      exact: true,
    },
    {
      title: 'My Agents',
      section: 'agents-my' as DashboardSection,
      icon: Bot,
    },
    {
      title: 'Training',
      section: 'agents-training' as DashboardSection,
      icon: BrainCircuit,
    },
    {
      title: 'Agent Teams',
      section: 'agents-teams' as DashboardSection,
      icon: Users,
    },
    {
      title: 'Email Processing',
      section: 'agents-email' as DashboardSection,
      icon: Mail,
      badge: 'New',
      badgeColor: 'bg-green-500',
    },
  ];

  // Workflow navigation items
  const workflowNavItems = [
    {
      title: 'Overview',
      section: 'workflows' as DashboardSection,
      icon: BarChart2,
      exact: true,
    },
    {
      title: 'My Workflows',
      section: 'workflows-my' as DashboardSection,
      icon: Workflow,
    },
    {
      title: 'Automations',
      section: 'workflows-automations' as DashboardSection,
      icon: Zap,
    },
    {
      title: 'Templates',
      section: 'workflows-templates' as DashboardSection,
      icon: LayoutTemplate,
    },
    {
      title: 'Create New',
      section: 'workflows-create' as DashboardSection,
      icon: PlusCircle,
      badge: 'New',
      badgeColor: 'bg-blue-500',
    },
  ];

  // Add settings submenu items
  const settingsNavItems = [
    {
      title: 'Overview',
      section: 'settings' as DashboardSection,
      icon: BarChart2,
      exact: true,
    },
    {
      title: 'Workspace',
      section: 'settings-workspace' as DashboardSection,
      icon: Building2,
    },
    {
      title: 'Email',
      section: 'settings-email' as DashboardSection,
      icon: Mail,
    },
    {
      title: 'AI Settings',
      section: 'settings-ai' as DashboardSection,
      icon: BrainCircuit,
      badge: 'New',
      badgeColor: 'bg-purple-500',
    },
    {
      title: 'User Profile',
      section: 'settings-profile' as DashboardSection,
      icon: UserCircle,
    },
    {
      title: 'Integrations',
      section: 'settings-integrations' as DashboardSection,
      icon: Zap,
    },
    {
      title: 'Notifications',
      section: 'settings-notifications' as DashboardSection,
      icon: Bell,
    },
  ];

  // Render a collapsible section with submenu - always show content regardless of collapsed state
  const renderCollapsibleSection = (item: any, children: React.ReactNode) => {
    const isItemActive = isParentActive(item.section);

    return (
      <Collapsible
        key={item.section}
        open={true} // Always open
        onOpenChange={open => {
          if (item.setOpen) {
            item.setOpen(open);
          }
        }}
        className="space-y-1"
        data-section={item.section}
      >
        <div className="flex">
          <div className="flex flex-1">
            <Button
              variant={isItemActive ? 'secondary' : 'ghost'}
              className={cn('w-full justify-between', collapsed ? 'px-2' : 'px-3')}
              onClick={e => {
                // Prevent default action
                e.preventDefault();

                if (item.action) {
                  item.action();
                } else {
                  handleNavigation(item.section, undefined, e);
                }
              }}
              data-section={item.section}
              data-testid={`nav-${item.section}`}
            >
              <div className="flex items-center">
                <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                {!collapsed && item.title}
              </div>
              {!collapsed && (
                <div className="flex items-center">
                  {item.badge && renderBadge(item.badge, item.badgeColor)}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </div>
              )}
              {collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
            </Button>
          </div>
        </div>

        <div className="space-y-1 pl-6">{children}</div>
      </Collapsible>
    );
  };

  // Render a standard button - modified to always show and handle clicks properly
  const renderNavButton = (item: any, isNested: boolean = false) => {
    return (
      <Button
        key={item.section}
        variant={isActive(item.section) ? 'secondary' : 'ghost'}
        size={isNested ? 'sm' : 'default'}
        className={cn('w-full', collapsed ? 'justify-center px-2' : 'justify-start px-3')}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();

          if (item.action) {
            item.action();
          } else {
            handleNavigation(item.section, undefined, e);
          }
        }}
        data-section={item.section}
        data-testid={`nav-${item.section}`}
      >
        <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
        {!collapsed && item.title}
        {!collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
        {collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
      </Button>
    );
  };

  return (
    <div className={cn('flex flex-col border-r bg-background', className)} data-testid="sidebar">
      <div className="flex h-14 items-center px-4 py-2 border-b">
        <h2 className="flex-1 text-lg font-semibold tracking-tight">
          {!collapsed && 'WorkspaxCRM'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto h-8 w-8">
          <ArrowRightToLine className={cn('h-4 w-4', collapsed && 'rotate-180')} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className={cn('space-y-2 py-4', collapsed ? 'px-2' : 'px-4')}>
          <div className="space-y-1">
            <Button
              variant="default"
              className={cn('w-full', collapsed ? 'justify-center px-0' : 'justify-start')}
              onClick={e => handleNavigation('mail-compose', undefined, e)}
              data-testid="compose-button"
            >
              <PlusCircle className={cn('h-4 w-4', !collapsed && 'mr-2')} />
              {!collapsed && 'Compose'}
            </Button>

            {/* Quick Actions Group */}
            <div className="flex gap-1 mt-1">
              {/* New Lead */}
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={e => handleNavigation('leads', { action: 'create' }, e)}
                      data-testid="new-lead-button"
                    >
                      <UserPlus className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                      {!collapsed && 'New Lead'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Add a new lead</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* New Template */}
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={e => handleNavigation('templates-email', { action: 'create' }, e)}
                      data-testid="new-template-button"
                    >
                      <LayoutTemplate className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                      {!collapsed && 'Template'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Create a new template</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Separator className="my-4" />

          <nav className="space-y-1.5" data-testid="sidebar-navigation">
            {mainNavItems.map(item => {
              // Handle items with submenus
              if (item.hasSubmenu) {
                return (
                  <React.Fragment key={item.section}>
                    {item.title === 'Mail' &&
                      renderCollapsibleSection(
                        item,
                        mailNavItems.map(subItem => renderNavButton(subItem, true))
                      )}

                    {item.title === 'Leads' &&
                      renderCollapsibleSection(
                        item,
                        leadsNavItems.map(subItem => renderNavButton(subItem, true))
                      )}

                    {item.title === 'Templates' &&
                      renderCollapsibleSection(
                        item,
                        <>
                          {templateNavItems.map(subItem => {
                            if (subItem.hasSubmenu) {
                              return renderCollapsibleSection(
                                subItem,
                                emailTemplateItems.map(emailItem =>
                                  renderNavButton(emailItem, true)
                                )
                              );
                            }
                            return renderNavButton(subItem, true);
                          })}
                        </>
                      )}

                    {item.title === 'AI Agents' &&
                      renderCollapsibleSection(
                        item,
                        agentNavItems.map(subItem => renderNavButton(subItem, true))
                      )}

                    {item.title === 'Workflows' &&
                      renderCollapsibleSection(
                        item,
                        workflowNavItems.map(subItem => renderNavButton(subItem, true))
                      )}

                    {item.title === 'Notifications' &&
                      renderCollapsibleSection(
                        item,
                        notificationNavItems.map(subItem => renderNavButton(subItem, true))
                      )}

                    {item.title === 'Settings' &&
                      renderCollapsibleSection(
                        item,
                        settingsNavItems.map(subItem => renderNavButton(subItem, true))
                      )}
                  </React.Fragment>
                );
              } else {
                // Render regular nav item
                return renderNavButton(item);
              }
            })}
          </nav>
        </div>
      </ScrollArea>

      {!collapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-muted-foreground">AI Agents: 4 Active</p>
            </div>

            {/* Quick template button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={e => handleNavigation('templates-recent', undefined, e)}
                    data-testid="recent-templates-button"
                  >
                    <ScrollText className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Recent templates</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* AI activity status */}
          <div className="bg-muted/50 rounded-md p-2 text-xs flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-3 w-3 text-purple-500" />
              <span className="text-muted-foreground">AI Processing:</span>
              <span>5 emails</span>
            </div>
            <Badge variant="outline" className="text-[10px] h-5 bg-green-500/10">
              Active
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
