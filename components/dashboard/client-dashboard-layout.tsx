'use client';
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DynamicSidebar } from '@/components/dashboard/dynamic-sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { useMediaQuery } from '@/hooks/use-media-query';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { DashboardProvider } from '@/context/dashboard-context';
import { AuthProvider, User } from '@/context/auth-context';

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function ClientDashboardLayout({ children, user }: ClientDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mounted, setMounted] = useState(false);

  // Handle sidebar collapse state based on screen size
  useEffect(() => {
    setSidebarCollapsed(!isDesktop);
    setMounted(true);
  }, [isDesktop]);

  return (
    <AuthProvider initialUser={user}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <DashboardProvider>
          <div className="flex min-h-screen flex-col">
            <DashboardHeader user={user} />
            <div className="flex flex-1">
              {/* Don't render the sidebar until component is mounted to avoid hydration issues */}
              {mounted && (
                <DynamicSidebar
                  collapsed={sidebarCollapsed}
                  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={sidebarCollapsed ? 'w-[70px]' : 'w-[240px]'}
                />
              )}
              <main className="flex-1 overflow-y-auto">
                <DashboardContent>{children}</DashboardContent>
              </main>
            </div>
          </div>
        </DashboardProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
