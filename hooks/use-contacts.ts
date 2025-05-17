// hooks/use-contacts.ts
import { useState, useEffect, useCallback } from 'react';
import { Contact, ContactFilterOptions, ContactSortOptions } from '@/lib/contacts/types';
import { useToast } from '@/components/ui/sonner';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<ContactFilterOptions>({});
  const [sortOptions, setSortOptions] = useState<ContactSortOptions>({
    field: 'updatedAt',
    direction: 'desc',
  });
  const { toast } = useToast();

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contacts');

      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }

      const data = await response.json();
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
      toast({
        title: 'Error',
        description: 'Failed to load contacts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Create a new contact
  const createContact = useCallback(
    async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await fetch('/api/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contactData),
        });

        if (!response.ok) {
          throw new Error(`Failed to create contact: ${response.statusText}`);
        }

        const newContact = await response.json();

        // Update state with the new contact
        setContacts(prev => [newContact, ...prev]);

        return newContact;
      } catch (err) {
        console.error('Error creating contact:', err);
        const message = err instanceof Error ? err.message : 'Failed to create contact';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  // Update a contact
  const updateContact = useCallback(
    async (id: string, contactData: Partial<Contact>) => {
      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contactData),
        });

        if (!response.ok) {
          throw new Error(`Failed to update contact: ${response.statusText}`);
        }

        const updatedContact = await response.json();

        // Update state
        setContacts(prev => prev.map(contact => (contact.id === id ? updatedContact : contact)));

        return updatedContact;
      } catch (err) {
        console.error('Error updating contact:', err);
        const message = err instanceof Error ? err.message : 'Failed to update contact';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  // Delete a contact
  const deleteContact = useCallback(
    async (ids: string[]) => {
      try {
        const response = await fetch('/api/contacts/batch-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
          throw new Error(`Failed to delete contacts: ${response.statusText}`);
        }

        // Update state by removing deleted contacts
        setContacts(prev => prev.filter(contact => !ids.includes(contact.id)));

        return true;
      } catch (err) {
        console.error('Error deleting contacts:', err);
        const message = err instanceof Error ? err.message : 'Failed to delete contacts';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  // Star/unstar a contact
  const starContact = useCallback(
    async (id: string, isStarred: boolean) => {
      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isStarred }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update contact: ${response.statusText}`);
        }

        // Update state
        setContacts(prev =>
          prev.map(contact => (contact.id === id ? { ...contact, isStarred } : contact))
        );

        return true;
      } catch (err) {
        console.error('Error starring contact:', err);
        const message = err instanceof Error ? err.message : 'Failed to update contact';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  // Export contacts
  const exportContacts = useCallback(
    async (ids: string[], format: 'csv' | 'vcf' | 'json' = 'csv') => {
      try {
        const response = await fetch('/api/contacts/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids, format }),
        });

        if (!response.ok) {
          throw new Error(`Failed to export contacts: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Create download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return true;
      } catch (err) {
        console.error('Error exporting contacts:', err);
        const message = err instanceof Error ? err.message : 'Failed to export contacts';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  return {
    contacts,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    sortOptions,
    setSortOptions,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    starContact,
    exportContacts,
  };
}
