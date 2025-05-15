'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  StarOff,
  MoreHorizontal,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArchiveIcon,
  Clock,
  Download,
  Reply,
  Forward,
  Flag,
  ThumbsUp,
  Tag,
  Folder,
  CheckSquare,
  Square,
  Inbox,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/components/ui/sonner';

// Types for email data
interface EmailSender {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Email {
  id: string;
  sender: EmailSender;
  recipients: EmailSender[];
  cc?: EmailSender[];
  bcc?: EmailSender[];
  subject: string;
  body: string;
  timestamp: Date;
  read: boolean;
  important: boolean;
  starred: boolean;
  attachments?: EmailAttachment[];
  labels?: string[];
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archived';
}

// Mock data for important emails
const mockImportantEmails: Email[] = [
  {
    id: 'email-1',
    sender: {
      id: 'sender-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    },
    recipients: [
      {
        id: 'recipient-1',
        name: 'John Doe',
        email: 'john@workspaxcrm.com',
      },
    ],
    subject: 'Quarterly Review Meeting - Important Updates',
    body: `<p>Hi John,</p>
           <p>We need to schedule our quarterly review meeting for next week. There are several important updates that require immediate attention:</p>
           <ul>
             <li>Financial reports for Q3</li>
             <li>Project milestone updates</li>
             <li>Team performance evaluation</li>
           </ul>
           <p>Please let me know your availability for next Tuesday or Wednesday.</p>
           <p>Best regards,<br>Alice</p>`,
    timestamp: new Date('2025-05-10T14:30:00'),
    read: true,
    important: true,
    starred: true,
    folder: 'inbox',
    labels: ['work', 'meeting', 'priority'],
  },
  {
    id: 'email-2',
    sender: {
      id: 'sender-2',
      name: 'Robert Chen',
      email: 'robert@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    },
    recipients: [
      {
        id: 'recipient-1',
        name: 'John Doe',
        email: 'john@workspaxcrm.com',
      },
    ],
    subject: 'Urgent: Client Contract Renewal',
    body: `<p>Hello John,</p>
           <p>This is a reminder that the Acme Corp contract is up for renewal in two weeks. They've flagged some concerns about the new pricing structure that we need to address before proceeding with the renewal.</p>
           <p>I've attached the current contract and the proposed new terms for your review.</p>
           <p>We should schedule a call with their procurement team by the end of this week.</p>
           <p>Regards,<br>Robert</p>`,
    timestamp: new Date('2025-05-11T09:15:00'),
    read: false,
    important: true,
    starred: false,
    folder: 'inbox',
    attachments: [
      {
        id: 'attachment-1',
        name: 'AcmeContract_Current.pdf',
        size: 1240000,
        type: 'application/pdf',
        url: '#',
      },
      {
        id: 'attachment-2',
        name: 'AcmeContract_Proposed.pdf',
        size: 1350000,
        type: 'application/pdf',
        url: '#',
      },
    ],
    labels: ['client', 'contract', 'urgent'],
  },
  {
    id: 'email-3',
    sender: {
      id: 'sender-3',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    },
    recipients: [
      {
        id: 'recipient-1',
        name: 'John Doe',
        email: 'john@workspaxcrm.com',
      },
    ],
    cc: [
      {
        id: 'cc-1',
        name: 'Sarah Thompson',
        email: 'sarah@example.com',
      },
    ],
    subject: 'Strategic Partnership Opportunity',
    body: `<p>Dear John,</p>
           <p>Following our discussion at the industry conference last month, I'm reaching out regarding a potential strategic partnership between our companies.</p>
           <p>Our team has prepared a preliminary proposal that outlines the synergies and mutual benefits of this collaboration. I believe this could be a game-changer for both organizations.</p>
           <p>Would you be available for a video call next week to discuss this further?</p>
           <p>Best regards,<br>Maria</p>`,
    timestamp: new Date('2025-05-12T16:45:00'),
    read: true,
    important: true,
    starred: true,
    folder: 'inbox',
    attachments: [
      {
        id: 'attachment-3',
        name: 'PartnershipProposal.pptx',
        size: 3540000,
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        url: '#',
      },
    ],
    labels: ['opportunity', 'partnership', 'priority'],
  },
  {
    id: 'email-4',
    sender: {
      id: 'sender-4',
      name: 'David Wilson',
      email: 'david@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
    recipients: [
      {
        id: 'recipient-1',
        name: 'John Doe',
        email: 'john@workspaxcrm.com',
      },
    ],
    subject: 'Software License Renewal - Action Required',
    body: `<p>Hi John,</p>
           <p>Our enterprise software licenses for the development team are set to expire in 30 days. We need to confirm renewal before the end of this month to avoid any service interruptions.</p>
           <p>The vendor has offered a 15% discount if we commit to a 2-year term instead of the usual annual renewal.</p>
           <p>Please review the attached quote and let me know how you'd like to proceed.</p>
           <p>Thanks,<br>David</p>`,
    timestamp: new Date('2025-05-12T11:20:00'),
    read: false,
    important: true,
    starred: false,
    folder: 'inbox',
    attachments: [
      {
        id: 'attachment-4',
        name: 'License_Renewal_Quote.pdf',
        size: 850000,
        type: 'application/pdf',
        url: '#',
      },
    ],
    labels: ['software', 'renewal', 'urgent'],
  },
  {
    id: 'email-5',
    sender: {
      id: 'sender-5',
      name: 'Jennifer Baker',
      email: 'jennifer@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
    },
    recipients: [
      {
        id: 'recipient-1',
        name: 'John Doe',
        email: 'john@workspaxcrm.com',
      },
    ],
    cc: [
      {
        id: 'cc-2',
        name: 'Michael Brown',
        email: 'michael@example.com',
      },
      {
        id: 'cc-3',
        name: 'Emily Davis',
        email: 'emily@example.com',
      },
    ],
    subject: 'Important: Board Meeting Agenda',
    body: `<p>Dear John,</p>
           <p>In preparation for next week's board meeting, I'm attaching the proposed agenda and the financial reports that will be discussed.</p>
           <p>Could you please review and confirm if there are any additional items you would like to include? Also, please prepare a brief summary of the Q2 marketing initiatives as discussed.</p>
           <p>Kind regards,<br>Jennifer</p>`,
    timestamp: new Date('2025-05-13T08:00:00'),
    read: true,
    important: true,
    starred: true,
    folder: 'inbox',
    attachments: [
      {
        id: 'attachment-5',
        name: 'Board_Meeting_Agenda.docx',
        size: 420000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '#',
      },
      {
        id: 'attachment-6',
        name: 'Q2_Financial_Report.xlsx',
        size: 1780000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        url: '#',
      },
    ],
    labels: ['board', 'meeting', 'priority'],
  },
];

export function MailImportant() {
  const { changeSection } = useDashboard();
  const { toast } = useToast();
  const [emails, setEmails] = useState<Email[]>(mockImportantEmails);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const emailsPerPage = 20;

  // Calculate total pages
  const totalPages = Math.ceil(emails.length / emailsPerPage);

  // Filter emails based on search query
  const filteredEmails = emails.filter(
    email =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current page emails
  const currentEmails = filteredEmails.slice(
    (currentPage - 1) * emailsPerPage,
    currentPage * emailsPerPage
  );

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedEmails(currentEmails.map(email => email.id));
    } else {
      setSelectedEmails([]);
    }
  }, [selectAll, currentEmails]);

  // Handle email selection
  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmails(prev => {
      if (prev.includes(emailId)) {
        return prev.filter(id => id !== emailId);
      } else {
        return [...prev, emailId];
      }
    });
  };

  // Handle toggling star status
  const toggleStarred = (emailId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEmails(prev =>
      prev.map(email => (email.id === emailId ? { ...email, starred: !email.starred } : email))
    );
  };

  // Handle toggling important status
  const toggleImportant = (emailId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEmails(prev =>
      prev.map(email => (email.id === emailId ? { ...email, important: !email.important } : email))
    );

    // Remove from important emails list if no longer important
    const emailToUpdate = emails.find(email => email.id === emailId);
    if (emailToUpdate && emailToUpdate.important) {
      toast({
        title: 'Email removed from important',
        description: 'The email is no longer marked as important.',
      });
    }
  };

  // Handle email click
  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);

    // Mark as read if not already
    if (!email.read) {
      setEmails(prev => prev.map(item => (item.id === email.id ? { ...item, read: true } : item)));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (
    action: 'delete' | 'mark-read' | 'mark-unread' | 'remove-important'
  ) => {
    if (selectedEmails.length === 0) return;

    switch (action) {
      case 'delete':
        setEmails(prev => prev.filter(email => !selectedEmails.includes(email.id)));
        toast({
          title: 'Emails deleted',
          description: `${selectedEmails.length} email(s) moved to trash.`,
        });
        break;
      case 'mark-read':
        setEmails(prev =>
          prev.map(email => (selectedEmails.includes(email.id) ? { ...email, read: true } : email))
        );
        toast({
          title: 'Emails marked as read',
          description: `${selectedEmails.length} email(s) marked as read.`,
        });
        break;
      case 'mark-unread':
        setEmails(prev =>
          prev.map(email => (selectedEmails.includes(email.id) ? { ...email, read: false } : email))
        );
        toast({
          title: 'Emails marked as unread',
          description: `${selectedEmails.length} email(s) marked as unread.`,
        });
        break;
      case 'remove-important':
        setEmails(prev =>
          prev.map(email =>
            selectedEmails.includes(email.id) ? { ...email, important: false } : email
          )
        );
        toast({
          title: 'Emails updated',
          description: `${selectedEmails.length} email(s) removed from important.`,
        });
        break;
    }

    setSelectedEmails([]);
    setSelectAll(false);
  };

  // Handle pagination
  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSelectedEmails([]);
    setSelectAll(false);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      {/* Mail header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Important Mail</h1>
        <Button variant="outline" onClick={() => changeSection('mail-compose')}>
          Compose
        </Button>
      </div>

      {/* Mail toolbar */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectAll}
            onCheckedChange={checked => setSelectAll(checked as boolean)}
            aria-label="Select all"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={selectedEmails.length === 0}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkAction('mark-read')}>
                Mark as read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('mark-unread')}>
                Mark as unread
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('remove-important')}>
                Remove from important
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleBulkAction('delete')}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
            <Inbox className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={selectedEmails.length === 0}
            onClick={() => handleBulkAction('delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" disabled={selectedEmails.length === 0}>
            <ArchiveIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search emails..."
              className="pl-8 w-[300px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter By</DropdownMenuLabel>
              <DropdownMenuItem>
                <Checkbox id="has-attachments" className="mr-2" />
                <label htmlFor="has-attachments">Has attachments</label>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Checkbox id="unread-only" className="mr-2" />
                <label htmlFor="unread-only">Unread only</label>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Checkbox id="starred-only" className="mr-2" />
                <label htmlFor="starred-only">Starred only</label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select defaultValue="date-desc">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="sender">Sender name</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Email list container */}
      <div className="flex flex-1 overflow-hidden border rounded-md">
        {/* Email list */}
        <div className={`flex flex-col ${selectedEmail ? 'w-2/5 border-r' : 'w-full'}`}>
          {currentEmails.length > 0 ? (
            <ScrollArea className="flex-1">
              {currentEmails.map(email => (
                <div
                  key={email.id}
                  className={`flex items-start gap-2 p-3 border-b cursor-pointer hover:bg-muted ${
                    selectedEmail?.id === email.id ? 'bg-muted' : ''
                  } ${!email.read ? 'font-medium' : ''}`}
                  onClick={() => handleEmailClick(email)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedEmails.includes(email.id)}
                      onCheckedChange={() => toggleEmailSelection(email.id)}
                      onClick={e => e.stopPropagation()}
                      aria-label="Select email"
                    />
                    <button
                      className="flex items-center justify-center"
                      onClick={e => toggleStarred(email.id, e)}
                      aria-label={email.starred ? 'Unstar email' : 'Star email'}
                    >
                      {email.starred ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <Star className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      className="flex items-center justify-center"
                      onClick={e => toggleImportant(email.id, e)}
                      aria-label={email.important ? 'Remove from important' : 'Mark as important'}
                    >
                      {email.important ? (
                        <Flag className="h-4 w-4 fill-red-500 text-red-500" />
                      ) : (
                        <Flag className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {email.sender.avatar ? (
                            <AvatarImage src={email.sender.avatar} alt={email.sender.name} />
                          ) : (
                            <AvatarFallback>{email.sender.name.substring(0, 2)}</AvatarFallback>
                          )}
                        </Avatar>
                        <span className={`truncate ${!email.read ? 'font-medium' : ''}`}>
                          {email.sender.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {email.attachments && (
                          <span className="flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            {email.attachments.length}
                          </span>
                        )}
                        <span>{format(email.timestamp, 'MMM d')}</span>
                      </div>
                    </div>

                    <h3 className={`line-clamp-1 ${!email.read ? 'font-medium' : ''}`}>
                      {email.subject}
                    </h3>

                    <div
                      className="line-clamp-1 text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: email.body.replace(/<[^>]*>/g, ' ').substring(0, 100) + '...',
                      }}
                    />

                    {email.labels && email.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {email.labels.map(label => (
                          <Badge key={label} variant="outline" className="text-xs py-0 px-1.5">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <Star className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No emails found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery
                    ? 'No emails match your search criteria.'
                    : "You don't have any important emails yet."}
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {filteredEmails.length > 0 && (
            <div className="flex items-center justify-between p-2 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * emailsPerPage + 1} -{' '}
                {Math.min(currentPage * emailsPerPage, filteredEmails.length)} of{' '}
                {filteredEmails.length} emails
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Email detail view */}
        {selectedEmail && (
          <div className="w-3/5 flex flex-col">
            <div className="p-4 flex-1 overflow-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => toggleStarred(selectedEmail.id, e)}
                    aria-label={selectedEmail.starred ? 'Unstar email' : 'Star email'}
                  >
                    {selectedEmail.starred ? (
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <Star className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => toggleImportant(selectedEmail.id, e)}
                    aria-label={
                      selectedEmail.important ? 'Remove from important' : 'Mark as important'
                    }
                  >
                    {selectedEmail.important ? (
                      <Flag className="h-5 w-5 fill-red-500 text-red-500" />
                    ) : (
                      <Flag className="h-5 w-5" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBulkAction('mark-unread')}>
                        Mark as unread
                      </DropdownMenuItem>
                      <DropdownMenuItem>Move to folder</DropdownMenuItem>
                      <DropdownMenuItem>Add label</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction('delete')}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-10 w-10">
                  {selectedEmail.sender.avatar ? (
                    <AvatarImage
                      src={selectedEmail.sender.avatar}
                      alt={selectedEmail.sender.name}
                    />
                  ) : (
                    <AvatarFallback>{selectedEmail.sender.name.substring(0, 2)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{selectedEmail.sender.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedEmail.sender.email}</p>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{format(selectedEmail.timestamp, 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    To: {selectedEmail.recipients.map(r => r.name || r.email).join(', ')}
                  </div>

                  {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      CC: {selectedEmail.cc.map(r => r.name || r.email).join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
              />

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">
                    Attachments ({selectedEmail.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedEmail.attachments.map(attachment => (
                      <div
                        key={attachment.id}
                        className="flex items-center p-2 border rounded-md hover:bg-muted"
                      >
                        <div className="p-2 bg-muted rounded-md mr-2">
                          <Download className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmail.labels && selectedEmail.labels.length > 0 && (
                <div className="mt-6 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {selectedEmail.labels.map(label => (
                      <Badge key={label} variant="outline" className="text-xs py-0 px-1.5">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex items-center gap-2">
              <Button className="gap-1">
                <Reply className="h-4 w-4" />
                Reply
              </Button>
              <Button variant="outline" className="gap-1">
                <Forward className="h-4 w-4" />
                Forward
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
