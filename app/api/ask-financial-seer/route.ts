import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import { buildFinancialSeerSystemPrompt } from '@/lib/financialAstrology/financialAstrologyPrompts';

interface AskFinancialSeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  westernChartData?: any;
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

function formatChartSummary(chartData: any): string {
  if (!chartData?.planets?.length) return '';
  const sun = chartData.planets.find((p: any) => p.name?.toLowerCase() === 'sun');
  const moon = chartData.planets.find((p: any) => p.name?.toLowerCase() === 'moon');
  const venus = chartData.planets.find((p: any) => p.name?.toLowerCase() === 'venus');
  const jupiter = chartData.planets.find((p: any) => p.name?.toLowerCase() === 'jupiter');
  const saturn = chartData.planets.find((p: any) => p.name?.toLowerCase() === 'saturn');
  const rising = chartData.houses?.[0] || chartData.houses?.find((h: any) => (h.number || 1) === 1);
  const parts: string[] = [];
  if (sun) parts.push(`Sun: ${sun.sign?.signName || sun.sign} in House ${sun.house}`);
  if (moon) parts.push(`Moon: ${moon.sign?.signName || moon.sign} in House ${moon.house}`);
  if (venus) parts.push(`Venus: ${venus.sign?.signName || venus.sign} in House ${venus.house}`);
  if (jupiter) parts.push(`Jupiter: ${jupiter?.sign?.signName || jupiter?.sign} in House ${jupiter?.house}`);
  if (saturn) parts.push(`Saturn: ${saturn?.sign?.signName || saturn?.sign} in House ${saturn?.house}`);
  if (rising) parts.push(`Rising: ${rising.sign?.signName || rising.sign}`);
  return parts.join('; ');
}

export async function POST(request: NextRequest) {
  try {
    const body: AskFinancialSeerRequest = await request.json();
    const { userId, question, userProfile, westernChartData, financialReport } = body;

    if (!userId || !question?.trim() || !userProfile) {
      return NextResponse.json(
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
    const systemPrompt = buildFinancialSeerSystemPrompt(reportContext, chartSummary);

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
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (error) {
            devLog.error('Financial Seer stream error:', error, 'route');
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
    devLog.error('Ask Financial Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
