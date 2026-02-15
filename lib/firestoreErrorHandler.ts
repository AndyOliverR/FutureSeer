// Firestore Error Handler
// Provides centralized error handling and recovery for Firestore operations

import { getFirebaseDB } from './firebase';
import { devLog } from '@/lib/devLogger';

export interface FirestoreErrorInfo {
  error: Error;
  operation: string;
  collection?: string;
  documentId?: string;
  timestamp: Date;
  retryCount: number;
}

export interface FirestoreErrorReport {
  totalErrors: number;
  errorsByType: Record<string, number>;
  recentErrors: FirestoreErrorInfo[];
  recommendations: string[];
}

class FirestoreErrorHandler {
  private errorLog: FirestoreErrorInfo[] = [];
  private readonly MAX_ERROR_LOG_SIZE = 100;
  private readonly RETRY_DELAYS = [1000, 2000, 5000]; // Retry delays in ms
  private isInitializing = true;
  private readonly INITIALIZATION_WINDOW = 5000; // 5 seconds

  constructor() {
    // Mark initialization as complete after window (client-side only)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.isInitializing = false;
      }, this.INITIALIZATION_WINDOW);
    }
  }

  // Helper to detect if error is offline error
  private isOfflineError(error: Error): boolean {
    const message = error.message || '';
    const errorString = error.toString();
    return (
      message.includes('offline') ||
      message.includes('Failed to get document') ||
      errorString.includes('offline') ||
      errorString.includes('Failed to get document') ||
      (error as any)?.code === 'unavailable' ||
      (error as any)?.code === 'deadline-exceeded'
    );
  }

  // Handle common Firestore errors
  handleError(error: Error, operation: string, collection?: string, documentId?: string): FirestoreErrorInfo {
    const errorInfo: FirestoreErrorInfo = {
      error,
      operation,
      collection,
      documentId,
      timestamp: new Date(),
      retryCount: 0
    };

    // Suppress offline errors during initialization - they're expected
    if (this.isOfflineError(error) && this.isInitializing) {
      // Don't log these errors - they're expected during initialization
      // Still return error info for potential handling, but don't spam console
      return errorInfo;
    }

    this.logError(errorInfo);
    
    // Provide specific error messages and recovery suggestions
    if (error.message.includes('400')) {
      devLog.error('🔥 Firestore 400 Error:', {
        operation,
        collection,
        documentId,
        message: 'Bad Request - Check data format and permissions',
        suggestion: 'Verify document structure and Firestore rules'
      }, 'firestoreErrorHandler');
    } else if (error.message.includes('403')) {
      devLog.error('🔥 Firestore 403 Error:', {
        operation,
        collection,
        documentId,
        message: 'Forbidden - Check Firestore security rules',
        suggestion: 'Review Firestore security rules for this collection'
      }, 'firestoreErrorHandler');
    } else if (error.message.includes('404')) {
      devLog.error('🔥 Firestore 404 Error:', {
        operation,
        collection,
        documentId,
        message: 'Document not found',
        suggestion: 'Verify document ID and collection path'
      }, 'firestoreErrorHandler');
    } else if (this.isOfflineError(error)) {
      // Only log offline errors if not in initialization phase
      devLog.error('🔥 Firestore Offline Error:', {
        operation,
        collection,
        documentId,
        message: 'Client is offline',
        suggestion: 'Check internet connection and Firebase project status'
      }, 'firestoreErrorHandler');
    } else {
      devLog.error('🔥 Firestore Unknown Error:', {
        operation,
        collection,
        documentId,
        message: error.message,
        suggestion: 'Check Firebase configuration and network status'
      }, 'firestoreErrorHandler');
    }

    return errorInfo;
  }

  // Retry operation with exponential backoff
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    operationName: string = 'unknown'
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          this.handleError(lastError, operationName);
          throw lastError;
        }
        
        // Wait before retrying
        const delay = this.RETRY_DELAYS[attempt] || 5000;
        devLog.debug(`🔄 Retrying ${operationName} in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  // Validate Firestore connection
  async validateConnection(): Promise<boolean> {
    try {
      const db = getFirebaseDB();
      if (!db) {
        devLog.error('🔥 Firestore not initialized', undefined, 'firestoreErrorHandler');
        return false;
      }

      // Test connection with a simple operation
      const { doc, getDoc } = await import('firebase/firestore');
      const testDoc = doc(db, '_test', 'connection');
      
      // This should fail with permission denied, but confirms connection works
      await getDoc(testDoc);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('permission-denied') || errorMessage.includes('not-found')) {
        // These are expected errors for test document - connection is working
        return true;
      }
      
      devLog.error('🔥 Firestore connection validation failed:', errorMessage, 'firestoreErrorHandler');
      return false;
    }
  }

  // Get error statistics
  getErrorReport(): FirestoreErrorReport {
    const errorsByType: Record<string, number> = {};
    const recentErrors = this.errorLog.slice(-10); // Last 10 errors

    this.errorLog.forEach(errorInfo => {
      const errorType = this.getErrorType(errorInfo.error);
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
    });

    const recommendations: string[] = [];
    
    if (errorsByType['400'] > 0) {
      recommendations.push('Review data format and Firestore rules to fix 400 errors');
    }
    if (errorsByType['403'] > 0) {
      recommendations.push('Check Firestore security rules for permission issues');
    }
    if (errorsByType['offline'] > 0) {
      recommendations.push('Verify internet connection and Firebase project status');
    }
    if (this.errorLog.length > 50) {
      recommendations.push('High error rate detected - review Firebase configuration');
    }

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      recentErrors,
      recommendations
    };
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
    devLog.debug('🧹 Firestore error log cleared');
  }

  private logError(errorInfo: FirestoreErrorInfo): void {
    this.errorLog.push(errorInfo);
    
    // Keep log size manageable
    if (this.errorLog.length > this.MAX_ERROR_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(-this.MAX_ERROR_LOG_SIZE);
    }
  }

  private getErrorType(error: Error): string {
    if (error.message.includes('400')) return '400';
    if (error.message.includes('403')) return '403';
    if (error.message.includes('404')) return '404';
    if (error.message.includes('offline')) return 'offline';
    if (error.message.includes('permission-denied')) return 'permission-denied';
    if (error.message.includes('not-found')) return 'not-found';
    return 'unknown';
  }
}

// Export singleton instance
export const firestoreErrorHandler = new FirestoreErrorHandler();

// Utility functions for common Firestore operations with error handling
export async function safeFirestoreOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'unknown'
): Promise<T> {
  try {
    return await firestoreErrorHandler.retryOperation(operation, 3, operationName);
  } catch (error) {
    devLog.error(`❌ Firestore operation failed: ${operationName}`, error, 'firestoreErrorHandler');
    throw error;
  }
}

// Validate Firestore data before saving
export function validateFirestoreData(data: any, collection: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check for common issues
  if (!data) {
    issues.push('Data is null or undefined');
  }
  
  if (typeof data === 'object') {
    // Check for circular references
    try {
      JSON.stringify(data);
    } catch (error) {
      issues.push('Data contains circular references');
    }
    
    // Check for undefined values
    const checkForUndefined = (obj: any, path: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) {
          issues.push(`${path}${key} is undefined`);
        } else if (value && typeof value === 'object') {
          checkForUndefined(value, `${path}${key}.`);
        }
      }
    };
    
    checkForUndefined(data);
  }
  
  // Collection-specific validation
  if (collection === 'users') {
    if (!data.uid) issues.push('User document missing uid field');
  }
  
  if (collection === 'vedic-readings') {
    if (!data.planets) issues.push('Vedic reading missing planets data');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}
