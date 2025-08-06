"use client";

import { useEffect, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isReady, setIsReady] = useState(false);
  const [initializationStep, setInitializationStep] = useState('Starting...');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Step 1: Check if this is a fresh load
        setInitializationStep('Checking session...');
        const isFreshLoad = !sessionStorage.getItem('appInitialized');
        
        if (isFreshLoad) {
          // Step 2: Mark as initialized
          sessionStorage.setItem('appInitialized', 'true');
          
          // Step 3: Register service worker for better performance
          setInitializationStep('Setting up app cache...');
          if ('serviceWorker' in navigator) {
            try {
              await navigator.serviceWorker.register('/sw.js');
              console.log('Service Worker registered successfully');
            } catch (error) {
              console.log('Service Worker registration failed:', error);
            }
          }
          
          // Step 4: Pre-initialize Firebase
          setInitializationStep('Initializing Firebase...');
          const { getFirebaseAuth } = await import('@/lib/firebase');
          await getFirebaseAuth();
          
          setInitializationStep('Loading user data...');
          
          // Step 5: Small delay to ensure everything is ready
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        setInitializationStep('Ready!');
        setIsReady(true);
        
      } catch (error) {
        console.error('App initialization error:', error);
        // Even if there's an error, we should still show the app
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-amber-200 mt-4 text-lg">Initializing FutureSeer...</p>
          <p className="text-amber-300/60 mt-2 text-sm">{initializationStep}</p>
          <div className="mt-4 text-xs text-amber-300/40">
            <p>✨ Preparing your mystical journey</p>
            <p>🔮 Connecting to cosmic energies</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 