'use client';

import { useState } from "react";

export function useVastu() {
  const [propertyData, setPropertyData] = useState({
    type: "",
    propertyType: "",
    plotShape: "",
    entranceDirection: "",
    constructionYear: "",
    analysisFocus: "",
    rooms: [],
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performVastuAnalysis() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample vastu analysis" });
      setIsLoading(false);
    }, 1000);
  }

  function resetData() {
    setPropertyData({
      type: "",
      propertyType: "",
      plotShape: "",
      entranceDirection: "",
      constructionYear: "",
      analysisFocus: "",
      rooms: [],
    });
    setAnalysis(null);
    setError(null);
  }

  return {
    propertyData,
    setPropertyData,
    analysis,
    isLoading,
    error,
    performVastuAnalysis,
    resetData,
  };
} 