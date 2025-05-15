'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

// Define the shape of automation settings
export type AutomationSettings = {
  // Email automation
  emailAnalysisEnabled: boolean;
  leadDetectionEnabled: boolean;
  taskExtractionEnabled: boolean;
  eventDetectionEnabled: boolean;
  responseGenEnabled: boolean;

  // Job automation
  scheduledJobsEnabled: boolean;
  dataEnrichmentEnabled: boolean;
  reminderJobsEnabled: boolean;

  // Notification settings
  notificationsEnabled: boolean;
};

// Context state type
type AutomationContextType = {
  settings: AutomationSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<AutomationSettings>) => Promise<void>;
  toggleSetting: (settingKey: keyof AutomationSettings) => Promise<void>;
};

// Default settings if none are found
const defaultSettings: AutomationSettings = {
  emailAnalysisEnabled: true,
  leadDetectionEnabled: true,
  taskExtractionEnabled: true,
  eventDetectionEnabled: true,
  responseGenEnabled: true,
  scheduledJobsEnabled: true,
  dataEnrichmentEnabled: true,
  reminderJobsEnabled: true,
  notificationsEnabled: true,
};

// Create the context
const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

export function AutomationProvider({ children }: { children: React.ReactNode }) {
  // Use our custom auth hook instead of NextAuth's useSession
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<AutomationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's automation settings when auth state changes
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/user/automation-settings`);
        if (!response.ok) {
          throw new Error('Failed to fetch automation settings');
        }

        const data = await response.json();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching automation settings:', err);
        setError('Failed to load automation settings');
        // Fall back to defaults
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [isAuthenticated, user]);

  // Update settings function
  const updateSettings = async (newSettings: Partial<AutomationSettings>) => {
    if (!isAuthenticated || !user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/automation-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update automation settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
    } catch (err) {
      console.error('Error updating automation settings:', err);
      setError('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle a single setting
  const toggleSetting = async (settingKey: keyof AutomationSettings) => {
    const currentValue = settings[settingKey];
    await updateSettings({ [settingKey]: !currentValue });
  };

  const value = {
    settings,
    isLoading,
    error,
    updateSettings,
    toggleSetting,
  };

  return <AutomationContext.Provider value={value}>{children}</AutomationContext.Provider>;
}

// Custom hook to use the automation context
export function useAutomation() {
  const context = useContext(AutomationContext);
  if (context === undefined) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
}
