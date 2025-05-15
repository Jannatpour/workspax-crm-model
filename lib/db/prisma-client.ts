'use client';

// This is a mock implementation of the Prisma client for client-side components
// It provides the same interface as the server-side Prisma client but with mock implementations

// Create a type for the mock Prisma client
type MockPrismaModel = {
  findUnique: (args: any) => Promise<any>;
  findMany: (args: any) => Promise<any[]>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  upsert: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  count: (args: any) => Promise<number>;
};

// Create a proxy handler for all Prisma models
const modelHandler = {
  get: (_target: any, prop: string) => {
    // Return a function for any operation (findUnique, create, etc.)
    return async (...args: any[]) => {
      console.warn(`Mock Prisma client: ${prop} operation called`);
      console.warn('This is a client-side mock. No actual database operations will be performed.');

      // Return appropriate mock data based on the operation
      if (prop === 'findUnique' || prop === 'findFirst') {
        return null;
      }
      if (prop === 'findMany') {
        return [];
      }
      if (prop === 'create' || prop === 'update' || prop === 'upsert') {
        return { ...args[0]?.data, id: 'mock-id-' + Date.now() };
      }
      if (prop === 'delete') {
        return { id: args[0]?.where?.id || 'deleted-mock-id' };
      }
      if (prop === 'count') {
        return 0;
      }

      return null;
    };
  },
};

// Create a proxy handler for the Prisma client itself
const clientHandler = {
  get: (_target: any, prop: string) => {
    // Handle special Prisma client methods
    if (prop === '$connect') {
      return async () => {
        console.warn('Mock Prisma client: $connect called (no-op in client-side mock)');
        return Promise.resolve();
      };
    }

    if (prop === '$disconnect') {
      return async () => {
        console.warn('Mock Prisma client: $disconnect called (no-op in client-side mock)');
        return Promise.resolve();
      };
    }

    if (prop === '$transaction') {
      return async (callback: Function) => {
        console.warn('Mock Prisma client: $transaction called (simulated in client-side mock)');
        return await callback(prisma);
      };
    }

    if (prop === '$queryRaw') {
      return async (...args: any[]) => {
        console.warn('Mock Prisma client: $queryRaw called with:', args);
        return [{ result: 1 }];
      };
    }

    // For any model access (user, post, etc.), return a proxied model
    return new Proxy({} as MockPrismaModel, modelHandler);
  },
};

// Create and export the mock Prisma client
export const prisma = new Proxy({}, clientHandler);
