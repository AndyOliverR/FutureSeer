// Service to extract specific tool data from stored comprehensive FutureSeer profile
import { ComprehensiveAstroData } from './astroDataService';
import { devLog } from '@/lib/devLogger';
import { getComprehensiveAstroData } from './astroDataService';
import {
  rootDocGet,
  userSubcollectionQueryOrdered,
  userSubdocGet,
} from '@/lib/userSubcollectionFirestore';

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
    // Extract tool-specific data based on tool name and correct collection paths
    switch (toolName.toLowerCase()) {
      case 'vedic astrology':
        return await extractVedicAstrologyDataFromFirebase(userId);
      
      case 'western astrology':
        return await extractWesternAstrologyDataFromFirebase(userId);
      
      case 'numerology':
        return await extractNumerologyDataFromFirebase(userId);
      
      case 'tarot':
        return await extractTarotDataFromFirebase(userId);
      
      case 'palmistry':
        return await extractPalmistryDataFromFirebase(userId);
      
      case 'face reading':
        return await extractFaceReadingDataFromFirebase(userId);
      
      case 'vastu':
        return await extractVastuDataFromFirebase(userId);
      
      case 'dream symbols':
        return await extractDreamSymbolsDataFromFirebase(userId);
      
      case 'angel numbers':
        return await extractAngelNumbersDataFromFirebase(userId);
      
      case 'bazi':
        return await extractBaziDataFromFirebase(userId);
      
      case 'i ching':
        return await extractIChingDataFromFirebase(userId);
      
      case 'runes':
        return await extractRunesDataFromFirebase(userId);
      
      case 'lenormand':
        return await extractLenormandDataFromFirebase(userId);
      
      case 'pendulum':
        return await extractPendulumDataFromFirebase(userId);
      
      case 'geomancy':
        return await extractGeomancyDataFromFirebase(userId);
      
      case 'akashic records':
        return await extractAkashicRecordsDataFromFirebase(userId);
      
      case 'human design':
        return await extractHumanDesignDataFromFirebase(userId);
      
      default:
        throw new Error(`Tool '${toolName}' not found in comprehensive profile`);
    }
  } catch (error: any) {
    devLog.error(`Error extracting ${toolName} data:`, error, 'toolDataExtractor');
    throw new Error(`Tool '${toolName}' not found in comprehensive profile`);
  }
}

  // Vedic Astrology extraction from Firebase
  async function extractVedicAstrologyDataFromFirebase(userId: string): Promise<VedicAstrologyData> {
    try {
      // First, try to get comprehensive AstroApp data (this is where fresh data is stored)
      const comprehensiveData = await userSubdocGet(userId, 'astroProfile', 'comprehensive');

      if (comprehensiveData) {
        const row = comprehensiveData as Record<string, unknown>;
        const planetsList = Array.isArray(row.planets) ? row.planets : [];
        const housesList = Array.isArray(row.houses) ? row.houses : [];
        const traitsList = Array.isArray(row.personalityTraits) ? row.personalityTraits : [];
        const vedicChartsRaw = row.vedicCharts;
        const vedicChartsObj =
          vedicChartsRaw && typeof vedicChartsRaw === 'object' && !Array.isArray(vedicChartsRaw)
            ? (vedicChartsRaw as Record<string, unknown>)
            : {};
        const meta = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
          ? (row.metadata as Record<string, unknown>)
          : undefined;

        devLog.debug('Found comprehensive AstroApp data:', {
          planets: planetsList.length,
          charts: Object.keys(vedicChartsObj).length,
          source: meta?.source,
        });

        // Transform comprehensive AstroApp data to Vedic format
        return {
          planetary_positions: planetsList.map((planet: any) => ({
            planet: planet.name,
            sign: planet.sign,
            degree: planet.degree,
            house: planet.house,
            nakshatra: '', // Will be calculated separately
            pada: 0,
            retrograde: planet.isRetrograde || false,
            strength: 'neutral',
            aspects: [],
          })),
          charts: {
            birth_chart: (typeof row.chartImage === 'string' ? row.chartImage : '') || '',
            north_indian_chart: (typeof vedicChartsObj.north_indian_chart === 'string' ? vedicChartsObj.north_indian_chart : '') || '',
            south_indian_chart: (typeof vedicChartsObj.south_indian_chart === 'string' ? vedicChartsObj.south_indian_chart : '') || '',
            navamsa_chart: (typeof vedicChartsObj.navamsa_chart === 'string' ? vedicChartsObj.navamsa_chart : '') || '',
          },
          house_analysis: housesList.map((house: any) => ({
            house: house.number,
            sign: house.sign,
            focus: `House ${house.number} analysis`,
            remarks: `Sign: ${house.sign}, Degree: ${house.degree}°`,
          })),
          personality_analysis: {
            life_purpose: (typeof row.lifePath === 'string' ? row.lifePath : '') || '',
            career_guidance: traitsList.filter((t): t is string => typeof t === 'string').join(', ') || '',
            spiritual_path: 'Spiritual guidance based on planetary positions',
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
      const vedicData = await userSubdocGet(userId, 'vedic-readings', 'current');

      if (vedicData) {
        devLog.debug('Found Vedic data in vedic-readings:', vedicData);

        const v = vedicData as Record<string, unknown>;
        const vPlanets = Array.isArray(v.planets) ? v.planets : [];
        const vHouses = Array.isArray(v.houses) ? v.houses : [];
        const chartsRaw = v.charts;
        const charts =
          chartsRaw && typeof chartsRaw === 'object' && !Array.isArray(chartsRaw)
            ? (chartsRaw as Record<string, unknown>)
            : {};
        const personalityRaw = v.personality;
        const personality =
          personalityRaw && typeof personalityRaw === 'object' && !Array.isArray(personalityRaw)
            ? (personalityRaw as Record<string, unknown>)
            : {};
        const remediesRaw = v.remedies;
        const remediesObj =
          remediesRaw && typeof remediesRaw === 'object' && !Array.isArray(remediesRaw)
            ? (remediesRaw as Record<string, unknown>)
            : null;
        const gemstoneList = remediesObj && Array.isArray(remediesObj.gemstones) ? remediesObj.gemstones : [];
        const mantraList = remediesObj && Array.isArray(remediesObj.mantras) ? remediesObj.mantras : [];
        const gemstoneStrs = gemstoneList.filter((x): x is string => typeof x === 'string');
        const mantraStrs = mantraList.filter((x): x is string => typeof x === 'string');

        return {
          planetary_positions: vPlanets.map((planet: any) => ({
            planet: planet.name || planet.planet,
            sign: planet.sign,
            degree: planet.degree || planet.longitude,
            house: planet.house,
            nakshatra: planet.nakshatra || '',
            pada: planet.pada || 0,
            retrograde: planet.retrograde || planet.isRetrograde || false,
            strength: planet.strength || 'neutral',
            aspects: planet.aspects || [],
          })),
          charts: {
            birth_chart: (typeof charts.birth_chart === 'string' ? charts.birth_chart : '') || '',
            north_indian_chart: (typeof charts.north_indian_chart === 'string' ? charts.north_indian_chart : '') || '',
            south_indian_chart: (typeof charts.south_indian_chart === 'string' ? charts.south_indian_chart : '') || '',
            navamsa_chart: (typeof charts.navamsa_chart === 'string' ? charts.navamsa_chart : '') || '',
          },
          house_analysis: vHouses.map((house: any) => ({
            house: house.number || house.house,
            sign: house.sign,
            focus: house.focus || (Array.isArray(house.themes) ? house.themes.join(', ') : '') || `House ${house.number || house.house} analysis`,
            remarks: house.remarks || `Sign: ${house.sign}, Lord: ${house.lord || 'Unknown'}`,
          })),
          personality_analysis: {
            life_purpose: (typeof personality.lifePath === 'string' ? personality.lifePath : '') || '',
            career_guidance: (typeof personality.careerGuidance === 'string' ? personality.careerGuidance : '') || '',
            spiritual_path: (typeof personality.relationshipInsights === 'string' ? personality.relationshipInsights : '') || '',
          },
          remedies: remediesObj
            ? [
                {
                  issue: 'General Guidance',
                  remedy: gemstoneStrs.join(', ') || '',
                  gemstone: gemstoneStrs[0] || '',
                  mantra: mantraStrs[0] || '',
                },
              ]
            : [],
          doshas: Array.isArray(v.doshas) ? v.doshas : [],
          yogas: Array.isArray(v.yogas) ? v.yogas : [],
          dasha: v.dasha ?? null,
          coaching: v.coaching ?? null,
        };
      }
    
      // If no stored data exists, return empty data structure instead of making API calls
      devLog.debug('No Vedic data found in storage - returning empty structure');
      
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
      devLog.error('Error extracting Vedic Astrology data:', error, 'toolDataExtractor');
      throw new Error('Vedic Astrology data not found in comprehensive profile');
    }
  }

// Western Astrology extraction from Firebase
async function extractWesternAstrologyDataFromFirebase(userId: string): Promise<WesternAstrologyData> {
  try {
    const astroData = await userSubdocGet(userId, 'astroProfile', 'comprehensive');
    
    if (astroData) {
      const a = astroData as Record<string, unknown>;
      const planets = Array.isArray(a.planets) ? a.planets : [];
      const houses = Array.isArray(a.houses) ? a.houses : [];
      const aspects = Array.isArray(a.aspects) ? a.aspects : [];
      const traitsRaw = a.personalityTraits;
      const personality_traits =
        Array.isArray(traitsRaw) ? traitsRaw.filter((t): t is string => typeof t === 'string') : [];
      const compatRaw = a.compatibility;
      const compat =
        compatRaw && typeof compatRaw === 'object' && !Array.isArray(compatRaw)
          ? (compatRaw as Record<string, unknown>)
          : {};
      const bestRaw = compat.best_matches;
      const challRaw = compat.challenging_matches;
      const best_matches = Array.isArray(bestRaw)
        ? bestRaw.filter((x): x is string => typeof x === 'string')
        : [];
      const challenging_matches = Array.isArray(challRaw)
        ? challRaw.filter((x): x is string => typeof x === 'string')
        : [];
      return {
        sun_sign: typeof a.sunSign === 'string' ? a.sunSign : '',
        moon_sign: typeof a.moonSign === 'string' ? a.moonSign : '',
        rising_sign: typeof a.risingSign === 'string' ? a.risingSign : '',
        planets: planets as WesternAstrologyData['planets'],
        houses: houses as WesternAstrologyData['houses'],
        aspects: aspects as WesternAstrologyData['aspects'],
        personality_traits,
        compatibility: { best_matches, challenging_matches },
      };
    }
    
    throw new Error('No Western Astrology data found for user');
  } catch (error) {
    devLog.error('Error extracting Western Astrology data:', error, 'toolDataExtractor');
    throw new Error('Western Astrology data not found in comprehensive profile');
  }
}

// Numerology extraction from Firebase
async function extractNumerologyDataFromFirebase(userId: string): Promise<NumerologyData> {
  try {
    const numerologyData = await userSubdocGet(userId, 'numerologyProfile', 'comprehensive');
    
    if (numerologyData) {
      const n = numerologyData as Record<string, unknown>;
      const num = (k: string) => (typeof n[k] === 'number' && Number.isFinite(n[k] as number) ? (n[k] as number) : 0);
      const insightsRaw = n.insights;
      const insights =
        insightsRaw && typeof insightsRaw === 'object' && !Array.isArray(insightsRaw)
          ? (insightsRaw as Record<string, unknown>)
          : null;
      const strengths = insights && Array.isArray(insights.strengths) ? insights.strengths : [];
      const challenges = insights && Array.isArray(insights.challenges) ? insights.challenges : [];
      const lifePurpose =
        insights && typeof insights.life_purpose === 'string' ? insights.life_purpose : '';
      return {
        life_path_number: num('lifePathNumber'),
        destiny_number: num('destinyNumber'),
        soul_number: num('soulNumber'),
        personality_number: num('personalityNumber'),
        expression_number: num('expressionNumber'),
        analysis: {
          strengths: strengths.filter((x): x is string => typeof x === 'string'),
          challenges: challenges.filter((x): x is string => typeof x === 'string'),
          life_purpose: lifePurpose,
        },
        angel_numbers: [],
      };
    }
    
    throw new Error('No Numerology data found for user');
  } catch (error) {
    devLog.error('Error extracting Numerology data:', error, 'toolDataExtractor');
    throw new Error('Numerology data not found in comprehensive profile');
  }
}

// Angel Numbers extraction from Firebase
async function extractAngelNumbersDataFromFirebase(userId: string): Promise<any> {
  try {
    const angelRow = await userSubdocGet(userId, 'angelNumbersProfile', 'comprehensive');
    
    if (angelRow) {
      return angelRow;
    }
    
    throw new Error('No Angel Numbers data found for user');
  } catch (error) {
    devLog.error('Error extracting Angel Numbers data:', error, 'toolDataExtractor');
    throw new Error('Angel Numbers data not found in comprehensive profile');
  }
}

// Placeholder functions for other tools (to be implemented as needed)
async function extractTarotDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('Tarot data not found in comprehensive profile');
}

async function extractPalmistryDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('Palmistry data not found in comprehensive profile');
}

async function extractFaceReadingDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('Face Reading data not found in comprehensive profile');
}

async function extractVastuDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('Vastu data not found in comprehensive profile');
}

function shapeDreamSymbolsPayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const d = raw as Record<string, unknown>;
  return {
    symbols: Array.isArray(d.symbols) ? d.symbols : [],
    overallTheme: typeof d.overallTheme === 'string' ? d.overallTheme : '',
    emotionalTone: typeof d.emotionalTone === 'string' ? d.emotionalTone : '',
    spiritualMessage: typeof d.spiritualMessage === 'string' ? d.spiritualMessage : '',
    psychologicalInsight: typeof d.psychologicalInsight === 'string' ? d.psychologicalInsight : '',
    practicalAdvice: Array.isArray(d.practicalAdvice) ? d.practicalAdvice : [],
    dreamDescription: typeof d.dreamDescription === 'string' ? d.dreamDescription : '',
    confidence: typeof d.confidence === 'number' && Number.isFinite(d.confidence) ? d.confidence : 0,
    dreamType: typeof d.dreamType === 'string' ? d.dreamType : 'ordinary',
    reading: typeof d.reading === 'string' ? d.reading : '',
    symbol_interpretations: Array.isArray(d.symbol_interpretations) ? d.symbol_interpretations : [],
    meanings: Array.isArray(d.meanings) ? d.meanings : [],
    guidance: d.guidance && typeof d.guidance === 'object' && !Array.isArray(d.guidance) ? d.guidance : {},
    timing: d.timing && typeof d.timing === 'object' && !Array.isArray(d.timing) ? d.timing : {},
    metadata: d.metadata && typeof d.metadata === 'object' && !Array.isArray(d.metadata) ? d.metadata : {},
  };
}

// Dream Symbols extraction from Firebase
async function extractDreamSymbolsDataFromFirebase(userId: string): Promise<any> {
  try {
    // Try comprehensiveMysticalProfiles collection first (where profile page stores data)
    const profileData = await rootDocGet('comprehensiveMysticalProfiles', userId);
    
    if (profileData) {
      const shaped = shapeDreamSymbolsPayload(
        (profileData as Record<string, unknown>).dreamSymbols,
      );
      if (shaped) {
        devLog.debug('Found Dream Symbols data in comprehensiveMysticalProfiles');
        return shaped;
      }
    }
    
    // Try comprehensiveProfiles collection (alternative location)
    const profileDataAlt = await rootDocGet('comprehensiveProfiles', userId);
    
    if (profileDataAlt) {
      const shaped = shapeDreamSymbolsPayload(
        (profileDataAlt as Record<string, unknown>).dreamSymbols,
      );
      if (shaped) {
        devLog.debug('Found Dream Symbols data in comprehensiveProfiles');
        return shaped;
      }
    }
    
    throw new Error('No Dream Symbols data found for user');
  } catch (error) {
    devLog.error('Error extracting Dream Symbols data:', error, 'toolDataExtractor');
    throw new Error('Dream Symbols data not found in comprehensive profile');
  }
}

async function extractBaziDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('BaZi data not found in comprehensive profile');
}

async function extractIChingDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('I Ching data not found in comprehensive profile');
}

async function extractRunesDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('Runes data not found in comprehensive profile');
}

async function extractLenormandDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('Lenormand data not found in comprehensive profile');
}

async function extractPendulumDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('Pendulum data not found in comprehensive profile');
}

async function extractGeomancyDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('Geomancy data not found in comprehensive profile');
}

async function extractAkashicRecordsDataFromFirebase(userId: string): Promise<any> {
  try {
    const rows = await userSubcollectionQueryOrdered(userId, 'akashic-readings', 'timestamp', 'desc', 1);
    if (rows.length > 0) {
      const { id: _id, ...rest } = rows[0];
      return rest;
    }
    return null;
  } catch (error) {
    devLog.error('Error extracting Akashic Records data:', error, 'toolDataExtractor')
    return null
  }
}

async function extractHumanDesignDataFromFirebase(_userId: string): Promise<any> {
  throw new Error('Human Design data not found in comprehensive profile');
}
