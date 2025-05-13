'use server';

import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

/**
 * Server action to handle logout functionality
 */
export async function logoutAction() {
  // This is a server action, so we need to handle this differently than client-side
  // We'll redirect the user to the NextAuth signout endpoint
  redirect('/api/auth/signout');
}
