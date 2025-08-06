"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, ArrowRight, Sparkles } from "lucide-react";

export function ProfileCompletionNotice() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // Don't show if loading or not authenticated
  if (loading || !user) return null;

  // Don't show if profile is already complete
  if (userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <Card className="backdrop-blur-md bg-slate-900/90 border border-amber-500/30 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-amber-400" />
            <CardTitle className="text-lg text-amber-200">Complete Your Profile ✨</CardTitle>
          </div>
          <CardDescription className="text-slate-300">
            Add your birth details to unlock personalized readings and insights.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm text-slate-300">
              Your profile completion will trigger:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 ml-4">
              <li>• Personalized astrological readings</li>
              <li>• Numerological calculations</li>
              <li>• Tarot interpretations</li>
              <li>• AI-powered insights</li>
              <li>• Dashboard analytics</li>
            </ul>
          </div>
          
          <Button
            onClick={() => router.push("/profile-setup")}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold"
          >
            Complete Profile Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
} 