import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ResetPasswordForm from '@/components/auth/reset-password-form';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Get token from query params
  const { token } = searchParams;

  // If no token is provided, redirect to forgot password
  if (!token) {
    redirect('/forgot-password');
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md sm:mx-auto">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-gray-600">Create a new password for your account</p>
      </div>

      <ResetPasswordForm token={token} />
    </div>
  );
}
