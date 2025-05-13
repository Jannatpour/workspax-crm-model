import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { hash } from 'bcrypt';

// Define validation schema for password reset
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the request data
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Find the password reset record
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    // Check if the token exists and is valid
    if (!passwordReset) {
      return NextResponse.json({ message: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Check if the token is expired
    if (new Date() > passwordReset.expires) {
      // Clean up expired token
      await prisma.passwordReset.delete({
        where: { id: passwordReset.id },
      });

      return NextResponse.json(
        { message: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update the user's password
    await prisma.user.update({
      where: { id: passwordReset.userId },
      data: {
        password: hashedPassword,
        // Update lastLogin as a security measure
        lastLogin: new Date(),
      },
    });

    // Delete the used token
    await prisma.passwordReset.delete({
      where: { id: passwordReset.id },
    });

    return NextResponse.json(
      {
        message: 'Password has been reset successfully. You can now log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
