import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { createAICompletion } from '@/lib/aiGateway';
import { devLog, devWarn } from '@/lib/devLogger';
import { getVedicReading } from '@/lib/vedicIntelligence';
import { geocodePlace } from '@/services/geocoding';

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
      let ref: any = db.collection(collectionPath[0]);
      for (let i = 1; i < collectionPath.length; i += 2) {
        const docIdInPath = collectionPath[i];
        if (i + 1 < collectionPath.length) {
          const nextCollection = collectionPath[i + 1];
          ref = ref.doc(docIdInPath).collection(nextCollection);
        } else {
          ref = ref.doc(docIdInPath);
        }
      }
      if (ref.get && typeof ref.get === 'function') {
        const snapshot = await ref.doc(docId).get();
        return snapshot.exists ? { exists: () => true, data: () => snapshot.data() } : { exists: () => false, data: () => null };
      } else {
        const snapshot = await ref.get();
        return snapshot.exists ? { exists: () => true, data: () => snapshot.data() } : { exists: () => false, data: () => null };
      }
    } else {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, ...collectionPath, docId);
      return await getDoc(docRef);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devWarn('Error getting document:', error, 'vedic');
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
      let ref: any = db.collection(collectionPath[0]);
      for (let i = 1; i < collectionPath.length; i += 2) {
        const docIdInPath = collectionPath[i];
        if (i + 1 < collectionPath.length) {
          const nextCollection = collectionPath[i + 1];
          ref = ref.doc(docIdInPath).collection(nextCollection);
        } else {
          ref = ref.doc(docIdInPath);
        }
      }
      if (ref.doc && typeof ref.doc === 'function') {
        await ref.doc(docId).set(data);
      } else {
        await ref.set(data);
      }
    } else {
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(db, ...collectionPath, docId);
      await setDoc(docRef, data);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devWarn('Error setting document:', error, 'vedic');
    }
  }
}

const COMPREHENSIVE_REPORT_SCHEMA_VERSION = '1.0';

// Server-side geocoding helper with fallback
async function getCoordinatesWithFallback(place: string): Promise<{ latitude: number; longitude: number }> {
  try {
    devLog.debug('📍 Geocoding birth place:', place, 'vedic-comprehensive');
    const coords = await geocodePlace(place);
    
    if (coords) {
      devLog.debug('✅ Geocoded successfully:', coords, 'vedic-comprehensive');
      return {
        latitude: coords.latitude,
        longitude: coords.longitude
      };
    }
  } catch (error) {
    devLog.warn('Geocoding error:', error, 'vedic-comprehensive');
  }
  
  // Fallback to common Indian cities
  const fallbacks: Record<string, { latitude: number; longitude: number }> = {
    'mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'delhi': { latitude: 28.7041, longitude: 77.1025 },
    'bangalore': { latitude: 12.9716, longitude: 77.5946 },
    'mysore': { latitude: 12.2958, longitude: 76.6394 },
    'chennai': { latitude: 13.0827, longitude: 80.2707 },
    'kolkata': { latitude: 22.5726, longitude: 88.3639 },
    'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
    'pune': { latitude: 18.5204, longitude: 73.8567 }
  };
  
  const placeLower = place.toLowerCase();
  for (const [city, coords] of Object.entries(fallbacks)) {
    if (placeLower.includes(city)) {
      devLog.debug('📍 Using fallback coordinates for:', place, 'vedic-comprehensive');
      return coords;
    }
  }
  
  // Ultimate fallback: Mumbai (center of India)
  devLog.warn('⚠️ Using default Mumbai coordinates for:', place, 'vedic-comprehensive');
  return { latitude: 19.0760, longitude: 72.8777 };
}

interface ComprehensiveVedicRequest {
  userId: string;
  vedicChartData?: any;
  userProfile?: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    fullName?: string;
    displayName?: string;
  };
}

interface ComprehensiveVedicResponse {
  success: boolean;
  data?: {
    comprehensiveAnalysis: {
      chartOverview: string;
      ascendantAnalysis: string;
      planetaryAnalysis: {
        planet: string;
        analysis: string;
      }[];
      houseAnalysis: {
        house: number;
        analysis: string;
      }[];
      dashaAnalysis: string;
      yogasAnalysis: string;
      nakshatraAnalysis: string;
      predictiveInsights: {
        currentPeriod: string;
        nextThreeMonths: string;
        currentYear: string;
        nextYear: string;
        longerTermCycles: string;
      };
      challengesAndOpportunities: {
        challenges: string[];
        opportunities: string[];
      };
      remedies?: {
        overview?: string;
        mantras?: string[];
        gemstones?: string[];
        rituals?: string[];
        practices?: string[];
        lifestyle?: string[];
      };
    };
    timestamp: number;
  };
  error?: string;
}

function isRateLimitedError(error: unknown): boolean {
  const maybeErr = error as { status?: number; statusCode?: number; code?: string; message?: string };
  const status = maybeErr?.status ?? maybeErr?.statusCode;
  if (status === 429) return true;
  if (maybeErr?.code === 'AI_RATE_LIMITED' || maybeErr?.code === 'rate_limit_exceeded') return true;
  const message = String(maybeErr?.message ?? '').toLowerCase();
  return message.includes('rate limit') || message.includes('currently busy');
}

// Build comprehensive Groq prompt for Vedic Astrology
function buildGroqPrompt(vedicData: any, userProfile?: any): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  const nextYear = currentYear + 1;
  const currentMonth = today.toLocaleString('en-US', { month: 'long' });
  
  const ascendant = vedicData?.ascendant?.signName || vedicData?.ascendant?.sign || 'Unknown';
  const currentDasha = vedicData?.currentDasha?.planet || vedicData?.dasha?.[0]?.planet || 'Unknown';
  const planets = vedicData?.planets || [];
  const houses = vedicData?.houses || [];
  
  const fullName = userProfile?.fullName || userProfile?.displayName || 'the user';
  const birthDate = userProfile?.birthDate || '';
  const birthTime = userProfile?.birthTime || '';
  const birthPlace = userProfile?.birthPlace || '';

  return `You are an expert Vedic Astrologer (Jyotish) specializing in ancient Indian astrological wisdom. Provide comprehensive, insightful, and practical guidance based on the complete Vedic birth chart.

TIME CONTEXT:
- Today's Date: ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Current Month: ${currentMonth} ${currentYear}
- Current Year: ${currentYear}
- Next Year: ${nextYear}

BIRTH DATA:
- Full Name: ${fullName}
- Birth Date: ${birthDate || 'Not provided'}
- Birth Time: ${birthTime || 'Not provided'}
- Birth Place: ${birthPlace || 'Not provided'}

CHART DATA:
- Ascendant (Lagna): ${ascendant}
- Current Dasha: ${currentDasha}
- Planets: ${planets.map((p: any) => `${p.name} in ${p.sign || p.signName} (${p.house}th house)`).join(', ')}
- Houses: ${houses.map((h: any, i: number) => `${i + 1}th house: ${h.sign || h.signName}, Lord: ${h.lord}`).join('; ')}

IMPORTANT CONTEXT - Vedic Astrology Philosophy:
Vedic Astrology (Jyotish) is an ancient Indian system that reveals life patterns, karma, and destiny through planetary positions. It focuses on:
- Understanding your life's purpose through the Ascendant (Lagna)
- Analyzing planetary influences and their effects
- Understanding house significations and their impact
- Navigating Dasha (planetary periods) for timing events
- Identifying Yogas (planetary combinations) for special results
- Understanding Nakshatras (lunar mansions) for deeper insights

PREDICTION REQUIREMENTS - CRITICAL:
ALL predictions MUST be personalized to THIS specific Vedic chart. Generic astrology text is NOT acceptable.

- currentPeriod: MUST reference the current Dasha ${currentDasha} and how it influences the current period. Example: "Your current ${currentDasha} Dasha brings focus to [specific area]..."
- nextThreeMonths: MUST mention how planetary transits and Dasha influence the next three months. Reference specific planets and houses.
- currentYear: MUST identify how the current Dasha ${currentDasha} and planetary transits influence ${currentYear}. Reference your Ascendant ${ascendant} and key planetary positions.
- nextYear: MUST calculate and reference how Dasha transitions and transits will influence ${nextYear}. Example: "Next year (${nextYear}), planetary influences will shift to..."
- longerTermCycles: MUST reference your Ascendant ${ascendant} journey, Dasha cycles, and how planetary periods evolve over time.

Personalization Rules:
✓ Reference actual chart data from CHART DATA section above
✓ Mention specific planetary positions (e.g., "Sun in ${planets.find((p: any) => p.name === 'Sun')?.sign || 'Unknown'} in the ${planets.find((p: any) => p.name === 'Sun')?.house || 'Unknown'}th house")
✓ Connect Dasha periods to chart significations
✓ Use language like "your ${ascendant} Ascendant", "your ${currentDasha} Dasha", "your chart shows..."
✗ DO NOT write generic astrology text that could apply to anyone
✗ DO NOT ignore the chart data provided
✗ DO NOT create predictions without referencing specific chart elements

Generate a comprehensive Vedic Astrology analysis covering all life areas. Format your response as a JSON object with the following structure:
{
  "chartOverview": "Detailed paragraph summarizing the Vedic chart's dominant themes, Ascendant influence, planetary combinations, overall character, and key patterns.",
  "ascendantAnalysis": "Comprehensive analysis of the ${ascendant} Ascendant, including personality traits, life approach, strengths, and how it shapes your entire chart.",
  "planetaryAnalysis": [
    ${planets.map((p: any) => `{"planet": "${p.name}", "analysis": "Detailed interpretation of ${p.name} in ${p.sign || p.signName} in the ${p.house}th house, including its influence, strengths, challenges, and effects on your life."}`).join(',\n    ')}
  ],
  "houseAnalysis": [
    ${houses.map((h: any, i: number) => `{"house": ${i + 1}, "analysis": "Detailed interpretation of the ${i + 1}th house in ${h.sign || h.signName}, ruled by ${h.lord}, including its significations and impact on your life."}`).join(',\n    ')}
  ],
  "dashaAnalysis": "Comprehensive analysis of your current ${currentDasha} Dasha period, including themes, focus areas, opportunities, challenges, and what to expect during this period.",
  "yogasAnalysis": "Analysis of significant Yogas (planetary combinations) in your chart, including their effects, strengths, and how they influence your life path.",
  "nakshatraAnalysis": "Analysis of your birth Nakshatra and its influence, including characteristics, deity, and how it shapes your personality and life experiences.",
  "predictiveInsights": {
    "currentPeriod": "MUST reference current Dasha ${currentDasha} and how it influences now. Example: 'Your current ${currentDasha} Dasha brings focus to [theme]...' Keep it concise (2-3 sentences) and actionable.",
    "nextThreeMonths": "MUST mention how planetary transits and Dasha influence the next three months. Reference specific planets and houses. Provide actionable insights.",
    "currentYear": "MUST identify how Dasha ${currentDasha} and transits influence ${currentYear}. Reference Ascendant ${ascendant} and key planetary positions. Highlight key periods.",
    "nextYear": "MUST calculate how Dasha transitions and transits will influence ${nextYear}. Example: 'Next year (${nextYear}), planetary influences will shift to...' Provide insight based on Dasha cycles.",
    "longerTermCycles": "MUST reference Ascendant ${ascendant} journey, Dasha cycles, and how planetary periods evolve. Connect longer-term patterns to chart significations."
  },
  "challengesAndOpportunities": {
    "challenges": [
      "Specific challenge related to your ${ascendant} Ascendant",
      "Specific challenge related to ${currentDasha} Dasha",
      "Specific challenge related to planetary positions"
    ],
    "opportunities": [
      "Specific opportunity related to your ${ascendant} Ascendant",
      "Specific opportunity related to ${currentDasha} Dasha",
      "Specific opportunity related to planetary combinations"
    ]
  },
  "remedies": {
    "overview": "Short paragraph on Vedic remedies (upayas) suited to this chart: gemstones, mantras, charity, and lifestyle adjustments.",
    "mantras": ["One or more mantras suited to the chart (e.g. planet-specific or general)"],
    "gemstones": ["Gemstone(s) recommended for this chart with brief reason"],
    "rituals": ["Simple rituals or practices (e.g. day of week, charity)"],
    "practices": ["Daily or periodic practices (e.g. meditation, Surya Namaskar)"],
    "lifestyle": ["Lifestyle or behavioral suggestions aligned with the chart"]
  }
}

Make each section comprehensive yet concise. Focus on practical guidance, self-awareness, and empowering insights. Write in a warm, insightful tone that speaks directly to the user.`;
}

// Normalize planetary analysis array (accept planetName, name, text, summary)
function normalizePlanetaryAnalysis(raw: unknown): Array<{ planet: string; analysis: string }> {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map((x: any) => ({
      planet: String(x?.planet ?? x?.planetName ?? x?.name ?? '').trim(),
      analysis: String(x?.analysis ?? x?.text ?? x?.summary ?? '').trim()
    }))
    .filter((x) => x.planet || x.analysis);
}

// Normalize house analysis array (accept houseNumber, number, text, summary)
function normalizeHouseAnalysis(raw: unknown): Array<{ house: number; analysis: string }> {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map((x: any) => ({
      house: Number(x?.house ?? x?.houseNumber ?? x?.number ?? 0),
      analysis: String(x?.analysis ?? x?.text ?? x?.summary ?? '').trim()
    }))
    .filter((x) => x.house >= 1 && x.house <= 12 && x.analysis);
}

// Parse Groq response and extract structured data
function parseGroqResponse(response: string, vedicData: any): NonNullable<ComprehensiveVedicResponse['data']>['comprehensiveAnalysis'] {
  devLog.debug('🔍 Parsing Groq response for Vedic', undefined, 'vedic');

  if (!response || response.length === 0) {
    throw new Error('Empty response from Groq');
  }

  try {
    // Try to extract JSON from markdown code blocks
    let jsonStr = response.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Response is not an object');
    }

    // Relaxed validation: default missing strings instead of throwing
    const chartOverview = typeof parsed.chartOverview === 'string' && parsed.chartOverview.trim()
      ? parsed.chartOverview
      : 'Chart overview analysis';
    const ascendantAnalysis = typeof parsed.ascendantAnalysis === 'string' && parsed.ascendantAnalysis.trim()
      ? parsed.ascendantAnalysis
      : 'Ascendant analysis';

    const planetaryAnalysis = normalizePlanetaryAnalysis(parsed.planetaryAnalysis ?? parsed.planetary_analysis);
    const houseAnalysis = normalizeHouseAnalysis(parsed.houseAnalysis ?? parsed.house_analysis);

    const predictiveInsights = parsed.predictiveInsights && typeof parsed.predictiveInsights === 'object'
      ? {
          currentPeriod: String(parsed.predictiveInsights.currentPeriod ?? ''),
          nextThreeMonths: String(parsed.predictiveInsights.nextThreeMonths ?? ''),
          currentYear: String(parsed.predictiveInsights.currentYear ?? ''),
          nextYear: String(parsed.predictiveInsights.nextYear ?? ''),
          longerTermCycles: String(parsed.predictiveInsights.longerTermCycles ?? '')
        }
      : {
          currentPeriod: 'Current period analysis',
          nextThreeMonths: 'Next three months analysis',
          currentYear: 'Current year analysis',
          nextYear: 'Next year analysis',
          longerTermCycles: 'Longer-term cycles analysis'
        };

    const co = parsed.challengesAndOpportunities ?? parsed.challenges_and_opportunities;
    const challengesAndOpportunities = co && typeof co === 'object'
      ? {
          challenges: Array.isArray(co.challenges) ? co.challenges.map(String) : [],
          opportunities: Array.isArray(co.opportunities) ? co.opportunities.map(String) : []
        }
      : { challenges: [], opportunities: [] };

    const rawRemedies = parsed.remedies && typeof parsed.remedies === 'object' ? parsed.remedies : undefined;
    const remedies = rawRemedies
      ? {
          overview: typeof rawRemedies.overview === 'string' ? rawRemedies.overview.trim() : undefined,
          mantras: Array.isArray(rawRemedies.mantras) ? rawRemedies.mantras.map(String).filter(Boolean) : undefined,
          gemstones: Array.isArray(rawRemedies.gemstones) ? rawRemedies.gemstones.map(String).filter(Boolean) : undefined,
          rituals: Array.isArray(rawRemedies.rituals) ? rawRemedies.rituals.map(String).filter(Boolean) : undefined,
          practices: Array.isArray(rawRemedies.practices) ? rawRemedies.practices.map(String).filter(Boolean) : undefined,
          lifestyle: Array.isArray(rawRemedies.lifestyle) ? rawRemedies.lifestyle.map(String).filter(Boolean) : undefined
        }
      : undefined;

    return {
      chartOverview,
      ascendantAnalysis,
      planetaryAnalysis,
      houseAnalysis,
      dashaAnalysis: typeof parsed.dashaAnalysis === 'string' ? parsed.dashaAnalysis : 'Dasha analysis',
      yogasAnalysis: typeof parsed.yogasAnalysis === 'string' ? parsed.yogasAnalysis : 'Yogas analysis',
      nakshatraAnalysis: typeof parsed.nakshatraAnalysis === 'string' ? parsed.nakshatraAnalysis : 'Nakshatra analysis',
      predictiveInsights,
      challengesAndOpportunities,
      ...(remedies && (remedies.overview || remedies.mantras?.length || remedies.gemstones?.length || remedies.rituals?.length || remedies.practices?.length || remedies.lifestyle?.length) ? { remedies } : {})
    };
  } catch (error) {
    devLog.warn('Failed to parse Groq JSON, using fallback', error, 'vedic');
    // Fallback only when JSON parse fails or payload is invalid
    return {
      chartOverview: response.substring(0, 500) || 'Comprehensive Vedic chart analysis',
      ascendantAnalysis: 'Detailed analysis of your Ascendant sign and its influence on your personality and life path.',
      planetaryAnalysis: [],
      houseAnalysis: [],
      dashaAnalysis: 'Analysis of your current planetary period (Dasha) and its effects on your life.',
      yogasAnalysis: 'Analysis of significant planetary combinations (Yogas) in your chart.',
      nakshatraAnalysis: 'Analysis of your birth star (Nakshatra) and its characteristics.',
      predictiveInsights: {
        currentPeriod: 'Current period insights based on your Dasha and planetary transits.',
        nextThreeMonths: 'Forecast for the next three months based on planetary movements.',
        currentYear: `Analysis of ${new Date().getFullYear()} based on your chart and current Dasha period.`,
        nextYear: `Preview of ${new Date().getFullYear() + 1} based on upcoming Dasha transitions.`,
        longerTermCycles: 'Longer-term life cycles and patterns revealed through your Vedic chart.'
      },
      challengesAndOpportunities: {
        challenges: ['Challenges revealed through your chart analysis'],
        opportunities: ['Opportunities revealed through your chart analysis']
      },
      remedies: {
        overview: 'Personalized Vedic remedies (upayas) can help balance planetary influences. Consider consulting the Overview tab once the full report loads.',
        mantras: ['Chanting planet-specific mantras can strengthen favorable influences.'],
        gemstones: ['Wearing gemstones recommended for your chart can support key life areas.'],
        rituals: ['Simple rituals aligned with your Dasha and Ascendant can be beneficial.'],
        practices: ['Daily practices such as meditation and Surya Namaskar support overall balance.'],
        lifestyle: ['Lifestyle adjustments based on your chart can enhance well-being.']
      }
    };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const reqStartedAt = Date.now();
  const stageMs: Record<string, number> = {};
  const markStage = (label: string, startedAt: number) => {
    stageMs[label] = Date.now() - startedAt;
  };
  try {
    const parseStartedAt = Date.now();
    const body: ComprehensiveVedicRequest = await request.json();
    markStage('request_parse', parseStartedAt);
    const { userId, vedicChartData, userProfile } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!userProfile?.birthDate || !userProfile?.birthTime || !userProfile?.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete birth data (date, time, place) is required' },
        { status: 400 }
      );
    }

    devLog.info('🔮 Comprehensive Vedic API: Generating report for user:', userId, 'vedic');

    // Check cache first
    const cacheReadStartedAt = Date.now();
    const cacheDoc = await getCachedDoc(['users', userId, 'mysticalProfile'], 'comprehensiveVedic');
    markStage('cache_read', cacheReadStartedAt);
    if (cacheDoc.exists()) {
      const cached = cacheDoc.data();
      if (cached?.schemaVersion === COMPREHENSIVE_REPORT_SCHEMA_VERSION &&
          cached?.birthDate === userProfile.birthDate &&
          cached?.birthTime === userProfile.birthTime &&
          cached?.birthPlace === userProfile.birthPlace &&
          Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) { // 7 days cache
        if (process.env.NODE_ENV === 'development') {
          devLog.info('⏱️ [vedic/comprehensive][server] cache_hit_timing', {
            stages: stageMs,
            totalMs: Date.now() - reqStartedAt
          }, 'vedic');
        }
        devLog.info('✅ Returning cached comprehensive Vedic report for user:', userId, 'vedic');
        return NextResponse.json({
          success: true,
          data: {
            comprehensiveAnalysis: cached.comprehensiveAnalysis,
            timestamp: cached.timestamp
          }
        });
      }
    }

    // Get Vedic reading data
    const geocodeStartedAt = Date.now();
    const coords = await getCoordinatesWithFallback(userProfile.birthPlace);
    markStage('geocoding', geocodeStartedAt);
    const readingStartedAt = Date.now();
    const vedicReading = await getVedicReading(
      userId,
      userProfile.birthDate,
      userProfile.birthTime,
      userProfile.birthPlace,
      coords.latitude,
      coords.longitude
    );
    markStage('vedic_reading', readingStartedAt);

    // Build prompt with chart data
    const promptStartedAt = Date.now();
    const chartData = vedicReading?.chartData || vedicChartData || {};
    const prompt = buildGroqPrompt(chartData, userProfile);
    markStage('prompt_build', promptStartedAt);

    // Generate comprehensive analysis using AI
    devLog.info('🤖 Calling AI Gateway/Groq API for comprehensive Vedic analysis...', undefined, 'vedic');
    const aiStartedAt = Date.now();
    let aiResponse: Awaited<ReturnType<typeof createAICompletion>> | null = null;
    try {
      aiResponse = await createAICompletion({
        messages: [
          {
            role: 'system',
            content: 'You are an expert Vedic Astrologer (Jyotish) providing comprehensive birth chart analysis. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        maxTokens: 4000
      });
    } catch (aiError) {
      if (!isRateLimitedError(aiError)) {
        throw aiError;
      }
      devLog.warn('⚠️ Vedic AI temporarily rate-limited; returning fallback analysis', aiError, 'vedic');
      const fallbackAnalysis = parseGroqResponse('', chartData);
      return NextResponse.json({
        success: true,
        data: {
          comprehensiveAnalysis: fallbackAnalysis,
          timestamp: Date.now()
        },
        degraded: true,
      });
    }
    markStage('ai_completion', aiStartedAt);

    if (!aiResponse || !aiResponse.content) {
      throw new Error('Failed to generate AI analysis');
    }

    // Parse response
    const parseAiStartedAt = Date.now();
    const comprehensiveAnalysis = parseGroqResponse(aiResponse.content, chartData);
    markStage('ai_response_parse', parseAiStartedAt);

    // Cache the result
    const cacheWriteStartedAt = Date.now();
    await setCachedDoc(['users', userId, 'mysticalProfile'], 'comprehensiveVedic', {
      comprehensiveAnalysis,
      timestamp: Date.now(),
      birthDate: userProfile.birthDate,
      birthTime: userProfile.birthTime,
      birthPlace: userProfile.birthPlace,
      schemaVersion: COMPREHENSIVE_REPORT_SCHEMA_VERSION
    });
    markStage('cache_write', cacheWriteStartedAt);

    if (process.env.NODE_ENV === 'development') {
      devLog.info('⏱️ [vedic/comprehensive][server] timing', {
        stages: stageMs,
        totalMs: Date.now() - reqStartedAt
      }, 'vedic');
    }

    devLog.info('✅ Cached comprehensive Vedic report in Firebase', undefined, 'vedic');

    return NextResponse.json({
      success: true,
      data: {
        comprehensiveAnalysis,
        timestamp: Date.now()
      },
      _usage: aiResponse.usage,
    });

  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      devLog.warn('⏱️ [vedic/comprehensive][server] timing_error', {
        stages: stageMs,
        totalMs: Date.now() - reqStartedAt,
        error: error?.message || String(error)
      }, 'vedic');
    }
    devLog.error('❌ Error generating comprehensive Vedic report:', error, 'vedic');
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate comprehensive report',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

