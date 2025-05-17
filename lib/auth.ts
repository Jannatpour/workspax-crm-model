// lib/auth.ts
// This file re-exports everything from the new auth folder structure
// This is a compatibility layer to prevent breaking changes

// IMPORTANT: This file should only be imported by server components
// Client components should import from './auth/client' directly

// Define shared types
export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
};

export type SessionData = {
  user: User;
} | null;

// Re-export server auth functions for server components only
// These functions use next/headers which is server-only
export type { SessionData as ServerSessionData } from './auth/server';
export { getSession, isAuthenticated, getCurrentUser, getFullUserRecord } from './auth/server';
