"use client";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { MinimalNav } from "@/components/navigation/MinimalNav";

/**
 * Offline Fallback Page
 * Shown when the user is offline and tries to navigate to an uncached page
 */
export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 starfield-ultra-sharp">
      <MinimalNav />
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* Offline Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <WifiOff className="w-24 h-24 text-amber-400 animate-pulse" />
            <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight tracking-wide font-light">
          You're Offline
        </h1>

        {/* Description */}
        <div className="space-y-3">
          <p className="text-lg text-white/90 leading-relaxed font-light">
            It seems the cosmic connection has been interrupted.
          </p>
          <p className="text-base text-amber-400/80 leading-relaxed font-light">
            Don't worry — some pages and features are still available from your cached data.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            size="lg"
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 font-normal rounded-2xl"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="border-2 border-amber-500/50 hover:bg-amber-500/10 text-white rounded-2xl"
          >
            Go Back
          </Button>
        </div>

        {/* Helpful Info */}
        <div className="pt-8 border-t border-amber-400/20">
          <p className="text-sm text-amber-400/60 leading-relaxed font-light">
            Tip: Check your internet connection and try again. Cached pages will continue to work offline.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-4 pt-6 opacity-40">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
}
