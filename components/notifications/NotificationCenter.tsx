'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Archive,
  Bell,
  BrainCircuit,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Filter,
  Inbox,
  ListTodo,
  Mail,
  MessageCircle,
  RefreshCw,
  Search,
  Settings,
  Star,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface NotificationCenterProps {
  userId?: string;
  workspaceId?: string;
}

export function NotificationCenter({
  userId = 'user-1',
  workspaceId = 'workspace-1',
}: NotificationCenterProps) {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [filteredNotifications, setFilteredNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedNotifications, setSelectedNotifications] = React.useState<string[]>([]);
  const [showArchived, setShowArchived] = React.useState(false);

  // Load notifications
  React.useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Mock data - in a real app this would come from an API
        const mockNotifications = [
          {
            id: 'notif-1',
            type: 'LEAD_DETECTED',
            title: 'New Lead Detected',
            content:
              'A new lead (Sarah Johnson from TechSolutions Inc.) was detected in your email.',
            priority: 'HIGH',
            isRead: false,
            isArchived: false,
            actionUrl: '/leads/lead-1',
            actionType: 'view_lead',
            createdAt: '2025-05-12T15:30:00',
            entityId: 'lead-1',
            entityType: 'lead',
          },
          {
            id: 'notif-2',
            type: 'URGENT_EMAIL',
            title: 'Email Requires Attention',
            content:
              'An email requires your urgent attention: High-value partnership opportunity requiring executive input',
            priority: 'URGENT',
            isRead: false,
            isArchived: false,
            actionUrl: '/mail/email-1',
            actionType: 'view_email',
            createdAt: '2025-05-12T14:45:00',
            entityId: 'email-1',
            entityType: 'email',
          },
          {
            id: 'notif-3',
            type: 'TASK_CREATED',
            title: 'HIGH Priority Task Created',
            content:
              '"Schedule partnership discussion meeting" was extracted from your email as a high priority task.',
            priority: 'HIGH',
            isRead: false,
            isArchived: false,
            actionUrl: '/tasks/task-1',
            actionType: 'view_task',
            createdAt: '2025-05-12T14:30:00',
            entityId: 'task-1',
            entityType: 'task',
          },
          {
            id: 'notif-4',
            type: 'EVENT_CREATED',
            title: 'Upcoming Event Detected: TechSolutions Partnership Discussion',
            content: 'Event on May 26, 2025, 2:00 PM was detected in your email.',
            priority: 'NORMAL',
            isRead: true,
            isArchived: false,
            actionUrl: '/calendar/event-1',
            actionType: 'view_event',
            createdAt: '2025-05-12T14:15:00',
            entityId: 'event-1',
            entityType: 'event',
          },
          {
            id: 'notif-5',
            type: 'LEAD_DETECTED',
            title: 'New Lead Detected',
            content: 'A new lead (Robert Chen from FinTech Solutions) was detected in your email.',
            priority: 'HIGH',
            isRead: true,
            isArchived: false,
            actionUrl: '/leads/lead-4',
            actionType: 'view_lead',
            createdAt: '2025-05-05T11:45:00',
            entityId: 'lead-4',
            entityType: 'lead',
          },
          {
            id: 'notif-6',
            type: 'FOLLOW_UP_REMINDER',
            title: 'Follow-up Reminder',
            content:
              'Remember to follow up with Michael Williams from Global Enterprises about your product demo.',
            priority: 'NORMAL',
            isRead: false,
            isArchived: false,
            actionUrl: '/leads/lead-2',
            actionType: 'view_lead',
            createdAt: '2025-05-08T09:00:00',
            entityId: 'lead-2',
            entityType: 'lead',
          },
          {
            id: 'notif-7',
            type: 'TASK_CREATED',
            title: 'MEDIUM Priority Task Created',
            content:
              '"Prepare partnership document overview" was extracted from your email as a medium priority task.',
            priority: 'NORMAL',
            isRead: true,
            isArchived: true,
            actionUrl: '/tasks/task-2',
            actionType: 'view_task',
            createdAt: '2025-05-12T14:20:00',
            entityId: 'task-2',
            entityType: 'task',
          },
          {
            id: 'notif-8',
            type: 'RESPONSE_NEEDED',
            title: 'Response Needed',
            content:
              'Emily Davis from InnovateTech is waiting for your response about API integration options.',
            priority: 'HIGH',
            isRead: false,
            isArchived: false,
            actionUrl: '/mail/email-3',
            actionType: 'view_email',
            createdAt: '2025-05-10T15:30:00',
            entityId: 'email-3',
            entityType: 'email',
          },
        ];

        setNotifications(mockNotifications);
        setFilteredNotifications(mockNotifications.filter(n => !n.isArchived));
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notifications',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId, workspaceId]);

  // Filter notifications based on activeFilter, searchQuery, and archived status
  React.useEffect(() => {
    let result = [...notifications];

    // Filter by archived status
    result = result.filter(n => (showArchived ? true : !n.isArchived));

    // Apply type filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'urgent') {
        result = result.filter(n => n.priority === 'URGENT');
      } else if (activeFilter === 'leads') {
        result = result.filter(n => n.entityType === 'lead');
      } else if (activeFilter === 'tasks') {
        result = result.filter(n => n.entityType === 'task');
      } else if (activeFilter === 'events') {
        result = result.filter(n => n.entityType === 'event');
      } else if (activeFilter === 'unread') {
        result = result.filter(n => !n.isRead);
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredNotifications(result);
  }, [notifications, activeFilter, searchQuery, showArchived]);

  // Handle marking notifications as read
  const handleMarkAsRead = (notificationIds: string[]) => {
    const updatedNotifications = notifications.map(notification =>
      notificationIds.includes(notification.id) ? { ...notification, isRead: true } : notification
    );

    setNotifications(updatedNotifications);
    setSelectedNotifications([]);

    toast({
      title: `${notificationIds.length} ${
        notificationIds.length === 1 ? 'notification' : 'notifications'
      } marked as read`,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true,
    }));

    setNotifications(updatedNotifications);

    toast({
      title: 'All notifications marked as read',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  };

  // Handle archiving notifications
  const handleArchive = (notificationIds: string[]) => {
    const updatedNotifications = notifications.map(notification =>
      notificationIds.includes(notification.id)
        ? { ...notification, isArchived: true }
        : notification
    );

    setNotifications(updatedNotifications);
    setSelectedNotifications([]);

    toast({
      title: `${notificationIds.length} ${
        notificationIds.length === 1 ? 'notification' : 'notifications'
      } archived`,
      icon: <Archive className="h-4 w-4" />,
    });
  };

  // Toggle notification selection
  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Toggle select all notifications
  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LEAD_DETECTED':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'URGENT_EMAIL':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'TASK_CREATED':
        return <ListTodo className="h-4 w-4 text-blue-500" />;
      case 'EVENT_CREATED':
        return <CalendarDays className="h-4 w-4 text-indigo-500" />;
      case 'FOLLOW_UP_REMINDER':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'RESPONSE_NEEDED':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get badge color for priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500 text-white';
      case 'HIGH':
        return 'bg-amber-500 text-white';
      case 'NORMAL':
        return 'bg-blue-500 text-white';
      case 'LOW':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }

    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // If this week, show day name
    const daysDiff = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString(undefined, { weekday: 'long' });
    }

    // Otherwise show date
    return date.toLocaleDateString();
  };

  // Display the loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-purple-500" />
          AI-Generated Notifications
        </h2>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowArchived(!showArchived)}>
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Button
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('all')}
                >
                  <Inbox className="h-4 w-4 mr-2" />
                  All Notifications
                  <Badge className="ml-auto" variant="outline">
                    {notifications.filter(n => !n.isArchived).length}
                  </Badge>
                </Button>
                <Button
                  variant={activeFilter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('unread')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Unread
                  <Badge className="ml-auto" variant="outline">
                    {notifications.filter(n => !n.isRead && !n.isArchived).length}
                  </Badge>
                </Button>
                <Button
                  variant={activeFilter === 'urgent' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('urgent')}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Urgent
                  <Badge className="ml-auto" variant="outline">
                    {notifications.filter(n => n.priority === 'URGENT' && !n.isArchived).length}
                  </Badge>
                </Button>
                <Separator className="my-2" />
                <Button
                  variant={activeFilter === 'leads' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('leads')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Leads
                  <Badge className="ml-auto" variant="outline">
                    {notifications.filter(n => n.entityType === 'lead' && !n.isArchived).length}
                  </Badge>
                </Button>
                <Button
                  variant={activeFilter === 'tasks' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('tasks')}
                >
                  <ListTodo className="h-4 w-4 mr-2" />
                  Tasks
                  <Badge className="ml-auto" variant="outline">
                    {notifications.filter(n => n.entityType === 'task' && !n.isArchived).length}
                  </Badge>
                </Button>
                <Button
                  variant={activeFilter === 'events' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('events')}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Events
                  <Badge className="ml-auto" variant="outline">
                    {notifications.filter(n => n.entityType === 'event' && !n.isArchived).length}
                  </Badge>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    /* Navigate to settings */
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-grow">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="ai">AI Generated</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md flex items-center gap-2">
                      <span>
                        {activeFilter === 'all'
                          ? 'All Notifications'
                          : activeFilter === 'unread'
                          ? 'Unread Notifications'
                          : activeFilter === 'urgent'
                          ? 'Urgent Notifications'
                          : activeFilter === 'leads'
                          ? 'Lead Notifications'
                          : activeFilter === 'tasks'
                          ? 'Task Notifications'
                          : activeFilter === 'events'
                          ? 'Event Notifications'
                          : 'Notifications'}
                      </span>
                      <Badge variant="outline">{filteredNotifications.length}</Badge>
                    </CardTitle>

                    {selectedNotifications.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(selectedNotifications)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark Read
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchive(selectedNotifications)}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-10">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">No notifications</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-4">
                        {searchQuery
                          ? 'No notifications match your search criteria.'
                          : showArchived
                          ? 'No notifications available.'
                          : 'Your notification center is empty.'}
                      </p>
                      {(searchQuery || activeFilter !== 'all') && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery('');
                            setActiveFilter('all');
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-1">
                        <div className="flex items-center px-4 py-2 text-sm text-muted-foreground border-b">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 mr-2"
                              checked={
                                selectedNotifications.length === filteredNotifications.length &&
                                filteredNotifications.length > 0
                              }
                              onChange={toggleSelectAll}
                            />
                            <span>Select All</span>
                          </div>
                          <span className="ml-auto">
                            {selectedNotifications.length > 0 &&
                              `${selectedNotifications.length} selected`}
                          </span>
                        </div>

                        {filteredNotifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`flex items-start p-3 rounded-md gap-3 hover:bg-muted/50 transition-colors ${
                              !notification.isRead ? 'bg-muted/30' : ''
                            } ${
                              selectedNotifications.includes(notification.id) ? 'bg-primary/10' : ''
                            }`}
                          >
                            <div className="pt-1 flex-shrink-0">
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={selectedNotifications.includes(notification.id)}
                                onChange={() => toggleSelectNotification(notification.id)}
                              />
                            </div>

                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3
                                  className={`font-medium text-sm ${
                                    !notification.isRead ? 'text-primary' : ''
                                  }`}
                                >
                                  {notification.title}
                                </h3>
                                <Badge
                                  className={`${getPriorityColor(notification.priority)} text-xs`}
                                >
                                  {notification.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.content}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(notification.createdAt)}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleMarkAsRead([notification.id])}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleArchive([notification.id])}
                                  >
                                    <Archive className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-10">
                    <BrainCircuit className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">AI-Generated Notifications</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      All notifications in this system are AI-generated based on email analysis,
                      lead detection, and task extraction.
                    </p>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Configure AI Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-10">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">System Notifications</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      System notifications about your account, workspace, and important updates will
                      appear here.
                    </p>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Notification Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// This would be added to the component but missing from the provided code
export function Separator({ className }: { className?: string }) {
  return <div className={`h-px bg-border ${className || ''}`}></div>;
}
