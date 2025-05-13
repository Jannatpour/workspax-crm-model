// src/context/dashboard-context.tsx
'use client';
import React, { createContext, useContext, useState } from 'react';

// Define the available dashboard sections
export type DashboardSection =
  | 'overview'
  | 'mail-inbox'
  | 'mail-sent'
  | 'mail-drafts'
  | 'mail-trash'
  | 'mail-compose'
  | 'contacts'
  | 'contacts-import'
  | 'contacts-export'
  | 'agents'
  | 'agents-teams'
  | 'agents-training'
  | 'settings'
  | 'settings-email';

interface DashboardContextType {
  currentSection: DashboardSection;
  changeSection: (section: DashboardSection) => void;
  sectionParams: Record<string, any>; // For storing section-specific parameters
  setSectionParams: (params: Record<string, any>) => void;
}

// Create the context with default values
const DashboardContext = createContext<DashboardContextType>({
  currentSection: 'overview',
  changeSection: () => {},
  sectionParams: {},
  setSectionParams: () => {},
});

// Custom hook to use the dashboard context
export const useDashboard = () => useContext(DashboardContext);

// Provider component to wrap around the dashboard
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSection, setCurrentSection] = useState<DashboardSection>('overview');
  const [sectionParams, setSectionParams] = useState<Record<string, any>>({});

  const changeSection = (section: DashboardSection) => {
    setCurrentSection(section);
  };

  return (
    <DashboardContext.Provider
      value={{
        currentSection,
        changeSection,
        sectionParams,
        setSectionParams: params => setSectionParams(params),
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
