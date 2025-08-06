"use client";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Check if this is the first load
    const isFirstLoad = !sessionStorage.getItem('appInitialized');
    
    if (isFirstLoad) {
      // Mark as initialized
      sessionStorage.setItem('appInitialized', 'true');
      
      // Force a small delay to ensure Firebase is properly initialized
      const timer = setTimeout(() => {
        setIsReady(true);
        setHasInitialized(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Not first load, ready immediately
      setIsReady(true);
      setHasInitialized(true);
    }
  }, []);

  // Auto-refresh mechanism for Firebase connection issues
  useEffect(() => {
    if (!hasInitialized) return;

    const checkFirebaseConnection = () => {
      // Check if Firebase is properly connected
      const firebaseReady = typeof window !== 'undefined' && 
        window.firebase && 
        window.firebase.auth;
      
      if (!firebaseReady) {
        // If Firebase isn't ready after 3 seconds, trigger a soft refresh
        setTimeout(() => {
          if (!window.firebase?.auth) {
            console.log('Firebase not ready, refreshing...');
            window.location.reload();
          }
        }, 3000);
      }
    };

    const timer = setTimeout(checkFirebaseConnection, 2000);
    return () => clearTimeout(timer);
  }, [hasInitialized]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-amber-200 mt-4 text-lg">Initializing FutureSeer...</p>
          <p className="text-amber-300/60 mt-2 text-sm">Preparing your mystical journey</p>
        </div>
      </div>
    );
  }

  return <AuthProvider>{children}</AuthProvider>;
}