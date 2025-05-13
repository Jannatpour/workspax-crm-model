// src/lib/db/email.ts

// Import the existing email service
import emailServiceOriginal from '@/lib/db/email/service';
import { EmailPayload, EmailResult } from '@/lib/db/email/service';

// Re-export the original email service
export const emailService = emailServiceOriginal;

// Export simplified functions for specific use cases

/**
 * Sends a password reset email using the main email service
 * @param email The recipient's email address
 * @param resetLink The password reset link
 * @param name Optional user's name for personalization
 * @returns Result of the email sending operation
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  name?: string
): Promise<EmailResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
      ${name ? `<p>Hello ${name},</p>` : '<p>Hello,</p>'}
      <p>You recently requested to reset your password for your WorkspaxCRM account. Use the button below to reset it. This password reset link is only valid for the next 24 hours.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Your Password</a>
      </div>
      <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      <p>If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
      <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} WorkspaxCRM. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
    Password Reset Request

    ${name ? `Hello ${name},` : 'Hello,'}

    You recently requested to reset your password for your WorkspaxCRM account. Use the link below to reset it. This password reset link is only valid for the next 24 hours.

    ${resetLink}

    If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

    © ${new Date().getFullYear()} WorkspaxCRM. All rights reserved.
  `;

  return emailService.sendEmail({
    to: [email],
    subject: 'Reset Your Password',
    html,
    text,
    userId: 'system',
    metadata: {
      type: 'password-reset',
      systemEmail: true,
    },
  });
}

export default {
  sendPasswordResetEmail,
  ...emailService,
};
