import type { NextConfig } from 'next';

/**
 * Next.js configuration with security enhancements
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Security headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          // CSP can be configured more strictly in production
          {
            key: 'Content-Security-Policy',
            value:
              process.env.NODE_ENV === 'production'
                ? "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'"
                : '',
          },
        ],
      },
    ];
  },

  // Environment configuration
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Protect against JSON hijacking
  poweredByHeader: false,
};

export default nextConfig;
