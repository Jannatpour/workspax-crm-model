'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps, toast } from 'sonner';

// Wrap the original toast function to handle object arguments
const wrappedToast = (
  message: string | { title: string; description?: string; [key: string]: any }
) => {
  if (typeof message === 'string') {
    return toast(message);
  } else {
    const { title, description, ...rest } = message;
    return toast(title, {
      description,
      ...rest,
    });
  }
};

// Add the original toast methods to our wrapped toast
Object.keys(toast).forEach(key => {
  if (typeof toast[key as keyof typeof toast] === 'function') {
    if (['success', 'error', 'warning', 'info'].includes(key)) {
      // For these methods, we need to handle objects
      (wrappedToast as any)[key] = (
        message: string | { title: string; description?: string; [key: string]: any }
      ) => {
        if (typeof message === 'string') {
          return (toast as any)[key](message);
        } else {
          const { title, description, ...rest } = message;
          return (toast as any)[key](title, {
            description,
            ...rest,
          });
        }
      };
    } else {
      // For other methods, pass through
      (wrappedToast as any)[key] = toast[key as keyof typeof toast];
    }
  }
});

// Export the wrapped toast function
export { wrappedToast as toast };

// Create a useToast hook
export const useToast = () => {
  return {
    toast: wrappedToast,
    success: wrappedToast.success,
    error: wrappedToast.error,
    warning: wrappedToast.warning,
    info: wrappedToast.info,
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
