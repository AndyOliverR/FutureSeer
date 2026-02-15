/**
 * Seer chat validation: run 5 questions against /api/seer/chat and print replies.
 * Usage: BASE_URL=http://localhost:3000 SEER_TEST_USER_ID=<uid> npx tsx tests/timingValidation.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SEER_TEST_USER_ID = process.env.SEER_TEST_USER_ID || '';

const QUESTIONS: { id: string; query: string }[] = [
  { id: '1-event', query: 'When will I get a promotion?' },
  { id: '2-comparison', query: 'Is 2026 better than 2025 for marriage?' },
  { id: '3-stability', query: 'When will my financial situation stabilize?' },
  { id: '4-micro', query: 'What is the best month to launch my app?' },
  { id: '5-negative', query: 'Why do I always miss good opportunities?' },
];

async function runOne(
  query: string,
  thread: Array<{ role: string; content: string }>
): Promise<{ reply: string; thread: Array<{ role: string; content: string }>; error?: string }> {
  const res = await fetch(`${BASE_URL}/api/seer/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: query,
      thread,
      userId: SEER_TEST_USER_ID || undefined,
    }),
  });
  const body = await res.json();
  if (!res.ok) return { reply: '', thread, error: body?.error || String(res.status) };
  return { reply: body.reply ?? '', thread: body.thread ?? [] };
}

async function main(): Promise<void> {
  if (!SEER_TEST_USER_ID) {
    console.log('Set SEER_TEST_USER_ID and BASE_URL to run. Example:');
    console.log('BASE_URL=http://localhost:3000 SEER_TEST_USER_ID=<uid> npx tsx tests/timingValidation.ts');
    return;
  }
  console.log('--- Seer chat validation (5 questions) ---\n');
  let thread: Array<{ role: string; content: string }> = [];
  for (const { id, query } of QUESTIONS) {
    const { reply, thread: nextThread, error } = await runOne(query, thread);
    thread = nextThread;
    console.log(`### ${id}: ${query}`);
    if (error) {
      console.log('Error:', error);
    } else {
      console.log(reply);
    }
    console.log('');
  }
  console.log('--- End ---');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
