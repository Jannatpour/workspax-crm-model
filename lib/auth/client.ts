'use client';

import { parseCookies } from 'nookies';

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
