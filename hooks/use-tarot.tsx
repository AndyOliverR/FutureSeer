import { useState } from "react";

export function useTarot() {
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performTarotReading() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample tarot analysis" });
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
    spreadType,
    analysis,
    isLoading,
    error,
    setQuestion,
    setSpreadType,
    performTarotReading,
    resetData,
  };
} 