'use client';
import React, { useEffect, useRef, useState } from 'react';
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
  PenSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDashboard, DashboardSection } from '@/context/dashboard-context';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/use-media-query';

interface DynamicSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function DynamicSidebar({ className, collapsed = false, onToggle }: DynamicSidebarProps) {
  const { currentSection, changeSection, sectionParams, refreshUI } = useDashboard();
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  // Debug output for collapsed state
  console.log('DynamicSidebar rendered with collapsed =', collapsed);

  // Use useState directly to avoid potential issues with object references
  const [expandedSections, setExpandedSections] = useState({
    mail: true,
    agents: true,
    workflows: true,
    settings: true,
    templates: true,
    leads: true,
    notifications: true,
    emailTemplates: true,
  });

  // Function to toggle specific section expansion
  const toggleSectionExpansion = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Log current section for debugging
  useEffect(() => {
    console.log('Sidebar - Current section:', currentSection);
    console.log('Sidebar - Section params:', sectionParams);
    console.log('Sidebar - Collapsed state:', collapsed);
  }, [currentSection, sectionParams, collapsed]);

  // Scroll to active item
  useEffect(() => {
    if (activeItemRef.current && scrollAreaRef.current) {
      // Add slight delay to ensure UI is ready
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [currentSection]);

  // Function to check if a section is active
  const isActive = (section: DashboardSection) => {
    return currentSection === section;
  };

  // Check if a parent section is active
  const isParentActive = (sectionPrefix: string) => {
    return typeof currentSection === 'string' && currentSection.startsWith(sectionPrefix);
  };

  // Handle rendering different badge types with enhanced styling
  const renderBadge = (badge: string | number, color: string = 'bg-primary') => {
    return (
      <span
        className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full ${color} text-xs text-primary-foreground shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10`}
      >
        {badge}
      </span>
    );
  };

  // Enhanced navigation handler with data-attributes for debugging and better UX
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
      e.currentTarget.setAttribute('data-clicked-section', section.toString());
    }

    // Visual feedback on navigation click
    if (e?.currentTarget) {
      const button = e.currentTarget as HTMLButtonElement;
      button.classList.add('scale-95', 'opacity-80');
      setTimeout(() => {
        button.classList.remove('scale-95', 'opacity-80');
      }, 150);
    }

    // Always trigger navigation to ensure proper component rendering
    changeSection(section, params);

    // Force a UI refresh after navigation
    setTimeout(() => {
      refreshUI();
      console.log(`Navigation completed to: ${section}`);
    }, 50);

    // Auto-collapse sidebar on small screens after navigation
    if (isSmallScreen && onToggle) {
      setTimeout(() => onToggle(), 300);
    }
  };

  // Main navigation items
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
      open: expandedSections.mail,
      setOpen: () => toggleSectionExpansion('mail'),
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
      open: expandedSections.leads,
      setOpen: () => toggleSectionExpansion('leads'),
    },
    {
      title: 'Templates',
      section: 'templates' as DashboardSection,
      icon: LayoutTemplate,
      hasSubmenu: true,
      open: expandedSections.templates,
      setOpen: () => toggleSectionExpansion('templates'),
    },
    {
      title: 'AI Agents',
      section: 'agents' as DashboardSection,
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-purple-500',
      hasSubmenu: true,
      open: expandedSections.agents,
      setOpen: () => toggleSectionExpansion('agents'),
    },
    {
      title: 'Workflows',
      section: 'workflows' as DashboardSection,
      icon: Workflow,
      hasSubmenu: true,
      open: expandedSections.workflows,
      setOpen: () => toggleSectionExpansion('workflows'),
    },
    {
      title: 'Notifications',
      section: 'notifications' as DashboardSection,
      icon: Bell,
      badge: '8',
      badgeColor: 'bg-amber-500',
      hasSubmenu: true,
      open: expandedSections.notifications,
      setOpen: () => toggleSectionExpansion('notifications'),
    },
    {
      title: 'Settings',
      section: 'settings' as DashboardSection,
      icon: Settings,
      hasSubmenu: true,
      open: expandedSections.settings,
      setOpen: () => toggleSectionExpansion('settings'),
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
      title: 'Compose',
      section: 'mail-compose' as DashboardSection,
      icon: PenSquare,
      badge: 'New',
      badgeColor: 'bg-blue-500',
    },
    {
      title: 'AI Insights',
      section: 'mail-insights' as DashboardSection,
      icon: Sparkles,
      badge: '5',
      badgeColor: 'bg-purple-500',
    },
    {
      title: 'Smart Replies',
      section: 'mail-smart-replies' as DashboardSection,
      icon: BrainCircuit,
      badge: 'AI',
      badgeColor: 'bg-purple-500',
    },
    {
      title: 'Auto Categorize',
      section: 'mail-categorize' as DashboardSection,
      icon: Tags,
      badge: 'AI',
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
    {
      title: 'AI Scoring',
      section: 'leads-scoring' as DashboardSection,
      icon: BrainCircuit,
      badge: 'AI',
      badgeColor: 'bg-purple-500',
    },
    {
      title: 'Auto Enrichment',
      section: 'leads-enrichment' as DashboardSection,
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-purple-500',
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
    {
      title: 'Smart Alerts',
      section: 'notifications-smart' as DashboardSection,
      icon: BrainCircuit,
      badge: 'AI',
      badgeColor: 'bg-purple-500',
    },
    {
      title: 'Priority Inbox',
      section: 'notifications-priority' as DashboardSection,
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-purple-500',
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
      open: expandedSections.emailTemplates,
      setOpen: () => toggleSectionExpansion('emailTemplates'),
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
      title: 'AI Generator',
      section: 'templates-ai-generator' as DashboardSection,
      icon: BrainCircuit,
      badge: 'AI',
      badgeColor: 'bg-purple-500',
    },
    {
      title: 'Smart Templates',
      section: 'templates-smart' as DashboardSection,
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-purple-500',
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
      title: 'Email Assistant',
      section: 'agents-email' as DashboardSection,
      icon: Mail,
      badge: 'Active',
      badgeColor: 'bg-green-500',
    },
    {
      title: 'Contact Enrichment',
      section: 'agents-contacts' as DashboardSection,
      icon: UserPlus,
      badge: 'Active',
      badgeColor: 'bg-green-500',
    },
    {
      title: 'Lead Qualification',
      section: 'agents-leads' as DashboardSection,
      icon: Briefcase,
      badge: 'Active',
      badgeColor: 'bg-green-500',
    },
    {
      title: 'Template Generator',
      section: 'agents-templates' as DashboardSection,
      icon: LayoutTemplate,
      badge: 'New',
      badgeColor: 'bg-blue-500',
    },
    {
      title: 'Notification Manager',
      section: 'agents-notifications' as DashboardSection,
      icon: Bell,
      badge: 'New',
      badgeColor: 'bg-blue-500',
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
      title: 'Profile Settings',
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

  // Render a collapsible section with submenu - fixed implementation
  const renderCollapsibleSection = (item: any, children: React.ReactNode) => {
    const isItemActive = isParentActive(item.section);
    const isCurrentlyOpen = item.open;

    return (
      <Collapsible
        key={item.section}
        open={isCurrentlyOpen}
        onOpenChange={() => item.setOpen()}
        className="space-y-1"
        data-section={item.section}
      >
        <div className="relative">
          <CollapsibleTrigger asChild>
            <Button
              variant={isItemActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-between transition-all duration-200',
                collapsed ? 'px-2' : 'px-3',
                isItemActive && !collapsed && 'bg-primary/10 font-medium'
              )}
              data-section={item.section}
              data-testid={`nav-${item.section}`}
              ref={isItemActive ? activeItemRef : null}
            >
              <div className="flex items-center">
                <item.icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    !collapsed && 'mr-2',
                    isItemActive && 'text-primary'
                  )}
                />
                {!collapsed && (
                  <span className={cn(isItemActive && 'text-primary')}>{item.title}</span>
                )}
              </div>
              {!collapsed && (
                <div className="flex items-center">
                  {item.badge && renderBadge(item.badge, item.badgeColor)}
                  <ChevronDown
                    className={cn(
                      'ml-2 h-4 w-4 transition-transform duration-200',
                      isCurrentlyOpen && 'rotate-180'
                    )}
                  />
                </div>
              )}
              {collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
            </Button>
          </CollapsibleTrigger>

          {/* Used as an overlay when in collapsed mode to handle section navigation */}
          {collapsed && (
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                if (item.action) {
                  item.action();
                } else {
                  handleNavigation(item.section, undefined, e as unknown as React.MouseEvent);
                }
              }}
            />
          )}
        </div>

        <CollapsibleContent className={cn('space-y-1', collapsed ? 'pl-1' : 'pl-6')}>
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Render a standard button - fixed implementation
  const renderNavButton = (item: any, isNested: boolean = false) => {
    const isItemActive = isActive(item.section);

    return (
      <Button
        key={item.section}
        variant={isItemActive ? 'secondary' : 'ghost'}
        size={isNested ? 'sm' : 'default'}
        className={cn(
          'w-full transition-all duration-200',
          collapsed ? 'justify-center px-2' : 'justify-start px-3',
          isItemActive && !collapsed && 'bg-primary/10 font-medium',
          isNested && 'text-sm h-8'
        )}
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
        ref={isItemActive ? activeItemRef : null}
      >
        <item.icon
          className={cn(
            'h-4 w-4 flex-shrink-0 transition-colors',
            !collapsed && 'mr-2',
            isItemActive && 'text-primary'
          )}
        />
        {!collapsed && (
          <span className={cn('truncate', isItemActive && 'text-primary')}>{item.title}</span>
        )}
        {!collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
        {collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col border-r bg-background shadow-sm transition-all duration-200',
        collapsed ? 'sidebar-collapsed' : 'sidebar-expanded',
        className
      )}
      data-testid="sidebar"
      data-collapsed={collapsed}
    >
      <div className="flex h-14 items-center px-4 py-2 border-b sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between w-full">
          {/* Logo area */}
          <div className="flex items-center">
            {collapsed ? (
              <Briefcase className="h-5 w-5 text-primary" />
            ) : (
              <span className="text-lg font-semibold tracking-tight">WorkSpaxCRM</span>
            )}
          </div>

          {/* Toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 rounded-full"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ArrowRightToLine
              className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')}
            />
          </Button>
        </div>
      </div>

      {/* Main scrollable area */}
      <ScrollArea className="flex-1 pr-2 overflow-auto" ref={scrollAreaRef} scrollHideDelay={100}>
        <div className={cn('space-y-2 py-4', collapsed ? 'px-2' : 'px-4')}>
          {/* Compose button - prominent and sticky at top */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-2 -mt-1 pt-1">
            <Button
              variant="default"
              className={cn(
                'w-full transition-all duration-200 shadow-sm',
                collapsed ? 'justify-center px-0' : 'justify-start',
                isActive('mail-compose') && 'bg-primary/90'
              )}
              onClick={e => handleNavigation('mail-compose', undefined, e)}
              data-testid="compose-button"
            >
              <PenSquare className={cn('h-4 w-4', !collapsed && 'mr-2')} />
              {!collapsed && 'Compose'}
            </Button>

            {/* Quick Actions Group */}
            <div className="flex gap-1 mt-2">
              {/* New Lead */}
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 transition-all hover:shadow-sm"
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
                      size="sm"
                      className="flex-1 transition-all hover:shadow-sm"
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

          {/* Main navigation - with virtualization for better performance */}
          <nav className="space-y-1.5" data-testid="sidebar-navigation">
            {mainNavItems.map(item => {
              // Handle items with submenus
              if (item.hasSubmenu) {
                return (
                  <React.Fragment key={item.section}>
                    {item.title === 'Mail' &&
                      renderCollapsibleSection(
                        item,
                        <div className="space-y-1">
                          {mailNavItems.map(subItem => renderNavButton(subItem, true))}
                        </div>
                      )}

                    {item.title === 'Leads' &&
                      renderCollapsibleSection(
                        item,
                        <div className="space-y-1">
                          {leadsNavItems.map(subItem => renderNavButton(subItem, true))}
                        </div>
                      )}

                    {item.title === 'Templates' &&
                      renderCollapsibleSection(
                        item,
                        <>
                          {templateNavItems.map(subItem => {
                            if (subItem.hasSubmenu) {
                              return renderCollapsibleSection(
                                subItem,
                                <div className="space-y-1">
                                  {emailTemplateItems.map(emailItem =>
                                    renderNavButton(emailItem, true)
                                  )}
                                </div>
                              );
                            }
                            return renderNavButton(subItem, true);
                          })}
                        </>
                      )}

                    {item.title === 'AI Agents' &&
                      renderCollapsibleSection(
                        item,
                        <div className="space-y-1">
                          {agentNavItems.map(subItem => renderNavButton(subItem, true))}
                        </div>
                      )}

                    {item.title === 'Workflows' &&
                      renderCollapsibleSection(
                        item,
                        <div className="space-y-1">
                          {workflowNavItems.map(subItem => renderNavButton(subItem, true))}
                        </div>
                      )}

                    {item.title === 'Notifications' &&
                      renderCollapsibleSection(
                        item,
                        <div className="space-y-1">
                          {notificationNavItems.map(subItem => renderNavButton(subItem, true))}
                        </div>
                      )}

                    {item.title === 'Settings' &&
                      renderCollapsibleSection(
                        item,
                        <div className="space-y-1">
                          {settingsNavItems.map(subItem => renderNavButton(subItem, true))}
                        </div>
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

      {/* Bottom status section - kept outside of ScrollArea */}
      {!collapsed && (
        <div className="p-4 border-t mt-auto bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-xs text-muted-foreground">AI Agents: 4 Active</p>
            </div>

            {/* Quick template button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-muted"
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
          <div className="bg-muted/50 hover:bg-muted/70 transition-colors rounded-md p-2 text-xs flex justify-between items-center">
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
