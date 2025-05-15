'use client';

import { parseCookies } from 'nookies';
import type { User } from '@/lib/auth';

/**
 * Client-side function to get the current user
 * This uses the API endpoint instead of server-side session checks
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Fetch the current user from the API endpoint
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Client-side function to check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Client-side function to get the session token
 * Only works in client components
 */
export function getClientSessionToken(ctx = null) {
  try {
    const cookies = parseCookies(ctx);
    const token = cookies['app-session'];

    if (token) {
      console.log('Auth Client: Found session token');
      return token;
    }
  } catch (error) {
    console.log('Auth Client: Error reading cookies:', error);
  }

  return null;
}

/**
 * Check if there's a session token on the client side
 * Only a rough check - not a secure validation
 */
export function hasClientSession(ctx = null): boolean {
  const token = getClientSessionToken(ctx);
  return !!token;
}

/**
 * Client-side function to check if a token looks valid
 * This is just a format check, not a true validation
 */
export function validateSessionTokenFormat(token: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
}
