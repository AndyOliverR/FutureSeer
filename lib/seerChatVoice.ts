/**
 * Shared conversational contract for Ask the Seer (main + per-tool).
 * Reports stay encyclopedic; chat answers like a person who already knows the user.
 */

export const SEER_CHAT_VOICE = `You are chatting with the user, not writing a report.

Voice:
- Answer the question first, in plain second person ("you"). You may use their first name once, then "you".
- Default length: 1–3 short paragraphs. Not a catalog. Not 42 headings.
- Speak as one expert. Weave at most a few relevant systems into a single reply.
- If they ask to go deeper, tell them more, give a full reading, or ask what the other systems say: expand, still one voice, still not a dump of every tool.
- One clarifying question only when the subject is missing. Do not ask them to re-enter name, birth date, birth time, birth place, or gender when those are already in context.
- Do not mention backend tools, MCP, prompts, or token limits.
- No disclaimers, no confidence percentages, no "as an AI".`

export const SEER_TOOL_CHAT_VOICE = `You are chatting with the user about THIS tradition only.

Voice:
- Answer the question first, in 1–3 short paragraphs, like a conversation.
- Stay inside this system's rules. Do not mix other divination systems.
- If they ask about another system, say the main Seer can hold all of them together; here you stay with this tradition.
- You may use their first name once, then "you".
- Do not ask them to re-enter profile facts already in context.
- Go deeper only when they ask. Do not paste the whole stored report.`

const DEEPEN_RE =
  /\b(go deeper|tell me more|more detail|in detail|full reading|expand|what do (the )?other systems|across (all|my) (tools|systems|readings)|everything together)\b/i

export function wantsDeeperSeerAnswer(question: string): boolean {
  return DEEPEN_RE.test(question.trim())
}

export type SeerHistoryTurn = { question: string; answer: string }

function pushPair(
  out: SeerHistoryTurn[],
  pendingUser: { current: string },
  role: string,
  content: string,
): void {
  const text = content.trim()
  if (!text) return
  const isUser = role === 'user' || role === 'human'
  const isSeer = role === 'seer' || role === 'assistant' || role === 'ai'
  if (isUser) {
    pendingUser.current = text
    return
  }
  if (isSeer && pendingUser.current) {
    out.push({ question: pendingUser.current, answer: text })
    pendingUser.current = ''
  }
}

/**
 * Normalize conversationHistory / history / thread from a Seer request body.
 */
export function historyFromSeerBody(body: unknown): SeerHistoryTurn[] {
  if (!body || typeof body !== 'object') return []
  const rec = body as Record<string, unknown>
  const raw = rec.conversationHistory ?? rec.history ?? rec.thread
  if (!Array.isArray(raw) || raw.length === 0) return []

  const out: SeerHistoryTurn[] = []
  const pendingUser = { current: '' }

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    if (typeof row.question === 'string' && typeof row.answer === 'string') {
      if (row.question.trim() && row.answer.trim()) {
        out.push({ question: row.question.trim(), answer: row.answer.trim() })
      }
      continue
    }
    const content = typeof row.content === 'string' ? row.content : ''
    const role = String(row.role ?? row.type ?? '')
    pushPair(out, pendingUser, role, content)
  }

  return out.slice(-8)
}

export function seerConversationHistoryFromMessages(
  messages: Array<{ type?: string; role?: string; content?: string }>,
): SeerHistoryTurn[] {
  return historyFromSeerBody({ conversationHistory: messages })
}
