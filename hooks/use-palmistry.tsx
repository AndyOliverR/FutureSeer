"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { palmistryIntelligence, PalmistryAnalysis } from "@/lib/palmistryIntelligence";

export function usePalmistry() {
  const { user, userProfile } = useAuth();
  const [handType, setHandType] = useState<"dominant" | "non-dominant" | "both" | "">("");
  const [palmData, setPalmData] = useState<any>({});
  const [analysis, setAnalysis] = useState<PalmistryAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unified analysis function
  const performAnalysis = useCallback(async (forceNew: boolean = false) => {
    if (!user || !userProfile) {
      setError("Please sign in to analyze your palm");
      return;
    }

    // Check cache if not forcing new analysis
    if (!forceNew && user.uid) {
      const cachedAnalysis = localStorage.getItem(`palmistry-analysis-${user.uid}`);
      if (cachedAnalysis) {
        try {
          const parsed = JSON.parse(cachedAnalysis);
          // Check if analysis is still valid (same image URL or recent)
          const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000; // 24 hours
          if (parsed.imageUrl === userProfile.palmPhotoUrl && parsed.analysis && isRecent) {
            setAnalysis(parsed.analysis);
            return;
          }
        } catch (e) {
          // Invalid cache, continue to new analysis
        }
      }
    }

    // Determine hand type based on gender (traditional palmistry) or user selection
    let dominantHand: "left" | "right" = "right";
    let hand: "left" | "right" | "both" = "both";
    
    if (handType === "dominant") {
      hand = dominantHand;
    } else if (handType === "non-dominant") {
      hand = dominantHand === "left" ? "right" : "left";
    } else if (userProfile.gender === "male") {
      dominantHand = "right";
      hand = "right";
    } else if (userProfile.gender === "female") {
      dominantHand = "right";
      hand = "left";
    }

    // Calculate age from birth date
    let age = 30; // Default
    if (userProfile.birthDate) {
      const birthDate = new Date(userProfile.birthDate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🤲 Analyzing palm...");
      const analysisResult = await palmistryIntelligence.analyzePalm(
        hand,
        dominantHand,
        age,
        userProfile.gender || "other",
        userProfile.palmPhotoUrl
      );

      setAnalysis(analysisResult);
      setHandType(hand === "both" ? "both" : hand === dominantHand ? "dominant" : "non-dominant");

      // Cache the analysis
      if (user.uid) {
        localStorage.setItem(
          `palmistry-analysis-${user.uid}`,
          JSON.stringify({
            imageUrl: userProfile.palmPhotoUrl || "",
            analysis: analysisResult,
            timestamp: Date.now(),
          })
        );
      }
    } catch (err: any) {
      console.error("Error analyzing palm:", err);
      const errorMessage = err.message || "Failed to analyze palm";
      setError(errorMessage);
      
      // If error is retryable (5xx errors), suggest retry
      if (err.retryable || errorMessage.includes('network') || errorMessage.includes('timeout')) {
        setError(`${errorMessage} - Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, userProfile, handType, palmData]);

  // Auto-analyze when palm image is available
  useEffect(() => {
    if (user && userProfile?.palmPhotoUrl) {
      performAnalysis(false);
    }
  }, [user, userProfile?.palmPhotoUrl]);

  // Manual analysis trigger
  const performPalmistryAnalysis = useCallback(async () => {
    if (!user || !userProfile) {
      setError("Please sign in to analyze your palm");
      return;
    }

    if (!userProfile.palmPhotoUrl && (!palmData.lifeLine || !palmData.heartLine || !palmData.headLine)) {
      setError("Please upload a palm image or provide palm features manually");
      return;
    }

    await performAnalysis(true);
  }, [performAnalysis, user, userProfile, palmData]);

  const resetData = useCallback(() => {
    setHandType("");
    setPalmData({});
    setAnalysis(null);
    setError(null);
    if (user?.uid) {
      localStorage.removeItem(`palmistry-analysis-${user.uid}`);
    }
  }, [user?.uid]);

  return {
    handType,
    palmData,
    analysis,
    isLoading,
    error,
    setHandType,
    setPalmData,
    performPalmistryAnalysis,
    resetData,
  };
}
