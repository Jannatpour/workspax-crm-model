// src/lib/db/prisma.ts

import { PrismaClient } from '@prisma/client';

// Add global types for Prisma Client
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a mock PrismaClient for environments where Prisma can't be initialized
interface MockPrismaClient {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  $on: (event: string, callback: Function) => void;
  $transaction: <T>(fn: (prisma: any) => Promise<T>) => Promise<T>;
  $queryRaw: (...args: any[]) => Promise<any>;
  $use: (callback: Function) => void;
  [key: string]: any;
}

/**
 * Creates a mock PrismaClient for environments where Prisma can't be initialized
 */
function createMockPrismaClient(): MockPrismaClient {
  console.warn('⚠️ Using mock Prisma client - database operations will not work');

  const handler = {
    get: (target: any, prop: string) => {
      if (prop in target) {
        return target[prop];
      }

      // For any requested model, return a proxy that handles common operations
      return new Proxy(
        {},
        {
          get: (_: any, operation: string) => {
            // Return a function for any requested operation
            return async (...args: any[]) => {
              console.warn(`Mock Prisma client called: ${prop}.${operation}`);
              if (operation === 'findFirst' || operation === 'findUnique') {
                return null;
              }
              if (operation === 'findMany') {
                return [];
              }
              return undefined;
            };
          },
        }
      );
    },
  };

  // Create a base mock client with required methods
  const mockClient: MockPrismaClient = {
    $connect: async () => {
      console.warn('Mock Prisma client: $connect called');
      return Promise.resolve();
    },
    $disconnect: async () => {
      console.warn('Mock Prisma client: $disconnect called');
      return Promise.resolve();
    },
    $on: (event, callback) => {
      console.warn(`Mock Prisma client: $on ${event} called`);
    },
    $transaction: async fn => {
      console.warn('Mock Prisma client: $transaction called');
      return await fn(mockClient);
    },
    $queryRaw: async (...args) => {
      console.warn('Mock Prisma client: $queryRaw called');
      return [{ result: 1 }];
    },
    $use: callback => {
      console.warn('Mock Prisma client: $use called');
    },
  };

  // Return the proxied mock client
  return new Proxy(mockClient, handler);
}

/**
 * Configure Prisma logging based on environment and settings
 */
function getLogSettings() {
  // In development, log queries, warnings and errors
  if (process.env.NODE_ENV === 'development') {
    return [
      { level: 'query', emit: 'event' },
      { level: 'warn', emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
    ];
  }

  // In production, only log warnings and errors
  return [
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
  ];
}

// Determine if we're in a context where Prisma can be initialized
const canInitializePrisma = () => {
  return (
    // Check if we're on the server
    typeof window === 'undefined' &&
    // And not in special build environments
    process.env.SKIP_PRISMA_INIT !== 'true' &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  );
};

// Initialize Prisma with a simplified approach that's less prone to errors
let prisma: PrismaClient | MockPrismaClient;

// Use direct initialization with fallbacks
if (canInitializePrisma()) {
  try {
    // Re-use existing instance if available (for development hot reloading)
    if (global.prisma) {
      prisma = global.prisma;
      console.log('🔄 Using existing Prisma instance');
    } else {
      // Create a new PrismaClient instance
      prisma = new PrismaClient({
        log: getLogSettings(),
        errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
      });

      // Store in global scope in development to prevent multiple instances
      if (process.env.NODE_ENV !== 'production') {
        global.prisma = prisma;
      }

      // Set up performance monitoring middleware in development
      if (process.env.NODE_ENV === 'development') {
        (prisma as PrismaClient).$use(async (params, next) => {
          const startTime = Date.now();
          const result = await next(params);
          const duration = Date.now() - startTime;

          // Log slow queries (over 100ms) to help with performance optimization
          if (duration > 100) {
            console.log(`Slow query (${duration}ms): ${params.model}.${params.action}`);
          }

          return result;
        });

        // Set up query logging if enabled
        try {
          (prisma as PrismaClient).$on('query', e => {
            if (
              process.env.PRISMA_QUERY_LOGGING === '1' ||
              process.env.PRISMA_QUERY_LOGGING === 'true'
            ) {
              console.log(`Query: ${e.query}`);
              console.log(`Params: ${e.params}`);
              console.log(`Duration: ${e.duration}ms`);
            }
          });
        } catch (error) {
          console.warn('Could not set up Prisma query logging:', error);
        }
      }

      // Connect to the database
      (prisma as PrismaClient)
        .$connect()
        .then(() => {
          console.log('🗄️ Successfully connected to the database');
        })
        .catch(error => {
          console.error('❌ Failed to connect to the database:', error);
          // Exit the process if we can't connect to the database in production
          if (process.env.NODE_ENV === 'production') {
            console.error('Terminating application due to database connection failure');
            process.exit(1);
          }
        });

      // Handle application shutdown to properly close the Prisma connection
      if (typeof process !== 'undefined' && process.on && typeof process.on === 'function') {
        ['SIGINT', 'SIGTERM'].forEach(signal => {
          process.on(signal, async () => {
            console.log(`${signal} received, closing Prisma connection...`);
            await (prisma as PrismaClient).$disconnect();
            process.exit(0);
          });
        });
      }
    }
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    prisma = createMockPrismaClient();
  }
} else {
  // Use a mock client for browser/build contexts
  prisma = createMockPrismaClient();
}

// Export the client
export { prisma };
export default prisma;

// Export Prisma utilities
export { Prisma } from '@prisma/client';

/**
 * Safely executes a database transaction with proper error handling
 * @param transaction The transaction function to execute
 * @returns Result of the transaction
 */
export async function runTransaction<T>(transaction: (tx: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await prisma.$transaction(async tx => {
      return await transaction(tx as unknown as PrismaClient);
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

/**
 * Helper to check database connection health
 * @returns Object indicating database connection health
 */
export async function checkDatabaseHealth() {
  try {
    // Simple query to check if database is responsive
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true, message: 'Database connection is healthy' };
  } catch (error) {
    return {
      healthy: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
