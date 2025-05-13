import axios from 'axios';

/**
 * Email interface representing an email message
 */
export interface Email {
  id: string;
  subject: string;
  from: {
    email: string;
    name: string;
  };
  to: Array<{
    email: string;
    name: string;
  }>;
  cc?: Array<{
    email: string;
    name: string;
  }>;
  bcc?: Array<{
    email: string;
    name: string;
  }>;
  body: {
    text: string;
    html?: string;
  };
  attachments?: Array<{
    id: string;
    filename: string;
    contentType: string;
    size: number;
    url: string;
  }>;
  folderId: string;
  labels?: string[];
  isRead: boolean;
  isStarred: boolean;
  isDeleted: boolean;
  isDraft: boolean;
  timestamp: string;
  receivedAt: string;
  threadId?: string;
  replyTo?: string;
  importance?: 'low' | 'normal' | 'high';
}

/**
 * Email folder interface
 */
export interface EmailFolder {
  id: string;
  name: string;
  type: 'inbox' | 'drafts' | 'sent' | 'trash' | 'spam' | 'archive' | 'custom';
  unreadCount: number;
  totalCount: number;
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

/**
 * Email label interface
 */
export interface EmailLabel {
  id: string;
  name: string;
  color: string;
}

/**
 * Filter options for fetching emails
 */
export interface EmailFilterOptions {
  folder?: string;
  labels?: string[];
  isRead?: boolean;
  isStarred?: boolean;
  isDeleted?: boolean;
  isDraft?: boolean;
  from?: string;
  to?: string;
  subject?: string;
  hasAttachments?: boolean;
  before?: string | Date;
  after?: string | Date;
  importance?: 'low' | 'normal' | 'high';
  search?: string;
}

/**
 * Pagination options for fetching emails
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: 'date' | 'importance' | 'sender' | 'subject';
  order?: 'asc' | 'desc';
}

/**
 * Response structure for paginated email results
 */
export interface EmailListResponse {
  data: Email[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * API error with enhanced typing
 */
export class EmailApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'EmailApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Base URL for email API endpoints
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

/**
 * Axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Add authorization header to requests if token is available
 */
api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

/**
 * Handle API errors consistently
 */
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const message = error.response.data?.message || 'An unknown error occurred';
      const code = error.response.data?.code || 'UNKNOWN_ERROR';

      // Handle authentication errors
      if (status === 401) {
        // Clear authentication if token is invalid or expired
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          // Optionally redirect to login page
          window.location.href = '/login';
        }
      }

      throw new EmailApiError(message, status, code);
    } else if (error.request) {
      // The request was made but no response was received
      throw new EmailApiError('No response from server', 0, 'NETWORK_ERROR');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new EmailApiError(error.message, 0, 'REQUEST_SETUP_ERROR');
    }
  }
);

/**
 * Fetches emails based on filter and pagination options
 *
 * @param filterOptions - Options to filter emails
 * @param paginationOptions - Options for pagination
 * @returns A promise that resolves to an email list response
 */
export async function fetchEmails(
  filterOptions: EmailFilterOptions = {},
  paginationOptions: PaginationOptions = { page: 1, limit: 20, sort: 'date', order: 'desc' }
): Promise<EmailListResponse> {
  try {
    // Prepare query parameters
    const params = {
      ...filterOptions,
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort: paginationOptions.sort,
      order: paginationOptions.order,
    };

    // Format date objects if they exist
    if (params.before instanceof Date) {
      params.before = params.before.toISOString();
    }

    if (params.after instanceof Date) {
      params.after = params.after.toISOString();
    }

    const response = await api.get('/emails', { params });
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'EMAIL_FETCH_ERROR');
    } else {
      throw new EmailApiError('Failed to fetch emails', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Fetches a single email by ID
 *
 * @param emailId - The ID of the email to fetch
 * @returns A promise that resolves to an email object
 */
export async function fetchEmail(emailId: string): Promise<Email> {
  try {
    const response = await api.get(`/emails/${emailId}`);
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'EMAIL_FETCH_ERROR');
    } else {
      throw new EmailApiError(`Failed to fetch email with ID: ${emailId}`, 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Marks one or more emails as read
 *
 * @param emailIds - Array of email IDs to mark as read
 * @returns A promise that resolves when the operation is complete
 */
export async function markAsRead(emailIds: string[]): Promise<void> {
  try {
    await api.patch('/emails/mark-read', { emailIds });
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'MARK_READ_ERROR');
    } else {
      throw new EmailApiError('Failed to mark emails as read', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Marks one or more emails as unread
 *
 * @param emailIds - Array of email IDs to mark as unread
 * @returns A promise that resolves when the operation is complete
 */
export async function markAsUnread(emailIds: string[]): Promise<void> {
  try {
    await api.patch('/emails/mark-unread', { emailIds });
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'MARK_UNREAD_ERROR');
    } else {
      throw new EmailApiError('Failed to mark emails as unread', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Marks one or more emails as starred or unstarred
 *
 * @param emailIds - Array of email IDs to update
 * @param starred - Whether to star or unstar the emails
 * @returns A promise that resolves when the operation is complete
 */
export async function markAsStarred(emailIds: string[], starred: boolean): Promise<void> {
  try {
    await api.patch('/emails/mark-starred', { emailIds, starred });
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'MARK_STARRED_ERROR');
    } else {
      throw new EmailApiError(
        `Failed to mark emails as ${starred ? 'starred' : 'unstarred'}`,
        500,
        'UNKNOWN_ERROR'
      );
    }
  }
}

/**
 * Deletes one or more emails
 *
 * @param emailIds - Array of email IDs to delete
 * @param permanent - Whether to permanently delete or move to trash
 * @returns A promise that resolves when the operation is complete
 */
export async function deleteEmail(emailIds: string[], permanent: boolean = false): Promise<void> {
  try {
    if (permanent) {
      await api.delete('/emails', { data: { emailIds } });
    } else {
      await api.patch('/emails/move-to-trash', { emailIds });
    }
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'DELETE_EMAIL_ERROR');
    } else {
      throw new EmailApiError('Failed to delete emails', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Sends an email
 *
 * @param emailData - The email to send
 * @param saveToDrafts - Whether to save the email to drafts if sending fails
 * @returns A promise that resolves to the sent email
 */
export async function sendEmail(
  emailData: Omit<
    Email,
    'id' | 'isRead' | 'isStarred' | 'isDeleted' | 'timestamp' | 'receivedAt' | 'folderId'
  >,
  saveToDrafts: boolean = true
): Promise<Email> {
  try {
    const response = await api.post('/emails/send', {
      ...emailData,
      saveToDrafts,
    });
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'SEND_EMAIL_ERROR');
    } else {
      throw new EmailApiError('Failed to send email', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Saves an email as a draft
 *
 * @param draftData - The draft email data
 * @param draftId - Optional existing draft ID to update
 * @returns A promise that resolves to the saved draft
 */
export async function saveDraft(draftData: Partial<Email>, draftId?: string): Promise<Email> {
  try {
    let response;
    if (draftId) {
      response = await api.put(`/emails/drafts/${draftId}`, draftData);
    } else {
      response = await api.post('/emails/drafts', draftData);
    }
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'SAVE_DRAFT_ERROR');
    } else {
      throw new EmailApiError('Failed to save draft', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Fetches all email folders
 *
 * @returns A promise that resolves to an array of email folders
 */
export async function fetchFolders(): Promise<EmailFolder[]> {
  try {
    const response = await api.get('/emails/folders');
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'FETCH_FOLDERS_ERROR');
    } else {
      throw new EmailApiError('Failed to fetch email folders', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Creates a new email folder
 *
 * @param name - The name of the folder
 * @param color - Optional color for the folder
 * @returns A promise that resolves to the created folder
 */
export async function createFolder(name: string, color?: string): Promise<EmailFolder> {
  try {
    const response = await api.post('/emails/folders', { name, color });
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'CREATE_FOLDER_ERROR');
    } else {
      throw new EmailApiError('Failed to create folder', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Moves one or more emails to a specified folder
 *
 * @param emailIds - Array of email IDs to move
 * @param folderId - Target folder ID
 * @returns A promise that resolves when the operation is complete
 */
export async function moveToFolder(emailIds: string[], folderId: string): Promise<void> {
  try {
    await api.patch('/emails/move', { emailIds, folderId });
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'MOVE_EMAIL_ERROR');
    } else {
      throw new EmailApiError('Failed to move emails', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Fetches all email labels
 *
 * @returns A promise that resolves to an array of email labels
 */
export async function fetchLabels(): Promise<EmailLabel[]> {
  try {
    const response = await api.get('/emails/labels');
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'FETCH_LABELS_ERROR');
    } else {
      throw new EmailApiError('Failed to fetch email labels', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Adds labels to one or more emails
 *
 * @param emailIds - Array of email IDs
 * @param labelIds - Array of label IDs to add
 * @returns A promise that resolves when the operation is complete
 */
export async function addLabels(emailIds: string[], labelIds: string[]): Promise<void> {
  try {
    await api.patch('/emails/labels/add', { emailIds, labelIds });
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'ADD_LABELS_ERROR');
    } else {
      throw new EmailApiError('Failed to add labels to emails', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Removes labels from one or more emails
 *
 * @param emailIds - Array of email IDs
 * @param labelIds - Array of label IDs to remove
 * @returns A promise that resolves when the operation is complete
 */
export async function removeLabels(emailIds: string[], labelIds: string[]): Promise<void> {
  try {
    await api.patch('/emails/labels/remove', { emailIds, labelIds });
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'REMOVE_LABELS_ERROR');
    } else {
      throw new EmailApiError('Failed to remove labels from emails', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Searches emails with specific criteria
 *
 * @param query - The search query
 * @param options - Additional search options
 * @returns A promise that resolves to an email list response
 */
export async function searchEmails(
  query: string,
  options: {
    in?: Array<'subject' | 'body' | 'from' | 'to' | 'cc' | 'bcc'>;
    folderId?: string;
    labelIds?: string[];
    page?: number;
    limit?: number;
  } = {}
): Promise<EmailListResponse> {
  try {
    const params = {
      query,
      ...options,
    };

    const response = await api.get('/emails/search', { params });
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'SEARCH_EMAILS_ERROR');
    } else {
      throw new EmailApiError('Failed to search emails', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Uploads an attachment for an email
 *
 * @param file - The file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns A promise that resolves to the uploaded attachment details
 */
export async function uploadAttachment(
  file: File,
  onProgress?: (progressEvent: { loaded: number; total: number }) => void
): Promise<{
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/emails/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });

    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'UPLOAD_ATTACHMENT_ERROR');
    } else {
      throw new EmailApiError('Failed to upload attachment', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Downloads an email attachment
 *
 * @param attachmentId - The ID of the attachment to download
 * @param filename - Optional filename to save as
 * @returns A promise that resolves when the download is complete
 */
export async function downloadAttachment(attachmentId: string, filename?: string): Promise<Blob> {
  try {
    const response = await api.get(`/emails/attachments/${attachmentId}`, {
      responseType: 'blob',
    });

    // Trigger download if filename is provided
    if (filename) {
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }

    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'DOWNLOAD_ATTACHMENT_ERROR');
    } else {
      throw new EmailApiError('Failed to download attachment', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Archives one or more emails
 *
 * @param emailIds - Array of email IDs to archive
 * @returns A promise that resolves when the operation is complete
 */
export async function archiveEmails(emailIds: string[]): Promise<void> {
  try {
    await api.patch('/emails/archive', { emailIds });
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'ARCHIVE_EMAILS_ERROR');
    } else {
      throw new EmailApiError('Failed to archive emails', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Fetches email statistics
 *
 * @returns A promise that resolves to email statistics
 */
export async function fetchEmailStats(): Promise<{
  total: number;
  unread: number;
  starred: number;
  byFolder: Record<string, { total: number; unread: number }>;
}> {
  try {
    const response = await api.get('/emails/stats');
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'FETCH_STATS_ERROR');
    } else {
      throw new EmailApiError('Failed to fetch email statistics', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Gets thread information for an email
 *
 * @param threadId - The ID of the thread
 * @returns A promise that resolves to an array of emails in the thread
 */
export async function getThread(threadId: string): Promise<Email[]> {
  try {
    const response = await api.get(`/emails/threads/${threadId}`);
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'GET_THREAD_ERROR');
    } else {
      throw new EmailApiError('Failed to get email thread', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Exports one or more emails to a file
 *
 * @param emailIds - Array of email IDs to export
 * @param format - Format to export (PDF, EML, etc.)
 * @returns A promise that resolves to a Blob containing the exported data
 */
export async function exportEmails(
  emailIds: string[],
  format: 'pdf' | 'eml' | 'html' = 'pdf'
): Promise<Blob> {
  try {
    const response = await api.post(
      '/emails/export',
      { emailIds, format },
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'EXPORT_EMAILS_ERROR');
    } else {
      throw new EmailApiError('Failed to export emails', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Marks all emails in a folder as read
 *
 * @param folderId - ID of the folder
 * @returns A promise that resolves when the operation is complete
 */
export async function markAllAsRead(folderId: string): Promise<void> {
  try {
    await api.patch('/emails/mark-all-read', { folderId });
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'MARK_ALL_READ_ERROR');
    } else {
      throw new EmailApiError('Failed to mark all emails as read', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Schedules an email to be sent at a future time
 *
 * @param emailData - The email to send
 * @param scheduledTime - When to send the email
 * @returns A promise that resolves to the scheduled email
 */
export async function scheduleEmail(
  emailData: Omit<
    Email,
    'id' | 'isRead' | 'isStarred' | 'isDeleted' | 'timestamp' | 'receivedAt' | 'folderId'
  >,
  scheduledTime: Date
): Promise<Email> {
  try {
    const response = await api.post('/emails/schedule', {
      ...emailData,
      scheduledTime: scheduledTime.toISOString(),
    });
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'SCHEDULE_EMAIL_ERROR');
    } else {
      throw new EmailApiError('Failed to schedule email', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Cancels a scheduled email
 *
 * @param emailId - ID of the scheduled email
 * @returns A promise that resolves when the operation is complete
 */
export async function cancelScheduledEmail(emailId: string): Promise<void> {
  try {
    await api.delete(`/emails/schedule/${emailId}`);
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'CANCEL_SCHEDULE_ERROR');
    } else {
      throw new EmailApiError('Failed to cancel scheduled email', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Gets email settings
 *
 * @returns A promise that resolves to the email settings
 */
export async function getEmailSettings(): Promise<{
  signature: string;
  replyTo: string;
  defaultFolder: string;
  autoMarkAsRead: boolean;
  defaultPriority: 'low' | 'normal' | 'high';
  notifications: boolean;
}> {
  try {
    const response = await api.get('/emails/settings');
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'GET_SETTINGS_ERROR');
    } else {
      throw new EmailApiError('Failed to get email settings', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Updates email settings
 *
 * @param settings - The settings to update
 * @returns A promise that resolves to the updated settings
 */
export async function updateEmailSettings(
  settings: Partial<{
    signature: string;
    replyTo: string;
    defaultFolder: string;
    autoMarkAsRead: boolean;
    defaultPriority: 'low' | 'normal' | 'high';
    notifications: boolean;
  }>
): Promise<{
  signature: string;
  replyTo: string;
  defaultFolder: string;
  autoMarkAsRead: boolean;
  defaultPriority: 'low' | 'normal' | 'high';
  notifications: boolean;
}> {
  try {
    const response = await api.patch('/emails/settings', settings);
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'UPDATE_SETTINGS_ERROR');
    } else {
      throw new EmailApiError('Failed to update email settings', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Syncs emails with the server
 *
 * @param lastSyncTimestamp - Timestamp of the last sync
 * @returns A promise that resolves to newly synced emails
 */
export async function syncEmails(lastSyncTimestamp?: string): Promise<{
  emails: Email[];
  deletedEmailIds: string[];
  timestamp: string;
}> {
  try {
    const params = lastSyncTimestamp ? { lastSyncTimestamp } : {};
    const response = await api.get('/emails/sync', { params });
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'SYNC_EMAILS_ERROR');
    } else {
      throw new EmailApiError('Failed to sync emails', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Gets a list of email templates
 *
 * @returns A promise that resolves to an array of email templates
 */
export async function getEmailTemplates(): Promise<
  Array<{
    id: string;
    name: string;
    subject: string;
    body: {
      text: string;
      html?: string;
    };
    isDefault?: boolean;
    category?: string;
  }>
> {
  try {
    const response = await api.get('/emails/templates');
    return response.data;
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'GET_TEMPLATES_ERROR');
    } else {
      throw new EmailApiError('Failed to get email templates', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Reports an email as spam
 *
 * @param emailIds - Array of email IDs to report as spam
 * @returns A promise that resolves when the operation is complete
 */
export async function reportSpam(emailIds: string[]): Promise<void> {
  try {
    await api.post('/emails/report-spam', { emailIds });
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'REPORT_SPAM_ERROR');
    } else {
      throw new EmailApiError('Failed to report emails as spam', 500, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Recovers one or more emails from trash or spam
 *
 * @param emailIds - Array of email IDs to recover
 * @returns A promise that resolves when the operation is complete
 */
export async function recoverEmails(emailIds: string[]): Promise<void> {
  try {
    await api.post('/emails/recover', { emailIds });
  } catch (error) {
    if (error instanceof EmailApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new EmailApiError(error.message, 500, 'RECOVER_EMAILS_ERROR');
    } else {
      throw new EmailApiError('Failed to recover emails', 500, 'UNKNOWN_ERROR');
    }
  }
}
