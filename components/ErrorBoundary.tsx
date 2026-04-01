'use client';

import React from 'react';
import { devLog } from '@/lib/devLogger';
import { logClientError } from '@/lib/errorLogging';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
}

// Function to check if an error is a Firestore internal assertion error
const isFirestoreInternalError = (error: Error | any): boolean => {
  const errorMessage = error?.message || error?.toString() || '';
  const errorStack = error?.stack || '';
  
  // Check for various Firestore internal error patterns
  const patterns = [
    'INTERNAL ASSERTION FAILED',
    'FIRESTORE',
    'Firestore',
    'Unexpected state (ID: ca9)',
    'Unexpected state (ID: b815)',
    've":-1',
    '__PRIVATE__fail',
    '__PRIVATE_TargetState',
    '__PRIVATE_WatchChangeAggregator',
    '__PRIVATE_AsyncQueueImpl',
    'DelayedOperation.handleDelayElapsed'
  ];
  
  // Check if error message or stack contains Firestore internal error patterns
  const messageCheck = patterns.some(pattern => 
    errorMessage.includes(pattern) || errorStack.includes(pattern)
  );
  
  // Also check for nested errors in context objects (like ID: b815)
  const contextCheck = error?.context?.Pc && 
    typeof error.context.Pc === 'string' &&
    error.context.Pc.includes('INTERNAL ASSERTION FAILED');
  
  return messageCheck || contextCheck;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Suppress Firestore internal errors - don't show error boundary
    if (isFirestoreInternalError(error)) {
      devLog.warn('⚠️ ErrorBoundary suppressed Firestore internal error:', error.message, 'ErrorBoundary');
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Suppress Firestore internal errors - don't log as errors
    if (isFirestoreInternalError(error)) {
      devLog.warn('⚠️ ErrorBoundary suppressed Firestore internal error:', error.message, 'ErrorBoundary');
      return;
    }
    devLog.error('ErrorBoundary caught an error', { error, errorInfo }, 'ErrorBoundary');
    const browser =
      typeof navigator !== 'undefined'
        ? `${navigator.userAgent} | ${navigator.language || ''}`
        : undefined;
    void logClientError({
      area: 'react',
      action: 'error-boundary',
      message: `${error.name}: ${error.message}`.slice(0, 800),
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
      browser,
      meta: {
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-400 mb-4">🔮 Something went wrong</h1>
            <p className="text-gray-300 mb-4">
              FutureSeer encountered an unexpected error. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;



