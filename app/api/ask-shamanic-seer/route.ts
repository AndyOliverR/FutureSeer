import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { callTextStream } from '@/lib/aiStructuredOutput';
import { cacheToolSeerAnswer } from '@/lib/toolSeerQuestionCache';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder'
import { historyFromSeerBody } from '@/lib/seerChatVoice';
import { chartSignLabel } from '@/lib/chartSignLabel';
import { buildShamanicSeerSystemPrompt } from '@/lib/shamanicSeerPrompts';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-shamanic-seer';

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


interface AskShamanicSeerRequest {
  userId: string;
  question: string;
  userProfile: Record<string, unknown>;
  westernChartData?: {
    planets?: Array<{ name?: string; sign?: { signName?: string } | string; house?: number }>;
    houses?: Array<{ number?: number; sign?: { signName?: string } | string }>;
  };
  shamanicReport?: Record<string, unknown> | { comprehensiveAnalysis?: Record<string, unknown> };
  sessionId?: string;
}

function formatShamanicReportContext(report: Record<string, unknown> | undefined): string {
  if (!report || typeof report !== 'object') return '';
  const lines: string[] = [];
  if (report.life_cycle_phase) lines.push(`Life cycle phase: ${report.life_cycle_phase}`);
  if (report.archetypal_theme) lines.push(`Archetypal theme: ${report.archetypal_theme}`);
  if (report.shadow_pattern) lines.push(`Shadow pattern: ${report.shadow_pattern}`);
  if (report.power_dynamic) lines.push(`Power dynamic: ${report.power_dynamic}`);
  if (report.spiritual_threshold) lines.push(`Spiritual threshold: ${report.spiritual_threshold}`);
  if (report.integration_path) lines.push(`Integration path: ${report.integration_path}`);
  return lines.join('\n');
}

function formatChartSummary(chartData: AskShamanicSeerRequest['westernChartData']): string {
  if (!chartData?.planets?.length) return '';
  const sun = chartData.planets.find((p) => p.name?.toLowerCase() === 'sun');
  const moon = chartData.planets.find((p) => p.name?.toLowerCase() === 'moon');
  const rising = chartData.houses?.[0] || chartData.houses?.find((h) => (h.number || 1) === 1);
  const parts: string[] = [];
  if (sun) parts.push(`Sun: ${chartSignLabel(sun.sign)} in House ${sun.house}`);
  if (moon) parts.push(`Moon: ${chartSignLabel(moon.sign)} in House ${moon.house}`);
  if (rising) parts.push(`Rising: ${chartSignLabel(rising.sign)}`);
  return parts.join('; ');
}

export async function POST(request: NextRequest) {
  try {
    const body: AskShamanicSeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_shamanic_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, userProfile, westernChartData, shamanicReport } = body;

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
      shamanicReport && typeof shamanicReport === 'object' && 'comprehensiveAnalysis' in shamanicReport
        ? (shamanicReport as { comprehensiveAnalysis?: Record<string, unknown> }).comprehensiveAnalysis
        : shamanicReport as Record<string, unknown> | undefined;
    const reportContext = formatShamanicReportContext(reportData ?? undefined);
    const chartSummary = formatChartSummary(westernChartData);
    const systemPrompt = buildShamanicSeerSystemPrompt(reportContext, chartSummary);

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: question.trim(),
      history: historyFromSeerBody(body),
    });

    const { stream } = await callTextStream({ label: 'ask-shamanic-seer', model: GROQ_DEFAULT_TEXT_MODEL,
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
              await cacheToolSeerAnswer('ask-shamanic-seer', userId, question, fullResponse);
            }
          } catch (error) {
            devLog.error('Shamanic Seer stream error:', error, 'route');
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
    devLog.error('Ask Shamanic Seer API error:', error, 'route');
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
