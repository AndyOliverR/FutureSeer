/**
 * Development-only logging utility
 * All logs are automatically suppressed in production builds
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log a message only in development
 */
function devLogFunction(message: string, ...args: any[]): void {
  if (isDevelopment) {
    devLog.debug(message, ...args);
  }
}

/**
 * Log a warning only in development
 */
function devWarnFunction(message: string, ...args: any[]): void {
  if (isDevelopment) {
    devLog.warn(message, ...args, 'devLogger');
  }
}

/**
 * Log info only in development
 */
function devInfoFunction(message: string, ...args: any[]): void {
  if (isDevelopment) {
    console.info(message, ...args);
  }
}

/**
 * Always log errors (even in production)
 */
function devErrorFunction(message: string, ...args: any[]): void {
  devLog.error(message, ...args, 'devLogger');
}

/**
 * Development logger object with methods
 * Usage: devLog.info(message, data, source)
 */
export const devLog = {
  info: (msg: string, data?: any, source?: string) => {
    if (isDevelopment) {
      const prefix = source ? `[${source.toUpperCase()}]` : '';
      devLog.debug(`${prefix} ${msg}`, data !== undefined ? data : '');
    }
  },
  warn: (msg: string, data?: any, source?: string) => {
    if (isDevelopment) {
      const prefix = source ? `[${source.toUpperCase()}]` : '';
      console.warn(`${prefix} ${msg}`, data !== undefined ? data : '');
    }
  },
  debug: (msg: string, data?: any, source?: string) => {
    if (isDevelopment) {
      const prefix = source ? `[${source.toUpperCase()}]` : '';
      console.debug(`${prefix} ${msg}`, data !== undefined ? data : '');
    }
  },
  error: (msg: string, data?: any, source?: string) => {
    // Always log errors, even in production
    const prefix = source ? `[${source.toUpperCase()}]` : '';
    console.error(`${prefix} ${msg}`, data !== undefined ? data : '');
  },
  trace: (msg: string, data?: any, source?: string) => {
    if (isDevelopment) {
      const prefix = source ? `[${source.toUpperCase()}]` : '';
      devLog.debug(`${prefix} ${msg}`, data !== undefined ? data : '');
    }
  }
};

/**
 * Legacy function exports for backward compatibility
 */
export function devWarn(message: string, ...args: any[]): void {
  devWarnFunction(message, ...args);
}
