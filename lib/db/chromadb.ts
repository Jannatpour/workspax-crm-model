import { ChromaClient, Collection, OpenAIEmbeddingFunction } from "chromadb";
import { logger } from "@/lib/logger";
import { Email, EmailFolder, EmailStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// Collection names
export const COLLECTIONS = {
  EMAILS: "emails",
  CONTACTS: "contacts",
  TEMPLATES: "templates",
};

export interface EmailMetadata {
  userId?: string;
  subject?: string;
  fromEmail?: string;
  toEmails?: string;
  sentAt?: string;
  folder?: EmailFolder;
  status?: EmailStatus;
  contactId?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface EmailSearchResult {
  id: string;
  subject: string;
  snippet: string;
  sentAt: Date;
  fromEmail: string;
  toEmails: string[];
  score: number;
  metadata?: EmailMetadata;
}

// Initialize ChromaDB client
const chromaClient = new ChromaClient({
  path: process.env.CHROMA_DB_URL || "http://localhost:8000",
});

// Create embedding function using OpenAI
const embeddingFunction = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY || "",
  openai_model: "text-embedding-3-small",
});

// Collections
let emailsCollection: Collection;
let contactsCollection: Collection;
let templatesCollection: Collection;

/**
 * Initialize ChromaDB collections
 * @returns Promise<boolean> Success status
 */
export async function initializeChromaDB(): Promise<boolean> {
  try {
    // Check if collections exist, create if they don't
    const collections = await chromaClient.listCollections();
    const collectionNames = collections.map(collection => collection.name);
    
    // Initialize email collection
    if (!collectionNames.includes(COLLECTIONS.EMAILS)) {
      emailsCollection = await chromaClient.createCollection({
        name: COLLECTIONS.EMAILS,
        embeddingFunction,
        metadata: { description: 'Email contents for vector search' }
      });
      logger.info('Created emails collection in ChromaDB');
    } else {
      emailsCollection = await chromaClient.getCollection({
        name: COLLECTIONS.EMAILS,
        embeddingFunction
      });
      logger.info('Retrieved existing emails collection from ChromaDB');
    }
    
    // Initialize contacts collection
    if (!collectionNames.includes(COLLECTIONS.CONTACTS)) {
      contactsCollection = await chromaClient.createCollection({
        name: COLLECTIONS.CONTACTS,
        embeddingFunction,
        metadata: { description: 'Contact information for vector search' }
      });
      logger.info('Created contacts collection in ChromaDB');
    } else {
      contactsCollection = await chromaClient.getCollection({
        name: COLLECTIONS.CONTACTS,
        embeddingFunction
      });
      logger.info('Retrieved existing contacts collection from ChromaDB');
    }
    
    // Initialize templates collection
    if (!collectionNames.includes(COLLECTIONS.TEMPLATES)) {
      templatesCollection = await chromaClient.createCollection({
        name: COLLECTIONS.TEMPLATES,
        embeddingFunction,
        metadata: { description: 'Email templates for vector search' }
      });
      logger.info('Created templates collection in ChromaDB');
    } else {
      templatesCollection = await chromaClient.getCollection({
        name: COLLECTIONS.TEMPLATES,
        embeddingFunction
      });
      logger.info('Retrieved existing templates collection from ChromaDB');
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize ChromaDB collections', { error });
    throw new Error(`ChromaDB initialization failed: ${error.message}`);
  }
}

// Try to initialize ChromaDB on module load
initializeChromaDB().catch(error => {
  logger.error('ChromaDB initialization error', { error });
});

/**
 * Get a collection by name with retry mechanism
 * @param name Collection name
 * @returns Promise<Collection>
 */
export async function getCollection(name: string): Promise<Collection> {
  try {
    // Check if collection is already initialized in memory
    if (name === COLLECTIONS.EMAILS && emailsCollection) {
      return emailsCollection;
    } else if (name === COLLECTIONS.CONTACTS && contactsCollection) {
      return contactsCollection;
    } else if (name === COLLECTIONS.TEMPLATES && templatesCollection) {
      return templatesCollection;
    }
    
    // Try to get from ChromaDB
    try {
      return await chromaClient.getCollection({
        name,
        embeddingFunction,
      });
    } catch  {
      // Collection doesn't exist, create it
      const collection = await chromaClient.createCollection({
        name,
        embeddingFunction,
      });
      
      // Store in memory
      if (name === COLLECTIONS.EMAILS) {
        emailsCollection = collection;
      } else if (name === COLLECTIONS.CONTACTS) {
        contactsCollection = collection;
      } else if (name === COLLECTIONS.TEMPLATES) {
        templatesCollection = collection;
      }
      
      return collection;
    }
  } catch (error) {
    logger.error(`Error getting collection ${name}:`, error);
    throw error;
  }
}

/**
 * Add document to collection
 * @param collectionName Collection name
 * @param id Document ID
 * @param document Document text
 * @param metadata Document metadata
 * @returns Promise<boolean> Success status
 */
export async function addDocument(
  collectionName: string,
  id: string,
  document: string,
  metadata: Record<string, string | number | boolean | undefined> = {}
): Promise<boolean> {
  try {
    const collection = await getCollection(collectionName);
    await collection.add({
      ids: [id],
      documents: [document],
      metadatas: [metadata],
    });
    return true;
  } catch (error) {
    logger.error(`Error adding document to ${collectionName}:`, error);
    return false;
  }
}

/**
 * Update document in collection
 * @param collectionName Collection name
 * @param id Document ID
 * @param document Document text
 * @param metadata Document metadata
 * @returns Promise<boolean> Success status
 */
export async function updateDocument(
  collectionName: string,
  id: string,
  document: string,
  metadata: Record<string, string | number | boolean | undefined> = {}
): Promise<boolean> {
  try {
    const collection = await getCollection(collectionName);
    await collection.update({
      ids: [id],
      documents: [document],
      metadatas: [metadata],
    });
    return true;
  } catch (error) {
    logger.error(`Error updating document in ${collectionName}:`, error);
    
    // If update fails because document doesn't exist, try to add it
    try {
      return await addDocument(collectionName, id, document, metadata);
    } catch (addError) {
      logger.error(`Error adding document as fallback in ${collectionName}:`, addError);
      return false;
    }
  }
}

/**
 * Delete document from collection
 * @param collectionName Collection name
 * @param id Document ID
 * @returns Promise<boolean> Success status
 */
export async function deleteDocument(collectionName: string, id: string): Promise<boolean> {
  try {
    const collection = await getCollection(collectionName);
    await collection.delete({
      ids: [id],
    });
    return true;
  } catch (error) {
    logger.error(`Error deleting document from ${collectionName}:`, error);
    return false;
  }
}

/**
 * Delete multiple documents from collection
 * @param collectionName Collection name
 * @param ids Document IDs
 * @returns Promise<boolean> Success status
 */
export async function deleteDocuments(collectionName: string, ids: string[]): Promise<boolean> {
  try {
    const collection = await getCollection(collectionName);
    
    // Delete in batches of 100
    const batchSize = 100;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      await collection.delete({
        ids: batch,
      });
    }
    
    return true;
  } catch (error) {
    logger.error(`Error deleting documents from ${collectionName}:`, error);
    return false;
  }
}

/**
 * Query collection by text
 * @param collectionName Collection name
 * @param query Query text
 * @param filters Filter criteria
 * @param limit Max results
 * @returns Promise<any> Query results
 */
export async function queryCollection(
  collectionName: string,
  query: string,
  filters: Record<string, string | number | boolean | undefined> = {},
  limit: number = 10
): Promise<{
  ids: string[][];
  documents: string[][];
  metadatas: Record<string, string | number | boolean | undefined>[][];
  distances: number[][];
}> {
  try {
    const collection = await getCollection(collectionName);
    
    const result = await collection.query({
      queryTexts: [query],
      where: filters,
      nResults: limit,
    });
    
    return result;
  } catch (error) {
    logger.error(`Error querying ${collectionName}:`, error);
    return null;
  }
}

/**
 * Helper function to strip HTML tags
 * @param html HTML string
 * @returns Plain text string
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Add email to vector database
 * @param emailId Email ID
 * @param subject Email subject
 * @param body Email body (HTML or plain text)
 * @param metadata Additional metadata
 * @returns Promise<boolean> Success status
 */
export async function addEmailToVectorDB(
  emailId: string,
  subject: string,
  body: string,
  metadata: Record<string, string | number | boolean | undefined> = {}
): Promise<boolean> {
  const document = `${subject}\n\n${stripHtml(body)}`;
  return addDocument(COLLECTIONS.EMAILS, emailId, document, {
    ...metadata,
    type: "email",
  });
}

/**
 * Create email embedding and store in ChromaDB
 * @param email Prisma Email object
 * @returns Promise<boolean> Success status
 */
export async function createEmailEmbedding(email: Email): Promise<boolean> {
  try {
    // Prepare text for embedding and metadata for ChromaDB
    const bodyContent = email.bodyText || stripHtml(email.body);
    
    // Prepare metadata for ChromaDB
    const metadata = {
      userId: email.userId,
      subject: email.subject,
      fromEmail: email.fromEmail,
      toEmails: email.toEmails.join(", "),
      sentAt: email.sentAt?.toISOString() || new Date().toISOString(),
      folder: email.folder,
      status: email.status,
      ...(email.contactId && { contactId: email.contactId }),
      ...(email.metadata && typeof email.metadata === 'object' ? email.metadata : {})
    };
    
    // Add to ChromaDB using the helper function
    const success = await addEmailToVectorDB(
      email.id,
      email.subject,
      bodyContent,
      metadata
    );
    
    if (success) {
      logger.info('Added email to ChromaDB', { emailId: email.id });
    } else {
      logger.warn('Failed to add email to ChromaDB', { emailId: email.id });
    }
    
    return success;
  } catch (error) {
    logger.error('Error creating email embedding:', { emailId: email.id, error });
    return false;
  }
}

/**
 * Add contact to vector database
 * @param contactId Contact ID
 * @param name Contact name
 * @param email Contact email
 * @param company Company name
 * @param notes Additional notes
 * @param metadata Additional metadata
 * @returns Promise<boolean> Success status
 */
export async function addContactToVectorDB(
  contactId: string,
  name: string,
  email: string,
  company: string = "",
  notes: string = "",
  metadata: Record<string, string | number | boolean | undefined> = {}
): Promise<boolean> {
  const document = `${name} ${email} ${company} ${notes}`;
  return addDocument(COLLECTIONS.CONTACTS, contactId, document, {
    ...metadata,
    type: "contact",
  });
}

/**
 * Search emails by similarity
 * @param query Search query
 * @param userId User ID
 * @param limit Max results
 * @returns Promise<any> Search results
 */
export async function searchSimilarEmails(
  query: string,
  userId: string,
  limit: number = 10
): Promise<[string, string | number | boolean | undefined]> {
  return queryCollection(
    COLLECTIONS.EMAILS,
    query,
    { userId },
    limit
  );
}

/**
 * Search contacts by similarity
 * @param query Search query
 * @param userId User ID
 * @param limit Max results
 * @returns Promise<any> Search results
 */
export async function searchSimilarContacts(
  query: string,
  userId: string,
  limit: number = 10
): Promise<[string, string | number | boolean | undefined]> {
  return queryCollection(
    COLLECTIONS.CONTACTS,
    query,
    { userId },
    limit
  );
}

/**
 * Search emails by semantic similarity with better error handling and retries
 * @param userId User ID
 * @param query Search query
 * @param options Search options
 * @returns Promise<EmailSearchResult[]> Search results
 */
export async function searchEmails(
  userId: string, 
  query: string, 
  options: { 
    limit?: number, 
    folder?: string,
    startDate?: Date,
    endDate?: Date,
    contactId?: string,
    status?: string
  } = {}
): Promise<EmailSearchResult[]> {
  try {
    // Default options
    const limit = options.limit || 10;
    
    // Build filters for ChromaDB
    const filters: Record<string, string | number | boolean | undefined> = {
      userId: userId
    };
    
    if (options.folder) {
      filters.folder = options.folder;
    }
    
    if (options.contactId) {
      filters.contactId = options.contactId;
    }
    
    if (options.status) {
      filters.status = options.status;
    }
    
    // Add date filters if provided
    let whereClause = "";
    if (options.startDate) {
      whereClause += `sentAt >= '${options.startDate.toISOString()}'`;
    }
    
    if (options.endDate) {
      if (whereClause) whereClause += " AND ";
      whereClause += `sentAt <= '${options.endDate.toISOString()}'`;
    }
    
    // Query ChromaDB with retry mechanism
    let results = null;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries && results === null) {
      results = await searchSimilarEmails(query, userId, limit);
      
      if (results === null) {
        retries++;
        if (retries < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, retries) * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    if (results === null || !results.ids || results.ids[0].length === 0) {
      logger.info('No search results found', { query, userId });
      return [];
    }
    
    // Extract results
    const emailIds = results.ids[0] as string[];
    const distances = results.distances?.[0] || [];
    const metadatas = results.metadatas?.[0] || [];
    
    // Fetch complete email data from database
    const emails = await prisma.email.findMany({
      where: { 
        id: { in: emailIds },
        userId
      },
      select: {
        id: true,
        subject: true,
        body: true,
        bodyText: true,
        sentAt: true,
        fromEmail: true,
        toEmails: true,
        metadata: true
      }
    });
    
    // Map results to EmailSearchResult format
    const searchResults: EmailSearchResult[] = [];
    
    emailIds.forEach((id, index) => {
      const emailId = id;
      const email = emails.find(e => e.id === emailId);
      const metadata = metadatas[index] || {};
      
      if (email) {
        // Calculate score (1 - distance gives a similarity score where higher is better)
        const score = distances && distances[index] !== undefined 
          ? 1 - distances[index] 
          : 0;
          
        // Create snippet from body
        const bodyText = email.bodyText || stripHtml(email.body);
        const snippetLength = 160;
        let snippet = '';
        
        // Try to find the query terms in the body for better snippets
        const lowerQuery = query.toLowerCase();
        const lowerBody = bodyText.toLowerCase();
        const startPos = lowerBody.indexOf(lowerQuery);
        
        if (startPos >= 0) {
          // If query was found, center snippet around it
          const start = Math.max(0, startPos - 60);
          const end = Math.min(bodyText.length, startPos + query.length + 100);
          snippet = bodyText.substring(start, end);
          
          // Add ellipsis if needed
          if (start > 0) snippet = '...' + snippet;
          if (end < bodyText.length) snippet = snippet + '...';
        } else {
          // Otherwise, use beginning of email
          snippet = bodyText.substring(0, snippetLength) + 
            (bodyText.length > snippetLength ? '...' : '');
        }
        
        searchResults.push({
          id: emailId,
          subject: email.subject,
          snippet,
          sentAt: email.sentAt || new Date(),
          fromEmail: email.fromEmail,
          toEmails: email.toEmails,
          score,
          metadata: {
            ...metadata,
            ...email.metadata
          }
        });
      }
    });
    
    // Sort by score descending
    return searchResults.sort((a, b) => b.score - a.score);
  } catch (error) {
    logger.error('Error searching emails:', { error, query, userId });
    return [];
  }
}

/**
 * Rebuild ChromaDB index for a user
 * @param userId User ID
 * @returns Promise<{success: boolean, count: number}> Success status and count
 */
export async function rebuildUserEmailIndex(userId: string): Promise<{success: boolean, count: number}> {
  try {
    // Check if ChromaDB is initialized
    if (!emailsCollection) {
      await initializeChromaDB();
    }
    
    // Delete existing user emails from ChromaDB
    const userEmails = await prisma.email.findMany({
      where: { userId },
      select: { id: true }
    });
    
    const userEmailIds = userEmails.map(email => email.id);
    
    // Delete in batches
    const batchSize = 500;
    for (let i = 0; i < userEmailIds.length; i += batchSize) {
      const batchIds = userEmailIds.slice(i, i + batchSize);
      try {
        await deleteDocuments(COLLECTIONS.EMAILS, batchIds);
      } catch (deleteError) {
        logger.warn('Error deleting emails from ChromaDB during rebuild', { 
          error: deleteError,
          count: batchIds.length
        });
        // Continue with the rebuild process
      }
    }
    
    // Fetch all user emails in batches
    let processedCount = 0;
    let offset = 0;
    
    while (true) {
      const emails = await prisma.email.findMany({
        where: { userId },
        take: batchSize,
        skip: offset,
        orderBy: { sentAt: 'desc' }
      });
      
      if (emails.length === 0) break;
      
      // Process each email
      for (const email of emails) {
        try {
          // Create new embedding
          await createEmailEmbedding(email);
          processedCount++;
        } catch (error) {
          logger.error('Error rebuilding email embedding', { emailId: email.id, error });
          // Continue with next email
        }
      }
      
      offset += emails.length;
      
      // Log progress
      logger.info(`Rebuilt ${processedCount}/${userEmailIds.length} email embeddings for user`, { userId });
      
      // Small delay to prevent overloading the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    logger.info('Email index rebuild complete', { userId, count: processedCount });
    return { success: true, count: processedCount };
  } catch (error) {
    logger.error('Error rebuilding email index', { userId, error });
    return { success: false, count: 0 };
  }
}

export default {
  addEmailToVectorDB,
  addContactToVectorDB,
  searchSimilarEmails,
  searchSimilarContacts,
  searchEmails,
  createEmailEmbedding,
  stripHtml,
  rebuildUserEmailIndex,
  addDocument,
  updateDocument,
  deleteDocument,
  deleteDocuments,
  initializeChromaDB,
  getCollection,
  queryCollection,
  COLLECTIONS
};