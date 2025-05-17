import React from 'react';
import { redirect } from 'next/navigation';
import { ClientDashboardLayout } from '@/components/dashboard/client-dashboard-layout';
import { WorkspaceCheck } from '@/components/workspace/workspace-check';
import { getCurrentUser } from '@/lib/auth/server'; // Import from server-only auth module

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  try {
    // Fixed: Using getCurrentUser directly
    const user = await getCurrentUser();

    // If no user is authenticated, redirect to login
    if (!user) {
      console.log('Dashboard: No user found, redirecting to login');
      redirect('/login');
    }

    console.log('Dashboard: User authenticated:', user.email);

    // If we have a user, render the dashboard with the user data
    return (
      <WorkspaceCheck>
        <ClientDashboardLayout user={user}>{children}</ClientDashboardLayout>
      </WorkspaceCheck>
    );
  } catch (error) {
    console.error('Dashboard layout error:', error);
    redirect('/login');
  }
}
