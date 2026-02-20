import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';

interface AskMundaneSeerRequest {
  userId: string;
  question: string;
  mundaneReport?: Record<string, unknown> | null;
}

function formatMundaneReportContext(report: Record<string, unknown> | undefined): string {
  if (!report || typeof report !== 'object') return '';
  const lines: string[] = [];
  lines.push(`Country: ${report.countryName ?? '—'}`);
  lines.push(`Capital: ${report.capitalName ?? '—'}`);
  lines.push(`Year: ${report.year ?? '—'}`);
  if (report.ingressDatetime) lines.push(`Aries Ingress: ${report.ingressDatetime}`);
  if (report.chartSummary) lines.push(`Chart summary: ${report.chartSummary}`);

  const bands = (report.riskBands ?? (report.riskScores as Record<string, unknown>)?.bands) as Record<string, string> | undefined;
  if (bands && typeof bands === 'object') {
    lines.push(`Risk bands: Economic ${bands.economic ?? '—'}, Political stability ${bands.political ?? '—'}, Conflict risk ${bands.conflict ?? '—'}`);
  }
  const vol = (report.riskScores as Record<string, unknown>)?.geopoliticalVolatilityScore;
  if (vol != null) lines.push(`Geopolitical Volatility Score: ${vol}/100`);

  const sec = report.sections as Record<string, string> | undefined;
  if (sec && typeof sec === 'object') {
    if (sec.executiveOverview) lines.push(`Executive overview: ${sec.executiveOverview}`);
    if (sec.governmentStability) lines.push(`Government stability: ${sec.governmentStability}`);
    if (sec.economicPressure) lines.push(`Economic pressure: ${sec.economicPressure}`);
    if (sec.foreignRelationsAndConflictRisk) lines.push(`Foreign relations & conflict risk: ${sec.foreignRelationsAndConflictRisk}`);
    if (sec.socialUnrestIndicators) lines.push(`Social unrest: ${sec.socialUnrestIndicators}`);
    if (sec.legislativeAndInstitutionalHealth) lines.push(`Legislative health: ${sec.legislativeAndInstitutionalHealth}`);
    if (sec.twelveMonthForecast) lines.push(`12-month forecast: ${sec.twelveMonthForecast}`);
    if (sec.fiveYearStructuralOutlook) lines.push(`5-year outlook: ${sec.fiveYearStructuralOutlook}`);
  }
  return lines.join('\n\n');
}

function buildMundaneSeerSystemPrompt(reportContext: string): string {
  return `You are an expert in Mundane (political/national) Astrology. You answer only from the user's Mundane Astrology report context below. Use risk-band and probabilistic language. Do not make deterministic predictions or political persuasion. Frame as cyclical geopolitical modeling for reflection only.

Report context:
${reportContext}

Instructions: Answer the user's question using only the report data above. If the question cannot be answered from this report, say so briefly. Keep answers concise (2–4 short paragraphs). Use terms like "risk band," "elevated/moderate/low," and "cyclical context."`;
}

export async function POST(request: NextRequest) {
  try {
    const body: AskMundaneSeerRequest = await request.json();
    const { userId, question, mundaneReport } = body;

    if (!userId || !question?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId or question' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reportData =
      mundaneReport &&
      typeof mundaneReport === 'object' &&
      'comprehensiveAnalysis' in mundaneReport
        ? (mundaneReport as { comprehensiveAnalysis?: Record<string, unknown> }).comprehensiveAnalysis
        : mundaneReport;

    const reportContext = formatMundaneReportContext(
      (reportData as Record<string, unknown>) ?? undefined
    );

    if (!reportContext.trim()) {
      return NextResponse.json(
        { success: false, error: 'No Mundane Astrology report available. Generate your mystical profile first.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = buildMundaneSeerSystemPrompt(reportContext);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.5,
      maxTokens: 800,
    });

    return new Response(
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
            devLog.error('Mundane Seer stream error:', error, 'route');
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
  } catch (error) {
    devLog.error('Ask Mundane Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
