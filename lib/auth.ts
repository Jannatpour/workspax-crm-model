// lib/auth.ts
// This file re-exports everything from the new auth folder structure
// This is a compatibility layer to prevent breaking changes

// Re-export server auth functions
export * from './auth/server'; // <-- CORRECT: From the root lib folder, path is './auth/server'

// Note: Client functions are intentionally not exported here
// to prevent server components from accidentally using client-only code
