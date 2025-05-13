'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps, toast } from 'sonner';

// Export the toast function
export { toast };

// Create a useToast hook
export const useToast = () => {
  return {
    toast,
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warning(message),
    info: (message: string) => toast.info(message),
    // Add any other toast methods you need
  };
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
