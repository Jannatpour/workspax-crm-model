'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
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
import {
  Search,
  MoreVertical,
  Archive,
  Trash2,
  Tag,
  Mail,
  Send,
  RefreshCw,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { Checkbox } from '@/components/ui/checkbox';

// Mock email data for sent emails
const mockSentEmails = [
  {
    id: '101',
    recipient: { name: 'Marketing Team', email: 'marketing@company.com' },
    cc: [{ name: 'John Smith', email: 'john@example.com' }],
    subject: 'Q2 Marketing Plan Review',
    preview: 'Here is the updated marketing plan for Q2. Please review and provide feedback by Friday...',
    dateSent: new Date('2023-05-10T15:22:00'),
    labels: ['marketing'],
    hasAttachments: true,
    status: 'delivered' // delivered, read, bounced, etc.
  },
  {
    id: '102',
    recipient: { name: 'Sarah Johnson', email: 'sarah@client.com' },
    cc: [],
    subject: 'Project proposal and timeline',
    preview: 'As discussed in our meeting yesterday, I\'m sending over the project proposal and timeline for...',
    dateSent: new Date('2023-05-09T11:45:00'),
    labels: ['client', 'proposal'],
    hasAttachments: true,
    status: 'read'
  },
  {
    id: '103',
    recipient: { name: 'Tech Support', email: 'support@provider.com' },
    cc: [],
    subject: 'Re: Your recent ticket #45678',
    preview: 'Thank you for the update. I've tested the solution you provided and can confirm that the issue...',
    dateSent: new Date('2023-05-08T16:10:00'),
    labels: ['support'],
    hasAttachments: false,
    status: 'delivered'
  },
  {
    id: '104',
    recipient: { name: 'Development Team', email: 'dev@company.com' },
    cc: [{ name: 'Project Manager', email: 'pm@company.com' }],
    subject: 'Updates to feature requirements',
    preview: 'Based on the client feedback, we need to make the following adjustments to the feature requirements...',
    dateSent: new Date('2023-05-07T09:30:00'),
    labels: ['development', 'important'],
    hasAttachments: false,
    status: 'read'
  },
  {
    id: '105',
    recipient: { name: 'Alex Wong', email: 'alex@partner.org' },
    cc: [],
    subject: 'Partnership agreement draft',
    preview: 'Please find attached the draft partnership agreement we discussed. Let me know if you have any questions...',
    dateSent: new Date('2023-05-06T14:15:00'),
    labels: ['partnership', 'legal'],
    hasAttachments: true,
    status: 'read'
  },
];

// Email list item component for sent emails
const SentEmailListItem = ({ email, selected, onToggleSelect, onView }) => {
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

  const statusBadge = () => {
    switch(email.status) {
      case 'read':
        return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Read</span>;
      case 'delivered':
        return <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Delivered</span>;
      case 'bounced':
        return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Bounced</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors ${
        selected ? 'bg-muted/50' : ''
      }`}
      onClick={onView}
    >
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate">
            To: {email.recipient.name}
          </span>
          {email.cc.length > 0 && (
            <span className="text-xs text-muted-foreground">
              +{email.cc.length} CC
            </span>
          )}
        </div>
        <div className="truncate text-sm font-medium">{email.subject}</div>
        <div className="truncate text-xs text-muted-foreground">{email.preview}</div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(email.dateSent)}
        </span>
        <div className="flex items-center gap-1">
          {email.hasAttachments && (
            <span className="text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clipRule="evenodd" />
              </svg>
            </span>
          )}
          {statusBadge()}
        </div>
      </div>
    </div>
  );
};

export function MailSentSection() {
  const { changeSection } = useDashboard();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Handler for toggling email selection
  const handleToggleSelect = (emailId) => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  // Handler for viewing an email
  const handleViewEmail = (emailId) => {
    // In a real app, this would navigate to the email detail view
    console.log(`View sent email ${emailId}`);
  };

  // Filter emails based on search term
  const filteredEmails = mockSentEmails.filter(email => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      email.recipient.name.toLowerCase().includes(searchLower) ||
      email.recipient.email.toLowerCase().includes(searchLower) ||
      email.subject.toLowerCase().includes(searchLower) ||
      email.preview.toLowerCase().includes(searchLower) ||
      email.cc.some(cc =>
        cc.name.toLowerCase().includes(searchLower) ||
        cc.email.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sent</h1>
        <Button onClick={() => changeSection('mail-compose')}>Compose</Button>
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sent emails..."
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
                <DropdownMenuItem>All</DropdownMenuItem>
                <DropdownMenuItem>Read by recipient</DropdownMenuItem>
                <DropdownMenuItem>Not read</DropdownMenuItem>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Forward</DropdownMenuItem>
                  <DropdownMenuItem>Print</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="divide-y">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No sent emails found matching your criteria
                </div>
              ) : (
                filteredEmails.map(email => (
                  <SentEmailListItem
                    key={email.id}
                    email={email}
                    selected={selectedEmails.includes(email.id)}
                    onToggleSelect={() => handleToggleSelect(email.id)}
                    onView={() => handleViewEmail(email.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
