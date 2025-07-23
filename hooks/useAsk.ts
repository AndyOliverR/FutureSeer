import { useState } from 'react';
import { getAstroData, getSymbolicData, generateAIPrediction, getRemedies } from '@/lib/api';
import { saveAskHistory } from '@/lib/firebase';

export interface AskResult {
  question: string;
  aiSummary: string;
  scientificData: any;
  symbolicData: any;
  remedies: string[];
  timestamp: number;
}

export function useAsk({ user, userProfile }: { user: any; userProfile: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResult | null>(null);

  const ask = async (question: string) => {
    if (!question.trim()) {
      setError('Please enter a question to seek guidance from the universe.');
      return;
    }
    if (!userProfile?.birthDate || !userProfile?.birthPlace) {
      setError('Birth date and place are required.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Use comprehensive astro data service with userId for caching
      const astroData = await getAstroData(userProfile.birthDate, userProfile.birthPlace, user?.uid);
      const symbolicData = getSymbolicData(question, astroData);
      const aiSummary = await generateAIPrediction(question, astroData, symbolicData);
      const remedyObjects = getRemedies(symbolicData, question);
      const remedyList = remedyObjects.map(remedy => `${remedy.icon} ${remedy.title}: ${remedy.desc}`);
      const prediction: AskResult = {
        question,
        aiSummary,
        scientificData: astroData,
        symbolicData,
        remedies: remedyList,
        timestamp: Date.now(),
      };
      setResult(prediction);
      
      // Save to Firebase
      if (user?.uid) {
        try {
          await saveAskHistory({
            uid: user.uid,
            question,
            aiSummary,
            scientificData: astroData,
            symbolicData,
            remedies: remedyList,
            timestamp: Date.now(),
          });
        } catch (historyError) {
          // Log but do not surface to user
          console.error('Error saving to history:', historyError);
        }
      }
    } catch (error: any) {
      console.error('Error in ask:', error);
      setError(error.message || 'Failed to get guidance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    ask,
    result,
    loading,
    error,
  };
} 