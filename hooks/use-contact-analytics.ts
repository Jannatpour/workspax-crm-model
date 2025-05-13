// File: @/hooks/use-contact-analytics.ts

import { useState, useCallback } from 'react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  title?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactActivity {
  id: string;
  contactId: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'other';
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

interface AggregateMetrics {
  totalContacts: number;
  activeContacts: number;
  newContactsThisPeriod: number;
  averageEngagementRate: number;
  contactsWithTasks: number;
  contactsWithFollowUps: number;
  emailsSentThisPeriod: number;
  meetingsThisPeriod: number;
  tagsCreatedThisPeriod: number;
  topContactedContacts: Contact[];
  growthRate: number;
  contactsByStatus: Record<string, number>;
  contactsByEngagement: Record<string, number>;
  contactsByCompany: Record<string, number>;
  activitiesByType: Record<string, number>;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface ContactAnalyticsOptions {
  limit?: number;
  includeContact?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  type?: string[];
  contactId?: string;
}

export function useContactAnalytics() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Get aggregated contact metrics for the specified time period
   */
  const getContactMetrics = useCallback(async (period: '7d' | '30d' | '90d' | '12m'): Promise<AggregateMetrics> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would be an API call
      // Here we're simulating the response with mock data
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data based on the selected period
      const mockData: AggregateMetrics = {
        totalContacts: 842,
        activeContacts: 568,
        newContactsThisPeriod: period === '7d' ? 12 : period === '30d' ? 43 : period === '90d' ? 124 : 312,
        averageEngagementRate: 0.68,
        contactsWithTasks: 45,
        contactsWithFollowUps: 32,
        emailsSentThisPeriod: period === '7d' ? 87 : period === '30d' ? 342 : period === '90d' ? 876 : 3240,
        meetingsThisPeriod: period === '7d' ? 14 : period === '30d' ? 54 : period === '90d' ? 132 : 412,
        tagsCreatedThisPeriod: period === '7d' ? 3 : period === '30d' ? 8 : period === '90d' ? 15 : 34,
        topContactedContacts: [], // Would be populated with actual contacts
        growthRate: period === '7d' ? 2.5 : period === '30d' ? 8.7 : period === '90d' ? 15.2 : 32.4,
        contactsByStatus: {
          active: 568,
          inactive: 124,
          lead: 78,
          customer: 45,
          prospect: 27,
        },
        contactsByEngagement: {
          high: 246,
          medium: 321,
          low: 198,
          none: 77,
        },
        contactsByCompany: {
          'Acme Inc': 34,
          'TechCorp': 28,
          'GlobalSoft': 22,
          'Initech': 19,
          'Other': 739,
        },
        activitiesByType: {
          email: 456,
          call: 234,
          meeting: 187,
          note: 312,
          task: 154,
        },
      };

      return mockData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while fetching contact metrics');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get recent contact activities
   */
  const getContactActivities = useCallback(async (options: ContactAnalyticsOptions = {}): Promise<(ContactActivity & { contact?: Contact })[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 600));

      // Mock activities data
      const activities: (ContactActivity & { contact?: Contact })[] = [
        {
          id: '1',
          contactId: 'contact1',
          type: 'email',
          description: 'Sent follow-up email about the project proposal',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          contact: options.includeContact ? {
            id: 'contact1',
            firstName: 'Alex',
            lastName: 'Johnson',
            email: 'alex@example.com',
            company: 'Acme Inc',
            title: 'Product Manager',
            status: 'active',
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          } : undefined
        },
        {
          id: '2',
          contactId: 'contact2',
          type: 'call',
          description: 'Had a discovery call to discuss their requirements',
          date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          contact: options.includeContact ? {
            id: 'contact2',
            firstName: 'Sarah',
            lastName: 'Miller',
            email: 'sarah@techcorp.com',
            company: 'TechCorp',
            title: 'CTO',
            status: 'lead',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          } : undefined
        },
        {
          id: '3',
          contactId: 'contact3',
          type: 'meeting',
          description: 'Kickoff meeting for the new project',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          contact: options.includeContact ? {
            id: 'contact3',
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael@globalsoft.com',
            company: 'GlobalSoft',
            title: 'Sales Director',
            status: 'customer',
            createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          } : undefined
        },
        {
          id: '4',
          contactId: 'contact4',
          type: 'note',
          description: 'They are interested in our enterprise plan, but need to discuss with their team first',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          contact: options.includeContact ? {
            id: 'contact4',
            firstName: 'Emily',
            lastName: 'Wong',
            email: 'emily@initech.com',
            company: 'Initech',
            title: 'Procurement Manager',
            status: 'prospect',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          } : undefined
        },
        {
          id: '5',
          contactId: 'contact5',
          type: 'task',
          description: 'Send pricing information and case studies',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          contact: options.includeContact ? {
            id: 'contact5',
            firstName: 'James',
            lastName: 'Smith',
            email: 'james@example.org',
            company: 'XYZ Corp',
            title: 'CEO',
            status: 'lead',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          } : undefined
        },
        {
          id: '6',
          contactId: 'contact6',
          type: 'email',
          description: 'Sent contract for review',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          contact: options.includeContact ? {
            id: 'contact6',
            firstName: 'David',
            lastName: 'Martinez',
            email: 'david@example.net',
            company: 'ABC Ltd',
            title: 'Legal Counsel',
            status: 'customer',
            createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          } : undefined
        },
      ];

      // Apply filters based on options
      let filteredActivities = [...activities];
      
      // Filter by contactId
      if (options.contactId) {
        filteredActivities = filteredActivities.filter(activity => activity.contactId === options.contactId);
      }
      
      // Filter by activity type
      if (options.type && options.type.length > 0) {
        filteredActivities = filteredActivities.filter(activity => options.type?.includes(activity.type));
      }
      
      // Filter by date range
      if (options.dateRange) {
        const startDate = options.dateRange.start.getTime();
        const endDate = options.dateRange.end.getTime();
        filteredActivities = filteredActivities.filter(activity => {
          const activityDate = new Date(activity.date).getTime();
          return activityDate >= startDate && activityDate <= endDate;
        });
      }
      
      // Apply limit
      if (options.limit && options.limit > 0) {
        filteredActivities = filteredActivities.slice(0, options.limit);
      }

      return filteredActivities;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while fetching contact activities');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get tags overview with usage statistics
   */
  const getTagsOverview = useCallback(async (): Promise<Tag[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock tags data
      const tags: Tag[] = [
        { id: 'tag1', name: 'VIP', color: '#EF4444', count: 45 },
        { id: 'tag2', name: 'Decision Maker', color: '#10B981', count: 78 },
        { id: 'tag3', name: 'Technical', color: '#6366F1', count: 124 },
        { id: 'tag4', name: 'Finance', color: '#F59E0B', count: 56 },
        { id: 'tag5', name: 'Influencer', color: '#8B5CF6', count: 32 },
        { id: 'tag6', name: 'Cold Lead', color: '#3B82F6', count: 112 },
        { id: 'tag7', name: 'Hot Lead', color: '#EC4899', count: 67 },
        { id: 'tag8', name: 'Partner', color: '#64748B', count: 23 },
      ];

      return tags;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while fetching tags overview');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Track when a contact is viewed
   */
  const trackContactViewed = useCallback((contactId: string): void => {
    // In a real implementation, this would send analytics data to the server
    console.log(`Contact viewed: ${contactId}`);
  }, []);

  /**
   * Track contact actions for analytics
   */
  const trackContactAction = useCallback((action: string, contactId: string): void => {
    // In a real implementation, this would send analytics data to the server
    console.log(`Contact action: ${action} on ${contactId}`);
  }, []);

  return {
    isLoading,
    error,
    getContactMetrics,
    getContactActivities,
    getTagsOverview,
    trackContactViewed,
    trackContactAction,
  };
}