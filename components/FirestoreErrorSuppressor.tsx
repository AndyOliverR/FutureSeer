'use client';

import { useEffect } from 'react';
import { devLog } from '@/lib/devLogger';

declare global {
  interface Window {
    __futureSeerWarnBuckets?: Map<string, number>;
  }
}

/**
 * Suppresses Firestore internal assertion errors before Next.js error overlay catches them
 * This component runs early and patches global error handlers
 */
export function FirestoreErrorSuppressor() {
  useEffect(() => {
    // Function to check if an error is a Firestore internal assertion error
    const isFirestoreInternalError = (error: any): boolean => {
      if (!error) return false;
      
      const errorMessage = error?.message || error?.toString() || '';
      const errorStack = error?.stack || '';
      const errorString = JSON.stringify(error);
      
      // Check for various Firestore internal error patterns
      const patterns = [
        'INTERNAL ASSERTION FAILED',
        'FIRESTORE',
        'Firestore',
        'FIRESTORE (12.1.0)',
        'Unexpected state (ID: ca9)',
        'Unexpected state (ID: b815)',
        'Unexpected state (ID: da08)',
        'Unexpected state (ID:', // generic match for any "Unexpected state (ID: ...)"
        've":-1',
        '__PRIVATE__fail',
        '__PRIVATE_TargetState',
        '__PRIVATE_WatchChangeAggregator',
        '__PRIVATE_AsyncQueueImpl',
        '__PRIVATE_PersistentListenStream',
        'DelayedOperation.handleDelayElapsed',
        '__PRIVATE_onWatchStreamChange'
      ];
      
      // Check message, stack, and stringified error
      const messageCheck = patterns.some(pattern => 
        errorMessage.includes(pattern) || 
        errorStack.includes(pattern) ||
        errorString.includes(pattern)
      );
      
      // Check for nested errors in context objects (like ID: b815 wrapping ca9)
      const contextCheck = error?.context?.Pc && 
        typeof error.context.Pc === 'string' &&
        error.context.Pc.includes('INTERNAL ASSERTION FAILED');
      
      return messageCheck || contextCheck;
    };

    // Helper: true if message is COOP/window.closed (Firebase popup polling)
    const isCOOPWindowClosedMessage = (message: string, args: any[]): boolean => {
      const errorString = args.map((arg: any) =>
        typeof arg === 'object' && arg !== null ? (() => { try { return JSON.stringify(arg); } catch { return String(arg); } })() : String(arg)
      ).join(' ');
      return (
        message.includes('Cross-Origin-Opener-Policy') ||
        message.includes('policy would block') ||
        message.includes('window.closed') ||
        message.includes('COOP') ||
        message.includes('opener-policy') ||
        (message.includes('block') && message.includes('window.closed')) ||
        errorString.includes('Cross-Origin-Opener-Policy') ||
        errorString.includes('policy would block') ||
        (errorString.includes('block') && errorString.includes('window.closed'))
      );
    };

    // Patch console.error to catch errors before Next.js overlay
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    let corruptionRecoveryTriggered = false;
    const warnBuckets =
      typeof window !== 'undefined'
        ? (window.__futureSeerWarnBuckets ??= new Map<string, number>())
        : new Map<string, number>();
    const WARN_THROTTLE_MS = 120_000;

    const triggerCorruptionRecovery = () => {
      if (corruptionRecoveryTriggered || typeof window === 'undefined') return;
      corruptionRecoveryTriggered = true;
      devLog.warn('🔄 Critical Firestore corruption detected. Clearing cache and reloading...', undefined, 'FirestoreErrorSuppressor');
      indexedDB.databases?.()
        .then((databases: { name?: string }[]) => {
          databases.forEach((db) => {
            if (db.name?.includes('firestore')) {
              indexedDB.deleteDatabase(db.name);
              devLog.debug('🗑️ Deleted corrupted Firestore DB:', db.name);
            }
          });
        })
        .catch(() => devLog.warn('Could not clear IndexedDB', undefined, 'FirestoreErrorSuppressor'));
      setTimeout(() => {
        window.location.href = window.location.pathname;
      }, 500);
    };

    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      
      // Stringify error objects to check their content
      const errorString = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      // Check for COOP (Cross-Origin-Opener-Policy) errors from Firebase polling
      // These are logged directly by Firebase's bundled code and must be caught here
      if (errorMessage.includes('Cross-Origin-Opener-Policy') || 
          errorMessage.includes('policy would block') ||
          errorMessage.includes('policy would block the window.closed call') ||
          errorMessage.includes('window.closed') ||
          errorMessage.includes('COOP') ||
          errorMessage.includes('opener-policy') ||
          errorString.includes('Cross-Origin-Opener-Policy') ||
          errorString.includes('policy would block') ||
          (errorMessage.includes('block') && errorMessage.includes('window.closed'))) {
        // Completely suppress COOP errors - they're browser security features, not actual errors
        // Firebase's internal polling mechanism triggers these warnings
        return; // Don't log as error
      }
      
      if (isFirestoreInternalError({ message: errorMessage })) {
        devLog.warn('⚠️ FirestoreErrorSuppressor suppressed console.error:', errorMessage, 'FirestoreErrorSuppressor');
        if (
          (errorMessage.includes('INTERNAL ASSERTION FAILED') && errorMessage.includes('Unexpected state')) ||
          errorString.includes('Unexpected state (ID:')
        ) {
          triggerCorruptionRecovery();
        }
        return;
      }
      
      // Check for Firestore write channel errors in last login updates
      // Handle both string messages and error objects
      const isLastLoginError = errorMessage.includes('Error updating last login') || 
                                errorString.includes('Error updating last login');
      
      if (isLastLoginError) {
        // Check for various error patterns that indicate write channel or non-critical errors
        const isWriteChannelError = errorMessage.includes('400') || 
                                     errorMessage.includes('Bad Request') || 
                                     errorMessage.includes('Write channel') ||
                                     errorMessage === '{}' ||
                                     errorMessage === 'Object' ||
                                     errorString.includes('400') ||
                                     errorString.includes('Bad Request') ||
                                     errorString.includes('Write channel') ||
                                     // Check if the error object itself indicates a write channel issue
                                     (args[1] && typeof args[1] === 'object' && 
                                      (args[1].code === 'unavailable' || 
                                       args[1].code === 'deadline-exceeded' ||
                                       args[1].message?.includes('Write channel')));
        
        if (isWriteChannelError) {
          // Suppress write channel errors - they're non-critical and often transient
          return; // Don't log as error
        }
      }
      
      originalConsoleError.apply(console, args);
    };

    // Patch console.warn to suppress COOP/window.closed (Firebase popup polling)
    console.warn = (...args: any[]) => {
      const message = args.map((a: any) => (typeof a === 'string' ? a : String(a))).join(' ');
      if (isCOOPWindowClosedMessage(message, args)) return;
      if (
        message.includes('Server read failed, using cache') ||
        message.includes('Profile fetch hit known Firestore quirk') ||
        message.includes('Server read permission transient')
      ) {
        const key = message.includes('Server read failed')
          ? 'server_read_failed'
          : message.includes('Profile fetch hit known Firestore quirk')
            ? 'profile_fetch_benign'
            : 'server_read_permission_transient';
        const now = Date.now();
        const last = warnBuckets.get(key) ?? 0;
        if (now - last < WARN_THROTTLE_MS) return;
        warnBuckets.set(key, now);
      }
      originalConsoleWarn.apply(console, args);
    };

    // Patch unhandledrejection handler - must be set up FIRST with capture phase
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || event.reason?.toString() || '';
      
      // Suppress COOP errors from Firebase polling
      if (errorMessage.includes('Cross-Origin-Opener-Policy') || 
          errorMessage.includes('policy would block') ||
          errorMessage.includes('policy would block the window.closed call') ||
          errorMessage.includes('window.closed') ||
          errorMessage.includes('COOP') ||
          errorMessage.includes('opener-policy') ||
          (errorMessage.includes('block') && errorMessage.includes('window.closed'))) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
      
      if (isFirestoreInternalError(event.reason)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Patch error handler - must be set up FIRST with capture phase
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.message || '';
      
      // Suppress COOP errors from Firebase polling
      if (errorMessage.includes('Cross-Origin-Opener-Policy') || 
          errorMessage.includes('policy would block') ||
          errorMessage.includes('policy would block the window.closed call') ||
          errorMessage.includes('window.closed') ||
          errorMessage.includes('COOP') ||
          errorMessage.includes('opener-policy') ||
          (errorMessage.includes('block') && errorMessage.includes('window.closed'))) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
      
      if (isFirestoreInternalError(event.error) || isFirestoreInternalError({ message: event.message })) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Use capture phase (true) to catch errors before Next.js
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    window.addEventListener('error', handleError, true);

    // Also patch window.onerror and window.onunhandledrejection directly
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const errorMessage = String(message) || error?.message || '';
      
      // Suppress COOP errors from Firebase polling
      if (errorMessage.includes('Cross-Origin-Opener-Policy') || 
          errorMessage.includes('policy would block') ||
          errorMessage.includes('policy would block the window.closed call') ||
          errorMessage.includes('window.closed') ||
          errorMessage.includes('COOP') ||
          errorMessage.includes('opener-policy') ||
          (errorMessage.includes('block') && errorMessage.includes('window.closed'))) {
        return true; // Suppress error
      }
      
      if (isFirestoreInternalError(error) || isFirestoreInternalError({ message: String(message) })) {
        return true; // Suppress error
      }
      if (originalOnError) {
        return originalOnError.call(window, message, source, lineno, colno, error);
      }
      return false;
    };

    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = ((event: PromiseRejectionEvent) => {
      if (isFirestoreInternalError(event.reason)) {
        event.preventDefault();
        return false;
      }
      if (originalOnUnhandledRejection) {
        return originalOnUnhandledRejection.call(window, event);
      }
    }) as any;

    // Cleanup
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      window.removeEventListener('error', handleError, true);
    };
  }, []);

  return null; // This component doesn't render anything
}

