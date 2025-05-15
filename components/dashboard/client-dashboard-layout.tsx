'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DynamicSidebar } from '@/components/dashboard/dynamic-sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { useMediaQuery } from '@/hooks/use-media-query';
import { DashboardProvider } from '@/context/dashboard-context';
import { AuthProvider, User } from '@/context/auth-context';
import { WorkspaceSelector } from '@/components/workspace/workspace-selector';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function ClientDashboardLayout({ children, user }: ClientDashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mounted, setMounted] = useState(false);

  // Handle sidebar collapse state based on screen size
  useEffect(() => {
    if (!mounted) {
      setIsCollapsed(!isDesktop);
      setMounted(true);
    }
  }, [isDesktop, mounted]);

  return (
    <AuthProvider initialUser={user}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <DashboardProvider>
          <div className="h-screen flex flex-col">
            <DashboardHeader user={user}>
              <WorkspaceSelector />
            </DashboardHeader>

            <div className="flex-1 overflow-hidden">
              {mounted && (
                <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
                  <ResizablePanel
                    defaultSize={20}
                    minSize={isCollapsed ? 6 : 15}
                    maxSize={25}
                    collapsible={true}
                    onCollapse={() => setIsCollapsed(true)}
                    onExpand={() => setIsCollapsed(false)}
                    className={cn(
                      isCollapsed
                        ? 'min-w-[70px] transition-all duration-300 ease-in-out'
                        : 'min-w-[240px]'
                    )}
                  >
                    <DynamicSidebar
                      collapsed={isCollapsed}
                      onToggle={() => setIsCollapsed(!isCollapsed)}
                      className="h-full"
                    />
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel defaultSize={80}>
                    <main className="h-full overflow-auto">{children}</main>
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}
            </div>
          </div>
          <Toaster position="top-right" richColors />
        </DashboardProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
