'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Contact } from '@/lib/contacts/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactDetailHeader } from '@/components/dashboard/contacts/contact-detail-header';
import { ContactDetailInfo } from '@/components/dashboard/contacts/contact-detail-info';
import { ContactDetailActivities } from '@/components/dashboard/contacts/contact-detail-activities';
import { ContactDetailNotes } from '@/components/dashboard/contacts/contact-detail-notes';
import { ContactDetailDeals } from '@/components/dashboard/contacts/contact-detail-deals';
import { useToast } from '@/components/ui/sonner';
import { ChevronLeft } from 'lucide-react';
import { useContactAnalytics } from '@/hooks/use-contact-analytics';

interface ContactDetailPageProps {
  params: {
    id: string;
  };
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { trackContactViewed } = useContactAnalytics();

  // Fetch contact details
  useEffect(() => {
    const fetchContact = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/contacts/${params.id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch contact: ${response.statusText}`);
        }

        const data = await response.json();
        setContact(data);

        // Track that this contact was viewed
        trackContactViewed(data.id);
      } catch (err) {
        console.error('Error fetching contact:', err);
        setError('Failed to load contact details');
        toast({
          title: 'Error',
          description: 'Failed to load contact details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [params.id, toast, trackContactViewed]);

  // Handle starring a contact
  const handleStarContact = async (starred: boolean) => {
    if (!contact) return;

    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isStarred: starred }),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      // Update local state
      setContact(prev => (prev ? { ...prev, isStarred: starred } : null));

      toast({
        title: starred ? 'Contact starred' : 'Contact unstarred',
        description: `${contact.firstName} ${contact.lastName} has been ${
          starred ? 'starred' : 'unstarred'
        }`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update contact',
        variant: 'destructive',
      });
    }
  };

  // Handle deleting a contact
  const handleDeleteContact = async () => {
    if (!contact) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      toast({
        title: 'Contact deleted',
        description: `${contact.firstName} ${contact.lastName} has been deleted`,
      });

      // Navigate back to contacts list
      router.push('/dashboard/contacts');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/dashboard/contacts')}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Contacts
      </Button>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-60 md:col-span-1" />
            <Skeleton className="h-60 md:col-span-2" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 border rounded-md">{error}</div>
      ) : contact ? (
        <div className="space-y-6">
          <ContactDetailHeader
            contact={contact}
            onStar={handleStarContact}
            onDelete={handleDeleteContact}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ContactDetailInfo contact={contact} />

            <div className="md:col-span-2">
              <Tabs defaultValue="activities" className="w-full">
                <TabsList>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="deals">Deals</TabsTrigger>
                </TabsList>

                <TabsContent value="activities" className="mt-4">
                  <ContactDetailActivities contactId={contact.id} />
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <ContactDetailNotes contactId={contact.id} />
                </TabsContent>

                <TabsContent value="deals" className="mt-4">
                  <ContactDetailDeals contactId={contact.id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <h3 className="text-lg font-medium">Contact not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The contact you are looking for might have been deleted or does not exist.
          </p>
          <Button onClick={() => router.push('/dashboard/contacts')} className="mt-4">
            Go back to contacts
          </Button>
        </div>
      )}
    </div>
  );
}
