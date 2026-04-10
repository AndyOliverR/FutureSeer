import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-scrying-seer';

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


const SCRYING_REFUSAL_DATA = 'Scrying report is required. Generate your mystical profile to unlock your Scrying report, then ask again.';

function buildScryingContext(report: Record<string, unknown>): string {
  const parts: string[] = [];
  if (report.sessionOverview) parts.push(`Session: ${report.sessionOverview}`);
  if (Array.isArray(report.dominantSymbolThemes) && report.dominantSymbolThemes.length) {
    parts.push(`Dominant themes: ${report.dominantSymbolThemes.join(', ')}`);
  }
  if (report.elementalBalanceSummary) parts.push(String(report.elementalBalanceSummary));
  if (report.archetypalEnergyPattern) {
    parts.push(`Archetypal pattern: ${report.archetypalEnergyPattern}`);
  }
  if (report.strategicGuidance) parts.push(`Guidance: ${report.strategicGuidance}`);
  const session = report.scrying_session as Record<string, unknown> | undefined;
  const interpretation = session?.interpretation as { summary?: string } | undefined;
  if (interpretation?.summary) {
    parts.push(`Interpretation: ${interpretation.summary}`);
  }
  if (Array.isArray(report.riskIndicators) && report.riskIndicators.length) {
    parts.push(`Risks: ${report.riskIndicators.join(' ')}`);
  }
  if (Array.isArray(report.opportunityIndicators) && report.opportunityIndicators.length) {
    parts.push(`Opportunities: ${report.opportunityIndicators.join(' ')}`);
  }
  return parts.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_scrying_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { question } = body;
    let scryingReport = body.scryingReport ?? body.scrying;
    if (!scryingReport && body.comprehensiveProfile) {
      scryingReport = body.comprehensiveProfile.scrying ?? body.comprehensiveProfile.toolReports?.scrying?.data;
    }

    if (!question?.trim()) {
      return jsonWithRobots({ error: 'Question is required' }, { status: 400 });
    }

    const reportData = scryingReport?.data ?? scryingReport;
    if (!reportData || typeof reportData !== 'object') {
      return jsonWithRobots({ error: SCRYING_REFUSAL_DATA }, { status: 400 });
    }

    const context = buildScryingContext(reportData as Record<string, unknown>);
    const systemPrompt = `You are the Scrying Seer — an expert in crystal, mirror, water, and fire divination and symbolic interpretation. You answer the user's questions using ONLY the following scrying report context. Stay grounded in the symbols, themes, and guidance below. Do not invent new symbols or predictions. Frame answers as symbolic introspection and inner-signal reflection, not deterministic prediction. Do not give medical, legal, or financial advice.

Scrying report context:
${context}

Answer the user's question in 2–4 short paragraphs, referencing the report where relevant. Keep a calm, reflective tone.`;

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
              if (content) controller.enqueue(new TextEncoder().encode(content));
            }
          } catch (error) {
            devLog.error('Error during Scrying seer streaming:', error, 'route');
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
  } catch (error: unknown) {
    devLog.error('Scrying Seer API error:', error, 'route');
    return jsonWithRobots(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
}
