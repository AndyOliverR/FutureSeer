"use client"

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToolData } from "./useToolData";
import { dreamSymbolsIntelligence, DreamData, DreamAnalysis, DreamSymbol } from "@/lib/dreamSymbolsIntelligence";
import { fetchWithFirebaseAuthRequired } from "@/lib/clientFirebaseFetch";

export interface DreamSymbolsHookResult {
  // Profile data (from comprehensive profile)
  profileData: any | null;
  profileLoading: boolean;
  profileError: string | null;
  
  // User input state
  dreamDescription: string;
  setDreamDescription: (value: string) => void;
  symbols: string;
  setSymbols: (value: string) => void;
  
  // Analysis state
  analysis: DreamAnalysis | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  performDreamAnalysis: () => Promise<void>;
  resetData: () => void;
  refetchProfile: () => void;
}

export function useDreamSymbols(): DreamSymbolsHookResult {
  const { user } = useAuth();
  const [dreamDescription, setDreamDescription] = useState("");
  const [symbols, setSymbols] = useState("");
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Fetch profile data using the API
  const { 
    data: profileData, 
    isLoading: profileLoading, 
    error: profileError, 
    refetch: refetchProfile 
  } = useToolData('dreamSymbols');

  // Auto-populate analysis from profile data when available
  useEffect(() => {
    if (profileData && !analysis && !isAnalyzing) {
      console.log('🌙 Dream Symbols - Profile data received:', profileData);
      console.log('🌙 Profile data keys:', Object.keys(profileData));
      
      // Check for dreamAnalysis in profile data
      const profileAnalysis = profileData.dreamAnalysis;
      
      console.log('🌙 dreamAnalysis found:', !!profileAnalysis);
      if (profileAnalysis) {
        console.log('🌙 dreamAnalysis content:', profileAnalysis);
        console.log('🌙 dreamAnalysis keys:', profileAnalysis ? Object.keys(profileAnalysis) : 'N/A');
      }
      
      try {
        // If dreamAnalysis exists and has the required structure
        if (profileAnalysis && typeof profileAnalysis === 'object') {
          // Check if it already matches DreamAnalysis format (from manual analysis)
          if (profileAnalysis.symbols && Array.isArray(profileAnalysis.symbols) && 
              profileAnalysis.symbols.length > 0 && 
              typeof profileAnalysis.symbols[0] === 'object' && 
              'category' in profileAnalysis.symbols[0]) {
            // Already in DreamAnalysis format from manual analysis
            console.log('🌙 Using profile dream analysis data directly (manual analysis format)');
            setAnalysis(profileAnalysis as DreamAnalysis);
          } else if (profileAnalysis.commonSymbols || profileAnalysis.interpretation || profileAnalysis.guidance) {
            // Transform profile format to DreamAnalysis format
            console.log('🌙 Transforming profile data to DreamAnalysis format');
            
            // Parse commonSymbols strings into DreamSymbol objects
            const symbols: DreamSymbol[] = [];
            if (Array.isArray(profileAnalysis.commonSymbols)) {
              profileAnalysis.commonSymbols.forEach((symbolStr: string) => {
                // Parse "Water - Emotions and subconscious" format
                const [symbolName, ...meaningParts] = symbolStr.split(' - ');
                const meaning = meaningParts.join(' - ');
                
                // Try to match with our dictionary
                const symbolNameLower = symbolName.toLowerCase().trim();
                const allSymbols = dreamSymbolsIntelligence.getDreamSymbols();
                
                // Find matching symbol in dictionary
                let matchedSymbol = Object.values(allSymbols).find(s => 
                  s.symbol.toLowerCase() === symbolNameLower
                );
                
                if (matchedSymbol) {
                  symbols.push(matchedSymbol);
                } else {
                  // Create a symbol from the string
                  const categoryMap: { [key: string]: DreamSymbol['category'] } = {
                    'water': 'elements',
                    'animals': 'animals',
                    'houses': 'places',
                    'vehicles': 'objects'
                  };
                  
                  const category = categoryMap[symbolNameLower] || 'objects';
                  
                  symbols.push({
                    symbol: symbolName,
                    category,
                    meanings: meaning ? meaning.split(',').map(m => m.trim()) : ['personal significance'],
                    positiveInterpretation: meaning || `Positive aspects of ${symbolName}`,
                    negativeInterpretation: `Consider potential challenges related to ${symbolName}`,
                    spiritualMeaning: `Spiritual significance of ${symbolName}`,
                    psychologicalMeaning: meaning || `Psychological representation of ${symbolName}`,
                    advice: `Reflect on the meaning of ${symbolName} in your dreams`
                  });
                }
              });
            }
            
            // Create DreamAnalysis from profile data
            const formattedAnalysis: DreamAnalysis = {
              dreamDescription: profileAnalysis.dreamDescription || '',
              symbols: symbols.length > 0 ? symbols : [],
              overallTheme: profileAnalysis.interpretation || profileAnalysis.theme || 'Personal significance and inner reflection',
              emotionalTone: profileAnalysis.emotionalTone || profileAnalysis.emotions || 'Balanced emotional state',
              spiritualMessage: profileAnalysis.spiritualMessage || profileAnalysis.spiritual || 'Your dream reflects your spiritual journey and inner guidance',
              psychologicalInsight: profileAnalysis.interpretation || profileAnalysis.psychologicalInsight || 'Your dream reveals aspects of your inner world',
              practicalAdvice: profileAnalysis.guidance 
                ? [profileAnalysis.guidance]
                : Array.isArray(profileAnalysis.practicalAdvice) 
                  ? profileAnalysis.practicalAdvice 
                  : Array.isArray(profileAnalysis.advice) 
                    ? profileAnalysis.advice 
                    : [],
              confidence: profileAnalysis.confidence || 85
            };
            
            console.log('🌙 Setting analysis state with transformed data:', formattedAnalysis);
            setAnalysis(formattedAnalysis);
          } else {
            console.log('🌙 dreamAnalysis exists but structure is different:', profileAnalysis);
          }
        } else {
          console.log('🌙 No valid dreamAnalysis found in profile data');
        }
      } catch (err) {
        console.error('🌙 Error processing profile dream data:', err);
      }
    }
  }, [profileData, analysis, isAnalyzing]);

  // Perform real-time dream analysis using dictionary-based matching
  const performDreamAnalysis = useCallback(async () => {
    if (!dreamDescription.trim()) {
      setAnalysisError('Please enter a dream description');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Extract emotions from description (simple keyword matching)
      const emotions: string[] = [];
      const emotionKeywords = {
        'joy': ['happy', 'joy', 'glad', 'pleased', 'delighted', 'ecstatic'],
        'fear': ['fear', 'afraid', 'scared', 'terrified', 'anxious', 'worried'],
        'sadness': ['sad', 'sorrow', 'depressed', 'lonely', 'melancholy'],
        'anger': ['angry', 'mad', 'furious', 'rage', 'irritated'],
        'peace': ['calm', 'peaceful', 'tranquil', 'serene', 'relaxed'],
        'love': ['love', 'loved', 'affection', 'caring', 'tender'],
        'excitement': ['excited', 'thrilled', 'eager', 'enthusiastic']
      };

      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.some(keyword => dreamDescription.toLowerCase().includes(keyword))) {
          emotions.push(emotion);
        }
      });

      // Determine dream type
      let dreamType: 'lucid' | 'recurring' | 'nightmare' | 'prophetic' | 'ordinary' = 'ordinary';
      const lowerDesc = dreamDescription.toLowerCase();
      
      if (lowerDesc.includes('lucid') || lowerDesc.includes('aware') || lowerDesc.includes('knowing i was dreaming')) {
        dreamType = 'lucid';
      } else if (lowerDesc.includes('recurring') || lowerDesc.includes('again') || lowerDesc.includes('same dream')) {
        dreamType = 'recurring';
      } else if (lowerDesc.includes('nightmare') || lowerDesc.includes('scary') || lowerDesc.includes('terrifying') || emotions.includes('fear')) {
        dreamType = 'nightmare';
      } else if (lowerDesc.includes('prophetic') || lowerDesc.includes('future') || lowerDesc.includes('prediction')) {
        dreamType = 'prophetic';
      }

      // Extract symbols from user input if provided, otherwise use description
      const symbolsList = symbols.trim() 
        ? symbols.split(/[,;]/).map(s => s.trim()).filter(Boolean)
        : [];

      // Create dream data object
      const dreamData: DreamData = {
        dreamDescription: dreamDescription.trim(),
        symbols: symbolsList,
        emotions: emotions.length > 0 ? emotions : ['neutral'],
        dreamType,
        context: ''
      };

      // Analyze using dreamSymbolsIntelligence
      const result = await dreamSymbolsIntelligence.analyzeDream(dreamData);
      
      setAnalysis(result);
      setAnalysisError(null);
      void fetchWithFirebaseAuthRequired('/api/profile/ensure-tool-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolSlug: 'dreamSymbols',
          extraInputs: { dreamDescription: dreamDescription.trim() },
        }),
      }).catch(() => undefined);
    } catch (err: any) {
      console.error('Error analyzing dream:', err);
      setAnalysisError(err.message || 'Failed to analyze dream. Please try again.');
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [dreamDescription, symbols]);

  const resetData = () => {
    setDreamDescription("");
    setSymbols("");
    setAnalysis(null);
    setAnalysisError(null);
  };

  return {
    // Profile data
    profileData,
    profileLoading,
    profileError: profileError || null,
    
    // User input
    dreamDescription,
    setDreamDescription,
    symbols,
    setSymbols,
    
    // Analysis
    analysis,
    isLoading: isAnalyzing,
    error: analysisError,
    
    // Actions
    performDreamAnalysis,
    resetData,
    refetchProfile
  };
}