import { OpenAI } from "openai";
import { searchSimilarEmails } from "@/lib/db/chromadb";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { LRUCache } from "lru-cache";
import pLimit from "p-limit";

// Types
export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmailResponseData {
  response: string;
  suggestedSubject?: string;
  tone?: string;
  formality?: 'formal' | 'informal' | 'neutral';
}

export interface ThreadSummaryData {
  summary: string;
  keyPoints: string[];
  actionItems?: string[];
  participants?: string[];
  timeline?: {
    startDate: string;
    endDate: string;
    duration: string;
  };
}

export interface EmailTemplateData {
  html: string;
  text: string;
  subject: string;
  fullResponse?: string;
}

export interface CommunicationAnalysisData {
  analysis: string;
  frequency: string;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestions: string[];
  responseTime?: string;
}

export interface SentimentAnalysisData {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keyPhrases: string[];
}

export interface ExtractedActionItemsData {
  actionItems: Array<{
    item: string;
    assignee?: string;
    dueDate?: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  total: number;
}

export interface EmailData {
  fromEmail: string;
  toEmails: string[];
  sentAt?: string | Date;
  receivedAt?: string | Date;
  subject: string;
  bodyText?: string;
  body?: string;
}

export interface MeetingMinutesData {
  minutes: string;
  format: 'markdown' | 'text' | 'html';
}

export type AIModel = 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo';

// Configuration
const DEFAULT_MODEL: AIModel = "gpt-4o";
const FALLBACK_MODEL: AIModel = "gpt-3.5-turbo";
const MAX_TOKENS = 4096;
const RATE_LIMIT = 10; // Max 10 concurrent requests
const CACHE_MAX_SIZE = 100; // Cache size
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiter
const limiter = pLimit(RATE_LIMIT);

// Define a type for all possible cached response types
type CachedResponseType = 
  | OpenAI.Chat.Completions.ChatCompletion
  | OpenAI.Embeddings.CreateEmbeddingResponse
  | AIResponse<EmailResponseData>
  | AIResponse<ThreadSummaryData>
  | AIResponse<EmailTemplateData>
  | AIResponse<CommunicationAnalysisData>
  | AIResponse<SentimentAnalysisData>
  | AIResponse<ExtractedActionItemsData>
  | AIResponse<MeetingMinutesData>;

// Results cache
const responseCache = new LRUCache<string, CachedResponseType>({
  max: CACHE_MAX_SIZE,
  ttl: 1000 * 60 * 60, // 1 hour
});

/**
 * Execute an OpenAI request with retries and rate limiting
 */
async function executeAIRequest<T>(
  requestFn: () => Promise<T>,
  cacheKey?: string
): Promise<T> {
  // Check cache if key provided
  if (cacheKey && responseCache.has(cacheKey)) {
    logger.info('Using cached AI response', { cacheKey });
    return responseCache.get(cacheKey) as unknown as T;
  }

  // Apply rate limiting and retries
  return limiter(async () => {
    let attempt = 0;
    let lastError: Error | unknown;

    while (attempt < RETRY_ATTEMPTS) {
      try {
        const result = await requestFn();
        
        // Cache result if caching is requested
        if (cacheKey) {
          responseCache.set(cacheKey, result);
        }
        
        return result;
      } catch (error) {
        attempt++;
        lastError = error;
        
        logger.warn(`AI request failed (attempt ${attempt}/${RETRY_ATTEMPTS})`, { 
          error, 
          attempt, 
          cacheKey 
        });
        
        if (attempt < RETRY_ATTEMPTS) {
          // Exponential backoff
          const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all attempts failed
    throw lastError;
  });
}

/**
 * Process email body text to make it more suitable for the AI
 */
function processEmailText(text: string, maxLength = 10000): string {
  // Remove email signatures (common patterns)
  const withoutSignature = text
    .replace(/^--\s*\n[\s\S]*$/m, '') // Remove -- signature
    .replace(/^-{3,}\s*\n[\s\S]*$/m, '') // Remove --- signature
    .replace(/^Sent from [\s\S]*$/m, '') // Remove "Sent from" mobile signatures
    .replace(/^----+ ?Original Message ?----+[\s\S]*$/m, ''); // Remove forwarded content markers
  
  // Clean up newlines and spaces
  const cleaned = withoutSignature
    .replace(/\n{3,}/g, '\n\n') // Replace excessive newlines
    .trim();
  
  // Truncate if too long
  return cleaned.length > maxLength 
    ? cleaned.substring(0, maxLength) + "..." 
    : cleaned;
}

/**
 * Extract the relevant parts of an email thread
 */
function extractThreadContent(
  emails: EmailData[], 
  maxThreadLength = 10
): string {
  // Take the most recent emails, limiting the total length
  const recentEmails = emails.slice(-maxThreadLength);
  
  return recentEmails
    .map(e => {
      const date = e.sentAt || e.receivedAt;
      const formattedDate = date ? new Date(date).toLocaleString() : 'Unknown date';
      
      return `FROM: ${e.fromEmail}\nTO: ${e.toEmails.join(", ")}\nDATE: ${formattedDate}\nSUBJECT: ${e.subject}\n\n${processEmailText(e.bodyText || e.body)}`
    })
    .join("\n\n----------\n\n");
}

/**
 * Generate an email response based on previous conversation
 */
export async function generateEmailResponse(
  emailId: string,
  userId: string,
  options?: {
    model?: AIModel;
    suggestSubject?: boolean;
    tone?: 'professional' | 'friendly' | 'formal' | 'casual';
    includeSimilarEmails?: boolean;
  }
): Promise<AIResponse<EmailResponseData>> {
  const model = options?.model || DEFAULT_MODEL;
  const cacheKey = `email_response:${emailId}:${JSON.stringify(options)}`;
  
  try {
    // Get email details
    const email = await prisma.email.findUnique({
      where: { id: emailId },
      include: {
        thread: {
          include: {
            emails: {
              orderBy: { sentAt: "asc" },
            },
          },
        },
      },
    });

    if (!email) {
      return { success: false, error: "Email not found" };
    }

    // Find similar emails for context if requested
    let similarEmailsContext = "";
    if (options?.includeSimilarEmails !== false) {
      try {
        const similarEmails = await searchSimilarEmails(
          `${email.subject} ${email.bodyText || stripHtml(email.body)}`,
          userId,
          3
        );

        if (similarEmails && similarEmails.length > 0) {
          similarEmailsContext = "Similar past emails for reference:\n" + 
            similarEmails
              .slice(0, 3)
              .map((email, index) => 
                `[Similar email ${index + 1}]\nSubject: ${email.subject}\nSnippet: ${email.snippet}`)
              .join("\n\n");
        }
      } catch (error) {
        logger.warn('Error fetching similar emails, continuing without them', { error, emailId });
      }
    }

    // Prepare conversation context
    let conversationContext = "";
    
    if (email.thread && email.thread.emails && email.thread.emails.length > 0) {
      conversationContext = extractThreadContent(email.thread.emails);
    }

    // Format the system prompt based on options
    let systemPrompt = `You are an AI assistant that helps draft email responses.`;
    
    if (options?.tone) {
      systemPrompt += ` Use a ${options.tone} tone that matches the context.`;
    } else {
      systemPrompt += ` Use a professional tone that matches the context of the conversation.`;
    }
    
    systemPrompt += ` Your response should address the points raised in the original email and maintain appropriate formality.`;
    
    if (options?.suggestSubject) {
      systemPrompt += ` Also suggest an appropriate subject line for the response.`;
    }

    // Generate response using OpenAI
    const aiResponse = await executeAIRequest(
      async () => {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `Please draft a response to the following email:
              
Email Subject: ${email.subject}

Original Email:
${processEmailText(email.bodyText || email.body)}

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ""}
${similarEmailsContext ? `${similarEmailsContext}\n\n` : ""}

Draft a concise, professional email response addressing all the key points.${options?.suggestSubject ? ' Also suggest an appropriate subject line.' : ''}`
            }
          ],
          temperature: 0.7,
          max_tokens: MAX_TOKENS,
        });
        
        return completion;
      },
      cacheKey
    );

    const responseContent = aiResponse.choices[0].message.content || '';
    
    // Parse the response to extract parts if needed
    let response = responseContent;
    let suggestedSubject = undefined;
    
    // If we're expecting a subject line suggestion, try to parse it
    if (options?.suggestSubject) {
      const subjectMatch = responseContent.match(/Subject:(.+)(?:\n|$)/i);
      if (subjectMatch) {
        suggestedSubject = subjectMatch[1].trim();
        // Remove the subject line from the response
        response = responseContent.replace(/Subject:(.+)(?:\n|$)/i, '').trim();
      }
    }

    return {
      success: true,
      data: {
        response,
        suggestedSubject,
        tone: options?.tone,
      },
      usage: aiResponse.usage
    };
  } catch (error) {
    logger.error("Error generating email response:", { error, emailId });
    
    // Try with fallback model if main model failed
    if (model !== FALLBACK_MODEL) {
      try {
        logger.info(`Retrying with fallback model ${FALLBACK_MODEL}`);
        return generateEmailResponse(emailId, userId, { 
          ...options,
          model: FALLBACK_MODEL
        });
      } catch (fallbackError) {
        logger.error("Error with fallback model:", { error: fallbackError });
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Summarize an email thread with key points and action items
 */
export async function summarizeEmailThread(
  threadId: string,
  options?: {
    model?: AIModel;
    extractActionItems?: boolean;
    includeParticipants?: boolean;
    includeTimeline?: boolean;
  }
): Promise<AIResponse<ThreadSummaryData>> {
  const model = options?.model || DEFAULT_MODEL;
  const cacheKey = `thread_summary:${threadId}:${JSON.stringify(options)}`;
  
  try {
    // Get thread details
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        emails: {
          orderBy: { sentAt: "asc" },
        },
      },
    });

    if (!thread || !thread.emails || thread.emails.length === 0) {
      return { success: false, error: "Thread not found or empty" };
    }

    // Prepare conversation context
    const conversationContext = extractThreadContent(thread.emails);

    // Format the system prompt based on options
    let systemPrompt = `You are an AI assistant that summarizes email threads. Provide a concise summary highlighting the key points, requests, and conclusions from the conversation.`;
    
    if (options?.extractActionItems) {
      systemPrompt += ` Identify and list all action items or tasks mentioned in the thread.`;
    }
    
    if (options?.includeParticipants) {
      systemPrompt += ` List all participants and their roles in the conversation.`;
    }
    
    if (options?.includeTimeline) {
      systemPrompt += ` Provide a timeline of the conversation including start and end dates and duration.`;
    }

    // Generate summary using OpenAI
    const aiResponse = await executeAIRequest(
      async () => {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `Please summarize the following email thread:
              
Thread Subject: ${thread.subject}

${conversationContext}

Format your response as follows:
1. A concise summary (2-3 paragraphs)
2. Key points as a bullet list
${options?.extractActionItems ? '3. Action items as a separate bullet list\n' : ''}${options?.includeParticipants ? '4. List of participants and their roles\n' : ''}${options?.includeTimeline ? '5. Timeline including start, end, and duration\n' : ''}`
            }
          ],
          temperature: 0.5,
          max_tokens: MAX_TOKENS,
          response_format: { type: "text" },
        });
        
        return completion;
      },
      cacheKey
    );

    const responseContent = aiResponse.choices[0].message.content || '';
    
    // Basic parsing
    const keyPointsMatch = responseContent.match(/Key Points?:?\s*(?:\n|$)([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    const actionItemsMatch = responseContent.match(/Action Items?:?\s*(?:\n|$)([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    const participantsMatch = responseContent.match(/Participants?:?\s*(?:\n|$)([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    const timelineMatch = responseContent.match(/Timeline:?\s*(?:\n|$)([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    
    // Extract summary (everything before key points)
    const summaryPart = responseContent.split(/Key Points?:?\s*(?:\n|$)/i)[0].trim();
    
    // Extract lists items
    const extractListItems = (text?: string): string[] => {
      if (!text) return [];
      
      return text
        .split('\n')
        .map(line => line.replace(/^[•\-*]\s*/, '').trim()) // Remove bullets
        .filter(line => line.length > 0);
    };
    
    const keyPoints = extractListItems(keyPointsMatch?.[1]);
    const actionItems = extractListItems(actionItemsMatch?.[1]);
    const participants = extractListItems(participantsMatch?.[1]);
    
    // Parse timeline if available
    let timeline = undefined;
    if (timelineMatch && timelineMatch[1]) {
      const timelineText = timelineMatch[1];
      const startMatch = timelineText.match(/start:?\s*([^,\n]+)/i);
      const endMatch = timelineText.match(/end:?\s*([^,\n]+)/i);
      const durationMatch = timelineText.match(/duration:?\s*([^,\n]+)/i);
      
      if (startMatch || endMatch) {
        timeline = {
          startDate: startMatch?.[1]?.trim() || 'Unknown',
          endDate: endMatch?.[1]?.trim() || 'Unknown',
          duration: durationMatch?.[1]?.trim() || 'Unknown'
        };
      }
    }

    return {
      success: true,
      data: {
        summary: summaryPart,
        keyPoints,
        ...(actionItems.length > 0 && { actionItems }),
        ...(participants.length > 0 && { participants }),
        ...(timeline && { timeline })
      },
      usage: aiResponse.usage
    };
  } catch (error) {
    logger.error("Error summarizing email thread:", { error, threadId });
    
    // Try with fallback model if main model failed
    if (model !== FALLBACK_MODEL) {
      try {
        logger.info(`Retrying with fallback model ${FALLBACK_MODEL}`);
        return summarizeEmailThread(threadId, { 
          ...options,
          model: FALLBACK_MODEL
        });
      } catch (fallbackError) {
        logger.error("Error with fallback model:", { error: fallbackError });
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Generate an email template based on purpose and requirements
 */
export async function generateEmailTemplate(
  purpose: string,
  targetAudience: string,
  keyPoints: string[],
  options?: {
    model?: AIModel;
    tone?: 'professional' | 'friendly' | 'formal' | 'casual';
    length?: 'short' | 'medium' | 'long';
    includeSubject?: boolean;
  }
): Promise<AIResponse<EmailTemplateData>> {
  const model = options?.model || DEFAULT_MODEL;
  const cacheKey = `email_template:${purpose}:${targetAudience}:${keyPoints.join(',')}:${JSON.stringify(options)}`;
  
  try {
    // Generate template using OpenAI
    const aiResponse = await executeAIRequest(
      async () => {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: `You are an AI assistant that creates professional email templates. Generate well-structured, engaging email templates that are effective for the specified purpose and audience.
              ${options?.tone ? `Use a ${options.tone} tone.` : ''}
              ${options?.length ? `Create a ${options.length} email.` : ''}
              The template should include HTML formatting for the HTML version, and a plain text version as well.
              ${options?.includeSubject ? 'Include a compelling subject line.' : ''}
              Format your response with clear sections for HTML, plain text, and subject.`
            },
            {
              role: "user",
              content: `Please create an email template with the following details:
              
Purpose: ${purpose}
Target Audience: ${targetAudience}
Key Points to Include:
${keyPoints.map(point => `- ${point}`).join("\n")}

Your response should include:
1. A compelling subject line
2. HTML version with proper formatting
3. Plain text version for email clients that don't support HTML

Use appropriate headers, formatting, and structure for maximum impact.`
            }
          ],
          temperature: 0.7,
          max_tokens: MAX_TOKENS,
        });
        
        return completion;
      },
      cacheKey
    );

    const responseContent = aiResponse.choices[0].message.content || "";
    
    // Parse the response to extract HTML, text, and subject
    const htmlMatch = responseContent.match(/```(?:html)?\n([\s\S]*?)\n```/i);
    const textMatch = responseContent.match(/```(?:text|plain(?:\s*text)?)\n([\s\S]*?)\n```/i);
    const subjectMatch = responseContent.match(/(?:subject|subject line):\s*([^\n]+)/i);
    
    // Extract or provide default content
    const html = htmlMatch?.[1] || extractDefaultHTML(responseContent);
    const text = textMatch?.[1] || extractDefaultText(responseContent);
    const subject = subjectMatch?.[1] || "Email Template";

    return {
      success: true,
      data: {
        html,
        text,
        subject,
        fullResponse: responseContent
      },
      usage: aiResponse.usage
    };
  } catch (error) {
    logger.error("Error generating email template:", { error, purpose });
    
    // Try with fallback model if main model failed
    if (model !== FALLBACK_MODEL) {
      try {
        logger.info(`Retrying with fallback model ${FALLBACK_MODEL}`);
        return generateEmailTemplate(
          purpose, 
          targetAudience, 
          keyPoints, 
          { 
            ...options,
            model: FALLBACK_MODEL
          }
        );
      } catch (fallbackError) {
        logger.error("Error with fallback model:", { error: fallbackError });
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Analyze email communication with a contact
 */
export async function analyzeContactCommunication(
  contactId: string, 
  userId: string,
  options?: {
    model?: AIModel;
    timeframe?: 'all' | 'last_month' | 'last_quarter' | 'last_year';
    maxEmails?: number;
  }
): Promise<AIResponse<CommunicationAnalysisData>> {
  const model = options?.model || DEFAULT_MODEL;
  const maxEmails = options?.maxEmails || 20;
  const cacheKey = `contact_analysis:${contactId}:${userId}:${JSON.stringify(options)}`;
  
  try {
    // Build time range filter if needed
    let dateFilter = {};
    const now = new Date();
    
    if (options?.timeframe === 'last_month') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      dateFilter = { sentAt: { gte: lastMonth } };
    } else if (options?.timeframe === 'last_quarter') {
      const lastQuarter = new Date(now);
      lastQuarter.setMonth(now.getMonth() - 3);
      dateFilter = { sentAt: { gte: lastQuarter } };
    } else if (options?.timeframe === 'last_year') {
      const lastYear = new Date(now);
      lastYear.setFullYear(now.getFullYear() - 1);
      dateFilter = { sentAt: { gte: lastYear } };
    }
    
    // Get all emails with this contact
    const emails = await prisma.email.findMany({
      where: {
        userId,
        contactId,
        ...dateFilter
      },
      orderBy: {
        sentAt: "desc",
      },
      take: maxEmails,
    });

    if (emails.length === 0) {
      return {
        success: true,
        data: {
          analysis: "No email communication history found with this contact.",
          frequency: "None",
          topics: [],
          sentiment: "neutral",
          suggestions: ["Initiate contact"]
        }
      };
    }

    // Prepare email content (limit to specified max emails)
    const emailContent = extractThreadContent(emails, maxEmails);

    // Generate analysis using OpenAI
    const aiResponse = await executeAIRequest(
      async () => {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: `You are an AI assistant that analyzes email communication patterns. You provide insights on communication frequency, response times, topics discussed, sentiment, and suggestions for improving communication. Format your analysis into clear sections.`
            },
            {
              role: "user",
              content: `Please analyze the following email communication history with a contact:
              
${emailContent}

Provide your analysis in the following format:
1. Overall Analysis: A paragraph summarizing the communication relationship
2. Communication Frequency: How often emails are exchanged
3. Common Topics: A bullet list of recurring themes or topics
4. Communication Sentiment: Whether the overall tone is positive, neutral, or negative
5. Response Time: Typical time between messages
6. Suggestions: Bullet list of actionable recommendations to improve communication`
            }
          ],
          temperature: 0.5,
          max_tokens: MAX_TOKENS,
          response_format: { type: "text" },
        });
        
        return completion;
      },
      cacheKey
    );

    const responseContent = aiResponse.choices[0].message.content || '';
    
    // Parse the sections from the response
    const analysisMatch = responseContent.match(/(?:Overall\s*Analysis|Summary):\s*(.+?)(?:\n\n|\n[0-9]|$)/is);
    const frequencyMatch = responseContent.match(/(?:Communication\s*)?Frequency:\s*(.+?)(?:\n\n|\n[0-9]|$)/is);
    const topicsMatch = responseContent.match(/(?:Common\s*)?Topics:\s*(?:\n|$)([\s\S]*?)(?:\n\n|\n[0-9]|$)/is);
    const sentimentMatch = responseContent.match(/(?:Communication\s*)?Sentiment:\s*(.+?)(?:\n\n|\n[0-9]|$)/is);
    const responseTimeMatch = responseContent.match(/(?:Response\s*Time):\s*(.+?)(?:\n\n|\n[0-9]|$)/is);
    const suggestionsMatch = responseContent.match(/Suggestions:\s*(?:\n|$)([\s\S]*?)(?:\n\n|\n[0-9]|$|$)/is);
    
    // Extract topics and suggestions as arrays
    const extractListItems = (text?: string): string[] => {
      if (!text) return [];
      
      return text
        .split('\n')
        .map(line => line.replace(/^[•\-*]\s*/, '').trim()) // Remove bullets
        .filter(line => line.length > 0);
    };
    
    const topics = extractListItems(topicsMatch?.[1]);
    const suggestions = extractListItems(suggestionsMatch?.[1]);
    
    // Determine sentiment
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (sentimentMatch && sentimentMatch[1]) {
      const sentimentText = sentimentMatch[1].toLowerCase();
      if (sentimentText.includes('positive')) {
        sentiment = 'positive';
      } else if (sentimentText.includes('negative')) {
        sentiment = 'negative';
      }
    }

    return {
      success: true,
      data: {
        analysis: analysisMatch?.[1]?.trim() || responseContent,
        frequency: frequencyMatch?.[1]?.trim() || "Unknown",
        topics: topics.length > 0 ? topics : ["Unknown"],
        sentiment,
        suggestions: suggestions.length > 0 ? suggestions : ["Maintain regular communication"],
        responseTime: responseTimeMatch?.[1]?.trim()
      },
      usage: aiResponse.usage
    };
  } catch (error) {
    logger.error("Error analyzing contact communication:", { error, contactId });
    
    // Try with fallback model if main model failed
    if (model !== FALLBACK_MODEL) {
      try {
        logger.info(`Retrying with fallback model ${FALLBACK_MODEL}`);
        return analyzeContactCommunication(contactId, userId, { 
          ...options,
          model: FALLBACK_MODEL
        });
      } catch (fallbackError) {
        logger.error("Error with fallback model:", { error: fallbackError });
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Analyze the sentiment of an email
 */
export async function analyzeSentiment(
  emailId: string,
  options?: {
    model?: AIModel;
  }
): Promise<AIResponse<SentimentAnalysisData>> {
  const model = options?.model || DEFAULT_MODEL;
  const cacheKey = `sentiment_analysis:${emailId}`;
  
  try {
    // Get email details
    const email = await prisma.email.findUnique({
      where: { id: emailId }
    });

    if (!email) {
      return { success: false, error: "Email not found" };
    }

    // Prepare email content
    const emailContent = processEmailText(email.bodyText || stripHtml(email.body));

    // Generate sentiment analysis using OpenAI
    const aiResponse = await executeAIRequest(
      async () => {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: `You are an AI assistant that analyzes the sentiment of emails. You provide a detailed breakdown of the sentiment, including positive, neutral, and negative aspects, as well as key phrases that indicate the sentiment. Output should be in JSON format.`
            },
            {
              role: "user",
              content: `Analyze the sentiment of the following email:
              
Subject: ${email.subject}

${emailContent}

Return your analysis in this exact JSON format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": [number between -1 and 1],
  "breakdown": {
    "positive": [percentage as decimal],
    "neutral": [percentage as decimal],
    "negative": [percentage as decimal]
  },
  "keyPhrases": [array of key phrases that indicate the sentiment]
}
`
            }
          ],
          temperature: 0.3,
          max_tokens: MAX_TOKENS,
          response_format: { type: "json_object" },
        });
        
        return completion;
      },
      cacheKey
    );

    const responseContent = aiResponse.choices[0].message.content || '{}';
    
    try {
      // Parse JSON response
      const result = JSON.parse(responseContent);
      
      // Validate and provide defaults for missing fields
      const data: SentimentAnalysisData = {
        sentiment: result.sentiment || "neutral",
        score: result.score || 0,
        breakdown: result.breakdown || { positive: 0, neutral: 1, negative: 0 },
        keyPhrases: result.keyPhrases || []
      };
      
      return {
        success: true,
        data,
        usage: aiResponse.usage
      };
    } catch (parseError) {
      logger.error("Error parsing sentiment analysis JSON:", { parseError, responseContent });
      
      // Return a basic result if parsing fails
      return {
        success: true,
        data: {
          sentiment: 'neutral',
          score: 0,
          breakdown: { positive: 0.33, neutral: 0.34, negative: 0.33 },
          keyPhrases: []
        },
        error: "Error parsing AI response"
      };
    }
  } catch (error) {
    logger.error("Error analyzing sentiment:", { error, emailId });
    
    // Try with fallback model if main model failed
    if (model !== FALLBACK_MODEL) {
      try {
        logger.info(`Retrying with fallback model ${FALLBACK_MODEL}`);
        return analyzeSentiment(emailId, { 
          model: FALLBACK_MODEL
        });
      } catch (fallbackError) {
        logger.error("Error with fallback model:", { error: fallbackError });
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Extract action items from an email
 */
export async function extractActionItems(
  emailId: string,
  options?: {
    model?: AIModel;
    includeAssignees?: boolean;
    includeDueDates?: boolean;
  }
): Promise<AIResponse<ExtractedActionItemsData>> {
  const model = options?.model || DEFAULT_MODEL;
  const cacheKey = `action_items:${emailId}:${JSON.stringify(options)}`;
  
  try {
    // Get email details
    const email = await prisma.email.findUnique({
      where: { id: emailId }
    });

    if (!email) {
      return { success: false, error: "Email not found" };
    }

    // Prepare email content
    const emailContent = processEmailText(email.bodyText || stripHtml(email.body));

    // System prompt based on options
    let systemPrompt = `You are an AI assistant that extracts action items and tasks from emails.`;
    
    if (options?.includeAssignees) {
      systemPrompt += ` Identify who is assigned to each task if specified.`;
    }
    
    if (options?.includeDueDates) {
      systemPrompt += ` Extract any due dates or deadlines mentioned.`;
    }
    
    systemPrompt += ` Output should be in JSON format.`;

    // Generate action items using OpenAI
    const aiResponse = await executeAIRequest(
      async () => {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `Extract all action items, tasks, or to-dos from the following email:
              
Subject: ${email.subject}

${emailContent}

Return your analysis in this exact JSON format:
{
  "actionItems": [
    {
      "item": "Description of the action item or task",
      ${options?.includeAssignees ? `"assignee": "Person assigned to the task (or null if not specified)",` : ''}
      ${options?.includeDueDates ? `"dueDate": "Due date if specified (or null if not specified)",` : ''}
      "priority": "high" | "medium" | "low"
    }
  ],
  "total": number of action items found
}

If no action items are found, return an empty array for actionItems and 0 for total.
`
            }
          ],
          temperature: 0.3,
          max_tokens: MAX_TOKENS,
          response_format: { type: "json_object" },
        });
        
        return completion;
      },
      cacheKey
    );

    const responseContent = aiResponse.choices[0].message.content || '{"actionItems":[],"total":0}';
    
    try {
      // Parse JSON response
      const result = JSON.parse(responseContent);
      
      // Validate and provide defaults
      const actionItems = Array.isArray(result.actionItems) ? result.actionItems : [];
      const total = typeof result.total === 'number' ? result.total : actionItems.length;
      
      return {
        success: true,
        data: {
          actionItems,
          total
        },
        usage: aiResponse.usage
      };
    } catch (parseError) {
      logger.error("Error parsing action items JSON:", { parseError, responseContent });
      
      return {
        success: true,
        data: {
          actionItems: [],
          total: 0
        },
        error: "Error parsing AI response"
      };
    }
  } catch (error) {
    logger.error("Error extracting action items:", { error, emailId });
    
    // Try with fallback model if main model failed
    if (model !== FALLBACK_MODEL) {
      try {
        logger.info(`Retrying with fallback model ${FALLBACK_MODEL}`);
        return extractActionItems(emailId, { 
          ...options,
          model: FALLBACK_MODEL
        });
      } catch (fallbackError) {
        logger.error("Error with fallback model:", { error: fallbackError });
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Generate meeting minutes from an email thread
 */
export async function generateMeetingMinutes(
  threadId: string,
  options?: {
    model?: AIModel;
    includeAttendees?: boolean;
    includeActionItems?: boolean;
    includeDecisions?: boolean;
    format?: 'markdown' | 'text' | 'html';
  }
): Promise<AIResponse<MeetingMinutesData>> {
  const model = options?.model || DEFAULT_MODEL;
  const format = options?.format || 'markdown';
  const cacheKey = `meeting_minutes:${threadId}:${JSON.stringify(options)}`;
  
  try {
    // Get thread details
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        emails: {
          orderBy: { sentAt: "asc" },
        },
      },
    });

    if (!thread || !thread.emails || thread.emails.length === 0) {
      return { success: false, error: "Thread not found or empty" };
    }

    // Prepare conversation context
    const conversationContext = extractThreadContent(thread.emails);

    // System prompt based on options
    let systemPrompt = `You are an AI assistant that generates meeting minutes from email threads.`;
    
    if (options?.includeAttendees) {
      systemPrompt += ` Include a list of all attendees mentioned.`;
    }
    
    if (options?.includeActionItems) {
      systemPrompt += ` Extract action items and who they're assigned to.`;
    }
    
    if (options?.includeDecisions) {
      systemPrompt += ` Highlight key decisions made during the meeting.`;
    }
    
    systemPrompt += ` Format the output as ${format}.`;

    // Generate minutes using OpenAI
    const aiResponse = await executeAIRequest(
      async () => {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `Generate meeting minutes from the following email thread:
              
Meeting Subject: ${thread.subject}

${conversationContext}

Include in your minutes:
1. Meeting title and date
2. Summary of discussion
${options?.includeAttendees ? '3. List of attendees\n' : ''}${options?.includeActionItems ? '4. Action items with assignees\n' : ''}${options?.includeDecisions ? '5. Key decisions made\n' : ''}
Format the minutes in ${format} format.`
            }
          ],
          temperature: 0.5,
          max_tokens: MAX_TOKENS,
        });
        
        return completion;
      },
      cacheKey
    );

    const responseContent = aiResponse.choices[0].message.content || '';

    return {
      success: true,
      data: {
        minutes: responseContent,
        format
      },
      usage: aiResponse.usage
    };
  } catch (error) {
    logger.error("Error generating meeting minutes:", { error, threadId });
    
    // Try with fallback model if main model failed
    if (model !== FALLBACK_MODEL) {
      try {
        logger.info(`Retrying with fallback model ${FALLBACK_MODEL}`);
        return generateMeetingMinutes(threadId, { 
          ...options,
          model: FALLBACK_MODEL
        });
      } catch (fallbackError) {
        logger.error("Error with fallback model:", { error: fallbackError });
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Helper functions for parsing

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDefaultHTML(content: string): string {
  // If there's no HTML block, try to create basic HTML from the content
  // Remove any markdown code blocks first
  const cleanContent = content.replace(/```(?:html|text|plain)?([\s\S]*?)```/g, '');
  
  // Look for sections that might be the email body
  const bodyMatch = cleanContent.match(/(?:body|email content|message):([\s\S]*?)(?:\n\n\w|$)/i);
  
  if (bodyMatch && bodyMatch[1]) {
    const body = bodyMatch[1].trim();
    return `<html><body><p>${body.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p></body></html>`;
  }
  
  // If no clear body section, just use everything after any detected subject line
  const afterSubject = cleanContent.replace(/^.*?(?:subject|subject line):[^\n]*\n/i, '').trim();
  
  if (afterSubject) {
    return `<html><body><p>${afterSubject.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p></body></html>`;
  }
  
  // Fallback to the whole content
  return `<html><body><p>${cleanContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p></body></html>`;
}

function extractDefaultText(content: string): string {
  // If there's no text block, try to extract plain text
  // Remove any markdown code blocks first
  const cleanContent = content.replace(/```(?:html|text|plain)?([\s\S]*?)```/g, '');
  
  // Look for sections that might be the email body
  const bodyMatch = cleanContent.match(/(?:body|email content|message):([\s\S]*?)(?:\n\n\w|$)/i);
  
  if (bodyMatch && bodyMatch[1]) {
    return bodyMatch[1].trim();
  }
  
  // If no clear body section, just use everything after any detected subject line
  const afterSubject = cleanContent.replace(/^.*?(?:subject|subject line):[^\n]*\n/i, '').trim();
  
  if (afterSubject) {
    return afterSubject;
  }
  
  // Fallback to the whole content with HTML stripped
  return stripHtml(cleanContent);
}

export default {
  generateEmailResponse,
  summarizeEmailThread,
  generateEmailTemplate,
  analyzeContactCommunication,
  analyzeSentiment,
  extractActionItems,
  generateMeetingMinutes
};