'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Clock,
  Star,
  Edit,
  Trash2,
  ArrowLeft,
  MoreHorizontal,
  Send,
  MessageSquare,
  FileText,
  Tag,
  History,
  Download,
  Copy,
  Check,
  Users,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/components/ui/sonner';
import { cn, formatDate } from '@/lib/utils';

// Mock data interfaces
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  status?: 'active' | 'inactive' | 'lead' | 'customer' | 'prospect' | 'archived';
  isStarred?: boolean;
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  notes?: string;
  assignedTo?: string;
  source?: string;
  engagementScore?: 'high' | 'medium' | 'low' | 'none';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  activities?: ContactActivity[];
}

interface ContactActivity {
  id: string;
  contactId: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'other';
  title: string;
  description: string;
  date: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

// Mock data contact
const mockContact: Contact = {
  id: '123',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '(555) 123-4567',
  company: 'Acme Corporation',
  title: 'Marketing Director',
  address: '123 Business Ave',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94103',
  country: 'United States',
  website: 'https://janesmith.com',
  status: 'active',
  isStarred: true,
  lastContactedAt: '2024-05-01T14:30:00Z',
  nextFollowUpDate: '2024-05-22T10:00:00Z',
  tags: [
    { id: '1', name: 'VIP', color: '#FFA500' },
    { id: '2', name: 'Marketing', color: '#6366F1' },
    { id: '3', name: 'Enterprise', color: '#10B981' },
  ],
  notes: 'Jane is a key decision maker at Acme. We should schedule a quarterly business review.',
  assignedTo: 'Sam Wilson',
  source: 'Referral',
  engagementScore: 'high',
  createdAt: '2023-11-15T09:23:00Z',
  updatedAt: '2024-05-01T14:45:00Z',
  activities: [
    {
      id: '1',
      contactId: '123',
      type: 'email',
      title: 'Follow-up Email',
      description: 'Sent a follow-up email about the new product features',
      date: '2024-05-01T14:30:00Z',
      createdBy: 'John Doe',
    },
    {
      id: '2',
      contactId: '123',
      type: 'call',
      title: 'Discovery Call',
      description: 'Discussed pain points and current solutions',
      date: '2024-04-22T11:15:00Z',
      createdBy: 'John Doe',
    },
    {
      id: '3',
      contactId: '123',
      type: 'meeting',
      title: 'Product Demo',
      description: 'Demonstrated the new analytics dashboard',
      date: '2024-04-15T15:00:00Z',
      createdBy: 'John Doe',
    },
    {
      id: '4',
      contactId: '123',
      type: 'note',
      title: 'Follow-up Call Notes',
      description:
        'Jane expressed interest in the enterprise plan. Mentioned concerns about data migration.',
      date: '2024-04-05T10:30:00Z',
      createdBy: 'Sam Wilson',
    },
  ],
};

// Helper function to get initials
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Activity Item Component
const ActivityItem = ({ activity }: { activity: ContactActivity }) => {
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
        return <Check className="h-4 w-4 text-indigo-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-0">
      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-none">{activity.title}</p>
          <span className="text-xs text-muted-foreground">{formatDate(activity.date)}</span>
        </div>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
        {activity.createdBy && (
          <p className="text-xs text-muted-foreground">By: {activity.createdBy}</p>
        )}
      </div>
    </div>
  );
};

export function ContactDetail() {
  const params = useParams();
  const { changeSection, goBack, sectionParams } = useDashboard();
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCopied, setIsCopied] = useState(false);

  // Fetch contact data on mount
  useEffect(() => {
    const fetchContact = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll use our mock data
        setTimeout(() => {
          // Check if we have sectionParams.id from context or params.id from URL
          const contactId = sectionParams?.id || params?.id;

          if (contactId) {
            // We would fetch the contact by ID here
            // For demo, we'll just use the mock data
            setContact(mockContact);
          }

          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching contact:', error);
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [params?.id, sectionParams?.id]);

  // Handle back navigation
  const handleBack = () => {
    goBack();
  };

  // Handle star/unstar
  const handleToggleStar = () => {
    if (!contact) return;

    setContact({
      ...contact,
      isStarred: !contact.isStarred,
    });

    toast({
      title: contact.isStarred ? 'Contact unstarred' : 'Contact starred',
      description: `${contact.firstName} ${contact.lastName} has been ${
        contact.isStarred ? 'removed from' : 'added to'
      } your starred contacts.`,
    });
  };

  // Handle edit
  const handleEdit = () => {
    if (!contact) return;
    changeSection('contacts-edit', { id: contact.id });
  };

  // Handle delete
  const handleDelete = () => {
    if (!contact) return;

    // Show confirmation toast
    toast({
      title: 'Contact deleted',
      description: `${contact.firstName} ${contact.lastName} has been deleted.`,
    });

    // Navigate back to contacts list
    changeSection('contacts');
  };

  // Handle copy email
  const handleCopyEmail = () => {
    if (!contact?.email) return;

    navigator.clipboard.writeText(contact.email);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    toast({
      title: 'Email copied',
      description: 'Email address copied to clipboard.',
    });
  };

  // Handle send email
  const handleSendEmail = () => {
    if (!contact) return;
    changeSection('mail-compose', { to: contact.email });
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-muted"></div>
          <div className="h-6 w-48 bg-muted rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
          <div className="md:col-span-2">
            <div className="h-12 bg-muted rounded-lg mb-4"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // If no contact found
  if (!contact) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Contact Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The contact you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => changeSection('contacts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {contact.firstName} {contact.lastName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleStar}
            className={cn('rounded-full', contact.isStarred && 'text-yellow-500')}
          >
            <Star className={cn('h-4 w-4', contact.isStarred && 'fill-yellow-500')} />
          </Button>
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button variant="default" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => changeSection('contacts-new', { duplicate: contact.id })}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contact Information and Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar with basic info */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  {contact.avatarUrl ? (
                    <AvatarImage
                      src={contact.avatarUrl}
                      alt={`${contact.firstName} ${contact.lastName}`}
                    />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {getInitials(`${contact.firstName} ${contact.lastName}`)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h2 className="text-xl font-bold">
                  {contact.firstName} {contact.lastName}
                </h2>
                {contact.title && contact.company && (
                  <p className="text-muted-foreground mb-2">
                    {contact.title} at {contact.company}
                  </p>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    'px-2 py-0.5 capitalize',
                    contact.status === 'active' &&
                      'border-green-500 text-green-500 bg-green-50 dark:bg-green-950/20',
                    contact.status === 'inactive' &&
                      'border-gray-500 text-gray-500 bg-gray-50 dark:bg-gray-950/20',
                    contact.status === 'lead' &&
                      'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950/20',
                    contact.status === 'customer' &&
                      'border-purple-500 text-purple-500 bg-purple-50 dark:bg-purple-950/20',
                    contact.status === 'prospect' &&
                      'border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/20'
                  )}
                >
                  {contact.status}
                </Badge>

                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center mt-3">
                    {contact.tags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="px-2 py-0.5 text-xs"
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
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <div className="flex items-center gap-1">
                      <p className="text-sm">{contact.email}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCopyEmail}
                      >
                        {isCopied ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {contact.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-sm">{contact.phone}</p>
                    </div>
                  </div>
                )}

                {contact.company && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="text-sm">{contact.company}</p>
                    </div>
                  </div>
                )}

                {(contact.city || contact.state || contact.country) && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-sm">
                        {[contact.city, contact.state, contact.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {contact.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a
                        href={contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {contact.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Key dates */}
              <div className="space-y-3">
                {contact.lastContactedAt && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-muted-foreground">Last Contacted</p>
                      <p className="text-sm">{formatDate(contact.lastContactedAt)}</p>
                    </div>
                  </div>
                )}

                {contact.nextFollowUpDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-muted-foreground">Next Follow-up</p>
                      <p className="text-sm">{formatDate(contact.nextFollowUpDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">Assigned To</p>
                    <p className="text-sm">{contact.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Quick actions */}
              <div className="space-y-2">
                <Button className="w-full" onClick={handleSendEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content with tabs */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                  <CardDescription>Basic details and contact information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Full Name</p>
                      <p className="text-sm text-muted-foreground">
                        {contact.firstName} {contact.lastName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                    {contact.phone && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      </div>
                    )}
                    {contact.title && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Job Title</p>
                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                      </div>
                    )}
                    {contact.company && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Company</p>
                        <p className="text-sm text-muted-foreground">{contact.company}</p>
                      </div>
                    )}
                    {contact.website && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Website</p>
                        <a
                          href={contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {contact.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {(contact.address ||
                    contact.city ||
                    contact.state ||
                    contact.zipCode ||
                    contact.country) && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Address</h3>
                        <p className="text-sm text-muted-foreground">
                          {contact.address && <span className="block">{contact.address}</span>}
                          {(contact.city || contact.state || contact.zipCode) && (
                            <span className="block">
                              {[contact.city, contact.state, contact.zipCode]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          )}
                          {contact.country && <span className="block">{contact.country}</span>}
                        </p>
                      </div>
                    </>
                  )}

                  {contact.notes && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Notes</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {contact.notes}
                        </p>
                      </div>
                    </>
                  )}

                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Additional Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Source</p>
                        <p className="text-sm">{contact.source || 'Not specified'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Engagement Score</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'px-2 py-0.5 capitalize',
                            contact.engagementScore === 'high' &&
                              'border-green-500 text-green-500 bg-green-50 dark:bg-green-950/20',
                            contact.engagementScore === 'medium' &&
                              'border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/20',
                            contact.engagementScore === 'low' &&
                              'border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-950/20',
                            contact.engagementScore === 'none' &&
                              'border-gray-500 text-gray-500 bg-gray-50 dark:bg-gray-950/20'
                          )}
                        >
                          {contact.engagementScore || 'None'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm">{formatDate(contact.createdAt)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="text-sm">{formatDate(contact.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Activities</CardTitle>
                  <CardDescription>Latest interactions with this contact.</CardDescription>
                </CardHeader>
                <CardContent>
                  {contact.activities && contact.activities.length > 0 ? (
                    <div className="space-y-0">
                      {contact.activities.slice(0, 3).map(activity => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                      {contact.activities.length > 3 && (
                        <Button
                          variant="ghost"
                          className="w-full mt-2"
                          onClick={() => setActiveTab('activities')}
                        >
                          View All Activities
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <History className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No activities recorded yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => changeSection('contacts-activity-new', { id: contact.id })}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="mt-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Activity History</CardTitle>
                    <CardDescription>
                      All interactions and activities with this contact.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => changeSection('contacts-activity-new', { id: contact.id })}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {contact.activities && contact.activities.length > 0 ? (
                      <div className="space-y-0">
                        {contact.activities.map(activity => (
                          <ActivityItem key={activity.id} activity={activity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <History className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No activities recorded yet</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Notes</CardTitle>
                    <CardDescription>
                      Important notes and observations about this contact.
                    </CardDescription>
                  </div>
                  <Button onClick={() => changeSection('contacts-note-new', { id: contact.id })}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </CardHeader>
                <CardContent>
                  {contact.notes ? (
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium">General Notes</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleEdit}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                        {contact.notes}
                      </p>
                      <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                        <span>Updated: {formatDate(contact.updatedAt)}</span>
                        <span>By: {contact.assignedTo || 'System'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No notes have been added yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => changeSection('contacts-note-new', { id: contact.id })}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emails" className="mt-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Email Communication</CardTitle>
                    <CardDescription>
                      Email history and conversations with this contact.
                    </CardDescription>
                  </div>
                  <Button onClick={handleSendEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No email history available</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleSendEmail}>
                      <Send className="h-4 w-4 mr-2" />
                      Start Conversation
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
