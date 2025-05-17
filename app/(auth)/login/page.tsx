import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/auth/login-form';
import { isAuthenticated } from '@/lib/auth/server';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  // Check if user is already logged in
  const isLoggedIn = await isAuthenticated();

  // If already logged in, redirect to dashboard or callback URL
  if (isLoggedIn) {
    const callbackUrl = searchParams.callbackUrl || '/dashboard';
    redirect(callbackUrl);
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md sm:mx-auto">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
