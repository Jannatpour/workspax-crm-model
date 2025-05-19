'use client';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Mail,
  Users,
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
  Building2,
  LayoutTemplate,
  PenSquare,
  Sparkles,
  Calendar,
  FolderPlus,
  UserPlus,
  AlertCircle,
  Bell,
  Briefcase,
  Archive,
  Shield,
  TrendingUp,
  Tags,
  Zap,
  Newspaper,
  UserCircle,
  InboxIcon,
  FlameKindling,
  Grid,
  ListTodo,
  Focus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useDashboard } from '@/context/dashboard-context';

// Types
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onToggle?: () => void;
}

export enum EmailFolder {
  INBOX = 'INBOX',
  SENT = 'SENT',
  DRAFTS = 'DRAFTS',
  TRASH = 'TRASH',
  ARCHIVE = 'ARCHIVE',
  SPAM = 'SPAM',
  IMPORTANT = 'IMPORTANT',
}

type DashboardSection = string;

interface NavItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: DashboardSection;
  folder?: EmailFolder;
  badge?: string | number;
  badgeColor?: string;
  children?: NavItem[];
  type?: 'separator' | 'item';
  exact?: boolean;
}

interface BadgeProps {
  value: string | number;
  color?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

// Custom hook to fetch lead counts (moved outside component)
const useLeadCounts = () => {
  const [counts, setCounts] = useState({
    new: 0,
    hot: 0,
    qualified: 0,
    contacted: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      await new Promise(resolve => setTimeout(resolve, 700));
      setCounts({
        new: 4,
        hot: 1,
        qualified: 3,
        contacted: 2,
        total: 10,
      });
    };

    fetchCounts();
  }, []);

  return counts;
};

// Custom hook to fetch notification counts (moved outside component)
const useNotificationCounts = () => {
  const [counts, setCounts] = useState({
    total: 0,
    leads: 0,
    tasks: 0,
    events: 0,
    urgent: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCounts({
        total: 8,
        leads: 3,
        tasks: 2,
        events: 1,
        urgent: 2,
      });
    };

    fetchCounts();
  }, []);

  return counts;
};

// Enhanced Badge Component
const EnhancedBadge: React.FC<BadgeProps> = React.memo(
  ({ value, color = 'bg-primary', variant = 'primary' }) => {
    // Don't render badge if value is null, undefined, empty string, or zero
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (typeof value === 'number' && value === 0) ||
      value === '0'
    ) {
      return null;
    }

    const variantStyles = {
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-green-500 text-white',
      warning: 'bg-amber-500 text-white',
      danger: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
    };

    return (
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10 transition-all',
          color || variantStyles[variant]
        )}
      >
        {value}
      </motion.span>
    );
  }
);

EnhancedBadge.displayName = 'EnhancedBadge';

// Navigation Item Component
interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  level: number;
  onNavigate: (section: DashboardSection, folder?: EmailFolder) => void;
  activeItemId?: string;
}

const NavigationItem: React.FC<NavItemProps> = React.memo(
  ({ item, isActive, collapsed, level, onNavigate, activeItemId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const hasChildren = item.children && item.children.length > 0;
    const isNested = level > 0;

    // Auto-expand if this item or any child is active
    useEffect(() => {
      if (hasChildren && item.children) {
        const hasActiveChild = item.children.some(
          child => child.id === activeItemId || child.section === activeItemId
        );
        if (hasActiveChild || item.id === activeItemId) {
          setIsOpen(true);
        }
      }
    }, [activeItemId, hasChildren, item.children, item.id]);

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (hasChildren) {
          setIsOpen(!isOpen);
        } else if (item.section) {
          onNavigate(item.section, item.folder);
        }
      },
      [hasChildren, isOpen, item.section, item.folder, onNavigate]
    );

    const buttonContent = (
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        size={isNested ? 'sm' : 'default'}
        className={cn(
          'w-full transition-all duration-300 group hover:shadow-md relative overflow-hidden',
          collapsed ? 'justify-center px-2' : 'justify-start px-3',
          isActive &&
            'bg-gradient-to-r from-primary/10 to-primary/5 font-medium border border-primary/20 shadow-sm',
          isNested && 'h-9 ml-2',
          !isActive && 'hover:bg-muted/50'
        )}
        onClick={handleClick}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
            initial={false}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        <div className="flex items-center flex-1 min-w-0">
          <item.icon
            className={cn(
              'h-4 w-4 flex-shrink-0 transition-all duration-300',
              !collapsed && 'mr-3',
              isActive && 'text-primary scale-110',
              !isActive && 'group-hover:scale-105 group-hover:text-primary/70'
            )}
          />
          {!collapsed && (
            <span
              className={cn('truncate transition-colors', isActive && 'text-primary font-medium')}
            >
              {item.title}
            </span>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2">
            {item.badge && <EnhancedBadge value={item.badge} color={item.badgeColor} />}
            {hasChildren && (
              <ChevronDown
                className={cn('h-4 w-4 transition-transform duration-300', isOpen && 'rotate-180')}
              />
            )}
          </div>
        )}

        {collapsed && item.badge && <EnhancedBadge value={item.badge} color={item.badgeColor} />}
      </Button>
    );

    const content = (
      <div
        className="relative"
        ref={isActive ? itemRef : null}
        data-active={isActive}
        data-item-id={item.id}
      >
        {collapsed ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
              <TooltipContent side="right" className="ml-2 z-50">
                <div className="flex items-center gap-2">
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="outline" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          buttonContent
        )}
      </div>
    );

    if (hasChildren && !collapsed) {
      return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>{content}</CollapsibleTrigger>
          <CollapsibleContent>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeInOut',
                    opacity: { delay: 0.1 },
                  }}
                  className="mt-1 space-y-1 overflow-hidden"
                >
                  {item.children!.map((child, index) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NavigationItem
                        item={child}
                        isActive={child.id === activeItemId || child.section === activeItemId}
                        collapsed={collapsed}
                        level={level + 1}
                        onNavigate={onNavigate}
                        activeItemId={activeItemId}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return content;
  }
);

NavigationItem.displayName = 'NavigationItem';

// Custom hook for smooth scrolling to active item
const useScrollToActive = (
  activeItemId: string,
  scrollContainerRef: React.RefObject<HTMLDivElement>
) => {
  const scrollToActiveItem = useCallback(() => {
    if (!scrollContainerRef.current || !activeItemId) return;

    const activeElement = scrollContainerRef.current.querySelector(
      `[data-item-id="${activeItemId}"], [data-active="true"]`
    ) as HTMLElement;

    if (activeElement) {
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();

      // Calculate the relative position of the element within the container
      const elementTop = elementRect.top - containerRect.top + container.scrollTop;
      const elementCenter = elementTop - container.clientHeight / 2 + elementRect.height / 2;

      // Smooth scroll to center the active item
      container.scrollTo({
        top: Math.max(0, Math.min(elementCenter, container.scrollHeight - container.clientHeight)),
        behavior: 'smooth',
      });
    }
  }, [activeItemId, scrollContainerRef]);

  useEffect(() => {
    const timeoutId = setTimeout(scrollToActiveItem, 100);
    return () => clearTimeout(timeoutId);
  }, [scrollToActiveItem]);

  return scrollToActiveItem;
};

// Main Sidebar Component
export function DynamicSidebar({ className, collapsed = false, onToggle }: SidebarProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  // Use dashboard context for navigation
  const { currentSection, changeSection } = useDashboard();
  const [activeItemId, setActiveItemId] = useState<string>('dashboard');

  // Use custom hook for scrolling to active item
  useScrollToActive(activeItemId, scrollAreaRef);

  // Email counts state
  const [emailCounts, setEmailCounts] = useState({
    [EmailFolder.INBOX]: 0,
    [EmailFolder.SENT]: 0,
    [EmailFolder.DRAFTS]: 0,
    [EmailFolder.TRASH]: 0,
    [EmailFolder.ARCHIVE]: 0,
    [EmailFolder.SPAM]: 0,
    [EmailFolder.IMPORTANT]: 0,
    unread: 0,
    starred: 0,
    needsAttention: 0,
    smartReplies: 0,
    aiInsights: 0,
  });

  // Simulate fetching email counts from an API
  useEffect(() => {
    const fetchCounts = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEmailCounts({
        [EmailFolder.INBOX]: 5,
        [EmailFolder.SENT]: 0,
        [EmailFolder.DRAFTS]: 2,
        [EmailFolder.TRASH]: 0,
        [EmailFolder.ARCHIVE]: 0,
        [EmailFolder.SPAM]: 1,
        [EmailFolder.IMPORTANT]: 3,
        unread: 5,
        starred: 8,
        needsAttention: 2,
        smartReplies: 4,
        aiInsights: 6,
      });
    };

    fetchCounts();
  }, []);

  // Use the custom hooks to get counts
  const leadCounts = useLeadCounts();
  const notificationCounts = useNotificationCounts();

  // Navigation Configuration
  const navigationConfig: NavItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        section: 'overview',
      },
      {
        id: 'mail',
        title: 'Mail',
        icon: Mail,
        badge: emailCounts.unread,
        children: [
          {
            id: 'inbox',
            title: 'Inbox',
            icon: Inbox,
            section: 'mail-inbox',
            folder: EmailFolder.INBOX,
            badge: emailCounts[EmailFolder.INBOX],
          },
          {
            id: 'important',
            title: 'Important',
            icon: Star,
            section: 'mail-important',
            badge: emailCounts[EmailFolder.IMPORTANT],
          },
          {
            id: 'sent',
            title: 'Sent',
            icon: Send,
            section: 'mail-sent',
            badge: emailCounts[EmailFolder.SENT],
          },
          {
            id: 'drafts',
            title: 'Drafts',
            icon: File,
            section: 'mail-drafts',
            badge: emailCounts[EmailFolder.DRAFTS],
          },
          {
            id: 'archive',
            title: 'Archive',
            icon: Archive,
            section: 'mail-inbox',
            folder: EmailFolder.ARCHIVE,
          },
          {
            id: 'spam',
            title: 'Spam',
            icon: Shield,
            section: 'mail-inbox',
            folder: EmailFolder.SPAM,
            badge: emailCounts[EmailFolder.SPAM],
            badgeColor: 'bg-red-500',
          },
          {
            id: 'trash',
            title: 'Trash',
            icon: Trash2,
            section: 'mail-trash',
          },
          {
            id: 'compose',
            title: 'Compose',
            icon: PenSquare,
            section: 'mail-compose',
            badge: null,
            badgeColor: 'bg-blue-500',
          },
          {
            id: 'ai-insights',
            title: 'AI Insights',
            icon: TrendingUp,
            section: 'mail-insights',
            badge: emailCounts.aiInsights,
            badgeColor: 'bg-purple-500',
          },
          {
            id: 'smart-replies',
            title: 'Smart Replies',
            icon: BrainCircuit,
            section: 'mail-smart-replies',
            badge: emailCounts.smartReplies,
            badgeColor: 'bg-purple-500',
          },
          {
            id: 'auto-categorize',
            title: 'Auto Categorize',
            icon: Tags,
            section: 'mail-categorize',
            badge: null,
            badgeColor: 'bg-purple-500',
          },
          {
            id: 'attention',
            title: 'Attention Required',
            icon: AlertCircle,
            section: 'mail-attention',
            badge: emailCounts.needsAttention,
            badgeColor: 'bg-amber-500',
          },
        ],
      },
      {
        id: 'contacts',
        title: 'Contacts',
        icon: Users,
        section: 'contacts',
      },
      {
        id: 'leads',
        title: 'Leads',
        icon: Briefcase,
        badge: leadCounts.total > 0 ? leadCounts.total : null,
        badgeColor: 'bg-green-500',
        children: [
          {
            id: 'all-leads',
            title: 'All Leads',
            icon: InboxIcon,
            section: 'leads',
          },
          {
            id: 'new-leads',
            title: 'New Leads',
            icon: UserPlus,
            section: 'leads-new',
            badge: leadCounts.new > 0 ? leadCounts.new : null,
            badgeColor: 'bg-green-500',
          },
          {
            id: 'hot-leads',
            title: 'Hot Leads',
            icon: FlameKindling,
            section: 'leads-hot',
            badge: leadCounts.hot > 0 ? leadCounts.hot : null,
            badgeColor: 'bg-red-500',
          },
          {
            id: 'ai-scoring',
            title: 'AI Scoring',
            icon: BrainCircuit,
            section: 'leads-scoring',
            badge: null,
            badgeColor: 'bg-purple-500',
          },
        ],
      },
      {
        id: 'templates',
        title: 'Templates',
        icon: LayoutTemplate,
        children: [
          {
            id: 'all-templates',
            title: 'All Templates',
            icon: Grid,
            section: 'templates',
          },
          {
            id: 'email-templates',
            title: 'Email Templates',
            icon: Mail,
            section: 'templates-email',
            badge: '32',
          },
          {
            id: 'create-template',
            title: 'Create New',
            icon: PlusCircle,
            section: 'templates-create',
            badge: 'New',
            badgeColor: 'bg-blue-500',
          },
          {
            id: 'ai-generator',
            title: 'AI Generator',
            icon: BrainCircuit,
            section: 'templates-ai-generator',
            badge: 'AI',
            badgeColor: 'bg-purple-500',
          },
        ],
      },
      {
        id: 'agents',
        title: 'AI Agents',
        icon: Bot,
        badge: 'AI',
        badgeColor: 'bg-purple-500',
        children: [
          {
            id: 'agents-overview',
            title: 'Overview',
            icon: BarChart2,
            section: 'agents',
          },
          {
            id: 'email-assistant',
            title: 'Email Assistant',
            icon: Mail,
            section: 'agents-email',
            badge: 'Active',
            badgeColor: 'bg-green-500',
          },
          {
            id: 'lead-qualification',
            title: 'Lead Qualification',
            icon: Briefcase,
            section: 'agents-leads',
            badge: 'Active',
            badgeColor: 'bg-green-500',
          },
        ],
      },
      {
        id: 'workflows',
        title: 'Workflows',
        icon: Workflow,
        children: [
          {
            id: 'workflow-overview',
            title: 'Overview',
            icon: BarChart2,
            section: 'workflows',
          },
          {
            id: 'my-workflows',
            title: 'My Workflows',
            icon: Workflow,
            section: 'workflows-my',
          },
          {
            id: 'automations',
            title: 'Automations',
            icon: Zap,
            section: 'workflows-automations',
          },
          {
            id: 'create-workflow',
            title: 'Create New',
            icon: PlusCircle,
            section: 'workflows-create',
            badge: 'New',
            badgeColor: 'bg-blue-500',
          },
        ],
      },
      {
        id: 'notifications',
        title: 'Notifications',
        icon: Bell,
        badge: notificationCounts.total > 0 ? notificationCounts.total : null,
        badgeColor: 'bg-amber-500',
        children: [
          {
            id: 'all-notifications',
            title: 'All',
            icon: Bell,
            section: 'notifications',
            badge: notificationCounts.total > 0 ? notificationCounts.total : null,
          },
          {
            id: 'lead-notifications',
            title: 'Leads',
            icon: Briefcase,
            section: 'notifications-leads',
            badge: notificationCounts.leads > 0 ? notificationCounts.leads : null,
          },
          {
            id: 'task-notifications',
            title: 'Tasks',
            icon: ListTodo,
            section: 'notifications-tasks',
            badge: notificationCounts.tasks > 0 ? notificationCounts.tasks : null,
          },
          {
            id: 'urgent-notifications',
            title: 'Urgent',
            icon: AlertCircle,
            section: 'notifications-urgent',
            badge: notificationCounts.urgent > 0 ? notificationCounts.urgent : null,
            badgeColor: 'bg-red-500',
          },
        ],
      },
      {
        id: 'settings',
        title: 'Settings',
        icon: Settings,
        children: [
          {
            id: 'settings-overview',
            title: 'Overview',
            icon: BarChart2,
            section: 'settings',
          },
          {
            id: 'workspace',
            title: 'Workspace',
            icon: Building2,
            section: 'settings-workspace',
          },
          {
            id: 'email-settings',
            title: 'Email',
            icon: Mail,
            section: 'settings-email',
          },
          {
            id: 'ai-settings',
            title: 'AI Settings',
            icon: BrainCircuit,
            section: 'settings-ai',
            badge: null,
            badgeColor: 'bg-purple-500',
          },
          {
            id: 'profile',
            title: 'Profile',
            icon: UserCircle,
            section: 'settings-profile',
          },
        ],
      },
    ],
    [emailCounts, leadCounts, notificationCounts]
  );

  // Update activeItemId when currentSection changes
  useEffect(() => {
    const findItemId = (items: NavItem[]): string | null => {
      for (const item of items) {
        if (item.section === currentSection) {
          return item.id;
        }
        if (item.children) {
          const childId = findItemId(item.children);
          if (childId) return childId;
        }
      }
      return null;
    };

    const itemId = findItemId(navigationConfig);
    if (itemId) {
      setActiveItemId(itemId);
    }
  }, [currentSection, navigationConfig]);

  // Navigation handler with improved state management
  const handleNavigation = useCallback(
    (section: DashboardSection, folder?: EmailFolder) => {
      changeSection(section, folder ? { folder } : undefined);

      const findItemId = (items: NavItem[]): string | null => {
        for (const item of items) {
          if (item.section === section && item.folder === folder) {
            return item.id;
          }
          if (item.section === section && !folder) {
            return item.id;
          }
          if (item.children) {
            const childId = findItemId(item.children);
            if (childId) return childId;
          }
        }
        return null;
      };

      const itemId = findItemId(navigationConfig);
      if (itemId) {
        setActiveItemId(itemId);
      }

      if (isSmallScreen && onToggle) {
        setTimeout(() => onToggle(), 300);
      }
    },
    [navigationConfig, isSmallScreen, onToggle, changeSection]
  );

  // Check if section is active
  const isActive = useCallback(
    (item: NavItem): boolean => {
      return item.id === activeItemId || item.section === currentSection;
    },
    [activeItemId, currentSection]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (collapsed || !scrollAreaRef.current) return;

      const items = Array.from(
        scrollAreaRef.current.querySelectorAll('[data-item-id]')
      ) as HTMLElement[];

      const currentIndex = items.findIndex(
        item => item.getAttribute('data-item-id') === activeItemId
      );

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          nextIndex = Math.min(currentIndex + 1, items.length - 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Enter':
          event.preventDefault();
          if (currentIndex >= 0) {
            items[currentIndex].click();
          }
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex && items[nextIndex]) {
        const nextItemId = items[nextIndex].getAttribute('data-item-id');
        if (nextItemId) {
          setActiveItemId(nextItemId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItemId, collapsed]);

  return (
    <motion.div
      initial={{ width: collapsed ? 80 : 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'flex flex-col border-r bg-background/80 backdrop-blur-sm shadow-lg relative',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b bg-gradient-to-r from-background to-muted/20">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              WorkSpaceCRM
            </span>
          </motion.div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-9 w-9 rounded-full hover:bg-muted/60 transition-all hover:scale-105"
        >
          <ArrowRightToLine
            className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')}
          />
        </Button>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 space-y-3"
        >
          <Button
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            onClick={() => handleNavigation('mail-compose')}
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Compose Email
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-muted/60 transition-all hover:scale-105"
              onClick={() => handleNavigation('leads-new')}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              New Lead
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-muted/60 transition-all hover:scale-105"
              onClick={() => handleNavigation('templates-create')}
            >
              <LayoutTemplate className="h-4 w-4 mr-1" />
              Template
            </Button>
          </div>
        </motion.div>
      )}

      <Separator />

      {/* Navigation with improved scrolling */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn('p-4 space-y-2 pb-20', collapsed && 'px-2')}
          >
            {navigationConfig.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <NavigationItem
                  item={item}
                  isActive={isActive(item)}
                  collapsed={collapsed}
                  level={0}
                  onNavigate={handleNavigation}
                  activeItemId={activeItemId}
                />
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>

        {/* Scroll indicators */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent pointer-events-none opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent pointer-events-none opacity-60" />
      </div>

      {/* Footer */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 border-t bg-gradient-to-t from-muted/20 to-background"
        >
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-200/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-muted-foreground">AI Agents Active</span>
              </div>
              <Badge variant="outline" className="text-xs bg-green-500/10">
                4 Running
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Processing {emailCounts.unread} emails
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
