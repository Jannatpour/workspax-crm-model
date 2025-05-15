'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getClientSessionToken, validateSessionTokenFormat } from '@/lib/auth/client';

// Define types
export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to fetch the current user
  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have a session token on the client
      const token = getClientSessionToken();

      if (!token || !validateSessionTokenFormat(token)) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Call the API to get the current user
      const response = await fetch('/api/auth/session');

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('Auth: User authenticated:', data.user.email);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Authentication error');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user on initial load
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear user state
      setUser(null);
      setIsAuthenticated(false);

      // Redirect to login page
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    return fetchCurrentUser();
  };

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
