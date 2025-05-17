// lib/contacts/utils.ts
import { Contact, ContactFilterOptions, ContactSortOptions } from './types';

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Format a phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length === 11 && cleaned.charAt(0) === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  }

  // Return as-is if it doesn't match common patterns
  return phone;
}

/**
 * Filter contacts based on search query and filters
 */
export function filterContacts(
  contacts: Contact[],
  searchQuery: string = '',
  filterOptions: ContactFilterOptions = {}
): Contact[] {
  let filtered = [...contacts];

  // Apply search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      contact =>
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        (contact.company && contact.company.toLowerCase().includes(query)) ||
        (contact.title && contact.title.toLowerCase().includes(query)) ||
        (contact.phone && contact.phone.includes(query))
    );
  }

  // Apply status filter
  if (filterOptions.status && filterOptions.status.length > 0) {
    filtered = filtered.filter(
      contact => contact.status && filterOptions.status?.includes(contact.status)
    );
  }

  // Apply tags filter
  if (filterOptions.tags && filterOptions.tags.length > 0) {
    filtered = filtered.filter(
      contact => contact.tags && contact.tags.some(tag => filterOptions.tags?.includes(tag.id))
    );
  }

  // Apply groups filter
  if (filterOptions.groups && filterOptions.groups.length > 0) {
    filtered = filtered.filter(
      contact =>
        contact.groups && contact.groups.some(groupId => filterOptions.groups?.includes(groupId))
    );
  }

  // Apply engagement score filter
  if (filterOptions.engagementScore && filterOptions.engagementScore.length > 0) {
    filtered = filtered.filter(
      contact =>
        contact.engagementScore && filterOptions.engagementScore?.includes(contact.engagementScore)
    );
  }

  // Apply date range filter
  if (filterOptions.dateRange && (filterOptions.dateRange.start || filterOptions.dateRange.end)) {
    const { field, start, end } = filterOptions.dateRange;

    filtered = filtered.filter(contact => {
      const dateValue = contact[field as keyof Contact] as string | undefined;

      if (!dateValue) return false;

      const contactDate = new Date(dateValue).getTime();

      if (start && end) {
        return contactDate >= new Date(start).getTime() && contactDate <= new Date(end).getTime();
      } else if (start) {
        return contactDate >= new Date(start).getTime();
      } else if (end) {
        return contactDate <= new Date(end).getTime();
      }

      return true;
    });
  }

  return filtered;
}

/**
 * Sort contacts based on field and direction
 */
export function sortContacts(
  contacts: Contact[],
  field: string,
  direction: 'asc' | 'desc' = 'asc'
): Contact[] {
  const sortedContacts = [...contacts];

  sortedContacts.sort((a, b) => {
    let valueA: any;
    let valueB: any;

    // Handle nested fields
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      valueA = a[parent as keyof Contact]?.[child as keyof (typeof a)[keyof typeof a]];
      valueB = b[parent as keyof Contact]?.[child as keyof (typeof b)[keyof typeof b]];
    } else if (field === 'name') {
      // Special case for full name
      valueA = `${a.firstName} ${a.lastName}`.toLowerCase();
      valueB = `${b.firstName} ${b.lastName}`.toLowerCase();
    } else {
      // Direct field access
      valueA = a[field as keyof Contact];
      valueB = b[field as keyof Contact];
    }

    // Handle nullish values
    if (valueA === null || valueA === undefined) valueA = '';
    if (valueB === null || valueB === undefined) valueB = '';

    // Convert to lowercase if string
    if (typeof valueA === 'string') valueA = valueA.toLowerCase();
    if (typeof valueB === 'string') valueB = valueB.toLowerCase();

    // Sort by the prepared values
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sortedContacts;
}

/**
 * Group contacts by a field
 */
export function groupContactsByField(
  contacts: Contact[],
  field: string
): Record<string, Contact[]> {
  const grouped: Record<string, Contact[]> = {};

  contacts.forEach(contact => {
    const value = contact[field as keyof Contact];
    const key = String(value || 'Undefined');

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(contact);
  });

  return grouped;
}
