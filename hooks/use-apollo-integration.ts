// hooks/use-apollo-integration.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/sonner';
import { Contact } from '@/lib/contacts/types';

interface ApolloSearchParams {
  query: string;
  type: 'email' | 'domain';
}

export function useApolloIntegration() {
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Enrich contacts with Apollo data
   */
  const enrichContacts = useCallback(
    async (contacts: Contact[]): Promise<Contact[]> => {
      if (!contacts.length) return [];

      setIsEnriching(true);
      setError(null);

      try {
        // Call our backend API to handle Apollo enrichment
        const response = await fetch('/api/contacts/apollo?action=enrich', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contacts }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error enriching contacts: ${response.statusText}`);
        }

        const data = await response.json();

        // Update the contacts in the database
        const updateResponse = await fetch('/api/contacts/batch-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contacts: data.enrichedContacts }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(
            errorData.error || `Error updating contacts: ${updateResponse.statusText}`
          );
        }

        toast({
          title: 'Contacts enriched',
          description: `Successfully enriched ${
            data.enrichedContacts.filter((c: Contact) => c.isEnriched).length
          } contacts with Apollo data.`,
        });

        return data.enrichedContacts;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setError(err);
        toast({
          title: 'Error enriching contacts',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setIsEnriching(false);
      }
    },
    [toast]
  );

  /**
   * Search for contacts by email or domain
   */
  const searchApolloContacts = useCallback(
    async (query: string, type: 'email' | 'domain' = 'email') => {
      setIsSearching(true);
      setSearchResults([]);
      setError(null);

      try {
        const response = await fetch('/api/contacts/apollo?action=search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, type }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error searching Apollo: ${response.statusText}`);
        }

        const data = await response.json();
        setSearchResults(data.persons || []);
        return data.persons || [];
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setError(err);
        toast({
          title: 'Error searching Apollo',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setIsSearching(false);
      }
    },
    [toast]
  );

  /**
   * Find similar companies
   */
  const findSimilarCompanies = useCallback(
    async (domain: string) => {
      try {
        const response = await fetch('/api/contacts/apollo?action=similar-companies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ domain }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Error finding similar companies: ${response.statusText}`
          );
        }

        const data = await response.json();
        return data.organizations || [];
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setError(err);
        toast({
          title: 'Error finding similar companies',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  /**
   * Import contacts from Apollo by domain
   */
  const importContactsByDomain = useCallback(
    async (
      domain: string
    ): Promise<{
      total: number;
      imported: number;
      errors: number;
      skipped: number;
    }> => {
      setIsSearching(true);
      setError(null);

      try {
        // First, search for contacts by domain
        const persons = await searchApolloContacts(domain, 'domain');

        if (!persons || persons.length === 0) {
          toast({
            title: 'No contacts found',
            description: `No contacts found on Apollo.io for domain "${domain}"`,
          });
          return { total: 0, imported: 0, errors: 0, skipped: 0 };
        }

        // Then import the contacts
        const response = await fetch('/api/contacts/import/apollo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ persons, domain }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error importing contacts: ${response.statusText}`);
        }

        const results = await response.json();

        toast({
          title: 'Contacts imported',
          description: `Successfully imported ${results.imported} contacts from Apollo.io for "${domain}"`,
        });

        return results;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setError(err);
        toast({
          title: 'Error importing contacts',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setIsSearching(false);
      }
    },
    [searchApolloContacts, toast]
  );

  return {
    enrichContacts,
    searchApolloContacts,
    findSimilarCompanies,
    importContactsByDomain,
    isEnriching,
    isSearching,
    searchResults,
    error,
  };
}
