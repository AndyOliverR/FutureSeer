'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { getFirebaseAuth, signInWithGoogle, signOutUser, getUserProfile, UserProfile } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getComprehensiveAstroData, clearAstroDataCache } from '@/lib/astroDataService';
import { getIntelligentNumerologyData } from '@/lib/numerologyIntelligence';
import { getIntelligentAngelNumbersData } from '@/lib/angelNumbersIntelligence';
import { getIntelligentVedicData, clearVedicDataCache } from '@/lib/vedicIntelligence';
import { getIntelligentNameAnalysisData } from '@/lib/nameAnalysisIntelligence';
import { getIntelligentWesternAstrologyData } from '@/lib/westernAstrologyIntelligence';
import { kpAstrologyIntelligence } from '@/lib/kpAstrologyIntelligence';
import { horaryAstrologyIntelligence } from '@/lib/horaryAstrologyIntelligence';
import { baziIntelligence } from '@/lib/baziIntelligence';
import { kabbalisticNumerologyIntelligence } from '@/lib/kabbalisticNumerologyIntelligence';
import { lenormandIntelligence } from '@/lib/lenormandIntelligence';
import { pendulumIntelligence } from '@/lib/pendulumIntelligence';
import { dreamSymbolsIntelligence } from '@/lib/dreamSymbolsIntelligence';
import { faceReadingIntelligence } from '@/lib/faceReadingIntelligence';
import { ichingIntelligence } from '@/lib/ichingIntelligence';
import { palmistryIntelligence } from '@/lib/palmistryIntelligence';
import { runesIntelligence } from '@/lib/runesIntelligence';
import { tarotIntelligence } from '@/lib/tarotIntelligence';
import { getIdTokenResult } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isSuperadmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setUserProfile(null);
      // Clear astro data cache on sign out
      if (user?.uid) {
        clearAstroDataCache(user.uid);
        clearVedicDataCache(user.uid);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        
        // If user has valid birth details, fetch comprehensive astro data
        if (profile?.birthDate && profile?.birthPlace) {
          try {
            console.log('Auto-fetching comprehensive astro data for user:', user.uid);
            await getComprehensiveAstroData(
              user.uid,
              profile.birthDate,
              profile.birthPlace,
              profile.birthTime
            );
          } catch (astroError) {
            console.warn('Error auto-fetching astro data:', astroError);
            // Don't throw error, user can still use the app
          }
        }
        
        // If user has valid name and birth date, fetch numerology data
        if (profile?.displayName && profile?.birthDate) {
          try {
            console.log('Auto-fetching numerology data for user:', user.uid);
            await getIntelligentNumerologyData(
              user.uid,
              profile.displayName,
              profile.birthDate
            );
          } catch (numerologyError) {
            console.warn('Error auto-fetching numerology data:', numerologyError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch angel numbers data
          try {
            console.log('Auto-fetching angel numbers data for user:', user.uid);
            await getIntelligentAngelNumbersData(
              user.uid,
              profile.displayName,
              profile.birthDate
            );
          } catch (angelNumbersError) {
            console.warn('Error auto-fetching angel numbers data:', angelNumbersError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch Vedic data
          try {
            console.log('Auto-fetching Vedic data for user:', user.uid);
            await getIntelligentVedicData(
              user.uid,
              profile.birthDate,
              profile.birthTime || '12:00',
              profile.birthPlace || 'Unknown'
            );
          } catch (vedicError) {
            console.warn('Error auto-fetching Vedic data:', vedicError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch Face Reading data
          try {
            console.log('Auto-fetching Face Reading data for user:', user.uid);
            const age = Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            const gender = profile.gender || 'other';
            const analysis = await faceReadingIntelligence.analyzeFace(age, gender);
            await faceReadingIntelligence.saveAnalysis(user.uid, analysis);
          } catch (faceReadingError) {
            console.warn('Error auto-fetching Face Reading data:', faceReadingError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch I Ching data
          try {
            console.log('Auto-fetching I Ching data for user:', user.uid);
            const defaultQuestion = 'What guidance does the I Ching offer for my current life path?';
            const analysis = await ichingIntelligence.consultIChing(defaultQuestion, 'random');
            await ichingIntelligence.saveAnalysis(user.uid, analysis);
          } catch (ichingError) {
            console.warn('Error auto-fetching I Ching data:', ichingError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch Palmistry data
          try {
            console.log('Auto-fetching Palmistry data for user:', user.uid);
            const age = Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            const gender = profile.gender || 'other';
            const hand = 'right'; // Default to right hand for initial analysis
            const dominantHand = profile.dominantHand || 'right';
            const analysis = await palmistryIntelligence.analyzePalm(hand, dominantHand, age, gender);
            await palmistryIntelligence.saveAnalysis(user.uid, analysis);
          } catch (palmistryError) {
            console.warn('Error auto-fetching Palmistry data:', palmistryError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch Runes data
          try {
            console.log('Auto-fetching Runes data for user:', user.uid);
            const defaultQuestion = 'What guidance do the runes offer for my current life path?';
            const spreadType = 'three'; // Default to three-rune spread for initial reading
            const reading = await runesIntelligence.castRunes(defaultQuestion, spreadType);
            await runesIntelligence.saveReading(user.uid, reading);
          } catch (runesError) {
            console.warn('Error auto-fetching Runes data:', runesError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Tarot data
          try {
            console.log('Auto-fetching Tarot data for user:', user.uid);
            if (profile.birthDate && profile.birthPlace) {
              const defaultQuestion = 'What guidance does the Tarot offer for my current life path?';
              const spreadType = 'three';
              const reading = await tarotIntelligence.drawCards(defaultQuestion, spreadType);
              await tarotIntelligence.saveReading(user.uid, reading);
            }
          } catch (tarotError) {
            console.warn('Error auto-fetching Tarot data:', tarotError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Name Analysis data
          try {
            console.log('Auto-fetching Name Analysis data for user:', user.uid);
            const fullName = profile.displayName || profile.fullName;
            if (fullName) {
              await getIntelligentNameAnalysisData(user.uid, fullName);
            }
          } catch (nameAnalysisError) {
            console.warn('Error auto-fetching Name Analysis data:', nameAnalysisError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Western Astrology data
          try {
            console.log('Auto-fetching Western Astrology data for user:', user.uid);
            if (profile.birthDate && profile.birthPlace) {
              await getIntelligentWesternAstrologyData(
                user.uid,
                profile.birthDate,
                profile.birthTime || '12:00',
                profile.birthPlace
              );
            }
          } catch (westernAstrologyError) {
            console.warn('Error auto-fetching Western Astrology data:', westernAstrologyError);
            // Don't throw error, user can still use the app
          }

          // Also fetch KP Astrology data
          try {
            console.log('Auto-fetching KP Astrology data for user:', user.uid);
            if (profile.birthDate && profile.birthPlace) {
              await kpAstrologyIntelligence.analyzeChart({
                birthDate: profile.birthDate,
                birthTime: profile.birthTime || '12:00',
                birthPlace: profile.birthPlace,
                latitude: 0,
                longitude: 0
              });
            }
          } catch (kpAstrologyError) {
            console.warn('Error auto-fetching KP Astrology data:', kpAstrologyError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Horary Astrology data
          try {
            console.log('Auto-fetching Horary Astrology data for user:', user.uid);
            const defaultQuestion = 'What guidance does Horary Astrology offer for my current life path?';
            await horaryAstrologyIntelligence.castHoraryChart({
              question: defaultQuestion,
              category: 'general',
              urgency: 'medium',
              askedAt: new Date(),
              askedFrom: {
                latitude: 0,
                longitude: 0,
                place: profile.birthPlace || 'Unknown'
              }
            });
          } catch (horaryAstrologyError) {
            console.warn('Error auto-fetching Horary Astrology data:', horaryAstrologyError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Bazi data
          try {
            console.log('Auto-fetching Bazi data for user:', user.uid);
            if (profile.birthDate && profile.birthPlace) {
              await baziIntelligence.analyzeBazi({
                birthDate: profile.birthDate,
                birthTime: profile.birthTime || '12:00',
                birthPlace: profile.birthPlace,
                latitude: 0,
                longitude: 0
              });
            }
          } catch (baziError) {
            console.warn('Error auto-fetching Bazi data:', baziError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Kabbalistic Numerology data
          try {
            console.log('Auto-fetching Kabbalistic Numerology data for user:', user.uid);
            if (profile.displayName && profile.birthDate) {
              await kabbalisticNumerologyIntelligence.analyzeKabbalistic({
                fullName: profile.displayName,
                birthDate: profile.birthDate,
                birthTime: profile.birthTime,
                birthPlace: profile.birthPlace
              });
            }
          } catch (kabbalisticError) {
            console.warn('Error auto-fetching Kabbalistic Numerology data:', kabbalisticError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Lenormand data
          try {
            console.log('Auto-fetching Lenormand data for user:', user.uid);
            if (profile.displayName && profile.birthDate) {
              await lenormandIntelligence.drawLenormandSpread(
                user.uid,
                profile.displayName,
                profile.birthDate
              );
            }
          } catch (lenormandError) {
            console.warn('Error auto-fetching Lenormand data:', lenormandError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Pendulum data
          try {
            console.log('Auto-fetching Pendulum data for user:', user.uid);
            await pendulumIntelligence.analyzePendulum({
              question: 'What guidance does the pendulum offer for my current life path?',
              pendulumType: 'crystal',
              userIntention: 'Seeking spiritual guidance'
            });
          } catch (pendulumError) {
            console.warn('Error auto-fetching Pendulum data:', pendulumError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Dream Symbols data
          try {
            console.log('Auto-fetching Dream Symbols data for user:', user.uid);
            await dreamSymbolsIntelligence.analyzeDream({
              dreamDescription: 'I was walking through a beautiful garden with flowing water and felt peaceful and connected to nature.',
              symbols: ['water', 'tree'],
              emotions: ['peace', 'connection'],
              dreamType: 'ordinary',
              context: 'Recent spiritual journey'
            });
          } catch (dreamSymbolsError) {
            console.warn('Error auto-fetching Dream Symbols data:', dreamSymbolsError);
            // Don't throw error, user can still use the app
          }
        }
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Check for superadmin claim
          const token = await getIdTokenResult(user, true);
          setIsSuperadmin(!!token.claims.superadmin);
        } catch (e) {
          setIsSuperadmin(false);
        }
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        
        // Auto-fetch comprehensive astro data if user has valid birth details
        if (profile?.birthDate && profile?.birthPlace) {
          try {
            console.log('Auto-fetching comprehensive astro data for user:', user.uid);
            await getComprehensiveAstroData(
              user.uid,
              profile.birthDate,
              profile.birthPlace,
              profile.birthTime
            );
          } catch (astroError) {
            console.warn('Error auto-fetching astro data:', astroError);
            // Don't throw error, user can still use the app
          }
        }
        
        // Auto-fetch numerology and angel numbers data if user has valid name and birth date
        if (profile?.displayName && profile?.birthDate) {
          try {
            console.log('Auto-fetching numerology data for user:', user.uid);
            await getIntelligentNumerologyData(
              user.uid,
              profile.displayName,
              profile.birthDate
            );
          } catch (numerologyError) {
            console.warn('Error auto-fetching numerology data:', numerologyError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch angel numbers data
          try {
            console.log('Auto-fetching angel numbers data for user:', user.uid);
            await getIntelligentAngelNumbersData(
              user.uid,
              profile.displayName,
              profile.birthDate
            );
          } catch (angelNumbersError) {
            console.warn('Error auto-fetching angel numbers data:', angelNumbersError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch Vedic data
          try {
            console.log('Auto-fetching Vedic data for user:', user.uid);
            await getIntelligentVedicData(
              user.uid,
              profile.birthDate,
              profile.birthTime || '12:00',
              profile.birthPlace || 'Unknown'
            );
          } catch (vedicError) {
            console.warn('Error auto-fetching Vedic data:', vedicError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch Face Reading data
          try {
            console.log('Auto-fetching Face Reading data for user:', user.uid);
            const age = Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            const gender = profile.gender || 'other';
            const analysis = await faceReadingIntelligence.analyzeFace(age, gender);
            await faceReadingIntelligence.saveAnalysis(user.uid, analysis);
          } catch (faceReadingError) {
            console.warn('Error auto-fetching Face Reading data:', faceReadingError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch I Ching data
          try {
            console.log('Auto-fetching I Ching data for user:', user.uid);
            const defaultQuestion = 'What guidance does the I Ching offer for my current life path?';
            const analysis = await ichingIntelligence.consultIChing(defaultQuestion, 'random');
            await ichingIntelligence.saveAnalysis(user.uid, analysis);
          } catch (ichingError) {
            console.warn('Error auto-fetching I Ching data:', ichingError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch Palmistry data
          try {
            console.log('Auto-fetching Palmistry data for user:', user.uid);
            const age = Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            const gender = profile.gender || 'other';
            const hand = 'right'; // Default to right hand for initial analysis
            const dominantHand = profile.dominantHand || 'right';
            const analysis = await palmistryIntelligence.analyzePalm(hand, dominantHand, age, gender);
            await palmistryIntelligence.saveAnalysis(user.uid, analysis);
          } catch (palmistryError) {
            console.warn('Error auto-fetching Palmistry data:', palmistryError);
            // Don't throw error, user can still use the app
          }
          
          // Also fetch Runes data
          try {
            console.log('Auto-fetching Runes data for user:', user.uid);
            const defaultQuestion = 'What guidance do the runes offer for my current life path?';
            const spreadType = 'three'; // Default to three-rune spread for initial reading
            const reading = await runesIntelligence.castRunes(defaultQuestion, spreadType);
            await runesIntelligence.saveReading(user.uid, reading);
          } catch (runesError) {
            console.warn('Error auto-fetching Runes data:', runesError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Tarot data
          try {
            console.log('Auto-fetching Tarot data for user:', user.uid);
            if (profile.birthDate && profile.birthPlace) {
              const defaultQuestion = 'What guidance does the Tarot offer for my current life path?';
              const spreadType = 'three';
              const reading = await tarotIntelligence.drawCards(defaultQuestion, spreadType);
              await tarotIntelligence.saveReading(user.uid, reading);
            }
          } catch (tarotError) {
            console.warn('Error auto-fetching Tarot data:', tarotError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Name Analysis data
          try {
            console.log('Auto-fetching Name Analysis data for user:', user.uid);
            const fullName = profile.displayName || profile.fullName;
            if (fullName) {
              await getIntelligentNameAnalysisData(user.uid, fullName);
            }
          } catch (nameAnalysisError) {
            console.warn('Error auto-fetching Name Analysis data:', nameAnalysisError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Western Astrology data
          try {
            console.log('Auto-fetching Western Astrology data for user:', user.uid);
            if (profile.birthDate && profile.birthPlace) {
              await getIntelligentWesternAstrologyData(
                user.uid,
                profile.birthDate,
                profile.birthTime || '12:00',
                profile.birthPlace
              );
            }
          } catch (westernAstrologyError) {
            console.warn('Error auto-fetching Western Astrology data:', westernAstrologyError);
            // Don't throw error, user can still use the app
          }

          // Also fetch KP Astrology data
          try {
            console.log('Auto-fetching KP Astrology data for user:', user.uid);
            if (profile.birthDate && profile.birthPlace) {
              await kpAstrologyIntelligence.analyzeChart({
                birthDate: profile.birthDate,
                birthTime: profile.birthTime || '12:00',
                birthPlace: profile.birthPlace,
                latitude: 0,
                longitude: 0
              });
            }
          } catch (kpAstrologyError) {
            console.warn('Error auto-fetching KP Astrology data:', kpAstrologyError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Horary Astrology data
          try {
            console.log('Auto-fetching Horary Astrology data for user:', user.uid);
            const defaultQuestion = 'What guidance does Horary Astrology offer for my current life path?';
            await horaryAstrologyIntelligence.castHoraryChart({
              question: defaultQuestion,
              category: 'general',
              urgency: 'medium',
              askedAt: new Date(),
              askedFrom: {
                latitude: 0,
                longitude: 0,
                place: profile.birthPlace || 'Unknown'
              }
            });
          } catch (horaryAstrologyError) {
            console.warn('Error auto-fetching Horary Astrology data:', horaryAstrologyError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Bazi data
          try {
            console.log('Auto-fetching Bazi data for user:', user.uid);
            if (profile.birthDate && profile.birthPlace) {
              await baziIntelligence.analyzeBazi({
                birthDate: profile.birthDate,
                birthTime: profile.birthTime || '12:00',
                birthPlace: profile.birthPlace,
                latitude: 0,
                longitude: 0
              });
            }
          } catch (baziError) {
            console.warn('Error auto-fetching Bazi data:', baziError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Kabbalistic Numerology data
          try {
            console.log('Auto-fetching Kabbalistic Numerology data for user:', user.uid);
            if (profile.displayName && profile.birthDate) {
              await kabbalisticNumerologyIntelligence.analyzeKabbalistic({
                fullName: profile.displayName,
                birthDate: profile.birthDate,
                birthTime: profile.birthTime,
                birthPlace: profile.birthPlace
              });
            }
          } catch (kabbalisticError) {
            console.warn('Error auto-fetching Kabbalistic Numerology data:', kabbalisticError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Lenormand data
          try {
            console.log('Auto-fetching Lenormand data for user:', user.uid);
            if (profile.displayName && profile.birthDate) {
              await lenormandIntelligence.drawLenormandSpread(
                user.uid,
                profile.displayName,
                profile.birthDate
              );
            }
          } catch (lenormandError) {
            console.warn('Error auto-fetching Lenormand data:', lenormandError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Pendulum data
          try {
            console.log('Auto-fetching Pendulum data for user:', user.uid);
            await pendulumIntelligence.analyzePendulum({
              question: 'What guidance does the pendulum offer for my current life path?',
              pendulumType: 'crystal',
              userIntention: 'Seeking spiritual guidance'
            });
          } catch (pendulumError) {
            console.warn('Error auto-fetching Pendulum data:', pendulumError);
            // Don't throw error, user can still use the app
          }

          // Also fetch Dream Symbols data
          try {
            console.log('Auto-fetching Dream Symbols data for user:', user.uid);
            await dreamSymbolsIntelligence.analyzeDream({
              dreamDescription: 'I was walking through a beautiful garden with flowing water and felt peaceful and connected to nature.',
              symbols: ['water', 'tree'],
              emotions: ['peace', 'connection'],
              dreamType: 'ordinary',
              context: 'Recent spiritual journey'
            });
          } catch (dreamSymbolsError) {
            console.warn('Error auto-fetching Dream Symbols data:', dreamSymbolsError);
            // Don't throw error, user can still use the app
          }
        }
      } else {
        setUserProfile(null);
        setIsSuperadmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    refreshProfile,
    isSuperadmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
 