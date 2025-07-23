"use client"

import { useState } from "react";

export function useKPAstrology() {
  const [birthData, setBirthData] = useState({
    name: "",
    birthDateTime: "",
    birthPlace: "",
    analysisFocus: "",
  });
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performKPAnalysis() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample KP astrology analysis" });
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
    performKPAnalysis,
    resetData,
  };
} 