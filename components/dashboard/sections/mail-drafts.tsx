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
import { Search, MoreVertical, Trash2, Mail, RefreshCw, Edit, Calendar, Clock } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { Checkbox } from '@/components/ui/checkbox';

// Mock draft emails
const mockDrafts = [
  {
    id: '201',
    recipient: { name: 'Marketing Team', email: 'marketing@company.com' },
    subject: 'Q3 Planning Meeting',
    preview: "I'd like to schedule a team meeting to discuss our Q3 goals and initiatives...",
    lastEdited: new Date('2023-05-10T14:20:00'),
    hasAttachments: false,
    scheduled: null,
  },
  {
    id: '202',
    recipient: { name: 'Client Project Team', email: 'project@client.com' },
    subject: 'Weekly Progress Update - May 14',
    preview:
      "Here's our weekly progress update for the ongoing project:\n\n1. Frontend development is 75% complete\n2. API integration...",
    lastEdited: new Date('2023-05-09T18:45:00'),
    hasAttachments: true,
    scheduled: new Date('2023-05-15T09:00:00'),
  },
  {
    id: '203',
    recipient: { name: '', email: '' },
    subject: 'Ideas for team building',
    preview:
      'Some ideas for our next team building activity:\n\n1. Escape room challenge\n2. Cooking class\n3. Outdoor adventure...',
    lastEdited: new Date('2023-05-09T10:15:00'),
    hasAttachments: false,
    scheduled: null,
  },
  {
    id: '204',
    recipient: { name: 'Sarah Johnson', email: 'sarah@client.com' },
    subject: 'Revised Proposal',
    preview:
      "Based on your feedback, I've revised the proposal with the following adjustments:\n\n1. Timeline extended by two weeks\n2. Added optional...",
    lastEdited: new Date('2023-05-08T16:30:00'),
    hasAttachments: true,
    scheduled: null,
  },
];

// Draft email list item component
const DraftListItem = ({ draft, selected, onToggleSelect, onEdit }) => {
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

  return (
    <div
      className={`flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors ${
        selected ? 'bg-muted/50' : ''
      }`}
      onClick={onEdit}
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
          <span className="truncate font-medium">{draft.recipient.name || 'No recipient'}</span>
          {draft.scheduled && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Scheduled
            </span>
          )}
        </div>
        <div className="truncate text-sm">{draft.subject || 'No subject'}</div>
        <div className="truncate text-xs text-muted-foreground">{draft.preview}</div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(draft.lastEdited)}
        </span>
        {draft.hasAttachments && (
          <span className="text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={e => {
          e.stopPropagation();
          onEdit();
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function MailDraftsSection() {
  const { changeSection } = useDashboard();
  const [selectedDrafts, setSelectedDrafts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Handler for toggling draft selection
  const handleToggleSelect = draftId => {
    if (selectedDrafts.includes(draftId)) {
      setSelectedDrafts(selectedDrafts.filter(id => id !== draftId));
    } else {
      setSelectedDrafts([...selectedDrafts, draftId]);
    }
  };

  // Handler for editing a draft
  const handleEditDraft = draftId => {
    // In a real app, this would load the draft into the compose editor
    changeSection('mail-compose');
    console.log(`Edit draft ${draftId}`);
  };

  // Filter drafts based on search term
  const filteredDrafts = mockDrafts.filter(draft => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (draft.recipient.name && draft.recipient.name.toLowerCase().includes(searchLower)) ||
      (draft.recipient.email && draft.recipient.email.toLowerCase().includes(searchLower)) ||
      (draft.subject && draft.subject.toLowerCase().includes(searchLower)) ||
      draft.preview.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Drafts</h1>
        <Button onClick={() => changeSection('mail-compose')}>New Email</Button>
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search drafts..."
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
          {selectedDrafts.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 border-b">
              <Button variant="ghost" size="sm" onClick={() => setSelectedDrafts([])}>
                Deselect
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedDrafts.length} selected
              </span>
              <div className="flex-1"></div>
              <Button variant="ghost" size="icon" title="Delete selected drafts">
                <Trash2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit as new</DropdownMenuItem>
                  <DropdownMenuItem>Schedule send</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Delete all drafts</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="divide-y">
              {filteredDrafts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No drafts found matching your criteria
                </div>
              ) : (
                filteredDrafts.map(draft => (
                  <DraftListItem
                    key={draft.id}
                    draft={draft}
                    selected={selectedDrafts.includes(draft.id)}
                    onToggleSelect={() => handleToggleSelect(draft.id)}
                    onEdit={() => handleEditDraft(draft.id)}
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
