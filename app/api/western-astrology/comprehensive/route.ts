import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { createAICompletion } from '@/lib/aiGateway';
import { devLog, devWarn } from '@/lib/devLogger';
import { transformComprehensiveToChunks } from '@/lib/westernReportChunks';
import {
  extractJsonCandidate,
  parseJsonWithRepairs,
  stripMarkdownCodeFences,
} from '@/lib/westernJsonParser';
import {
  elementModalityPolarityCounts,
  partOfFortuneFromPlanets,
  type PlanetLike,
} from '@/lib/western/chartDerivedFacts';

// Helper to check if we're using Admin SDK
function isAdminSDK(db: any): boolean {
  return db && typeof db.collection === 'function';
}

// Helper to get document using Admin SDK or Client SDK
async function getCachedDoc(collectionPath: string[], docId: string): Promise<any> {
  const db = getFirebaseDB();
  if (!db) return null;

  try {
    if (isAdminSDK(db)) {
      // Admin SDK API - handle nested collections: users/{userId}/westernAstrologyReports/comprehensive
      let ref: any = db.collection(collectionPath[0]); // users
      for (let i = 1; i < collectionPath.length; i += 2) {
        const docIdInPath = collectionPath[i];
        if (i + 1 < collectionPath.length) {
          const nextCollection = collectionPath[i + 1];
          ref = ref.doc(docIdInPath).collection(nextCollection);
        } else {
          ref = ref.doc(docIdInPath);
        }
      }
      // If we still have a collection ref, get the final doc
      if (ref.get && typeof ref.get === 'function') {
        const snapshot = await ref.doc(docId).get();
        return snapshot.exists ? { exists: () => true, data: () => snapshot.data() } : { exists: () => false, data: () => null };
      } else {
        // Already a doc ref
        const snapshot = await ref.get();
        return snapshot.exists ? { exists: () => true, data: () => snapshot.data() } : { exists: () => false, data: () => null };
      }
    } else {
      // Client SDK API
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, ...collectionPath, docId);
      return await getDoc(docRef);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devWarn('Error getting document:', error, 'western-astrology');
    }
    return { exists: () => false, data: () => null };
  }
}

// Helper to set document using Admin SDK or Client SDK
async function setCachedDoc(collectionPath: string[], docId: string, data: any): Promise<void> {
  const db = getFirebaseDB();
  if (!db) return;

  try {
    if (isAdminSDK(db)) {
      // Admin SDK API - handle nested collections: users/{userId}/westernAstrologyReports/comprehensive
      let ref: any = db.collection(collectionPath[0]); // users
      for (let i = 1; i < collectionPath.length; i += 2) {
        const docIdInPath = collectionPath[i];
        if (i + 1 < collectionPath.length) {
          const nextCollection = collectionPath[i + 1];
          ref = ref.doc(docIdInPath).collection(nextCollection);
        } else {
          ref = ref.doc(docIdInPath);
        }
      }
      // If we still have a collection ref, set the final doc
      if (ref.doc && typeof ref.doc === 'function') {
        await ref.doc(docId).set(data);
      } else {
        // Already a doc ref
        await ref.set(data);
      }
    } else {
      // Client SDK API
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(db, ...collectionPath, docId);
      await setDoc(docRef, data);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devWarn('Error setting document:', error, 'western-astrology');
    }
  }
}

// Schema version for predictive insights format
// Version 2.0: Structured object with time-based predictions (today, week, month, year, etc.)
const PREDICTIVE_INSIGHTS_SCHEMA_VERSION = '2.0';

/** Coordinates concurrent POSTs for the same user; waiters re-read Firestore after the leader finishes. */
const westernComprehensiveInFlight = new Map<string, Promise<void>>();

async function readValidWesternComprehensiveCache(userId: string): Promise<unknown | null> {
  try {
    const docSnap = await getCachedDoc(['users', userId, 'westernAstrologyReports'], 'comprehensive');
    if (!docSnap || !docSnap.exists()) return null;
    const cachedData = docSnap.data();
    const lastUpdated = cachedData?.timestamp;
    if (!lastUpdated) return null;
    const hoursSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60);
    if (hoursSinceUpdate >= 24) return null;
    const actualData = cachedData.data || cachedData;
    const comprehensiveAnalysis = actualData?.comprehensiveAnalysis || actualData;
    const predictiveInsights = comprehensiveAnalysis?.predictiveInsights;
    const schemaVersion = cachedData?.schemaVersion || actualData?.schemaVersion;
    const isOldFormat = typeof predictiveInsights === 'string';
    if (isOldFormat || !schemaVersion || schemaVersion !== PREDICTIVE_INSIGHTS_SCHEMA_VERSION) {
      devLog.info(
        '🔄 Cached report has old format or schema version mismatch - forcing regeneration for user:',
        userId,
        'western',
      );
      return null;
    }
    return actualData;
  } catch {
    return null;
  }
}


interface ComprehensiveWesternRequest {
  userId: string;
  chartData: {
    planets?: any[];
    houses?: any[];
    aspects?: any[];
    transits?: any[];
  };
}

interface ComprehensiveWesternResponse {
  success: boolean;
  data?: {
    comprehensiveAnalysis: {
      chartOverview: string;
      planetaryAnalysis: Array<{ planet: string; analysis: string }>;
      houseAnalysis: Array<{ house: number; analysis: string }>;
      aspectAnalysis: Array<{ aspect: string; analysis: string }>;
      transitAnalysis: string;
      predictiveInsights: {
        todaysQuickWin: string;
        currentWeek: string;
        currentMonth: string;
        currentYear: string;
        nextYearSneakPeek: string;
        longerTermCycles: string;
      } | string; // Support both old (string) and new (object) formats
    };
    timestamp: number;
  };
  error?: string;
}

// Build comprehensive Groq prompt
function buildGroqPrompt(chartData: ComprehensiveWesternRequest['chartData']): string {
  const planets = chartData.planets || [];
  const houses = chartData.houses || [];
  const aspects = chartData.aspects || [];
  const transits = chartData.transits || [];

  // Format planets data
  const planetsText = planets.map(p => 
    `${p.name}: ${p.sign?.signName || p.sign} in House ${p.house || 'N/A'} at ${p.degree?.toFixed(1) || 'N/A'}°`
  ).join('\n');

  // Format houses data
  const housesText = houses.map((h, idx) => 
    `House ${h.number || idx + 1}: ${h.sign?.signName || h.sign} cusp at ${h.degree?.toFixed(1) || 'N/A'}°`
  ).join('\n');

  // Format aspects data
  const aspectsText = aspects.slice(0, 20).map(a => 
    `${a.planet1 || 'Planet1'} ${a.type || 'aspect'} ${a.planet2 || 'Planet2'} (${a.orb?.toFixed(2) || 'N/A'}° orb)`
  ).join('\n');

  // Format transits data
  const transitsText = transits.slice(0, 10).map(t => 
    `Transit ${t.name || 'Planet'}: ${t.sign?.signName || t.sign} in House ${t.house || 'N/A'} at ${t.degree?.toFixed(1) || 'N/A'}°`
  ).join('\n');

  // Identify key chart elements for personalized predictions
  const sunPlanet = planets.find(p => p.name?.toLowerCase() === 'sun');
  const moonPlanet = planets.find(p => p.name?.toLowerCase() === 'moon');
  const risingHouse = houses.find((h, idx) => (h.number || idx + 1) === 1);
  
  const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
  const sunHouse = sunPlanet?.house || 'Unknown';
  const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'Unknown';
  const moonHouse = moonPlanet?.house || 'Unknown';
  const risingSign = risingHouse?.sign?.signName || risingHouse?.sign || 'Unknown';
  
  // Key transits for predictions
  const todayTransits = transits.slice(0, 3).map(t => ({
    planet: t.name,
    sign: t.sign?.signName || t.sign,
    house: t.house
  }));
  
  // Active aspects for reference
  const majorAspects = aspects.filter(a => {
    const type = (a.type || '').toLowerCase();
    return type.includes('conjunction') || type.includes('square') || type.includes('trine') || type.includes('opposition');
  }).slice(0, 5);

  const pl = planets as PlanetLike[];
  const derivedCounts = elementModalityPolarityCounts(pl);
  const pof = partOfFortuneFromPlanets(pl);
  const ephemerisLine =
    (chartData as { ephemeris?: { planets?: string } }).ephemeris?.planets || '';

  // Calculate time periods for predictions
  const today = new Date();
  const currentYear = today.getFullYear();
  const nextYear = currentYear + 1;
  const currentMonth = today.toLocaleString('en-US', { month: 'long' });
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  const weekRange = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return `You are an expert Western astrologer specializing in the Tropical Zodiac system. Provide comprehensive, insightful, and practical guidance based on the complete birth chart.

TIME CONTEXT:
- Today's Date: ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Current Week: ${weekRange}
- Current Month: ${currentMonth} ${currentYear}
- Current Year: ${currentYear}
- Next Year: ${nextYear}

IMPORTANT CONTEXT - Western Astrology Philosophy:
Modern Western astrology focuses on psychological interpretation and counseling rather than ritualistic remedies. The emphasis is on fostering self-awareness and personal growth to navigate life's challenges. When providing guidance:
- Focus on self-awareness, mindfulness, and psychological insights
- Suggest lifestyle adjustments, routines, meditation, or professional counseling/therapy when appropriate
- Emphasize using free will and conscious engagement with planetary energies
- DO NOT suggest ritualistic remedies like gemstones, mantras, or talismans (those belong to Vedic/traditional systems)
- The primary "remedy" is the application of self-knowledge to consciously engage with life

CHART DATA:

${ephemerisLine ? `EPHEMERIS NOTE (for grounding; do not contradict):\n${ephemerisLine}\n\n` : ''}DERIVED_TABLES (deterministic — use as supporting context):
- Element / modality / polarity counts (10 classical planets): ${JSON.stringify(derivedCounts)}
- Part of Fortune (classic tropical): ${pof ? `${pof.sign} ~${pof.degreeInSign.toFixed(1)}° (${pof.isDayChart ? 'day' : 'night'} chart formula)` : 'unknown (need Asc/Sun/Moon longitudes)'}

PLANETS:
${planetsText || 'No planetary data available'}

HOUSES:
${housesText || 'No house data available'}

ASPECTS:
${aspectsText || 'No aspect data available'}

CURRENT TRANSITS:
${transitsText || 'No transit data available'}

KEY CHART ELEMENTS FOR PERSONALIZATION:
- Sun: ${sunSign} in House ${sunHouse}
- Moon: ${moonSign} in House ${moonHouse}
- Rising Sign (Ascendant): ${risingSign}
${majorAspects.length > 0 ? '- Major Aspects: ' + majorAspects.map(a => `${a.planet1 || 'Planet'} ${a.type || 'aspect'} ${a.planet2 || 'Planet'}`).join(', ') : ''}
${todayTransits.length > 0 ? '- Notable Current Transits: ' + todayTransits.map(t => `${t.planet} in ${t.sign} (House ${t.house})`).join(', ') : ''}

PREDICTION REQUIREMENTS - CRITICAL:
ALL predictions MUST be personalized to THIS specific birth chart. Generic horoscope text is NOT acceptable.

- todaysQuickWin: MUST reference specific transits occurring today, aspects being activated, or planets in specific houses. Example: "With your Sun in Pisces in the 7th house, today's Moon-Jupiter trine activates relationship themes..."
- currentWeek: MUST mention which planets are transiting which houses this week, or which natal aspects are being triggered. Example: "As Mercury enters your 10th house this week, career communication opportunities arise..."
- currentMonth: MUST reference significant monthly transits affecting your chart. Example: "Venus transiting your natal Mars suggests romantic and creative energies this month..."
- currentYear: MUST identify major planetary cycles, retrogrades, or significant transits affecting the chart throughout the year. Reference specific planets and houses.
- nextYearSneakPeek: MUST identify upcoming major transits or planetary cycles. Reference how outer planets (Jupiter, Saturn, Uranus, Neptune, Pluto) will affect the chart.
- longerTermCycles: MUST reference solar return themes, lunar return patterns, and progression cycles specific to this chart.

Personalization Rules:
✓ Reference actual planetary positions from PLANETS section above
✓ Mention specific house placements from HOUSES section
✓ Cite relevant aspects from ASPECTS section
✓ Connect current transits to natal chart placements
✓ Use language like "your Sun in [Sign]", "your natal [Planet]", "[Planet] transiting your [House] house"
✗ DO NOT write generic horoscope text that could apply to anyone
✗ DO NOT ignore the chart data provided
✗ DO NOT create predictions without referencing specific chart elements

Generate a comprehensive Western astrology analysis covering all life areas. Format your response as a JSON object with the following structure:
{
  "chartOverview": "Detailed paragraph summarizing the chart's dominant themes, elements, overall character, and key patterns.",
  "planetaryAnalysis": [
    {"planet": "Sun", "analysis": "Detailed interpretation of Sun's sign, house, aspects, and meaning"},
    {"planet": "Moon", "analysis": "Detailed interpretation of Moon's sign, house, aspects, and meaning"},
    {"planet": "Mercury", "analysis": "Detailed interpretation of Mercury's sign, house, aspects, and meaning"},
    {"planet": "Venus", "analysis": "Detailed interpretation of Venus's sign, house, aspects, and meaning"},
    {"planet": "Mars", "analysis": "Detailed interpretation of Mars's sign, house, aspects, and meaning"},
    {"planet": "Jupiter", "analysis": "Detailed interpretation of Jupiter's sign, house, aspects, and meaning"},
    {"planet": "Saturn", "analysis": "Detailed interpretation of Saturn's sign, house, aspects, and meaning"},
    {"planet": "Uranus", "analysis": "Detailed interpretation of Uranus's sign, house, aspects, and meaning"},
    {"planet": "Neptune", "analysis": "Detailed interpretation of Neptune's sign, house, aspects, and meaning"},
    {"planet": "Pluto", "analysis": "Detailed interpretation of Pluto's sign, house, aspects, and meaning"}
  ],
  "houseAnalysis": [
    {"house": 1, "analysis": "Detailed interpretation of House 1 themes, sign on cusp, and life area"},
    {"house": 2, "analysis": "Detailed interpretation of House 2 themes, sign on cusp, and life area"},
    {"house": 3, "analysis": "Detailed interpretation of House 3 themes, sign on cusp, and life area"},
    {"house": 4, "analysis": "Detailed interpretation of House 4 themes, sign on cusp, and life area"},
    {"house": 5, "analysis": "Detailed interpretation of House 5 themes, sign on cusp, and life area"},
    {"house": 6, "analysis": "Detailed interpretation of House 6 themes, sign on cusp, and life area"},
    {"house": 7, "analysis": "Detailed interpretation of House 7 themes, sign on cusp, and life area"},
    {"house": 8, "analysis": "Detailed interpretation of House 8 themes, sign on cusp, and life area"},
    {"house": 9, "analysis": "Detailed interpretation of House 9 themes, sign on cusp, and life area"},
    {"house": 10, "analysis": "Detailed interpretation of House 10 themes, sign on cusp, and life area"},
    {"house": 11, "analysis": "Detailed interpretation of House 11 themes, sign on cusp, and life area"},
    {"house": 12, "analysis": "Detailed interpretation of House 12 themes, sign on cusp, and life area"}
  ],
  "aspectAnalysis": [
    {"aspect": "Sun square Moon", "analysis": "Detailed interpretation of this aspect's meaning and impact"},
    {"aspect": "Venus trine Jupiter", "analysis": "Detailed interpretation of this aspect's meaning and impact"}
  ],
  "transitAnalysis": "Detailed paragraph about current transits, their timing, and major planetary influences affecting the chart now.",
  "predictiveInsights": {
    "todaysQuickWin": "MUST reference specific transits occurring today or aspects being activated. Mention which planet is transiting which house, or which natal aspect is being triggered. Reference the chart elements above. Example: 'With your Sun in [Sign] in House [Number], today's [specific transit] activates...' Keep it concise (2-3 sentences) and actionable.",
    "currentWeek": "MUST reference which planets are transiting which houses this week, or which natal aspects are being triggered. Connect transits to natal placements. Example: 'As [Planet] transits your [House] house this week, it activates your natal [Planet]...' Keep it practical and specific to the chart.",
    "currentMonth": "MUST reference significant monthly transits affecting the chart. Mention specific planetary movements and how they interact with natal placements. Example: 'Venus transiting your natal Mars in [Sign/House] suggests...' Provide actionable insights based on actual chart data.",
    "currentYear": "MUST identify major planetary cycles, retrogrades, or significant transits affecting the chart throughout the current year. Reference how outer planets (Jupiter, Saturn, Uranus, Neptune, Pluto) will transit through specific houses. Example: 'Jupiter's transit through your [House] house this year brings...' Highlight key periods based on actual transits.",
    "nextYearSneakPeek": "MUST identify upcoming major transits or planetary cycles for next year. Reference how outer planets will affect specific houses and natal placements. Example: 'In [NextYear], Saturn's entry into your [House] house will...' Provide insight based on upcoming planetary movements.",
    "longerTermCycles": "MUST reference solar return themes, lunar return patterns, and progression cycles specific to this chart. Reference the Sun, Moon, and Rising Sign positions from the chart data above. Connect longer-term patterns to natal chart structure."
  }
}

Make each section comprehensive yet concise. Focus on practical guidance, self-awareness, and empowering insights. Write in a warm, insightful tone.`;
}

// Parse Groq response and extract structured data
type WesternComprehensiveAnalysis = NonNullable<ComprehensiveWesternResponse['data']>['comprehensiveAnalysis'];

function parseGroqResponse(response: string, planets: any[], houses: any[], aspects: any[], transits: any[] = []): WesternComprehensiveAnalysis {
  const verboseParse = process.env.VERBOSE_ASTRO_LOGS === '1';
  if (verboseParse) {
    devLog.debug('🔍 ========== STARTING PARSE GROQ RESPONSE ==========', undefined, 'western');
    devLog.debug('🔍 Response length:', response.length, 'western');
    devLog.debug('🔍 Planets available:', planets.length, 'western');
    devLog.debug('🔍 Houses available:', houses.length, 'western');
    devLog.debug('🔍 Aspects available:', aspects.length, 'western');
    devLog.debug('🔍 Transits available:', transits.length, 'western');
  }

  // Verify response structure before parsing
  if (!response || response.length === 0) {
    devLog.error('❌ Response is empty - cannot parse');
    throw new Error('Empty response from Groq');
  }
  
  // Check if response contains any JSON-like structure
  const hasJsonStructure = response.includes('{');
  if (!hasJsonStructure) {
    devLog.error('❌ Response does not contain JSON structure');
    devLog.error('❌ Response preview:', response.substring(0, 500));
    throw new Error('Response does not contain valid JSON structure');
  }
  
  try {
    // Strategy 0: Try direct JSON match (most common)
    devLog.debug('🔍 Strategy 0: Trying direct JSON match...', undefined, 'western');
    let jsonCandidate = extractJsonCandidate(response);
    if (jsonCandidate && jsonCandidate.length > 100) {
      devLog.debug(`✅ Strategy 0: Found JSON candidate, length: ${jsonCandidate.length}`, undefined, 'western');
    } else {
      devLog.warn(`⚠️ Strategy 0: JSON candidate too short or not found, length: ${jsonCandidate?.length ?? 0}`, undefined, 'western');
    }
    
    // Strategy 1: Try extracting from markdown code blocks (most common)
    if (!jsonCandidate || jsonCandidate.length < 100) {
      devLog.debug('🔍 Strategy 1: Trying markdown code block extraction...', undefined, 'western');
      const codeBlockMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonCandidate = codeBlockMatch[1];
        devLog.debug(`✅ Strategy 1: Extracted JSON from markdown code block, length: ${jsonCandidate.length}`, undefined, 'western');
      } else {
        devLog.warn('⚠️ Strategy 1: No markdown code block found', undefined, 'western');
      }
    }
    
    // Strategy 2: Try finding JSON after common prefixes
    if (!jsonCandidate || jsonCandidate.length < 100) {
      devLog.debug('🔍 Strategy 2: Trying JSON after prefix...', undefined, 'western');
      const prefixMatch = response.match(/(?:Here'?s?|Here is|Here's|The analysis|The chart analysis|Analysis):\s*(\{[\s\S]*\})/i);
      if (prefixMatch && prefixMatch[1]) {
        jsonCandidate = prefixMatch[1];
        devLog.debug(`✅ Strategy 2: Extracted JSON after prefix, length: ${jsonCandidate.length}`, undefined, 'western');
      } else {
        devLog.warn('⚠️ Strategy 2: No prefix match found', undefined, 'western');
      }
    }
    
    // Strategy 3: Try finding the largest JSON object
    if (!jsonCandidate || jsonCandidate.length < 100) {
      devLog.debug('🔍 Strategy 3: Trying to find largest JSON object...', undefined, 'western');
      const allMatches = response.match(/\{[\s\S]*?\}(?=\s*\{|\s*$)/g);
      if (allMatches && allMatches.length > 0) {
        // Find the largest JSON object (likely the main response)
        jsonCandidate = allMatches.sort((a, b) => b.length - a.length)[0];
        devLog.debug(`✅ Strategy 3: Extracted largest JSON object from ${allMatches.length} matches, length: ${jsonCandidate.length}`, undefined, 'western');
      } else {
        devLog.warn('⚠️ Strategy 3: No JSON objects found', undefined, 'western');
      }
    }
    
    if (jsonCandidate) {
      devLog.debug(`✅ Found JSON candidate, length: ${jsonCandidate.length}`, undefined, 'western');
      devLog.debug('🔍 JSON preview (first 1000 chars):', jsonCandidate.substring(0, 1000), 'western');
      devLog.debug('🔍 JSON preview (last 500 chars):', jsonCandidate.substring(Math.max(0, jsonCandidate.length - 500)), 'western');
      
      let parsed;
      let jsonString = jsonCandidate;
      
      // Clean up JSON string - remove common issues
      devLog.debug('🔍 Cleaning JSON string...', undefined, 'western');
      const originalLength = jsonString.length;
      jsonString = stripMarkdownCodeFences(jsonString);
      const extracted = extractJsonCandidate(jsonString);
      if (extracted) jsonString = extracted;
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
      jsonString = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      if (originalLength !== jsonString.length) {
        devLog.debug(`🔍 Cleaned JSON string, removed ${originalLength - jsonString.length}`, undefined, 'western');
      }
      
      devLog.debug('🔍 Attempting JSON.parse...', undefined, 'western');
      try {
        parsed = parseJsonWithRepairs(jsonString);
        devLog.debug('✅ JSON.parse successful!', undefined, 'western');
        devLog.debug(`🔍 Parsed object keys: ${Object.keys(parsed || {}).join(', ')}`, undefined, 'western');
      } catch (parseError: any) {
        devLog.error('❌ JSON.parse failed:', parseError.message);
        devLog.error('❌ Error at position:', parseError.message.match(/position (\d+)/)?.[1] || 'unknown');
        
        // Try to fix common JSON issues and parse again
        devLog.debug('🔍 Attempting to fix JSON...', undefined, 'western');
        try {
          // Try to extract just the main object if nested incorrectly
          const fixedMatch = jsonString.match(/\{[\s\S]*"chartOverview"[\s\S]*/);
          if (fixedMatch) {
            devLog.debug('🔍 Found chartOverview in JSON, attempting to extract main object...', undefined, 'western');
            parsed = parseJsonWithRepairs(fixedMatch[0]);
            devWarn('⚠️ Fixed JSON by extracting main object');
          } else {
            // Try to find the main JSON object by looking for key fields
            const alternativeMatch = jsonString.match(/\{[\s\S]*?(?:"chartOverview"|"planetaryAnalysis"|"houseAnalysis")[\s\S]*/);
            if (alternativeMatch) {
              devLog.debug('🔍 Found alternative JSON structure, attempting to parse...', undefined, 'western');
              parsed = parseJsonWithRepairs(alternativeMatch[0]);
              devWarn('⚠️ Fixed JSON by extracting alternative structure');
            } else {
              throw parseError;
            }
          }
        } catch (secondError: any) {
          devLog.error('❌ All JSON parsing strategies failed');
          devLog.error('❌ Original error:', parseError.message);
          devLog.error('❌ Second attempt error:', secondError.message);
          devLog.error('❌ JSON that failed to parse (first 500 chars):', jsonString.substring(0, 500));
          devLog.error('❌ JSON that failed to parse (last 500 chars):', jsonString.substring(Math.max(0, jsonString.length - 500)));
          throw parseError;
        }
      }
      
      devLog.debug('✅ Successfully parsed JSON', undefined, 'western');
      devLog.debug('🔍 Parsed object structure:', undefined, 'western');
      devLog.debug(`🔍   - Has chartOverview: ${!!parsed.chartOverview}`, undefined, 'western');
      devLog.debug(`🔍   - Has planetaryAnalysis: ${!!parsed.planetaryAnalysis}`, undefined, 'western');
      devLog.debug(`🔍   - Has houseAnalysis: ${!!parsed.houseAnalysis}`, undefined, 'western');
      devLog.debug(`🔍   - Has aspectAnalysis: ${!!parsed.aspectAnalysis}`, undefined, 'western');
      devLog.debug(`🔍   - Has transitAnalysis: ${!!parsed.transitAnalysis}`, undefined, 'western');
      devLog.debug(`🔍   - Has predictiveInsights: ${!!parsed.predictiveInsights}`, undefined, 'western');
      
      // Ensure planetaryAnalysis matches actual planets
      const planetaryAnalysis = (parsed.planetaryAnalysis || []).map((item: any) => ({
        planet: item.planet || 'Unknown',
        analysis: item.analysis || 'Analysis not available'
      }));

      // Ensure houseAnalysis has all 12 houses
      const houseAnalysis = Array.from({ length: 12 }, (_, i) => {
        const houseNum = i + 1;
        const houseData = (parsed.houseAnalysis || []).find((h: any) => h.house === houseNum);
        return {
          house: houseNum,
          analysis: houseData?.analysis || `House ${houseNum} analysis not available`
        };
      });

      // Ensure aspectAnalysis is populated
      const aspectAnalysis = (parsed.aspectAnalysis || []).map((item: any) => ({
        aspect: item.aspect || 'Unknown aspect',
        analysis: item.analysis || 'Analysis not available'
      }));

      // Handle predictiveInsights - can be object (new format) or string (old format)
      let predictiveInsights: any;
      if (parsed.predictiveInsights && typeof parsed.predictiveInsights === 'object') {
        // New structured format - only reject if clearly malformed or completely empty
        const groqInsights = parsed.predictiveInsights;
        
        // Only reject if critical fields are completely missing (not just generic)
        const isMalformed = (
          !groqInsights.todaysQuickWin || groqInsights.todaysQuickWin.trim().length === 0 ||
          !groqInsights.currentWeek || groqInsights.currentWeek.trim().length === 0 ||
          !groqInsights.currentMonth || groqInsights.currentMonth.trim().length === 0 ||
          !groqInsights.currentYear || groqInsights.currentYear.trim().length === 0
        );
        
        // Use Groq predictions if they exist, even if partially generic
        // Fill in missing fields with chart-based predictions
        const chartBased = generateChartBasedPredictions(planets, houses, aspects, transits);
        
        if (isMalformed) {
          devWarn('⚠️ Groq predictions are malformed (missing critical fields) - using chart-based fallback');
          predictiveInsights = chartBased;
        } else {
          // Use Groq predictions but fill missing fields with chart-based ones
          const chartBased = generateChartBasedPredictions(planets, houses, aspects, transits);
          predictiveInsights = {
            todaysQuickWin: groqInsights.todaysQuickWin || chartBased.todaysQuickWin,
            currentWeek: groqInsights.currentWeek || chartBased.currentWeek,
            currentMonth: groqInsights.currentMonth || chartBased.currentMonth,
            currentYear: groqInsights.currentYear || chartBased.currentYear,
            nextYearSneakPeek: groqInsights.nextYearSneakPeek || chartBased.nextYearSneakPeek,
            longerTermCycles: groqInsights.longerTermCycles || chartBased.longerTermCycles
          };
        }
      } else {
        // Old string format - use chart-based predictions
        devWarn('⚠️ Old format detected - generating chart-based predictions');
        predictiveInsights = generateChartBasedPredictions(planets, houses, aspects, transits);
      }

      // Generate chart-based fallbacks if Groq data is missing
      const sunPlanet = planets.find(p => p.name?.toLowerCase() === 'sun');
      const moonPlanet = planets.find(p => p.name?.toLowerCase() === 'moon');
      const risingHouse = houses.find((h, idx) => (h.number || idx + 1) === 1);
      
      const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
      const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'Unknown';
      const risingSign = risingHouse?.sign?.signName || risingHouse?.sign || 'Unknown';
      
      // Generate chart overview fallback if missing
      const chartOverviewFallback = parsed.chartOverview || 
        `Your Western astrology chart shows a ${sunSign} Sun, ${moonSign} Moon, and ${risingSign} Rising sign, creating a unique astrological profile. The planetary positions and aspects reveal important patterns in your personality, life path, and potential areas of growth.`;
      
      // Improve planetary analysis fallbacks
      const improvedPlanetaryAnalysis = planetaryAnalysis.length > 0 ? planetaryAnalysis : planets.map(p => {
        const signName = p.sign?.signName || p.sign || 'Unknown sign';
        const houseNum = p.house || 'Unknown';
        const houseTheme = getHouseTheme(Number(p.house) || 1);
        return {
          planet: p.name,
          analysis: `${p.name} in ${signName} in House ${houseNum} influences your ${houseTheme}. This placement shapes how ${p.name.toLowerCase()} energy manifests in your life, affecting your ${houseTheme} and contributing to your overall character.`
        };
      });
      
      // Improve house analysis - ensure signs are extracted properly
      const improvedHouseAnalysis = Array.from({ length: 12 }, (_, i) => {
        const houseNum = i + 1;
        const houseData = houseAnalysis.find(h => h.house === houseNum);
        const houseObj = houses[i] || houses.find((h, idx) => (h.number || idx + 1) === houseNum);
        const signName = houseObj?.sign?.signName || houseObj?.sign || 'Unknown sign';
        const houseTheme = getHouseTheme(houseNum);
        
        return {
          house: houseNum,
          analysis: houseData?.analysis || `House ${houseNum} (${signName} sign on cusp) represents ${houseTheme}. Planets in this house and transits through ${signName} will activate themes related to ${houseTheme} in your life.`
        };
      });
      
      // Improve aspect analysis fallbacks
      const improvedAspectAnalysis = aspectAnalysis.length > 0 ? aspectAnalysis : aspects.slice(0, 10).map(a => {
        const planet1 = a.planet1 || 'Planet';
        const planet2 = a.planet2 || 'Planet';
        const aspectType = a.type || 'aspect';
        return {
          aspect: `${planet1} ${aspectType} ${planet2}`,
          analysis: `The ${aspectType} between ${planet1} and ${planet2} creates a dynamic relationship in your chart. This aspect influences how these planetary energies interact, bringing both opportunities and challenges in areas where both planets are active.`
        };
      });
      
      // Improve transit analysis fallback
      const transitAnalysisFallback = parsed.transitAnalysis || 
        (transits.length > 0 
          ? `Current planetary transits are actively influencing your chart. ${transits.slice(0, 3).map(t => `${t.name || 'Planet'} in ${t.sign?.signName || t.sign}`).join(', ')} ${transits.length > 3 ? `and ${transits.length - 3} more` : ''} are creating opportunities and challenges in various life areas.`
          : 'Current transits are influencing various life areas, activating different houses and aspects of your chart.');
      
      const result = {
        chartOverview: chartOverviewFallback,
        planetaryAnalysis: improvedPlanetaryAnalysis,
        houseAnalysis: improvedHouseAnalysis,
        aspectAnalysis: improvedAspectAnalysis,
        transitAnalysis: transitAnalysisFallback,
        predictiveInsights
      };
      
      devLog.info('✅ ========== PARSEGROQRESPONSE SUCCESS ==========', undefined, 'western');
      devLog.info('✅ Successfully parsed and structured Groq response', undefined, 'western');
      devLog.info('✅ ===============================================', undefined, 'western');
      
      return result;
    } else {
      devLog.error('❌ ========== NO JSON FOUND IN RESPONSE ==========');
      devLog.error('❌ Response does not contain valid JSON structure');
      devLog.error('❌ Response preview (first 500 chars):', response.substring(0, 500));
      devLog.error('❌ Response preview (last 500 chars):', response.substring(Math.max(0, response.length - 500)));
      devLog.error('❌ ==============================================');
      throw new Error('No JSON structure found in Groq response');
    }
  } catch (error: any) {
    devLog.error('❌ ========== PARSEGROQRESPONSE ERROR ==========');
    devLog.error('❌ Error message:', error.message);
    devLog.error('❌ Error stack:', error.stack);
    devLog.error('❌ Response that caused error (first 1000 chars):', response.substring(0, 1000));
    devLog.error('❌ ============================================');
    throw error; // Re-throw to be caught by route-level handler
  }

  // Fallback: Create basic structure with chart-based predictions and actual chart data
  const chartBasedPredictions = generateChartBasedPredictions(planets, houses, aspects, transits);
  
  // Extract key chart elements for fallback
  const sunPlanet = planets.find(p => p.name?.toLowerCase() === 'sun');
  const moonPlanet = planets.find(p => p.name?.toLowerCase() === 'moon');
  const risingHouse = houses.find((h, idx) => (h.number || idx + 1) === 1);
  
  const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
  const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'Unknown';
  const risingSign = risingHouse?.sign?.signName || risingHouse?.sign || 'Unknown';
  
  // Generate comprehensive chart overview using actual data
  const chartOverviewFallback = `Your Western astrology chart reveals a ${sunSign} Sun, ${moonSign} Moon, and ${risingSign} Rising sign, creating a unique astrological profile. The planetary positions, house placements, and aspects in your chart reveal important patterns that shape your personality, life path, and potential areas of growth. Each planet's placement in specific signs and houses tells a story about different facets of your character and life experiences.`;
  
  // Generate detailed planetary analysis using actual chart data
  const planetaryAnalysisFallback = planets.map(p => {
    const signName = p.sign?.signName || p.sign || 'Unknown sign';
    const houseNum = p.house || 'Unknown';
    const houseTheme = getHouseTheme(Number(p.house) || 1);
    return {
      planet: p.name,
      analysis: `${p.name} in ${signName} in House ${houseNum} influences your ${houseTheme}. This placement reveals how ${p.name.toLowerCase()} energy manifests in your life, affecting your ${houseTheme} and contributing to your overall character. The ${signName} quality combined with ${houseNum} house themes creates a unique expression of ${p.name.toLowerCase()} energy.`
    };
  });
  
  // Generate house analysis with proper sign extraction
  const houseAnalysisFallback = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const houseObj = houses[i] || houses.find((h, idx) => (h.number || idx + 1) === houseNum);
    const signName = houseObj?.sign?.signName || houseObj?.sign || 'Unknown sign';
    const houseTheme = getHouseTheme(houseNum);
    
    return {
      house: houseNum,
      analysis: `House ${houseNum} has ${signName} on its cusp and represents ${houseTheme}. This house shows how you experience and express energy related to ${houseTheme}. Planets transiting through ${signName} will activate themes in this life area, and any natal planets in this house will have a significant influence on your ${houseTheme}.`
    };
  });
  
  // Generate aspect analysis using actual aspects
  const aspectAnalysisFallback = aspects.slice(0, 10).map(a => {
    const planet1 = a.planet1 || 'Planet';
    const planet2 = a.planet2 || 'Planet';
    const aspectType = a.type || 'aspect';
    const orb = a.orb ? `${a.orb.toFixed(1)}°` : '';
    return {
      aspect: `${planet1} ${aspectType} ${planet2}${orb ? ` (${orb} orb)` : ''}`,
      analysis: `The ${aspectType} between ${planet1} and ${planet2} creates a dynamic relationship in your chart. This aspect influences how these planetary energies interact and integrate, bringing both opportunities and challenges. The ${aspectType} suggests a specific way these planetary energies work together to shape your experiences and personality.`
    };
  });
  
  // Generate transit analysis using actual transits
  const transitAnalysisFallback = transits.length > 0
    ? `Current planetary transits are actively influencing your chart. Key transits include ${transits.slice(0, 5).map(t => `${t.name || 'Planet'} in ${t.sign?.signName || t.sign}${t.house ? ` (House ${t.house})` : ''}`).join(', ')}. These transits are creating opportunities and challenges in various life areas, activating different houses and aspects of your natal chart.`
    : 'Current planetary transits are influencing various life areas, activating different houses and aspects of your chart. The movement of planets creates ongoing cycles of opportunity and challenge.';
  
  return {
    chartOverview: chartOverviewFallback,
    planetaryAnalysis: planetaryAnalysisFallback,
    houseAnalysis: houseAnalysisFallback,
    aspectAnalysis: aspectAnalysisFallback,
    transitAnalysis: transitAnalysisFallback,
    predictiveInsights: chartBasedPredictions
  };
}

// Validate if predictions reference chart-specific elements (relaxed - only check for completely empty)
function validatePredictionsArePersonalized(predictiveInsights: any, planets: any[], houses: any[]): boolean {
  if (!predictiveInsights || typeof predictiveInsights !== 'object') return false;
  
  // Relaxed validation - only check that predictions have content
  // Accept predictions even if they're somewhat generic, as long as they exist
  const hasContent = (
    predictiveInsights.todaysQuickWin && predictiveInsights.todaysQuickWin.trim().length > 10 &&
    predictiveInsights.currentWeek && predictiveInsights.currentWeek.trim().length > 10 &&
    predictiveInsights.currentMonth && predictiveInsights.currentMonth.trim().length > 10 &&
    predictiveInsights.currentYear && predictiveInsights.currentYear.trim().length > 10
  );
  
  return hasContent;
}

// Helper function to get house theme
function getHouseTheme(houseNumber: number): string {
  const themes: { [key: number]: string } = {
    1: 'identity and self-expression',
    2: 'material resources and values',
    3: 'communication and learning',
    4: 'home and family',
    5: 'creativity and romance',
    6: 'health and service',
    7: 'partnerships and relationships',
    8: 'transformation and shared resources',
    9: 'philosophy and higher learning',
    10: 'career and public reputation',
    11: 'friendships and aspirations',
    12: 'spirituality and hidden matters'
  };
  return themes[houseNumber] || 'life matters';
}

// Generate chart-based predictions when Groq format fails
function generateChartBasedPredictions(
  planets: any[],
  houses: any[],
  aspects: any[],
  transits: any[]
): {
  todaysQuickWin: string;
  currentWeek: string;
  currentMonth: string;
  currentYear: string;
  nextYearSneakPeek: string;
  longerTermCycles: string;
} {
  const today = new Date();
  const currentYear = today.getFullYear();
  const nextYear = currentYear + 1;
  
  // Extract key chart elements
  const sunPlanet = planets.find(p => p.name?.toLowerCase() === 'sun');
  const moonPlanet = planets.find(p => p.name?.toLowerCase() === 'moon');
  const risingHouse = houses.find((h, idx) => (h.number || idx + 1) === 1);
  
  const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'your Sun sign';
  const sunHouse = sunPlanet?.house ? `House ${sunPlanet.house}` : 'your chart';
  const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'your Moon sign';
  const moonHouse = moonPlanet?.house ? `House ${moonPlanet.house}` : 'your chart';
  const risingSign = risingHouse?.sign?.signName || risingHouse?.sign || 'your Rising sign';
  
  // Get active transits
  const activeTransits = transits.slice(0, 3);
  const transitDesc = activeTransits.length > 0 
    ? activeTransits.map(t => `${t.name || 'planet'} in ${t.sign?.signName || t.sign} (House ${t.house || 'N/A'})`).join(', ')
    : 'current planetary movements';
  
  // Get major aspects
  const majorAspect = aspects.find(a => {
    const type = (a.type || '').toLowerCase();
    return type.includes('conjunction') || type.includes('trine');
  });
  const aspectDesc = majorAspect 
    ? `${majorAspect.planet1 || 'Planet'} ${majorAspect.type || 'aspect'} ${majorAspect.planet2 || 'Planet'}`
    : 'harmonious aspects';
  
  // Outer planets for year predictions
  const outerPlanets = planets.filter(p => {
    const name = (p.name || '').toLowerCase();
    return ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(name);
  });
  const outerPlanetDesc = outerPlanets.length > 0
    ? outerPlanets.map(p => `${p.name} in ${p.sign?.signName || p.sign}`).join(', ')
    : 'outer planets';
  
  return {
    todaysQuickWin: `With your Sun in ${sunSign} in ${sunHouse}, today's ${transitDesc} activates key areas of your chart. Focus on areas highlighted by ${aspectDesc} for immediate opportunities.`,
    currentWeek: `This week, ${transitDesc} influences your chart, particularly affecting your ${moonSign} Moon in ${moonHouse}. Pay attention to ${aspectDesc} as they activate important life areas.`,
    currentMonth: `The current month brings ${transitDesc} into focus, especially as they interact with your natal placements. Your ${sunSign} Sun and ${moonSign} Moon suggest themes of ${getHouseTheme(Number(sunPlanet?.house) || 1)} and ${getHouseTheme(Number(moonPlanet?.house) || 1)}.`,
    currentYear: `The year ${currentYear} offers significant astrological influences with ${outerPlanetDesc} shaping major life themes. Transits through your ${risingSign} Rising sign suggest ongoing personal growth and transformation in areas of ${getHouseTheme(Number(sunPlanet?.house) || 1)}.`,
    nextYearSneakPeek: `Next year (${nextYear}), ${outerPlanetDesc} will continue their journey through your chart, bringing new cycles and opportunities. The interaction between outer planets and your natal ${sunSign} Sun and ${moonSign} Moon suggests significant developments ahead.`,
    longerTermCycles: `Your solar return with the Sun in ${sunSign}, lunar return themes with the Moon in ${moonSign}, and progression cycles indicate longer-term patterns of growth. Your ${risingSign} Rising sign sets the stage for ongoing transformation and evolution.`
  };
}

export async function POST(request: NextRequest) {
  let lockKey: string | null = null;
  /** Holder so TS does not narrow the resolver to `never` across try/finally (Promise executor assignment). */
  const westernLeaderRelease: { fn: (() => void) | null } = { fn: null };
  try {
    const { userId, chartData }: ComprehensiveWesternRequest = await request.json();

    // Validate required fields
    if (!userId || !chartData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId or chartData'
      }, { status: 400 });
    }
    lockKey = `western-comprehensive:${userId}`;

    const leaderWait = westernComprehensiveInFlight.get(lockKey);
    if (leaderWait) {
      await leaderWait;
      const afterWait = await readValidWesternComprehensiveCache(userId);
      if (afterWait) {
        devLog.info('✅ Returning Western comprehensive after in-flight run for user:', userId, 'western');
        return NextResponse.json({ success: true, data: afterWait });
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Western comprehensive did not become available after in-flight run; please retry.',
        },
        { status: 503 },
      );
    }

    const donePromise = new Promise<void>((resolve) => {
      westernLeaderRelease.fn = resolve;
    });
    westernComprehensiveInFlight.set(lockKey, donePromise);

    devLog.info('🔮 Comprehensive Western Astrology API: Generating comprehensive report for user:', userId, 'western');

    try {
      const cached = await readValidWesternComprehensiveCache(userId);
      if (cached) {
        devLog.info('✅ Returning cached comprehensive Western astrology report for user:', userId, 'western');
        return NextResponse.json({ success: true, data: cached });
      }
    } catch (cacheError: any) {
      if (process.env.NODE_ENV === 'development') {
        devWarn('⚠️ Error checking cache, proceeding with generation:', cacheError?.message || cacheError, 'western-astrology');
      }
    }

    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      devLog.error('❌ GROQ_API_KEY is not configured');
      // Return fallback response
      const fallbackAnalysis = parseGroqResponse('', chartData.planets || [], chartData.houses || [], chartData.aspects || [], chartData.transits || []);
      return NextResponse.json({
        success: true,
        data: {
          comprehensiveAnalysis: fallbackAnalysis,
          timestamp: Date.now()
        }
      });
    }

    // Build comprehensive prompt
    const prompt = buildGroqPrompt(chartData);

    // Call AI Gateway or direct Groq API
    devLog.info('🤖 Calling AI Gateway/Groq API for comprehensive Western astrology analysis...', undefined, 'western-astrology');
    const result = await createAICompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Western astrologer specializing in the Tropical Zodiac system. Provide comprehensive, insightful, and practical guidance. Always respond with valid JSON when requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.75,
      maxTokens: 3500
    });

    const aiResponse = result.content || '';
    devLog.info('✅ Groq API response received', undefined, 'western');

    const verboseWestern = process.env.VERBOSE_ASTRO_LOGS === '1';
    if (verboseWestern) {
      devLog.debug('📝 ========== RAW GROQ RESPONSE ==========', undefined, 'western');
      devLog.debug('📝 Response length:', aiResponse.length, 'western');
      devLog.debug('📝 Response is empty:', !aiResponse || aiResponse.length === 0, 'western');
      if (aiResponse.length > 0) {
        devLog.debug('📝 First 2000 characters:', aiResponse.substring(0, 2000), 'western');
        if (aiResponse.length > 2000) {
          devLog.debug('📝 Last 500 characters:', aiResponse.substring(Math.max(0, aiResponse.length - 500)), 'western');
        }
        const hasJson = /\{[\s\S]*\}/.test(aiResponse);
        const hasMarkdownCodeBlock = /```(?:json)?\s*\{/.test(aiResponse);
        const hasChartOverview = /chartOverview/i.test(aiResponse);
        const hasPlanetaryAnalysis = /planetaryAnalysis/i.test(aiResponse);
        devLog.debug('📝 Response structure analysis:', undefined, 'western');
        devLog.debug('📝   - Contains JSON braces:', hasJson, 'western');
        devLog.debug('📝   - Contains markdown code blocks:', hasMarkdownCodeBlock, 'western');
        devLog.debug('📝   - Mentions "chartOverview":', hasChartOverview, 'western');
        devLog.debug('📝   - Mentions "planetaryAnalysis":', hasPlanetaryAnalysis, 'western');
      } else {
        devLog.error('❌ ERROR: Groq response is EMPTY!');
      }
      devLog.debug('📝 =======================================', undefined, 'western');
    } else if (!aiResponse || aiResponse.length === 0) {
      devLog.error('❌ ERROR: Groq response is EMPTY!');
    }

    // Parse the response with error handling
    let comprehensiveAnalysis;
    let parsingFailed = false;
    
    try {
      comprehensiveAnalysis = parseGroqResponse(
        aiResponse,
        chartData.planets || [],
        chartData.houses || [],
        chartData.aspects || [],
        chartData.transits || []
      );
    } catch (parseError: any) {
      parsingFailed = true;
      devLog.error('❌ ========== PARSING ERROR ==========');
      devLog.error('❌ Error message:', parseError.message);
      devLog.error('❌ Error stack:', parseError.stack);
      devLog.error('❌ Raw response that caused error (first 1000 chars):', aiResponse.substring(0, 1000));
      devLog.error('❌ ====================================');
      
      // Use fallback but don't cache it
      comprehensiveAnalysis = null;
    }

    // If parsing failed, generate fallback but don't cache it
    if (!comprehensiveAnalysis || parsingFailed) {
      devWarn('⚠️ Parsing failed - generating fallback without caching');
      // Generate fallback using actual chart data
      const chartBasedPredictions = generateChartBasedPredictions(
        chartData.planets || [],
        chartData.houses || [],
        chartData.aspects || [],
        chartData.transits || []
      );
      
      // Extract key chart elements for fallback
      const sunPlanet = (chartData.planets || []).find((p: any) => p.name?.toLowerCase() === 'sun');
      const moonPlanet = (chartData.planets || []).find((p: any) => p.name?.toLowerCase() === 'moon');
      const risingHouse = (chartData.houses || []).find((h: any, idx: number) => (h.number || idx + 1) === 1);
      
      const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
      const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'Unknown';
      const risingSign = risingHouse?.sign?.signName || risingHouse?.sign || 'Unknown';
      
      comprehensiveAnalysis = {
        chartOverview: `Your Western astrology chart reveals a ${sunSign} Sun, ${moonSign} Moon, and ${risingSign} Rising sign, creating a unique astrological profile. The planetary positions, house placements, and aspects in your chart reveal important patterns that shape your personality, life path, and potential areas of growth.`,
        planetaryAnalysis: (chartData.planets || []).map((p: any) => ({
          planet: p.name,
          analysis: `${p.name} in ${p.sign?.signName || p.sign || 'Unknown'} in House ${p.house || 'Unknown'} influences your life patterns and personality.`
        })),
        houseAnalysis: Array.from({ length: 12 }, (_, i) => {
          const houseNum = i + 1;
          const houseObj = (chartData.houses || [])[i] || (chartData.houses || []).find((h: any, idx: number) => (h.number || idx + 1) === houseNum);
          const signName = houseObj?.sign?.signName || houseObj?.sign || 'Unknown sign';
          return {
            house: houseNum,
            analysis: `House ${houseNum} (${signName} sign on cusp) represents important life themes and experiences.`
          };
        }),
        aspectAnalysis: (chartData.aspects || []).slice(0, 10).map((a: any) => ({
          aspect: `${a.planet1 || 'Planet'} ${a.type || 'aspect'} ${a.planet2 || 'Planet'}`,
          analysis: `This aspect creates dynamic energy between these planetary influences.`
        })),
        transitAnalysis: (chartData.transits || []).length > 0
          ? `Current planetary transits are actively influencing your chart: ${(chartData.transits || []).slice(0, 5).map((t: any) => `${t.name || 'Planet'} in ${t.sign?.signName || t.sign}`).join(', ')}.`
          : 'Current transits are influencing various life areas.',
        predictiveInsights: chartBasedPredictions
      };
      
      // Don't cache failed parses - return error response or fallback without caching
      devWarn('⚠️ Returning fallback analysis without caching due to parsing failure');
      
      return NextResponse.json({
        success: true,
        data: {
          comprehensiveAnalysis,
          timestamp: Date.now(),
          parsingFailed: true,
          error: 'Failed to parse Groq response, using fallback'
        }
      } as any);
    }

    // Prepare response data
    const responseData: ComprehensiveWesternResponse['data'] = {
      comprehensiveAnalysis,
      timestamp: Date.now()
    };

    // Cache in Firebase (include reportChunks for retrieval-only Seer)
    try {
      const reportChunks = transformComprehensiveToChunks(comprehensiveAnalysis, chartData);
      await setCachedDoc(['users', userId, 'westernAstrologyReports'], 'comprehensive', {
        data: responseData,
        timestamp: Date.now(),
        schemaVersion: PREDICTIVE_INSIGHTS_SCHEMA_VERSION,
        reportChunks
      });
      devLog.info('✅ Cached comprehensive Western astrology report in Firebase with schema version:', PREDICTIVE_INSIGHTS_SCHEMA_VERSION, 'western-astrology');
    } catch (cacheError: any) {
      // Log error but don't fail the request - caching is optional
      if (process.env.NODE_ENV === 'development') {
        devWarn('⚠️ Error caching report:', cacheError?.message || cacheError, 'western-astrology');
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error: any) {
    devLog.error('❌ Comprehensive Western Astrology API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate comprehensive Western astrology analysis'
    }, { status: 500 });
  } finally {
    westernLeaderRelease.fn?.();
    if (lockKey) westernComprehensiveInFlight.delete(lockKey);
  }
}

