// Console Logger Optimizer
import { devLog } from '@/lib/devLogger';
// Provides controlled logging with different levels and filtering

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogConfig {
  level: LogLevel;
  enableChartDebug: boolean;
  enablePhotoDebug: boolean;
  enableFirestoreDebug: boolean;
  enableApiDebug: boolean;
  maxLogEntries: number;
}

class ConsoleLogger {
  private config: LogConfig = {
    level: LogLevel.INFO,
    enableChartDebug: false,
    enablePhotoDebug: false,
    enableFirestoreDebug: false,
    enableApiDebug: true,
    maxLogEntries: 1000
  };
  
  private logBuffer: Array<{
    level: LogLevel;
    message: string;
    data?: any;
    timestamp: Date;
    source: string;
  }> = [];
  
  private suppressedMessages: Set<string> = new Set();
  private messageCounts: Map<string, number> = new Map();
  
  // Patterns to suppress (source map warnings from node_modules)
  private suppressedPatterns: RegExp[] = [
    /Invalid source map/i,
    /Only conformant source maps can be used/i,
    /sourceMapURL could not be parsed/i,
    /The "payload" argument must be of type object/i
  ];

  // Configure logging
  configure(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
    devLog.debug('🔧 Console logging configured:', this.config);
  }

  // Set log level
  setLogLevel(level: LogLevel): void {
    this.config.level = level;
    devLog.debug(`🔧 Log level set to: ${LogLevel[level]}`);
  }

  // Enable/disable specific debug categories
  enableChartDebug(enabled: boolean): void {
    this.config.enableChartDebug = enabled;
  }

  enablePhotoDebug(enabled: boolean): void {
    this.config.enablePhotoDebug = enabled;
  }

  enableFirestoreDebug(enabled: boolean): void {
    this.config.enableFirestoreDebug = enabled;
  }

  // Log methods with filtering
  error(message: string, data?: any, source: string = 'unknown'): void {
    this.log(LogLevel.ERROR, message, data, source);
  }

  warn(message: string, data?: any, source: string = 'unknown'): void {
    this.log(LogLevel.WARN, message, data, source);
  }

  info(message: string, data?: any, source: string = 'unknown'): void {
    this.log(LogLevel.INFO, message, data, source);
  }

  debug(message: string, data?: any, source: string = 'unknown'): void {
    this.log(LogLevel.DEBUG, message, data, source);
  }

  trace(message: string, data?: any, source: string = 'unknown'): void {
    this.log(LogLevel.TRACE, message, data, source);
  }

  // Chart-specific logging
  chart(message: string, data?: any): void {
    if (this.config.enableChartDebug) {
      this.log(LogLevel.DEBUG, `📊 ${message}`, data, 'chart');
    }
  }

  // Photo-specific logging
  photo(message: string, data?: any): void {
    if (this.config.enablePhotoDebug) {
      this.log(LogLevel.DEBUG, `📸 ${message}`, data, 'photo');
    }
  }

  // Firestore-specific logging
  firestore(message: string, data?: any): void {
    if (this.config.enableFirestoreDebug) {
      this.log(LogLevel.DEBUG, `🔥 ${message}`, data, 'firestore');
    }
  }

  // API-specific logging
  api(message: string, data?: any): void {
    if (this.config.enableApiDebug) {
      this.log(LogLevel.DEBUG, `🌐 ${message}`, data, 'api');
    }
  }

  // Success logging
  success(message: string, data?: any, source: string = 'unknown'): void {
    this.log(LogLevel.INFO, `✅ ${message}`, data, source);
  }

  // Rate-limited logging (prevents spam)
  rateLimited(
    key: string, 
    message: string, 
    data?: any, 
    maxCount: number = 5, 
    source: string = 'unknown'
  ): void {
    const count = this.messageCounts.get(key) || 0;
    
    if (count < maxCount) {
      this.messageCounts.set(key, count + 1);
      this.log(LogLevel.INFO, message, data, source);
    } else if (count === maxCount) {
      this.log(LogLevel.WARN, `${message} (suppressing further messages)`, data, source);
      this.messageCounts.set(key, count + 1);
    }
  }

  // Suppress repeated messages
  suppress(message: string, duration: number = 60000): void {
    this.suppressedMessages.add(message);
    setTimeout(() => {
      this.suppressedMessages.delete(message);
    }, duration);
  }

  // Get log statistics
  getLogStats(): {
    totalLogs: number;
    logsByLevel: Record<string, number>;
    logsBySource: Record<string, number>;
    suppressedCount: number;
  } {
    const logsByLevel: Record<string, number> = {};
    const logsBySource: Record<string, number> = {};

    this.logBuffer.forEach(log => {
      const levelName = LogLevel[log.level];
      logsByLevel[levelName] = (logsByLevel[levelName] || 0) + 1;
      logsBySource[log.source] = (logsBySource[log.source] || 0) + 1;
    });

    return {
      totalLogs: this.logBuffer.length,
      logsByLevel,
      logsBySource,
      suppressedCount: this.suppressedMessages.size
    };
  }

  // Clear logs
  clear(): void {
    this.logBuffer = [];
    this.messageCounts.clear();
    this.suppressedMessages.clear();
    devLog.debug('🧹 Console logs cleared');
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify({
      config: this.config,
      stats: this.getLogStats(),
      logs: this.logBuffer.slice(-100) // Last 100 logs
    }, null, 2);
  }

  private log(level: LogLevel, message: string, data?: any, source: string = 'unknown'): void {
    // Check log level
    if (level > this.config.level) {
      return;
    }

    // Check if message is suppressed
    if (this.suppressedMessages.has(message)) {
      return;
    }

    // Suppress source map warnings from node_modules
    const messageStr = typeof message === 'string' ? message : String(message);
    const dataStr = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : '';
    const combinedMessage = `${messageStr} ${dataStr}`;
    
    if (this.suppressedPatterns.some(pattern => pattern.test(combinedMessage))) {
      return;
    }

    // Guard non-error logs in production
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && level > LogLevel.WARN) {
      // Only log errors and warnings in production
      return;
    }

    // Add to buffer
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      source
    };

    this.logBuffer.push(logEntry);

    // Keep buffer size manageable
    if (this.logBuffer.length > this.config.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogEntries);
    }

    // Output to console with appropriate method
    const prefix = `[${source.toUpperCase()}]`;
    
    switch (level) {
      case LogLevel.ERROR:
        devLog.error(`${prefix} ${message}`, data, 'consoleLogger');
        break;
      case LogLevel.WARN:
        devLog.warn(`${prefix} ${message}`, data, 'consoleLogger');
        break;
      case LogLevel.INFO:
        if (!isProduction) {
          devLog.debug(`${prefix} ${message}`, data);
        }
        break;
      case LogLevel.DEBUG:
        if (!isProduction) {
          devLog.debug(`${prefix} ${message}`, data);
        }
        break;
      case LogLevel.TRACE:
        if (!isProduction) {
          devLog.debug(`${prefix} ${message}`, data);
        }
        break;
    }
  }
}

// Export singleton instance
export const consoleLogger = new ConsoleLogger();

// Convenience functions
export const log = {
  error: (msg: string, data?: any, source?: string) => consoleLogger.error(msg, data, source),
  warn: (msg: string, data?: any, source?: string) => consoleLogger.warn(msg, data, source),
  info: (msg: string, data?: any, source?: string) => consoleLogger.info(msg, data, source),
  debug: (msg: string, data?: any, source?: string) => consoleLogger.debug(msg, data, source),
  trace: (msg: string, data?: any, source?: string) => consoleLogger.trace(msg, data, source),
  success: (msg: string, data?: any, source?: string) => consoleLogger.success(msg, data, source),
  chart: (msg: string, data?: any) => consoleLogger.chart(msg, data),
  photo: (msg: string, data?: any) => consoleLogger.photo(msg, data),
  firestore: (msg: string, data?: any) => consoleLogger.firestore(msg, data),
  api: (msg: string, data?: any) => consoleLogger.api(msg, data),
  rateLimited: (key: string, msg: string, data?: any, maxCount?: number, source?: string) => 
    consoleLogger.rateLimited(key, msg, data, maxCount, source)
};

// Initialize with production-friendly defaults
if (process.env.NODE_ENV === 'production') {
  consoleLogger.configure({
    level: LogLevel.WARN,
    enableChartDebug: false,
    enablePhotoDebug: false,
    enableFirestoreDebug: false,
    enableApiDebug: false
  });
} else {
  consoleLogger.configure({
    level: LogLevel.INFO,
    enableChartDebug: true,
    enablePhotoDebug: false, // Disable photo debug by default
    enableFirestoreDebug: true,
    enableApiDebug: true
  });
}
