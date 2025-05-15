'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  MoreVertical,
  Trash2,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock deleted emails
const mockDeletedEmails = [
  {
    id: '301',
    sender: { name: 'Newsletter Service', email: 'news@service.com' },
    recipient: null, // If it's from Inbox
    subject: 'Weekly industry update: May 8-14',
    preview:
      "This week's top stories: 1. Market trends show shift towards sustainable solutions...",
    deletedAt: new Date('2023-05-10T16:30:00'),
    folder: 'inbox', // Where it was deleted from
    expiresAt: new Date('2023-06-10T16:30:00'), // When it will be permanently deleted
  },
  {
    id: '302',
    sender: null,
    recipient: { name: 'James Wilson', email: 'james@client.org' },
    subject: 'Meeting rescheduled',
    preview:
      'Due to a conflict in my schedule, I need to reschedule our meeting planned for tomorrow...',
    deletedAt: new Date('2023-05-09T14:20:00'),
    folder: 'sent',
    expiresAt: new Date('2023-06-09T14:20:00'),
  },
  {
    id: '303',
    sender: { name: 'Promotional Offers', email: 'promo@deals.com' },
    recipient: null,
    subject: 'Limited time offer: 50% off subscriptions',
    preview: 'For a limited time, get 50% off all subscription plans! Offer expires May 15th...',
    deletedAt: new Date('2023-05-08T09:45:00'),
    folder: 'inbox',
    expiresAt: new Date('2023-06-08T09:45:00'),
  },
  {
    id: '304',
    sender: null,
    recipient: { name: 'Marketing Team', email: 'marketing@company.com' },
    subject: 'Draft: Social media campaign ideas',
    preview:
      'Here are some draft ideas for our upcoming social media campaign. Let me know your thoughts...',
    deletedAt: new Date('2023-05-07T11:15:00'),
    folder: 'drafts',
    expiresAt: new Date('2023-06-07T11:15:00'),
  },
  {
    id: '305',
    sender: { name: 'Automated Alert', email: 'alerts@system.com' },
    recipient: null,
    subject: 'System Maintenance Notice',
    preview:
      'Our systems will be undergoing routine maintenance on Saturday, May 13th, from 2:00 AM to 4:00 AM UTC...',
    deletedAt: new Date('2023-05-06T15:50:00'),
    folder: 'inbox',
    expiresAt: new Date('2023-06-06T15:50:00'),
  },
];

// Deleted email list item component
const DeletedEmailListItem = ({ email, selected, onToggleSelect, onView }) => {
  const formatDate = date => {
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

  const getRemainingDays = expiresAt => {
    const today = new Date();
    const diffTime = expiresAt.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const remainingDays = getRemainingDays(email.expiresAt);

  // Determine if this is a sent or received email
  const isSent = email.sender === null && email.recipient !== null;

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
          onClick={e => e.stopPropagation()}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isSent ? (
            <span className="truncate">To: {email.recipient.name}</span>
          ) : (
            <span className="truncate">From: {email.sender.name}</span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {email.folder.charAt(0).toUpperCase() + email.folder.slice(1)}
          </span>
        </div>
        <div className="truncate text-sm">{email.subject}</div>
        <div className="truncate text-xs text-muted-foreground">{email.preview}</div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(email.deletedAt)}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            remainingDays <= 3
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
          }`}
        >
          {remainingDays} days left
        </span>
      </div>
    </div>
  );
};

export function MailTrashSection() {
  const { changeSection } = useDashboard();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Handler for toggling email selection
  const handleToggleSelect = emailId => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  // Handler for viewing an email
  const handleViewEmail = emailId => {
    // In a real app, this would navigate to the email detail view
    console.log(`View deleted email ${emailId}`);
  };

  // Handler for permanent deletion
  const handlePermanentDelete = () => {
    // In a real app, this would permanently delete the selected emails
    console.log(`Permanently delete emails: ${selectedEmails.join(', ')}`);
    setSelectedEmails([]);
    setShowDeleteDialog(false);
  };

  // Handler for restoring emails
  const handleRestore = () => {
    // In a real app, this would restore the selected emails to their original folders
    console.log(`Restore emails: ${selectedEmails.join(', ')}`);
    setSelectedEmails([]);
  };

  // Filter emails based on search term
  const filteredEmails = mockDeletedEmails.filter(email => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();

    // Check sender or recipient based on email type
    const personMatch = email.sender
      ? email.sender.name.toLowerCase().includes(searchLower) ||
        email.sender.email.toLowerCase().includes(searchLower)
      : email.recipient.name.toLowerCase().includes(searchLower) ||
        email.recipient.email.toLowerCase().includes(searchLower);

    return (
      personMatch ||
      email.subject.toLowerCase().includes(searchLower) ||
      email.preview.toLowerCase().includes(searchLower) ||
      email.folder.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trash</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestore}
            disabled={selectedEmails.length === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore
          </Button>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={selectedEmails.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Forever
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Permanent Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to permanently delete {selectedEmails.length}{' '}
                  {selectedEmails.length === 1 ? 'email' : 'emails'}? This action cannot be undone
                  and all content and attachments will be lost.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handlePermanentDelete}>
                  Delete Forever
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search trash..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="bg-muted/30 p-3 border-b flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-muted-foreground">
              Items in trash will be permanently deleted after 30 days
            </p>
          </div>

          {selectedEmails.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 border-b">
              <Button variant="ghost" size="sm" onClick={() => setSelectedEmails([])}>
                Deselect
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedEmails.length} selected
              </span>
              <div className="flex-1"></div>
              <Button variant="ghost" size="sm" onClick={handleRestore}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleRestore}>
                    Restore to original folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete Forever
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="divide-y">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No deleted emails found matching your criteria
                </div>
              ) : (
                filteredEmails.map(email => (
                  <DeletedEmailListItem
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
