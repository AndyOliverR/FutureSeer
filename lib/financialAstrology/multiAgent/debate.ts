import { createAICompletion } from '@/lib/aiGateway';
import type { AnalystReport } from '@/lib/financialAstrology/multiAgent/schemas';
import { DebateTurnSchema, type DebateTurn } from '@/lib/financialAstrology/multiAgent/schemas';
import { parseJsonObjectFromLLM } from '@/lib/financialAstrology/multiAgent/jsonParse';
import {
  buildBullResearcherPrompt,
  buildBearResearcherPrompt,
} from '@/lib/financialAstrology/multiAgent/prompts';
import { getFinancialMultiAgentAnalystModel } from '@/lib/financialAstrology/multiAgent/analystAgents';

export function getFinancialMultiAgentDebateRounds(): number {
  const raw = process.env.FINANCIAL_MULTIAGENT_DEBATE_ROUNDS;
  const n = raw != null && raw !== '' ? parseInt(raw, 10) : 1;
  if (Number.isNaN(n) || n < 1) return 1;
  if (n > 4) return 4;
  return n;
}

async function completeDebateTurn(systemUserContent: string): Promise<DebateTurn> {
  const model = getFinancialMultiAgentAnalystModel();
  const result = await createAICompletion({
    model,
    messages: [
      {
        role: 'system',
        content:
          'Respond only with a single valid JSON object. No markdown. Keys must match the requested shape exactly.',
      },
      { role: 'user', content: systemUserContent },
    ],
    temperature: 0.55,
    maxTokens: 600,
    responseFormat: { type: 'json_object' },
  });
  const raw = parseJsonObjectFromLLM(result?.content || '{}');
  const parsed = DebateTurnSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Debate turn parse failed: ${parsed.error.message}`);
  }
  return parsed.data;
}

/**
 * Opportunity Seer vs Caution Seer debate. Each round: bull then bear.
 */
export async function runBullBearDebate(
  analystReports: AnalystReport[],
  rounds: number = getFinancialMultiAgentDebateRounds()
): Promise<DebateTurn[]> {
  const analystJson = JSON.stringify(analystReports);
  const turns: DebateTurn[] = [];

  for (let r = 1; r <= rounds; r++) {
    const bullPrompt = buildBullResearcherPrompt(r, analystJson);
    const bull = await completeDebateTurn(bullPrompt);
    turns.push(bull);

    const bearPrompt = buildBearResearcherPrompt(r, analystJson, bull.argument);
    const bear = await completeDebateTurn(bearPrompt);
    turns.push(bear);
  }

  return turns;
}
