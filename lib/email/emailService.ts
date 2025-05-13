// src/lib/email/sendEmail.ts
import { emailService } from '@/lib/db/email';

/**
 * Sends an email using AWS SES
 * @param options Email options including recipients, subject, and content
 * @returns Promise with the result of the email sending operation
 */
export async function sendEmail(options: {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
  userId?: string;
}) {
  // Convert all inputs to the format expected by the emailService
  const toArray = Array.isArray(options.to) ? options.to : [options.to];
  const ccArray = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;
  const bccArray = options.bcc
    ? Array.isArray(options.bcc)
      ? options.bcc
      : [options.bcc]
    : undefined;

  // Map attachments to the format expected by emailService
  const attachments = options.attachments?.map(att => ({
    filename: att.filename,
    content: att.content,
    contentType: att.contentType || 'application/octet-stream',
  }));

  // Use the existing email service to send the email
  const result = await emailService.sendEmail({
    to: toArray,
    cc: ccArray,
    bcc: bccArray,
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments,
    userId: options.userId || 'system',
    metadata: {
      source: 'password-reset',
      automatedEmail: true,
    },
  });

  return result;
}
