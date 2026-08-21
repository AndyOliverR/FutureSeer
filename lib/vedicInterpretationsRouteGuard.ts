import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';

export type VedicInterpretationAuthOk = {
  ok: true;
  userId: string;
  body: Record<string, unknown>;
};

export type VedicInterpretationAuthFail = {
  ok: false;
  response: NextResponse;
};

/**
 * Require Firebase Bearer auth and body.userId ownership before Groq
 * generation or Admin cache R/W under users/{userId}/vedicInterpretations.
 */
export async function authorizeVedicInterpretationRequest(
  request: NextRequest,
  logTag: string,
): Promise<VedicInterpretationAuthOk | VedicInterpretationAuthFail> {
  const auth = await verifyUserRequest(request, logTag);
  if (!auth.ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
    };
  }

  const ownedUserId = resolveOwnedUserId(body.userId, auth.uid);
  if (!ownedUserId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ok: true, userId: ownedUserId, body };
}
