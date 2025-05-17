// lib/integrations/contacts-email.ts
import { Contact } from '@/lib/contacts/types';

/**
 * Get recipients for email composition
 */
export async function getContactsForEmails(ids: string[]): Promise<
  {
    email: string;
    name: string;
    id: string;
  }[]
> {
  if (!ids.length) return [];

  try {
    const response = await fetch('/api/contacts/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }

    const contacts = await response.json();
    return contacts.map((contact: Contact) => ({
      email: contact.email,
      name: `${contact.firstName} ${contact.lastName}`,
      id: contact.id,
    }));
  } catch (error) {
    console.error('Error fetching contacts for email:', error);
    return [];
  }
}

/**
 * Record an email interaction with contacts
 */
export async function recordEmailInteraction(
  contactIds: string[],
  emailData: {
    subject: string;
    sentAt: Date;
    messageId?: string;
    threadId?: string;
  }
): Promise<boolean> {
  try {
    const response = await fetch('/api/contacts/record-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactIds,
        emailData,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error recording email interaction:', error);
    return false;
  }
}
