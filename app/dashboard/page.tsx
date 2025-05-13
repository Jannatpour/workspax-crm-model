import { getSession } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-medium text-gray-900">
          Welcome, {session?.user.name || session?.user.email || 'User'}
        </h2>
        <p className="mt-2 text-gray-600">You are now logged in to your account.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Account Overview</h3>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Email: {session?.user.email}</p>
            <p className="text-sm text-gray-600">Role: {session?.user.role}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
