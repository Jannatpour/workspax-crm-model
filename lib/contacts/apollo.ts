// lib/contacts/apollo.ts
import { Contact } from './types';

interface ApolloPersonData {
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

interface ApolloApiResponse {
  persons: ApolloPersonData[];
  status: string;
  message?: string;
}

/**
 * Search for contacts on Apollo by email or domain
 */
export async function searchApolloContacts(
  query: string,
  type: 'email' | 'domain' = 'email'
): Promise<ApolloPersonData[]> {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    throw new Error('Apollo API key is not configured');
  }

  const url = 'https://api.apollo.io/v1/people/search';

  const params =
    type === 'email'
      ? { api_key: apiKey, q_emails: [query] }
      : { api_key: apiKey, q_organization_domains: [query] };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Apollo API error: ${response.status} ${response.statusText}`);
    }

    const data: ApolloApiResponse = await response.json();

    if (data.status !== 'success') {
      throw new Error(`Apollo API error: ${data.message || 'Unknown error'}`);
    }

    return data.persons || [];
  } catch (error) {
    console.error('Apollo API error:', error);
    throw error;
  }
}

/**
 * Enrich a contact with data from Apollo
 */
export async function enrichContactWithApollo(contact: Contact): Promise<Contact> {
  try {
    // Search Apollo by email
    const apolloData = await searchApolloContacts(contact.email);

    if (!apolloData.length) {
      return contact; // No data found
    }

    const personData = apolloData[0];

    // Merge Apollo data with existing contact data
    const enrichedContact: Contact = {
      ...contact,
      // Only update fields that are empty in the original contact
      firstName: contact.firstName || personData.first_name,
      lastName: contact.lastName || personData.last_name,
      title: contact.title || personData.title,
      company: contact.company || personData.organization?.name,
      phone: contact.phone || personData.phone_numbers?.[0],
      // Add social profiles and other enrichment data
      socialProfiles: {
        linkedin: personData.social_profiles?.linkedin_url,
        twitter: personData.social_profiles?.twitter_url,
        github: personData.social_profiles?.github_url,
        facebook: personData.social_profiles?.facebook_url,
      },
      // Add company data
      companyData: personData.organization
        ? {
            website: personData.organization.website_url,
            industry: personData.organization.industry,
            size: personData.organization.size,
            type: personData.organization.company_type,
          }
        : undefined,
      // Add location data
      location: personData.location
        ? {
            country: personData.location.country,
            city: personData.location.city,
            state: personData.location.state,
          }
        : undefined,
      // Flag as enriched
      isEnriched: true,
      enrichedAt: new Date().toISOString(),
    };

    return enrichedContact;
  } catch (error) {
    console.error('Error enriching contact with Apollo:', error);
    return contact; // Return original contact on error
  }
}

/**
 * Enrich multiple contacts with Apollo data
 */
export async function enrichMultipleContacts(contacts: Contact[]): Promise<Contact[]> {
  // Process in batches to avoid rate limits
  const batchSize = 5;
  const enrichedContacts: Contact[] = [];

  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);

    // Process batch in parallel
    const promises = batch.map(contact => enrichContactWithApollo(contact));
    const batchResults = await Promise.allSettled(promises);

    // Add successful results to the enriched contacts
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        enrichedContacts.push(result.value);
      } else {
        console.error(`Failed to enrich contact ${batch[index].id}:`, result.reason);
        enrichedContacts.push(batch[index]); // Add original contact on failure
      }
    });

    // Pause between batches to avoid rate limits
    if (i + batchSize < contacts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return enrichedContacts;
}

/**
 * Find similar companies on Apollo
 */
export async function findSimilarCompanies(domain: string): Promise<any[]> {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    throw new Error('Apollo API key is not configured');
  }

  const url = 'https://api.apollo.io/v1/organizations/similar';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        domain,
      }),
    });

    if (!response.ok) {
      throw new Error(`Apollo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error(`Apollo API error: ${data.message || 'Unknown error'}`);
    }

    return data.organizations || [];
  } catch (error) {
    console.error('Apollo API error:', error);
    throw error;
  }
}
