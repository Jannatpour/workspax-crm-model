'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Users,
  User,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Tag,
  Search,
  Plus,
  MoreHorizontal,
  Star,
  StarOff,
  FileText,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  MessageSquare,
  BellRing,
  CheckCheck,
  Sparkles,
  Building,
  AlarmClock,
  Info,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useContactAnalytics } from '@/hooks/use-contact-analytics';
import { useContactGroups } from '@/hooks/use-contact-groups';
import { useContactAI } from '@/hooks/use-contact-ai';
import { PeriodSelector } from '@/components/ui/period-selector';
import { LineChart, BarChart, DonutChart } from '@/components/ui/charts';
import { cn, formatNumber, formatDate, formatPercentage } from '@/lib/utils';
import { Download } from 'lucide-react';

// Types for the components
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  status?: 'active' | 'inactive' | 'lead' | 'customer' | 'prospect' | 'archived';
  isStarred?: boolean;
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  engagementScore?: 'high' | 'medium' | 'low' | 'none';
  avatarUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  activities?: ContactActivity[];
}

interface ContactActivity {
  id: string;
  contactId: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'other';
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

interface ContactGroup {
  id: string;
  name: string;
  count: number;
  isSmartGroup?: boolean;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface AggregateMetrics {
  totalContacts: number;
  activeContacts: number;
  newContactsThisPeriod: number;
  averageEngagementRate: number;
  contactsWithTasks: number;
  contactsWithFollowUps: number;
  emailsSentThisPeriod: number;
  meetingsThisPeriod: number;
  tagsCreatedThisPeriod: number;
  topContactedContacts: Contact[];
  growthRate: number;
  contactsByStatus: Record<string, number>;
  contactsByEngagement: Record<string, number>;
  contactsByCompany: Record<string, number>;
  activitiesByType: Record<string, number>;
}

interface ContactsOverviewProps {
  /**
   * Array of contacts to display
   */
  contacts?: Contact[];

  /**
   * Callback when a contact is clicked
   */
  onContactClick?: (contactId: string) => void;

  /**
   * Callback when a contact is starred/unstarred
   */
  onContactStar?: (contactId: string, starred: boolean) => void;

  /**
   * Callback to create a new contact
   */
  onCreateContact?: () => void;

  /**
   * Callback to import contacts
   */
  onImportContacts?: () => void;

  /**
   * Callback to export contacts
   */
  onExportContacts?: () => void;

  /**
   * Callback to delete a contact
   */
  onDeleteContact?: (contactId: string) => void;

  /**
   * Callback to send an email to contacts
   */
  onSendEmail?: (contactIds: string[]) => void;

  /**
   * Enable AI features
   */
  enableAI?: boolean;

  /**
   * User's time zone for date formatting
   */
  timeZone?: string;

  /**
   * Initial loading state
   */
  initialLoading?: boolean;

  /**
   * Error state
   */
  error?: Error | null;

  /**
   * Optional className for styling
   */
  className?: string;
}

// Helper functions
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Activity Item Component
 */
const ActivityItem = ({ activity }: { activity: ContactActivity & { contact?: Contact } }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'call':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'note':
        return <FileText className="h-4 w-4 text-amber-500" />;
      case 'task':
        return <CheckCheck className="h-4 w-4 text-indigo-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 mb-3 last:mb-0">
      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-none">
            {activity.contact?.firstName} {activity.contact?.lastName}
          </p>
          <span className="text-xs text-muted-foreground">{formatDate(activity.date)}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
      </div>
    </div>
  );
};

/**
 * Contact Card Component
 */
const ContactCard = ({
  contact,
  onStar,
  onClick,
}: {
  contact: Contact;
  onStar?: (id: string, starred: boolean) => void;
  onClick?: (id: string) => void;
}) => {
  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
      <div className="flex" onClick={() => onClick?.(contact.id)}>
        <CardContent className="p-4 flex-1">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {contact.avatarUrl ? (
                <AvatarImage
                  src={contact.avatarUrl}
                  alt={`${contact.firstName} ${contact.lastName}`}
                />
              ) : (
                <AvatarFallback>
                  {getInitials(`${contact.firstName} ${contact.lastName}`)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center">
                <h3 className="font-medium truncate">
                  {contact.firstName} {contact.lastName}
                </h3>
                {onStar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={e => {
                      e.stopPropagation();
                      onStar(contact.id, !contact.isStarred);
                    }}
                  >
                    {contact.isStarred ? (
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <Star className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
              {contact.title && contact.company && (
                <p className="text-xs text-muted-foreground truncate">
                  {contact.title} at {contact.company}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center text-xs">
              <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span className="truncate">{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center text-xs">
                <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.status && (
              <div className="flex items-center text-xs">
                <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <Badge variant="outline" className="px-1.5 h-5 capitalize text-xs">
                  {contact.status}
                </Badge>
              </div>
            )}
          </div>

          {contact.tags && contact.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {contact.tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="px-1.5 h-5 text-xs"
                  style={{
                    backgroundColor: `${tag.color}10`,
                    borderColor: tag.color,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        {contact.engagementScore && (
          <div
            className="w-1 h-auto"
            style={{
              backgroundColor:
                contact.engagementScore === 'high'
                  ? '#22c55e'
                  : contact.engagementScore === 'medium'
                  ? '#eab308'
                  : contact.engagementScore === 'low'
                  ? '#f97316'
                  : '#e5e7eb',
            }}
          ></div>
        )}
      </div>

      {(contact.nextFollowUpDate || contact.lastContactedAt) && (
        <CardFooter className="px-4 py-2 bg-muted/50 text-xs text-muted-foreground flex justify-between">
          {contact.lastContactedAt && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Last: {formatDate(contact.lastContactedAt)}</span>
            </div>
          )}
          {contact.nextFollowUpDate && (
            <div className="flex items-center">
              <AlarmClock className="h-3 w-3 mr-1" />
              <span>Follow-up: {formatDate(contact.nextFollowUpDate)}</span>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * Contact Metrics Card
 */
const MetricCard = ({
  title,
  value,
  icon,
  change,
  helperText,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  helperText?: string;
  onClick?: () => void;
}) => {
  return (
    <Card
      className={cn(
        'overflow-hidden',
        onClick && 'cursor-pointer hover:border-primary/50 transition-colors'
      )}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {(change !== undefined || helperText) && (
          <div className="flex items-center mt-1">
            {change !== undefined && (
              <Badge
                variant={change >= 0 ? 'success' : 'destructive'}
                className="mr-2 px-1 text-xs font-normal"
              >
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(change)}%
              </Badge>
            )}
            {helperText && <span className="text-xs text-muted-foreground">{helperText}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Loading Skeleton
 */
const ContactsOverviewSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-[120px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-8 w-[80px] mb-2" />
                <Skeleton className="h-4 w-[120px]" />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-0">
            <Skeleton className="h-6 w-[140px]" />
          </CardHeader>
          <CardContent className="p-4">
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-0">
            <Skeleton className="h-6 w-[140px]" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-[80%]" />
                      <Skeleton className="h-3 w-[60%]" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="p-4 pb-0">
            <Skeleton className="h-6 w-[140px]" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-4 w-[50px]" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-0">
            <Skeleton className="h-6 w-[140px]" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-4 w-4 rounded-full mt-1" />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-3 w-[50px]" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-0">
            <Skeleton className="h-6 w-[140px]" />
          </CardHeader>
          <CardContent className="p-4">
            <Skeleton className="h-[150px] w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Error State Component
 */
const ErrorState = ({ error, onRetry }: { error: Error; onRetry?: () => void }) => {
  return (
    <Card className="w-full py-8">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-red-100 p-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load contacts overview</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{error.message}</p>
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Main ContactsOverview Component
 */
export function ContactsOverview({
  contacts = [],
  onContactClick,
  onContactStar,
  onCreateContact,
  onImportContacts,

  onSendEmail,
  enableAI = false,

  initialLoading = false,
  error = null,
  className,
}: ContactsOverviewProps) {
  // State
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [stats, setStats] = useState<AggregateMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [activities, setActivities] = useState<(ContactActivity & { contact?: Contact })[]>([]);
  const [topTags, setTopTags] = useState<Tag[]>([]);
  const [topGroups, setTopGroups] = useState<ContactGroup[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [showAIInsightsDialog, setShowAIInsightsDialog] = useState(false);

  // Router
  const router = useRouter();

  // Hooks
  const { getContactMetrics, getContactActivities, getTagsOverview } = useContactAnalytics();
  const { getGroups } = useContactGroups();
  const { getContactInsights } = useContactAI();

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      if (contacts.length === 0) return;

      setIsLoading(true);
      try {
        // Fetch metrics
        const metrics = await getContactMetrics(period);
        setStats(metrics);

        // Fetch activities
        const recentActivities = await getContactActivities({
          limit: 10,
          includeContact: true,
        });
        setActivities(recentActivities);

        // Fetch tags
        const tags = await getTagsOverview();
        setTopTags(tags.slice(0, 8));

        // Fetch groups
        const groups = await getGroups();
        setTopGroups(groups.slice(0, 5));

        // Get AI insights if enabled
        if (enableAI) {
          const insights = await getContactInsights(contacts);
          setAiInsights(insights);
        }
      } catch (err) {
        console.error('Error fetching contacts overview data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    contacts,
    period,
    enableAI,
    getContactMetrics,
    getContactActivities,
    getTagsOverview,
    getGroups,
    getContactInsights,
  ]);

  // Derived/Computed Values
  const upcomingFollowUps = useMemo(() => {
    return contacts
      .filter(
        contact => contact.nextFollowUpDate && new Date(contact.nextFollowUpDate) > new Date()
      )
      .sort((a, b) => {
        const dateA = a.nextFollowUpDate ? new Date(a.nextFollowUpDate).getTime() : 0;
        const dateB = b.nextFollowUpDate ? new Date(b.nextFollowUpDate).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [contacts]);

  const recentContacts = useMemo(() => {
    return [...contacts]
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [contacts]);

  const starredContacts = useMemo(() => {
    return contacts.filter(contact => contact.isStarred).slice(0, 4);
  }, [contacts]);

  // Chart data preparation
  const contactsByStatusData = useMemo(() => {
    if (!stats) return [];

    return Object.entries(stats.contactsByStatus).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [stats]);

  const activitiesByTypeData = useMemo(() => {
    if (!stats) return [];

    return Object.entries(stats.activitiesByType).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));
  }, [stats]);

  // Event Handlers
  const handleContactClick = (contactId: string) => {
    if (onContactClick) {
      onContactClick(contactId);
    } else {
      router.push(`/dashboard/contacts/${contactId}`);
    }
  };

  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d' | '12m') => {
    setPeriod(newPeriod);
  };

  // If loading, show skeleton
  if (isLoading) {
    return <ContactsOverviewSkeleton />;
  }

  // If error, show error state
  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts Overview</h1>
          <p className="text-muted-foreground">{contacts.length} contacts in your database</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <PeriodSelector value={period} onChange={handlePeriodChange} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add New
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCreateContact}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImportContacts}>
                {/* <Download className="h-4 w-4 mr-2" /> */}
                Import Contacts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/contacts/groups/new')}>
                <Users className="h-4 w-4 mr-2" />
                Create Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/contacts/tags/new')}>
                <Tag className="h-4 w-4 mr-2" />
                Create Tag
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {enableAI && aiInsights.length > 0 && (
            <Button
              variant="default"
              onClick={() => setShowAIInsightsDialog(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Contacts"
          value={formatNumber(stats?.totalContacts || 0)}
          icon={<Users />}
          change={stats?.growthRate}
          onClick={() => router.push('/dashboard/contacts')}
        />

        <MetricCard
          title="Active Contacts"
          value={formatNumber(stats?.activeContacts || 0)}
          icon={<User />}
          helperText={`${formatPercentage(
            stats ? stats.activeContacts / stats.totalContacts : 0
          )} of total`}
          onClick={() => router.push('/dashboard/contacts?status=active')}
        />

        <MetricCard
          title="Avg. Engagement"
          value={`${formatPercentage(stats?.averageEngagementRate || 0)}`}
          icon={<BarChart3 />}
          onClick={() => router.push('/dashboard/contacts/analytics')}
        />

        <MetricCard
          title="Need Follow-up"
          value={formatNumber(stats?.contactsWithFollowUps || 0)}
          icon={<Calendar />}
          onClick={() => router.push('/dashboard/contacts/follow-ups')}
        />
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Growth Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Contact Growth</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Shows the growth of your contacts over time. This includes new contacts
                          added and contacts that have been activated or deactivated.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription>
                  {stats?.newContactsThisPeriod || 0} new contacts in this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={[
                    { name: 'Jan', value: 420 },
                    { name: 'Feb', value: 462 },
                    { name: 'Mar', value: 510 },
                    { name: 'Apr', value: 548 },
                    { name: 'May', value: 603 },
                    { name: 'Jun', value: 689 },
                    { name: 'Jul', value: 720 },
                  ]}
                  height={250}
                  showLegend={false}
                  showGrid={true}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Top Contacts */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Starred Contacts</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/contacts?starred=true')}
                    className="h-8 text-xs"
                  >
                    View All
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-4">
                    {starredContacts.length > 0 ? (
                      starredContacts.map(contact => (
                        <div
                          key={contact.id}
                          className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                          onClick={() => handleContactClick(contact.id)}
                        >
                          <Avatar className="h-10 w-10">
                            {contact.avatarUrl ? (
                              <AvatarImage
                                src={contact.avatarUrl}
                                alt={`${contact.firstName} ${contact.lastName}`}
                              />
                            ) : (
                              <AvatarFallback>
                                {getInitials(`${contact.firstName} ${contact.lastName}`)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <p className="font-medium text-sm truncate">
                                {contact.firstName} {contact.lastName}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1"
                                onClick={e => {
                                  e.stopPropagation();
                                  onContactStar?.(contact.id, !contact.isStarred);
                                }}
                              >
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              </Button>
                            </div>
                            <div className="flex text-xs text-muted-foreground space-x-2">
                              {contact.company && (
                                <span className="truncate">{contact.company}</span>
                              )}
                              {contact.status && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{contact.status}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={e => {
                              e.stopPropagation();
                              onSendEmail?.([contact.id]);
                            }}
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <StarOff className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No starred contacts yet</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2"
                          onClick={() => router.push('/dashboard/contacts')}
                        >
                          Star your important contacts
                        </Button>
                      </div>
                    )}
                  </div>
                  <ScrollBar />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Contact Status</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.push('/dashboard/contacts/analytics')}
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] flex items-center justify-center">
                  <DonutChart
                    data={contactsByStatusData}
                    valueFormatter={value => `${value} contacts`}
                    showLabels={false}
                    showAnimation={true}
                    colors={['#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#64748b']}
                  />
                </div>

                <div className="space-y-2 mt-2">
                  {contactsByStatusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{
                            backgroundColor: [
                              '#22c55e',
                              '#3b82f6',
                              '#f97316',
                              '#8b5cf6',
                              '#64748b',
                            ][index % 5],
                          }}
                        />
                        <span className="capitalize">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTab('activities')}
                    className="h-8 text-xs"
                  >
                    View All
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[240px]">
                  <div className="space-y-4">
                    {activities.length > 0 ? (
                      activities
                        .slice(0, 5)
                        .map((activity, index) => <ActivityItem key={index} activity={activity} />)
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No recent activities</p>
                      </div>
                    )}
                  </div>
                  <ScrollBar />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Top Tags */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Popular Tags</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/contacts/tags')}
                    className="h-8 text-xs"
                  >
                    Manage Tags
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTags.length > 0 ? (
                    topTags.map(tag => (
                      <div key={tag.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm">{tag.name}</span>
                        </div>
                        <Badge variant="outline" className="h-6">
                          {tag.count}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="h-[240px] flex flex-col items-center justify-center text-center">
                      <Tag className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No tags created yet</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2"
                        onClick={() => router.push('/dashboard/contacts/tags/new')}
                      >
                        Create your first tag
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Contacts */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Recently Updated Contacts</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/contacts?sort=updatedAt-desc')}
              >
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentContacts.map(contact => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onStar={onContactStar}
                  onClick={handleContactClick}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activities List */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Activities</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative w-[180px]">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search activities..." className="pl-8" />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Activity Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {activities.length > 0 ? (
                      activities.map((activity, index) => (
                        <ActivityItem key={index} activity={activity} />
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No activities recorded yet</p>
                        <p className="text-sm text-muted-foreground max-w-md mt-1">
                          Activities are automatically recorded when you interact with your contacts
                          through emails, calls, meetings, or notes.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => router.push('/dashboard/contacts')}
                        >
                          Go to contacts
                        </Button>
                      </div>
                    )}
                  </div>
                  <ScrollBar />
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {activities.length} recent activities
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/activities')}
                >
                  View All Activities
                </Button>
              </CardFooter>
            </Card>

            {/* Activity Statistics */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Activity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px]">
                    <DonutChart
                      data={activitiesByTypeData}
                      valueFormatter={value => `${value} activities`}
                      showLabels={false}
                      colors={['#3b82f6', '#22c55e', '#8b5cf6', '#f97316', '#f43f5e']}
                    />
                  </div>

                  <div className="space-y-2 mt-2">
                    {activitiesByTypeData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div
                            className="h-3 w-3 rounded-full mr-2"
                            style={{
                              backgroundColor: [
                                '#3b82f6',
                                '#22c55e',
                                '#8b5cf6',
                                '#f97316',
                                '#f43f5e',
                              ][index % 5],
                            }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Activity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={[
                      { name: 'Mon', value: 12 },
                      { name: 'Tue', value: 18 },
                      { name: 'Wed', value: 24 },
                      { name: 'Thu', value: 16 },
                      { name: 'Fri', value: 21 },
                      { name: 'Sat', value: 8 },
                      { name: 'Sun', value: 4 },
                    ]}
                    height={200}
                    showLegend={false}
                    showYAxis={true}
                    showXAxis={true}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="followups" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Follow-ups */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upcoming Follow-ups</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/contacts/follow-ups')}
                  >
                    Calendar View
                    <Calendar className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingFollowUps.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingFollowUps.map(contact => (
                      <div
                        key={contact.id}
                        className="flex items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleContactClick(contact.id)}
                      >
                        <div className="mr-4">
                          <Avatar className="h-10 w-10">
                            {contact.avatarUrl ? (
                              <AvatarImage
                                src={contact.avatarUrl}
                                alt={`${contact.firstName} ${contact.lastName}`}
                              />
                            ) : (
                              <AvatarFallback>
                                {getInitials(`${contact.firstName} ${contact.lastName}`)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <Badge variant="outline" className="ml-2">
                              {contact.nextFollowUpDate && formatDate(contact.nextFollowUpDate)}
                            </Badge>
                          </div>

                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {contact.company && (
                              <div className="flex items-center mr-3">
                                <Building className="h-3 w-3 mr-1" />
                                <span className="truncate">{contact.company}</span>
                              </div>
                            )}

                            {contact.lastContactedAt && (
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>Last contact: {formatDate(contact.lastContactedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center ml-2 gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={e => {
                              e.stopPropagation();
                              onSendEmail?.([contact.id]);
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  // Handle reschedule
                                  router.push(`/dashboard/contacts/${contact.id}/schedule`);
                                }}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  // Handle add note
                                  router.push(`/dashboard/contacts/${contact.id}/notes/new`);
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  // Handle mark as done
                                  toast({
                                    title: 'Follow-up completed',
                                    description: `Follow-up with ${contact.firstName} ${contact.lastName} marked as completed.`,
                                  });
                                }}
                              >
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark as Done
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-16">
                    <BellRing className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No upcoming follow-ups</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-1">
                      Schedule follow-ups with your contacts to stay on top of your relationships.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push('/dashboard/contacts')}
                    >
                      Go to contacts
                    </Button>
                  </div>
                )}
              </CardContent>
              {upcomingFollowUps.length > 0 && (
                <CardFooter className="border-t bg-muted/50 flex justify-between py-2">
                  <div className="text-sm text-muted-foreground">
                    {upcomingFollowUps.length} upcoming follow-ups
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => router.push('/dashboard/contacts/follow-ups')}
                  >
                    View all follow-ups
                  </Button>
                </CardFooter>
              )}
            </Card>

            <div className="space-y-6">
              {/* Follow-up Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Follow-up Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Follow-up Rate</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Completion Rate</span>
                        <span className="text-sm font-medium">82%</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Average Delay</span>
                        <span className="text-sm font-medium">1.2 days</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Groups */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Contact Groups</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/dashboard/contacts/groups')}
                      className="h-8 text-xs"
                    >
                      View All
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topGroups.length > 0 ? (
                      topGroups.map(group => (
                        <div
                          key={group.id}
                          className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                          onClick={() => router.push(`/dashboard/contacts/groups/${group.id}`)}
                        >
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-primary" />
                            <span className="text-sm">{group.name}</span>
                            {group.isSmartGroup && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Sparkles className="h-3 w-3 ml-1.5 text-yellow-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Smart Group (auto-updated)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <Badge variant="outline" className="h-6">
                            {group.count}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-8">
                        <Users className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No groups created yet</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2"
                          onClick={() => router.push('/dashboard/contacts/groups/new')}
                        >
                          Create your first group
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Insights Dialog */}
      <Dialog open={showAIInsightsDialog} onOpenChange={setShowAIInsightsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
              AI Contact Insights
            </DialogTitle>
            <DialogDescription>
              AI-powered insights about your contacts and relationship patterns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="flex space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm">{insight}</p>
                </div>
              </div>
            ))}

            <div className="mt-3 flex flex-col items-center justify-center bg-muted/40 p-3 rounded-lg">
              <p className="text-sm text-center text-muted-foreground mb-2">
                These insights are automatically generated and improve over time as you interact
                with your contacts.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/contacts/analytics')}
                className="mt-1"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowAIInsightsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * This would normally be in its own file: components/ui/period-selector.tsx
 */
function PeriodSelector({
  value,
  onChange,
}: {
  value: '7d' | '30d' | '90d' | '12m';
  onChange: (value: '7d' | '30d' | '90d' | '12m') => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border bg-background p-1 text-sm shadow-sm">
      <Button
        variant={value === '7d' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 rounded-sm px-3"
        onClick={() => onChange('7d')}
      >
        7D
      </Button>
      <Button
        variant={value === '30d' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 rounded-sm px-3"
        onClick={() => onChange('30d')}
      >
        30D
      </Button>
      <Button
        variant={value === '90d' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 rounded-sm px-3"
        onClick={() => onChange('90d')}
      >
        90D
      </Button>
      <Button
        variant={value === '12m' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 rounded-sm px-3"
        onClick={() => onChange('12m')}
      >
        12M
      </Button>
    </div>
  );
}

/**
 * These would normally be in separate files for charts
 */
function LineChart({
  data,
  height = 300,
  showLegend = true,
  showGrid = false,
  className = '',
}: {
  data: Array<{ name: string; value: number }>;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      {/* This is just a placeholder. In a real implementation, you'd use a library like Recharts */}
      <div className="h-full w-full flex items-end justify-between relative">
        {showGrid && (
          <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border-t border-muted w-full h-0" />
              ))}
          </div>
        )}

        {data.map((item, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center justify-end w-full h-full"
            style={{ maxWidth: `calc(100% / ${data.length})` }}
          >
            <div
              className="w-full max-w-[30px] bg-primary/80 rounded-t-sm"
              style={{
                height: `${(item.value / Math.max(...data.map(d => d.value))) * 75}%`,
                minHeight: '4px',
              }}
            />
            {showLegend && (
              <div className="text-xs text-muted-foreground mt-1 truncate">{item.name}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({
  data,
  height = 300,
  showXAxis = true,
  showYAxis = false,
  className = '',
}: {
  data: Array<{ name: string; value: number }>;
  height?: number;
  showXAxis?: boolean;
  showYAxis?: boolean;
  className?: string;
}) {
  // Same approach as LineChart - this is a placeholder
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <div className="h-full w-full flex items-end justify-between relative">
        {showYAxis && (
          <div className="absolute inset-y-0 left-0 w-8 flex flex-col justify-between items-end pr-2">
            {['100', '75', '50', '25', '0'].map(label => (
              <div key={label} className="text-xs text-muted-foreground">
                {label}
              </div>
            ))}
          </div>
        )}

        {data.map((item, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center justify-end w-full h-full"
            style={{ maxWidth: `calc(100% / ${data.length})` }}
          >
            <div
              className="w-full max-w-[30px] bg-primary/80 rounded-t-sm"
              style={{
                height: `${(item.value / Math.max(...data.map(d => d.value))) * 75}%`,
                minHeight: '4px',
              }}
            />
            {showXAxis && (
              <div className="text-xs text-muted-foreground mt-1 truncate">{item.name}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({
  data,

  showLabels = true,
  showAnimation = false,
  colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#f43f5e'],
}: {
  data: Array<{ name: string; value: number }>;
  valueFormatter?: (value: number) => string;
  showLabels?: boolean;
  showAnimation?: boolean;
  colors?: string[];
}) {
  // Placeholder for a donut chart
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((item, index) => {
            // Calculate stroke dash parameters for each segment
            const percent = item.value / total;
            const offset = data.slice(0, index).reduce((sum, d) => sum + d.value / total, 0);

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth="20"
                strokeDasharray={`${percent * 251.2} 251.2`}
                strokeDashoffset={`${(0.25 - offset) * 251.2}`}
                transform="rotate(-90 50 50)"
                className={showAnimation ? 'transition-all duration-1000' : ''}
              />
            );
          })}
          <circle cx="50" cy="50" r="30" fill="white" />
        </svg>

        {!showLabels && (
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <div className="text-xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * These would be in utilities
 */
const AlertTriangle = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('lucide lucide-alert-triangle', className)}
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const Lightbulb = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('lucide lucide-lightbulb', className)}
    {...props}
  >
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);
