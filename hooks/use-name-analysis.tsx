'use client';

import { useState } from "react";

export function useNameAnalysis() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performNameAnalysis() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample name analysis" });
      setIsLoading(false);
    }, 1000);
  }

  function resetData() {
    setName("");
    setBirthDate("");
    setAnalysis(null);
    setError(null);
  }

  return {
    name,
    setName,
    birthDate,
    setBirthDate,
    analysis,
    isLoading,
    error,
    performNameAnalysis,
    resetData,
  };
} 