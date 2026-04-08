"use client";
import { useCallback, useEffect, useState } from 'react';
import { devLog } from '@/lib/devLogger';
import { useToast } from '@/components/ui/use-toast';

const ENABLE_SERVICE_WORKER = false;

/**
 * Service Worker Registration Component
 * Registers the service worker and handles updates
 */
export function ServiceWorkerRegistration() {
  const { toast } = useToast();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const showUpdateNotification = useCallback(() => {
    toast({
      title: "Update Available",
      description: "A new version of FutureSeer is available. Refresh to update.",
      action: (
        <button
          onClick={handleUpdate}
          className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
        >
          Refresh
        </button>
      ),
      duration: 10000, // Show for 10 seconds
    });
  }, [toast, registration]);

  const registerServiceWorker = useCallback(async () => {
    if (!ENABLE_SERVICE_WORKER) {
      devLog.info('[App] Service worker registration disabled by kill switch', undefined, 'ServiceWorkerRegistration');
      return;
    }
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setRegistration(reg);
      devLog.debug('[App] Service worker registered successfully');

      // Promptly check for a newer SW so hotfixes roll out quickly.
      try {
        await reg.update();
        devLog.debug('[App] Service worker update check completed');
      } catch (updateError) {
        devLog.warn('[App] Service worker immediate update check failed', updateError, 'ServiceWorkerRegistration');
      }

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            showUpdateNotification();
          }
        });
      });

      // Check for updates periodically (every hour)
      setInterval(() => {
        reg.update();
      }, 60 * 60 * 1000);

    } catch (error) {
      devLog.error('[App] Service worker registration failed:', error, 'ServiceWorkerRegistration');
    }
  }, [showUpdateNotification]);

  useEffect(() => {
    if (!ENABLE_SERVICE_WORKER) return;
    // Only register in production and if service workers are supported
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    // Register service worker
    void registerServiceWorker();

    // Cleanup on unmount
    return () => {
      // Service worker continues to run even after unmount
    };
  }, [registerServiceWorker]);

  const handleUpdate = useCallback(() => {
    if (!registration || !registration.waiting) return;

    // Tell service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload page when new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, [registration]);

  // This component doesn't render anything visible
  return null;
}
