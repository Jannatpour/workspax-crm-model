'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';

// Define the types for dashboard sections
export type DashboardSection =
  | 'overview'
  | 'mail-inbox'
  | 'mail-sent'
  | 'mail-drafts'
  | 'mail-important'
  | 'mail-insights'
  | 'mail-attention'
  | 'mail-trash'
  | 'mail-compose'
  | 'contacts'
  | 'contacts-import'
  | 'leads'
  | 'leads-new'
  | 'leads-qualified'
  | 'leads-contacted'
  | 'leads-email'
  | 'leads-hot'
  | 'templates'
  | 'templates-recent'
  | 'templates-email'
  | 'templates-email-marketing'
  | 'templates-email-newsletters'
  | 'templates-email-onboarding'
  | 'templates-email-transactional'
  | 'templates-email-notifications'
  | 'templates-create'
  | 'templates-library'
  | 'templates-categories'
  | 'templates-presets'
  | 'agents'
  | 'agents-my'
  | 'agents-training'
  | 'agents-teams'
  | 'agents-email'
  | 'workflows'
  | 'workflows-my'
  | 'workflows-automations'
  | 'workflows-templates'
  | 'workflows-create'
  | 'notifications'
  | 'notifications-leads'
  | 'notifications-tasks'
  | 'notifications-events'
  | 'notifications-urgent'
  | 'settings'
  | 'settings-workspace'
  | 'settings-email'
  | 'settings-ai'
  | 'settings-profile'
  | 'settings-integrations'
  | 'settings-notifications';

// Define the type for the dashboard context
interface DashboardContextType {
  currentSection: DashboardSection;
  sectionParams: Record<string, any> | null;
  changeSection: (section: DashboardSection, params?: Record<string, any>) => void;
  goBack: () => void;
  canGoBack: boolean;
  history: Array<{ section: DashboardSection; params: Record<string, any> | null }>;
  clearHistory: () => void;
  refreshUI: () => void;
}

// Create the context with default values
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider props interface
interface DashboardProviderProps {
  children: ReactNode;
  initialSection?: DashboardSection;
}

// Create the provider component
export function DashboardProvider({
  children,
  initialSection = 'overview',
}: DashboardProviderProps) {
  // State for section and params - use direct state instead of history-based approach
  const [currentSection, setCurrentSection] = useState<DashboardSection>(initialSection);
  const [sectionParams, setSectionParams] = useState<Record<string, any> | null>(null);

  // Track navigation history
  const [history, setHistory] = useState<
    Array<{
      section: DashboardSection;
      params: Record<string, any> | null;
    }>
  >([{ section: initialSection, params: null }]);

  // Debug log for section changes
  useEffect(() => {
    console.log('DashboardContext - Section changed:', currentSection);
    console.log('DashboardContext - Params:', sectionParams);
  }, [currentSection, sectionParams]);

  // Change section with proper cleanup and history tracking
  const changeSection = useCallback((section: DashboardSection, params?: Record<string, any>) => {
    console.log(`DashboardContext: Changing section to ${section}`, params);

    // Special handling for template creation
    if (section === 'templates-create') {
      setCurrentSection('templates-create');
      setSectionParams(params || null);
    } else {
      // Set the current section and params directly
      setCurrentSection(section);
      setSectionParams(params || null);
    }

    // Add to history
    setHistory(prev => [...prev, { section, params: params || null }]);

    // Force UI refresh
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }, []);

  // Go back in history
  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;

      const newHistory = prev.slice(0, -1);
      const current = newHistory[newHistory.length - 1];

      // Update current section and params
      setCurrentSection(current.section);
      setSectionParams(current.params);

      return newHistory;
    });
  }, []);

  // Clear history except current
  const clearHistory = useCallback(() => {
    setHistory([{ section: currentSection, params: sectionParams }]);
  }, [currentSection, sectionParams]);

  // Force UI refresh
  const refreshUI = useCallback(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  // Check if we can go back
  const canGoBack = history.length > 1;

  // Create context value
  const contextValue: DashboardContextType = {
    currentSection,
    sectionParams,
    changeSection,
    goBack,
    canGoBack,
    history,
    clearHistory,
    refreshUI,
  };

  return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>;
}

// Hook to use the dashboard context
export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
