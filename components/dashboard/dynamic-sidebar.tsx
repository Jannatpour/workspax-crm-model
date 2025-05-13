'use client';
import React from 'react';
import Link from 'next/link';
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
  Sparkles,
  Zap,
  MessageSquareText,
  BellRing,
  FolderTree,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDashboard, DashboardSection } from '@/context/dashboard-context';

interface DynamicSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function DynamicSidebar({ className, collapsed = false, onToggle }: DynamicSidebarProps) {
  const { currentSection, changeSection } = useDashboard();
  const [mailOpen, setMailOpen] = React.useState(!collapsed);
  const [agentsOpen, setAgentsOpen] = React.useState(!collapsed);
  const [workflowsOpen, setWorkflowsOpen] = React.useState(false);

  // Function to check if a section is active
  const isActive = (section: DashboardSection) => {
    return currentSection === section;
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

  // Handle section change
  const handleSectionChange = (section: DashboardSection) => {
    // We use preventDefault to avoid actual navigation
    changeSection(section);
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
      title: 'Templates',
      section: 'templates' as DashboardSection,
      icon: FileText,
    },
    {
      title: 'AI Agents',
      section: 'agents' as DashboardSection,
      icon: Bot,
      badge: 'New',
      badgeColor: 'bg-green-500',
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
      title: 'Settings',
      section: 'settings' as DashboardSection,
      icon: Settings,
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
      title: 'Trash',
      section: 'mail-trash' as DashboardSection,
      icon: Trash2,
    },
    {
      title: 'Important',
      section: 'mail-important' as DashboardSection,
      icon: Star,
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
  ];

  return (
    <div className={cn('flex flex-col border-r bg-background', className)}>
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
              onClick={() => handleSectionChange('mail-compose')}
            >
              <PlusCircle className={cn('h-4 w-4', !collapsed && 'mr-2')} />
              {!collapsed && 'Compose'}
            </Button>
          </div>

          <Separator className="my-4" />

          <nav className="space-y-1.5">
            {mainNavItems.map(item => {
              // Determine if this item or any of its children is active
              const active = isActive(item.section);

              if (item.hasSubmenu) {
                // Render collapsible submenu
                return (
                  <Collapsible
                    key={item.section}
                    open={collapsed ? false : item.open}
                    onOpenChange={item.setOpen}
                    className="space-y-1"
                  >
                    <div className="flex">
                      <CollapsibleTrigger asChild className="flex flex-1">
                        <Button
                          variant={active ? 'secondary' : 'ghost'}
                          className={cn('w-full justify-between', collapsed ? 'px-2' : 'px-3')}
                          onClick={() => handleSectionChange(item.section)}
                        >
                          <div className="flex items-center">
                            <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                            {!collapsed && item.title}
                          </div>
                          {!collapsed && (
                            <div className="flex items-center">
                              {item.badge && renderBadge(item.badge, item.badgeColor)}
                              {item.open ? (
                                <ChevronDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ChevronRight className="ml-2 h-4 w-4" />
                              )}
                            </div>
                          )}
                          {collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-1 pl-6">
                      {item.title === 'Mail' &&
                        mailNavItems.map(subItem => (
                          <Button
                            key={subItem.section}
                            variant={isActive(subItem.section) ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn('w-full justify-start', collapsed && 'hidden')}
                            onClick={() => handleSectionChange(subItem.section)}
                          >
                            <subItem.icon className="mr-2 h-4 w-4" />
                            {subItem.title}
                            {subItem.badge && renderBadge(subItem.badge)}
                          </Button>
                        ))}

                      {item.title === 'AI Agents' &&
                        agentNavItems.map(subItem => (
                          <Button
                            key={subItem.section}
                            variant={isActive(subItem.section) ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn('w-full justify-start', collapsed && 'hidden')}
                            onClick={() => handleSectionChange(subItem.section)}
                          >
                            <subItem.icon className="mr-2 h-4 w-4" />
                            {subItem.title}
                          </Button>
                        ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              } else {
                // Render regular nav item
                return (
                  <Button
                    key={item.section}
                    variant={active ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full',
                      collapsed ? 'justify-center px-2' : 'justify-start px-3'
                    )}
                    onClick={() => handleSectionChange(item.section)}
                  >
                    <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                    {!collapsed && item.title}
                    {!collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
                    {collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
                  </Button>
                );
              }
            })}
          </nav>
        </div>
      </ScrollArea>

      {!collapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-xs text-muted-foreground">AI Agents: 4 Active</p>
          </div>
        </div>
      )}
    </div>
  );
}
