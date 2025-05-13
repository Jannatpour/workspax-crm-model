'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface SidebarContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleCollapsed: () => {},
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Update collapsed state on screen size change
  useEffect(() => {
    setCollapsed(!isDesktop);
  }, [isDesktop]);

  const toggleCollapsed = () => setCollapsed(prev => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}
