import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function LogoutPage() {
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to login page
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md sm:mx-auto">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Sign out</h2>
        <p className="mt-2 text-sm text-gray-600">Are you sure you want to sign out?</p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </Link>

        <Link
          href="/api/auth/signout?callbackUrl=/login"
          className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Sign out
        </Link>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>You will be redirected to the login page after signing out.</p>
      </div>
    </div>
  );
}
