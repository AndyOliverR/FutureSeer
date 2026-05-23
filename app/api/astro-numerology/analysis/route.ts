import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { resolveAiReportWithFallback } from '@/lib/aiFallbackRouter';
import { callStructuredAI } from '@/lib/aiStructuredOutput';
import { parseStructuredJsonFromResponse } from '@/lib/aiStructuredOutputParse';
import { isGroqParsedRecord, type GroqStructuredParseInput } from '@/lib/groqStructuredParse';
import { calculateLifePathNumber, calculateDestinyNumber } from '@/lib/numerologyCalculations';
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
      devLog.warn('Error getting document:', error, 'astro-numerology');
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
      devLog.warn('Error setting document:', error, 'astro-numerology');
    }
  }
}


interface AstroNumerologyRequest {
  userId: string;
  birthDate: string;
  fullName: string;
  sunSign?: string;
}

interface AstroNumerologyResponse {
  success: boolean;
  data?: {
    sunSign: string;
    lifePathNumber: number;
    nameNumber: number;
    comprehensiveAnalysis: {
      personalitySynthesis: string;
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

// Build comprehensive Groq prompt
function buildGroqPrompt(sunSign: string, lifePathNumber: number, nameNumber: number, birthDate: string, fullName: string): string {
  const currentYear = new Date().getFullYear();
  
  return `You are an expert astro-numerologist specializing in combining Western Astrology (Tropical Zodiac) with Pythagorean Numerology.

User Profile:
- Sun Sign: ${sunSign} (Western Astrology - represents core personality)
- Life Path Number: ${lifePathNumber} (from birth date - represents life journey)
- Name Number: ${nameNumber} (from full name - represents natural talents)
- Birth Date: ${birthDate}
- Full Name: ${fullName}
- Current Year: ${currentYear}

Generate a comprehensive astro-numerology analysis covering all life areas. Provide detailed, insightful, and practical guidance. Write in a warm, empowering, and accessible tone.

Format your response as a JSON object with the following structure:
{
  "personalitySynthesis": "Detailed paragraph explaining how the sun sign, life path number, and name number work together to create a unique personality profile. Be specific and insightful, showing how these energies blend.",
  "careerGuidance": "Detailed paragraph about career paths that align with these combined energies, what the life purpose reveals, and specific vocational directions.",
  "relationshipInsights": "Detailed paragraph about how these energies manifest in relationships, compatibility patterns, and interpersonal dynamics.",
  "lifePurpose": "Detailed paragraph about the deeper life purpose when combining astrological and numerological insights, including destiny themes.",
  "personalGrowth": "Detailed paragraph with specific recommendations for personal development based on the combined analysis, including actionable steps.",
  "challenges": ["Challenge 1 description", "Challenge 2 description", "Challenge 3 description"],
  "opportunities": ["Opportunity 1 description", "Opportunity 2 description", "Opportunity 3 description"],
  "yearlyForecast": "Detailed paragraph about insights for ${currentYear} based on the numbers and sun sign, including key themes and timing considerations."
}

Make each section comprehensive yet concise, providing valuable insights that help the user understand themselves better and navigate their life path.`;
}

type AstroNumerologyComprehensiveAnalysis = NonNullable<
  AstroNumerologyResponse['data']
>['comprehensiveAnalysis'];

function extractAstroNumerologyAnalysisFromCache(
  cachedData: Record<string, unknown>,
): AstroNumerologyComprehensiveAnalysis | null {
  const data =
    (cachedData.data as AstroNumerologyResponse['data'] | undefined) ||
    (cachedData as AstroNumerologyResponse['data']);
  const analysis = data?.comprehensiveAnalysis;
  if (!analysis?.personalitySynthesis?.trim()) return null;
  return analysis;
}

async function readAstroNumerologyCache(
  userId: string,
  birthDataKey: string,
  options?: { allowStale?: boolean },
): Promise<AstroNumerologyComprehensiveAnalysis | null> {
  try {
    const docSnap = await getCachedDoc(['users', userId, 'astroNumerologyReports'], 'current');
    if (!docSnap?.exists()) return null;
    const cachedData = docSnap.data() as Record<string, unknown>;
    const cachedBirthKey = cachedData.birthDataKey as string | undefined;
    if (cachedBirthKey !== birthDataKey) return null;
    const lastUpdated = cachedData.timestamp as number | undefined;
    if (!lastUpdated) return null;
    if (!options?.allowStale) {
      const hoursSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60);
      if (hoursSinceUpdate >= 24) return null;
    }
    return extractAstroNumerologyAnalysisFromCache(cachedData);
  } catch {
    return null;
  }
}

function buildDeterministicAstroNumerology(
  actualSunSign: string,
  lifePathNumber: number,
  nameNumber: number,
): AstroNumerologyComprehensiveAnalysis {
  return {
    personalitySynthesis: `Your ${actualSunSign} sun sign combines with Life Path ${lifePathNumber} and Name Number ${nameNumber} to create a unique personality blend.`,
    careerGuidance: `Career paths that align with Life Path ${lifePathNumber} and your ${actualSunSign} traits would be most fulfilling.`,
    relationshipInsights: `Your relationship style is influenced by both your ${actualSunSign} nature and your numerological patterns.`,
    lifePurpose: 'Your life purpose is revealed through the combination of your astrological and numerological influences.',
    personalGrowth:
      'Focus on developing the strengths of both your sun sign and your life path number for optimal growth.',
    challenges: [
      'Balancing different aspects of your personality',
      'Aligning actions with your life purpose',
    ],
    opportunities: [
      'Leveraging your unique combination of energies',
      'Connecting with like-minded individuals',
    ],
    yearlyForecast:
      'This year brings opportunities to integrate your astrological and numerological influences.',
  };
}

function mapAstroNumerologyParsed(
  parsed: Record<string, unknown>,
): AstroNumerologyComprehensiveAnalysis {
  return {
    personalitySynthesis: String(parsed.personalitySynthesis ?? ''),
    careerGuidance: String(parsed.careerGuidance ?? ''),
    relationshipInsights: String(parsed.relationshipInsights ?? ''),
    lifePurpose: String(parsed.lifePurpose ?? ''),
    personalGrowth: String(parsed.personalGrowth ?? ''),
    challenges: Array.isArray(parsed.challenges) ? parsed.challenges.map(String) : [],
    opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities.map(String) : [],
    yearlyForecast: String(parsed.yearlyForecast ?? ''),
  };
}

function textFallbackAstroNumerology(response: string): AstroNumerologyComprehensiveAnalysis {
  const sections = response.split(/\n\n+/);
  return {
    personalitySynthesis: sections[0] || response.substring(0, 300),
    careerGuidance: sections[1] || 'Career guidance based on your combined astro-numerology profile.',
    relationshipInsights: sections[2] || 'Relationship insights from your astro-numerology combination.',
    lifePurpose: sections[3] || 'Life purpose revealed through astro-numerology analysis.',
    personalGrowth: sections[4] || 'Personal growth recommendations for your journey.',
    challenges: [
      'Balancing different aspects of your personality',
      'Navigating life transitions',
      'Developing your full potential',
    ],
    opportunities: [
      'Harnessing your unique combination of energies',
      'Aligning with your life purpose',
      'Building meaningful connections',
    ],
    yearlyForecast:
      sections[5] || `Your ${new Date().getFullYear()} forecast based on your astro-numerology profile.`,
  };
}

function parseGroqResponse(response: GroqStructuredParseInput): AstroNumerologyComprehensiveAnalysis {
  if (isGroqParsedRecord(response)) {
    return mapAstroNumerologyParsed(response);
  }

  const trimmed = response.trim();
  if (!trimmed) {
    return textFallbackAstroNumerology('');
  }

  const structured = parseStructuredJsonFromResponse(trimmed);
  if (structured.ok && structured.data) {
    return mapAstroNumerologyParsed(structured.data);
  }

  devLog.warn('Failed to parse JSON from Groq response, using fallback', undefined, 'astro-numerology');
  return textFallbackAstroNumerology(trimmed);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, birthDate, fullName, sunSign }: AstroNumerologyRequest = await request.json();

    // Validate required fields
    if (!userId || !birthDate || !fullName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId, birthDate, or fullName'
      }, { status: 400 });
    }

    devLog.info('🔮 Astro-Numerology API: Generating comprehensive report for user:', userId, 'astro-numerology');

    // Calculate numerology numbers
    const lifePathNumber = calculateLifePathNumber(birthDate);
    const nameNumber = calculateDestinyNumber(fullName); // Destiny Number is the Name Number

    // Get sun sign if not provided (would need to be passed from component)
    const actualSunSign = sunSign || 'Unknown';

    if (actualSunSign === 'Unknown') {
      return NextResponse.json({
        success: false,
        error: 'Sun sign is required. Please ensure Western astrology chart data is available.'
      }, { status: 400 });
    }

    const birthDataKey = `${birthDate}_${fullName}_${actualSunSign}`;

    try {
      const cached = await readAstroNumerologyCache(userId, birthDataKey);
      if (cached) {
        devLog.info('✅ Returning cached Astro-Numerology report for user:', userId, 'astro-numerology');
        return NextResponse.json({
          success: true,
          data: {
            sunSign: actualSunSign,
            lifePathNumber,
            nameNumber,
            comprehensiveAnalysis: cached,
            timestamp: Date.now(),
          },
        });
      }
    } catch (cacheError: unknown) {
      devLog.warn('⚠️ Error checking cache, proceeding with generation:', cacheError, 'astro-numerology');
    }

    if (!process.env.GROQ_API_KEY) {
      devLog.error('❌ GROQ_API_KEY is not configured', undefined, 'route');
      return NextResponse.json({
        success: true,
        data: {
          sunSign: actualSunSign,
          lifePathNumber,
          nameNumber,
          comprehensiveAnalysis: buildDeterministicAstroNumerology(
            actualSunSign,
            lifePathNumber,
            nameNumber,
          ),
          timestamp: Date.now(),
        },
      });
    }

    const prompt = buildGroqPrompt(actualSunSign, lifePathNumber, nameNumber, birthDate, fullName);

    devLog.info('🤖 Calling AI for comprehensive Astro-Numerology analysis...', undefined, 'astro-numerology');

    const resolved = await resolveAiReportWithFallback({
      label: 'astro-numerology-comprehensive',
      userId,
      tryLlm: async () => {
        const structured = await callStructuredAI({
          label: 'astro-numerology-comprehensive',
          model: 'llama-3.3-70b-versatile',
          userId,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert astro-numerologist specializing in combining Western Astrology (Tropical Zodiac) with Pythagorean Numerology. Provide comprehensive, insightful, and practical guidance. Always respond with valid JSON when requested.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.75,
          maxTokens: 2500,
          responseFormat: { type: 'json_object' },
          maxAttempts: 3,
        });

        if (!structured.ok && structured.failureMode !== 'none') {
          devLog.warn(
            `astro-numerology structured AI: ${structured.failureMode} after ${structured.attempts} attempt(s)`,
            undefined,
            'astro-numerology',
          );
        }

        if (structured.ok && structured.raw) {
          return {
            data: mapAstroNumerologyParsed(structured.raw),
            attempts: structured.attempts,
            failureMode: 'none',
          };
        }
        const recovered = structured.lastRaw
          ? parseStructuredJsonFromResponse(structured.lastRaw)
          : null;
        if (recovered?.ok && recovered.data) {
          return {
            data: mapAstroNumerologyParsed(recovered.data),
            attempts: structured.attempts,
            failureMode: structured.failureMode,
          };
        }
        return {
          data: null,
          attempts: structured.attempts,
          failureMode: structured.failureMode,
          parsingFailed: true,
        };
      },
      readFirestoreCache: () =>
        readAstroNumerologyCache(userId, birthDataKey, { allowStale: true }),
      buildDeterministic: () =>
        buildDeterministicAstroNumerology(actualSunSign, lifePathNumber, nameNumber),
    });

    const responseData: AstroNumerologyResponse['data'] = {
      sunSign: actualSunSign,
      lifePathNumber,
      nameNumber,
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
      await setCachedDoc(['users', userId, 'astroNumerologyReports'], 'current', {
        data: responseData,
        birthDataKey,
        timestamp: Date.now(),
      });
      devLog.info('✅ Cached Astro-Numerology report in Firebase', undefined, 'astro-numerology');
    } catch (cacheError: unknown) {
      devLog.warn('⚠️ Error caching report:', cacheError, 'astro-numerology');
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error: any) {
    devLog.error('❌ Astro-Numerology API error:', error, 'route');
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate Astro-Numerology analysis'
    }, { status: 500 });
  }
}

