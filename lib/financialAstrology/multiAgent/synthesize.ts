import { createAICompletion } from '@/lib/aiGateway';
import type { AnalystReport, DebateTurn, FinancialPosture } from '@/lib/financialAstrology/multiAgent/schemas';
import { FinancialPostureSchema } from '@/lib/financialAstrology/multiAgent/schemas';
import type { FinancialHistoryEntry } from '@/lib/financialAstrology/multiAgent/schemas';
import { parseJsonObjectFromLLM } from '@/lib/financialAstrology/multiAgent/jsonParse';
import { buildSynthesizePosturePrompt } from '@/lib/financialAstrology/multiAgent/prompts';

export function getFinancialMultiAgentSynthModel(): string {
  return process.env.FINANCIAL_MULTIAGENT_SYNTH_MODEL?.trim() || 'llama-3.3-70b-versatile';
}

function formatPriorHistory(history: FinancialHistoryEntry[] | undefined): string {
  if (!history?.length) return '';
  const last = history.slice(-2);
  return last
    .map(
      (h, i) =>
        `${i + 1}. At ${h.generatedAt}: posture was "${h.posture}". Summary: ${h.executiveSummary}`
    )
    .join('\n');
}

function formatDebateTranscript(debate: DebateTurn[]): string {
  return debate
    .map(
      (t) =>
        `[Round ${t.round} | ${t.side === 'bull' ? 'Opportunity Seer' : 'Caution Seer'}]\nCitations: ${t.citations.join('; ')}\n${t.argument}`
    )
    .join('\n\n');
}

export async function synthesizePosture(params: {
  analystReports: AnalystReport[];
  debate: DebateTurn[];
  priorHistory?: FinancialHistoryEntry[];
}): Promise<FinancialPosture> {
  const { analystReports, debate, priorHistory } = params;
  const priorBlock = formatPriorHistory(priorHistory);
  const userContent = buildSynthesizePosturePrompt(
    JSON.stringify(analystReports),
    formatDebateTranscript(debate),
    priorBlock
  );

  const model = getFinancialMultiAgentSynthModel();
  const result = await createAICompletion({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You output a single JSON object only. No markdown. Keys: rating, executiveSummary, thesis, timeHorizonDays, riskBand.',
      },
      { role: 'user', content: userContent },
    ],
    temperature: 0.4,
    maxTokens: 900,
    responseFormat: { type: 'json_object' },
  });

  const raw = parseJsonObjectFromLLM(result?.content || '{}');
  const parsed = FinancialPostureSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Synthesis parse failed: ${parsed.error.message}`);
  }
  return parsed.data;
}
