// lib/contacts/types.ts
export type ContactStatus = 'active' | 'inactive' | 'lead' | 'customer' | 'prospect' | 'archived';

export type EngagementScore = 'high' | 'medium' | 'low' | 'none';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  count: number;
  isSmartGroup?: boolean;
  smartCriteria?: Record<string, unknown>;
}

export interface ContactActivity {
  id: string;
  contactId: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'other';
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  isStarred?: boolean;
  avatarUrl?: string;
  tags?: Tag[];
  status?: ContactStatus;
  engagementScore?: EngagementScore;
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  notes?: string;
  groups?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    other?: Record<string, string>;
  };
  companyData?: {
    website?: string;
    industry?: string;
    size?: string;
    type?: string;
  };
  location?: {
    country?: string;
    city?: string;
    state?: string;
  };
  customFields?: Record<string, string | number | unknown>;
  isEnriched?: boolean;
  enrichedAt?: string;
  createdAt: string;
  updatedAt: string;
  activities?: ContactActivity[];
  accessLevel?: 'private' | 'team' | 'public';
  owner?: string;
  metaData?: Record<string, string | number | unknown>;
}

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  phone: string;
  status: ContactStatus;
  tags: string[];
  notes: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  socialProfiles?: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  customFields?: Record<string, string>;
}

export interface ContactFilterOptions {
  status?: ContactStatus[];
  tags?: string[];
  groups?: string[];
  engagementScore?: EngagementScore[];
  dateRange?: {
    field: 'createdAt' | 'updatedAt' | 'lastContactedAt' | 'nextFollowUpDate';
    start: string | null;
    end: string | null;
  };
  customFields?: Record<string, string | number | unknown>;
}

export interface ContactSortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
// Add type for Apollo enrichment response
export interface ApolloPersonData {
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  phone_numbers: string[];
  organization: {
    name: string;
    website_url: string;
    company_type: string;
    size: string;
    industry: string;
  };
  social_profiles: {
    linkedin_url?: string;
    twitter_url?: string;
    github_url?: string;
    facebook_url?: string;
  };
  location: {
    country: string;
    city: string;
    state: string;
  };
}

// Add integration types
export interface ContactIntegration {
  type: 'apollo' | 'salesforce' | 'hubspot' | 'gmail' | 'outlook' | 'other';
  data: Record<string, any>;
  lastSyncedAt: string;
}

// Add relationship types
export interface ContactRelationship {
  id: string;
  contactId: string;
  relatedContactId: string;
  relationship: 'reports_to' | 'colleague' | 'manager' | 'assistant' | 'friend' | 'other';
  notes?: string;
}
