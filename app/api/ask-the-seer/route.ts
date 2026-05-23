import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { log } from '@/lib/consoleLogger';
import { getServerBaseUrl } from '@/lib/serverBaseUrl';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';
import { blockSeerQuestionIfNeeded } from '@/lib/seerGateResponses';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-the-seer';

function stampText(text: string): string {
  return appendAttribution(text, { markerFamily: SEER_MARKER_FAMILY });
}

function stampAnswerFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stampAnswerFields);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if ((k === 'answer' || k === 'response' || k === 'reply') && typeof v === 'string') {
        out[k] = stampText(v);
      } else {
        out[k] = stampAnswerFields(v);
      }
    }
    return out;
  }
  return value;
}

function jsonWithRobots(body: unknown, init?: ResponseInit): Response {
  const response = NextResponse.json(stampAnswerFields(body), init);
  response.headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return response;
}

/**
 * Proxy to the simplified Seer chat API.
 * Accepts question + conversationHistory, forwards to /api/seer/chat, returns answer.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'ask-the-seer');
    if (!auth.ok) {
      return jsonWithRobots({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      question,
      userProfile: profile,
      conversationHistory = [],
    } = body;

    const ownedUserId = resolveOwnedUserId(userId, auth.uid);
    if (!ownedUserId || !question) {
      return jsonWithRobots(
        { success: false, error: 'Missing/invalid userId or question' },
        { status: 400 }
      );
    }

    const inputBlocked = blockSeerQuestionIfNeeded(String(question).trim(), 'ask-the-seer', {
      blockedResponseFormat: 'ask_the_seer',
      userId: ownedUserId,
    });
    if (inputBlocked) {
      const headers = new Headers(inputBlocked.headers);
      headers.set('X-Robots-Tag', X_ROBOTS_TAG);
      return new Response(inputBlocked.body, { status: inputBlocked.status, headers });
    }

    const thread = (conversationHistory as Array<{ type?: string; content?: string }>)
      .slice(-6)
      .map((m) => ({
        role: (m.type === 'seer' ? 'seer' : 'user') as 'user' | 'seer',
        content: (m.content ?? '').slice(0, 2000),
      }));

    const baseUrl = getServerBaseUrl();
    const chatRes = await fetch(`${baseUrl}/api/seer/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') ?? '',
      },
      body: JSON.stringify({
        message: String(question).trim(),
        thread,
        userId: ownedUserId,
        birthProfile: profile
          ? {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime,
              birthPlace: profile.birthPlace,
            }
          : undefined,
      }),
    });

    const chatData = await chatRes.json();

    if (!chatRes.ok) {
      log.error('Seer chat error', { status: chatRes.status, error: chatData.error }, 'ask-the-seer-api');
      return jsonWithRobots(
        { success: false, error: chatData.error || 'Seer connection failed.' },
        { status: chatRes.status >= 400 ? chatRes.status : 500 }
      );
    }

    const reply = chatData.reply ?? 'The vision is unclear. Ask again.';

    return jsonWithRobots({
      success: true,
      data: {
        answer: reply,
        response: reply,
        thread: chatData.thread,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    log.error('Ask the Seer error', error, 'ask-the-seer-api');
    return jsonWithRobots(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500 }
    );
  }
}
