'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactForm } from '@/components/dashboard/contacts/contact-form';
import { Contact, Tag } from '@/lib/contacts/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/sonner';

interface EditContactPageProps {
  params: {
    id: string;
  };
}

export default function EditContactPage({ params }: EditContactPageProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch contact and tags
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch contact
        const contactResponse = await fetch(`/api/contacts/${params.id}`);
        if (!contactResponse.ok) {
          throw new Error('Failed to fetch contact');
        }
        const contactData = await contactResponse.json();
        setContact(contactData);

        // Fetch tags
        const tagsResponse = await fetch('/api/tags');
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setAvailableTags(tagsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contact information',
          variant: 'destructive',
        });
        router.push('/dashboard/contacts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, router, toast]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Contact not found</h2>
          <p className="text-muted-foreground mt-2">
            The contact you are trying to edit does not exist.
          </p>
          <button
            className="mt-4 text-primary underline"
            onClick={() => router.push('/dashboard/contacts')}
          >
            Back to contacts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ContactForm
        initialData={contact}
        availableTags={availableTags}
        onSubmitSuccess={updatedContact => {
          router.push(`/dashboard/contacts/${updatedContact.id}`);
        }}
      />
    </div>
  );
}
