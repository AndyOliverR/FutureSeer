// Tool Analysis Base Interface
export interface BaseToolAnalysis {
  tool: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  userId: string;
}

// Vedic Astrology Analysis Schema
export interface VedicAstrologyAnalysis extends BaseToolAnalysis {
  tool: 'vedic-astrology';
  userData: {
    fullName: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
    faceImage?: string;
    palmImage?: string;
  };
  birthChart?: {
    planets: Array<{
      name: string;
      sign: string;
      house: number;
      degree: number;
      isRetrograde: boolean;
    }>;
    houses: Array<{
      number: number;
      sign: string;
      degree: number;
    }>;
    ascendant: {
      sign: string;
      degree: number;
    };
    midheaven: {
      sign: string;
      degree: number;
    };
  };
  aiAnalysis?: {
    summary: string;
    planetaryInfluences: string[];
    doshas: string[];
    lifePredictions: string[];
    recommendations: string[];
  };
  vedicCalculations?: {
    nakshatra: string;
    rashi: string;
    mangalDosha: boolean;
    shaniDosha: boolean;
    rahuKetu: {
      rahu: string;
      ketu: string;
    };
  };
}

// Western Astrology Analysis Schema
export interface WesternAstrologyAnalysis extends BaseToolAnalysis {
  tool: 'western-astrology';
  userData: {
    fullName: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
    faceImage?: string;
  };
  birthChart?: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    planets: Array<{
      name: string;
      sign: string;
      house: number;
      degree: number;
      isRetrograde: boolean;
    }>;
    houses: Array<{
      number: number;
      sign: string;
      degree: number;
    }>;
    aspects: Array<{
      planet1: string;
      planet2: string;
      type: string;
      orb: number;
    }>;
  };
  aiAnalysis?: {
    personalityProfile: string;
    lifePath: string;
    strengths: string[];
    challenges: string[];
    careerGuidance: string[];
    relationshipInsights: string[];
  };
}

// Numerology Analysis Schema
export interface NumerologyAnalysis extends BaseToolAnalysis {
  tool: 'numerology';
  userData: {
    fullName: string;
    dateOfBirth: string;
    faceImage?: string;
  };
  calculations: {
    lifePathNumber: number;
    destinyNumber: number;
    soulNumber: number;
    personalityNumber: number;
    birthDayNumber: number;
    currentYearNumber: number;
    personalYearNumber: number;
    personalMonthNumber: number;
  };
  aiAnalysis?: {
    lifePathMeaning: string;
    destinyInterpretation: string;
    soulPurpose: string;
    personalityInsights: string;
    yearAhead: string;
    recommendations: string[];
  };
}

// Tarot Reading Schema
export interface TarotReading extends BaseToolAnalysis {
  tool: 'tarot';
  userData: {
    fullName: string;
    question: string;
    faceImage?: string;
  };
  reading: {
    spread: string;
    cards: Array<{
      name: string;
      position: string;
      meaning: string;
      image: string;
      isReversed: boolean;
    }>;
    interpretation: string;
  };
  aiAnalysis?: {
    overallMessage: string;
    keyThemes: string[];
    advice: string[];
    timing: string;
    warnings: string[];
  };
}

// Palmistry Analysis Schema
export interface PalmistryAnalysis extends BaseToolAnalysis {
  tool: 'palmistry';
  userData: {
    fullName: string;
    palmImage: string;
    dominantHand: 'left' | 'right';
  };
  palmReading: {
    lifeLine: {
      length: string;
      quality: string;
      breaks: string[];
      meaning: string;
    };
    heartLine: {
      length: string;
      quality: string;
      meaning: string;
    };
    headLine: {
      length: string;
      quality: string;
      meaning: string;
    };
    fateLine: {
      presence: boolean;
      quality: string;
      meaning: string;
    };
    mounts: Array<{
      name: string;
      prominence: string;
      meaning: string;
    }>;
  };
  aiAnalysis?: {
    overallReading: string;
    lifeInsights: string[];
    personalityTraits: string[];
    futureIndications: string[];
    advice: string[];
  };
}

// Union type for all tool analyses
export type ToolAnalysis = 
  | VedicAstrologyAnalysis 
  | WesternAstrologyAnalysis 
  | NumerologyAnalysis 
  | TarotReading 
  | PalmistryAnalysis;

// User Profile with Tool Analyses
export interface UserToolProfile {
  userId: string;
  toolAnalyses: {
    [key: string]: ToolAnalysis;
  };
  lastAnalysisUpdate: string;
  totalAnalyses: number;
  preferredTools: string[];
  analysisHistory: Array<{
    tool: string;
    timestamp: string;
    status: string;
  }>;
}

// Tool Configuration Schema
export interface ToolConfig {
  slug: string;
  name: string;
  category: string;
  isPremium: boolean;
  isComingSoon: boolean;
  requiredFields: string[];
  optionalFields: string[];
  supportedImageTypes: string[];
  maxImageSize: number;
  analysisTime: number; // in seconds
  apiEndpoint: string;
  description: string;
  icon: string;
  redirectTo?: string; // If set, this tool redirects to another tool's page
  hideFromMainList?: boolean; // If true, hide from main tools display (consolidated into another tool)
  popularityScore?: number; // 0-100 popularity score (100 = most popular, Western Astrology baseline)
}



