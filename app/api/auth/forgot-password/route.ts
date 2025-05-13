import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/db/email';

// Define validation schema for forgot password request
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the request data
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a password reset link" },
        { status: 200 }
      );
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiry (24 hours from now)
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    // Store the token in the database
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    });

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    // Send the email using AWS SES through our existing infrastructure
    await sendPasswordResetEmail(email, resetLink, user.name || undefined);

    return NextResponse.json(
      { message: "If an account with that email exists, we've sent a password reset link" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
