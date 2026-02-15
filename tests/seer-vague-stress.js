/**
 * Stress test: vague questions with no prior context.
 * Expected: clarifying questions only; no planets, timelines, or invented astrology.
 * Run with dev server up: pnpm dev, then node tests/seer-vague-stress.js
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

const QUESTIONS = [
  "When will it happen?",
  "Is it coming soon?",
  "Will it finally happen this year?",
  "Should I trust them?",
  "Are they being honest?",
  "Is this the right move?",
  "Will this work out?",
];

async function ask(message) {
  const res = await fetch(`${BASE}/api/seer/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, thread: [] }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error || res.status };
  return { reply: data.reply || "" };
}

async function main() {
  console.log("Seer vague-question stress test (no prior context)\n");
  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const { reply, error } = await ask(q);
    console.log(`--- ${i + 1}. "${q}" ---`);
    if (error) {
      console.log("Error:", error);
    } else {
      console.log(reply);
    }
    console.log("");
  }
  console.log("--- End ---");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
