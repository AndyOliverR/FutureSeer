/**
 * Seer chat smoke test: run 5 questions against /api/seer/chat.
 * No interaction-mode checks (engine simplified to Grok chat).
 *
 * Usage:
 *   npx tsx tests/interactionModeRegression.ts
 *   BASE_URL=http://localhost:3000 SEER_TEST_USER_ID=<uid> npx tsx tests/interactionModeRegression.ts
 */

const INTERACTION_BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SEER_TEST_USER_ID = process.env.SEER_TEST_USER_ID || '';

const VALIDATION_5: { num: number; query: string }[] = [
  { num: 1, query: 'Will marriage delay my career growth?' },
  { num: 2, query: 'Will relocation improve my career opportunities?' },
  { num: 3, query: 'Will health issues block my professional success?' },
  { num: 4, query: 'Will moving abroad increase my wealth?' },
  { num: 5, query: 'Does this relationship support my business growth?' },
];

async function runOne(
  query: string,
  thread: Array<{ role: string; content: string }>
): Promise<{ reply: string; thread: Array<{ role: string; content: string }>; ok: boolean; error?: string }> {
  const res = await fetch(`${INTERACTION_BASE_URL}/api/seer/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: query, thread, userId: SEER_TEST_USER_ID || undefined }),
  });
  const body = await res.json();
  if (!res.ok) return { reply: '', thread, ok: false, error: body?.error || String(res.status) };
  return { reply: body.reply ?? '', thread: body.thread ?? [], ok: true };
}

async function main(): Promise<void> {
  if (!SEER_TEST_USER_ID) {
    console.log('Skipping API validation (set SEER_TEST_USER_ID and BASE_URL).\n');
    return;
  }
  console.log('--- Seer chat: 5 validation questions ---\n');
  let thread: Array<{ role: string; content: string }> = [];
  for (const { num, query } of VALIDATION_5) {
    const { reply, thread: nextThread, ok, error } = await runOne(query, thread);
    thread = nextThread;
    console.log(`### ${num}: ${query}`);
    if (!ok) {
      console.log('Error:', error ?? 'request failed');
    } else {
      console.log(reply);
      console.log('Length:', reply.length, 'chars');
    }
    console.log('');
  }
  console.log('--- End ---');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
