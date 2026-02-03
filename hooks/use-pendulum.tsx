"use client"

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export interface PendulumAnalysis {
  question: string;
  pendulumType?: string;
  answer: 'yes' | 'no' | 'maybe';
  confidence: number;
  swingDirection: 'front-back' | 'side-side' | 'clockwise' | 'counterclockwise';
  interpretation: string;
  summary: string;
  advice: string[];
  guidance?: {
    programming?: string;
    usage?: string[];
    cleansing?: string;
  };
}

export function usePendulum() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [pendulumType, setPendulumType] = useState("");
  const [analysis, setAnalysis] = useState<PendulumAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function performPendulumReading() {
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tools/pendulum/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          pendulumType: pendulumType || undefined,
          userId: user?.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate pendulum reading');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAnalysis(result.data);
      } else {
        throw new Error(result.error || 'Invalid response from server');
      }
    } catch (err: any) {
      console.error("Error performing pendulum reading:", err);
      setError(err.message || "Failed to perform pendulum reading");
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }

  function resetData() {
    setQuestion("");
    setPendulumType("");
    setAnalysis(null);
    setError(null);
  }

  return {
    question,
    setQuestion,
    pendulumType,
    setPendulumType,
    analysis,
    isLoading,
    error,
    performPendulumReading,
    resetData,
  };
} 