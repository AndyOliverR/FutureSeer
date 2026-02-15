/**
 * Main Seer regression test runner.
 * Runs the 25 stress cases and asserts structural expectations.
 * Use against live API (BASE_URL) or future runMainSeer().
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 node -r ts-node/register tests/regressionRunner.ts
 *   Or: npm run test:seer
 *
 * When seerOrchestrator exists, switch to: runMainSeer({ query, userProfile, sessionState })
 */

import { assertResult, type SeerResult, type ExpectedOutcome } from './assertionEngine';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const stressCases: { id: number; query: string }[] = require('./stressCases.json');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const expectedOutcomes: { id: number; expected: ExpectedOutcome }[] = require('./expectedOutcomes.json');

const BASE_URL = process.env.BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
const AUTH_TOKEN = process.env.SEER_TEST_TOKEN || '';

function buildSeerResultFromApiResponse(body: { reply?: string; thread?: Array<{ role: string; content: string }> }): SeerResult {
  const reply = body?.reply ?? '';
  return {
    answer: reply,
    response: reply,
    confidence: null,
    timing_window: undefined,
    sessionState: undefined,
    activeIntent: undefined,
    domain: undefined,
  };
}

async function runViaApi(query: string, _thread: Array<{ role: string; content: string }> = []): Promise<SeerResult> {
  if (!BASE_URL) {
    throw new Error('BASE_URL or VERCEL_URL not set; cannot run against API');
  }
  const url = `${BASE_URL}/api/seer/chat`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: query,
      thread: _thread,
      userId: process.env.SEER_TEST_USER_ID || undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return buildSeerResultFromApiResponse(json);
}

async function runRegression(): Promise<void> {
  const failures: { id: number; query: string; errors: string[] }[] = [];
  const useApi = Boolean(BASE_URL);

  if (!useApi) {
    console.warn('BASE_URL not set. Skipping API calls; assertions would run against runMainSeer() when integrated.');
    console.warn('Set BASE_URL=http://localhost:3000 (or your app URL) to run against the live API.');
    console.log('Stress case and expected outcome files are in place. Exiting 0.');
    return;
  }

  for (const testCase of stressCases) {
    const expected = expectedOutcomes.find((e) => e.id === testCase.id)?.expected as Record<string, unknown> | undefined;
    if (!expected) {
      console.warn(`No expected outcome for case ${testCase.id}, skipping.`);
      continue;
    }

    let result: SeerResult;
    try {
      if (useApi) {
        result = await runViaApi(testCase.query);
      } else {
        result = { answer: '', domain: '', confidence: null };
      }
    } catch (err) {
      failures.push({
        id: testCase.id,
        query: testCase.query,
        errors: [err instanceof Error ? err.message : String(err)],
      });
      continue;
    }

    const assertion = assertResult(result, expected);
    if (!assertion.passed) {
      failures.push({
        id: testCase.id,
        query: testCase.query,
        errors: assertion.errors,
      });
    }
  }

  if (failures.length > 0) {
    console.error('Regression failed:');
    failures.forEach((f) => {
      console.error(`  [${f.id}] ${f.query.slice(0, 50)}...`);
      f.errors.forEach((e) => console.error(`    - ${e}`));
    });
    process.exit(1);
  }

  console.log(`All ${stressCases.length} regression assertions passed.`);
}

runRegression().catch((err) => {
  console.error(err);
  process.exit(1);
});
