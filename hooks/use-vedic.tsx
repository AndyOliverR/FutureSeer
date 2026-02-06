'use client';

import { useState } from "react";

export function useVedic() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performVedicAnalysis() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample vedic analysis" });
      setIsLoading(false);
    }, 1000);
  }

  function resetData() {
    setName("");
    setBirthDate("");
    setBirthTime("");
    setBirthPlace("");
    setAnalysis(null);
    setError(null);
  }

  return {
    name,
    setName,
    birthDate,
    setBirthDate,
    birthTime,
    setBirthTime,
    birthPlace,
    setBirthPlace,
    analysis,
    vedicData: analysis,
    isLoading,
    error,
    performVedicAnalysis,
    resetData,
  };
} 