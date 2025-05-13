import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import pLimit from "p-limit";
import { prisma } from "@/lib/db/prisma";
import { addContactToVectorDB, updateDocument } from "@/lib/db/chromadb";
import { logger } from "@/lib/logger";
import type { Contact } from "@prisma/client";

// Apollo API types
export interface ApolloOrganization {
  id: string;
  name: string;
  website_url: string;
  blog_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  industry?: string;
  keywords?: string[];
  estimated_num_employees?: number;
  phone?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  founded_year?: number;
  short_description?: string;
  long_description?: string;
  annual_revenue?: string;
  total_funding?: string;
  latest_funding_round?: string;
  latest_funding_amount?: string;
  latest_funding_date?: string;
}

export interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email?: string;
  email_status?: string;
  linkedin_url?: string;
  title?: string;
  phone?: string;
  phone_status?: string;
  photo_url?: string;
  twitter_url?: string;
  github_url?: string;
  facebook_url?: string;
  city?: string;
  state?: string;
  country?: string;
  organization_id?: string;
  organization_name?: string;
  organization_website?: string;
  organization_industry?: string;
  organization_size?: string;
  organization_founded_year?: number;
  organization_address?: string;
  organization_city?: string;
  organization_state?: string;
  organization_country?: string;
  seniority?: string;
  departments?: string[];
  subdepartments?: string[];
  functions?: string[];
  personal_emails?: string[];
  personal_phones?: string[];
  account_id?: string;
  account_name?: string;
  recent_title_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApolloSearchFilters {
  person_titles?: string[];
  person_locations?: string[];
  organization_name?: string;
  contact_email_status?: string[];
  industries?: string[];
  seniorities?: string[];
  departments?: string[];
  organization_revenue_min?: number;
  organization_revenue_max?: number;
  organization_headcount_min?: number;
  organization_headcount_max?: number;
  [key: string]: string | string[] | number | boolean | undefined;
}

export interface ApolloOrganizationSearchResponse {
  organizations: ApolloOrganization[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

export interface ApolloPeopleSearchResponse {
  people: ApolloPerson[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

export interface ApolloPersonResponse {
  person: ApolloPerson;
}

export interface ApolloSearchParams {
  query: string;
  filters?: ApolloSearchFilters;
  page?: number;
  perPage?: number;
}

export interface ImportContactResult {
  success: boolean;
  message?: string;
  contact?: Contact;
  error?: Error | string | unknown;
  updated?: boolean;
}

export interface ImportContactsResult {
  success: boolean;
  message?: string;
  imported: number;
  updated?: number;
  failed?: number;
  total: number;
  errors?: (Error | string | unknown)[];
  contacts?: Contact[];
}

export interface ApolloEnrichResult {
  success: boolean;
  enriched?: boolean;
  data?: ApolloPerson | Contact;
  error?: Error | string | unknown;
}

// Configuration constants
const APOLLO_API_URL = "https://api.apollo.io/v1";
const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const RATE_LIMIT_MAX = parseInt(process.env.APOLLO_RATE_LIMIT_MAX || "10", 10); // Maximum concurrent requests
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.APOLLO_RATE_LIMIT_WINDOW_MS || "1000", 10); // Time window for rate limiting

// Rate limiter for Apollo API
const rateLimiter = pLimit(RATE_LIMIT_MAX);

// Timestamp of last request batch start for time window rate limiting
let lastRequestBatchTime = Date.now();
let requestsInCurrentWindow = 0;

// Request queue for tracking pending requests
let pendingRequests = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Apollo client with request interceptors for authentication and error handling
 */
const apolloClient: AxiosInstance = axios.create({
  baseURL: APOLLO_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add API key and manage rate limiting
apolloClient.interceptors.request.use(
  async (config) => {
    // Add API key to all requests
    const method = config.method?.toUpperCase() || 'GET';
    
    if (method === 'GET' && config.params) {
      config.params.api_key = APOLLO_API_KEY;
    } else if (method === 'POST' && config.data) {
      // If config.data is a string (JSON), parse it, add api_key, and stringify again
      if (typeof config.data === 'string') {
        try {
          const data = JSON.parse(config.data);
          data.api_key = APOLLO_API_KEY;
          config.data = JSON.stringify(data);
        } catch (e) {
          logger.error('Error parsing request data', { error: e });
          // If parsing fails, leave as is
        }
      } else if (typeof config.data === 'object') {
        // If it's already an object, add api_key directly
        config.data.api_key = APOLLO_API_KEY;
      }
    }
    
    // Track pending requests
    pendingRequests++;
    logger.debug(`Apollo API request started: ${config.url}`, { 
      method, 
      pendingRequests,
      url: config.url 
    });
    
    return config;
  },
  (error) => {
    pendingRequests--;
    logger.error('Apollo API request error', { error });
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apolloClient.interceptors.response.use(
  (response) => {
    pendingRequests--;
    logger.debug(`Apollo API request completed: ${response.config.url}`, { 
      status: response.status,
      pendingRequests
    });
    return response;
  },
  async (error: AxiosError) => {
    pendingRequests--;
    
    // Extract request config for retry
    const config = error.config as AxiosRequestConfig & { _retry?: number };
    if (!config) {
      logger.error('Apollo API error with no config', { error });
      return Promise.reject(error);
    }
    
    // Get retry count or initialize it
    const retryCount = config._retry || 0;
    
    // Log the error details
    logger.error('Apollo API response error', { 
      status: error.response?.status,
      url: config.url,
      method: config.method,
      retryCount,
      error: error.message,
      responseData: error.response?.data
    });
    
    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
      logger.warn('Rate limit hit, retrying with exponential backoff', { 
        retryCount: retryCount + 1
      });
      
      // Exponential backoff
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
      
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increment retry count
      config._retry = retryCount + 1;
      
      // Retry the request
      return apolloClient(config);
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      logger.error('Apollo API authentication error, check API key', { 
        status: error.response.status
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Make a rate-limited API request to Apollo
 * Implements both concurrency limiting and time window rate limiting
 * @param apiCall Function that returns a promise for the API call
 * @returns Promise with the API response
 */
async function rateLimitedRequest<T>(apiCall: () => Promise<T>): Promise<T> {
  // Check if we need to reset the window counter
  const now = Date.now();
  if (now - lastRequestBatchTime > RATE_LIMIT_WINDOW_MS) {
    // Reset window if time has elapsed
    lastRequestBatchTime = now;
    requestsInCurrentWindow = 0;
  }
  
  // If we've hit the limit in the current time window, wait until window expires
  if (requestsInCurrentWindow >= RATE_LIMIT_MAX) {
    const timeToWait = RATE_LIMIT_WINDOW_MS - (now - lastRequestBatchTime);
    if (timeToWait > 0) {
      logger.debug(`Rate limit window reached, waiting ${timeToWait}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, timeToWait));
      // Reset window after waiting
      lastRequestBatchTime = Date.now();
      requestsInCurrentWindow = 0;
    }
  }
  
  // Increment the counter for the current window
  requestsInCurrentWindow++;
  
  // Use pLimit for concurrent request limiting
  return rateLimiter(apiCall);
}

/**
 * Search organizations (companies) in Apollo
 * @param query Company name or search term
 * @param page Page number for pagination
 * @param perPage Results per page
 * @returns Promise with search results
 */
export async function searchOrganizations(
  query: string, 
  page: number = 1, 
  perPage: number = 25
): Promise<ApolloOrganizationSearchResponse> {
  try {
    const response = await rateLimitedRequest(() => 
      apolloClient.post("/organizations/search", {
        q_organization_name: query,
        page,
        per_page: perPage,
      })
    );
    
    return response.data;
  } catch (error) {
    logger.error("Error searching organizations:", { error, query, page, perPage });
    throw error;
  }
}

/**
 * Search people in Apollo
 * @param params Search parameters including query, filters, pagination
 * @returns Promise with search results
 */
export async function searchPeople(
  params: ApolloSearchParams
): Promise<ApolloPeopleSearchResponse> {
  const { query, filters = {}, page = 1, perPage = 25 } = params;
  
  try {
    const response = await rateLimitedRequest(() => 
      apolloClient.post("/mixed_people/search", {
        q_keywords: query,
        page,
        per_page: perPage,
        ...filters,
      })
    );
    
    return response.data;
  } catch (error) {
    logger.error("Error searching people:", { error, query, filters, page, perPage });
    throw error;
  }
}

/**
 * Get detailed information about a person by ID
 * @param personId Apollo person ID
 * @returns Promise with person details
 */
export async function getPersonDetails(personId: string): Promise<ApolloPersonResponse> {
  try {
    const response = await rateLimitedRequest(() => 
      apolloClient.get(`/people/${personId}`)
    );
    
    return response.data;
  } catch (error) {
    logger.error("Error getting person details:", { error, personId });
    throw error;
  }
}

/**
 * Get detailed information about an organization by ID
 * @param organizationId Apollo organization ID
 * @returns Promise with organization details
 */
export async function getOrganizationDetails(organizationId: string): Promise<{ organization: ApolloOrganization }> {
  try {
    const response = await rateLimitedRequest(() => 
      apolloClient.get(`/organizations/${organizationId}`)
    );
    
    return response.data;
  } catch (error) {
    logger.error("Error getting organization details:", { error, organizationId });
    throw error;
  }
}

/**
 * Enrich contact data using Apollo's API
 * @param email Contact email to enrich
 * @param contactId Optional contact ID to update
 * @param userId User ID who owns the contact
 * @returns Promise with enrichment result
 */
export async function enrichContactData(
  email: string,
  contactId?: string,
  userId?: string
): Promise<ApolloEnrichResult> {
  try {
    // Search for person by email
    const response = await rateLimitedRequest(() => 
      apolloClient.post("/mixed_people/search", {
        q_emails: email,
        page: 1,
        per_page: 1,
      })
    );
    
    const people = response.data.people;
    
    if (!people || people.length === 0) {
      return { success: false, enriched: false, error: "Person not found" };
    }
    
    const person = people[0];
    
    // If no contactId or userId, just return the data
    if (!contactId || !userId) {
      return { success: true, enriched: true, data: person };
    }
    
    // Update contact in database
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        firstName: person.first_name || undefined,
        lastName: person.last_name || undefined,
        phone: person.phone || undefined,
        company: person.organization_name || undefined,
        title: person.title || undefined,
        industry: person.organization_industry || undefined,
        website: person.organization_website || undefined,
        address: person.organization_address || undefined,
        city: person.city || undefined,
        state: person.state || undefined,
        country: person.country || undefined,
        linkedinUrl: person.linkedin_url || undefined,
        twitterUrl: person.twitter_url || undefined,
        source: "APOLLO",
        sourceId: person.id,
        lastEnrichedAt: new Date(),
        customFields: {
          ...(person.organization_size && { companySize: person.organization_size }),
          ...(person.seniority && { seniority: person.seniority }),
          ...(person.departments && person.departments.length > 0 && { department: person.departments[0] }),
        },
      },
    });
    
    // Update in vector database
    await updateDocument(
      "workspax_contacts",
      contactId,
      `${updatedContact.firstName} ${updatedContact.lastName} ${updatedContact.email} ${updatedContact.company} ${updatedContact.title}`,
      { 
        userId,
        enriched: true,
        lastEnrichedAt: new Date().toISOString()
      }
    );
    
    return { success: true, enriched: true, data: updatedContact };
  } catch (error) {
    logger.error("Error enriching contact:", { error, email, contactId });
    return { success: false, error };
  }
}

/**
 * Process Apollo person data into a contact format
 * @param person Apollo person data
 * @param userId User ID who will own the contact
 * @returns Contact data for database
 */
function processPersonToContact(person: ApolloPerson, userId: string) {
  return {
    firstName: person.first_name || "",
    lastName: person.last_name || "",
    email: person.email || "",
    phone: person.phone || null,
    company: person.organization_name || null,
    title: person.title || null,
    industry: person.organization_industry || null,
    website: person.organization_website || null,
    address: person.organization_address || null,
    city: person.city || null,
    state: person.state || null,
    country: person.country || null,
    linkedinUrl: person.linkedin_url || null,
    twitterUrl: person.twitter_url || null,
    source: "APOLLO",
    sourceId: person.id,
    userId,
    lastEnrichedAt: new Date(),
    customFields: {
      ...(person.organization_size && { companySize: person.organization_size }),
      ...(person.seniority && { seniority: person.seniority }),
      ...(person.departments && person.departments.length > 0 && { department: person.departments[0] }),
      ...(person.organization_founded_year && { companyFoundedYear: person.organization_founded_year }),
    },
  };
}

/**
 * Import a contact from Apollo by person ID
 * @param personId Apollo person ID
 * @param userId User ID who will own the contact
 * @param updateIfExists Whether to update if contact already exists
 * @returns Promise with import result
 */
export async function importContactFromApollo(
  personId: string, 
  userId: string,
  updateIfExists: boolean = true
): Promise<ImportContactResult> {
  try {
    // Get person details from Apollo
    const personData = await getPersonDetails(personId);
    const person = personData.person;
    
    if (!person || !person.email) {
      return { success: false, message: "Person not found or has no email", error: "Invalid person data" };
    }
    
    // Check if contact already exists
    const existingContact = await prisma.contact.findFirst({
      where: {
        email: person.email,
        userId,
      },
    });
    
    if (existingContact) {
      if (!updateIfExists) {
        return { success: true, message: "Contact already exists", contact: existingContact };
      }
      
      // Update existing contact
      const contactData = processPersonToContact(person, userId);
      const updatedContact = await prisma.contact.update({
        where: { id: existingContact.id },
        data: contactData,
      });
      
      // Update in vector database
      await updateDocument(
        "workspax_contacts",
        updatedContact.id,
        `${updatedContact.firstName} ${updatedContact.lastName} ${updatedContact.email} ${updatedContact.company} ${updatedContact.title}`,
        { userId, source: "APOLLO", updated: true }
      );
      
      return { success: true, message: "Contact updated", contact: updatedContact, updated: true };
    }
    
    // Create new contact
    const contactData = processPersonToContact(person, userId);
    const contact = await prisma.contact.create({
      data: contactData,
    });
    
    // Add to vector database for semantic search
    await addContactToVectorDB(
      contact.id,
      `${contact.firstName} ${contact.lastName}`,
      contact.email,
      contact.company || "",
      contact.title || "",
      { userId, source: "APOLLO" }
    );
    
    return { success: true, contact };
  } catch (error) {
    logger.error("Error importing contact from Apollo:", { error, personId });
    return { success: false, error };
  }
}

/**
 * Import multiple contacts from Apollo search
 * @param params Search parameters
 * @param userId User ID who will own the contacts
 * @param limit Maximum number of contacts to import
 * @param updateIfExists Whether to update if contacts already exist
 * @returns Promise with import results
 */
export async function importContactsFromSearch(
  params: ApolloSearchParams,
  userId: string,
  limit: number = 25,
  updateIfExists: boolean = true
): Promise<ImportContactsResult> {
  try {
    const { query, filters } = params;
    
    // Search for people with email addresses
    const emailFilters = {
      ...filters,
      contact_email_status: ["verified"]
    };
    
    // Search for people
    const searchResults = await searchPeople({
      query,
      filters: emailFilters,
      page: 1,
      perPage: limit
    });
    
    if (!searchResults.people || searchResults.people.length === 0) {
      return { success: true, message: "No contacts found", imported: 0, total: 0 };
    }
    
    // Import each contact with rate limiting
    const concurrencyLimit = 5; // Import 5 contacts at a time
    const limiter = pLimit(concurrencyLimit);
    
    // Create import promises
    const importPromises = searchResults.people.map(person => 
      limiter(() => importContactFromApollo(person.id, userId, updateIfExists))
    );
    
    // Wait for all imports to complete
    const results = await Promise.all(importPromises);
    
    // Collect results
    const imported = results.filter(r => r.success && r.contact && !r.updated).length;
    const updated = results.filter(r => r.success && r.updated).length;
    const failed = results.filter(r => !r.success).length;
    const contacts = results.filter(r => r.success && r.contact).map(r => r.contact);
    const errors = results.filter(r => !r.success).map(r => r.error);
    
    return { 
      success: true, 
      message: `Imported ${imported} contacts, updated ${updated} contacts`, 
      imported,
      updated,
      failed,
      total: searchResults.people.length,
      contacts,
      errors
    };
  } catch (error) {
    logger.error("Error importing contacts from search:", { error, query: params.query });
    return { success: false, message: "Failed to import contacts", imported: 0, total: 0, error };
  }
}

/**
 * Bulk enrich contacts in database
 * @param userId User ID who owns the contacts
 * @param limit Maximum number of contacts to enrich
 * @returns Promise with enrichment results
 */
export async function bulkEnrichContacts(userId: string, limit: number = 50): Promise<{
  success: boolean;
  enriched: number;
  failed: number;
  total: number;
  message: string;
}> {
  try {
    // Find contacts without enrichment data
    const contacts = await prisma.contact.findMany({
      where: {
        userId,
        lastEnrichedAt: null,
        email: { not: null }
      },
      take: limit,
    });
    
    if (contacts.length === 0) {
      return { 
        success: true, 
        message: "No contacts need enrichment",
        enriched: 0,
        failed: 0,
        total: 0
      };
    }
    
    // Enrich each contact with rate limiting
    const concurrencyLimit = 5;
    const limiter = pLimit(concurrencyLimit);
    
    // Create enrichment promises
    const enrichPromises = contacts.map(contact => 
      limiter(() => enrichContactData(contact.email, contact.id, userId))
    );
    
    // Wait for all enrichments to complete
    const results = await Promise.all(enrichPromises);
    
    // Collect results
    const enriched = results.filter(r => r.success && r.enriched).length;
    const failed = results.filter(r => !r.success || !r.enriched).length;
    
    return { 
      success: true, 
      message: `Enriched ${enriched} contacts`, 
      enriched,
      failed,
      total: contacts.length
    };
  } catch (error) {
    logger.error("Error bulk enriching contacts:", { error, userId });
    return { success: false, message: "Failed to enrich contacts", enriched: 0, failed: 0, total: 0 };
  }
}

/**
 * Apollo API usage response interface
 */
export interface ApolloApiUsage {
  credits_used: number;
  credits_remaining: number;
  credits_limit: number;
  credits_reset_date?: string;
  requests_used?: number;
  requests_limit?: number;
  organization_id?: string;
  organization_name?: string;
  plan_name?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Get API usage and credits information
 * @returns Promise with usage data
 */
export async function getApiUsage(): Promise<{
  success: boolean;
  usage?: ApolloApiUsage;
  error?: Error | string | unknown;
}> {
  try {
    const response = await rateLimitedRequest(() => 
      apolloClient.get("/auth/usage")
    );
    
    return {
      success: true,
      usage: response.data
    };
  } catch (error) {
    logger.error("Error getting API usage:", { error });
    return { success: false, error };
  }
}

export default {
  searchOrganizations,
  searchPeople,
  getPersonDetails,
  getOrganizationDetails,
  importContactFromApollo,
  importContactsFromSearch,
  enrichContactData,
  bulkEnrichContacts,
  getApiUsage,
};