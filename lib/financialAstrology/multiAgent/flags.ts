/** Env toggles for financial astrology multi-agent (no aiGateway import — safe for Jest). */

export function isFinancialMultiAgentEnabled(): boolean {
  return process.env.FINANCIAL_MULTIAGENT_ENABLED !== 'false';
}
