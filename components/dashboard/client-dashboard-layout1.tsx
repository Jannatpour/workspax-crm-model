'use client';
import React, { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  user: any;
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
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen flex-col">
          <DashboardHeader user={user} />
          <div className="flex flex-1">
            {/* Don't render the sidebar until component is mounted to avoid hydration issues */}
            {mounted && (
              <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={sidebarCollapsed ? 'w-[70px]' : 'w-[240px]'}
              />
            )}
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
