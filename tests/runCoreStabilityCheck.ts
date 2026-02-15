/**
 * Run core stability questions through the real Seer API.
 *
 * FAST_PATH=1: run only the 5 high-signal questions (Q1, Q2, Q3, Q5, Q6).
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 SEER_TEST_USER_ID=<uid> npx ts-node tests/runCoreStabilityCheck.ts
 *   FAST_PATH=1 BASE_URL=http://localhost:3000 SEER_TEST_USER_ID=<uid> npx ts-node tests/runCoreStabilityCheck.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SEER_TEST_USER_ID = process.env.SEER_TEST_USER_ID || '';
const FAST_PATH = process.env.FAST_PATH === '1' || process.env.FAST_PATH === 'true';

/** 5 high-signal questions for first stability check (Q1, Q2, Q3, gemstone, finger) */
const FAST_PATH_QUESTIONS: { q: number; query: string }[] = [
  { q: 1, query: 'Is relocating to Canada favorable for me long-term?' },
  { q: 2, query: 'Will it be permanent?' },
  { q: 3, query: 'Why do I sabotage opportunities right before success?' },
  { q: 5, query: 'Which gemstone should I wear for career growth?' },
  { q: 6, query: 'Which finger?' },
];

const CORE_15_QUESTIONS: { q: number; query: string }[] = [
  { q: 1, query: 'Is relocating to Canada favorable for me long-term?' },
  { q: 2, query: 'Will it be permanent?' },
  { q: 3, query: 'Why do I sabotage opportunities right before success?' },
  { q: 4, query: 'Is this person my soulmate or a karmic lesson?' },
  { q: 5, query: 'Which gemstone should I wear for career growth?' },
  { q: 6, query: 'Which finger?' },
  { q: 7, query: 'When will it finally happen?' },
  { q: 8, query: 'When will I get promoted?' },
  { q: 9, query: 'Should I undergo surgery this year?' },
  { q: 10, query: 'What is my life purpose?' },
  { q: 11, query: 'What obstacles block me?' },
  { q: 12, query: 'When will it manifest?' },
  { q: 13, query: 'Which is better for long-term wealth: Dubai or London?' },
  { q: 14, query: "I want to move abroad but I'm scared. Is this fear real or intuitive?" },
  { q: 15, query: 'Does my business align with my soul purpose?' },
];

async function runOne(
  user_id: string,
  query: string,
  thread: Array<{ role: string; content: string }>
): Promise<{ reply: string; thread: Array<{ role: string; content: string }> }> {
  const url = `${BASE_URL}/api/seer/chat`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: query, thread, userId: user_id || undefined }),
  });
  const body = (await res.json()) as { reply?: string; thread?: Array<{ role: string; content: string }>; error?: string };
  if (!res.ok) {
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return { reply: body.reply ?? '', thread: body.thread ?? [] };
}

async function main(): Promise<void> {
  if (!SEER_TEST_USER_ID) {
    console.error('SEER_TEST_USER_ID is required. Set it to a user that has profile + comprehensive profile.');
    console.error('Example: BASE_URL=http://localhost:3000 SEER_TEST_USER_ID=abc123 npx ts-node tests/runCoreStabilityCheck.ts');
    process.exit(1);
  }

  const questions = FAST_PATH ? FAST_PATH_QUESTIONS : CORE_15_QUESTIONS;
  console.log(`Running ${questions.length} questions against ${BASE_URL} (FAST_PATH=${FAST_PATH}) for user ${SEER_TEST_USER_ID.slice(0, 8)}...`);
  console.log('');

  let thread: Array<{ role: string; content: string }> = [];
  const rows: string[] = [];

  for (const { q, query } of questions) {
    try {
      const { reply, thread: nextThread } = await runOne(SEER_TEST_USER_ID, query, thread);
      thread = nextThread;
      const ok = Boolean(reply && reply.trim().length > 0);
      rows.push(`Q${q}\nReply length: ${reply?.length ?? 0}\nNon-empty: ${ok ? 'Y' : 'N'}`);
    } catch (err) {
      rows.push(`Q${q}\nError: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log('--- Report ---');
  console.log('');
  rows.forEach((r) => console.log(r));
  console.log('');
  console.log('--- End report ---');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
