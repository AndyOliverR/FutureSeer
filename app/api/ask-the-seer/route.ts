import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/consoleLogger';
import { getServerBaseUrl } from '@/lib/serverBaseUrl';

/**
 * Proxy to the simplified Seer chat API.
 * Accepts question + conversationHistory, forwards to /api/seer/chat, returns answer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      question,
      userProfile: profile,
      conversationHistory = [],
    } = body;

    if (!userId || !question) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or question' },
        { status: 400 }
      );
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: String(question).trim(),
        thread,
        userId,
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
      return NextResponse.json(
        { success: false, error: chatData.error || 'Seer connection failed.' },
        { status: chatRes.status >= 400 ? chatRes.status : 500 }
      );
    }

    const reply = chatData.reply ?? 'The vision is unclear. Ask again.';

    return NextResponse.json({
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
      { status: 500 }
    );
  }
}
