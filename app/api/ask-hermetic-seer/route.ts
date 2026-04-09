import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import { buildHermeticSeerSystemPrompt } from '@/lib/hermeticSeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-hermetic-seer';

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


interface AskHermeticSeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  westernChartData?: any;
  hermeticReport?: Record<string, unknown>;
  sessionId?: string;
}

function formatHermeticReportContext(report: Record<string, unknown> | undefined): string {
  if (!report || typeof report !== 'object') return '';
  const lines: string[] = [];
  if (report.dominant_element) lines.push(`Dominant element: ${report.dominant_element}`);
  if (report.elemental_imbalance) lines.push(`Elemental imbalance: ${report.elemental_imbalance}`);
  if (report.polarity_balance) lines.push(`Polarity balance: ${report.polarity_balance}`);
  if (report.archetypal_theme) lines.push(`Archetypal theme: ${report.archetypal_theme}`);
  if (report.planetary_dynamics && typeof report.planetary_dynamics === 'object' && !Array.isArray(report.planetary_dynamics)) {
    const dyn = report.planetary_dynamics as Record<string, string>;
    const dynEntries = Object.entries(dyn).map(([k, v]) => `${k}: ${v}`);
    if (dynEntries.length) lines.push(`Planetary dynamics: ${dynEntries.join('; ')}`);
  }
  if (report.alchemical_lesson) lines.push(`Alchemical lesson: ${report.alchemical_lesson}`);
  if (report.integration_guidance) lines.push(`Integration guidance: ${report.integration_guidance}`);
  return lines.join('\n');
}

function formatChartSummary(chartData: any): string {
  if (!chartData?.planets?.length) return '';
  const sun = chartData.planets.find((p: any) => p.name?.toLowerCase() === 'sun');
  const moon = chartData.planets.find((p: any) => p.name?.toLowerCase() === 'moon');
  const rising = chartData.houses?.[0] || chartData.houses?.find((h: any) => (h.number || 1) === 1);
  const parts: string[] = [];
  if (sun) parts.push(`Sun: ${sun.sign?.signName || sun.sign} in House ${sun.house}`);
  if (moon) parts.push(`Moon: ${moon.sign?.signName || moon.sign} in House ${moon.house}`);
  if (rising) parts.push(`Rising: ${rising.sign?.signName || rising.sign}`);
  return parts.join('; ');
}

export async function POST(request: NextRequest) {
  try {
    const body: AskHermeticSeerRequest = await request.json();
    const { userId, question, userProfile, westernChartData, hermeticReport } = body;

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
      hermeticReport && typeof hermeticReport === 'object' && 'comprehensiveAnalysis' in hermeticReport
        ? (hermeticReport as { comprehensiveAnalysis?: Record<string, unknown> }).comprehensiveAnalysis
        : hermeticReport;
    const reportContext = formatHermeticReportContext(
      (reportData as Record<string, unknown>) ?? undefined
    );
    const chartSummary = formatChartSummary(westernChartData);
    const systemPrompt = buildHermeticSeerSystemPrompt(reportContext, chartSummary);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.6,
      maxTokens: 800,
    });

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content ?? '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (error) {
            devLog.error('Hermetic Seer stream error:', error, 'route');
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
    devLog.error('Ask Hermetic Seer API error:', error, 'route');
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
