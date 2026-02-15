/**
 * Conditional Logger Utility
 * Only logs in development mode to avoid console noise in production
 */

import { devLog } from '@/lib/devLogger';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      devLog.debug(args[0], args[1], 'logger');
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment) {
      devLog.error(args[0], args[1], 'logger');
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      devLog.warn(args[0], args[1], 'logger');
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      devLog.debug(args[0], args[1], 'logger');
    }
  },
};
