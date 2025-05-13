// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Simple logger that works in both browser and Node.js environments
export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  },

  info: (message: string, meta?: Record<string, unknown>) => {
    console.info(`[INFO] ${message}`, meta || '');
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },

  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, meta || '');
  },

  // Log with custom level
  log: (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    switch (level) {
      case 'debug':
        logger.debug(message, meta);
        break;
      case 'info':
        logger.info(message, meta);
        break;
      case 'warn':
        logger.warn(message, meta);
        break;
      case 'error':
        logger.error(message, meta);
        break;
    }
  },
};
