'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  MoreVertical,
  Star,
  StarOff,
  Archive,
  Trash2,
  Clock,
  Tag,
  Mail,
  Inbox,
  RefreshCw,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { Checkbox } from '@/components/ui/checkbox';

// Mock email data
const mockEmails = [
  {
    id: '1',
    sender: { name: 'John Smith', email: 'john@example.com' },
    subject: 'Regarding the new project proposal',
    preview: 'Hi there, I wanted to discuss the new project proposal that we received last week. I think there are some...',
    dateReceived: new Date('2023-05-10T10:30:00'),
    read: false,
    starred: true,
    labels: ['important', 'work'],
    hasAttachments: true
  },
  {
    id: '2',
    sender: { name: 'Marketing Team', email: 'marketing@company.com' },
    subject: 'Content calendar for next month',
    preview: 'Please find attached the content calendar for next month. We need everyone to review and approve by...',
    dateReceived: new Date('2023-05-09T16:42:00'),
    read: true,
    starred: false,
    labels: ['marketing'],
    hasAttachments: true
  },
  {
    id: '3',
    sender: { name: 'Sarah Johnson', email: 'sarah@client.com' },
    subject: 'Meeting follow-up',
    preview: 'Thanks for the productive meeting yesterday. As discussed, I'm sending over the documents we talked about...',
    dateReceived: new Date('2023-05-09T09:15:00'),
    read: true,
    starred: true,
    labels: ['client'],
    hasAttachments: false
  },
  {
    id: '4',
    sender: { name: 'Tech Support', email: 'support@provider.com' },
    subject: 'Your recent ticket #45678',
    preview: 'We've reviewed your support ticket regarding the API integration issues. Our technical team has identified...',
    dateReceived: new Date('2023-05-08T14:23:00'),
    read: false,
    starred: false,
    labels: ['support'],
    hasAttachments: false
  },
  {
    id: '5',
    sender: { name: 'David Wilson', email: 'david@partner.com' },
    subject: 'Partnership opportunity',
    preview: 'Following our conversation last month, I wanted to touch base about the potential partnership between our...',
    dateReceived: new Date('2023-05-08T11:05:00'),
    read: true,
    starred: false,
    labels: ['partnership', 'important'],
    hasAttachments: false
  },
];

// Email list item component
const EmailListItem = ({ email, selected, onToggleSelect, onToggleStar, onView }) => {
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors ${
        selected ? 'bg-muted/50' : ''
      } ${email.read ? '' : 'font-medium'}`}
      onClick={onView}
    >
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          className="text-muted-foreground hover:text-amber-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
        >
          {email.starred ?
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> :
            <StarOff className="h-4 w-4" />
          }
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`truncate ${email.read ? 'text-muted-foreground' : 'text-foreground'}`}>
            {email.sender.name}
          </span>
          {!email.read && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          )}
        </div>
        <div className="truncate text-sm">{email.subject}</div>
        <div className="truncate text-xs text-muted-foreground">{email.preview}</div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(email.dateReceived)}
        </span>
        {email.hasAttachments && (
          <span className="text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
};

export function MailInboxSection() {
  const { changeSection } = useDashboard();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');

  // Handler for toggling email selection
  const handleToggleSelect = (emailId) => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  // Handler for toggling star status
  const handleToggleStar = (emailId) => {
    // In a real app, this would update the star status in your database
    console.log(`Toggle star for email ${emailId}`);
  };

  // Handler for viewing an email
  const handleViewEmail = (emailId) => {
    // In a real app, this would navigate to the email detail view
    console.log(`View email ${emailId}`);
  };

  // Filter emails based on current filter
  const filteredEmails = mockEmails.filter(email => {
    if (currentFilter === 'unread') return !email.read;
    if (currentFilter === 'starred') return email.starred;
    return true;
  }).filter(email => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      email.sender.name.toLowerCase().includes(searchLower) ||
      email.sender.email.toLowerCase().includes(searchLower) ||
      email.subject.toLowerCase().includes(searchLower) ||
      email.preview.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <Button onClick={() => changeSection('mail-compose')}>Compose</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* Sidebar with filters */}
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => changeSection('mail-compose')}
                className="w-full justify-start"
              >
                <Mail className="h-4 w-4 mr-2" />
                Compose
              </Button>

              <Button
                variant={currentFilter === 'all' ? 'secondary' : 'ghost'}
                onClick={() => setCurrentFilter('all')}
                className="w-full justify-start"
              >
                <Inbox className="h-4 w-4 mr-2" />
                Inbox
                <span className="ml-auto bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                  {mockEmails.filter(e => !e.read).length}
                </span>
              </Button>

              <Button
                variant={currentFilter === 'unread' ? 'secondary' : 'ghost'}
                onClick={() => setCurrentFilter('unread')}
                className="w-full justify-start"
              >
                <Mail className="h-4 w-4 mr-2" />
                Unread
              </Button>

              <Button
                variant={currentFilter === 'starred' ? 'secondary' : 'ghost'}
                onClick={() => setCurrentFilter('starred')}
                className="w-full justify-start"
              >
                <Star className="h-4 w-4 mr-2" />
                Starred
              </Button>
            </div>

            <div className="my-4">
              <h3 className="text-sm font-medium mb-2">Labels</h3>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Important
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  Work
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Client
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                  Personal
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email list */}
        <Card className="md:col-span-6">
          <CardHeader className="p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCurrentFilter('all')}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentFilter('unread')}>Unread</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentFilter('starred')}>Starred</DropdownMenuItem>
                  <DropdownMenuItem>Has Attachment</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {selectedEmails.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEmails([])}
                >
                  Deselect
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedEmails.length} selected
                </span>
                <div className="flex-1"></div>
                <Button variant="ghost" size="icon">
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Tag className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Clock className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Mark as Read</DropdownMenuItem>
                    <DropdownMenuItem>Mark as Unread</DropdownMenuItem>
                    <DropdownMenuItem>Move to...</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="divide-y">
                {filteredEmails.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No emails found matching your criteria
                  </div>
                ) : (
                  filteredEmails.map(email => (
                    <EmailListItem
                      key={email.id}
                      email={email}
                      selected={selectedEmails.includes(email.id)}
                      onToggleSelect={() => handleToggleSelect(email.id)}
                      onToggleStar={() => handleToggleStar(email.id)}
                      onView={() => handleViewEmail(email.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
