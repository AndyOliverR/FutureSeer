"use client"

import { useState } from "react";

export function useLenormand() {
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Placeholder function for performing a reading
  function performLenormandReading() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({
        summary: "This is a placeholder Lenormand reading.",
        cards: [],
        interpretation: "Practical wisdom will appear here.",
      });
      setIsLoading(false);
    }, 1200);
  }

  // Placeholder function to reset data
  function resetData() {
    setQuestion("");
    setSpreadType("");
    setAnalysis(null);
    setError(null);
  }

  return {
    question,
    setQuestion,
    spreadType,
    setSpreadType,
    analysis,
    isLoading,
    error,
    performLenormandReading,
    resetData,
  };
} 