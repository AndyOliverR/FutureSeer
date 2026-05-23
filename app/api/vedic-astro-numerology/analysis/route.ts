import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { resolveAiReportWithFallback } from '@/lib/aiFallbackRouter';
import { callStructuredAI } from '@/lib/aiStructuredOutput';
import type { StructuredFailureMode } from '@/lib/aiStructuredOutputParse';
import { parseStructuredJsonFromResponse } from '@/lib/aiStructuredOutputParse';
import { isGroqParsedRecord, type GroqStructuredParseInput } from '@/lib/groqStructuredParse';
import { type VedicNumerologyProfile } from '@/lib/vedicNumerologyCalculations';
import { devLog } from '@/lib/devLogger';

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
      // Admin SDK API - handle nested collections
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
      // Client SDK API
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, ...collectionPath, docId);
      return await getDoc(docRef);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devLog.warn('Error getting document:', error, 'vedic-astro-numerology');
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
      // Admin SDK API - handle nested collections
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
      // Client SDK API
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(db, ...collectionPath, docId);
      await setDoc(docRef, data);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devLog.warn('Error setting document:', error, 'vedic-astro-numerology');
    }
  }
}


interface VedicAstroNumerologyRequest {
  userId: string;
  birthDate: string;
  fullName: string;
  moonSign: string;
  lagnaSign: string;
  sunSign: string;
  numerologyProfile: VedicNumerologyProfile;
}

interface VedicAstroNumerologyResponse {
  success: boolean;
  data?: {
    moonSign: string;
    lagnaSign: string;
    sunSign: string;
    lifePathNumber: number;
    rulingPlanet: string;
    comprehensiveAnalysis: {
      personalitySynthesis: string;
      karmicInsights: string;
      remedies: string;
      careerGuidance: string;
      relationshipInsights: string;
      lifePurpose: string;
      personalGrowth: string;
      challenges: string[];
      opportunities: string[];
      yearlyForecast: string;
    };
    timestamp: number;
  };
  error?: string;
}

// Build comprehensive Groq prompt for Vedic Astro-Numerology
function buildVedicGroqPrompt(
  moonSign: string,
  lagnaSign: string,
  sunSign: string,
  numerologyProfile: VedicNumerologyProfile,
  birthDate: string,
  fullName: string
): string {
  const currentYear = new Date().getFullYear();
  const rulingPlanet = numerologyProfile.planetaryInfluences['Life Path']?.planet || 'Unknown';
  const lifePathGemstone = numerologyProfile.planetaryInfluences['Life Path']?.gemstone || 'gemstone';
  const destinyGemstone = numerologyProfile.planetaryInfluences['Destiny']?.gemstone || 'gemstone';
  const lifePathMantra = numerologyProfile.planetaryInfluences['Life Path']?.mantra || 'mantra';
  
  const karmicLessonsText = numerologyProfile.karmicLessons.length > 0 
    ? numerologyProfile.karmicLessons.join('; ') 
    : 'None specifically identified';
  
  const destinyPlanet = numerologyProfile.planetaryInfluences['Destiny']?.planet || 'Unknown';
  const soulPlanet = numerologyProfile.planetaryInfluences['Soul']?.planet || 'Unknown';
  const personalityPlanet = numerologyProfile.planetaryInfluences['Personality']?.planet || 'Unknown';
  const birthDayPlanet = numerologyProfile.planetaryInfluences['Birth Day']?.planet || 'Unknown';

  return `You are an expert Vedic astro-numerologist specializing in combining Vedic Astrology (Jyotish - Sidereal Zodiac) with Vedic Numerology (Navagraha planetary number system). You have deep knowledge of:

1. Vedic Astrology: Sidereal zodiac (based on actual star positions), Moon sign importance, Lagna (Ascendant), Nakshatras, Dasha system, and karmic interpretations
2. Vedic Numerology: Navagraha planetary number associations (1=Sun/Surya, 2=Moon/Chandra, 3=Jupiter/Guru, 4=Rahu, 5=Mercury/Budha, 6=Venus/Shukra, 7=Ketu, 8=Saturn/Shani, 9=Mars/Mangal)
3. Karmic insights: Reincarnation, past life influences, and spiritual growth
4. Remedial measures: Gemstones, mantras, and upayas (remedies) based on planetary influences

User Profile:
- Moon Sign: ${moonSign} (Vedic Sidereal - MOST IMPORTANT in Vedic astrology, represents mind and emotions)
- Lagna (Ascendant): ${lagnaSign} (Vedic Sidereal - represents physical body and life path)
- Sun Sign: ${sunSign} (Vedic Sidereal - represents soul and individuality)
- Life Path Number: ${numerologyProfile.lifePathNumber} (Ruled by ${rulingPlanet})
- Destiny Number: ${numerologyProfile.destinyNumber} (Ruled by ${destinyPlanet})
- Soul Number: ${numerologyProfile.soulNumber} (Ruled by ${soulPlanet})
- Personality Number: ${numerologyProfile.personalityNumber ?? numerologyProfile.nameNumber} (Ruled by ${personalityPlanet})
- Birth Day Number: ${numerologyProfile.birthDayNumber} (Ruled by ${birthDayPlanet})
- Karmic Lessons: ${karmicLessonsText}
- Birth Date: ${birthDate}
- Full Name: ${fullName}
- Current Year: ${currentYear}

Generate a comprehensive Vedic Astro-Numerology analysis. Emphasize:
1. Moon sign prominence (more important than Sun in Vedic system)
2. Planetary number associations and their Navagraha connections
3. Karmic insights with reincarnation perspective
4. Dasha system connections (how numerology numbers relate to planetary periods)
5. Vedic remedies: gemstones and mantras based on ruling planets
6. Spiritual growth and dharma (life purpose)

Format your response as a JSON object with the following structure:
{
  "personalitySynthesis": "Detailed paragraph explaining how the Moon sign (most important), Lagna, Sun sign, and numerology numbers work together. Emphasize Vedic (Sidereal) interpretations, emotional nature from Moon, and how planetary number influences create a unique personality profile. Include references to Navagraha planets.",
  "karmicInsights": "Detailed paragraph about karmic lessons, past life influences, and how the numerology numbers and planetary associations reveal spiritual blueprint. Connect to Dasha periods and reincarnation themes. Reference the specific karmic lessons identified.",
  "remedies": "Detailed paragraph about Vedic remedial measures: recommended gemstones based on ruling planets (${lifePathGemstone}, ${destinyGemstone}), mantras (${lifePathMantra}), and upayas to balance planetary influences.",
  "careerGuidance": "Detailed paragraph about career paths aligned with Moon sign, Lagna, and numerology numbers. Include references to dharma (life purpose) and how planetary number associations guide vocational choices.",
  "relationshipInsights": "Detailed paragraph about relationship dynamics from Vedic perspective, combining Moon sign (emotional nature), Lagna (physical attraction), and numerology compatibility patterns.",
  "lifePurpose": "Detailed paragraph about deeper life purpose (dharma) combining Vedic astrological insights with numerological patterns. Emphasize spiritual growth and karmic destiny.",
  "personalGrowth": "Detailed paragraph with specific Vedic-based recommendations for personal development, including spiritual practices, meditation suggestions, and ways to balance planetary influences.",
  "challenges": ["Challenge 1 related to planetary influences and karmic lessons", "Challenge 2 description", "Challenge 3 description"],
  "opportunities": ["Opportunity 1 related to favorable planetary combinations", "Opportunity 2 description", "Opportunity 3 description"],
  "yearlyForecast": "Detailed paragraph about ${currentYear} forecast based on Vedic system, including significant Dasha periods, favorable times for numerology number manifestations, and key dates to watch."
}

Write in the voice of a Vedic seer addressing the person directly (use "you" not "he/she" or third person). Be warm, spiritual, and deeply insightful. Reference Vedic concepts naturally.`;
}

type VedicComprehensiveAnalysis = NonNullable<
  VedicAstroNumerologyResponse['data']
>['comprehensiveAnalysis'];

function extractVedicAstroNumerologyAnalysisFromCache(
  cachedData: Record<string, unknown>,
): VedicComprehensiveAnalysis | null {
  const data =
    (cachedData.data as VedicAstroNumerologyResponse['data'] | undefined) ||
    (cachedData as VedicAstroNumerologyResponse['data']);
  const analysis = data?.comprehensiveAnalysis;
  if (!analysis?.personalitySynthesis?.trim()) return null;
  return analysis;
}

async function readVedicAstroNumerologyCache(
  userId: string,
  birthDataKey: string,
  options?: { allowStale?: boolean },
): Promise<VedicComprehensiveAnalysis | null> {
  try {
    const docSnap = await getCachedDoc(['users', userId, 'vedicAstroNumerologyReports'], 'current');
    if (!docSnap?.exists()) return null;
    const cachedData = docSnap.data() as Record<string, unknown>;
    if ((cachedData.birthDataKey as string | undefined) !== birthDataKey) return null;
    const lastUpdated = cachedData.timestamp as number | undefined;
    if (!lastUpdated) return null;
    if (!options?.allowStale) {
      const hoursSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60);
      if (hoursSinceUpdate >= 24) return null;
    }
    return extractVedicAstroNumerologyAnalysisFromCache(cachedData);
  } catch {
    return null;
  }
}

function buildDeterministicVedicAstroNumerology(
  moonSign: string,
  lagnaSign: string,
  numerologyProfile: VedicNumerologyProfile,
): VedicComprehensiveAnalysis {
  return {
    personalitySynthesis: `Your ${moonSign} Moon sign (most important in Vedic astrology) combines with Life Path ${numerologyProfile.lifePathNumber} (ruled by ${numerologyProfile.planetaryInfluences['Life Path']?.planet}) and Lagna ${lagnaSign} to create a unique Vedic personality profile.`,
    karmicInsights:
      'Your karmic lessons are revealed through the planetary number associations in your numerology profile.',
    remedies: `Recommended gemstones: ${numerologyProfile.planetaryInfluences['Life Path']?.gemstone || 'Ruby'} for Life Path, ${numerologyProfile.planetaryInfluences['Destiny']?.gemstone || 'Pearl'} for Destiny.`,
    careerGuidance: `Career paths aligned with your ${moonSign} Moon sign and numerology numbers would be most fulfilling.`,
    relationshipInsights: `Your relationship style is influenced by your ${moonSign} Moon sign and numerological patterns.`,
    lifePurpose:
      'Your life purpose (dharma) is revealed through the combination of Vedic astrological and numerological influences.',
    personalGrowth:
      'Focus on developing spiritual awareness and balancing planetary influences for optimal growth.',
    challenges: ['Balancing different planetary influences', 'Integrating karmic lessons'],
    opportunities: ['Leveraging favorable planetary combinations', 'Aligning with dharma'],
    yearlyForecast:
      'This year brings opportunities to integrate your Vedic astrological and numerological influences.',
  };
}

function mapVedicAstroNumerologyParsed(parsed: Record<string, unknown>): VedicComprehensiveAnalysis {
  return {
    personalitySynthesis: String(parsed.personalitySynthesis ?? ''),
    karmicInsights: String(parsed.karmicInsights ?? ''),
    remedies: String(parsed.remedies ?? ''),
    careerGuidance: String(parsed.careerGuidance ?? ''),
    relationshipInsights: String(parsed.relationshipInsights ?? ''),
    lifePurpose: String(parsed.lifePurpose ?? ''),
    personalGrowth: String(parsed.personalGrowth ?? ''),
    challenges: Array.isArray(parsed.challenges) ? parsed.challenges.map(String) : [],
    opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities.map(String) : [],
    yearlyForecast: String(parsed.yearlyForecast ?? ''),
  };
}

function textFallbackVedicAstroNumerology(response: string): VedicComprehensiveAnalysis {
  const sections = response.split(/\n\n+/);
  return {
    personalitySynthesis: sections[0] || response.substring(0, 300),
    karmicInsights: sections[1] || 'Karmic insights based on your Vedic Astro-Numerology profile.',
    remedies: sections[2] || 'Vedic remedies and gemstone recommendations for your planetary influences.',
    careerGuidance: sections[3] || 'Career guidance based on your combined Vedic astrological and numerological profile.',
    relationshipInsights: sections[4] || 'Relationship insights from your Vedic Astro-Numerology combination.',
    lifePurpose: sections[5] || 'Life purpose (dharma) revealed through Vedic Astro-Numerology analysis.',
    personalGrowth: sections[6] || 'Personal growth recommendations for your Vedic journey.',
    challenges: [
      'Balancing different planetary influences',
      'Integrating karmic lessons',
      'Developing spiritual awareness',
    ],
    opportunities: [
      'Harnessing favorable planetary combinations',
      'Aligning with dharma',
      'Connecting with spiritual practices',
    ],
    yearlyForecast:
      sections[7] || `Your ${new Date().getFullYear()} forecast based on Vedic Astro-Numerology profile.`,
  };
}

function parseGroqResponse(response: GroqStructuredParseInput): VedicComprehensiveAnalysis {
  if (isGroqParsedRecord(response)) {
    return mapVedicAstroNumerologyParsed(response);
  }

  const trimmed = response.trim();
  if (!trimmed) {
    return textFallbackVedicAstroNumerology('');
  }

  const structured = parseStructuredJsonFromResponse(trimmed);
  if (structured.ok && structured.data) {
    return mapVedicAstroNumerologyParsed(structured.data);
  }

  devLog.warn('Failed to parse JSON from Groq response, using fallback', undefined, 'vedic-astro-numerology');
  return textFallbackVedicAstroNumerology(trimmed);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, birthDate, fullName, moonSign, lagnaSign, sunSign, numerologyProfile }: VedicAstroNumerologyRequest = await request.json();

    // Validate required fields
    if (!userId || !birthDate || !fullName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId, birthDate, or fullName'
      }, { status: 400 });
    }

    if (!moonSign || moonSign === 'Unknown') {
      return NextResponse.json({
        success: false,
        error: 'Moon sign is required. Please ensure Vedic chart data is available.'
      }, { status: 400 });
    }

    devLog.info('🔮 Vedic Astro-Numerology API: Generating comprehensive report for user:', userId, 'vedic-astro-numerology');

    const birthDataKey = `${birthDate}_${fullName}_${moonSign}_${lagnaSign}`;

    try {
      const cached = await readVedicAstroNumerologyCache(userId, birthDataKey);
      if (cached) {
        devLog.info('✅ Returning cached Vedic Astro-Numerology report for user:', userId, 'vedic-astro-numerology');
        return NextResponse.json({
          success: true,
          data: {
            moonSign,
            lagnaSign,
            sunSign,
            lifePathNumber: numerologyProfile.lifePathNumber,
            rulingPlanet: numerologyProfile.planetaryInfluences['Life Path']?.planet || 'Sun',
            comprehensiveAnalysis: cached,
            timestamp: Date.now(),
          },
        });
      }
    } catch (cacheError: unknown) {
      devLog.warn('⚠️ Error checking cache, proceeding with generation:', cacheError, 'vedic-astro-numerology');
    }

    if (!process.env.GROQ_API_KEY) {
      devLog.error('❌ GROQ_API_KEY is not configured', undefined, 'route');
      return NextResponse.json({
        success: true,
        data: {
          moonSign,
          lagnaSign,
          sunSign,
          lifePathNumber: numerologyProfile.lifePathNumber,
          rulingPlanet: numerologyProfile.planetaryInfluences['Life Path']?.planet || 'Sun',
          comprehensiveAnalysis: buildDeterministicVedicAstroNumerology(
            moonSign,
            lagnaSign,
            numerologyProfile,
          ),
          timestamp: Date.now(),
        },
      });
    }

    const prompt = buildVedicGroqPrompt(
      moonSign,
      lagnaSign,
      sunSign,
      numerologyProfile,
      birthDate,
      fullName,
    );

    devLog.info('🤖 Calling AI for comprehensive Vedic Astro-Numerology analysis...', undefined, 'vedic-astro-numerology');

    const resolved = await resolveAiReportWithFallback({
      label: 'vedic-astro-numerology-comprehensive',
      userId,
      tryLlm: async () => {
        const structured = await callStructuredAI({
          label: 'vedic-astro-numerology-comprehensive',
          model: 'llama-3.3-70b-versatile',
          userId,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert Vedic astro-numerologist with deep knowledge of Jyotish (Vedic Astrology), Navagraha planetary number associations, karmic interpretations, Dasha system, and Vedic remedies. You speak in the voice of a seer addressing the person directly. Always respond with valid JSON when requested.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.75,
          maxTokens: 3000,
          responseFormat: { type: 'json_object' },
          maxAttempts: 3,
        });

        if (!structured.ok && structured.failureMode !== 'none') {
          devLog.warn(
            `vedic-astro-numerology structured AI: ${structured.failureMode} after ${structured.attempts} attempt(s)`,
            undefined,
            'vedic-astro-numerology',
          );
        }

        if (structured.ok && structured.raw) {
          return {
            data: mapVedicAstroNumerologyParsed(structured.raw),
            attempts: structured.attempts,
            failureMode: 'none',
          };
        }
        const recovered = structured.lastRaw
          ? parseStructuredJsonFromResponse(structured.lastRaw)
          : null;
        if (recovered?.ok && recovered.data) {
          return {
            data: mapVedicAstroNumerologyParsed(recovered.data),
            attempts: structured.attempts,
            failureMode: structured.failureMode,
          };
        }
        return {
          data: null,
          attempts: structured.attempts,
          failureMode: structured.failureMode as StructuredFailureMode,
          parsingFailed: true,
        };
      },
      readFirestoreCache: () =>
        readVedicAstroNumerologyCache(userId, birthDataKey, { allowStale: true }),
      buildDeterministic: () =>
        buildDeterministicVedicAstroNumerology(moonSign, lagnaSign, numerologyProfile),
    });

    const responseData: VedicAstroNumerologyResponse['data'] = {
      moonSign,
      lagnaSign,
      sunSign,
      lifePathNumber: numerologyProfile.lifePathNumber,
      rulingPlanet: numerologyProfile.planetaryInfluences['Life Path']?.planet || 'Sun',
      comprehensiveAnalysis: resolved.data,
      timestamp: Date.now(),
    };

    if (resolved.degraded && resolved.source !== 'llm') {
      return NextResponse.json({
        success: true,
        data: {
          ...responseData,
          parsingFailed: resolved.parsingFailed ?? true,
          fallbackSource: resolved.source,
          error:
            resolved.source === 'firestore_cache'
              ? 'Using last saved report; AI narrative refresh failed'
              : 'Failed to parse AI response, using chart-based defaults',
        },
      });
    }

    try {
      await setCachedDoc(['users', userId, 'vedicAstroNumerologyReports'], 'current', {
        data: responseData,
        birthDataKey,
        timestamp: Date.now(),
      });
      devLog.info('✅ Cached Vedic Astro-Numerology report in Firebase', undefined, 'vedic-astro-numerology');
    } catch (cacheError: unknown) {
      devLog.warn('⚠️ Error caching report:', cacheError, 'vedic-astro-numerology');
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error: any) {
    devLog.error('❌ Vedic Astro-Numerology API error:', error, 'route');
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate Vedic Astro-Numerology analysis'
    }, { status: 500 });
  }
}

