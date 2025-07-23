import { useState } from "react";

export function usePalmistry() {
  const [handType, setHandType] = useState("");
  const [palmData, setPalmData] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function performPalmistryAnalysis() {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis({ result: "Sample palmistry analysis" });
      setIsLoading(false);
    }, 1000);
  }

  function resetData() {
    setHandType("");
    setPalmData("");
    setAnalysis(null);
    setError(null);
  }

  return {
    handType,
    palmData,
    analysis,
    isLoading,
    error,
    setHandType,
    setPalmData,
    performPalmistryAnalysis,
    resetData,
  };
} 