// app/dashboard/page.tsx
import { getSession } from '@/lib/auth/server'; // FIXED: import from server module
import LogoutButton from '@/components/auth/logout-button';

export default async function DashboardPage() {
  const session = await getSession();

  // The middleware will handle redirects if there's no session
  if (!session) {
    console.log('Dashboard: No session found, showing loading spinner');
    // Return a simple loading state instead of redirecting
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">Verifying your session...</p>
          <p className="text-sm text-gray-500 mt-2">If this persists, try refreshing the page.</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard: Rendering dashboard for user:', session.user.email);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-medium text-gray-900">
          Welcome, {session.user.name || session.user.email || 'User'}
        </h2>
        <p className="mt-2 text-gray-600">You are now logged in to your account.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Account Overview</h3>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Email: {session.user.email}</p>
            <p className="text-sm text-gray-600">Role: {session.user.role || 'User'}</p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <p className="mt-2 text-sm text-gray-600">No recent activity to display.</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <a
              href="/dashboard/profile"
              className="block text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Edit Profile
            </a>
            <a
              href="/dashboard/settings"
              className="block text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Account Settings
            </a>
            <div className="pt-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
