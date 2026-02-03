"use client";
import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAstroData, generateAIPrediction, getSymbolicData } from '@/lib/api';

function getTodayId() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export function useDailyGuidance() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<any>(null);

  useEffect(() => {
    if (!user || !userProfile?.birthDate || !userProfile?.birthPlace) {
      setLoading(false);
      setDailyData(null);
      return;
    }
    const fetchOrGenerate = async () => {
      setLoading(true);
      setError(null);
      const db = getFirebaseDB();
      const todayId = getTodayId();
      const docId = `${user.uid}_${todayId}`;
      const ref = doc(db, 'dailyGuidance', docId);
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setDailyData(snap.data());
        } else {
          // Generate new daily guidance
          const astroData = await getAstroData(userProfile.birthDate!, userProfile.birthPlace!);
          const themes = [
            {
              icon: '❤️',
              title: 'Health',
              question: 'What should I focus on for my health today?',
              color: 'from-red-500/20 to-pink-500/20',
            },
            {
              icon: '💰',
              title: 'Wealth',
              question: 'What financial opportunities await me today?',
              color: 'from-green-500/20 to-emerald-500/20',
            },
            {
              icon: '💖',
              title: 'Love',
              question: 'How can I improve my relationships today?',
              color: 'from-pink-500/20 to-rose-500/20',
            },
            {
              icon: '⚡',
              title: 'Energy',
              question: 'What should I focus on for my personal growth today?',
              color: 'from-blue-500/20 to-indigo-500/20',
            },
          ];
          const themePredictions = await Promise.all(
            themes.map(async (theme) => {
              const symbolicData = getSymbolicData(theme.question, astroData);
              const prediction = await generateAIPrediction(theme.question, astroData, symbolicData);
              return {
                ...theme,
                forecast: prediction,
                energy: ['High', 'Moderate', 'Strong', 'Excellent'][Math.floor(Math.random() * 4)],
              };
            })
          );
          // Symbol of the day
          const symbolQuestion = 'What is the most important symbol for me to focus on today?';
          const symbolSymbolicData = getSymbolicData(symbolQuestion, astroData);
          const symbolPrediction = await generateAIPrediction(symbolQuestion, astroData, symbolSymbolicData);
          // Remedy
          const remedyQuestion = 'What spiritual practice or remedy would be most beneficial for me today?';
          const remedySymbolicData = getSymbolicData(remedyQuestion, astroData);
          const remedyPrediction = await generateAIPrediction(remedyQuestion, astroData, remedySymbolicData);
          const data = {
            userId: user.uid, // Add userId for Firestore security rules
            themes: themePredictions,
            symbol: {
              icon: '🔮',
              title: 'Symbol of Divine Clarity',
              description: symbolPrediction,
              element: ['Fire', 'Earth', 'Air', 'Water'][Math.floor(Math.random() * 4)],
              planet: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'][Math.floor(Math.random() * 7)],
              energy: ['Receptive', 'Active', 'Balanced', 'Dynamic'][Math.floor(Math.random() * 4)],
            },
            remedy: {
              icon: '🕯️',
              title: "Today's Sacred Remedy",
              description: remedyPrediction,
              duration: '10 minutes',
              bestTime: 'Sunset',
              frequency: 'Daily',
            },
            generatedAt: Date.now(),
          };
          await setDoc(ref, data);
          setDailyData(data);
        }
      } catch (err: any) {
        setError('Failed to load daily guidance');
      } finally {
        setLoading(false);
      }
    };
    fetchOrGenerate();
  }, [user, userProfile]);

  return { loading, error, dailyData };
} 