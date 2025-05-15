// lib/auth/index.ts - MAIN AUTH MODULE
// This file is the main entry point for auth functions,
// exporting server-side functions directly

// Re-export everything from the server module
export * from './server'; // <-- FIX: use relative path './server' not './auth/server'

// Note: We don't export client.ts functions here
// because they should be imported directly when needed
// in client components
