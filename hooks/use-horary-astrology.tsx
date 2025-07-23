"use client"

import { useState } from "react";

export function useHoraryAstrology() {
  const [question, setQuestion] = useState("");
  const [questionTime, setQuestionTime] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performHoraryAnalysis() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample horary analysis" });
      setIsLoading(false);
    }, 1000);
  }

  function resetData() {
    setQuestion("");
    setQuestionTime("");
    setAnalysis(null);
    setError(null);
  }

  return {
    question,
    questionTime,
    analysis,
    isLoading,
    error,
    setQuestion,
    setQuestionTime,
    performHoraryAnalysis,
    resetData,
  };
} 