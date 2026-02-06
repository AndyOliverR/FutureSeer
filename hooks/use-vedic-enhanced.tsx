// Enhanced Vedic hook that uses comprehensive profile data
'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToolData } from "@/hooks/useToolData";

interface VedicAnalysis {
  tool: string;
  timestamp: string;
  userData: {
    fullName: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
    faceImage?: string;
    palmImage?: string;
  };
  birthChart?: any;
  aiAnalysis?: any;
  status: string;
}

export function useVedic() {
  const { user, userProfile } = useAuth();
  const { data: comprehensiveVedicData, isLoading: isComprehensiveLoading, error: comprehensiveError, refetch: refetchComprehensive } = useToolData('Vedic Astrology');
  
  // Legacy state for backward compatibility
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [faceImage, setFaceImage] = useState<string>("");
  const [palmImage, setPalmImage] = useState<string>("");
  const [analysis, setAnalysis] = useState<VedicAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing analysis when component mounts
  useEffect(() => {
    if (user?.uid) {
      loadExistingAnalysis();
    }
  }, [user?.uid]);

  // Update form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.fullName || "");
      setBirthDate(userProfile.birthDate || "");
      setBirthTime(userProfile.birthTime || "");
      setBirthPlace(userProfile.birthPlace || "");
      setFaceImage(userProfile.facePhotoUrl || "");
      setPalmImage(userProfile.palmPhotoUrl || "");
    }
  }, [userProfile]);

  const loadExistingAnalysis = async () => {
    try {
      const response = await fetch(`/api/tools/vedic/analysis?userId=${user?.uid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
          // Pre-fill form with existing data
          setName(data.analysis.userData.fullName || "");
          setBirthDate(data.analysis.userData.dateOfBirth || "");
          setBirthTime(data.analysis.userData.timeOfBirth || "");
          setBirthPlace(data.analysis.userData.placeOfBirth || "");
          setFaceImage(data.analysis.userData.faceImage || "");
          setPalmImage(data.analysis.userData.palmImage || "");
        }
      }
    } catch (error) {
      console.error('Error loading existing analysis:', error);
    }
  };

  const generateVedicAnalysis = async () => {
    if (!name || !birthDate || !birthTime || !birthPlace) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tools/vedic/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          userData: {
            fullName: name,
            dateOfBirth: birthDate,
            timeOfBirth: birthTime,
            placeOfBirth: birthPlace,
            faceImage,
            palmImage
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Vedic analysis');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVedicData = async () => {
    // First try to refresh comprehensive data
    await refetchComprehensive();
    
    // Then refresh legacy analysis
    await loadExistingAnalysis();
  };

  // Return comprehensive data if available, otherwise fall back to legacy data
  const vedicData = comprehensiveVedicData || analysis;
  const loading = isComprehensiveLoading || isLoading;
  const errorMessage = comprehensiveError || error;

  return {
    vedicData,
    loading,
    error: errorMessage,
    refreshVedicData,
    generateVedicAnalysis,
    // Legacy form state
    name,
    setName,
    birthDate,
    setBirthDate,
    birthTime,
    setBirthTime,
    birthPlace,
    setBirthPlace,
    faceImage,
    setFaceImage,
    palmImage,
    setPalmImage,
    // Legacy analysis state
    analysis,
    setAnalysis,
    isLoading,
    setIsLoading,
    setError
  };
}
