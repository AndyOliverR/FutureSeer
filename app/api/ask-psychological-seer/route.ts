import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAIStream } from '@/lib/aiGateway';
import { buildPsychologicalSeerSystemPrompt } from '@/lib/psychologicalSeerPrompts';

interface AskPsychologicalSeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  westernChartData?: any;
  psychologicalReport?: Record<string, unknown>;
  sessionId?: string;
}

function formatPsychologicalReportContext(report: Record<string, unknown> | undefined): string {
  if (!report || typeof report !== 'object') return '';
  const lines: string[] = [];

  const exec = report.executive_overview;
  if (exec && typeof exec === 'object') {
    const e = exec as Record<string, unknown>;
    if (e.core_personality_pattern) lines.push(`Executive – core personality: ${e.core_personality_pattern}`);
    if (e.dominant_drives) lines.push(`Executive – dominant drives: ${e.dominant_drives}`);
    if (e.primary_inner_conflict) lines.push(`Executive – primary inner conflict: ${e.primary_inner_conflict}`);
    if (e.core_developmental_task) lines.push(`Executive – developmental task: ${e.core_developmental_task}`);
    if (e.identity_summary) lines.push(`Executive – identity summary: ${e.identity_summary}`);
  }

  if (typeof report.personality_structure === 'string' && report.personality_structure.trim())
    lines.push(`Personality structure: ${report.personality_structure}`);
  if (typeof report.ego_development === 'string' && report.ego_development.trim())
    lines.push(`Ego development: ${report.ego_development}`);
  if (typeof report.emotional_patterning === 'string' && report.emotional_patterning.trim())
    lines.push(`Emotional patterning: ${report.emotional_patterning}`);
  if (typeof report.shadow_projection === 'string' && report.shadow_projection.trim())
    lines.push(`Shadow & projection: ${report.shadow_projection}`);
  if (typeof report.cognitive_style === 'string' && report.cognitive_style.trim())
    lines.push(`Cognitive style: ${report.cognitive_style}`);
  if (typeof report.conflict_defense === 'string' && report.conflict_defense.trim())
    lines.push(`Conflict & defense: ${report.conflict_defense}`);
  if (typeof report.relationship_psychology === 'string' && report.relationship_psychology.trim())
    lines.push(`Relationship psychology: ${report.relationship_psychology}`);
  if (typeof report.life_themes === 'string' && report.life_themes.trim())
    lines.push(`Life themes: ${report.life_themes}`);
  if (typeof report.life_path === 'string' && report.life_path.trim())
    lines.push(`Life path (North/South Node): ${report.life_path}`);
  if (typeof report.inner_dynamics === 'string' && report.inner_dynamics.trim())
    lines.push(`Inner dynamics: ${report.inner_dynamics}`);
  if (typeof report.integration_growth_plan === 'string' && report.integration_growth_plan.trim())
    lines.push(`Integration & growth plan: ${report.integration_growth_plan}`);

  if (report.core_identity_pattern) lines.push(`Core identity pattern: ${report.core_identity_pattern}`);
  if (report.emotional_signature) lines.push(`Emotional signature: ${report.emotional_signature}`);
  if (Array.isArray(report.defense_mechanisms) && report.defense_mechanisms.length)
    lines.push(`Defense mechanisms: ${report.defense_mechanisms.join(', ')}`);
  if (report.shadow_theme) lines.push(`Shadow theme: ${report.shadow_theme}`);
  if (report.relationship_pattern) lines.push(`Relationship pattern: ${report.relationship_pattern}`);
  if (report.growth_focus) lines.push(`Growth focus: ${report.growth_focus}`);
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
    const body: AskPsychologicalSeerRequest = await request.json();
    const { userId, question, userProfile, westernChartData, psychologicalReport } = body;

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
      psychologicalReport && typeof psychologicalReport === 'object' && 'comprehensiveAnalysis' in psychologicalReport
        ? (psychologicalReport as { comprehensiveAnalysis?: Record<string, unknown> }).comprehensiveAnalysis
        : psychologicalReport;
    const reportContext = formatPsychologicalReportContext(
      (reportData as Record<string, unknown>) ?? undefined
    );
    const chartSummary = formatChartSummary(westernChartData);
    const systemPrompt = buildPsychologicalSeerSystemPrompt(reportContext, chartSummary);

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
            devLog.error('Psychological Seer stream error:', error, 'route');
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
    devLog.error('Ask Psychological Seer API error:', error, 'route');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
