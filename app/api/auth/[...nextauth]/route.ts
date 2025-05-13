import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import type { UserRole } from '@prisma/client';

/**
 * NextAuth configuration using database sessions to avoid JWT decryption errors
 */

// Define user type that includes role from your schema
declare module 'next-auth' {
  interface User {
    id: string;
    role?: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role?: UserRole;
    } & DefaultSession['user'];
  }
}

export const authOptions: NextAuthOptions = {
  // Required - use PrismaAdapter for database session storage
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              image: true,
              role: true,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          // Update last login time
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          // Return user without password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],

  // CRITICAL: Use database sessions instead of JWT
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Cookie configuration
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  callbacks: {
    // Pass user data to session without any JWT handling
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  // Disable debug in production
  debug: process.env.NODE_ENV === 'development',
};

// Export the handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
