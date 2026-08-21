import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { resolveAiReportWithFallback } from '@/lib/aiFallbackRouter';
import { callStructuredAI, parseLlmJsonRecord } from '@/lib/aiStructuredOutput';
import type { StructuredFailureMode } from '@/lib/aiStructuredOutputParse';
import { isGroqParsedRecord, type GroqStructuredParseInput } from '@/lib/groqStructuredParse';
import { devLog, devWarn } from '@/lib/devLogger';
import { transformComprehensiveToChunks } from '@/lib/westernReportChunks';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';
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
      } | string;
    };
    timestamp: number;
  };
  error?: string;
}

type WesternComprehensiveAnalysis = NonNullable<
  ComprehensiveWesternResponse['data']
>['comprehensiveAnalysis'];

/** Coordinates concurrent POSTs for the same user; waiters re-read Firestore after the leader finishes. */
const westernComprehensiveInFlight = new Map<string, Promise<void>>();

function extractWesternAnalysisFromCache(cachedData: Record<string, unknown>): WesternComprehensiveAnalysis | null {
  const actualData = (cachedData.data as Record<string, unknown> | undefined) || cachedData;
  const comprehensiveAnalysis =
    (actualData?.comprehensiveAnalysis as WesternComprehensiveAnalysis | undefined) ||
    (actualData as WesternComprehensiveAnalysis | undefined);
  if (!comprehensiveAnalysis?.chartOverview) return null;
  const predictiveInsights = comprehensiveAnalysis.predictiveInsights;
  if (typeof predictiveInsights === 'string') return null;
  return comprehensiveAnalysis;
}

async function readWesternComprehensiveCache(
  userId: string,
  options?: { allowStale?: boolean },
): Promise<WesternComprehensiveAnalysis | null> {
  try {
    const docSnap = await getCachedDoc(['users', userId, 'westernAstrologyReports'], 'comprehensive');
    if (!docSnap || !docSnap.exists()) return null;
    const cachedData = docSnap.data() as Record<string, unknown>;
    const lastUpdated = cachedData?.timestamp as number | undefined;
    if (!lastUpdated) return null;

    if (!options?.allowStale) {
      const hoursSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60);
      if (hoursSinceUpdate >= 24) return null;
    }

    const schemaVersion =
      (cachedData.schemaVersion as string | undefined) ||
      ((cachedData.data as Record<string, unknown> | undefined)?.schemaVersion as string | undefined);
    const analysis = extractWesternAnalysisFromCache(cachedData);
    if (!analysis) {
      if (!options?.allowStale) {
        devLog.info(
          '🔄 Cached report has old format or schema version mismatch - forcing regeneration for user:',
          userId,
          'western',
        );
      }
      return null;
    }
    if (
      !options?.allowStale &&
      (!schemaVersion || schemaVersion !== PREDICTIVE_INSIGHTS_SCHEMA_VERSION)
    ) {
      devLog.info(
        '🔄 Cached report schema mismatch - forcing regeneration for user:',
        userId,
        'western',
      );
      return null;
    }
    return analysis;
  } catch {
    return null;
  }
}

async function readValidWesternComprehensiveCache(userId: string): Promise<unknown | null> {
  const analysis = await readWesternComprehensiveCache(userId);
  if (!analysis) return null;
  return { comprehensiveAnalysis: analysis, timestamp: Date.now() };
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
function buildWesternChartFallback(
  planets: any[],
  houses: any[],
  aspects: any[],
  transits: any[] = [],
): WesternComprehensiveAnalysis {
  const chartBasedPredictions = generateChartBasedPredictions(planets, houses, aspects, transits);
  const sunPlanet = planets.find((p) => p.name?.toLowerCase() === 'sun');
  const moonPlanet = planets.find((p) => p.name?.toLowerCase() === 'moon');
  const risingHouse = houses.find((h, idx) => (h.number || idx + 1) === 1);
  const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
  const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'Unknown';
  const risingSign = risingHouse?.sign?.signName || risingHouse?.sign || 'Unknown';

  return {
    chartOverview: `Your Western astrology chart reveals a ${sunSign} Sun, ${moonSign} Moon, and ${risingSign} Rising sign, creating a unique astrological profile. The planetary positions, house placements, and aspects in your chart reveal important patterns that shape your personality, life path, and potential areas of growth. Each planet's placement in specific signs and houses tells a story about different facets of your character and life experiences.`,
    planetaryAnalysis: planets.map((p) => {
      const signName = p.sign?.signName || p.sign || 'Unknown sign';
      const houseNum = p.house || 'Unknown';
      const houseTheme = getHouseTheme(Number(p.house) || 1);
      return {
        planet: p.name,
        analysis: `${p.name} in ${signName} in House ${houseNum} influences your ${houseTheme}. This placement reveals how ${p.name.toLowerCase()} energy manifests in your life, affecting your ${houseTheme} and contributing to your overall character. The ${signName} quality combined with ${houseNum} house themes creates a unique expression of ${p.name.toLowerCase()} energy.`,
      };
    }),
    houseAnalysis: Array.from({ length: 12 }, (_, i) => {
      const houseNum = i + 1;
      const houseObj = houses[i] || houses.find((h, idx) => (h.number || idx + 1) === houseNum);
      const signName = houseObj?.sign?.signName || houseObj?.sign || 'Unknown sign';
      const houseTheme = getHouseTheme(houseNum);
      return {
        house: houseNum,
        analysis: `House ${houseNum} has ${signName} on its cusp and represents ${houseTheme}. This house shows how you experience and express energy related to ${houseTheme}. Planets transiting through ${signName} will activate themes in this life area, and any natal planets in this house will have a significant influence on your ${houseTheme}.`,
      };
    }),
    aspectAnalysis: aspects.slice(0, 10).map((a) => {
      const planet1 = a.planet1 || 'Planet';
      const planet2 = a.planet2 || 'Planet';
      const aspectType = a.type || 'aspect';
      const orb = a.orb ? `${a.orb.toFixed(1)}°` : '';
      return {
        aspect: `${planet1} ${aspectType} ${planet2}${orb ? ` (${orb} orb)` : ''}`,
        analysis: `The ${aspectType} between ${planet1} and ${planet2} creates a dynamic relationship in your chart. This aspect influences how these planetary energies interact and integrate, bringing both opportunities and challenges. The ${aspectType} suggests a specific way these planetary energies work together to shape your experiences and personality.`,
      };
    }),
    transitAnalysis:
      transits.length > 0
        ? `Current planetary transits are actively influencing your chart. Key transits include ${transits
            .slice(0, 5)
            .map(
              (t) =>
                `${t.name || 'Planet'} in ${t.sign?.signName || t.sign}${t.house ? ` (House ${t.house})` : ''}`,
            )
            .join(
              ', ',
            )}. These transits are creating opportunities and challenges in various life areas, activating different houses and aspects of your natal chart.`
        : 'Current planetary transits are influencing various life areas, activating different houses and aspects of your chart. The movement of planets creates ongoing cycles of opportunity and challenge.',
    predictiveInsights: chartBasedPredictions,
  };
}

function mapWesternParsedToAnalysis(
  parsed: Record<string, unknown>,
  planets: any[],
  houses: any[],
  aspects: any[],
  transits: any[] = [],
): WesternComprehensiveAnalysis {
  const planetaryAnalysis = ((parsed.planetaryAnalysis as unknown[]) || []).map((item: any) => ({
    planet: item.planet || 'Unknown',
    analysis: item.analysis || 'Analysis not available',
  }));

  const houseAnalysis = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const houseData = ((parsed.houseAnalysis as unknown[]) || []).find(
      (h: any) => h.house === houseNum,
    );
    return {
      house: houseNum,
      analysis: (houseData as { analysis?: string })?.analysis || `House ${houseNum} analysis not available`,
    };
  });

  const aspectAnalysis = ((parsed.aspectAnalysis as unknown[]) || []).map((item: any) => ({
    aspect: item.aspect || 'Unknown aspect',
    analysis: item.analysis || 'Analysis not available',
  }));

  let predictiveInsights: WesternComprehensiveAnalysis['predictiveInsights'];
  if (parsed.predictiveInsights && typeof parsed.predictiveInsights === 'object') {
    const groqInsights = parsed.predictiveInsights as Record<string, string>;
    const isMalformed =
      !groqInsights.todaysQuickWin?.trim() ||
      !groqInsights.currentWeek?.trim() ||
      !groqInsights.currentMonth?.trim() ||
      !groqInsights.currentYear?.trim();
    const chartBased = generateChartBasedPredictions(planets, houses, aspects, transits);
    predictiveInsights = isMalformed
      ? chartBased
      : {
          todaysQuickWin: groqInsights.todaysQuickWin || chartBased.todaysQuickWin,
          currentWeek: groqInsights.currentWeek || chartBased.currentWeek,
          currentMonth: groqInsights.currentMonth || chartBased.currentMonth,
          currentYear: groqInsights.currentYear || chartBased.currentYear,
          nextYearSneakPeek: groqInsights.nextYearSneakPeek || chartBased.nextYearSneakPeek,
          longerTermCycles: groqInsights.longerTermCycles || chartBased.longerTermCycles,
        };
  } else {
    predictiveInsights = generateChartBasedPredictions(planets, houses, aspects, transits);
  }

  const sunPlanet = planets.find((p) => p.name?.toLowerCase() === 'sun');
  const moonPlanet = planets.find((p) => p.name?.toLowerCase() === 'moon');
  const risingHouse = houses.find((h, idx) => (h.number || idx + 1) === 1);
  const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
  const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'Unknown';
  const risingSign = risingHouse?.sign?.signName || risingHouse?.sign || 'Unknown';

  const chartOverviewFallback =
    (typeof parsed.chartOverview === 'string' ? parsed.chartOverview : '') ||
    `Your Western astrology chart shows a ${sunSign} Sun, ${moonSign} Moon, and ${risingSign} Rising sign, creating a unique astrological profile. The planetary positions and aspects reveal important patterns in your personality, life path, and potential areas of growth.`;

  const improvedPlanetaryAnalysis =
    planetaryAnalysis.length > 0
      ? planetaryAnalysis
      : planets.map((p) => {
          const signName = p.sign?.signName || p.sign || 'Unknown sign';
          const houseNum = p.house || 'Unknown';
          const houseTheme = getHouseTheme(Number(p.house) || 1);
          return {
            planet: p.name,
            analysis: `${p.name} in ${signName} in House ${houseNum} influences your ${houseTheme}. This placement shapes how ${p.name.toLowerCase()} energy manifests in your life, affecting your ${houseTheme} and contributing to your overall character.`,
          };
        });

  const improvedHouseAnalysis = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const houseData = houseAnalysis.find((h) => h.house === houseNum);
    const houseObj = houses[i] || houses.find((h, idx) => (h.number || idx + 1) === houseNum);
    const signName = houseObj?.sign?.signName || houseObj?.sign || 'Unknown sign';
    const houseTheme = getHouseTheme(houseNum);
    return {
      house: houseNum,
      analysis:
        houseData?.analysis ||
        `House ${houseNum} (${signName} sign on cusp) represents ${houseTheme}. Planets in this house and transits through ${signName} will activate themes related to ${houseTheme} in your life.`,
    };
  });

  const improvedAspectAnalysis =
    aspectAnalysis.length > 0
      ? aspectAnalysis
      : aspects.slice(0, 10).map((a) => ({
          aspect: `${a.planet1 || 'Planet'} ${a.type || 'aspect'} ${a.planet2 || 'Planet'}`,
          analysis: `The ${a.type || 'aspect'} between ${a.planet1 || 'Planet'} and ${a.planet2 || 'Planet'} creates a dynamic relationship in your chart.`,
        }));

  const transitAnalysisFallback =
    (typeof parsed.transitAnalysis === 'string' ? parsed.transitAnalysis : '') ||
    (transits.length > 0
      ? `Current planetary transits are actively influencing your chart. ${transits
          .slice(0, 3)
          .map((t) => `${t.name || 'Planet'} in ${t.sign?.signName || t.sign}`)
          .join(', ')} ${transits.length > 3 ? `and ${transits.length - 3} more` : ''} are creating opportunities and challenges in various life areas.`
      : 'Current transits are influencing various life areas, activating different houses and aspects of your chart.');

  return {
    chartOverview: chartOverviewFallback,
    planetaryAnalysis: improvedPlanetaryAnalysis,
    houseAnalysis: improvedHouseAnalysis,
    aspectAnalysis: improvedAspectAnalysis,
    transitAnalysis: transitAnalysisFallback,
    predictiveInsights,
  };
}

function parseGroqResponse(
  response: GroqStructuredParseInput,
  planets: any[],
  houses: any[],
  aspects: any[],
  transits: any[] = [],
): WesternComprehensiveAnalysis {
  if (isGroqParsedRecord(response)) {
    return mapWesternParsedToAnalysis(response, planets, houses, aspects, transits);
  }

  const responseText = response.trim();
  if (!responseText) {
    devLog.warn('⚠️ Empty Groq response — using chart-based fallback', undefined, 'western');
    return buildWesternChartFallback(planets, houses, aspects, transits);
  }

  if (!responseText.includes('{')) {
    devLog.error('❌ Response does not contain JSON structure', undefined, 'western');
    throw new Error('Response does not contain valid JSON structure');
  }

  const parsed = parseLlmJsonRecord(responseText);
  if (!parsed) {
    throw new Error('No JSON structure found in Groq response');
  }

  devLog.info('✅ Parsed Western comprehensive JSON', undefined, 'western');
  return mapWesternParsedToAnalysis(parsed, planets, houses, aspects, transits);
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

    devLog.info('🤖 Calling AI for comprehensive Western astrology analysis...', undefined, 'western-astrology');
    const chartArgs = [
      chartData.planets || [],
      chartData.houses || [],
      chartData.aspects || [],
      chartData.transits || [],
    ] as const;

    const resolved = await resolveAiReportWithFallback({
      label: 'western-comprehensive',
      userId,
      tryLlm: async () => {
        const structured = await callStructuredAI({
          label: 'western-comprehensive',
          model: GROQ_DEFAULT_TEXT_MODEL,
          userId,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert Western astrologer specializing in the Tropical Zodiac system. Provide comprehensive, insightful, and practical guidance. Always respond with valid JSON when requested.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.75,
          maxTokens: 3500,
          responseFormat: { type: 'json_object' },
          maxAttempts: 3,
        });

        if (!structured.ok && structured.failureMode !== 'none') {
          devLog.warn(
            `western-comprehensive structured AI: ${structured.failureMode} after ${structured.attempts} attempt(s)`,
            undefined,
            'western',
          );
        }

        const aiResponse = structured.lastRaw ?? '';
        const verboseWestern = process.env.VERBOSE_ASTRO_LOGS === '1';
        if (verboseWestern && aiResponse.length > 0) {
          devLog.debug('📝 RAW response length:', aiResponse.length, 'western');
        }

        let failureMode: StructuredFailureMode = structured.failureMode;
        let parsingFailed = false;
        try {
          const analysis = parseGroqResponse(structured.raw ?? aiResponse, ...chartArgs);
          devLog.info('✅ AI response parsed', undefined, 'western');
          return {
            data: analysis,
            attempts: structured.attempts,
            failureMode,
          };
        } catch (parseError: unknown) {
          parsingFailed = true;
          failureMode = 'json_parse_error';
          const pe = parseError as Error;
          devLog.error('❌ Parsing error:', pe.message, 'western');
          return {
            data: null,
            attempts: structured.attempts,
            failureMode,
            parsingFailed,
          };
        }
      },
      readFirestoreCache: () => readWesternComprehensiveCache(userId, { allowStale: true }),
      buildDeterministic: () => buildWesternChartFallback(...chartArgs),
    });

    const comprehensiveAnalysis = resolved.data;

    if (resolved.degraded && resolved.source !== 'llm') {
      devWarn(
        `⚠️ Western comprehensive degraded (${resolved.source}) — not caching fresh LLM output`,
      );
      return NextResponse.json({
        success: true,
        data: {
          comprehensiveAnalysis,
          timestamp: Date.now(),
          parsingFailed: resolved.parsingFailed ?? true,
          fallbackSource: resolved.source,
          error:
            resolved.source === 'firestore_cache'
              ? 'Using last saved report; AI narrative refresh failed'
              : 'Failed to parse AI response, using chart-based fallback',
        },
      });
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

