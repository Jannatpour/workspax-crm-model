'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  Mail,
  Search,
  Send,
  Trash2,
  Star,
  MoreVertical,
  Plus,
  Reply,
  Forward,
  Filter,
  ArrowDownUp,
  Archive,
  Download,
  Paperclip,
  Tag,
  User,
  BrainCog,
  Clock,
  RefreshCw,
  AlertCircle,
  X,
  ChevronRight,
  Eye,
  MessageSquare,
  BarChart2,
  TrendingUp,
  MousePointer,
  Calendar,
  Users,
  Check,
  FileText,
  StarOff,
  Settings,
} from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

import { EmailAgent } from '@/components/agents/email-agent';
import { ModuleAgentSelector } from '@/components/agents/module-agent-selector';
import { EmailStats } from '@/components/dashboard/email-stats';
import { useDashboard } from '@/context/dashboard-context';
import { AgentProvider } from '@/context/agent-context';

export enum EmailFolder {
  INBOX = 'INBOX',
  SENT = 'SENT',
  DRAFTS = 'DRAFTS',
  TRASH = 'TRASH',
  ARCHIVE = 'ARCHIVE',
  SPAM = 'SPAM',
  IMPORTANT = 'IMPORTANT',
}

export enum EmailStatus {
  RECEIVED = 'RECEIVED',
  SENT = 'SENT',
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  BOUNCED = 'BOUNCED',
  FAILED = 'FAILED',
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  title?: string;
  avatarUrl?: string;
}

export interface Email {
  id: string;
  subject: string;
  body: string;
  bodyText?: string;
  fromEmail: string;
  fromName?: string;
  toEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  sentAt?: Date;
  receivedAt?: Date;
  status: EmailStatus;
  folder: EmailFolder;
  isStarred: boolean;
  isRead: boolean;
  isImportant: boolean;
  labels?: string[];
  createdAt: Date;
  updatedAt: Date;
  contact?: Contact;
  attachments: Attachment[];
  threadId?: string;
}

export interface EmailMetrics {
  openRate: number;
  openRateChange: number;
  clickRate: number;
  clickRateChange: number;
  responseRate: number;
  responseRateChange: number;
  avgResponseTime: number;
  avgResponseTimeChange: number;
  totalConversations: number;
  topSenders: Array<{ name: string; count: number }>;
  activeTimes: Array<{ label: string; percentage: number }>;
}

export interface ComposeData {
  subject: string;
  body: string;
  to: string;
  cc: string;
  bcc: string;
  attachments?: Attachment[];
}

export interface MailInboxProps {
  initialFolder?: EmailFolder;
  initialEmailId?: string;
  composeMode?: boolean;
}

export function MailInbox({
  initialFolder = EmailFolder.INBOX,
  initialEmailId,
  composeMode = false,
}: MailInboxProps) {
  const { changeSection, sectionParams } = useDashboard();
  const [activeFolder, setActiveFolder] = useState<EmailFolder>(initialFolder);
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'comfortable'>('comfortable');
  const [emails, setEmails] = useState<Email[]>([]);
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [isComposeMode, setIsComposeMode] = useState(composeMode);
  const [composeData, setComposeData] = useState<ComposeData>({
    subject: '',
    body: '',
    to: '',
    cc: '',
    bcc: '',
    attachments: [],
  });
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const replyBodyRef = useRef<HTMLTextAreaElement>(null);

  // Map section params to folder
  useEffect(() => {
    if (sectionParams?.folder) {
      setActiveFolder(sectionParams.folder as EmailFolder);
    }
  }, [sectionParams]);

  // Load emails when the folder changes
  useEffect(() => {
    fetchEmails();
  }, [activeFolder]);

  // Fetch email metrics data on mount
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchEmailMetrics();
    }
  }, [activeTab]);

  // Handle search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      searchEmails(searchQuery);
    } else if (activeFolder) {
      fetchEmails();
    }
  }, [searchQuery]);

  // Fetch emails from API
  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/emails?folder=${activeFolder}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.statusText}`);
      }

      const data = await response.json();
      setEmails(data);

      // Select the first email if none is selected
      if (data.length > 0 && !selectedEmail && !isComposeMode) {
        setSelectedEmail(data[0]);
      }

      // If initialEmailId is provided, select that email
      if (initialEmailId) {
        const email = data.find((e: Email) => e.id === initialEmailId);
        if (email) {
          setSelectedEmail(email);
          markEmailAsRead(email.id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching emails:', error);
      setError(error.message || 'Failed to load emails');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch email metrics
  const fetchEmailMetrics = async () => {
    setIsLoadingMetrics(true);

    try {
      const response = await fetch('/api/emails/metrics');

      if (!response.ok) {
        throw new Error(`Failed to fetch email metrics: ${response.statusText}`);
      }

      const data = await response.json();
      setMetrics(data);
    } catch (error: any) {
      console.error('Error fetching email metrics:', error);
      // Don't set error state for metrics, as it's not critical
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // Search emails
  const searchEmails = async (query: string) => {
    if (!query) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/emails/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setEmails(data);
    } catch (error: any) {
      console.error('Error searching emails:', error);
      setError(error.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark email as read
  const markEmailAsRead = async (emailId: string) => {
    try {
      const response = await fetch(`/api/emails/${emailId}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark email as read');
      }

      // Update local state
      setEmails(emails.map(email => (email.id === emailId ? { ...email, isRead: true } : email)));

      if (selectedEmail?.id === emailId) {
        setSelectedEmail({ ...selectedEmail, isRead: true });
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  // Handle refreshing emails
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEmails();
    setIsRefreshing(false);
  };

  // Handle switching folders - now updates URL params
  const handleFolderChange = (folder: EmailFolder) => {
    setActiveFolder(folder);
    setSelectedEmail(null);
    setSelectedEmails(new Set());

    // Update section params to reflect folder change
    changeSection('mail-inbox', { folder });
  };

  // Handle selecting an email
  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    setIsComposeMode(false);

    // Mark as read
    if (!email.isRead) {
      markEmailAsRead(email.id);
    }
  };

  // Handle toggling email selection
  const handleToggleSelectEmail = (email: Email, checked: boolean) => {
    const newSelectedEmails = new Set(selectedEmails);

    if (checked) {
      newSelectedEmails.add(email.id);
    } else {
      newSelectedEmails.delete(email.id);
    }

    setSelectedEmails(newSelectedEmails);
  };

  // Handle selecting all emails
  const handleSelectAllEmails = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(emails.map(email => email.id));
      setSelectedEmails(allIds);
    } else {
      setSelectedEmails(new Set());
    }
  };

  // Handle toggling star
  const handleToggleStar = async (email: Email) => {
    try {
      const response = await fetch(`/api/emails/${email.id}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ starred: !email.isStarred }),
      });

      if (!response.ok) {
        throw new Error('Failed to update star status');
      }

      // Update local state
      setEmails(emails.map(e => (e.id === email.id ? { ...e, isStarred: !e.isStarred } : e)));

      if (selectedEmail?.id === email.id) {
        setSelectedEmail({ ...selectedEmail, isStarred: !selectedEmail.isStarred });
      }
    } catch (error) {
      console.error('Error updating star status:', error);
    }
  };

  // Handle deleting emails
  const handleDeleteEmails = async (ids: string[]) => {
    try {
      const response = await fetch('/api/emails/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete emails');
      }

      // Update local state
      const updatedEmails = emails.filter(email => !ids.includes(email.id));
      setEmails(updatedEmails);

      // Clear selection if selected email was deleted
      if (selectedEmail && ids.includes(selectedEmail.id)) {
        setSelectedEmail(updatedEmails.length > 0 ? updatedEmails[0] : null);
      }

      // Clear selected emails
      const newSelectedEmails = new Set(selectedEmails);
      ids.forEach(id => newSelectedEmails.delete(id));
      setSelectedEmails(newSelectedEmails);
    } catch (error) {
      console.error('Error deleting emails:', error);
    }
  };

  // Handle moving emails to a folder
  const handleMoveEmails = async (ids: string[], folder: EmailFolder) => {
    try {
      const response = await fetch('/api/emails/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, folder }),
      });

      if (!response.ok) {
        throw new Error('Failed to move emails');
      }

      // Update local state or refetch depending on current folder
      if (folder !== activeFolder) {
        // If moving to a different folder, remove from current view
        const updatedEmails = emails.filter(email => !ids.includes(email.id));
        setEmails(updatedEmails);

        // Clear selection if selected email was moved
        if (selectedEmail && ids.includes(selectedEmail.id)) {
          setSelectedEmail(updatedEmails.length > 0 ? updatedEmails[0] : null);
        }
      } else {
        // If moving within the same folder, refresh
        await fetchEmails();
      }

      // Clear selected emails
      setSelectedEmails(new Set());
    } catch (error) {
      console.error('Error moving emails:', error);
    }
  };

  // Handle switching to compose mode
  const handleCompose = (type: 'new' | 'reply' | 'forward' = 'new') => {
    setIsComposeMode(true);

    if (type === 'new') {
      setComposeData({
        subject: '',
        body: '',
        to: '',
        cc: '',
        bcc: '',
        attachments: [],
      });
    } else if (type === 'reply' && selectedEmail) {
      setComposeData({
        subject: `Re: ${selectedEmail.subject}`,
        body: '',
        to: selectedEmail.fromEmail,
        cc: '',
        bcc: '',
        attachments: [],
      });
    } else if (type === 'forward' && selectedEmail) {
      const formattedDate = selectedEmail.receivedAt
        ? format(selectedEmail.receivedAt, 'E, MMM d, yyyy h:mm a')
        : format(selectedEmail.createdAt, 'E, MMM d, yyyy h:mm a');

      setComposeData({
        subject: `Fwd: ${selectedEmail.subject}`,
        body: `\n\n---------- Forwarded message ---------\nFrom: ${
          selectedEmail.fromEmail
        }\nDate: ${formattedDate}\nSubject: ${
          selectedEmail.subject
        }\nTo: ${selectedEmail.toEmails.join(', ')}\n\n${
          selectedEmail.bodyText || selectedEmail.body
        }`,
        to: '',
        cc: '',
        bcc: '',
        attachments: [...(selectedEmail.attachments || [])],
      });
    }
  };

  // Handle sending an email
  const handleSendEmail = async () => {
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(composeData),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Reset compose mode
      setIsComposeMode(false);
      setComposeData({
        subject: '',
        body: '',
        to: '',
        cc: '',
        bcc: '',
        attachments: [],
      });

      // Refresh emails if in sent folder
      if (activeFolder === EmailFolder.SENT) {
        fetchEmails();
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      alert(`Failed to send email: ${error.message}`);
    }
  };

  // Handle AI suggestion application
  const handleApplySuggestion = (suggestion: string) => {
    if (replyBodyRef.current) {
      replyBodyRef.current.value = suggestion;
    } else {
      setComposeData({
        ...composeData,
        body: suggestion,
      });
    }
  };

  // Calculate folder counts
  const getFolderCount = (folder: EmailFolder) => {
    if (folder === EmailFolder.INBOX) {
      return emails.filter(e => e.folder === EmailFolder.INBOX && !e.isRead).length;
    } else {
      return emails.filter(e => e.folder === folder).length;
    }
  };

  // Format date for display
  const formatEmailDate = (date: Date | undefined) => {
    if (!date) return '';

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MM/dd/yy');
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get current folder display name
  const getCurrentFolderName = () => {
    switch (activeFolder) {
      case EmailFolder.INBOX:
        return 'Inbox';
      case EmailFolder.IMPORTANT:
        return 'Important';
      case EmailFolder.SENT:
        return 'Sent';
      case EmailFolder.DRAFTS:
        return 'Drafts';
      case EmailFolder.ARCHIVE:
        return 'Archive';
      case EmailFolder.TRASH:
        return 'Trash';
      default:
        return 'Emails';
    }
  };

  return (
    <AgentProvider>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{getCurrentFolderName()}</h2>
              <p className="text-muted-foreground">Manage your email communications</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => handleCompose('new')} className="sm:w-auto w-full">
              <Plus className="mr-2 h-4 w-4" />
              Compose Email
            </Button>
          </div>
        </div>

        {/* Main content - now full width */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-blue-100 dark:border-blue-900 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{getCurrentFolderName()}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-3.5 w-3.5 mr-1" /> Filter
                </Button>
                <Select defaultValue="newest">
                  <SelectTrigger className="h-8 w-[130px]">
                    <ArrowDownUp className="h-3.5 w-3.5 mr-1" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="sender">Sender Name</SelectItem>
                    <SelectItem value="subject">Subject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {activeFolder === EmailFolder.INBOX && (
              <CardDescription>{getFolderCount(EmailFolder.INBOX)} unread messages</CardDescription>
            )}
          </CardHeader>

          <Tabs
            defaultValue={activeTab}
            onValueChange={val => setActiveTab(val as 'overview' | 'inbox')}
            className="w-full"
          >
            <div className="px-4 pt-2">
              <TabsList className="w-full grid grid-cols-2 md:w-auto md:inline-flex">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-0">
              <TabsContent value="overview" className="m-0 border-0">
                <div className="p-4 space-y-6">
                  {/* Email Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email Performance Card */}
                    <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
                      <CardHeader className="pb-2 bg-blue-50/50 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            Email Performance
                          </CardTitle>
                          <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                            Last 30 days
                          </Badge>
                        </div>
                        <CardDescription>Key metrics and engagement analytics</CardDescription>
                      </CardHeader>

                      <CardContent className="p-0">
                        {isLoadingMetrics ? (
                          <div className="p-4 grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="flex flex-col items-center justify-center">
                                <Skeleton className="h-10 w-10 rounded-full mb-2" />
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-6 w-16 mb-1" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-0">
                            {/* Open Rate */}
                            <div className="p-4 border-r border-b border-dashed border-blue-100 dark:border-blue-900 flex flex-col justify-center items-center text-center">
                              <div className="bg-blue-50 dark:bg-blue-950 rounded-full p-2 mb-2">
                                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">Open Rate</p>
                              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {metrics?.openRate || 0}%
                              </h3>
                              {metrics?.openRateChange !== undefined && (
                                <div
                                  className={`flex items-center text-xs mt-1 ${
                                    metrics.openRateChange >= 0
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  <TrendingUp
                                    className={`h-3 w-3 mr-1 ${
                                      metrics.openRateChange < 0 ? 'rotate-180' : ''
                                    }`}
                                  />
                                  <span>
                                    {metrics.openRateChange >= 0 ? '+' : ''}
                                    {metrics.openRateChange}% vs previous
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Click Rate */}
                            <div className="p-4 border-b border-dashed border-blue-100 dark:border-blue-900 flex flex-col justify-center items-center text-center">
                              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-full p-2 mb-2">
                                <MousePointer className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">Click Rate</p>
                              <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {metrics?.clickRate || 0}%
                              </h3>
                              {metrics?.clickRateChange !== undefined && (
                                <div
                                  className={`flex items-center text-xs mt-1 ${
                                    metrics.clickRateChange >= 0
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  <TrendingUp
                                    className={`h-3 w-3 mr-1 ${
                                      metrics.clickRateChange < 0 ? 'rotate-180' : ''
                                    }`}
                                  />
                                  <span>
                                    {metrics.clickRateChange >= 0 ? '+' : ''}
                                    {metrics.clickRateChange}% vs previous
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Response Rate */}
                            <div className="p-4 border-r border-dashed border-blue-100 dark:border-blue-900 flex flex-col justify-center items-center text-center">
                              <div className="bg-green-50 dark:bg-green-950 rounded-full p-2 mb-2">
                                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">Response Rate</p>
                              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {metrics?.responseRate || 0}%
                              </h3>
                              {metrics?.responseRateChange !== undefined && (
                                <div
                                  className={`flex items-center text-xs mt-1 ${
                                    metrics.responseRateChange >= 0
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  <TrendingUp
                                    className={`h-3 w-3 mr-1 ${
                                      metrics.responseRateChange < 0 ? 'rotate-180' : ''
                                    }`}
                                  />
                                  <span>
                                    {metrics.responseRateChange >= 0 ? '+' : ''}
                                    {metrics.responseRateChange}% vs previous
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Avg. Response Time */}
                            <div className="p-4 flex flex-col justify-center items-center text-center">
                              <div className="bg-amber-50 dark:bg-amber-950 rounded-full p-2 mb-2">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">Response Time</p>
                              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {metrics?.avgResponseTime || 0} min
                              </h3>
                              {metrics?.avgResponseTimeChange !== undefined && (
                                <div
                                  className={`flex items-center text-xs mt-1 ${
                                    metrics.avgResponseTimeChange <= 0
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  <TrendingUp
                                    className={`h-3 w-3 mr-1 ${
                                      metrics.avgResponseTimeChange > 0 ? 'rotate-180' : ''
                                    }`}
                                  />
                                  <span>
                                    {metrics.avgResponseTimeChange <= 0 ? '' : '+'}
                                    {metrics.avgResponseTimeChange}% vs previous
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="bg-blue-50/50 dark:bg-blue-950/50 border-t border-blue-100 dark:border-blue-900 py-2 px-4 flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          Based on {metrics?.totalConversations || 0} email conversations
                        </p>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          View detailed analytics
                        </Button>
                      </CardFooter>
                    </Card>

                    {/* Activity Dashboard Card */}
                    <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900">
                      <CardHeader className="pb-2 bg-indigo-50/50 dark:bg-indigo-950/50 border-b border-indigo-100 dark:border-indigo-900">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          Email Activity
                        </CardTitle>
                        <CardDescription>Your communication trends</CardDescription>
                      </CardHeader>

                      <CardContent className="p-4">
                        {isLoadingMetrics ? (
                          <div className="space-y-6">
                            <Skeleton className="h-[160px] w-full" />
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                              </div>
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Visualization placeholder - would be replaced with actual chart in production */}
                            <div className="h-[160px] bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg flex items-center justify-center">
                              <EmailStats
                                period="month"
                                showSentiment={false}
                                showVolume={true}
                                height={160}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {metrics?.topSenders && metrics.topSenders.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Top Senders</p>
                                  {metrics.topSenders.map((sender, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                      <p className="text-sm">{sender.name}</p>
                                      <Badge variant="outline" className="text-xs">
                                        {sender.count}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {metrics?.activeTimes && metrics.activeTimes.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Most Active Times</p>
                                  {metrics.activeTimes.map((time, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                      <p className="text-sm">{time.label}</p>
                                      <Badge variant="outline" className="text-xs">
                                        {time.percentage}%
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="bg-indigo-50/50 dark:bg-indigo-950/50 border-t border-indigo-100 dark:border-indigo-900 py-2 px-4 flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">Last 30 days activity</p>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          View insights
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>

                  {/* Recent Emails */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">Recent Emails</h3>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('inbox')}>
                        View all <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                    <Card>
                      <CardContent className="p-0">
                        {isLoading ? (
                          <div className="p-6 flex items-center justify-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : emails.length === 0 ? (
                          <div className="p-6 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                              <Mail className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No emails found</h3>
                            <p className="text-muted-foreground text-sm mt-1 mb-4">
                              {searchQuery ? 'Try a different search term' : 'Your inbox is empty'}
                            </p>
                            {searchQuery && (
                              <Button variant="outline" onClick={() => setSearchQuery('')}>
                                Clear search
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div>
                            {emails.slice(0, 5).map(email => (
                              <div
                                key={email.id}
                                className={`flex items-start px-4 py-3 border-b last:border-b-0 hover:bg-muted/20 cursor-pointer ${
                                  !email.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                                }`}
                                onClick={() => handleSelectEmail(email)}
                              >
                                <div className="flex items-center mr-3">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={email.contact?.avatarUrl} />
                                    <AvatarFallback>
                                      {email.contact?.firstName?.[0]}
                                      {email.contact?.lastName?.[0] || ''}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p
                                      className={`truncate text-sm ${
                                        !email.isRead ? 'font-semibold' : ''
                                      }`}
                                    >
                                      {email.contact?.firstName} {email.contact?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                      {formatEmailDate(
                                        email.receivedAt || email.sentAt || email.createdAt
                                      )}
                                    </p>
                                  </div>
                                  <p className="text-sm truncate">{email.subject}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {email.bodyText || 'No content'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Email Calendar */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">Upcoming Email-Related Events</h3>
                      <Button variant="outline" size="sm" onClick={() => changeSection('calendar')}>
                        View calendar <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer border border-dashed">
                          <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">Weekly Newsletter</p>
                              <Badge variant="outline" className="text-xs">
                                Scheduled
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer border border-dashed">
                          <div className="flex-shrink-0 h-10 w-10 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">Team Meeting Follow-up</p>
                              <Badge variant="outline" className="text-xs">
                                Draft
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Friday, 3:30 PM</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inbox" className="m-0 border-0">
                {/* Email list or compose view */}
                {isComposeMode ? (
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          {composeData.subject ? (
                            <span className="text-muted-foreground text-base">
                              {composeData.subject.startsWith('Re:')
                                ? 'Reply'
                                : composeData.subject.startsWith('Fwd:')
                                ? 'Forward'
                                : 'New Email'}
                              :
                            </span>
                          ) : (
                            'New Email'
                          )}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsComposeMode(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center mb-1.5">
                            <span className="w-16 text-sm text-muted-foreground">To:</span>
                            <Input
                              className="flex-1"
                              placeholder="recipient@example.com"
                              value={composeData.to}
                              onChange={e => setComposeData({ ...composeData, to: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center mb-1.5">
                            <span className="w-16 text-sm text-muted-foreground">Cc:</span>
                            <Input
                              className="flex-1"
                              placeholder="cc@example.com"
                              value={composeData.cc}
                              onChange={e => setComposeData({ ...composeData, cc: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center mb-1.5">
                            <span className="w-16 text-sm text-muted-foreground">Bcc:</span>
                            <Input
                              className="flex-1"
                              placeholder="bcc@example.com"
                              value={composeData.bcc}
                              onChange={e =>
                                setComposeData({ ...composeData, bcc: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex items-center mb-1.5">
                            <span className="w-16 text-sm text-muted-foreground">Subject:</span>
                            <Input
                              className="flex-1"
                              placeholder="Email subject"
                              value={composeData.subject}
                              onChange={e =>
                                setComposeData({ ...composeData, subject: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <Textarea
                            ref={replyBodyRef}
                            className="min-h-[200px]"
                            placeholder="Compose your email..."
                            value={composeData.body}
                            onChange={e => setComposeData({ ...composeData, body: e.target.value })}
                          />
                        </div>

                        {composeData.attachments && composeData.attachments.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Attachments</div>
                            <div className="space-y-2">
                              {composeData.attachments.map(attachment => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                                >
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{attachment.filename}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({formatFileSize(attachment.size)})
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      const newAttachments =
                                        composeData.attachments?.filter(
                                          a => a.id !== attachment.id
                                        ) || [];
                                      setComposeData({
                                        ...composeData,
                                        attachments: newAttachments,
                                      });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Paperclip className="h-4 w-4 mr-1" />
                            Attach
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Save as draft</DropdownMenuItem>
                              <DropdownMenuItem>Schedule send</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Discard</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm">
                                <BrainCog className="h-4 w-4 mr-1" />
                                AI Assistant
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="sm:max-w-lg">
                              <SheetHeader>
                                <SheetTitle>AI Email Assistant</SheetTitle>
                              </SheetHeader>
                              <div className="mt-6">
                                <EmailAgent
                                  email={selectedEmail || undefined}
                                  onSuggestionApply={handleApplySuggestion}
                                />
                              </div>
                            </SheetContent>
                          </Sheet>

                          <Button onClick={handleSendEmail}>Send Email</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedEmail ? (
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedEmail.contact?.avatarUrl} />
                            <AvatarFallback>
                              {selectedEmail.contact?.firstName?.[0]}
                              {selectedEmail.contact?.lastName?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium">
                                {selectedEmail.contact?.firstName} {selectedEmail.contact?.lastName}
                              </h3>
                              {selectedEmail.contact?.company && (
                                <Badge variant="outline" className="font-normal">
                                  {selectedEmail.contact.company}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>{selectedEmail.fromEmail}</span>
                              <span className="mx-1">•</span>
                              <span>
                                {formatEmailDate(
                                  selectedEmail.receivedAt ||
                                    selectedEmail.sentAt ||
                                    selectedEmail.createdAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStar(selectedEmail)}
                          >
                            {selectedEmail.isStarred ? (
                              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMoveEmails([selectedEmail.id], EmailFolder.ARCHIVE)
                                }
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteEmails([selectedEmail.id])}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <StarOff className="h-4 w-4 mr-2" />
                                Mark as unread
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xl font-medium mb-2">{selectedEmail.subject}</h2>
                        <div className="prose dark:prose-invert max-w-none">
                          {selectedEmail.body ? (
                            <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
                          ) : (
                            <p>{selectedEmail.bodyText || 'No content'}</p>
                          )}
                        </div>
                      </div>

                      {selectedEmail.attachments.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            Attachments ({selectedEmail.attachments.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedEmail.attachments.map(attachment => (
                              <div
                                key={attachment.id}
                                className="flex items-center gap-2 p-2 rounded-md border"
                              >
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm">{attachment.filename}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" className="ml-2">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleCompose('reply')}>
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        <Button variant="outline" onClick={() => handleCompose('forward')}>
                          <Forward className="h-4 w-4 mr-1" />
                          Forward
                        </Button>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline">
                              <BrainCog className="h-4 w-4 mr-1" />
                              AI Assistant
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="sm:max-w-lg">
                            <SheetHeader>
                              <SheetTitle>AI Email Assistant</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6">
                              <EmailAgent
                                email={selectedEmail}
                                onSuggestionApply={handleApplySuggestion}
                              />
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {isLoading ? (
                      <div className="p-6 flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : emails.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Mail className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No emails found</h3>
                        <p className="text-muted-foreground text-sm mt-1 mb-4">
                          {searchQuery ? 'Try a different search term' : 'Your inbox is empty'}
                        </p>
                        {searchQuery && (
                          <Button variant="outline" onClick={() => setSearchQuery('')}>
                            Clear search
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center px-4 py-2 border-b">
                          <Checkbox
                            id="select-all"
                            checked={selectedEmails.size === emails.length}
                            onCheckedChange={handleSelectAllEmails}
                            className="mr-2"
                          />
                          <div className="flex items-center gap-2">
                            {selectedEmails.size > 0 ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEmails(Array.from(selectedEmails))}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleMoveEmails(
                                      Array.from(selectedEmails),
                                      EmailFolder.ARCHIVE
                                    )
                                  }
                                >
                                  <Archive className="h-4 w-4 mr-1" />
                                  Archive
                                </Button>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Select emails to perform actions
                              </span>
                            )}
                          </div>
                        </div>
                        {emails.map(email => (
                          <div
                            key={email.id}
                            className={`flex items-start px-4 py-3 border-b hover:bg-muted/20 cursor-pointer ${
                              selectedEmail?.id === email.id ? 'bg-muted/30' : ''
                            } ${!email.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                          >
                            <div className="flex items-center mr-3">
                              <Checkbox
                                id={`select-${email.id}`}
                                checked={selectedEmails.has(email.id)}
                                onCheckedChange={checked =>
                                  handleToggleSelectEmail(email, !!checked)
                                }
                                onClick={e => e.stopPropagation()}
                                className="mr-2"
                              />
                              <div
                                onClick={e => {
                                  e.stopPropagation();
                                  handleToggleStar(email);
                                }}
                                className="cursor-pointer p-1"
                              >
                                {email.isStarred ? (
                                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                ) : (
                                  <Star className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                            <div
                              className="flex-1 min-w-0"
                              onClick={() => handleSelectEmail(email)}
                            >
                              <div className="flex items-center justify-between">
                                <p
                                  className={`truncate text-sm ${
                                    !email.isRead ? 'font-semibold' : ''
                                  }`}
                                >
                                  {email.contact?.firstName} {email.contact?.lastName}
                                </p>
                                <div className="flex items-center gap-1 ml-2">
                                  {email.attachments.length > 0 && (
                                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatEmailDate(
                                      email.receivedAt || email.sentAt || email.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>
                              <p
                                className={`text-sm truncate ${
                                  !email.isRead ? 'font-semibold' : ''
                                }`}
                              >
                                {email.subject}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {email.bodyText || 'No content'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </CardContent>

            <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-t border-blue-100 dark:border-blue-900 py-2.5 px-4 justify-between items-center">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {emails.length > 0
                    ? `Showing ${Math.min(50, emails.length)} of ${emails.length} emails`
                    : 'No emails to display'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setIsConfigOpen(true)}
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardFooter>
          </Tabs>
        </Card>
      </div>

      {/* AI Configuration Modal */}
      <Sheet open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Email AI Configuration</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ModuleAgentSelector moduleType="email" onConfigured={() => setIsConfigOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </AgentProvider>
  );
}
