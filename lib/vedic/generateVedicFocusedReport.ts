import { resolveAiReportWithFallback } from '@/lib/aiFallbackRouter';
import { callStructuredAI } from '@/lib/aiStructuredOutput';
import { parseStructuredJsonFromResponse } from '@/lib/aiStructuredOutputParse';
import { devLog, devWarn } from '@/lib/devLogger';
import { getVedicReading } from '@/lib/vedicIntelligence';
import type { ChartDataInput } from '@/lib/vedic/vedicChartContext';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';
import {
  getCoordinatesWithFallback,
  setVedicReportDoc,
  type VedicBirthProfile,
} from '@/lib/vedic/vedicReportFirestore';

function isRateLimitedError(error: unknown): boolean {
  const maybeErr = error as { status?: number; statusCode?: number; code?: string; message?: string };
  const status = maybeErr?.status ?? maybeErr?.statusCode;
  if (status === 429) return true;
  if (maybeErr?.code === 'AI_RATE_LIMITED' || maybeErr?.code === 'rate_limit_exceeded') return true;
  const message = String(maybeErr?.message ?? '').toLowerCase();
  return message.includes('rate limit') || message.includes('currently busy');
}

export type FocusedReportKind = 'career' | 'relationships';

export async function generateVedicFocusedReport<T>(opts: {
  kind: FocusedReportKind;
  label: string;
  cacheDocId: string;
  schemaVersion: string;
  userId: string;
  userProfile: VedicBirthProfile;
  vedicChartData?: ChartDataInput;
  buildPrompt: (chart: ChartDataInput, profile?: VedicBirthProfile) => string;
  mapParsed: (parsed: Record<string, unknown>) => T;
  buildDeterministic: () => T;
  analysisKey: 'careerAnalysis' | 'relationshipAnalysis';
  readCache: (
    userId: string,
    profile: VedicBirthProfile,
    options?: { allowStale?: boolean },
  ) => Promise<T | null>;
}): Promise<{ analysis: T; source: string; cached: boolean }> {
  const {
    kind,
    label,
    cacheDocId,
    schemaVersion,
    userId,
    userProfile,
    vedicChartData,
    buildPrompt,
    mapParsed,
    buildDeterministic,
    analysisKey,
    readCache,
  } = opts;

  const cached = await readCache(userId, userProfile);
  if (cached) {
    return { analysis: cached, source: 'cache', cached: true };
  }

  const coords = await getCoordinatesWithFallback(userProfile.birthPlace || '');
  const vedicReading = await getVedicReading(
    userId,
    userProfile.birthDate!,
    userProfile.birthTime!,
    userProfile.birthPlace!,
    coords.latitude,
    coords.longitude,
  );

  const chartData = (vedicReading?.chartData || vedicChartData || {}) as ChartDataInput;
  const prompt = buildPrompt(chartData, userProfile);

  devLog.info(`🤖 Calling AI for Vedic ${kind} report...`, undefined, 'vedic');

  const resolved = await resolveAiReportWithFallback({
    label,
    userId,
    tryLlm: async () => {
      try {
        const structured = await callStructuredAI({
          label,
          userId,
          messages: [
            {
              role: 'system',
              content: `You are an expert Vedic astrologer. Respond with valid JSON only for the ${kind} report.`,
            },
            { role: 'user', content: prompt },
          ],
          model: GROQ_DEFAULT_TEXT_MODEL,
          temperature: 0.65,
          maxTokens: 4500,
          responseFormat: { type: 'json_object' },
          maxAttempts: 3,
        });

        if (structured.ok && structured.raw) {
          return { data: mapParsed(structured.raw), attempts: structured.attempts, failureMode: 'none' as const };
        }
        const recovered = structured.lastRaw
          ? parseStructuredJsonFromResponse(structured.lastRaw)
          : null;
        if (recovered?.ok && recovered.data) {
          return {
            data: mapParsed(recovered.data),
            attempts: structured.attempts,
            failureMode: structured.failureMode,
          };
        }
        return {
          data: null,
          attempts: structured.attempts,
          failureMode: structured.failureMode,
        };
      } catch (aiError) {
        if (!isRateLimitedError(aiError)) throw aiError;
        devWarn(`⚠️ Vedic ${kind} AI rate-limited`, aiError, 'vedic');
        return { data: null, attempts: 0, failureMode: 'provider_error' as const };
      }
    },
    readFirestoreCache: () => readCache(userId, userProfile, { allowStale: true }),
    buildDeterministic,
  });

  if (!resolved.data) {
    throw new Error(`Failed to generate Vedic ${kind} report`);
  }

  const analysis = resolved.data;

  if (resolved.source === 'llm') {
    await setVedicReportDoc(['users', userId, 'mysticalProfile'], cacheDocId, {
      schemaVersion,
      birthDate: userProfile.birthDate,
      birthTime: userProfile.birthTime,
      birthPlace: userProfile.birthPlace,
      [analysisKey]: analysis,
      timestamp: Date.now(),
    });
  }

  return { analysis, source: resolved.source, cached: false };
}
