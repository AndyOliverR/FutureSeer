import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { resolveAiReportWithFallback } from '@/lib/aiFallbackRouter';
import { callStructuredAI } from '@/lib/aiStructuredOutput';
import type { StructuredFailureMode } from '@/lib/aiStructuredOutputParse';
import { parseStructuredJsonFromResponse } from '@/lib/aiStructuredOutputParse';
import { isGroqParsedRecord, type GroqStructuredParseInput } from '@/lib/groqStructuredParse';
import { devLog, devWarn } from '@/lib/devLogger';
import { computeChaldeanProfile } from '@/lib/numerology/chaldean';
import { calcPersonalYear } from '@/lib/numerology/personalYear';
import { calcDriver, calcConductor } from '@/lib/numerology/driverConductor';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

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
      devWarn('Error getting document:', error, 'numerology');
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
      devWarn('Error setting document:', error, 'numerology');
    }
  }
}

const COMPREHENSIVE_REPORT_SCHEMA_VERSION = '1.0';

interface ComprehensiveNumerologyRequest {
  userId: string;
  numerologyData: {
    lifePathNumber?: number;
    expressionNumber?: number;
    soulUrgeNumber?: number;
    personalityNumber?: number;
    destinyNumber?: number;
    birthdayNumber?: number;
    maturityNumber?: number;
    personalYearNumber?: number;
    breakdown?: any;
  };
  userProfile?: {
    birthDate?: string;
    fullName?: string;
    displayName?: string;
  };
}

interface ComprehensiveNumerologyResponse {
  success: boolean;
  data?: {
    comprehensiveAnalysis: {
      profileOverview: string;
      coreNumbersAnalysis: Array<{ number: string; value: number; analysis: string }>;
      lifePathAnalysis: string;
      expressionAnalysis: string;
      soulUrgeAnalysis: string;
      personalityAnalysis: string;
      destinyAnalysis: string;
      personalYearAnalysis: string;
      challengesAndOpportunities: {
        challenges: string[];
        opportunities: string[];
      };
      predictiveInsights: {
        todaysQuickWin: string;
        currentWeek: string;
        currentMonth: string;
        currentYear: string;
        nextYearSneakPeek: string;
        longerTermCycles: string;
      };
    };
    timestamp: number;
  };
  error?: string;
}

type ComprehensiveAnalysis = NonNullable<
  ComprehensiveNumerologyResponse['data']
>['comprehensiveAnalysis'];

function extractNumerologyAnalysisFromCache(
  cachedData: Record<string, unknown>,
): ComprehensiveAnalysis | null {
  const actualData = (cachedData.data as Record<string, unknown> | undefined) || cachedData;
  const comprehensiveAnalysis =
    (actualData.comprehensiveAnalysis as ComprehensiveAnalysis | undefined) ||
    (actualData as ComprehensiveAnalysis | undefined);
  if (!comprehensiveAnalysis?.profileOverview) return null;
  return comprehensiveAnalysis;
}

async function readNumerologyComprehensiveCache(
  userId: string,
  options?: { allowStale?: boolean },
): Promise<ComprehensiveAnalysis | null> {
  try {
    const docSnap = await getCachedDoc(['users', userId, 'numerologyReports'], 'comprehensive');
    if (!docSnap?.exists()) return null;
    const cachedData = docSnap.data() as Record<string, unknown>;
    const lastUpdated = cachedData?.timestamp as number | undefined;
    if (!lastUpdated) return null;

    if (!options?.allowStale) {
      const hoursSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60);
      if (hoursSinceUpdate >= 24) return null;
    }

    const schemaVersion =
      (cachedData.schemaVersion as string | undefined) ||
      ((cachedData.data as Record<string, unknown> | undefined)?.schemaVersion as
        | string
        | undefined);
    if (
      !options?.allowStale &&
      (!schemaVersion || schemaVersion !== COMPREHENSIVE_REPORT_SCHEMA_VERSION)
    ) {
      return null;
    }

    return extractNumerologyAnalysisFromCache(cachedData);
  } catch {
    return null;
  }
}

// Build comprehensive Groq prompt for numerology
function buildGroqPrompt(numerologyData: ComprehensiveNumerologyRequest['numerologyData'], userProfile?: any): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  const nextYear = currentYear + 1;
  const currentMonth = today.toLocaleString('en-US', { month: 'long' });
  
  const lifePath = numerologyData.lifePathNumber || 0;
  const expression = numerologyData.expressionNumber || numerologyData.destinyNumber || 0;
  const soulUrge = numerologyData.soulUrgeNumber || 0;
  const personality = numerologyData.personalityNumber || 0;
  const destiny = numerologyData.destinyNumber || 0;
  const personalYear = numerologyData.personalYearNumber || calcPersonalYear(userProfile?.birthDate || '') || 0;
  
  const fullName = userProfile?.fullName || userProfile?.displayName || 'the user';
  const birthDate = userProfile?.birthDate || '';

  return `You are an expert Chaldean Numerologist specializing in the ancient Babylonian number system. Provide comprehensive, insightful, and practical guidance based on the complete numerology profile.

TIME CONTEXT:
- Today's Date: ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Current Month: ${currentMonth} ${currentYear}
- Current Year: ${currentYear}
- Next Year: ${nextYear}

NUMEROLOGY DATA:
- Full Name: ${fullName}
- Birth Date: ${birthDate || 'Not provided'}

CORE NUMBERS:
- Life Path Number: ${lifePath}${lifePath === 11 || lifePath === 22 || lifePath === 33 ? ' (Master Number)' : ''}
- Expression Number (Destiny): ${expression}${expression === 11 || expression === 22 || expression === 33 ? ' (Master Number)' : ''}
- Soul Urge Number: ${soulUrge}${soulUrge === 11 || soulUrge === 22 || soulUrge === 33 ? ' (Master Number)' : ''}
- Personality Number: ${personality}${personality === 11 || personality === 22 || personality === 33 ? ' (Master Number)' : ''}
- Destiny Number: ${destiny}${destiny === 11 || destiny === 22 || destiny === 33 ? ' (Master Number)' : ''}
- Personal Year Number: ${personalYear}${personalYear === 11 || personalYear === 22 || personalYear === 33 ? ' (Master Number)' : ''}

IMPORTANT CONTEXT - Chaldean Numerology Philosophy:
Chaldean Numerology is an ancient Babylonian system that reveals life patterns, destiny, and character traits through numbers. It focuses on:
- Understanding your life's purpose and lessons (Life Path)
- Discovering your natural talents and abilities (Expression/Destiny)
- Revealing your inner desires and motivations (Soul Urge)
- Understanding how others perceive you (Personality)
- Identifying your ultimate life purpose (Destiny)
- Navigating current life cycles (Personal Year)

PREDICTION REQUIREMENTS - CRITICAL:
ALL predictions MUST be personalized to THIS specific numerology profile. Generic numerology text is NOT acceptable.

- todaysQuickWin: MUST reference the Personal Year Number ${personalYear} and how it influences today's energy. Example: "With your Personal Year ${personalYear}, today's energy aligns with [specific theme]..."
- currentWeek: MUST mention how the Personal Year ${personalYear} influences this week's themes. Example: "This week, your Personal Year ${personalYear} brings focus to [specific area]..."
- currentMonth: MUST reference how ${currentMonth}'s energy interacts with your Personal Year ${personalYear} and core numbers. Example: "This month, your Life Path ${lifePath} and Personal Year ${personalYear} combine to..."
- currentYear: MUST identify how Personal Year ${personalYear} influences the entire year ${currentYear}. Reference your Life Path ${lifePath} and Expression ${expression} numbers. Example: "Your Personal Year ${personalYear} throughout ${currentYear} brings [specific themes]..."
- nextYearSneakPeek: MUST calculate and reference the Personal Year for ${nextYear} and how it will differ from ${currentYear}. Example: "Next year (${nextYear}), you'll enter Personal Year [number], which will shift focus to..."
- longerTermCycles: MUST reference your Life Path ${lifePath} journey, Expression ${expression} destiny, and how Personal Year cycles evolve over time.

Personalization Rules:
✓ Reference actual numbers from CORE NUMBERS section above
✓ Mention specific number combinations (e.g., "Life Path ${lifePath} with Expression ${expression}")
✓ Connect Personal Year cycles to core numbers
✓ Use language like "your Life Path ${lifePath}", "your Expression Number ${expression}", "your Personal Year ${personalYear}"
✗ DO NOT write generic numerology text that could apply to anyone
✗ DO NOT ignore the numerology data provided
✗ DO NOT create predictions without referencing specific numbers

Generate a comprehensive Chaldean Numerology analysis covering all life areas. Format your response as a JSON object with the following structure:
{
  "profileOverview": "Detailed paragraph summarizing the numerology profile's dominant themes, number combinations, overall character, and key patterns.",
  "coreNumbersAnalysis": [
    {"number": "Life Path", "value": ${lifePath}, "analysis": "Detailed interpretation of Life Path Number ${lifePath}'s meaning, purpose, and life lessons"},
    {"number": "Expression", "value": ${expression}, "analysis": "Detailed interpretation of Expression Number ${expression}'s meaning, talents, and abilities"},
    {"number": "Soul Urge", "value": ${soulUrge}, "analysis": "Detailed interpretation of Soul Urge Number ${soulUrge}'s meaning, inner desires, and motivations"},
    {"number": "Personality", "value": ${personality}, "analysis": "Detailed interpretation of Personality Number ${personality}'s meaning and how others perceive you"},
    {"number": "Destiny", "value": ${destiny}, "analysis": "Detailed interpretation of Destiny Number ${destiny}'s meaning and ultimate life purpose"},
    {"number": "Personal Year", "value": ${personalYear}, "analysis": "Detailed interpretation of Personal Year ${personalYear}'s meaning and current life cycle themes"}
  ],
  "lifePathAnalysis": "Comprehensive analysis of Life Path Number ${lifePath}, including life purpose, lessons, challenges, and opportunities. Reference specific traits and characteristics of this number.",
  "expressionAnalysis": "Comprehensive analysis of Expression Number ${expression}, including natural talents, abilities, career paths, and how to express yourself authentically.",
  "soulUrgeAnalysis": "Comprehensive analysis of Soul Urge Number ${soulUrge}, including inner desires, motivations, emotional needs, and what truly drives you.",
  "personalityAnalysis": "Comprehensive analysis of Personality Number ${personality}, including how others perceive you, your outer personality, and social interactions.",
  "destinyAnalysis": "Comprehensive analysis of Destiny Number ${destiny}, including your ultimate life purpose, destiny path, and long-term goals.",
  "personalYearAnalysis": "Comprehensive analysis of Personal Year ${personalYear}, including current life cycle themes, focus areas, and what to expect during this year.",
  "challengesAndOpportunities": {
    "challenges": [
      "Specific challenge related to Life Path ${lifePath}",
      "Specific challenge related to Expression ${expression}",
      "Specific challenge related to number combinations"
    ],
    "opportunities": [
      "Specific opportunity related to Life Path ${lifePath}",
      "Specific opportunity related to Expression ${expression}",
      "Specific opportunity related to Personal Year ${personalYear}"
    ]
  },
  "predictiveInsights": {
    "todaysQuickWin": "MUST reference Personal Year ${personalYear} and how it influences today. Example: 'With your Personal Year ${personalYear}, today's energy aligns with [theme]...' Keep it concise (2-3 sentences) and actionable.",
    "currentWeek": "MUST mention how Personal Year ${personalYear} influences this week. Example: 'This week, your Personal Year ${personalYear} brings focus to [area]...' Keep it practical and specific.",
    "currentMonth": "MUST reference how ${currentMonth}'s energy interacts with Personal Year ${personalYear} and core numbers. Example: 'This month, your Life Path ${lifePath} and Personal Year ${personalYear} combine to...' Provide actionable insights.",
    "currentYear": "MUST identify how Personal Year ${personalYear} influences ${currentYear}. Reference Life Path ${lifePath} and Expression ${expression}. Example: 'Your Personal Year ${personalYear} throughout ${currentYear} brings [themes]...' Highlight key periods.",
    "nextYearSneakPeek": "MUST calculate Personal Year for ${nextYear} and how it differs. Example: 'Next year (${nextYear}), you'll enter Personal Year [number], which will shift focus to...' Provide insight based on number cycles.",
    "longerTermCycles": "MUST reference Life Path ${lifePath} journey, Expression ${expression} destiny, and how Personal Year cycles evolve. Connect longer-term patterns to core numbers."
  }
}

Make each section comprehensive yet concise. Focus on practical guidance, self-awareness, and empowering insights. Write in a warm, insightful tone.`;
}

function mapNumerologyParsed(
  parsed: Record<string, unknown>,
  numerologyData: ComprehensiveNumerologyRequest['numerologyData'],
): ComprehensiveAnalysis {
  const lifePath = numerologyData.lifePathNumber || 0;
  const expression = numerologyData.expressionNumber || numerologyData.destinyNumber || 0;
  const soulUrge = numerologyData.soulUrgeNumber || 0;
  const personality = numerologyData.personalityNumber || 0;
  const destiny = numerologyData.destinyNumber || 0;

  return {
    profileOverview:
      String(parsed.profileOverview ?? '') ||
      `Your numerology profile reveals a Life Path ${lifePath}, Expression ${expression}, and Soul Urge ${soulUrge}, creating a unique numerological signature.`,
    coreNumbersAnalysis: (parsed.coreNumbersAnalysis as ComprehensiveAnalysis['coreNumbersAnalysis']) || [
      { number: 'Life Path', value: lifePath, analysis: `Life Path ${lifePath} reveals your life's purpose and lessons.` },
      { number: 'Expression', value: expression, analysis: `Expression ${expression} shows your natural talents and abilities.` },
      { number: 'Soul Urge', value: soulUrge, analysis: `Soul Urge ${soulUrge} reveals your inner desires and motivations.` },
      { number: 'Personality', value: personality, analysis: `Personality ${personality} shows how others perceive you.` },
      { number: 'Destiny', value: destiny, analysis: `Destiny ${destiny} indicates your ultimate life purpose.` },
    ],
    lifePathAnalysis:
      String(parsed.lifePathAnalysis ?? '') || `Life Path ${lifePath} guides your life's journey and purpose.`,
    expressionAnalysis:
      String(parsed.expressionAnalysis ?? '') ||
      `Expression ${expression} reveals your natural talents and how you express yourself.`,
    soulUrgeAnalysis:
      String(parsed.soulUrgeAnalysis ?? '') || `Soul Urge ${soulUrge} shows what truly motivates you from within.`,
    personalityAnalysis:
      String(parsed.personalityAnalysis ?? '') ||
      `Personality ${personality} influences how others see and interact with you.`,
    destinyAnalysis:
      String(parsed.destinyAnalysis ?? '') || `Destiny ${destiny} points toward your ultimate life purpose.`,
    personalYearAnalysis:
      String(parsed.personalYearAnalysis ?? '') ||
      'Your current Personal Year brings specific themes and opportunities.',
    challengesAndOpportunities: (parsed.challengesAndOpportunities as ComprehensiveAnalysis['challengesAndOpportunities']) || {
      challenges: [],
      opportunities: [],
    },
    predictiveInsights: (parsed.predictiveInsights as ComprehensiveAnalysis['predictiveInsights']) || {
      todaysQuickWin: 'Focus on aligning with your numerology profile today.',
      currentWeek: 'This week brings opportunities related to your core numbers.',
      currentMonth: 'This month aligns with your numerology cycles.',
      currentYear: 'This year offers growth aligned with your numerology profile.',
      nextYearSneakPeek: 'Next year will bring new cycles and opportunities.',
      longerTermCycles: 'Your numerology profile reveals longer-term patterns and cycles.',
    },
  };
}

function parseGroqResponse(
  response: GroqStructuredParseInput,
  numerologyData: ComprehensiveNumerologyRequest['numerologyData'],
): ComprehensiveAnalysis {
  devLog.debug('🔍 Parsing Groq response for numerology', undefined, 'numerology');

  if (isGroqParsedRecord(response)) {
    return mapNumerologyParsed(response, numerologyData);
  }

  const trimmed = response.trim();
  if (!trimmed) {
    return mapNumerologyParsed({}, numerologyData);
  }

  const structured = parseStructuredJsonFromResponse(trimmed);
  if (structured.ok && structured.data) {
    return mapNumerologyParsed(structured.data, numerologyData);
  }

  devWarn('Error parsing Groq response, using numerology fallback', structured.failureMode, 'numerology');
  return mapNumerologyParsed({}, numerologyData);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, numerologyData, userProfile }: ComprehensiveNumerologyRequest = await request.json();

    if (!userId || !numerologyData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId or numerologyData'
      }, { status: 400 });
    }

    devLog.info('🔮 Comprehensive Numerology API: Generating report for user:', userId, 'numerology');

    try {
      const cached = await readNumerologyComprehensiveCache(userId);
      if (cached) {
        devLog.info('✅ Returning cached comprehensive Numerology report for user:', userId, 'numerology');
        return NextResponse.json({
          success: true,
          data: { comprehensiveAnalysis: cached, timestamp: Date.now() },
        });
      }
    } catch (cacheError: unknown) {
      devWarn('⚠️ Error checking cache, proceeding with generation:', cacheError, 'numerology');
    }

    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      devWarn('⚠️ GROQ_API_KEY not configured, using fallback', undefined, 'numerology');
      // Return fallback response
      const fallbackAnalysis = parseGroqResponse('', numerologyData);
      return NextResponse.json({
        success: true,
        data: {
          comprehensiveAnalysis: fallbackAnalysis,
          timestamp: Date.now()
        }
      });
    }

    // Build comprehensive prompt
    const prompt = buildGroqPrompt(numerologyData, userProfile);

    devLog.info('🤖 Calling AI for comprehensive Numerology analysis...', undefined, 'numerology');

    const resolved = await resolveAiReportWithFallback({
      label: 'numerology-comprehensive',
      userId,
      tryLlm: async () => {
        const structured = await callStructuredAI({
          label: 'numerology-comprehensive',
          model: GROQ_DEFAULT_TEXT_MODEL,
          userId,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert Chaldean Numerologist specializing in the ancient Babylonian number system. Provide comprehensive, insightful, and practical guidance. Always respond with valid JSON when requested.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.75,
          maxTokens: 3500,
          responseFormat: { type: 'json_object' },
          maxAttempts: 3,
        });

        if (!structured.ok && structured.failureMode !== 'none') {
          devWarn(
            `numerology-comprehensive structured AI: ${structured.failureMode} after ${structured.attempts} attempt(s)`,
            undefined,
            'numerology',
          );
        }

        if (structured.ok && structured.raw) {
          return {
            data: mapNumerologyParsed(structured.raw, numerologyData),
            attempts: structured.attempts,
            failureMode: 'none',
          };
        }
        const recovered = structured.lastRaw
          ? parseStructuredJsonFromResponse(structured.lastRaw)
          : null;
        if (recovered?.ok && recovered.data) {
          return {
            data: mapNumerologyParsed(recovered.data, numerologyData),
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
      readFirestoreCache: () => readNumerologyComprehensiveCache(userId, { allowStale: true }),
      buildDeterministic: () => parseGroqResponse('', numerologyData),
    });

    const comprehensiveAnalysis = resolved.data;

    if (resolved.degraded && resolved.source !== 'llm') {
      devWarn(
        `⚠️ Numerology comprehensive degraded (${resolved.source}) — not caching fresh LLM output`,
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
              : 'Failed to parse AI response, using numerology defaults',
        },
      });
    }

    const responseData: ComprehensiveNumerologyResponse['data'] = {
      comprehensiveAnalysis,
      timestamp: Date.now(),
    };

    try {
      await setCachedDoc(['users', userId, 'numerologyReports'], 'comprehensive', {
        data: responseData,
        timestamp: Date.now(),
        schemaVersion: COMPREHENSIVE_REPORT_SCHEMA_VERSION,
      });
      devLog.info('✅ Cached comprehensive Numerology report in Firebase', undefined, 'numerology');
    } catch (cacheError: unknown) {
      devWarn('⚠️ Error caching report:', cacheError, 'numerology');
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error: any) {
    devLog.error('❌ Comprehensive Numerology API error:', error, 'route');
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate comprehensive Numerology analysis'
    }, { status: 500 });
  }
}

