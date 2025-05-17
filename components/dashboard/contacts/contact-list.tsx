'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Contact } from '@/lib/contacts/types';
import { ContactCard } from './contact-card';
import { ContactListTable } from './contact-list-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Grid,
  LayoutList,
  Mail,
  Tag,
  Trash2,
  MoreHorizontal,
  Download,
  Users,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/sonner';
import { useApolloIntegration } from '@/hooks/use-apollo-integration';
import { ContactsImportDialog } from './contacts-import-dialog';
import { ContactFilterDialog } from './contact-filter-dialog';

interface ContactListProps {
  contacts: Contact[];
  onDelete?: (ids: string[]) => void;
  onStar?: (id: string, starred: boolean) => void;
  onExport?: (ids: string[], format: 'csv' | 'vcf' | 'json') => void;
  onImport?: () => void;
  onRefresh?: () => Promise<void>;
  availableGroups?: any[];
  availableTags?: any[];
  enableAI?: boolean;
}

export function ContactList({
  contacts,
  onDelete,
  onStar,
  onExport,
  onImport,
  onRefresh,
  availableGroups = [],
  availableTags = [],
  enableAI = false,
}: ContactListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [viewType, setViewType] = useState<'table' | 'cards'>('table');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { enrichContacts, isEnriching } = useApolloIntegration();

  // Handle toggle selection of a contact
  const toggleSelection = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  };

  // Handle select all contacts
  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
  };

  // Handle delete selected contacts
  const handleDeleteSelected = () => {
    if (onDelete && selectedContacts.length > 0) {
      onDelete(selectedContacts);
      toast({
        title: `${selectedContacts.length} contacts deleted`,
        description: 'The selected contacts have been removed.',
      });
      setSelectedContacts([]);
    }
  };

  // Handle send email to selected contacts
  const handleSendEmail = () => {
    if (selectedContacts.length > 0) {
      router.push(`/dashboard/mail/compose?contacts=${selectedContacts.join(',')}`);
    }
  };

  // Handle export selected contacts
  const handleExport = (format: 'csv' | 'vcf' | 'json') => {
    if (onExport && selectedContacts.length > 0) {
      onExport(selectedContacts, format);
      toast({
        title: `Exporting ${selectedContacts.length} contacts`,
        description: `Contacts will be exported as ${format.toUpperCase()}`,
      });
    }
  };

  // Handle refresh contacts
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        toast({
          title: 'Contacts refreshed',
          description: 'Your contact list has been updated.',
        });
      } catch (error) {
        toast({
          title: 'Refresh failed',
          description: 'There was an error refreshing contacts.',
          variant: 'destructive',
        });
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Handle enrich selected contacts with Apollo.io
  const handleEnrichContacts = async () => {
    if (selectedContacts.length === 0) {
      toast({
        title: 'No contacts selected',
        description: 'Please select contacts to enrich.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const selectedContactObjects = contacts.filter(c => selectedContacts.includes(c.id));
      const enrichedContacts = await enrichContacts(selectedContactObjects);

      toast({
        title: 'Contacts enriched',
        description: `Successfully enriched ${enrichedContacts.length} contacts with Apollo data.`,
      });
    } catch (error) {
      toast({
        title: 'Enrichment failed',
        description: 'There was an error enriching contacts with Apollo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions bar when contacts are selected */}
      {selectedContacts.length > 0 && (
        <div className="bg-muted/50 border rounded-md p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedContacts.length === contacts.length && contacts.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <Badge variant="secondary" className="gap-1">
              {selectedContacts.length} selected
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSendEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleEnrichContacts}
              disabled={isEnriching}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isEnriching ? 'Enriching...' : 'Enrich'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('vcf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as vCard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDeleteSelected}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* View toggle and filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TabsList className="bg-muted/50">
            <TabsTrigger
              value="table"
              onClick={() => setViewType('table')}
              className={viewType === 'table' ? 'data-[state=active]:bg-background' : ''}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger
              value="cards"
              onClick={() => setViewType('cards')}
              className={viewType === 'cards' ? 'data-[state=active]:bg-background' : ''}
            >
              <Grid className="h-4 w-4 mr-2" />
              Cards
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Main content - contacts in either table or card view */}
      <div>
        {viewType === 'table' ? (
          <ContactListTable
            contacts={contacts}
            selectedContacts={selectedContacts}
            onSelect={toggleSelection}
            onSelectAll={toggleSelectAll}
            onStar={onStar}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                isSelected={selectedContacts.includes(contact.id)}
                onSelect={() => toggleSelection(contact.id)}
                onStar={onStar}
              />
            ))}
          </div>
        )}

        {contacts.length === 0 && (
          <div className="text-center py-12 border rounded-md">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No contacts found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Get started by adding a new contact or importing contacts from another service.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button onClick={() => router.push('/dashboard/contacts/new')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import Contacts
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ContactsImportDialog open={showImportDialog} onOpenChange={setShowImportDialog} />

      <ContactFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        availableTags={availableTags}
        availableGroups={availableGroups}
      />
    </div>
  );
}
