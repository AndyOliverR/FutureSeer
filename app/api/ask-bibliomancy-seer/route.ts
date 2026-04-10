import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-bibliomancy-seer';

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


const BIBLIOMANCY_REFUSAL_DATA =
  'Bibliomancy report is required. Generate your mystical profile to unlock Bibliomancy and use Ask the Seer.';

function buildBibliomancyContext(report: Record<string, unknown>): string {
  const parts: string[] = [];
  const definitions = report.definitions as Record<string, unknown> | undefined;
  if (definitions?.bibliomancyVsSortilege) {
    parts.push(`Definitions: ${definitions.bibliomancyVsSortilege}`);
  }
  if (definitions?.agentByTradition && typeof definitions.agentByTradition === 'object') {
    parts.push(
      `Agent by tradition: ${JSON.stringify(definitions.agentByTradition)}`
    );
  }
  const rituals = report.rituals as Record<string, string> | undefined;
  if (rituals) {
    parts.push(`Rituals: Quran: ${rituals.quran ?? ''}; Hafez: ${rituals.hafez ?? ''}; Bible/Torah: ${rituals.bibleTorah ?? ''}`);
  }
  const interpretations = report.interpretations as Record<string, string> | undefined;
  if (interpretations) {
    parts.push(`Frameworks: ${interpretations.ambiguity ?? ''}; ${interpretations.directVsMetaphor ?? ''}`);
  }
  const crossTraditionSummary = report.crossTraditionSummary as string | undefined;
  if (crossTraditionSummary) parts.push(`Cross-tradition: ${crossTraditionSummary}`);

  const texts = report.texts as Record<string, Record<string, unknown>> | undefined;
  if (texts) {
    for (const [textId, section] of Object.entries(texts)) {
      if (section && typeof section === 'object') {
        parts.push(
          `[${textId}] Citation: ${section.citation ?? ''}. Passage: ${section.passage ?? ''}. ` +
            `Theme: ${section.primaryTheme ?? ''}. Directive: ${section.directive ?? ''}. Polarity: ${section.polarity ?? ''}. ` +
            `Life domain: ${section.lifeDomainInterpretation ?? ''}`
        );
      }
    }
  }
  return parts.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;
    let bibliomancyReport = body.bibliomancyReport ?? body.bibliomancy;
    if (!bibliomancyReport && body.comprehensiveProfile) {
      bibliomancyReport =
        body.comprehensiveProfile.bibliomancy ??
        body.comprehensiveProfile.toolReports?.bibliomancy?.data;
    }

    if (!question?.trim()) {
      return jsonWithRobots({ error: 'Question is required' }, { status: 400 });
    }

    const reportData = bibliomancyReport?.data ?? bibliomancyReport;
    if (!reportData || typeof reportData !== 'object') {
      return jsonWithRobots({ error: BIBLIOMANCY_REFUSAL_DATA }, { status: 400 });
    }

    const context = buildBibliomancyContext(reportData as Record<string, unknown>);
    const systemPrompt = `You are the Bibliomancy Seer — an expert in sacred text divination across the Bible, Quran, Bhagavad Gita, Torah, and the Divan of Hafez. You answer the user's questions using ONLY the following bibliomancy report context. Stay grounded in the selected passages, themes, rituals, and interpretations below. Do not invent new passages or predictions. Frame answers as symbolic reflection and inner guidance, not prophecy or theological authority. Respect all traditions; maintain a neutral, respectful tone. Do not give medical, legal, or financial advice.

Bibliomancy report context:
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
            devLog.error('Error during Bibliomancy seer streaming:', error, 'route');
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
    devLog.error('Bibliomancy Seer API error:', error, 'route');
    return jsonWithRobots(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
}
