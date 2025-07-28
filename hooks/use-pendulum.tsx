"use client"

import { useState } from "react";

export function usePendulum() {
  const [question, setQuestion] = useState("");
  const [pendulumType, setPendulumType] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performPendulumReading() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample pendulum reading" });
      setIsLoading(false);
    }, 1000);
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