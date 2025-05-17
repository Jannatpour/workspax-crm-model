// lib/integrations/contacts-leads.ts
import { Contact } from '@/lib/contacts/types';

/**
 * Convert a lead to a contact
 */
export async function convertLeadToContact(leadData: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
}): Promise<Contact | null> {
  try {
    const response = await fetch('/api/contacts/convert-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadId: leadData.id,
        contactData: {
          firstName: leadData.firstName,
          lastName: leadData.lastName,
          email: leadData.email,
          company: leadData.company || null,
          phone: leadData.phone || null,
          notes: leadData.notes || null,
          status: 'lead',
          tags: ['converted-lead'],
          source: 'lead-conversion',
          sourceDetails: { leadId: leadData.id },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to convert lead: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error converting lead to contact:', error);
    return null;
  }
}

/**
 * Get potential matching contacts for a lead
 */
export async function findMatchingContacts(leadData: {
  email?: string;
  company?: string;
  phone?: string;
}): Promise<Contact[]> {
  try {
    const response = await fetch('/api/contacts/find-matching', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      throw new Error(`Failed to find matching contacts: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error finding matching contacts:', error);
    return [];
  }
}
