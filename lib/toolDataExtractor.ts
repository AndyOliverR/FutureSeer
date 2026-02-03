// Service to extract specific tool data from stored comprehensive FutureSeer profile
import { ComprehensiveAstroData } from './astroDataService';
import { getComprehensiveAstroData } from './astroDataService';
import { doc, getDoc, collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { getFirebaseDB } from './firebase';

// Tool-specific data interfaces
export interface VedicAstrologyData {
  planetary_positions: Array<{
    planet: string;
    sign: string;
    degree: number;
    house: number;
    nakshatra?: string;
    pada?: number;
    retrograde?: boolean;
    strength?: string;
    aspects?: string[];
  }>;
  charts: {
    birth_chart?: string;
    navamsa_chart?: string;
    north_indian_chart?: string;
    south_indian_chart?: string;
    dasamsa_chart?: string;
    varga_charts?: { [key: string]: string };
  };
  house_analysis: Array<{
    house: number;
    sign: string;
    focus: string;
    remarks: string;
  }>;
  personality_analysis: {
    life_purpose: string;
    career_guidance: string;
    spiritual_path: string;
  };
  remedies: Array<{
    issue: string;
    remedy: string;
    gemstone?: string;
    mantra?: string;
  }>;
  doshas?: any[];
  yogas?: any[];
  dasha?: any;
  coaching?: any;
}

export interface WesternAstrologyData {
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  planets: Array<{
    name: string;
    sign: string;
    degree: number;
    house: number;
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
  personality_traits: string[];
  compatibility: {
    best_matches: string[];
    challenging_matches: string[];
  };
}

export interface NumerologyData {
  life_path_number: number;
  destiny_number: number;
  soul_number: number;
  personality_number: number;
  expression_number: number;
  analysis: {
    strengths: string[];
    challenges: string[];
    life_purpose: string;
  };
  angel_numbers: Array<{
    number: number;
    meaning: string;
    guidance: string;
  }>;
}

export interface TarotData {
  cards_drawn: Array<{
    card: string;
    position: string;
    meaning: string;
    guidance: string;
  }>;
  reading_type: string;
  overall_message: string;
  advice: string[];
}

// Main extraction function
export async function extractToolData(
  userId: string,
  toolName: string
): Promise<any> {
  try {
    const db = getFirebaseDB();
    
    // Extract tool-specific data based on tool name and correct collection paths
    switch (toolName.toLowerCase()) {
      case 'vedic astrology':
        return await extractVedicAstrologyDataFromFirebase(db, userId);
      
      case 'western astrology':
        return await extractWesternAstrologyDataFromFirebase(db, userId);
      
      case 'numerology':
        return await extractNumerologyDataFromFirebase(db, userId);
      
      case 'tarot':
        return await extractTarotDataFromFirebase(db, userId);
      
      case 'palmistry':
        return await extractPalmistryDataFromFirebase(db, userId);
      
      case 'face reading':
        return await extractFaceReadingDataFromFirebase(db, userId);
      
      case 'vastu':
        return await extractVastuDataFromFirebase(db, userId);
      
      case 'dream symbols':
        return await extractDreamSymbolsDataFromFirebase(db, userId);
      
      case 'angel numbers':
        return await extractAngelNumbersDataFromFirebase(db, userId);
      
      case 'bazi':
        return await extractBaziDataFromFirebase(db, userId);
      
      case 'i ching':
        return await extractIChingDataFromFirebase(db, userId);
      
      case 'runes':
        return await extractRunesDataFromFirebase(db, userId);
      
      case 'lenormand':
        return await extractLenormandDataFromFirebase(db, userId);
      
      case 'pendulum':
        return await extractPendulumDataFromFirebase(db, userId);
      
      case 'geomancy':
        return await extractGeomancyDataFromFirebase(db, userId);
      
      case 'akashic records':
        return await extractAkashicRecordsDataFromFirebase(db, userId);
      
      case 'human design':
        return await extractHumanDesignDataFromFirebase(db, userId);
      
      default:
        throw new Error(`Tool '${toolName}' not found in comprehensive profile`);
    }
  } catch (error: any) {
    console.error(`Error extracting ${toolName} data:`, error);
    throw new Error(`Tool '${toolName}' not found in comprehensive profile`);
  }
}

  // Vedic Astrology extraction from Firebase
  async function extractVedicAstrologyDataFromFirebase(db: any, userId: string): Promise<VedicAstrologyData> {
    try {
      // First, try to get comprehensive AstroApp data (this is where fresh data is stored)
      const comprehensiveDocRef = doc(db, 'users', userId, 'astroProfile', 'comprehensive');
      const comprehensiveDocSnap = await getDoc(comprehensiveDocRef);

      if (comprehensiveDocSnap.exists()) {
        const comprehensiveData = comprehensiveDocSnap.data();
        console.log('Found comprehensive AstroApp data:', {
          planets: comprehensiveData.planets?.length || 0,
          charts: Object.keys(comprehensiveData.vedicCharts || {}).length,
          source: comprehensiveData.metadata?.source
        });

        // Transform comprehensive AstroApp data to Vedic format
        return {
          planetary_positions: comprehensiveData.planets?.map((planet: any) => ({
            planet: planet.name,
            sign: planet.sign,
            degree: planet.degree,
            house: planet.house,
            nakshatra: '', // Will be calculated separately
            pada: 0,
            retrograde: planet.isRetrograde || false,
            strength: 'neutral',
            aspects: []
          })) || [],
          charts: {
            birth_chart: comprehensiveData.chartImage || '',
            north_indian_chart: comprehensiveData.vedicCharts?.north_indian_chart || '',
            south_indian_chart: comprehensiveData.vedicCharts?.south_indian_chart || '',
            navamsa_chart: comprehensiveData.vedicCharts?.navamsa_chart || ''
          },
          house_analysis: comprehensiveData.houses?.map((house: any) => ({
            house: house.number,
            sign: house.sign,
            focus: `House ${house.number} analysis`,
            remarks: `Sign: ${house.sign}, Degree: ${house.degree}°`
          })) || [],
          personality_analysis: {
            life_purpose: comprehensiveData.lifePath || '',
            career_guidance: comprehensiveData.personalityTraits?.join(', ') || '',
            spiritual_path: 'Spiritual guidance based on planetary positions'
          },
          remedies: [
            {
              issue: 'General Guidance',
              remedy: 'Practice meditation and mindfulness daily',
              gemstone: 'Ruby for Sun, Pearl for Moon',
              mantra: 'Om Namah Shivaya'
            }
          ],
          doshas: [],
          yogas: [],
          dasha: null,
          coaching: null
        };
      }

      // Fallback: Try to get Vedic-specific data from the old collection
      const vedicDocRef = doc(db, 'users', userId, 'vedic-readings', 'current');
      const vedicDocSnap = await getDoc(vedicDocRef);

      if (vedicDocSnap.exists()) {
        const vedicData = vedicDocSnap.data();
        console.log('Found Vedic data in vedic-readings:', vedicData);

        return {
          planetary_positions: vedicData.planets?.map((planet: any) => ({
            planet: planet.name || planet.planet,
            sign: planet.sign,
            degree: planet.degree || planet.longitude,
            house: planet.house,
            nakshatra: planet.nakshatra || '',
            pada: planet.pada || 0,
            retrograde: planet.retrograde || planet.isRetrograde || false,
            strength: planet.strength || 'neutral',
            aspects: planet.aspects || []
          })) || [],
          charts: {
            birth_chart: vedicData.charts?.birth_chart || '',
            north_indian_chart: vedicData.charts?.north_indian_chart || '',
            south_indian_chart: vedicData.charts?.south_indian_chart || '',
            navamsa_chart: vedicData.charts?.navamsa_chart || ''
          },
          house_analysis: vedicData.houses?.map((house: any) => ({
            house: house.number || house.house,
            sign: house.sign,
            focus: house.focus || house.themes?.join(', ') || `House ${house.number || house.house} analysis`,
            remarks: house.remarks || `Sign: ${house.sign}, Lord: ${house.lord || 'Unknown'}`
          })) || [],
          personality_analysis: {
            life_purpose: vedicData.personality?.lifePath || '',
            career_guidance: vedicData.personality?.careerGuidance || '',
            spiritual_path: vedicData.personality?.relationshipInsights || ''
          },
          remedies: vedicData.remedies ? [
            {
              issue: 'General Guidance',
              remedy: vedicData.remedies.gemstones?.join(', ') || '',
              gemstone: vedicData.remedies.gemstones?.[0] || '',
              mantra: vedicData.remedies.mantras?.[0] || ''
            }
          ] : [],
          doshas: vedicData.doshas || [],
          yogas: vedicData.yogas || [],
          dasha: vedicData.dasha || null,
          coaching: vedicData.coaching || null
        };
      }
    
      // If no stored data exists, return empty data structure instead of making API calls
      console.log('No Vedic data found in storage - returning empty structure');
      
      return {
        planetary_positions: [],
        charts: {},
        house_analysis: [],
        personality_analysis: {
          life_purpose: 'Please generate your mystical profile first',
          career_guidance: 'Complete your profile to get personalized guidance',
          spiritual_path: 'Generate your profile for spiritual insights'
        },
        remedies: [],
        doshas: [],
        yogas: [],
        dasha: null,
        coaching: null
      };
    
    } catch (error) {
      console.error('Error extracting Vedic Astrology data:', error);
      throw new Error('Vedic Astrology data not found in comprehensive profile');
    }
  }

// Western Astrology extraction from Firebase
async function extractWesternAstrologyDataFromFirebase(db: any, userId: string): Promise<WesternAstrologyData> {
  try {
    const astroDocRef = doc(db, 'users', userId, 'astroProfile', 'comprehensive');
    const astroDocSnap = await getDoc(astroDocRef);
    
    if (astroDocSnap.exists()) {
      const astroData = astroDocSnap.data();
      return {
        sun_sign: astroData.sunSign || '',
        moon_sign: astroData.moonSign || '',
        rising_sign: astroData.risingSign || '',
        planets: astroData.planets || [],
        houses: astroData.houses || [],
        aspects: astroData.aspects || [],
        personality_traits: astroData.personalityTraits || [],
        compatibility: astroData.compatibility || {
          best_matches: [],
          challenging_matches: []
        }
      };
    }
    
    throw new Error('No Western Astrology data found for user');
  } catch (error) {
    console.error('Error extracting Western Astrology data:', error);
    throw new Error('Western Astrology data not found in comprehensive profile');
  }
}

// Numerology extraction from Firebase
async function extractNumerologyDataFromFirebase(db: any, userId: string): Promise<NumerologyData> {
  try {
    const numerologyDocRef = doc(db, 'users', userId, 'numerologyProfile', 'comprehensive');
    const numerologyDocSnap = await getDoc(numerologyDocRef);
    
    if (numerologyDocSnap.exists()) {
      const numerologyData = numerologyDocSnap.data();
      return {
        life_path_number: numerologyData.lifePathNumber || 0,
        destiny_number: numerologyData.destinyNumber || 0,
        soul_number: numerologyData.soulNumber || 0,
        personality_number: numerologyData.personalityNumber || 0,
        expression_number: numerologyData.expressionNumber || 0,
        analysis: numerologyData.insights || {
          strengths: [],
          challenges: [],
          life_purpose: ''
        },
        angel_numbers: []
      };
    }
    
    throw new Error('No Numerology data found for user');
  } catch (error) {
    console.error('Error extracting Numerology data:', error);
    throw new Error('Numerology data not found in comprehensive profile');
  }
}

// Angel Numbers extraction from Firebase
async function extractAngelNumbersDataFromFirebase(db: any, userId: string): Promise<any> {
  try {
    const angelNumbersDocRef = doc(db, 'users', userId, 'angelNumbersProfile', 'comprehensive');
    const angelNumbersDocSnap = await getDoc(angelNumbersDocRef);
    
    if (angelNumbersDocSnap.exists()) {
      return angelNumbersDocSnap.data();
    }
    
    throw new Error('No Angel Numbers data found for user');
  } catch (error) {
    console.error('Error extracting Angel Numbers data:', error);
    throw new Error('Angel Numbers data not found in comprehensive profile');
  }
}

// Placeholder functions for other tools (to be implemented as needed)
async function extractTarotDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('Tarot data not found in comprehensive profile');
}

async function extractPalmistryDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('Palmistry data not found in comprehensive profile');
}

async function extractFaceReadingDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('Face Reading data not found in comprehensive profile');
}

async function extractVastuDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('Vastu data not found in comprehensive profile');
}

// Dream Symbols extraction from Firebase
async function extractDreamSymbolsDataFromFirebase(db: any, userId: string): Promise<any> {
  try {
    // Try comprehensiveMysticalProfiles collection first (where profile page stores data)
    const comprehensiveMysticalDocRef = doc(db, 'comprehensiveMysticalProfiles', userId);
    const comprehensiveMysticalDocSnap = await getDoc(comprehensiveMysticalDocRef);
    
    if (comprehensiveMysticalDocSnap.exists()) {
      const profileData = comprehensiveMysticalDocSnap.data();
      const dreamSymbolsData = profileData.dreamSymbols;
      
      if (dreamSymbolsData) {
        console.log('Found Dream Symbols data in comprehensiveMysticalProfiles');
        return {
          symbols: dreamSymbolsData.symbols || [],
          overallTheme: dreamSymbolsData.overallTheme || '',
          emotionalTone: dreamSymbolsData.emotionalTone || '',
          spiritualMessage: dreamSymbolsData.spiritualMessage || '',
          psychologicalInsight: dreamSymbolsData.psychologicalInsight || '',
          practicalAdvice: dreamSymbolsData.practicalAdvice || [],
          dreamDescription: dreamSymbolsData.dreamDescription || '',
          confidence: dreamSymbolsData.confidence || 0,
          dreamType: dreamSymbolsData.dreamType || 'ordinary',
          reading: dreamSymbolsData.reading || '',
          symbol_interpretations: dreamSymbolsData.symbol_interpretations || [],
          meanings: dreamSymbolsData.meanings || [],
          guidance: dreamSymbolsData.guidance || {},
          timing: dreamSymbolsData.timing || {},
          metadata: dreamSymbolsData.metadata || {}
        };
      }
    }
    
    // Try comprehensiveProfiles collection (alternative location)
    const comprehensiveDocRef = doc(db, 'comprehensiveProfiles', userId);
    const comprehensiveDocSnap = await getDoc(comprehensiveDocRef);
    
    if (comprehensiveDocSnap.exists()) {
      const profileData = comprehensiveDocSnap.data();
      const dreamSymbolsData = profileData.dreamSymbols;
      
      if (dreamSymbolsData) {
        console.log('Found Dream Symbols data in comprehensiveProfiles');
        return {
          symbols: dreamSymbolsData.symbols || [],
          overallTheme: dreamSymbolsData.overallTheme || '',
          emotionalTone: dreamSymbolsData.emotionalTone || '',
          spiritualMessage: dreamSymbolsData.spiritualMessage || '',
          psychologicalInsight: dreamSymbolsData.psychologicalInsight || '',
          practicalAdvice: dreamSymbolsData.practicalAdvice || [],
          dreamDescription: dreamSymbolsData.dreamDescription || '',
          confidence: dreamSymbolsData.confidence || 0,
          dreamType: dreamSymbolsData.dreamType || 'ordinary',
          reading: dreamSymbolsData.reading || '',
          symbol_interpretations: dreamSymbolsData.symbol_interpretations || [],
          meanings: dreamSymbolsData.meanings || [],
          guidance: dreamSymbolsData.guidance || {},
          timing: dreamSymbolsData.timing || {},
          metadata: dreamSymbolsData.metadata || {}
        };
      }
    }
    
    throw new Error('No Dream Symbols data found for user');
  } catch (error) {
    console.error('Error extracting Dream Symbols data:', error);
    throw new Error('Dream Symbols data not found in comprehensive profile');
  }
}

async function extractBaziDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('BaZi data not found in comprehensive profile');
}

async function extractIChingDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('I Ching data not found in comprehensive profile');
}

async function extractRunesDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('Runes data not found in comprehensive profile');
}

async function extractLenormandDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('Lenormand data not found in comprehensive profile');
}

async function extractPendulumDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('Pendulum data not found in comprehensive profile');
}

async function extractGeomancyDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('Geomancy data not found in comprehensive profile');
}

async function extractAkashicRecordsDataFromFirebase(db: any, userId: string): Promise<any> {
  try {
    const readingsRef = collection(db, 'users', userId, 'akashic-readings')
    const q = query(readingsRef, orderBy('timestamp', 'desc'), limit(1))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return doc.data()
    }
    return null
  } catch (error) {
    console.error('Error extracting Akashic Records data:', error)
    return null
  }
}

async function extractHumanDesignDataFromFirebase(db: any, userId: string): Promise<any> {
  throw new Error('Human Design data not found in comprehensive profile');
}
