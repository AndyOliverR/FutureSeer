import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';

const SCRYING_REFUSAL_DATA = 'Scrying report is required. Generate your mystical profile to unlock your Scrying report, then ask again.';

function buildScryingContext(report: Record<string, unknown>): string {
  const parts: string[] = [];
  if (report.sessionOverview) parts.push(`Session: ${report.sessionOverview}`);
  if (report.dominantSymbolThemes?.length) {
    parts.push(`Dominant themes: ${(report.dominantSymbolThemes as string[]).join(', ')}`);
  }
  if (report.elementalBalanceSummary) parts.push(report.elementalBalanceSummary);
  if (report.archetypalEnergyPattern) {
    parts.push(`Archetypal pattern: ${report.archetypalEnergyPattern}`);
  }
  if (report.strategicGuidance) parts.push(`Guidance: ${report.strategicGuidance}`);
  const session = report.scrying_session as Record<string, unknown> | undefined;
  if (session?.interpretation?.summary) {
    parts.push(`Interpretation: ${(session.interpretation as { summary?: string }).summary}`);
  }
  if (report.riskIndicators?.length) {
    parts.push(`Risks: ${(report.riskIndicators as string[]).join(' ')}`);
  }
  if (report.opportunityIndicators?.length) {
    parts.push(`Opportunities: ${(report.opportunityIndicators as string[]).join(' ')}`);
  }
  return parts.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, userProfile, userId } = body;
    let scryingReport = body.scryingReport ?? body.scrying;
    if (!scryingReport && body.comprehensiveProfile) {
      scryingReport = body.comprehensiveProfile.scrying ?? body.comprehensiveProfile.toolReports?.scrying?.data;
    }

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const reportData = scryingReport?.data ?? scryingReport;
    if (!reportData || typeof reportData !== 'object') {
      return NextResponse.json({ error: SCRYING_REFUSAL_DATA }, { status: 400 });
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

    return new Response(
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
              new TextEncoder().encode('I encountered an error. Please try again.')
            );
          } finally {
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
}
