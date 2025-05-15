'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEffect, useState } from 'react';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Only render the ThemeProvider after the component has mounted
  // This prevents the hydration mismatch error
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only return the children if we're not mounted yet
  // This ensures we don't get a hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  // Add the forcedTheme prop to ensure it's treated as a client component
  return (
    <NextThemesProvider {...props} forcedTheme={props.forcedTheme}>
      {children}
    </NextThemesProvider>
  );
}
