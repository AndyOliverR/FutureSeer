import { useState } from "react";

export function useRunes() {
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performRuneReading() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample rune reading" });
      setIsLoading(false);
    }, 1000);
  }

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
    performRuneReading,
    resetData,
  };
} 