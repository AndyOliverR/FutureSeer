"use client"

import { useState } from "react";

export function useBaZi() {
  const [birthData, setBirthData] = useState({
    name: "",
    birthDateTime: "",
    birthPlace: "",
    analysisFocus: "",
  });
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Placeholder logic for actions
  function performBaZiAnalysis() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample analysis" });
      setIsLoading(false);
    }, 1000);
  }

  function resetData() {
    setBirthData({
      name: "",
      birthDateTime: "",
      birthPlace: "",
      analysisFocus: "",
    });
    setAnalysis(null);
    setError(null);
  }

  return {
    birthData,
    setBirthData,
    analysis,
    isLoading,
    error,
    performBaZiAnalysis,
    resetData,
  };
} 