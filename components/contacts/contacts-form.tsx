'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Contact, ContactStatus, Tag } from '@/lib/contacts/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/sonner';
import { ChevronLeft, User, Building, Tag as TagIcon, Upload, CloudCog } from 'lucide-react';
import { useContacts } from '@/hooks/use-contacts';
import { useApolloIntegration } from '@/hooks/use-apollo-integration';
import { getInitials } from '@/lib/contacts/utils';
import { MultiSelect } from '@/components/ui/multi-select';
import { TagsSelect } from '@/components/dashboard/tags/tags-select';

// Define the form schema with Zod
const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'lead', 'customer', 'prospect', 'archived']),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  socialProfiles: z
    .object({
      linkedin: z.string().url().optional().or(z.literal('')),
      twitter: z.string().url().optional().or(z.literal('')),
      facebook: z.string().url().optional().or(z.literal('')),
      instagram: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  initialData?: Contact;
  availableTags?: Tag[];
  onSubmitSuccess?: (contact: Contact) => void;
}

export function ContactForm({
  initialData,
  availableTags = [],
  onSubmitSuccess,
}: ContactFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { createContact, updateContact } = useContacts();
  const { enrichContacts } = useApolloIntegration();

  // Set default form values
  const defaultValues: ContactFormValues = {
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    company: initialData?.company || '',
    title: initialData?.title || '',
    phone: initialData?.phone || '',
    status: initialData?.status || 'lead',
    tags: initialData?.tags?.map(tag => tag.id) || [],
    notes: initialData?.notes || '',
    address: initialData?.address || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    socialProfiles: initialData?.socialProfiles || {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
    },
  };

  // Initialize the form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

  // Submit handler
  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      let contact: Contact;

      if (initialData) {
        // Update existing contact
        contact = await updateContact(initialData.id, values);
      } else {
        // Create new contact
        contact = await createContact(values);
      }

      toast({
        title: initialData ? 'Contact updated' : 'Contact created',
        description: `${contact.firstName} ${contact.lastName} has been ${
          initialData ? 'updated' : 'created'
        } successfully`,
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(contact);
      } else {
        router.push(`/dashboard/contacts/${contact.id}`);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: 'Error',
        description: `Failed to ${initialData ? 'update' : 'create'} contact`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enrich contact with Apollo.io data
  const handleEnrichContact = async () => {
    if (!form.getValues('email')) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address to enrich the contact',
        variant: 'destructive',
      });
      return;
    }

    setIsEnriching(true);

    try {
      // Create a temporary contact object with current form values
      const tempContact: Contact = {
        id: initialData?.id || 'temp',
        firstName: form.getValues('firstName'),
        lastName: form.getValues('lastName'),
        email: form.getValues('email'),
        company: form.getValues('company') || null,
        title: form.getValues('title') || null,
        phone: form.getValues('phone') || null,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: initialData?.updatedAt || new Date().toISOString(),
      };

      // Enrich the contact
      const [enrichedContact] = await enrichContacts([tempContact]);

      if (enrichedContact && enrichedContact.isEnriched) {
        // Update form with enriched data
        form.setValue('firstName', enrichedContact.firstName);
        form.setValue('lastName', enrichedContact.lastName);
        form.setValue('company', enrichedContact.company || '');
        form.setValue('title', enrichedContact.title || '');
        form.setValue('phone', enrichedContact.phone || '');

        if (enrichedContact.socialProfiles) {
          form.setValue('socialProfiles.linkedin', enrichedContact.socialProfiles.linkedin || '');
          form.setValue('socialProfiles.twitter', enrichedContact.socialProfiles.twitter || '');
        }

        toast({
          title: 'Contact enriched',
          description: 'Contact information has been updated with Apollo.io data',
        });
      } else {
        toast({
          title: 'No data found',
          description: 'No additional information was found for this contact',
        });
      }
    } catch (error) {
      console.error('Error enriching contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to enrich contact with Apollo.io data',
        variant: 'destructive',
      });
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/contacts')} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Contacts
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {initialData ? 'Edit Contact' : 'New Contact'}
          </h1>
          <p className="text-muted-foreground">
            {initialData
              ? `Update information for ${initialData.firstName} ${initialData.lastName}`
              : 'Add a new contact to your database'}
          </p>
        </div>

        {!initialData && (
          <Button
            variant="outline"
            onClick={handleEnrichContact}
            disabled={isEnriching || !form.getValues('email')}
          >
            <CloudCog className="h-4 w-4 mr-2" />
            {isEnriching ? 'Enriching...' : 'Enrich with Apollo.io'}
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Contact Details</TabsTrigger>
              <TabsTrigger value="social">Social & Business</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 pt-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  {initialData?.avatarUrl ? (
                    <AvatarImage
                      src={initialData.avatarUrl}
                      alt={`${initialData.firstName} ${initialData.lastName}`}
                    />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {getInitials(
                        `${form.watch('firstName')} ${form.watch('lastName')}` || 'New Contact'
                      )}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <TagsSelect
                          value={field.value}
                          onChange={field.onChange}
                          availableTags={availableTags}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* Contact Details Tab */}
            <TabsContent value="details" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>Enter the contact's address details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input placeholder="State/Province" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Postal code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>Add any additional notes about this contact</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Add notes about this contact..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social & Business Tab */}
            <TabsContent value="social" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Social Profiles</CardTitle>
                  <CardDescription>Link to the contact's social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="socialProfiles.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialProfiles.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialProfiles.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialProfiles.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/contacts')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? initialData
                  ? 'Saving...'
                  : 'Creating...'
                : initialData
                ? 'Save Changes'
                : 'Create Contact'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
