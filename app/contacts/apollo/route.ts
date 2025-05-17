// app/api/contacts/apollo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import axios from 'axios';
import { Contact } from '@/lib/contacts/types';
import { prisma } from '@/lib/db/prisma';

// Apollo.io API configuration
const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_API_URL = 'https://api.apollo.io/v1';

// Handler for Apollo.io API requests
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Apollo API key is configured
    if (!APOLLO_API_KEY) {
      return NextResponse.json({ error: 'Apollo API key is not configured' }, { status: 500 });
    }

    // Get request data
    const data = await request.json();

    // Route based on the action parameter
    const action = request.nextUrl.searchParams.get('action') || 'search';

    switch (action) {
      case 'search':
        return handleSearch(data);

      case 'enrich':
        return handleEnrich(data);

      case 'similar-companies':
        return handleSimilarCompanies(data);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Apollo API route error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}

// Handle search for contacts on Apollo
async function handleSearch(data: any) {
  const { query, type = 'email' } = data;

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    // Prepare search parameters
    const params =
      type === 'email'
        ? { api_key: APOLLO_API_KEY, q_emails: [query] }
        : { api_key: APOLLO_API_KEY, q_organization_domains: [query] };

    // Call Apollo API
    const response = await axios.post(`${APOLLO_API_URL}/people/search`, params);

    // Return search results
    return NextResponse.json({
      persons: response.data.persons || [],
    });
  } catch (error) {
    console.error('Apollo search error:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: `Apollo API error: ${error.response?.status} ${error.response?.statusText}`,
          details: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }

    throw error;
  }
}

// Handle enriching contacts with Apollo data
async function handleEnrich(data: any) {
  const { contacts } = data;

  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: 'Contacts data is required' }, { status: 400 });
  }

  try {
    // Process contacts in batches to avoid rate limits
    const batchSize = 5;
    const enrichedContacts: Contact[] = [];
    const errors: any[] = [];

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);

      // Process batch in parallel
      const batchPromises = batch.map(async contact => {
        try {
          // Search for contact by email
          const searchResponse = await axios.post(`${APOLLO_API_URL}/people/search`, {
            api_key: APOLLO_API_KEY,
            q_emails: [contact.email],
          });

          const persons = searchResponse.data.persons || [];

          if (persons.length === 0) {
            // No matching contact found
            return {
              ...contact,
              isEnriched: false,
              enrichedAt: new Date().toISOString(),
            };
          }

          // Get first matching person
          const person = persons[0];

          // Merge Apollo data with existing contact data
          return {
            ...contact,
            // Only update fields that are empty in the original contact
            firstName: contact.firstName || person.first_name,
            lastName: contact.lastName || person.last_name,
            title: contact.title || person.title,
            company: contact.company || person.organization?.name,
            phone: contact.phone || person.phone_numbers?.[0],
            // Add social profiles and other enrichment data
            socialProfiles: {
              ...(contact.socialProfiles || {}),
              linkedin: person.linkedin_url || contact.socialProfiles?.linkedin,
              twitter: person.twitter_url || contact.socialProfiles?.twitter,
            },
            // Add company data
            companyData: person.organization
              ? {
                  website: person.organization.website_url,
                  industry: person.organization.industry,
                  size: person.organization.size,
                  type: person.organization.type,
                }
              : contact.companyData,
            // Add location data
            location: person.location
              ? {
                  country: person.location.country,
                  city: person.location.city,
                  state: person.location.state,
                }
              : contact.location,
            // Flag as enriched
            isEnriched: true,
            enrichedAt: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error enriching contact ${contact.id}:`, error);
          errors.push({
            contactId: contact.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          return contact;
        }
      });

      // Wait for all batch operations to complete
      const batchResults = await Promise.all(batchPromises);
      enrichedContacts.push(...batchResults);

      // Pause between batches to avoid rate limits
      if (i + batchSize < contacts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Persist the enriched contacts to the database
    for (const contact of enrichedContacts) {
      if (contact.isEnriched) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            title: contact.title,
            company: contact.company,
            phone: contact.phone,
            socialProfiles: contact.socialProfiles as any,
            companyData: contact.companyData as any,
            location: contact.location as any,
            isEnriched: true,
            enrichedAt: contact.enrichedAt,
          },
        });
      }
    }

    return NextResponse.json({
      enrichedContacts,
      errors,
      message: `Enriched ${
        enrichedContacts.filter(c => c.isEnriched).length
      } contacts successfully`,
    });
  } catch (error) {
    console.error('Apollo enrichment error:', error);
    throw error;
  }
}

// Handle finding similar companies
async function handleSimilarCompanies(data: any) {
  const { domain } = data;

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  try {
    // Call Apollo API to find similar companies
    const response = await axios.post(`${APOLLO_API_URL}/organizations/similar`, {
      api_key: APOLLO_API_KEY,
      domain,
    });

    // Return search results
    return NextResponse.json({
      organizations: response.data.organizations || [],
    });
  } catch (error) {
    console.error('Apollo similar companies error:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: `Apollo API error: ${error.response?.status} ${error.response?.statusText}`,
          details: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }

    throw error;
  }
}

// app/api/contacts/import/apollo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request data
    const { persons, domain } = await request.json();

    if (!persons || !Array.isArray(persons)) {
      return NextResponse.json({ error: 'Invalid Apollo data' }, { status: 400 });
    }

    // Track import results
    const results = {
      total: persons.length,
      imported: 0,
      errors: 0,
      skipped: 0,
    };

    // Process each person from Apollo
    for (const person of persons) {
      try {
        // Check if contact already exists with this email
        const existingContact = await prisma.contact.findFirst({
          where: { email: person.email },
        });

        if (existingContact) {
          results.skipped++;
          continue;
        }

        // Create new contact
        await prisma.contact.create({
          data: {
            firstName: person.first_name,
            lastName: person.last_name,
            email: person.email,
            title: person.title,
            phone: person.phone_numbers?.[0] || null,
            company: person.organization?.name || null,
            status: 'lead',
            socialProfiles: {
              linkedin: person.linkedin_url,
              twitter: person.twitter_url,
            },
            companyData: person.organization
              ? {
                  website: person.organization.website_url,
                  industry: person.organization.industry,
                  size: person.organization.size,
                  type: person.organization.type,
                }
              : undefined,
            location: person.location
              ? {
                  country: person.location.country,
                  city: person.location.city,
                  state: person.location.state,
                }
              : undefined,
            isEnriched: true,
            enrichedAt: new Date().toISOString(),
            source: 'apollo',
            sourceDetails: { domain },
            createdBy: user.id,
          },
        });

        results.imported++;
      } catch (error) {
        console.error(`Error importing contact ${person.email}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      ...results,
      message: `Imported ${results.imported} contacts from Apollo.io`,
    });
  } catch (error) {
    console.error('Apollo import error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
