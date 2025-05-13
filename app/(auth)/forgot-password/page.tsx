import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ForgotPasswordForm from '@/components/auth/forgot-password-form';

export default async function ForgotPasswordPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md sm:mx-auto">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Forgot Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />

      <div className="text-center text-sm">
        <p className="text-gray-600">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
