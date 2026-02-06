'use client';

import { useState } from "react";

export function useWesternAstrology() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performWesternAstrologyAnalysis() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample western astrology analysis" });
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

  const analyze = (params: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
  }) => {
    setBirthDate(params.birthDate);
    setBirthTime(params.birthTime);
    setBirthPlace(params.birthPlace);
    performWesternAstrologyAnalysis();
  };

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
    data: analysis,
    isLoading,
    loading: isLoading,
    error,
    analyze,
    performWesternAstrologyAnalysis,
    resetData,
  };
} 