import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ichingIntelligence, IChingAnalysis } from "@/lib/ichingIntelligence";

export function useIChing() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [method, setMethod] = useState<"coins" | "yarrow" | "random" | "">("");
  const [hexagrams, setHexagrams] = useState("");
  const [analysis, setAnalysis] = useState<IChingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function performIChingReading() {
    console.log('🔮 useIChing: performIChingReading called', { question: question.trim(), method });
    
    if (!question.trim()) {
      console.warn('⚠️ useIChing: No question provided');
      setError("Please enter a question");
      return;
    }

    if (!method || (method !== "coins" && method !== "yarrow" && method !== "random")) {
      console.warn('⚠️ useIChing: No method selected');
      setError("Please select a consultation method");
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('🔮 useIChing: Starting I Ching consultation...');

    try {
      // Call the intelligence layer
      console.log('🔮 useIChing: Calling ichingIntelligence.consultIChing...');
      const result = await ichingIntelligence.consultIChing(
        question.trim(),
        method as "coins" | "yarrow" | "random"
      );

      console.log('✅ useIChing: Result received from consultIChing:', result);
      console.log('🔮 useIChing: Setting analysis state...');
      setAnalysis(result);
      console.log('✅ useIChing: Analysis state updated');

      // Save to Firebase if user is authenticated
      if (user && result) {
        try {
          console.log('💾 useIChing: Saving analysis to Firebase for user:', user.uid);
          await ichingIntelligence.saveAnalysis(user.uid, result);
          console.log('✅ useIChing: Analysis saved to Firebase');
        } catch (saveError) {
          console.error("❌ useIChing: Failed to save I Ching reading:", saveError);
          // Don't throw - saving is optional
        }
      }
    } catch (err: any) {
      console.error("❌ useIChing: Error performing I Ching reading:", err);
      console.error("❌ useIChing: Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message || "Failed to perform I Ching consultation");
      setAnalysis(null);
    } finally {
      setIsLoading(false);
      console.log('🔮 useIChing: Loading state set to false');
    }
  }

  function resetData() {
    setQuestion("");
    setMethod("");
    setHexagrams("");
    setAnalysis(null);
    setError(null);
  }

  return {
    question,
    method,
    hexagrams,
    analysis,
    isLoading,
    error,
    setQuestion,
    setMethod,
    performIChingReading,
    resetData,
  };
} 