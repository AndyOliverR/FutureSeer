/**
 * Server-only: Bearer auth + user scope + AI rate limit for per-tool Ask the Seer API routes.
 */

import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';
import { rateLimiters } from '@/lib/rateLimit';
import { checkRateLimitWithOptionalFirestore } from '@/lib/rateLimitFirestore';
import {
  blockSeerQuestionIfNeeded,
  type SeerBlockedResponseFormat,
} from '@/lib/seerGateResponses';

export type ToolSeerBlockedResponseFormat = SeerBlockedResponseFormat;

export interface EnforceToolSeerGateOptions {
  /**
   * How to respond when input guard blocks the question.
   * - stream: SSE body (default; Ask-the-Seer tool routes)
   * - json: JSON body (e.g. medical-seer)
   */
  blockedResponseFormat?: ToolSeerBlockedResponseFormat;
}

/** Extract trimmed `question` from a tool Seer POST body. */
/**
 * Resolves the Firestore user id for cache/rate scope after {@link enforceToolSeerGate} succeeds.
 * Prefers body `userId` when it matches the authenticated uid.
 */
export async function resolveToolSeerUserId(
  request: NextRequest,
  body: unknown,
  routeLogicalKey: string,
): Promise<string | null> {
  const auth = await verifyUserRequest(request, routeLogicalKey);
  if (!auth.ok) return null;
  const rec =
    body && typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const raw = typeof rec.userId === 'string' ? rec.userId.trim() : '';
  if (raw) {
    return resolveOwnedUserId(raw, auth.uid);
  }
  return auth.uid;
}

export function extractToolSeerQuestion(body: unknown): string {
  const rec =
    body && typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};
  return typeof rec.question === 'string' ? rec.question.trim() : '';
}

export async function enforceToolSeerGate(
  request: NextRequest,
  body: unknown,
  routeLogicalKey: string,
  options?: EnforceToolSeerGateOptions,
): Promise<Response | null> {
  const auth = await verifyUserRequest(request, routeLogicalKey);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const rec =
    body && typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};

  let rateUid: string;
  const raw = typeof rec.userId === 'string' ? rec.userId.trim() : '';
  if (raw) {
    const owned = resolveOwnedUserId(raw, auth.uid);
    if (!owned) {
      return NextResponse.json(
        { success: false, error: 'Invalid or mismatched userId' },
        { status: 400 },
      );
    }
    rateUid = owned;
  } else {
    rateUid = auth.uid;
  }

  const rl = await checkRateLimitWithOptionalFirestore(
    rateLimiters.ai,
    `tool_seer_${routeLogicalKey}`,
    rateUid,
  );

  if (!rl.allowed) {
    const retry = Math.max(1, Math.ceil((rl.resetTime - Date.now()) / 1000));
    return NextResponse.json(
      { success: false, error: rateLimiters.ai.getErrorMessage() },
      {
        status: 429,
        headers: {
          'Retry-After': String(retry),
        },
      },
    );
  }

  const question = extractToolSeerQuestion(body);
  const blocked = blockSeerQuestionIfNeeded(question, routeLogicalKey, {
    blockedResponseFormat: options?.blockedResponseFormat ?? 'stream',
    userId: rateUid,
  });
  if (blocked) return blocked;

  return null;
}
