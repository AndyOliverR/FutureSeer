// Energy Healing Storage Utility
// Handles Firebase storage and retrieval of energy healing analyses

import { getFirebaseDB } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  ChakraAnalysis,
  AuraReading,
  ReikiAnalysis,
  CrystalRecommendation,
  EnergyBalanceAnalysis
} from './energyHealingImageAnalyzer';

export interface StoredEnergyHealingAnalysis {
  method: 'chakra' | 'aura' | 'reiki' | 'crystal' | 'energy';
  analysis: ChakraAnalysis | AuraReading | ReikiAnalysis | CrystalRecommendation | EnergyBalanceAnalysis;
  timestamp: number;
  profileHash: string;
  userId: string;
}

/**
 * Create a hash of relevant profile fields to detect changes
 */
export function createProfileHash(userProfile: any): string {
  const relevantFields = {
    birthDate: userProfile.birthDate,
    birthPlace: userProfile.birthPlace,
    birthTime: userProfile.birthTime,
    gender: userProfile.gender,
    healthConditions: userProfile.healthConditions,
    energyLevel: userProfile.energyLevel,
    relationshipStatus: userProfile.relationshipStatus
  };
  
  // Simple hash function
  const str = JSON.stringify(relevantFields);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

/**
 * Check if stored analysis is still valid
 */
export function isAnalysisValid(
  stored: StoredEnergyHealingAnalysis | null,
  currentProfileHash: string,
  maxAgeHours: number = 24
): boolean {
  if (!stored) return false;
  
  // Check if profile changed
  if (stored.profileHash !== currentProfileHash) {
    return false;
  }
  
  // Check if analysis is too old
  const ageHours = (Date.now() - stored.timestamp) / (1000 * 60 * 60);
  if (ageHours > maxAgeHours) {
    return false;
  }
  
  return true;
}

/**
 * Store energy healing analysis in Firebase
 */
export async function storeEnergyHealingAnalysis(
  userId: string,
  method: 'chakra' | 'aura' | 'reiki' | 'crystal' | 'energy',
  analysis: ChakraAnalysis | AuraReading | ReikiAnalysis | CrystalRecommendation | EnergyBalanceAnalysis,
  profileHash: string
): Promise<void> {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.warn('⚠️ Firebase DB not available, skipping storage');
      return;
    }

    const storedAnalysis: StoredEnergyHealingAnalysis = {
      method,
      analysis,
      timestamp: Date.now(),
      profileHash,
      userId
    };

    const docRef = doc(db, 'users', userId, 'energyHealing', method);
    await setDoc(docRef, storedAnalysis);
    
    console.log(`✅ Stored ${method} analysis for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error storing ${method} analysis:`, error);
    // Don't throw - storage failure shouldn't break the app
  }
}

/**
 * Get energy healing analysis from Firebase
 */
export async function getEnergyHealingAnalysis(
  userId: string,
  method: 'chakra' | 'aura' | 'reiki' | 'crystal' | 'energy'
): Promise<StoredEnergyHealingAnalysis | null> {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.warn('⚠️ Firebase DB not available');
      return null;
    }

    const docRef = doc(db, 'users', userId, 'energyHealing', method);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as StoredEnergyHealingAnalysis;
      console.log(`✅ Retrieved ${method} analysis for user ${userId}`);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Error retrieving ${method} analysis:`, error);
    return null;
  }
}

