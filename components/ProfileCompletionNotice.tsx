"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { User, Sparkles, BarChart3 } from "lucide-react";

export function ProfileCompletionNotice() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // Only show if user is signed in but profile is incomplete
  if (loading || !user || (userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace)) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <Alert className="backdrop-blur-md bg-slate-900/90 border border-amber-500/30 shadow-xl">
        <User className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-slate-200">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-amber-200 mb-2">Complete Your Profile for Personalized Readings</h4>
              <p className="text-sm text-slate-300">
                To unlock your personalized mystical insights, we need your birth details and photos. 
                This enables our AI to generate accurate predictions for:
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span className="text-slate-300">Astrology & Horoscope readings</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span className="text-slate-300">Numerology calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span className="text-slate-300">Palm reading analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3 text-amber-400" />
                <span className="text-slate-300">Personalized dashboard insights</span>
              </div>
            </div>

            <Button
              onClick={() => router.push("/profile-setup")}
              className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold"
            >
              Complete Profile Now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
} 