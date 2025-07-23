import { useState } from "react";

export function useIChing() {
  const [question, setQuestion] = useState("");
  const [method, setMethod] = useState("");
  const [hexagrams, setHexagrams] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performIChingReading() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample I Ching analysis" });
      setIsLoading(false);
    }, 1000);
  }

  function resetData() {
    setQuestion("");
    setMethod("");
    setHexagrams("");
    setAnalysis(null);
    setError(null);
  }

  return {
    question,
    method,
    hexagrams,
    analysis,
    isLoading,
    error,
    setQuestion,
    setMethod,
    performIChingReading,
    resetData,
  };
} 