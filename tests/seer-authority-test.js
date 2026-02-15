/**
 * Authority/voice tests: relationship, promotion, country.
 * Run with dev server up: node tests/seer-authority-test.js
 * Optional: SEER_TEST_USER_ID=uid for personalized country answer.
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";
const USER_ID = process.env.SEER_TEST_USER_ID || null;

const TESTS = [
  { name: "Test 1: He's been distant", message: "He's been distant. What do you see?" },
  { name: "Test 2: When will I get promoted?", message: "When will I get promoted?" },
  { name: "Test 3: Which country suits me best?", message: "Which country suits me best?" },
];

async function ask(message) {
  const body = { message, thread: [] };
  if (USER_ID) body.userId = USER_ID;
  const res = await fetch(`${BASE}/api/seer/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error || res.status };
  return { reply: data.reply || "" };
}

async function main() {
  console.log("Seer authority/voice test\n");
  for (const t of TESTS) {
    const { reply, error } = await ask(t.message);
    console.log(`--- ${t.name} ---`);
    console.log(`Input: "${t.message}"`);
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Reply:\n" + reply);
    }
    console.log("");
  }
  console.log("--- End ---");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
