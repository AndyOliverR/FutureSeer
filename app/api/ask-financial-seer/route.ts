import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { chartSignLabel } from '@/lib/chartSignLabel';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder'
import { historyFromSeerBody } from '@/lib/seerChatVoice';
import { buildFinancialSeerSystemPrompt } from '@/lib/financialAstrology/financialAstrologyPrompts';
import { fetchMarketSnapshot, formatMarketSnapshotForPrompt } from '@/lib/financialAstrology/marketDataService';
import { getCurrentAstroMarketSummary } from '@/lib/financialAstrology/astroMarketCorrelation';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-financial-seer';

function stampText(text: string): string {
  return appendAttribution(text, { markerFamily: SEER_MARKER_FAMILY });
}

function stampAnswerFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stampAnswerFields);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if ((k === 'answer' || k === 'response' || k === 'reply') && typeof v === 'string') {
        out[k] = stampText(v);
      } else {
        out[k] = stampAnswerFields(v);
      }
    }
    return out;
  }
  return value;
}

function jsonWithRobots(body: unknown, init?: ResponseInit): Response {
  const response = NextResponse.json(stampAnswerFields(body), init);
  response.headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return response;
}

function appendAttributionTail(controller: ReadableStreamDefaultController<Uint8Array>): void {
  controller.enqueue(new TextEncoder().encode(stampText('')));
}

function withRobotsResponse(body?: BodyInit | null, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return new Response(body ?? null, { ...init, headers });
}


interface AskFinancialSeerRequest {
  userId: string;
  question: string;
  userProfile: Record<string, unknown>;
  westernChartData?: {
    planets?: Array<{ name?: string; sign?: { signName?: string } | string; house?: number }>;
    houses?: Array<{ number?: number; sign?: { signName?: string } | string }>;
  };
  financialReport?: Record<string, unknown>;
  sessionId?: string;
}

function formatFinancialReportContext(report: Record<string, unknown> | undefined): string {
  if (!report || typeof report !== 'object') return '';
  const lines: string[] = [];
  const temp = report.financialTemperamentProfile as Record<string, unknown> | undefined;
  if (temp) {
    lines.push(
      `Income Stability: ${temp.incomeStabilityScore ?? '—'}/100 | Speculative Risk: ${temp.speculativeRiskIndex ?? '—'}/100 | Long-Term Accumulation: ${temp.longTermAccumulationScore ?? '—'}/100`
    );
    if (temp.temperamentSummary) lines.push(`Temperament: ${temp.temperamentSummary}`);
  }
  const align = report.alignmentScore as Record<string, unknown> | undefined;
  if (align) {
    lines.push(
      `Composite Score: ${align.compositeScore ?? '—'}/100 | Action Bias: ${align.actionBias ?? '—'} | Risk Band: ${align.riskBand ?? '—'}`
    );
    if (align.rationale) lines.push(`Rationale: ${align.rationale}`);
  }
  if (report.currentMarketPhase) lines.push(`Current Market Phase: ${report.currentMarketPhase}`);
  const volatility = report.volatilityWindows as Array<{ name: string; description?: string }> | undefined;
  if (Array.isArray(volatility) && volatility.length) {
    lines.push(
      'Volatility Windows: ' + volatility.map((w) => `${w.name}: ${w.description ?? ''}`).join('; ')
    );
  }
  const strategic = report.strategicRecommendations as Record<string, unknown> | undefined;
  if (strategic && Array.isArray(strategic.strategic_recommendations)) {
    lines.push('Recommendations: ' + (strategic.strategic_recommendations as string[]).slice(0, 3).join('; '));
  }
  return lines.join('\n');
}

function formatChartSummary(chartData: AskFinancialSeerRequest['westernChartData']): string {
  if (!chartData?.planets?.length) return '';
  const sun = chartData.planets.find((p) => p.name?.toLowerCase() === 'sun');
  const moon = chartData.planets.find((p) => p.name?.toLowerCase() === 'moon');
  const venus = chartData.planets.find((p) => p.name?.toLowerCase() === 'venus');
  const jupiter = chartData.planets.find((p) => p.name?.toLowerCase() === 'jupiter');
  const saturn = chartData.planets.find((p) => p.name?.toLowerCase() === 'saturn');
  const rising = chartData.houses?.[0] || chartData.houses?.find((h) => (h.number || 1) === 1);
  const parts: string[] = [];
  if (sun) parts.push(`Sun: ${chartSignLabel(sun.sign)} in House ${sun.house}`);
  if (moon) parts.push(`Moon: ${chartSignLabel(moon.sign)} in House ${moon.house}`);
  if (venus) parts.push(`Venus: ${chartSignLabel(venus.sign)} in House ${venus.house}`);
  if (jupiter) parts.push(`Jupiter: ${chartSignLabel(jupiter?.sign)} in House ${jupiter?.house}`);
  if (saturn) parts.push(`Saturn: ${chartSignLabel(saturn?.sign)} in House ${saturn?.house}`);
  if (rising) parts.push(`Rising: ${chartSignLabel(rising.sign)}`);
  return parts.join('; ');
}

export async function POST(request: NextRequest) {
  try {
    const body: AskFinancialSeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_financial_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, userProfile, westernChartData, financialReport } = body;

    if (!userId || !question?.trim() || !userProfile) {
      return jsonWithRobots(
        {
          success: false,
          error: 'Missing required parameters: userId, question, or userProfile',
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reportData =
      financialReport &&
      typeof financialReport === 'object' &&
      'comprehensiveAnalysis' in financialReport
        ? (financialReport as { comprehensiveAnalysis?: Record<string, unknown> })
            .comprehensiveAnalysis
        : financialReport;
    const reportContext = formatFinancialReportContext(
      (reportData as Record<string, unknown>) ?? undefined
    );
    const chartSummary = formatChartSummary(westernChartData);

    let marketSnapshotText = '';
    let astroConditionsText = '';
    try {
      const snapshot = await fetchMarketSnapshot();
      marketSnapshotText = formatMarketSnapshotForPrompt(snapshot);
      astroConditionsText = getCurrentAstroMarketSummary();
    } catch {
      devLog.warn('Failed to fetch market snapshot for Financial Seer — continuing without it', undefined, 'ask-financial-seer');
    }

    const systemPrompt = buildFinancialSeerSystemPrompt(reportContext, chartSummary, marketSnapshotText, astroConditionsText);

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: question.trim(),
      history: historyFromSeerBody(body),
    });

    const { stream } = await callTextStream({ label: 'ask-financial-seer', model: GROQ_DEFAULT_TEXT_MODEL,
      userId,
      cacheQuestion: typeof question === 'string' ? question.trim() : String(question).trim(),
      messages,
      temperature: 0.6,
      maxTokens: 800,
    });

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = '';
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content ?? '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            if (fullResponse.trim()) {
              await cacheToolSeerAnswer('ask-financial-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Financial Seer stream error:', error, 'route');
            controller.enqueue(
              new TextEncoder().encode(stampText('I encountered an error. Please try again.'))
            );
          } finally {
            appendAttributionTail(controller);
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  } catch (error) {
    devLog.error('Ask Financial Seer API error:', error, 'route');
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
