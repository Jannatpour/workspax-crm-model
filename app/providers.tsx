'use client';

import { WorkspaceProvider } from '@/context/workspace-client-context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <WorkspaceProvider>
        {children}
        <Toaster />
      </WorkspaceProvider>
    </ThemeProvider>
  );
}
