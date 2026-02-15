import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { buildAstrocartographySeerSystemPrompt } from '@/lib/astrocartographySeerPrompts';

interface AstrocartographySeerRequest {
  userId: string;
  question: string;
  userProfile?: any;
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
    const { userId, question, userProfile, astrocartographyData, sessionId } = body;

    if (!userId || !question?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId or question' },
        { status: 400 }
      );
    }

    const reportContext = formatReportContext(astrocartographyData);
    const systemPrompt = buildAstrocartographySeerSystemPrompt(reportContext, {
      displayName: userProfile?.displayName || userProfile?.fullName,
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

    return new Response(
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
            controller.enqueue(new TextEncoder().encode('I encountered an error. Please try again.'));
          } finally {
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
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
