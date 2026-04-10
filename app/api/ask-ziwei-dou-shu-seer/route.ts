/**
 * POST /api/ask-ziwei-dou-shu-seer
 * Streaming Q&A: Zi Wei Dou Shu expert answers questions using the user's report.
 */

import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import { buildZiWeiSeerSystemPrompt } from '@/lib/ziweiSeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-ziwei-dou-shu-seer';

function stampText(text: string): string {
  return appendAttribution(text, { markerFamily: SEER_MARKER_FAMILY });
}

function withRobotsResponse(body?: BodyInit | null, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return new Response(body ?? null, { ...init, headers });
}

function jsonWithRobots(body: unknown, init?: ResponseInit): Response {
  const response = NextResponse.json(body, init);
  response.headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return response;
}

function appendAttributionTail(controller: ReadableStreamDefaultController<Uint8Array>): void {
  controller.enqueue(new TextEncoder().encode(stampText('')));
}

interface AskZiWeiDouShuSeerRequest {
  userId: string;
  question: string;
  userProfile: unknown;
  ziweiReport?: Record<string, unknown>;
  sessionId?: string;
}

function formatZiWeiReportContext(report: Record<string, unknown> | undefined): string {
  if (!report || typeof report !== 'object') return '';
  const lines: string[] = [];
  if (report.executiveSummary) lines.push(`Executive summary: ${report.executiveSummary}`);
  if (report.lifePalace) lines.push(`Life Palace (命宮): ${report.lifePalace}`);
  if (report.wealth) lines.push(`Wealth (財帛宮): ${report.wealth}`);
  if (report.career) lines.push(`Career (官祿宮): ${report.career}`);
  if (report.relationships) lines.push(`Relationships (夫妻宮): ${report.relationships}`);
  if (report.health) lines.push(`Health (疾厄宮): ${report.health}`);
  if (report.tenYearLuck) lines.push(`10-year luck (大限): ${report.tenYearLuck}`);
  if (report.currentThreeYearOutlook) lines.push(`Current 3-year outlook (流年): ${report.currentThreeYearOutlook}`);
  const chart = report.chartData as Record<string, unknown> | undefined;
  if (chart?.solarDate) lines.push(`Chart: ${chart.solarDate}, ${chart.time ?? ''}, ${chart.fiveElementsClass ?? ''}; Life in ${chart.earthlyBranchOfSoulPalace ?? ''}, Body in ${chart.earthlyBranchOfBodyPalace ?? ''}.`);
  return lines.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body: AskZiWeiDouShuSeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_ziwei_dou_shu_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, userProfile, ziweiReport } = body;

    if (!userId || !question?.trim() || !userProfile) {
      return jsonWithRobots(
        {
          success: false,
          error: 'Missing required parameters: userId, question, or userProfile',
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reportContext = formatZiWeiReportContext(ziweiReport);
    const systemPrompt = buildZiWeiSeerSystemPrompt(reportContext);

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
            devLog.error('Zi Wei Dou Shu Seer stream error:', error, 'route');
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
    devLog.error('Ask Zi Wei Dou Shu Seer API error:', error, 'route');
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
