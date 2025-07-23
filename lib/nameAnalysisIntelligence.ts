// Intelligent Name Analysis System
// Analyzes names using various numerological and mystical systems

import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { getFirebaseDB } from './firebase';

export interface NameAnalysis {
  id: string;
  userId: string;
  timestamp: Date;
  fullName: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  
  // Core Numbers
  lifePathNumber: number;
  destinyNumber: number;
  soulNumber: number;
  personalityNumber: number;
  maturityNumber: number;
  
  // Name-specific Analysis
  nameVibration: number;
  nameBalance: number;
  nameHarmony: number;
  namePower: number;
  
  // Letter Analysis
  vowels: string[];
  consonants: string[];
  vowelValue: number;
  consonantValue: number;
  letterFrequency: { [key: string]: number };
  
  // Elemental Analysis
  elements: {
    fire: number;
    earth: number;
    air: number;
    water: number;
    ether: number;
  };
  dominantElement: string;
  missingElements: string[];
  
  // Personality Insights
  personality: {
    strengths: string[];
    challenges: string[];
    lifePurpose: string;
    careerGuidance: string;
    relationshipInsights: string;
    spiritualPath: string;
  };
  
  // Name Recommendations
  recommendations: {
    nameOptimization: string[];
    nicknameSuggestions: string[];
    businessNameIdeas: string[];
    spiritualNames: string[];
  };
  
  // Coaching
  coaching: {
    currentFocus: string;
    recommendations: string[];
    affirmations: string[];
    nextSteps: string[];
  };
  
  metadata: {
    calculationMethod: string;
    system: string;
    lastUpdated: Date;
  };
}

// Numerology letter values (Chaldean system)
const LETTER_VALUES: { [key: string]: number } = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
  'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
  'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
  'Y': 1, 'Z': 7
};

// Element associations
const ELEMENT_LETTERS = {
  fire: ['A', 'E', 'F', 'H', 'I', 'L', 'N', 'O', 'R', 'T'],
  earth: ['B', 'D', 'G', 'J', 'K', 'M', 'P', 'Q', 'V', 'W'],
  air: ['C', 'F', 'H', 'I', 'L', 'N', 'O', 'R', 'S', 'T'],
  water: ['A', 'E', 'I', 'O', 'U', 'Y'],
  ether: ['X', 'Z']
};

// Vowels and consonants
const VOWELS = ['A', 'E', 'I', 'O', 'U', 'Y'];
const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'];

function calculateNameNumbers(name: string): {
  lifePath: number;
  destiny: number;
  soul: number;
  personality: number;
  maturity: number;
} {
  const cleanName = name.replace(/[^A-Z]/gi, '').toUpperCase();
  let totalValue = 0;
  
  for (const letter of cleanName) {
    totalValue += LETTER_VALUES[letter] || 0;
  }
  
  const lifePath = reduceToSingleDigit(totalValue);
  const destiny = reduceToSingleDigit(totalValue + cleanName.length);
  const soul = reduceToSingleDigit(cleanName.split('').filter(l => VOWELS.includes(l)).reduce((sum, l) => sum + (LETTER_VALUES[l] || 0), 0));
  const personality = reduceToSingleDigit(cleanName.split('').filter(l => CONSONANTS.includes(l)).reduce((sum, l) => sum + (LETTER_VALUES[l] || 0), 0));
  const maturity = reduceToSingleDigit(lifePath + destiny);
  
  return { lifePath, destiny, soul, personality, maturity };
}

function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

function analyzeElements(name: string): {
  elements: { fire: number; earth: number; air: number; water: number; ether: number };
  dominantElement: string;
  missingElements: string[];
} {
  const cleanName = name.replace(/[^A-Z]/gi, '').toUpperCase();
  const elementCounts: { fire: number; earth: number; air: number; water: number; ether: number } = {
    fire: 0, earth: 0, air: 0, water: 0, ether: 0
  };
  
  for (const letter of cleanName) {
    for (const [element, letters] of Object.entries(ELEMENT_LETTERS)) {
      if (letters.includes(letter)) {
        elementCounts[element as keyof typeof elementCounts]++;
      }
    }
  }
  
  const dominantElement = Object.entries(elementCounts).reduce((a, b) => elementCounts[a[0]] > elementCounts[b[0]] ? a : b)[0];
  const missingElements = Object.entries(elementCounts).filter(([_, count]) => count === 0).map(([element, _]) => element);
  
  return { elements: elementCounts, dominantElement, missingElements };
}

function analyzeLetterFrequency(name: string): { [key: string]: number } {
  const cleanName = name.replace(/[^A-Z]/gi, '').toUpperCase();
  const frequency: { [key: string]: number } = {};
  
  for (const letter of cleanName) {
    frequency[letter] = (frequency[letter] || 0) + 1;
  }
  
  return frequency;
}

function generatePersonalityInsights(nameNumbers: any, elements: any): NameAnalysis['personality'] {
  const { lifePath, destiny, soul, personality } = nameNumbers;
  
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  // Life Path insights
  if (lifePath === 1) {
    strengths.push('Natural leadership abilities');
    strengths.push('Strong individuality and independence');
    challenges.push('May be too dominant or controlling');
  } else if (lifePath === 2) {
    strengths.push('Diplomatic and cooperative nature');
    strengths.push('Strong intuition and sensitivity');
    challenges.push('May be overly sensitive or indecisive');
  } else if (lifePath === 3) {
    strengths.push('Creative and expressive communication');
    strengths.push('Optimistic and enthusiastic personality');
    challenges.push('May scatter energy or be superficial');
  } else if (lifePath === 4) {
    strengths.push('Practical and methodical approach');
    strengths.push('Strong work ethic and reliability');
    challenges.push('May be rigid or resistant to change');
  } else if (lifePath === 5) {
    strengths.push('Adaptable and freedom-loving nature');
    strengths.push('Versatile and adventurous spirit');
    challenges.push('May be restless or lack commitment');
  } else if (lifePath === 6) {
    strengths.push('Nurturing and responsible nature');
    strengths.push('Strong sense of duty and harmony');
    challenges.push('May be overly responsible or controlling');
  } else if (lifePath === 7) {
    strengths.push('Analytical and spiritual nature');
    strengths.push('Deep thinker and researcher');
    challenges.push('May be aloof or overly critical');
  } else if (lifePath === 8) {
    strengths.push('Ambitious and goal-oriented nature');
    strengths.push('Strong business and material skills');
    challenges.push('May be materialistic or workaholic');
  } else if (lifePath === 9) {
    strengths.push('Compassionate and humanitarian nature');
    strengths.push('Wise and spiritually evolved');
    challenges.push('May be idealistic or impractical');
  }
  
  // Element-based insights
  if (elements.dominantElement === 'fire') {
    strengths.push('Dynamic and energetic personality');
    challenges.push('May be impulsive or aggressive');
  } else if (elements.dominantElement === 'earth') {
    strengths.push('Grounded and practical nature');
    challenges.push('May be stubborn or slow to change');
  } else if (elements.dominantElement === 'air') {
    strengths.push('Intellectual and communicative nature');
    challenges.push('May be scattered or lack grounding');
  } else if (elements.dominantElement === 'water') {
    strengths.push('Emotional and intuitive nature');
    challenges.push('May be overly emotional or moody');
  }
  
  const lifePurpose = `Your name suggests a life path focused on ${lifePath === 1 ? 'leadership and individuality' : 
    lifePath === 2 ? 'cooperation and diplomacy' :
    lifePath === 3 ? 'creativity and expression' :
    lifePath === 4 ? 'building and organization' :
    lifePath === 5 ? 'freedom and adventure' :
    lifePath === 6 ? 'service and harmony' :
    lifePath === 7 ? 'spiritual growth and analysis' :
    lifePath === 8 ? 'achievement and material success' :
    'compassion and universal love'}`;
  
  const careerGuidance = `Your name vibration suggests success in ${lifePath <= 3 ? 'creative and leadership roles' :
    lifePath <= 6 ? 'service and organizational roles' :
    'spiritual and analytical fields'}`;
  
  const relationshipInsights = `Your name indicates ${soul <= 3 ? 'a need for independence and self-expression' :
    soul <= 6 ? 'a desire for harmony and partnership' :
    'a spiritual approach to relationships'}`;
  
  const spiritualPath = `Your name suggests a spiritual journey focused on ${personality <= 3 ? 'self-discovery and expression' :
    personality <= 6 ? 'service and compassion' :
    'wisdom and universal understanding'}`;
  
  return {
    strengths,
    challenges,
    lifePurpose,
    careerGuidance,
    relationshipInsights,
    spiritualPath
  };
}

function generateRecommendations(nameNumbers: any, elements: any, fullName: string): NameAnalysis['recommendations'] {
  const { lifePath, soul, personality } = nameNumbers;
  const { missingElements } = elements;
  
  const nameOptimization: string[] = [];
  const nicknameSuggestions: string[] = [];
  const businessNameIdeas: string[] = [];
  const spiritualNames: string[] = [];
  
  // Name optimization based on missing elements
  if (missingElements.includes('fire')) {
    nameOptimization.push('Consider adding fire element letters (A, E, F, H, I, L, N, O, R, T)');
  }
  if (missingElements.includes('earth')) {
    nameOptimization.push('Consider adding earth element letters (B, D, G, J, K, M, P, Q, V, W)');
  }
  if (missingElements.includes('air')) {
    nameOptimization.push('Consider adding air element letters (C, F, H, I, L, N, O, R, S, T)');
  }
  if (missingElements.includes('water')) {
    nameOptimization.push('Consider adding water element letters (A, E, I, O, U, Y)');
  }
  
  // Nickname suggestions based on life path
  if (lifePath === 1) {
    nicknameSuggestions.push('Leader', 'Pioneer', 'Champion');
  } else if (lifePath === 2) {
    nicknameSuggestions.push('Peacemaker', 'Diplomat', 'Harmony');
  } else if (lifePath === 3) {
    nicknameSuggestions.push('Creator', 'Artist', 'Express');
  } else if (lifePath === 4) {
    nicknameSuggestions.push('Builder', 'Organizer', 'Foundation');
  } else if (lifePath === 5) {
    nicknameSuggestions.push('Explorer', 'Adventurer', 'Freedom');
  } else if (lifePath === 6) {
    nicknameSuggestions.push('Nurturer', 'Caregiver', 'Service');
  } else if (lifePath === 7) {
    nicknameSuggestions.push('Sage', 'Scholar', 'Wisdom');
  } else if (lifePath === 8) {
    nicknameSuggestions.push('Achiever', 'Success', 'Power');
  } else if (lifePath === 9) {
    nicknameSuggestions.push('Compassion', 'Universal', 'Love');
  }
  
  // Business name ideas
  const firstName = fullName.split(' ')[0];
  if (lifePath <= 3) {
    businessNameIdeas.push(`${firstName} Creative Solutions`);
    businessNameIdeas.push(`${firstName} Leadership Group`);
  } else if (lifePath <= 6) {
    businessNameIdeas.push(`${firstName} Service Center`);
    businessNameIdeas.push(`${firstName} Harmony Solutions`);
  } else {
    businessNameIdeas.push(`${firstName} Wisdom Institute`);
    businessNameIdeas.push(`${firstName} Spiritual Center`);
  }
  
  // Spiritual names
  if (soul <= 3) {
    spiritualNames.push('Aria (Air)', 'Luna (Moon)', 'Nova (New)');
  } else if (soul <= 6) {
    spiritualNames.push('Sage (Wisdom)', 'Grace (Divine)', 'Hope (Faith)');
  } else {
    spiritualNames.push('Zen (Meditation)', 'Om (Universal)', 'Kai (Ocean)');
  }
  
  return {
    nameOptimization,
    nicknameSuggestions,
    businessNameIdeas,
    spiritualNames
  };
}

function generateCoachingInsights(nameNumbers: any, elements: any): NameAnalysis['coaching'] {
  const { lifePath, soul, personality } = nameNumbers;
  const { missingElements } = elements;
  
  let currentFocus = 'Focus on balancing your name energy and living your life purpose';
  const recommendations: string[] = [];
  const affirmations: string[] = [];
  const nextSteps: string[] = [];
  
  // Current focus based on life path
  if (lifePath <= 3) {
    currentFocus = 'Develop your creative and leadership potential';
  } else if (lifePath <= 6) {
    currentFocus = 'Cultivate harmony and service in your life';
  } else {
    currentFocus = 'Deepen your spiritual understanding and wisdom';
  }
  
  // Recommendations
  if (missingElements.length > 0) {
    recommendations.push(`Balance missing elements: ${missingElements.join(', ')}`);
  }
  recommendations.push('Use your name vibration consciously in daily life');
  recommendations.push('Consider the numerological impact of name changes');
  recommendations.push('Align your actions with your name\'s energy');
  
  // Affirmations
  affirmations.push(`I am living my life path number ${lifePath} with purpose`);
  affirmations.push(`My name carries the perfect vibration for my soul's journey`);
  affirmations.push(`I attract opportunities that align with my name's energy`);
  affirmations.push(`I am balanced and harmonious in all aspects of my life`);
  
  // Next steps
  nextSteps.push('Study your name numbers and their meanings');
  nextSteps.push('Practice using your name\'s energy consciously');
  nextSteps.push('Consider name optimization if needed');
  nextSteps.push('Align your life choices with your name\'s vibration');
  
  return {
    currentFocus,
    recommendations,
    affirmations,
    nextSteps
  };
}

// Main function to get intelligent name analysis data
export async function getIntelligentNameAnalysisData(
  userId: string,
  fullName: string
): Promise<NameAnalysis> {
  const app = getFirebaseDB();
  if (!app) {
    throw new Error('Firebase app not initialized');
  }
  
  const db = getFirebaseDB();
  const docRef = doc(db, 'users', userId, 'name-analysis', 'current');
  
  try {
    // Check if we have cached data
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const cachedData = docSnap.data() as NameAnalysis;
      const lastUpdated = cachedData.metadata.lastUpdated;
      let lastUpdatedDate: Date;
      if (lastUpdated && typeof lastUpdated.toDate === 'function') {
        lastUpdatedDate = lastUpdated.toDate();
      } else {
        lastUpdatedDate = new Date(lastUpdated);
      }
      const hoursSinceUpdate = (new Date().getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60);
      
      // Return cached data if less than 24 hours old and name hasn't changed
      if (hoursSinceUpdate < 24 && cachedData.fullName === fullName) {
        console.log('Returning cached name analysis data for user:', userId);
        return cachedData;
      }
    }
  } catch (error) {
    console.warn('Error checking cached name analysis data:', error);
  }
  
  // Calculate new name analysis
  console.log('Calculating new name analysis for user:', userId);
  
  const cleanName = fullName.replace(/[^A-Z\s]/gi, '').toUpperCase();
  const nameParts = cleanName.split(' ').filter(part => part.length > 0);
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : undefined;
  
  // Calculate core numbers
  const nameNumbers = calculateNameNumbers(cleanName);
  
  // Analyze elements
  const elementAnalysis = analyzeElements(cleanName);
  
  // Analyze letter frequency
  const letterFrequency = analyzeLetterFrequency(cleanName);
  
  // Separate vowels and consonants
  const vowels = cleanName.split('').filter(l => VOWELS.includes(l));
  const consonants = cleanName.split('').filter(l => CONSONANTS.includes(l));
  const vowelValue = vowels.reduce((sum, l) => sum + (LETTER_VALUES[l] || 0), 0);
  const consonantValue = consonants.reduce((sum, l) => sum + (LETTER_VALUES[l] || 0), 0);
  
  // Calculate name vibrations
  const nameVibration = reduceToSingleDigit(nameNumbers.lifePath + nameNumbers.destiny);
  const nameBalance = Math.abs(vowelValue - consonantValue);
  const nameHarmony = reduceToSingleDigit(vowelValue + consonantValue);
  const namePower = reduceToSingleDigit(cleanName.length * nameNumbers.lifePath);
  
  // Generate insights
  const personality = generatePersonalityInsights(nameNumbers, elementAnalysis);
  const recommendations = generateRecommendations(nameNumbers, elementAnalysis, fullName);
  const coaching = generateCoachingInsights(nameNumbers, elementAnalysis);
  
  // Create comprehensive analysis
  const analysis: NameAnalysis = {
    id: 'current',
    userId,
    timestamp: new Date(),
    fullName,
    firstName,
    lastName,
    middleName,
    lifePathNumber: nameNumbers.lifePath,
    destinyNumber: nameNumbers.destiny,
    soulNumber: nameNumbers.soul,
    personalityNumber: nameNumbers.personality,
    maturityNumber: nameNumbers.maturity,
    nameVibration,
    nameBalance,
    nameHarmony,
    namePower,
    vowels,
    consonants,
    vowelValue,
    consonantValue,
    letterFrequency,
    elements: elementAnalysis.elements,
    dominantElement: elementAnalysis.dominantElement,
    missingElements: elementAnalysis.missingElements,
    personality,
    recommendations,
    coaching,
    metadata: {
      calculationMethod: 'Chaldean Numerology + Elemental Analysis',
      system: 'Intelligent Name Analysis',
      lastUpdated: new Date()
    }
  };
  
  // Cache the data
  try {
    await setDoc(docRef, analysis);
    console.log('Cached name analysis data for user:', userId);
  } catch (error) {
    console.warn('Error caching name analysis data:', error);
  }
  
  return analysis;
}

// Function to clear name analysis data cache
export async function clearNameAnalysisDataCache(userId: string): Promise<void> {
  const app = getFirebaseDB();
  if (!app) return;
  
  const db = getFirebaseDB();
  const docRef = doc(db, 'users', userId, 'name-analysis', 'current');
  
  try {
    await setDoc(docRef, {});
    console.log('Cleared name analysis data cache for user:', userId);
  } catch (error) {
    console.warn('Error clearing name analysis data cache:', error);
  }
} 