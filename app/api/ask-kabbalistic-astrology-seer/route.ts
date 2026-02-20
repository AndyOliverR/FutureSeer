import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import { buildKabbalisticAstrologySeerSystemPrompt } from '@/lib/kabbalisticAstrologySeerPrompts';

interface AskKabbalisticAstrologySeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  westernChartData?: any;
  kabbalisticReport?: Record<string, unknown>;
  sessionId?: string;
}

function formatKabbalisticReportContext(report: Record<string, unknown> | undefined): string {
  if (!report || typeof report !== 'object') return '';
  const lines: string[] = [];
  if (report.executive_summary) lines.push(`Executive summary: ${report.executive_summary}`);
  if (report.hebrew_sign) lines.push(`Hebrew sign: ${report.hebrew_sign}`);
  if (report.hebrew_birthday) lines.push(`Hebrew birthday: ${report.hebrew_birthday}`);
  if (report.name_72) lines.push(`72 Names (Shem HaMephorash): ${report.name_72}`);
  if (report.letter_of_sign) lines.push(`Letter of sign: ${report.letter_of_sign}`);
  if (report.letter_of_planet) lines.push(`Letter of planet: ${report.letter_of_planet}`);
  if (report.sefirotic_mapping) lines.push(`Sefirotic mapping: ${report.sefirotic_mapping}`);
  if (report.tikkun_theme) lines.push(`Tikkun theme: ${report.tikkun_theme}`);
  if (report.tikkun_axis) lines.push(`Tikkun axis: ${report.tikkun_axis}`);
  if (report.past_life_residue) lines.push(`Past-life residue: ${report.past_life_residue}`);
  if (report.core_correction) lines.push(`Core correction: ${report.core_correction}`);
  if (report.recommended_spiritual_discipline) lines.push(`Recommended spiritual discipline: ${report.recommended_spiritual_discipline}`);
  if (report.career_malkuth) lines.push(`Career / Malkuth: ${report.career_malkuth}`);
  if (report.relationship_emotional_correction) lines.push(`Relationship & emotional correction: ${report.relationship_emotional_correction}`);
  if (report.long_term_rectification_cycles) lines.push(`Long-term rectification cycles: ${report.long_term_rectification_cycles}`);
  if (report.current_spiritual_test) lines.push(`Current spiritual test: ${report.current_spiritual_test}`);
  if (report.spiritual_strength) lines.push(`Spiritual strength: ${report.spiritual_strength}`);
  if (report.growth_path) lines.push(`Growth path: ${report.growth_path}`);
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
    const body: AskKabbalisticAstrologySeerRequest = await request.json();
    const { userId, question, userProfile, westernChartData, kabbalisticReport } = body;

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
      kabbalisticReport && typeof kabbalisticReport === 'object' && 'comprehensiveAnalysis' in kabbalisticReport
        ? (kabbalisticReport as { comprehensiveAnalysis?: Record<string, unknown> }).comprehensiveAnalysis
        : kabbalisticReport;
    const reportContext = formatKabbalisticReportContext(
      (reportData as Record<string, unknown>) ?? undefined
    );
    const chartSummary = formatChartSummary(westernChartData);
    const systemPrompt = buildKabbalisticAstrologySeerSystemPrompt(reportContext, chartSummary);

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
            devLog.error('Kabbalistic Astrology Seer stream error:', error, 'route');
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
    devLog.error('Ask Kabbalistic Astrology Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
