import {
  SESClient,
  SendEmailCommand,
  SendRawEmailCommand,
  SendBulkEmailCommand,
  SESServiceException,
  SendBulkTemplatedEmailCommandInput,
  SendTemplatedEmailCommand,
  SESClientConfig,
  CreateTemplateCommand,
  DeleteTemplateCommand,
  UpdateTemplateCommand,
  GetTemplateCommand,
} from '@aws-sdk/client-ses';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import nodemailer from 'nodemailer';
import { Attachment } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import pLimit from 'p-limit';
import { v4 as uuidv4 } from 'uuid';

// Import ChromaDB functions
import { createEmailEmbedding, stripHtml, COLLECTIONS, deleteDocuments } from '@/lib/db/chromadb';

// Types for better type safety
export interface EmailPayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  userId: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  contactId?: string;
  metadata?: Record<string, unknown>;
  useSesDirectly?: boolean;
  priority?: 'high' | 'normal' | 'low';
  scheduledSendTime?: Date;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
  disposition?: 'attachment' | 'inline';
  cid?: string;
}

export interface BulkEmailPayload {
  recipients: EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  userId: string;
  templateId?: string;
  templateName?: string;
  defaultTemplateData?: Record<string, unknown>;
  attachments?: EmailAttachment[];
  trackingEnabled?: boolean;
  useSesDirectly?: boolean;
  scheduledSendTime?: Date;
  sendingSpeed?: 'normal' | 'throttled' | 'maximum';
}

export interface EmailRecipient {
  to: string[];
  cc?: string[];
  bcc?: string[];
  contactId?: string;
  substitutionData?: Record<string, string>;
  templateData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  emailId?: string;
  error?: unknown;
  sesResponse?: unknown;
  sesError?: SESServiceException;
  trackingId?: string;
}

export interface BulkEmailResult {
  success: boolean;
  results?: EmailResult[];
  successCount?: number;
  failureCount?: number;
  error?: unknown;
  campaignId?: string;
  message?: string;
}

export interface TemplateResult {
  success: boolean;
  templateName?: string;
  template?: unknown;
  error?: unknown;
  sesError?: SESServiceException;
}

// Environment validation
const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'EMAIL_FROM',
  'S3_BUCKET_NAME',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  logger.error(`Missing AWS environment variables: ${missingEnvVars.join(', ')}`);
}

// Initialize AWS clients
const sesConfig: SESClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const sesClient = new SESClient(sesConfig);

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Create a nodemailer transporter using AWS SES
const transporter = nodemailer.createTransport({
  SES: { ses: sesClient, aws: { SendRawEmailCommand } },
});

// Validate email addresses
export function validateEmails(emails: string[]): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emails.every(email => emailRegex.test(email));
}

// Store attachment in S3
export async function storeAttachment(
  userId: string,
  messageId: string,
  attachment: EmailAttachment
): Promise<string> {
  try {
    const cleanMessageId = messageId.replace(/[<>]/g, '');
    const key = `emails/${userId}/${cleanMessageId}/${attachment.filename}`;

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME || 'email-attachments',
      Key: key,
      Body: attachment.content,
      ContentType: attachment.contentType,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    return key;
  } catch (error) {
    logger.error('Failed to store attachment:', error);
    throw new Error(`Failed to store attachment: ${error.message}`);
  }
}

// Generate a presigned URL for attachment download
export async function getAttachmentUrl(
  attachmentId: string,
  expirationSeconds = 3600
): Promise<string> {
  try {
    // Get attachment from database
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new Error(`Attachment with ID ${attachmentId} not found`);
    }

    // Create a presigned URL
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'email-attachments',
      Key: attachment.path,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: expirationSeconds });

    return url;
  } catch (error) {
    logger.error('Error generating attachment URL', { attachmentId, error });
    throw new Error(`Failed to generate attachment URL: ${error.message}`);
  }
}

// Load email template
export async function loadTemplate(
  templateId: string,
  substitutionData?: Record<string, string>
): Promise<{ html: string; text: string; subject: string }> {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    let html = template.html;
    let text = template.text || '';
    let subject = template.subject || '';

    // Apply substitution data if provided
    if (substitutionData) {
      Object.entries(substitutionData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value);
        text = text.replace(regex, value);
        subject = subject.replace(regex, value);
      });
    }

    return { html, text, subject };
  } catch (error) {
    logger.error('Error loading template:', { templateId, error });
    throw new Error(`Failed to load template: ${error.message}`);
  }
}

// Add tracking pixels and link tracking
export function addTracking(html: string, emailId: string): string {
  try {
    // Add tracking pixel
    const trackingPixel = `<img src="${process.env.APP_URL}/api/track/email/open/${emailId}" width="1" height="1" alt="" style="display:none;" />`;

    // Add link tracking
    const trackedHtml = html.replace(
      /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi,
      (match, quote, url) => {
        // Skip tracking for specific link types
        if (
          url.startsWith('#') ||
          url.startsWith('mailto:') ||
          url.startsWith('tel:') ||
          url.startsWith('sms:') ||
          url.includes('/api/track/email/')
        ) {
          return match;
        }

        try {
          const encodedUrl = encodeURIComponent(url);
          return `<a href="${process.env.APP_URL}/api/track/email/click/${emailId}?url=${encodedUrl}"`;
        } catch (e) {
          // If encoding fails, return the original link
          logger.warn('Failed to encode URL for tracking', { url, emailId, error: e });
          return match;
        }
      }
    );

    // Add tracking pixel at the end of the email body (right before closing body tag)
    if (trackedHtml.includes('</body>')) {
      return trackedHtml.replace('</body>', `${trackingPixel}</body>`);
    } else {
      return trackedHtml + trackingPixel;
    }
  } catch (error) {
    logger.error('Error adding tracking to email', { emailId, error });
    // Return original HTML if tracking addition fails
    return html;
  }
}

// Get contact data for template substitution
export async function getContactData(contactId: string): Promise<Record<string, string>> {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return {};
    }

    // Create a flat object with all contact fields
    const contactData: Record<string, string> = {};

    // Add basic fields
    if (contact.firstName) contactData['firstName'] = contact.firstName;
    if (contact.lastName) contactData['lastName'] = contact.lastName;
    if (contact.email) contactData['email'] = contact.email;
    if (contact.phone) contactData['phone'] = contact.phone;
    if (contact.company) contactData['company'] = contact.company;
    if (contact.title) contactData['title'] = contact.title;

    // Add full name
    if (contact.firstName && contact.lastName) {
      contactData['fullName'] = `${contact.firstName} ${contact.lastName}`;
    } else if (contact.firstName) {
      contactData['fullName'] = contact.firstName;
    } else if (contact.lastName) {
      contactData['fullName'] = contact.lastName;
    }

    // Add any custom fields
    if (contact.customFields && typeof contact.customFields === 'object') {
      Object.entries(contact.customFields as Record<string, unknown>).forEach(([key, value]) => {
        if (typeof value === 'string') {
          contactData[key] = value;
        } else if (value !== null && value !== undefined) {
          contactData[key] = String(value);
        }
      });
    }

    return contactData;
  } catch (error) {
    logger.error('Error fetching contact data', { contactId, error });
    return {};
  }
}

// Send email using AWS SES SDK directly
export async function sendEmailWithSes(payload: EmailPayload): Promise<EmailResult> {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'contact@workspax.com';

    // Configure the SendEmailCommand parameters
    const params = {
      Source: fromEmail,
      Destination: {
        ToAddresses: payload.to,
        ...(payload.cc && payload.cc.length > 0 ? { CcAddresses: payload.cc } : {}),
        ...(payload.bcc && payload.bcc.length > 0 ? { BccAddresses: payload.bcc } : {}),
      },
      Message: {
        Subject: {
          Data: payload.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: payload.html,
            Charset: 'UTF-8',
          },
          ...(payload.text
            ? {
                Text: {
                  Data: payload.text,
                  Charset: 'UTF-8',
                },
              }
            : {}),
        },
      },
      ConfigurationSetName: process.env.SES_CONFIGURATION_SET,
      Tags: [
        { Name: 'UserId', Value: payload.userId },
        ...(payload.contactId ? [{ Name: 'ContactId', Value: payload.contactId }] : []),
        ...(payload.templateId ? [{ Name: 'TemplateId', Value: payload.templateId }] : []),
      ],
    };

    // If using a template, use SendTemplatedEmailCommand instead
    if (payload.templateId && payload.templateData) {
      // Look up the template in the database to get the SES template name
      const dbTemplate = await prisma.emailTemplate.findUnique({
        where: { id: payload.templateId },
      });

      if (!dbTemplate || !dbTemplate.sesTemplateName) {
        throw new Error(
          `Template with ID ${payload.templateId} not found or has no SES template name`
        );
      }

      const templateCommand = new SendTemplatedEmailCommand({
        Source: fromEmail,
        Destination: {
          ToAddresses: payload.to,
          ...(payload.cc && payload.cc.length > 0 ? { CcAddresses: payload.cc } : {}),
          ...(payload.bcc && payload.bcc.length > 0 ? { BccAddresses: payload.bcc } : {}),
        },
        Template: dbTemplate.sesTemplateName,
        TemplateData: JSON.stringify(payload.templateData),
        ConfigurationSetName: process.env.SES_CONFIGURATION_SET,
        Tags: [
          { Name: 'UserId', Value: payload.userId },
          ...(payload.contactId ? [{ Name: 'ContactId', Value: payload.contactId }] : []),
          { Name: 'TemplateId', Value: payload.templateId },
        ],
      });

      const response = await sesClient.send(templateCommand);
      return {
        success: true,
        messageId: response.MessageId,
        sesResponse: response,
      };
    }

    // Send the email using the SES client
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    logger.info('Email sent successfully using SES SDK', {
      messageId: response.MessageId,
      to: payload.to,
      subject: payload.subject,
    });

    return {
      success: true,
      messageId: response.MessageId,
      sesResponse: response,
    };
  } catch (error) {
    // Handle SES-specific exceptions with typed error handling
    if (error instanceof SESServiceException) {
      logger.error('SES Service Exception:', {
        code: error.name,
        message: error.message,
        statusCode: error.$metadata.httpStatusCode,
        requestId: error.$metadata.requestId,
      });

      // Implement specific handling based on error code
      switch (error.name) {
        case 'MessageRejected':
          return { success: false, error: 'Email was rejected by AWS SES', sesError: error };
        case 'MailFromDomainNotVerified':
          return { success: false, error: 'Sender domain not verified', sesError: error };
        case 'LimitExceeded':
          // Implement retry with backoff or queue for later
          return { success: false, error: 'SES sending limit exceeded', sesError: error };
        default:
          return { success: false, error: error.message, sesError: error };
      }
    }

    // Handle generic errors
    logger.error('Error sending email with SES:', { error });
    return { success: false, error: error.message };
  }
}

// Send bulk emails using AWS SES Bulk API directly
export async function sendBulkEmailWithSes(payload: BulkEmailPayload): Promise<BulkEmailResult> {
  try {
    if (!payload.recipients || payload.recipients.length === 0) {
      throw new Error('At least one recipient is required');
    }

    if (
      (!payload.templateName && !payload.templateId) ||
      (!payload.html && !payload.templateName && !payload.templateId)
    ) {
      throw new Error('Either template or HTML content is required');
    }

    const fromEmail = process.env.EMAIL_FROM || 'contact@workspax.com';
    const campaignStartTime = Date.now();

    // Create a campaign record
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: `SES Bulk Campaign: ${payload.subject}`,
        subject: payload.subject,
        body: payload.html || 'Template-based email',
        bodyText: payload.text,
        status: 'IN_PROGRESS',
        recipientCount: payload.recipients.length,
        userId: payload.userId,
        templateId: payload.templateId,
        metadata: {
          startedAt: new Date(campaignStartTime).toISOString(),
          usingSesDirectly: true,
          ...(payload.templateName ? { sesTemplateName: payload.templateName } : {}),
        },
      },
    });

    // If using a template from our database, get the SES template name
    let sesTemplateName = payload.templateName;
    if (payload.templateId && !sesTemplateName) {
      const dbTemplate = await prisma.emailTemplate.findUnique({
        where: { id: payload.templateId },
      });

      if (!dbTemplate || !dbTemplate.sesTemplateName) {
        throw new Error(
          `Template with ID ${payload.templateId} not found or has no SES template name`
        );
      }

      sesTemplateName = dbTemplate.sesTemplateName;
    }

    // Prepare the bulk email command input
    const bulkEmailInput: SendBulkTemplatedEmailCommandInput = {
      Source: fromEmail,
      Template: sesTemplateName,
      DefaultTemplateData: JSON.stringify(payload.defaultTemplateData || {}),
      ConfigurationSetName: process.env.SES_CONFIGURATION_SET,
      Destinations: [],
    };

    // Process recipients
    for (const recipient of payload.recipients) {
      // Prepare template data
      let templateData = recipient.templateData || {};

      // If there's a contact ID, merge contact data into template data
      if (recipient.contactId) {
        try {
          const contactData = await getContactData(recipient.contactId);
          templateData = { ...contactData, ...templateData };
        } catch (error) {
          logger.warn('Failed to get contact data for template', {
            contactId: recipient.contactId,
            error,
          });
        }
      }

      // Add to destinations
      bulkEmailInput.Destinations.push({
        Destination: {
          ToAddresses: recipient.to,
          ...(recipient.cc && recipient.cc.length > 0 ? { CcAddresses: recipient.cc } : {}),
          ...(recipient.bcc && recipient.bcc.length > 0 ? { BccAddresses: recipient.bcc } : {}),
        },
        ReplacementTemplateData: JSON.stringify(templateData),
        // Add contact ID as message tag if available
        ...(recipient.contactId
          ? {
              ReplacementTags: [{ Name: 'ContactId', Value: recipient.contactId }],
            }
          : {}),
      });
    }

    // Process in batches of 50 (AWS SES limit)
    const batchSize = 50;
    const results: EmailResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Track which recipients to batch email
    for (let i = 0; i < bulkEmailInput.Destinations.length; i += batchSize) {
      const batchDestinations = bulkEmailInput.Destinations.slice(i, i + batchSize);

      try {
        const batchInput = {
          ...bulkEmailInput,
          Destinations: batchDestinations,
        };

        // Send the batch
        const command = new SendBulkEmailCommand(batchInput);
        const response = await sesClient.send(command);

        // Process response
        if (response.Status && response.Status.length > 0) {
          response.Status.forEach((status, index) => {
            if (status.Status === 'Success') {
              successCount++;
              results.push({
                success: true,
                messageId: status.MessageId,
                recipientIndex: i + index,
              });
            } else {
              failureCount++;
              results.push({
                success: false,
                error: status.Error,
                recipientIndex: i + index,
              });
            }
          });
        }

        // Update campaign progress
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            successCount,
            failureCount,
            progress: Math.floor(
              ((i + batchDestinations.length) / bulkEmailInput.Destinations.length) * 100
            ),
          },
        });

        // Add a delay between batches based on sending speed
        if (i + batchSize < bulkEmailInput.Destinations.length) {
          const delayMs =
            payload.sendingSpeed === 'throttled'
              ? 2000
              : payload.sendingSpeed === 'maximum'
              ? 200
              : 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        // Handle SES-specific exceptions
        if (error instanceof SESServiceException) {
          logger.error('SES Bulk Email Exception:', {
            code: error.name,
            message: error.message,
            statusCode: error.$metadata.httpStatusCode,
            requestId: error.$metadata.requestId,
            batchStart: i,
          });

          // Implement SES rate limiting handling
          if (error.name === 'ThrottlingException' || error.name === 'LimitExceeded') {
            // Wait longer and retry this batch
            await new Promise(resolve => setTimeout(resolve, 5000));
            i -= batchSize; // Retry this batch
            continue;
          }

          // Mark all recipients in this batch as failures
          failureCount += batchDestinations.length;

          for (let j = 0; j < batchDestinations.length; j++) {
            results.push({
              success: false,
              error: `SES Error: ${error.message}`,
              recipientIndex: i + j,
              sesError: error,
            });
          }
        } else {
          logger.error('Error sending bulk email batch:', { error, batchStart: i });
          failureCount += batchDestinations.length;

          for (let j = 0; j < batchDestinations.length; j++) {
            results.push({
              success: false,
              error: error.message,
              recipientIndex: i + j,
            });
          }
        }

        // Update campaign progress even on failure
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            successCount,
            failureCount,
            progress: Math.floor(
              ((i + batchDestinations.length) / bulkEmailInput.Destinations.length) * 100
            ),
          },
        });
      }
    }

    // Update campaign with final status
    const campaignEndTime = Date.now();
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: 'COMPLETED',
        successCount,
        failureCount,
        progress: 100,
        metadata: {
          ...(campaign.metadata as Record<string, unknown>),
          completedAt: new Date(campaignEndTime).toISOString(),
          durationMs: campaignEndTime - campaignStartTime,
          resultsCount: results.length,
        },
      },
    });

    // Create email records for successful sends (for tracking in our system)
    const recipientsWithSuccess = results
      .filter(r => r.success && r.messageId)
      .map(r => {
        const recipientIndex = r.recipientIndex;
        const recipient = payload.recipients[recipientIndex];
        return {
          messageId: r.messageId,
          recipient,
        };
      });

    // Create email records in batches
    const emailRecordBatchSize = 100;
    for (let i = 0; i < recipientsWithSuccess.length; i += emailRecordBatchSize) {
      const batch = recipientsWithSuccess.slice(i, i + emailRecordBatchSize);

      // Create email records in parallel
      await Promise.all(
        batch.map(async ({ messageId, recipient }) => {
          try {
            // Create email record
            const email = await prisma.email.create({
              data: {
                subject: payload.subject,
                body: payload.html || 'Template-based email',
                bodyText: payload.text,
                fromEmail: process.env.EMAIL_FROM || 'contact@workspax.com',
                toEmails: recipient.to,
                ccEmails: recipient.cc || [],
                bccEmails: recipient.bcc || [],
                status: 'SENT',
                folder: 'SENT',
                isRead: true,
                sentAt: new Date(),
                messageId,
                userId: payload.userId,
                templateId: payload.templateId,
                ...(recipient.contactId && { contactId: recipient.contactId }),
                metadata: {
                  campaignId: campaign.id,
                  bulkSend: true,
                  usingSesDirectly: true,
                  ...(sesTemplateName ? { sesTemplateName } : {}),
                  ...(recipient.metadata || {}),
                },
              },
            });

            // Create email embedding for search
            await createEmailEmbedding(email);
          } catch (error) {
            logger.error('Error creating email record for bulk send:', { error, messageId });
            // Continue with other records
          }
        })
      );
    }

    return {
      success: true,
      results,
      successCount,
      failureCount,
      campaignId: campaign.id,
    };
  } catch (error) {
    logger.error('Error sending bulk email with SES:', error);
    return { success: false, error: error.message };
  }
}

// Send a single email
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  try {
    // Input validation
    if (!payload.to || payload.to.length === 0) {
      throw new Error('Recipient email is required');
    }

    if (!validateEmails([...payload.to, ...(payload.cc || []), ...(payload.bcc || [])])) {
      throw new Error('Invalid email address format');
    }

    if ((!payload.subject || !payload.html) && !payload.templateId) {
      throw new Error('Subject and HTML content are required (or template ID)');
    }

    // Check for scheduled sending
    if (payload.scheduledSendTime && payload.scheduledSendTime > new Date()) {
      // Store for scheduled sending
      const scheduledEmailId = await scheduleEmail(payload);
      return {
        success: true,
        emailId: scheduledEmailId,
        messageId: `scheduled_${scheduledEmailId}`,
      };
    }

    // Use direct SES API if requested
    if (payload.useSesDirectly) {
      // First send the email via SES
      const sesResult = await sendEmailWithSes(payload);

      // If successful, create a record in our database for tracking
      if (sesResult.success && sesResult.messageId) {
        const fromEmail = process.env.EMAIL_FROM || 'contact@workspax.com';

        // Create email record in database
        const email = await prisma.email.create({
          data: {
            subject: payload.subject,
            body: payload.html,
            bodyText: payload.text,
            fromEmail,
            toEmails: payload.to,
            ccEmails: payload.cc || [],
            bccEmails: payload.bcc || [],
            status: 'SENT',
            folder: 'SENT',
            isRead: true,
            sentAt: new Date(),
            messageId: sesResult.messageId,
            userId: payload.userId,
            templateId: payload.templateId,
            ...(payload.contactId && { contactId: payload.contactId }),
            metadata: {
              ...payload.metadata,
              usingSesDirectly: true,
              sesResponseMetadata: sesResult.sesResponse?.$metadata,
            },
          },
        });

        // Create email embedding for AI search
        await createEmailEmbedding(email);

        return { ...sesResult, emailId: email.id };
      }

      return sesResult;
    }

    const fromEmail = process.env.EMAIL_FROM || 'contact@workspax.com';
    let htmlContent = payload.html;
    let textContent = payload.text;
    let subjectContent = payload.subject;

    // Load template if templateId is provided
    if (payload.templateId) {
      try {
        const templateSubstitutionData = payload.contactId
          ? await getContactData(payload.contactId)
          : undefined;

        // Merge template data if provided
        const allSubstitutionData = payload.templateData
          ? { ...templateSubstitutionData, ...(payload.templateData as Record<string, string>) }
          : templateSubstitutionData;

        const template = await loadTemplate(payload.templateId, allSubstitutionData);
        htmlContent = template.html;
        textContent = template.text;

        // Use template subject if provided and not overridden
        if (template.subject && !payload.subject) {
          subjectContent = template.subject;
        }
      } catch (templateError) {
        logger.error('Failed to load template', {
          error: templateError,
          templateId: payload.templateId,
        });
        // Continue with the provided content if template loading fails
      }
    }

    // Add tracking if needed
    const trackingEnabled = process.env.EMAIL_TRACKING_ENABLED === 'true';
    const trackingId = uuidv4();

    if (trackingEnabled && htmlContent) {
      htmlContent = addTracking(htmlContent, trackingId);
    }

    // Set email priority if specified
    const headers: Record<string, string> = {};
    if (payload.priority) {
      if (payload.priority === 'high') {
        headers['X-Priority'] = '1';
        headers['X-MSMail-Priority'] = 'High';
        headers['Importance'] = 'High';
      } else if (payload.priority === 'low') {
        headers['X-Priority'] = '5';
        headers['X-MSMail-Priority'] = 'Low';
        headers['Importance'] = 'Low';
      }
    }

    // Send email using nodemailer
    const info = await transporter.sendMail({
      from: fromEmail,
      to: payload.to.join(', '),
      cc: payload.cc && payload.cc.length > 0 ? payload.cc.join(', ') : undefined,
      bcc: payload.bcc && payload.bcc.length > 0 ? payload.bcc.join(', ') : undefined,
      subject: subjectContent,
      html: htmlContent,
      text: textContent,
      attachments: payload.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
        contentDisposition: att.disposition || 'attachment',
        ...(att.cid ? { cid: att.cid } : {}),
      })),
      headers: {
        'X-SES-CONFIGURATION-SET': process.env.SES_CONFIGURATION_SET,
        ...headers,
      },
    });

    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to: payload.to,
      subject: subjectContent,
    });

    // Store attachments if present
    const attachmentData = [];
    if (payload.attachments && payload.attachments.length > 0) {
      for (const attachment of payload.attachments) {
        try {
          const storagePath = await storeAttachment(payload.userId, info.messageId, attachment);
          attachmentData.push({
            filename: attachment.filename,
            path: storagePath,
            mimeType: attachment.contentType,
            size: attachment.content.length,
            contentDisposition: attachment.disposition || 'attachment',
            ...(attachment.cid ? { contentId: attachment.cid } : {}),
          });
        } catch (attachmentError) {
          logger.error('Error storing attachment', {
            error: attachmentError,
            filename: attachment.filename,
          });
          // Continue with other attachments
        }
      }
    }

    // Create email record in database
    const email = await prisma.email.create({
      data: {
        subject: subjectContent,
        body: htmlContent,
        bodyText: textContent,
        fromEmail,
        toEmails: payload.to,
        ccEmails: payload.cc || [],
        bccEmails: payload.bcc || [],
        status: 'SENT',
        folder: 'SENT',
        isRead: true,
        sentAt: new Date(),
        messageId: info.messageId,
        userId: payload.userId,
        templateId: payload.templateId,
        ...(payload.contactId && { contactId: payload.contactId }),
        metadata: payload.metadata || {},
        // If tracking was enabled, store the tracking ID
        ...(trackingEnabled && { trackingId }),
        attachments: {
          create: attachmentData,
        },
      },
    });

    // Create email embedding for AI search
    await createEmailEmbedding(email);

    return {
      success: true,
      messageId: info.messageId,
      emailId: email.id,
      ...(trackingEnabled ? { trackingId } : {}),
    };
  } catch (error) {
    logger.error('Error sending email:', {
      error,
      to: payload.to,
      subject: payload.subject,
    });

    // Create a failed email record for tracking
    try {
      const email = await prisma.email.create({
        data: {
          subject: payload.subject,
          body: payload.html,
          bodyText: payload.text,
          fromEmail: process.env.EMAIL_FROM || 'contact@workspax.com',
          toEmails: payload.to,
          ccEmails: payload.cc || [],
          bccEmails: payload.bcc || [],
          status: 'FAILED',
          folder: 'DRAFTS',
          isRead: true,
          sentAt: new Date(),
          userId: payload.userId,
          templateId: payload.templateId,
          ...(payload.contactId && { contactId: payload.contactId }),
          errorMessage: error.message,
          metadata: {
            ...payload.metadata,
            error: error.message,
            errorStack: error.stack,
          },
        },
      });

      return { success: false, error: error.message, emailId: email.id };
    } catch (dbError) {
      logger.error('Failed to create error record', { error: dbError });
      return { success: false, error: error.message };
    }
  }
}

// Schedule an email for later sending
export async function scheduleEmail(payload: EmailPayload): Promise<string> {
  try {
    if (!payload.scheduledSendTime) {
      throw new Error('Scheduled send time is required');
    }

    // Create a scheduled email record
    const scheduledEmail = await prisma.scheduledEmail.create({
      data: {
        userId: payload.userId,
        toEmails: payload.to,
        ccEmails: payload.cc || [],
        bccEmails: payload.bcc || [],
        subject: payload.subject,
        body: payload.html,
        bodyText: payload.text,
        fromEmail: process.env.EMAIL_FROM || 'contact@workspax.com',
        scheduledSendTime: payload.scheduledSendTime,
        status: 'SCHEDULED',
        templateId: payload.templateId,
        ...(payload.contactId && { contactId: payload.contactId }),
        metadata: {
          ...payload.metadata,
          priority: payload.priority,
          useSesDirectly: payload.useSesDirectly,
        },
        // Store attachment records
        attachments: payload.attachments
          ? {
              create: payload.attachments.map(att => ({
                filename: att.filename,
                // Store attachment content as base64
                content: Buffer.from(att.content).toString('base64'),
                contentType: att.contentType,
                size: att.content.length,
                disposition: att.disposition || 'attachment',
                contentId: att.cid,
              })),
            }
          : undefined,
      },
    });

    logger.info('Email scheduled', {
      scheduledEmailId: scheduledEmail.id,
      sendTime: payload.scheduledSendTime.toISOString(),
    });

    return scheduledEmail.id;
  } catch (error) {
    logger.error('Error scheduling email', { error });
    throw error;
  }
}

// Process scheduled emails
export async function processScheduledEmails(): Promise<{
  success: boolean;
  sent: number;
  failed: number;
}> {
  try {
    // Find scheduled emails due to be sent
    const now = new Date();
    const scheduledEmails = await prisma.scheduledEmail.findMany({
      where: {
        scheduledSendTime: {
          lte: now,
        },
        status: 'SCHEDULED',
      },
      include: {
        attachments: true,
      },
    });

    if (scheduledEmails.length === 0) {
      return { success: true, sent: 0, failed: 0 };
    }

    logger.info(`Processing ${scheduledEmails.length} scheduled emails`);

    let sent = 0;
    let failed = 0;

    // Process each scheduled email
    const concurrencyLimit = parseInt(process.env.EMAIL_CONCURRENCY_LIMIT || '5', 10);
    const limit = pLimit(concurrencyLimit);

    await Promise.all(
      scheduledEmails.map(email => {
        return limit(async () => {
          try {
            // Update status to processing
            await prisma.scheduledEmail.update({
              where: { id: email.id },
              data: { status: 'PROCESSING' },
            });

            // Prepare attachment data
            const attachments = email.attachments?.map(att => ({
              filename: att.filename,
              content: Buffer.from(att.content, 'base64'),
              contentType: att.contentType,
              disposition: (att.disposition as 'attachment' | 'inline') || 'attachment',
              ...(att.contentId ? { cid: att.contentId } : {}),
            }));

            // Send the email
            const result = await sendEmail({
              to: email.toEmails,
              cc: email.ccEmails,
              bcc: email.bccEmails,
              subject: email.subject,
              html: email.body,
              text: email.bodyText,
              userId: email.userId,
              templateId: email.templateId,
              contactId: email.contactId,
              attachments,
              metadata: {
                ...(email.metadata as Record<string, unknown>),
                scheduledEmailId: email.id,
              },
              useSesDirectly: (email.metadata as Record<string, unknown>)
                ?.useSesDirectly as boolean,
              priority: (email.metadata as Record<string, unknown>)?.priority as
                | 'high'
                | 'normal'
                | 'low',
            });

            // Update scheduled email record
            await prisma.scheduledEmail.update({
              where: { id: email.id },
              data: {
                status: result.success ? 'SENT' : 'FAILED',
                sentAt: result.success ? now : undefined,
                errorMessage: result.success ? null : String(result.error),
                emailId: result.emailId,
              },
            });

            if (result.success) {
              sent++;
            } else {
              failed++;
            }

            return { id: email.id, success: result.success };
          } catch (error) {
            // Update scheduled email record with error
            await prisma.scheduledEmail.update({
              where: { id: email.id },
              data: {
                status: 'FAILED',
                errorMessage: error.message,
              },
            });

            failed++;
            logger.error('Error processing scheduled email', { scheduledEmailId: email.id, error });
            return { id: email.id, success: false, error };
          }
        });
      })
    );

    logger.info('Scheduled emails processed', { sent, failed });

    return { success: true, sent, failed };
  } catch (error) {
    logger.error('Error processing scheduled emails', { error });
    return { success: false, sent: 0, failed: 0 };
  }
}

// Send bulk emails (mass email campaign) with improved concurrency control and retry logic
export async function sendBulkEmail(payload: BulkEmailPayload): Promise<BulkEmailResult> {
  try {
    if (!payload.recipients || payload.recipients.length === 0) {
      throw new Error('At least one recipient is required');
    }

    // Use SES Bulk API directly if requested
    if (payload.useSesDirectly) {
      if (!payload.templateName && !payload.templateId) {
        throw new Error('Template name or template ID is required for SES bulk sending');
      }

      return sendBulkEmailWithSes(payload);
    }

    if (!payload.subject || !payload.html) {
      throw new Error('Subject and HTML content are required');
    }

    // Check for scheduled sending
    if (payload.scheduledSendTime && payload.scheduledSendTime > new Date()) {
      const campaignId = await scheduleBulkEmail(payload);
      return {
        success: true,
        campaignId,
        message: `Scheduled for ${payload.scheduledSendTime.toISOString()}`,
      };
    }

    const results: EmailResult[] = [];

    // Create a campaign record
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: `Campaign: ${payload.subject}`,
        subject: payload.subject,
        body: payload.html,
        bodyText: payload.text,
        status: 'IN_PROGRESS',
        recipientCount: payload.recipients.length,
        userId: payload.userId,
        templateId: payload.templateId,
        metadata: {
          startedAt: new Date().toISOString(),
        },
      },
    });

    // Set up concurrency limit (adjustable via environment)
    const concurrencyLimit = parseInt(process.env.EMAIL_CONCURRENCY_LIMIT || '10', 10);
    const limit = pLimit(concurrencyLimit);

    // Calculate batch size for AWS SES limits
    // Default SES sending rate is 14 emails/second
    const batchSize = parseInt(process.env.EMAIL_BATCH_SIZE || '50', 10);
    const batchDelay =
      payload.sendingSpeed === 'throttled' ? 2000 : payload.sendingSpeed === 'maximum' ? 200 : 1000;

    // Track progress
    let successCount = 0;
    let failureCount = 0;
    const startTime = Date.now();

    // Process in batches
    for (let i = 0; i < payload.recipients.length; i += batchSize) {
      const batch = payload.recipients.slice(i, i + batchSize);

      // Create a promise for each email in the batch
      const batchPromises = batch.map((recipient, index) => {
        return limit(async () => {
          // Add delay to prevent exact simultaneous sending
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 50 * (index % 10)));
          }

          // Apply substitution data if provided
          let processedHtml = payload.html || '';
          let processedText = payload.text;
          let processedSubject = payload.subject;

          // Get contact data if contact ID is provided
          let substitutionData = recipient.substitutionData || {};
          if (recipient.contactId) {
            try {
              const contactData = await getContactData(recipient.contactId);
              substitutionData = { ...contactData, ...substitutionData };
            } catch (error) {
              logger.warn('Failed to get contact data', { contactId: recipient.contactId, error });
              // Continue with available substitution data
            }
          }

          // Apply substitution data to subject, html and text
          if (Object.keys(substitutionData).length > 0) {
            Object.entries(substitutionData).forEach(([key, value]) => {
              if (value === undefined || value === null) return;

              const regex = new RegExp(`{{${key}}}`, 'g');
              processedHtml = processedHtml.replace(regex, value);
              if (processedText) {
                processedText = processedText.replace(regex, value);
              }
              processedSubject = processedSubject.replace(regex, value);
            });
          }

          // Send individual email with retry logic
          let retries = 0;
          const maxRetries = parseInt(process.env.EMAIL_SEND_MAX_RETRIES || '3', 10);
          let result: EmailResult;

          while (retries <= maxRetries) {
            try {
              result = await sendEmail({
                to: recipient.to,
                cc: recipient.cc || [],
                bcc: recipient.bcc || [],
                subject: processedSubject,
                html: processedHtml,
                text: processedText,
                userId: payload.userId,
                templateId: payload.templateId,
                contactId: recipient.contactId,
                attachments: payload.attachments,
                metadata: {
                  campaignId: campaign.id,
                  bulkSend: true,
                  sendAttempt: retries + 1,
                  ...(recipient.metadata || {}),
                },
              });

              if (result.success) {
                successCount++;
                break;
              } else {
                retries++;
                if (retries <= maxRetries) {
                  // Exponential backoff for retries
                  const delay = Math.pow(2, retries) * 500;
                  await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                  failureCount++;
                }
              }
            } catch (sendError) {
              logger.error('Error in bulk email send attempt', {
                attempt: retries + 1,
                error: sendError,
                recipient: recipient.to,
              });

              retries++;
              if (retries <= maxRetries) {
                const delay = Math.pow(2, retries) * 500;
                await new Promise(resolve => setTimeout(resolve, delay));
              } else {
                result = { success: false, error: sendError.message };
                failureCount++;
              }
            }
          }

          return result;
        });
      });

      try {
        // Wait for all emails in the batch to be sent
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Update campaign progress
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            successCount,
            failureCount,
            progress: Math.floor(((successCount + failureCount) / payload.recipients.length) * 100),
          },
        });

        // Add a delay between batches to prevent rate limiting
        if (i + batchSize < payload.recipients.length) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      } catch (batchError) {
        logger.error('Batch processing error', { batchIndex: i, error: batchError });
        // Continue with the next batch
      }
    }

    // Update the campaign record with final stats
    const endTime = Date.now();
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: 'COMPLETED',
        successCount,
        failureCount,
        progress: 100,
        metadata: {
          ...(campaign.metadata as Record<string, unknown>),
          startedAt: new Date(startTime).toISOString(),
          completedAt: new Date(endTime).toISOString(),
          durationMs: endTime - startTime,
        },
      },
    });

    return {
      success: true,
      results,
      successCount,
      failureCount,
      campaignId: campaign.id,
    };
  } catch (error) {
    logger.error('Error sending bulk email:', error);
    return { success: false, error: error.message };
  }
}

// Schedule a bulk email campaign for later sending
export async function scheduleBulkEmail(payload: BulkEmailPayload): Promise<string> {
  try {
    if (!payload.scheduledSendTime) {
      throw new Error('Scheduled send time is required');
    }

    // Create a scheduled campaign record
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: `Scheduled Campaign: ${payload.subject}`,
        subject: payload.subject,
        body: payload.html || '',
        bodyText: payload.text,
        status: 'SCHEDULED',
        recipientCount: payload.recipients.length,
        userId: payload.userId,
        templateId: payload.templateId,
        scheduledSendTime: payload.scheduledSendTime,
        metadata: {
          createdAt: new Date().toISOString(),
          useSesDirectly: payload.useSesDirectly,
          sendingSpeed: payload.sendingSpeed,
          templateName: payload.templateName,
          recipientsSnapshot: payload.recipients,
          defaultTemplateData: payload.defaultTemplateData,
          trackingEnabled: payload.trackingEnabled,
        },
      },
    });

    // Store attachments if present
    if (payload.attachments && payload.attachments.length > 0) {
      for (const attachment of payload.attachments) {
        await prisma.campaignAttachment.create({
          data: {
            campaignId: campaign.id,
            filename: attachment.filename,
            content: Buffer.from(attachment.content).toString('base64'),
            contentType: attachment.contentType,
            size: attachment.content.length,
            disposition: attachment.disposition || 'attachment',
            contentId: attachment.cid,
          },
        });
      }
    }

    logger.info('Bulk email campaign scheduled', {
      campaignId: campaign.id,
      sendTime: payload.scheduledSendTime.toISOString(),
      recipients: payload.recipients.length,
    });

    return campaign.id;
  } catch (error) {
    logger.error('Error scheduling bulk email campaign', { error });
    throw error;
  }
}

// Process scheduled campaigns
export async function processScheduledCampaigns(): Promise<{
  success: boolean;
  processed: number;
}> {
  try {
    // Find scheduled campaigns due to be sent
    const now = new Date();
    const scheduledCampaigns = await prisma.emailCampaign.findMany({
      where: {
        scheduledSendTime: {
          lte: now,
        },
        status: 'SCHEDULED',
      },
      include: {
        attachments: true,
      },
    });

    if (scheduledCampaigns.length === 0) {
      return { success: true, processed: 0 };
    }

    logger.info(`Processing ${scheduledCampaigns.length} scheduled campaigns`);

    let processed = 0;

    // Process each scheduled campaign sequentially
    for (const campaign of scheduledCampaigns) {
      try {
        // Update status to processing
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: { status: 'PROCESSING' },
        });

        // Get campaign metadata
        const metadata = campaign.metadata as Record<string, unknown>;
        const recipientsSnapshot = metadata.recipientsSnapshot as EmailRecipient[];

        if (!recipientsSnapshot || recipientsSnapshot.length === 0) {
          logger.error('No recipients found in campaign snapshot', { campaignId: campaign.id });

          await prisma.emailCampaign.update({
            where: { id: campaign.id },
            data: {
              status: 'FAILED',
              errorMessage: 'No recipients found in campaign snapshot',
            },
          });

          continue;
        }

        // Prepare attachment data
        const attachments = campaign.attachments?.map(att => ({
          filename: att.filename,
          content: Buffer.from(att.content, 'base64'),
          contentType: att.contentType,
          disposition: (att.disposition as 'attachment' | 'inline') || 'attachment',
          ...(att.contentId ? { cid: att.contentId } : {}),
        }));

        // Send the campaign
        const result = await sendBulkEmail({
          recipients: recipientsSnapshot,
          subject: campaign.subject,
          html: campaign.body,
          text: campaign.bodyText,
          userId: campaign.userId,
          templateId: campaign.templateId,
          templateName: metadata.templateName as string,
          defaultTemplateData: metadata.defaultTemplateData as Record<string, unknown>,
          attachments,
          trackingEnabled: metadata.trackingEnabled as boolean,
          useSesDirectly: metadata.useSesDirectly as boolean,
          sendingSpeed: metadata.sendingSpeed as 'normal' | 'throttled' | 'maximum',
        });

        // Update campaign record
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            status: result.success ? 'COMPLETED' : 'FAILED',
            errorMessage: result.success ? null : String(result.error),
            successCount: result.successCount || 0,
            failureCount: result.failureCount || 0,
            progress: 100,
            metadata: {
              ...metadata,
              originalScheduledTime: campaign.scheduledSendTime?.toISOString(),
              actualSendTime: now.toISOString(),
              scheduledCampaignProcessed: true,
            },
          },
        });

        processed++;
      } catch (error) {
        // Update campaign record with error
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message,
          },
        });

        logger.error('Error processing scheduled campaign', { campaignId: campaign.id, error });
      }
    }

    logger.info('Scheduled campaigns processed', { processed });

    return { success: true, processed };
  } catch (error) {
    logger.error('Error processing scheduled campaigns', { error });
    return { success: false, processed: 0 };
  }
}

// Manage SES templates
export async function createSesTemplate(
  templateName: string,
  subjectPart: string,
  htmlPart: string,
  textPart?: string
): Promise<TemplateResult> {
  try {
    const command = new CreateTemplateCommand({
      Template: {
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart,
        TextPart: textPart || '',
      },
    });

    await sesClient.send(command);

    logger.info('Created SES template', { templateName });

    return {
      success: true,
      templateName,
    };
  } catch (error) {
    if (error instanceof SESServiceException) {
      logger.error('SES template creation error:', {
        code: error.name,
        message: error.message,
        statusCode: error.$metadata.httpStatusCode,
      });

      return {
        success: false,
        error: `SES Error: ${error.message}`,
        sesError: error,
      };
    }

    logger.error('Error creating SES template:', { error, templateName });
    return { success: false, error: error.message };
  }
}

export async function updateSesTemplate(
  templateName: string,
  subjectPart: string,
  htmlPart: string,
  textPart?: string
): Promise<TemplateResult> {
  try {
    const command = new UpdateTemplateCommand({
      Template: {
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart,
        TextPart: textPart || '',
      },
    });

    await sesClient.send(command);

    logger.info('Updated SES template', { templateName });

    return {
      success: true,
      templateName,
    };
  } catch (error) {
    if (error instanceof SESServiceException) {
      logger.error('SES template update error:', {
        code: error.name,
        message: error.message,
        statusCode: error.$metadata.httpStatusCode,
      });

      return {
        success: false,
        error: `SES Error: ${error.message}`,
        sesError: error,
      };
    }

    logger.error('Error updating SES template:', { error, templateName });
    return { success: false, error: error.message };
  }
}

export async function deleteSesTemplate(templateName: string): Promise<TemplateResult> {
  try {
    const command = new DeleteTemplateCommand({
      TemplateName: templateName,
    });

    await sesClient.send(command);

    logger.info('Deleted SES template', { templateName });

    return { success: true };
  } catch (error) {
    if (error instanceof SESServiceException) {
      logger.error('SES template deletion error:', {
        code: error.name,
        message: error.message,
        statusCode: error.$metadata.httpStatusCode,
      });

      return {
        success: false,
        error: `SES Error: ${error.message}`,
        sesError: error,
      };
    }

    logger.error('Error deleting SES template:', { error, templateName });
    return { success: false, error: error.message };
  }
}

export async function getSesTemplate(templateName: string): Promise<TemplateResult> {
  try {
    const command = new GetTemplateCommand({
      TemplateName: templateName,
    });

    const response = await sesClient.send(command);

    return {
      success: true,
      template: response.Template,
      templateName,
    };
  } catch (error) {
    if (error instanceof SESServiceException) {
      logger.error('SES get template error:', {
        code: error.name,
        message: error.message,
        statusCode: error.$metadata.httpStatusCode,
      });

      return {
        success: false,
        error: `SES Error: ${error.message}`,
        sesError: error,
      };
    }

    logger.error('Error getting SES template:', { error, templateName });
    return { success: false, error: error.message };
  }
}

// Sync template between database and SES
export async function syncTemplateWithSes(templateId: string): Promise<TemplateResult> {
  try {
    // Get template from database
    const dbTemplate = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!dbTemplate) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Generate SES template name if not exists
    const sesTemplateName =
      dbTemplate.sesTemplateName || `template_${dbTemplate.id.replace(/-/g, '')}_${Date.now()}`;

    // Check if template exists in SES
    try {
      const existingTemplate = await getSesTemplate(sesTemplateName);

      if (existingTemplate.success) {
        // Update existing template
        await updateSesTemplate(
          sesTemplateName,
          dbTemplate.subject || 'No Subject',
          dbTemplate.html,
          dbTemplate.text
        );
      } else {
        // Create new template
        await createSesTemplate(
          sesTemplateName,
          dbTemplate.subject || 'No Subject',
          dbTemplate.html,
          dbTemplate.text
        );
      }
    } catch {
      // Template doesn't exist, create it
      await createSesTemplate(
        sesTemplateName,
        dbTemplate.subject || 'No Subject',
        dbTemplate.html,
        dbTemplate.text
      );
    }

    // Update template in database with SES name if needed
    if (!dbTemplate.sesTemplateName) {
      await prisma.emailTemplate.update({
        where: { id: templateId },
        data: {
          sesTemplateName,
          updatedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      templateName: sesTemplateName,
    };
  } catch (error) {
    logger.error('Error syncing template with SES', { templateId, error });
    return { success: false, error: error.message };
  }
}

// Handle attachments in Prisma
export async function createAttachmentRecord(
  emailId: string,
  attachment: EmailAttachment,
  path: string
): Promise<Attachment> {
  try {
    return await prisma.attachment.create({
      data: {
        emailId,
        filename: attachment.filename,
        path,
        mimeType: attachment.contentType,
        size: attachment.content.length,
        contentDisposition: attachment.disposition || 'attachment',
        ...(attachment.cid ? { contentId: attachment.cid } : {}),
        createdAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error creating attachment record', {
      emailId,
      filename: attachment.filename,
      error,
    });
    throw error;
  }
}

// Delete emails and their attachments
export async function deleteEmails(emailIds: string[]): Promise<boolean> {
  try {
    // Get emails to delete their attachments
    const emails = await prisma.email.findMany({
      where: {
        id: {
          in: emailIds,
        },
      },
      include: {
        attachments: true,
      },
    });

    // Delete attachments from S3
    for (const email of emails) {
      if (email.attachments && email.attachments.length > 0) {
        for (const attachment of email.attachments) {
          try {
            const command = new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME || 'email-attachments',
              Key: attachment.path,
            });

            await s3Client.send(command);
          } catch (error) {
            logger.error('Error deleting attachment from S3', {
              attachmentId: attachment.id,
              path: attachment.path,
              error,
            });
            // Continue with other deletions
          }
        }
      }
    }

    // Delete from ChromaDB
    await deleteDocuments(COLLECTIONS.EMAILS, emailIds);

    // Then delete from database
    await prisma.email.deleteMany({
      where: {
        id: {
          in: emailIds,
        },
      },
    });

    return true;
  } catch (error) {
    logger.error('Error deleting emails', { emailIds, error });
    return false;
  }
}

// Move emails to a different folder
export async function moveEmails(emailIds: string[], folder: string): Promise<boolean> {
  try {
    // Update in database
    await prisma.email.updateMany({
      where: {
        id: {
          in: emailIds,
        },
      },
      data: {
        folder,
      },
    });

    // Get the emails to update their metadata in ChromaDB
    const emails = await prisma.email.findMany({
      where: {
        id: {
          in: emailIds,
        },
      },
    });

    // Update metadata in ChromaDB for each email
    for (const email of emails) {
      try {
        // Update document in ChromaDB
        await updateDocument(
          COLLECTIONS.EMAILS,
          email.id,
          `${email.subject}\n\n${email.bodyText || stripHtml(email.body)}`,
          {
            userId: email.userId,
            folder,
            ...(email.contactId && { contactId: email.contactId }),
          }
        );
      } catch (error) {
        logger.error('Error updating email folder in ChromaDB', { emailId: email.id, error });
        // Continue with other updates
      }
    }

    return true;
  } catch (error) {
    logger.error('Error moving emails', { emailIds, folder, error });
    return false;
  }
}

// Utility function to test email sending with a mock transporter
export function configureTestTransporter(
  mockImplementation:
    | ((
        mailOptions: Record<string, unknown>
      ) => Promise<{ messageId: string; envelope: { from: string; to: string } }>)
    | null = null
) {
  const originalTransporter = transporter;

  // Create a test transporter that doesn't actually send emails
  const testTransporter = {
    sendMail:
      mockImplementation ||
      (async (mailOptions: Record<string, unknown>) => {
        logger.info('TEST MODE: Email not sent', { mailOptions });

        return {
          messageId: `mock-message-id-${Date.now()}`,
          envelope: {
            from: mailOptions.from,
            to: mailOptions.to,
          },
        };
      }),
  };

  transporter.sendMail = testTransporter.sendMail;

  // Return a cleanup function
  return () => {
    transporter.sendMail = originalTransporter.sendMail;
  };
}

export default {
  sendEmail,
  sendBulkEmail,
  validateEmails,
  storeAttachment,
  getAttachmentUrl,
  loadTemplate,
  addTracking,
  getContactData,
  sendEmailWithSes,
  sendBulkEmailWithSes,
  scheduleEmail,
  scheduleBulkEmail,
  processScheduledEmails,
  processScheduledCampaigns,
  createSesTemplate,
  updateSesTemplate,
  deleteSesTemplate,
  getSesTemplate,
  syncTemplateWithSes,
  createAttachmentRecord,
  deleteEmails,
  moveEmails,
  configureTestTransporter,
};
