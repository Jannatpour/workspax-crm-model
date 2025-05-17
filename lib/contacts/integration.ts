// lib/contacts/integration.ts
import { Contact } from './types';
import { EventEmitter } from 'events';

// Create an event emitter for contact-related events
const contactEvents = new EventEmitter();

// Event types
export const CONTACT_EVENTS = {
  CREATED: 'contact:created',
  UPDATED: 'contact:updated',
  DELETED: 'contact:deleted',
  IMPORTED: 'contact:imported',
  EXPORTED: 'contact:exported',
  ENRICHED: 'contact:enriched',
};

// Emit events for contact changes
export function emitContactCreated(contact: Contact) {
  contactEvents.emit(CONTACT_EVENTS.CREATED, contact);
}

export function emitContactUpdated(contact: Contact) {
  contactEvents.emit(CONTACT_EVENTS.UPDATED, contact);
}

export function emitContactDeleted(id: string) {
  contactEvents.emit(CONTACT_EVENTS.DELETED, id);
}

export function emitContactsImported(contacts: Contact[]) {
  contactEvents.emit(CONTACT_EVENTS.IMPORTED, contacts);
}

export function emitContactsExported(ids: string[]) {
  contactEvents.emit(CONTACT_EVENTS.EXPORTED, ids);
}

export function emitContactsEnriched(contacts: Contact[]) {
  contactEvents.emit(CONTACT_EVENTS.ENRICHED, contacts);
}

// Subscribe to contact events
export function onContactEvent(event: string, callback: Function) {
  contactEvents.on(event, callback);

  // Return unsubscribe function
  return () => {
    contactEvents.off(event, callback);
  };
}

// Functions for other modules to interact with contacts

// Get a contact for email composition
export async function getContactForEmail(id: string): Promise<Contact | null> {
  try {
    const response = await fetch(`/api/contacts/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch contact: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting contact for email:', error);
    return null;
  }
}

// Get multiple contacts for email composition
export async function getContactsForEmail(ids: string[]): Promise<Contact[]> {
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

    return await response.json();
  } catch (error) {
    console.error('Error getting contacts for email:', error);
    return [];
  }
}

// Convert lead to contact
export async function convertLeadToContact(leadData: any): Promise<Contact | null> {
  try {
    const response = await fetch('/api/contacts/convert-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leadData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to convert lead: ${response.statusText}`);
    }

    const contact = await response.json();

    // Emit contact created event
    emitContactCreated(contact);

    return contact;
  } catch (error) {
    console.error('Error converting lead to contact:', error);
    return null;
  }
}

// Update contact when email is sent
export async function recordEmailSent(contactId: string, emailData: any): Promise<boolean> {
  try {
    const response = await fetch(`/api/contacts/${contactId}/record-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to record email: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error recording email for contact:', error);
    return false;
  }
}
