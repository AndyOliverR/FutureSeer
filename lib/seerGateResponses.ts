/**
 * Shared Seer gate responses (input guard blocks) for streaming and JSON routes.
 */

import { NextResponse } from 'next/server';
import { recordAiAuditEvent } from '@/lib/aiAuditEvents';
import { SEER_INPUT_BLOCKED_MESSAGE, validateSeerInput } from '@/lib/seerInputGuard';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';

export type SeerBlockedResponseFormat = 'stream' | 'json' | 'seer_chat' | 'ask_the_seer';

export interface SeerGuardCheckResult {
  blocked: boolean;
  reason?: string;
  injectionScore?: number;
  injectionReasons?: string[];
}

/** Run input guard on a user question / message. */
export function checkSeerQuestionGuard(text: string): SeerGuardCheckResult {
  const guard = validateSeerInput(text);
  if (guard.outcome === 'blocked') {
    return {
      blocked: true,
      reason: guard.reason,
      injectionScore: guard.injectionScore,
      injectionReasons: guard.injectionReasons,
    };
  }
  return { blocked: false };
}

export function seerInputBlockedStreamResponse(): Response {
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Robots-Tag': X_ROBOTS_TAG,
  });
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(SEER_INPUT_BLOCKED_MESSAGE));
      controller.close();
    },
  });
  return new Response(stream, { headers });
}

export function seerInputBlockedJsonResponse(): Response {
  return NextResponse.json(
    {
      response: SEER_INPUT_BLOCKED_MESSAGE,
      refused: true,
      inputBlocked: true,
      timestamp: new Date().toISOString(),
    },
    { status: 400 },
  );
}

export function seerChatBlockedResponse(): Response {
  return NextResponse.json(
    { error: SEER_INPUT_BLOCKED_MESSAGE, inputBlocked: true },
    { status: 400 },
  );
}

export function askTheSeerBlockedResponse(): Response {
  return NextResponse.json(
    {
      success: false,
      error: SEER_INPUT_BLOCKED_MESSAGE,
      inputBlocked: true,
    },
    { status: 400 },
  );
}

/** Guard + audit + response for tool/main Seer gates. Returns a Response when blocked. */
export function blockSeerQuestionIfNeeded(
  question: string,
  routeLogicalKey: string,
  options?: {
    blockedResponseFormat?: SeerBlockedResponseFormat;
    userId?: string;
  },
): Response | null {
  if (!question) return null;

  const check = checkSeerQuestionGuard(question);
  if (!check.blocked) return null;

  recordAiAuditEvent({
    label: routeLogicalKey,
    kind: 'gate_block',
    route: routeLogicalKey,
    userId: options?.userId ?? null,
    attempts: 0,
    failureMode: 'prompt_injection',
    passed: false,
    latencyMs: 0,
    guardReason: check.reason,
    injectionScore: check.injectionScore,
    injectionReasons: check.injectionReasons,
  });

  const format = options?.blockedResponseFormat ?? 'stream';
  switch (format) {
    case 'json':
      return seerInputBlockedJsonResponse();
    case 'seer_chat':
      return seerChatBlockedResponse();
    case 'ask_the_seer':
      return askTheSeerBlockedResponse();
    default:
      return seerInputBlockedStreamResponse();
  }
}
