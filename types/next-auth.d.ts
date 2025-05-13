// Place this in types/next-auth.d.ts
import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@prisma/client';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    role?: UserRole;
  }
}
