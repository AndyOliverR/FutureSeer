import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { faceReadingIntelligence, FaceReadingAnalysis } from "@/lib/faceReadingIntelligence";

export function useFaceReading() {
  const { user, userProfile } = useAuth();
  const [faceData, setFaceData] = useState({
    eyeShape: "",
    noseType: "",
    mouthShape: "",
    foreheadType: "",
    analysisFocus: "",
  });
  const [analysis, setAnalysis] = useState<FaceReadingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-analyze when face image is available
  useEffect(() => {
    const autoAnalyze = async () => {
      if (!user || !userProfile?.facePhotoUrl) {
        // No face image available
        return;
      }

      // Check if we already have analysis for this image
      const cachedAnalysis = localStorage.getItem(`face-reading-analysis-${user.uid}`);
      if (cachedAnalysis) {
        try {
          const parsed = JSON.parse(cachedAnalysis);
          // Check if analysis is still valid (same image URL)
          if (parsed.imageUrl === userProfile.facePhotoUrl && parsed.analysis) {
            setAnalysis(parsed.analysis);
            return;
          }
        } catch (e) {
          // Invalid cache, continue to new analysis
        }
      }

      // Calculate age from birth date
      let age = 30; // Default
      if (userProfile.birthDate) {
        const birthDate = new Date(userProfile.birthDate);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("👁️ Auto-analyzing face image...");
        const analysisResult = await faceReadingIntelligence.analyzeFace(
          age,
          (userProfile.gender || "other") as 'male' | 'female' | 'other',
          userProfile.facePhotoUrl
        );

        setAnalysis(analysisResult);

        // Cache the analysis
        if (user?.uid) {
          localStorage.setItem(
            `face-reading-analysis-${user.uid}`,
            JSON.stringify({
              imageUrl: userProfile.facePhotoUrl,
              analysis: analysisResult,
              timestamp: Date.now(),
            })
          );
        }
      } catch (err: any) {
        console.error("Error auto-analyzing face:", err);
        setError(err.message || "Failed to analyze face image");
      } finally {
        setIsLoading(false);
      }
    };

    autoAnalyze();
  }, [user, userProfile?.facePhotoUrl, userProfile?.gender, userProfile?.birthDate]);

  // Real face reading logic using faceReadingIntelligence
  const performFaceReading = useCallback(async (imageUrl?: string) => {
    // If image URL is provided, use it instead of manual input
    if (!imageUrl && (!faceData.eyeShape || !faceData.noseType || !faceData.mouthShape || !faceData.foreheadType || !faceData.analysisFocus)) {
      setError('Please provide all facial features and select an analysis focus, or ensure you have uploaded a face photo in your profile')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Calculate age from birth date if available
      let age = 30 // Default age
      const gender = (userProfile?.gender || 'other') as 'male' | 'female' | 'other'
      
      if (userProfile?.birthDate) {
        const birthDate = new Date(userProfile.birthDate)
        const today = new Date()
        age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
      }

      console.log('👁️ Starting face reading analysis...', {
        imageUrl: imageUrl || 'manual input',
        eyeShape: faceData.eyeShape,
        noseType: faceData.noseType,
        mouthShape: faceData.mouthShape,
        foreheadType: faceData.foreheadType,
        analysisFocus: faceData.analysisFocus,
        age,
        gender
      })

      console.log('👁️ Calling faceReadingIntelligence.analyzeFace...')
      const faceAnalysis = await faceReadingIntelligence.analyzeFace(age, gender, imageUrl)

      console.log('👁️ Face reading analysis completed:', {
        id: faceAnalysis.id,
        energyScore: faceAnalysis.energyScore,
        dominantFeatures: faceAnalysis.dominantFeatures
      })

      setAnalysis(faceAnalysis)

      // Cache the analysis if image URL is provided
      if (imageUrl && user?.uid) {
        localStorage.setItem(
          `face-reading-analysis-${user.uid}`,
          JSON.stringify({
            imageUrl,
            analysis: faceAnalysis,
            timestamp: Date.now(),
          })
        )
      }

      setIsLoading(false)
      console.log('👁️ Analysis state updated successfully')
    } catch (err) {
      console.error('❌ Face reading analysis error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform face reading'
      console.error('❌ Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace',
        error: err
      })
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [faceData, user, userProfile])

  function resetData() {
    setFaceData({
      eyeShape: "",
      noseType: "",
      mouthShape: "",
      foreheadType: "",
      analysisFocus: "",
    });
    setAnalysis(null);
    setError(null);
  }

  return {
    faceData,
    setFaceData,
    analysis,
    isLoading,
    error,
    performFaceReading,
    resetData,
  };
}

/** Alias for components that expect { faceReadingData, loading, error, refresh, isStale }. */
export function useFaceReadingData() {
  const r = useFaceReading();
  return {
    faceReadingData: r.analysis,
    loading: r.isLoading,
    error: r.error,
    refresh: r.resetData,
    isStale: false,
  };
} 