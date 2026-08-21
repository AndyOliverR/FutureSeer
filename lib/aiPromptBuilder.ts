/**
 * Shared prompt assembly for Seer and structured AI routes.
 *
 * Slot order (system messages): system → constraints → chart → knowledge → context.
 * Then conversation history (trimmed), then the current user turn.
 */

import type { AICompletionOptions } from '@/lib/aiGateway';
import {
  allocateTokenBudget,
  estimateTokens,
  truncateToTokenBudget,
  type BudgetedChunk,
} from '@/lib/aiTokenBudget';
import { SEER_TOOL_CHAT_VOICE } from '@/lib/seerChatVoice';

export type PromptSlotKind =
  | 'system'
  | 'constraints'
  | 'chart'
  | 'knowledge'
  | 'context';

/** Default priority when `priority` is omitted on a slot. */
export const PROMPT_SLOT_PRIORITY: Record<PromptSlotKind, number> = {
  system: 0,
  constraints: 1,
  chart: 2,
  knowledge: 3,
  context: 4,
};

export interface PromptSlot {
  kind: PromptSlotKind;
  content: string;
  /** Override default priority for this slot. */
  priority?: number;
  id?: string;
}

export interface BuildSeerMessagesOptions {
  /** System-side slots (role: system), budgeted together. */
  slots: PromptSlot[];
  userMessage: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  /** Default 6 turns (12 messages). */
  maxHistoryTurns?: number;
  /** Total input budget for system + history + user (default 8000). */
  maxInputTokens?: number;
  /** Per history message cap when trimming (default 500 tokens). */
  maxHistoryMessageTokens?: number;
  /** When true, prepend the shared conversational chat-voice contract. */
  injectChatVoice?: boolean;
}

export interface BuildSeerMessagesResult {
  messages: AICompletionOptions['messages'];
  estimatedInputTokens: number;
  droppedSlotIds: string[];
  truncatedSlotIds: string[];
}

/** Hard JSON contract line for structured comprehensive / analysis routes. */
export const STANDARD_JSON_CONSTRAINTS =
  'Respond only with a single valid JSON object. No markdown fences, preamble, or commentary.';

/** Mutation hint appended on structured-output retry (matches aiStructuredOutput). */
export function mutationHintUserMessage(hint: string): AICompletionOptions['messages'][number] {
  return {
    role: 'user',
    content: `Constraints (correction — hard requirements):\n${hint}`,
  };
}

function slotPriority(slot: PromptSlot): number {
  return slot.priority ?? PROMPT_SLOT_PRIORITY[slot.kind];
}

/**
 * Assemble provider messages with priority-ordered system context and trimmed history.
 */
export interface BuildToolSeerMessagesOptions {
  systemContent: string;
  userMessage: string;
  history?: Array<{ question: string; answer: string } | null>;
  /** When set, truncates each history assistant turn (iching/navaratna/geomancy). */
  truncateHistoryAnswers?: number;
  maxHistoryTurns?: number;
  maxInputTokens?: number;
}

/** Map `{ question, answer }[]` into alternating user/assistant turns. */
export function mapQuestionAnswerHistory(
  items: Array<{ question: string; answer: string } | null>,
  options?: { truncateAnswers?: number },
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return items
    .filter((h): h is { question: string; answer: string } => h != null)
    .flatMap((h) => {
      let answer = h.answer;
      if (options?.truncateAnswers != null && answer.length > options.truncateAnswers) {
        answer = `${answer.substring(0, options.truncateAnswers)}...`;
      }
      return [
        { role: 'user' as const, content: h.question },
        { role: 'assistant' as const, content: answer },
      ];
    });
}

/**
 * Standard wrapper for per-tool Ask-the-Seer routes (single system block + optional history).
 */
export function buildToolSeerMessages(options: BuildToolSeerMessagesOptions): BuildSeerMessagesResult {
  return buildSeerMessages({
    slots: [
      { kind: 'constraints', content: SEER_TOOL_CHAT_VOICE, id: 'seer-chat-voice' },
      { kind: 'system', content: options.systemContent, id: 'tool-system' },
    ],
    userMessage: options.userMessage,
    history: mapQuestionAnswerHistory(options.history ?? [], {
      truncateAnswers: options.truncateHistoryAnswers,
    }),
    maxHistoryTurns: options.maxHistoryTurns ?? 5,
    maxInputTokens: options.maxInputTokens ?? 10_000,
  });
}

export function buildSeerMessages(options: BuildSeerMessagesOptions): BuildSeerMessagesResult {
  const maxInputTokens = options.maxInputTokens ?? 8000;
  const maxHistoryTurns = options.maxHistoryTurns ?? 6;
  const maxHistoryMessageTokens = options.maxHistoryMessageTokens ?? 500;
  const userMessage = options.userMessage.trim();

  const userTokens = estimateTokens(userMessage);
  const historyReserve = Math.min(
    maxHistoryTurns * 2 * maxHistoryMessageTokens,
    Math.floor(maxInputTokens * 0.45),
  );
  const systemBudget = Math.max(512, maxInputTokens - userTokens - historyReserve);

  const slots = options.injectChatVoice
    ? [
        {
          kind: 'constraints' as const,
          content: SEER_TOOL_CHAT_VOICE,
          id: 'seer-chat-voice',
        },
        ...options.slots,
      ]
    : options.slots;

  const systemChunks: BudgetedChunk[] = slots
    .filter((s) => s.content.trim())
    .map((s, i) => ({
      id: s.id ?? `${s.kind}-${i}`,
      priority: slotPriority(s),
      text: s.content.trim(),
    }));

  const systemAlloc = allocateTokenBudget(systemChunks, systemBudget);
  const truncatedSlotIds = systemAlloc.chunks.filter((c) => c.truncated).map((c) => c.id);
  const droppedSlotIds = systemAlloc.droppedIds;

  const messages: AICompletionOptions['messages'] = systemAlloc.chunks.map((c) => ({
    role: 'system' as const,
    content: c.text,
  }));

  const history = (options.history ?? []).slice(-maxHistoryTurns * 2);
  for (const turn of history) {
    const content = turn.content.trim();
    if (!content) continue;
    const { text } = truncateToTokenBudget(content, maxHistoryMessageTokens, '\n[...]');
    messages.push({
      role: turn.role,
      content: text,
    });
  }

  messages.push({ role: 'user', content: userMessage });

  const estimatedInputTokens = messages.reduce(
    (sum, m) => sum + estimateTokens(typeof m.content === 'string' ? m.content : ''),
    0,
  );

  return {
    messages,
    estimatedInputTokens,
    droppedSlotIds,
    truncatedSlotIds,
  };
}
