'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronRight,
  MailOpen,
  MailX,
  Paperclip,
  RefreshCcw,
  Search,
  Star,
  Trash2,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { fetchEmails, markAsRead, markAsUnread, markAsStarred, deleteEmail } from '@/lib/api/email';

// Create a toast hook to replace the missing useToast
const useToast = () => {
  return {
    toast,
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warning(message),
    info: (message: string) => toast.info(message),
  };
};

/**
 * Email priority levels
 */
type EmailPriority = 'high' | 'medium' | 'low' | 'none';

/**
 * Email read status
 */
type EmailReadStatus = 'read' | 'unread';

/**
 * Email category/folder
 */
type EmailCategory = 'primary' | 'social' | 'promotions' | 'updates' | 'forums';

/**
 * Email attachment type
 */
interface EmailAttachment {
  id: string;
  filename: string;
  size: number; // Size in bytes
  type: string; // MIME type
  url: string;
}

/**
 * Email object type definition
 */
interface Email {
  id: string;
  subject: string;
  snippet: string;
  body?: string;
  sender: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  recipients: {
    to: Array<{ name: string; email: string }>;
    cc?: Array<{ name: string; email: string }>;
    bcc?: Array<{ name: string; email: string }>;
  };
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  labels?: string[];
  category?: EmailCategory;
  priority: EmailPriority;
  threadId: string;
  isArchived: boolean;
  isDeleted: boolean;
}

/**
 * Filter options for emails
 */
interface EmailFilterOptions {
  status?: EmailReadStatus;
  search?: string;
  category?: EmailCategory;
  hasAttachments?: boolean;
  isStarred?: boolean;
  priority?: EmailPriority;
}

/**
 * Sort options for emails
 */
type EmailSortOption =
  | 'date-desc'
  | 'date-asc'
  | 'priority-desc'
  | 'priority-asc'
  | 'sender-asc'
  | 'sender-desc';

/**
 * Time period grouping options
 */
type TimePeriod = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'older';

/**
 * Properties for the RecentEmails component
 */
interface RecentEmailsProps {
  /**
   * Maximum number of emails to display
   */
  limit?: number;

  /**
   * Whether to auto refresh emails
   */
  autoRefresh?: boolean;

  /**
   * Auto refresh interval in seconds
   */
  refreshInterval?: number;

  /**
   * Initial filter options
   */
  initialFilters?: EmailFilterOptions;

  /**
   * Whether to display email categories
   */
  showCategories?: boolean;

  /**
   * Whether to mark emails as read when viewed
   */
  markAsReadOnView?: boolean;

  /**
   * Callback function when an email is selected
   */
  onSelectEmail?: (email: Email) => void;

  /**
   * Callback function when an email is deleted
   */
  onDeleteEmail?: (emailId: string) => void;

  /**
   * Callback function when multiple emails are selected
   */
  onSelectionChange?: (selectedIds: string[]) => void;

  /**
   * Whether to show action buttons
   */
  showActions?: boolean;

  /**
   * Whether to group emails by time period
   */
  groupByTimePeriod?: boolean;

  /**
   * CSS class for custom styling
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

/**
 * Helper function to get initials from a name
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Format a date for display in the UI
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (isThisWeek(date)) {
    return format(date, 'EEE');
  } else if (isThisMonth(date)) {
    return format(date, 'MMM d');
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

/**
 * Get time period grouping for an email
 */
const getTimePeriod = (dateString: string): TimePeriod => {
  const date = new Date(dateString);

  if (isToday(date)) return 'today';
  if (isYesterday(date)) return 'yesterday';
  if (isThisWeek(date)) return 'this_week';
  if (isThisMonth(date)) return 'this_month';
  return 'older';
};

/**
 * Renders a styled priority indicator for an email
 */
const PriorityIndicator = ({ priority }: { priority: EmailPriority }) => {
  if (priority === 'none') return null;

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`h-2 w-2 rounded-full ${priorityColors[priority]}`} />
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{priority} priority</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Email item skeleton for loading state
 */
const EmailItemSkeleton = () => (
  <div className="flex items-center space-x-4 py-3">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-9 w-9 rounded-full" />
    </div>
    <div className="space-y-2 flex-1">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-[180px]" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

/**
 * Empty state component when no emails are found
 */
const EmptyState = ({
  filtered = false,
  onRefresh,
}: {
  filtered?: boolean;
  onRefresh?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="bg-muted/50 p-3 rounded-full mb-4">
      <Mail className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium mb-2">
      {filtered ? 'No matching emails' : 'No recent emails'}
    </h3>
    <p className="text-muted-foreground max-w-md mb-4">
      {filtered
        ? 'Try adjusting your filters or search terms to see more results.'
        : "Your inbox is empty. When you receive new emails, they'll appear here."}
    </p>
    {onRefresh && (
      <Button variant="outline" onClick={onRefresh}>
        <RefreshCcw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    )}
  </div>
);

/**
 * Email item component
 */
const EmailItem = ({
  email,
  isSelected,
  onSelect,
  onView,
  onDelete,
  onMarkAsRead,
  onMarkAsStarred,
}: {
  email: Email;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onDelete: () => void;
  onMarkAsRead: () => void;
  onMarkAsStarred: () => void;
}) => {
  return (
    <div
      className={cn(
        'flex items-start p-3 gap-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer',
        email.isRead ? 'bg-background' : 'bg-muted/30 font-medium',
        isSelected && 'bg-primary/10 border-primary'
      )}
      onClick={onSelect}
    >
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={e => {
            e.stopPropagation();
            onMarkAsStarred();
          }}
          className="text-muted-foreground hover:text-yellow-400 transition-colors"
        >
          <Star className={cn('h-4 w-4', email.isStarred && 'fill-yellow-400 text-yellow-400')} />
        </button>
        <div className="mt-1">
          <PriorityIndicator priority={email.priority} />
        </div>
      </div>

      <Avatar className="mt-1">
        {email.sender.avatarUrl ? (
          <AvatarImage src={email.sender.avatarUrl} alt={email.sender.name} />
        ) : (
          <AvatarFallback>{getInitials(email.sender.name)}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <span className="font-medium truncate">{email.sender.name}</span>
              {email.category && (
                <Badge variant="outline" className="ml-2 text-xs h-5 px-1.5">
                  {email.category}
                </Badge>
              )}
            </div>
            <h4 className="text-sm truncate">{email.subject}</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">{email.snippet}</p>
          </div>

          <div className="flex flex-col items-end gap-1 ml-2 min-w-[60px]">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(email.timestamp)}
            </span>
            <div className="flex items-center space-x-1">
              {email.hasAttachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}
              {!email.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={e => {
                e.stopPropagation();
                onView();
              }}
            >
              <MailOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={e => {
                e.stopPropagation();
                onMarkAsRead();
              }}
            >
              {email.isRead ? <MailX className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a query client instance
const queryClient = new QueryClient();

/**
 * Internal RecentEmails component that uses React Query hooks
 */
function RecentEmailsInternal({
  limit = 10,
  autoRefresh = false,
  refreshInterval = 60,
  initialFilters = {},
  showCategories = true,
  markAsReadOnView = true,
  onSelectEmail,
  onDeleteEmail,
  onSelectionChange,
  showActions = true,
  groupByTimePeriod = true,
  className,
  testId,
}: RecentEmailsProps) {
  // State
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [filters, setFilters] = useState<EmailFilterOptions>(initialFilters);
  const [sortOption, setSortOption] = useState<EmailSortOption>('date-desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<EmailCategory | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Hooks
  const router = useRouter();
  const { toast } = useToast();

  // Fetch emails with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recentEmails', limit, filters],
    queryFn: () => fetchEmails({ limit, ...filters }),
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  // Handle refresh manually
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);

    toast({
      title: 'Emails refreshed',
      description: 'Your emails have been updated.',
    });
  };

  // Apply category filter
  useEffect(() => {
    if (activeCategory !== 'all') {
      setFilters(prev => ({
        ...prev,
        category: activeCategory as EmailCategory,
      }));
    } else {
      setFilters(prev => {
        const { category, ...rest } = prev;
        return rest;
      });
    }
  }, [activeCategory]);

  // Apply search filter
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm) {
        setFilters(prev => ({
          ...prev,
          search: searchTerm,
        }));
      } else {
        setFilters(prev => {
          const { search, ...rest } = prev;
          return rest;
        });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Update selection change callback
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedEmails);
    }
  }, [selectedEmails, onSelectionChange]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        refetch();
      }, refreshInterval * 1000);

      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, refreshInterval, refetch]);

  // Sort emails
  const sortedEmails = useMemo(() => {
    if (!data) return [];

    const emails = [...data];

    switch (sortOption) {
      case 'date-desc':
        return emails.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      case 'date-asc':
        return emails.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      case 'priority-desc':
        const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };
        return emails.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      case 'priority-asc':
        const priorityOrderAsc = { none: 0, low: 1, medium: 2, high: 3 };
        return emails.sort((a, b) => priorityOrderAsc[a.priority] - priorityOrderAsc[b.priority]);
      case 'sender-asc':
        return emails.sort((a, b) => a.sender.name.localeCompare(b.sender.name));
      case 'sender-desc':
        return emails.sort((a, b) => b.sender.name.localeCompare(a.sender.name));
      default:
        return emails;
    }
  }, [data, sortOption]);

  // Group emails by time period
  const groupedEmails = useMemo(() => {
    if (!groupByTimePeriod) return { all: sortedEmails };

    return sortedEmails.reduce((acc, email) => {
      const period = getTimePeriod(email.timestamp);
      if (!acc[period]) acc[period] = [];
      acc[period].push(email);
      return acc;
    }, {} as Record<string, Email[]>);
  }, [sortedEmails, groupByTimePeriod]);

  // Toggle email selection
  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmails(prev =>
      prev.includes(emailId) ? prev.filter(id => id !== emailId) : [...prev, emailId]
    );
  };

  // Toggle all emails selection
  const toggleAllSelection = () => {
    if (selectedEmails.length === sortedEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(sortedEmails.map(email => email.id));
    }
  };

  // Handle viewing an email
  const handleViewEmail = (email: Email) => {
    if (markAsReadOnView && !email.isRead) {
      markAsRead(email.id).then(() => {
        refetch();
      });
    }

    if (onSelectEmail) {
      onSelectEmail(email);
    } else {
      router.push(`/dashboard/email/${email.id}`);
    }
  };

  // Handle marking email as read/unread
  const handleToggleReadStatus = (email: Email) => {
    if (email.isRead) {
      markAsUnread(email.id).then(() => {
        refetch();
        toast({
          title: 'Marked as unread',
          description: 'Email has been marked as unread.',
        });
      });
    } else {
      markAsRead(email.id).then(() => {
        refetch();
        toast({
          title: 'Marked as read',
          description: 'Email has been marked as read.',
        });
      });
    }
  };

  // Handle toggling starred status
  const handleToggleStarred = (email: Email) => {
    markAsStarred(email.id, !email.isStarred).then(() => {
      refetch();
      toast({
        title: email.isStarred ? 'Unstarred' : 'Starred',
        description: `Email has been ${email.isStarred ? 'removed from' : 'added to'} starred.`,
      });
    });
  };

  // Handle deleting an email
  const handleDeleteEmail = (emailId: string) => {
    deleteEmail(emailId).then(() => {
      refetch();
      setSelectedEmails(prev => prev.filter(id => id !== emailId));

      if (onDeleteEmail) {
        onDeleteEmail(emailId);
      }

      toast({
        title: 'Email deleted',
        description: 'The email has been moved to trash.',
      });
    });
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedEmails.length === 0) return;

    switch (action) {
      case 'mark-read':
        Promise.all(selectedEmails.map(id => markAsRead(id))).then(() => {
          refetch();
          toast({
            title: 'Emails marked as read',
            description: `${selectedEmails.length} emails have been marked as read.`,
          });
        });
        break;
      case 'mark-unread':
        Promise.all(selectedEmails.map(id => markAsUnread(id))).then(() => {
          refetch();
          toast({
            title: 'Emails marked as unread',
            description: `${selectedEmails.length} emails have been marked as unread.`,
          });
        });
        break;
      case 'delete':
        Promise.all(selectedEmails.map(id => deleteEmail(id))).then(() => {
          refetch();
          if (onDeleteEmail && selectedEmails.length === 1) {
            onDeleteEmail(selectedEmails[0]);
          }
          toast({
            title: 'Emails deleted',
            description: `${selectedEmails.length} emails have been moved to trash.`,
          });
          setSelectedEmails([]);
        });
        break;
      default:
        break;
    }
  };

  // Render time period heading
  const renderTimePeriodHeading = (period: string) => {
    const labels = {
      today: 'Today',
      yesterday: 'Yesterday',
      this_week: 'This Week',
      this_month: 'This Month',
      older: 'Older',
      all: 'All Emails',
    };

    return <h3 className="text-sm font-medium py-2">{labels[period as keyof typeof labels]}</h3>;
  };

  // Render error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
          <CardDescription>There was an error loading your emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <h3 className="text-lg font-medium mb-2">Failed to load emails</h3>
            <p className="text-muted-foreground max-w-md mb-4">
              There was an error loading your recent emails. Please try again later.
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)} data-testid={testId}>
      <CardHeader className="space-y-0 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Emails</CardTitle>
            <CardDescription>Your latest email conversations</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Button disabled variant="outline" size="sm">
                <Skeleton className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCcw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              </Button>
            )}

            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/email">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-2 mt-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search emails..."
                className="w-[200px] md:w-[240px] pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={sortOption}
              onValueChange={value => setSortOption(value as EmailSortOption)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="priority-desc">Highest Priority</SelectItem>
                <SelectItem value="priority-asc">Lowest Priority</SelectItem>
                <SelectItem value="sender-asc">Sender A-Z</SelectItem>
                <SelectItem value="sender-desc">Sender Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showCategories && (
            <Tabs
              value={activeCategory}
              onValueChange={value => setActiveCategory(value as EmailCategory | 'all')}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-3 md:grid-cols-5 h-9 w-full md:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="primary">Primary</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="promotions">Promo</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-0">
        {showActions && (
          <div className="border-b border-b-muted px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleAllSelection}
                disabled={isLoading || !data || data.length === 0}
              >
                <CheckCircle2
                  className={cn(
                    'h-4 w-4',
                    selectedEmails.length > 0 &&
                      selectedEmails.length === sortedEmails.length &&
                      'text-primary fill-primary'
                  )}
                />
              </Button>

              {selectedEmails.length > 0 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleBulkAction('mark-read')}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    <span className="text-xs">Read</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleBulkAction('mark-unread')}
                  >
                    <MailOpen className="h-4 w-4 mr-1" />
                    <span className="text-xs">Unread</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-destructive"
                    onClick={() => handleBulkAction('delete')}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">Delete</span>
                  </Button>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{data ? data.length : 0} emails</div>
          </div>
        )}

        <ScrollArea className="h-[500px]">
          <div className="px-3 py-2">
            {isLoading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(null)
                  .map((_, index) => (
                    <EmailItemSkeleton key={index} />
                  ))}
              </div>
            ) : sortedEmails.length === 0 ? (
              <EmptyState
                filtered={!!searchTerm || Object.keys(filters).length > 0}
                onRefresh={handleRefresh}
              />
            ) : (
              <>
                {groupByTimePeriod ? (
                  Object.entries(groupedEmails).map(
                    ([period, emails]) =>
                      emails.length > 0 && (
                        <div key={period} className="mb-4">
                          {renderTimePeriodHeading(period)}
                          <div className="space-y-1">
                            {emails.map(email => (
                              <EmailItem
                                key={email.id}
                                email={email}
                                isSelected={selectedEmails.includes(email.id)}
                                onSelect={() => toggleEmailSelection(email.id)}
                                onView={() => handleViewEmail(email)}
                                onDelete={() => handleDeleteEmail(email.id)}
                                onMarkAsRead={() => handleToggleReadStatus(email)}
                                onMarkAsStarred={() => handleToggleStarred(email)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                  )
                ) : (
                  <div className="space-y-1">
                    {sortedEmails.map(email => (
                      <EmailItem
                        key={email.id}
                        email={email}
                        isSelected={selectedEmails.includes(email.id)}
                        onSelect={() => toggleEmailSelection(email.id)}
                        onView={() => handleViewEmail(email)}
                        onDelete={() => handleDeleteEmail(email.id)}
                        onMarkAsRead={() => handleToggleReadStatus(email)}
                        onMarkAsStarred={() => handleToggleStarred(email)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex justify-between border-t px-6 py-3">
        <div className="text-xs text-muted-foreground">
          {data && data.filter(email => !email.isRead).length} unread
        </div>
        <Button asChild variant="ghost" size="sm">
          <a href="/dashboard/email/compose">
            Compose
            <Mail className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * RecentEmails Component with QueryClientProvider wrapper
 */
export function RecentEmails(props: RecentEmailsProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RecentEmailsInternal {...props} />
    </QueryClientProvider>
  );
}

// Export default as well for convenience
export default RecentEmails;
