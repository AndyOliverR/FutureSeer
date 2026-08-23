import { resolveAiReportWithFallback } from '@/lib/aiFallbackRouter';
import { callStructuredAI } from '@/lib/aiStructuredOutput';
import { parseStructuredJsonFromResponse } from '@/lib/aiStructuredOutputParse';
import { calculateLifePathNumber, calculateDestinyNumber } from '@/lib/numerologyCalculations';
import { userSubdocGet, userSubdocSet } from '@/lib/userSubcollectionFirestore';
import { devLog } from '@/lib/devLogger';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

export interface AstroNumerologyAnalysisData {
  sunSign: string;
  lifePathNumber: number;
  nameNumber: number;
  comprehensiveAnalysis: AstroNumerologyComprehensiveAnalysis;
  timestamp: number;
}

export interface AstroNumerologyComprehensiveAnalysis {
  personalitySynthesis: string;
  careerGuidance: string;
  relationshipInsights: string;
  lifePurpose: string;
  personalGrowth: string;
  challenges: string[];
  opportunities: string[];
  yearlyForecast: string;
}

export type GenerateAstroNumerologyResult =
  | { ok: true; data: AstroNumerologyAnalysisData }
  | { ok: false; error: string; status: number };

function buildGroqPrompt(
  sunSign: string,
  lifePathNumber: number,
  nameNumber: number,
  birthDate: string,
  fullName: string,
): string {
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

function extractAstroNumerologyAnalysisFromCache(
  cachedData: Record<string, unknown>,
): AstroNumerologyComprehensiveAnalysis | null {
  const nested = cachedData.data as AstroNumerologyAnalysisData | undefined;
  const analysis = nested?.comprehensiveAnalysis ?? (cachedData as Partial<AstroNumerologyAnalysisData>).comprehensiveAnalysis;
  if (!analysis?.personalitySynthesis?.trim()) return null;
  return analysis;
}

async function readAstroNumerologyCache(
  userId: string,
  birthDataKey: string,
  options?: { allowStale?: boolean },
): Promise<AstroNumerologyComprehensiveAnalysis | null> {
  try {
    const cachedData = await userSubdocGet(userId, 'astroNumerologyReports', 'current');
    if (!cachedData) return null;
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

export async function generateAstroNumerologyAnalysis(params: {
  userId: string;
  birthDate: string;
  fullName: string;
  sunSign?: string;
  useCache?: boolean;
}): Promise<GenerateAstroNumerologyResult> {
  const { userId, birthDate, fullName, useCache = true } = params;
  if (!userId || !birthDate || !fullName) {
    return { ok: false, error: 'Missing required parameters: userId, birthDate, or fullName', status: 400 };
  }

  const lifePathNumber = calculateLifePathNumber(birthDate);
  const nameNumber = calculateDestinyNumber(fullName);
  const actualSunSign = params.sunSign || 'Unknown';

  if (actualSunSign === 'Unknown') {
    return {
      ok: false,
      error: 'Sun sign is required. Please ensure Western astrology chart data is available.',
      status: 400,
    };
  }

  const birthDataKey = `${birthDate}_${fullName}_${actualSunSign}`;

  if (useCache) {
    try {
      const cached = await readAstroNumerologyCache(userId, birthDataKey);
      if (cached) {
        return {
          ok: true,
          data: {
            sunSign: actualSunSign,
            lifePathNumber,
            nameNumber,
            comprehensiveAnalysis: cached,
            timestamp: Date.now(),
          },
        };
      }
    } catch (cacheError: unknown) {
      devLog.warn('⚠️ Error checking cache, proceeding with generation:', cacheError, 'astro-numerology');
    }
  }

  if (!process.env.GROQ_API_KEY) {
    return {
      ok: true,
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
    };
  }

  const prompt = buildGroqPrompt(actualSunSign, lifePathNumber, nameNumber, birthDate, fullName);

  const resolved = await resolveAiReportWithFallback({
    label: 'astro-numerology-comprehensive',
    userId,
    tryLlm: async () => {
      const structured = await callStructuredAI({
        label: 'astro-numerology-comprehensive',
        model: GROQ_DEFAULT_TEXT_MODEL,
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
          failureMode: 'none' as const,
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
      useCache ? readAstroNumerologyCache(userId, birthDataKey, { allowStale: true }) : Promise.resolve(null),
    buildDeterministic: () =>
      buildDeterministicAstroNumerology(actualSunSign, lifePathNumber, nameNumber),
  });

  const responseData: AstroNumerologyAnalysisData = {
    sunSign: actualSunSign,
    lifePathNumber,
    nameNumber,
    comprehensiveAnalysis: resolved.data,
    timestamp: Date.now(),
  };

  if (useCache && !(resolved.degraded && resolved.source !== 'llm')) {
    try {
      await userSubdocSet(userId, 'astroNumerologyReports', 'current', {
        data: responseData,
        birthDataKey,
        timestamp: Date.now(),
      });
    } catch (cacheError: unknown) {
      devLog.warn('⚠️ Error caching report:', cacheError, 'astro-numerology');
    }
  }

  return { ok: true, data: responseData };
}
