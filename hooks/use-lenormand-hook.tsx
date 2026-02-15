"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { lenormandIntelligence, LenormandReading } from "@/lib/lenormandIntelligence";

export interface LenormandReadingResponse {
  question: string;
  spreadType: string;
  reading: LenormandReading | null;
  isLoading: boolean;
  error: string | null;
}

export function useLenormand() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState("");
  const [reading, setReading] = useState<LenormandReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load last saved reading on mount so Ask the Seer tab has a reading after refresh or return
  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      const history = await lenormandIntelligence.getReadingHistory(user.uid, 1);
      if (cancelled) return;
      if (history.length > 0) {
        const last = history[0];
        const normalized = {
          ...last,
          timestamp: last.timestamp instanceof Date ? last.timestamp : new Date((last as unknown as { timestamp: string }).timestamp),
        };
        setReading((prev) => (prev !== null ? prev : (normalized as LenormandReading)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  async function performLenormandReading() {
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    if (!spreadType.trim()) {
      setError("Please select a spread");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tools/lenormand/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          spreadType: spreadType.trim(),
          userId: user?.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate Lenormand reading');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Convert timestamp back to Date
        const readingData = {
          ...result.data,
          timestamp: new Date(result.data.timestamp)
        };
        setReading(readingData as LenormandReading);
      } else {
        throw new Error(result.error || 'Invalid response from server');
      }
    } catch (err: any) {
      console.error("Error performing Lenormand reading:", err);
      setError(err.message || "Failed to perform Lenormand reading");
      setReading(null);
    } finally {
      setIsLoading(false);
    }
  }

  function resetData() {
    setQuestion("");
    setSpreadType("");
    setReading(null);
    setError(null);
  }

  return {
    question,
    setQuestion,
    spreadType,
    setSpreadType,
    reading,
    isLoading,
    error,
    performLenormandReading,
    resetData,
  };
} 