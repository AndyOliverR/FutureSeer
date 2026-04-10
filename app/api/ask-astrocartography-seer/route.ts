import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { buildAstrocartographySeerSystemPrompt } from '@/lib/astrocartographySeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-astrocartography-seer';

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

function appendAttributionTail(controller: ReadableStreamDefaultController<Uint8Array>): void {
  controller.enqueue(new TextEncoder().encode(stampText('')));
}

function withRobotsResponse(body?: BodyInit | null, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set('X-Robots-Tag', X_ROBOTS_TAG);
  return new Response(body ?? null, { ...init, headers });
}


interface AstrocartographySeerRequest {
  userId: string;
  question: string;
  userProfile?: Record<string, unknown>;
  astrocartographyData?: {
    comprehensiveAnalysis?: {
      overview?: string;
      keyPlanetaryLines?: Array<{ angle: string; planet: string; theme: string }>;
      themesByRegion?: string;
      relocationGuidance?: string;
    };
    [key: string]: unknown;
  };
  sessionId?: string;
}

function formatReportContext(data: AstrocartographySeerRequest['astrocartographyData']): string {
  if (!data?.comprehensiveAnalysis) return '';
  const a = data.comprehensiveAnalysis;
  const lines =
    Array.isArray(a.keyPlanetaryLines) &&
    a.keyPlanetaryLines
      .map((l: { angle: string; planet: string; theme: string }) => `${l.planet} ${l.angle}: ${l.theme}`)
      .join('\n');
  return [
    a.overview ? `Overview: ${a.overview}` : '',
    lines ? `Key planetary lines:\n${lines}` : '',
    a.themesByRegion ? `Themes by region: ${a.themesByRegion}` : '',
    a.relocationGuidance ? `Relocation guidance: ${a.relocationGuidance}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function getConversationHistory(userId: string, sessionId?: string): Promise<{ question: string; answer: string }[]> {
  try {
    const db = getFirebaseDB();
    if (!db) return [];
    const session = sessionId || `session_${Date.now()}`;
    const messagesRef = collection(db, 'astrocartographySeerConversations', userId, 'sessions', session, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as { question: string; answer: string }).reverse();
  } catch {
    return [];
  }
}

async function storeConversation(
  userId: string,
  sessionId: string | undefined,
  question: string,
  answer: string
): Promise<void> {
  try {
    const db = getFirebaseDB();
    if (!db) return;
    const session = sessionId || `session_${Date.now()}`;
    const timestamp = Date.now();
    const messageId = `msg_${timestamp}`;
    const messageRef = doc(db, 'astrocartographySeerConversations', userId, 'sessions', session, 'messages', messageId);
    await setDoc(messageRef, { question, answer, timestamp });
  } catch (e) {
    devLog.warn('Astrocartography Seer: store conversation failed', e, 'route');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AstrocartographySeerRequest = await request.json();
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'ask_astrocartography_seer')
    if (__toolSeerGate) return __toolSeerGate

    const { userId, question, userProfile, astrocartographyData, sessionId } = body;

    if (!userId || !question?.trim()) {
      return jsonWithRobots(
        { success: false, error: 'Missing required parameters: userId or question' },
        { status: 400 }
      );
    }

    const reportContext = formatReportContext(astrocartographyData);
    const displayNameFromProfile =
      userProfile && typeof userProfile.displayName === 'string' && userProfile.displayName.trim()
        ? userProfile.displayName.trim()
        : userProfile && typeof userProfile.fullName === 'string' && userProfile.fullName.trim()
          ? userProfile.fullName.trim()
          : undefined;
    const systemPrompt = buildAstrocartographySeerSystemPrompt(reportContext, {
      displayName: displayNameFromProfile,
    });

    const conversationHistory = await getConversationHistory(userId, sessionId);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.flatMap((h) =>
          h?.question && h?.answer
            ? [
                { role: 'user' as const, content: h.question },
                { role: 'assistant' as const, content: h.answer },
              ]
            : []
        ),
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.6,
      maxTokens: 900,
    });

    return withRobotsResponse(
      new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          try {
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content ?? '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            await storeConversation(userId, sessionId, question.trim(), fullResponse);
          } catch (e) {
            devLog.error('Astrocartography Seer stream error:', e, 'route');
            controller.enqueue(new TextEncoder().encode(stampText('I encountered an error. Please try again.')));
          } finally {
            appendAttributionTail(controller);
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  } catch (error) {
    devLog.error('Ask Astrocartography Seer API error:', error, 'route');
    return jsonWithRobots(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
