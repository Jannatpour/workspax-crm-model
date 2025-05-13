import React from 'react';
import { redirect } from 'next/navigation';
import { ClientDashboardLayout } from '@/components/dashboard/client-dashboard-layout';
import { getSession } from '@/lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Get session using our custom function
  const session = await getSession();

  // If no session, let middleware handle the redirect
  if (!session) {
    redirect('/login');
  }

  // If we have a session, render the dashboard with the user data
  return <ClientDashboardLayout user={session.user}>{children}</ClientDashboardLayout>;
}
