import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildFinancialAstrologyState,
  classifyFinancialAstrologyQuestion,
  getFinancialAstrologySliceForQuestionType,
  FINANCIAL_DISCLAIMER,
  type FinancialAstrologyChartPayload,
} from '@/lib/financialAstrologySeerState';
import { buildFinancialAstrologySeerSystemPrompt } from '@/lib/financialAstrologySeerPrompts';

const REFUSAL_PHRASE = "Astrology can't provide investment advice or guarantees. Please consult a qualified financial professional.";

/** Normalize natal chart from western/vedic/comprehensiveProfile format to FinancialAstrologyChartPayload. */
function normalizeToFinancialPayload(
  natalChart: any,
  comprehensiveProfile?: any
): FinancialAstrologyChartPayload {
  if (!natalChart && comprehensiveProfile) {
    const vedic = comprehensiveProfile.vedic ?? comprehensiveProfile['Vedic Astrology'];
    const western = comprehensiveProfile.western ?? comprehensiveProfile['Western Astrology'];
    const chart = vedic?.vedicCharts?.D1 ?? vedic?.chart ?? western?.chart ?? western?.data;
    if (!chart) throw new Error('No natal chart available');
    return normalizeToFinancialPayload(chart, comprehensiveProfile);
  }
  if (!natalChart) throw new Error('No natal chart available');

  const planets = natalChart.planets;
  const houses = natalChart.houses ?? [];
  const ascendant = natalChart.ascendant ?? natalChart.rising_sign;

  if (!planets) throw new Error('Chart must have planets');

  let planetsRecord: Record<string, { sign?: string; house?: number }>;
  if (Array.isArray(planets)) {
    planetsRecord = {};
    planets.forEach((p: { name?: string; sign?: string; house?: number }) => {
      const name = p.name ?? '';
      if (name && name !== 'Ascendant' && name !== 'MC') {
        planetsRecord[name] = { sign: p.sign, house: p.house };
      }
    });
  } else {
    planetsRecord = planets as Record<string, { sign?: string; house?: number }>;
  }

  let housesArr: Array<{ house?: number; sign?: string }>;
  if (houses.some((h: any) => h.house != null)) {
    housesArr = houses;
  } else {
    housesArr = houses.map((h: { number?: number; house?: number; sign?: string }) => ({
      house: h.number ?? h.house,
      sign: h.sign,
    }));
  }

  const ascendantSign =
    ascendant ??
    (housesArr.find((h: any) => (h.house ?? h.number) === 1) as { sign?: string })?.sign ??
    'Unknown';

  const timing = comprehensiveProfile?.vedic
    ? {
        currentDasha:
          comprehensiveProfile.vedic.currentDasha?.planet ??
          comprehensiveProfile.vedic.currentDasha ??
          (Array.isArray(comprehensiveProfile.vedic.dasha)
            ? (comprehensiveProfile.vedic.dasha.find((d: any) => d.isCurrent)?.planet ??
               comprehensiveProfile.vedic.dasha[0]?.planet)
            : undefined),
      }
    : undefined;

  return {
    data: {
      chart: {
        ascendant: ascendantSign,
        planets: planetsRecord,
        houses: housesArr,
      },
      timing,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      question,
      userProfile,
      financialChartData,
      natalChart,
      comprehensiveProfile,
      sessionId,
    } = body;

    if (!userId || !question || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId, question, or userProfile',
      }, { status: 400 });
    }

    devLog.info('💰 Financial Seer API: Processing question for user:', userId, 'ask-financial-seer');

    const questionType = classifyFinancialAstrologyQuestion(question);
    if (questionType === 'refusal') {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(REFUSAL_PHRASE));
            controller.close();
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
    }

    let payload: FinancialAstrologyChartPayload;
    try {
      if (natalChart) {
        payload = normalizeToFinancialPayload(natalChart, comprehensiveProfile);
      } else if (comprehensiveProfile) {
        payload = normalizeToFinancialPayload(null, comprehensiveProfile);
      } else if (financialChartData?.planets || financialChartData?.chart?.planets) {
        const chart = financialChartData.chart ?? financialChartData;
        payload = normalizeToFinancialPayload(chart, undefined);
      } else {
        return NextResponse.json({
          success: false,
          error:
            'Financial Astrology requires natal chart data. Generate your chart first to use Ask the Seer.',
        }, { status: 400 });
      }
    } catch (err) {
      return NextResponse.json({
        success: false,
        error:
          err instanceof Error ? err.message : 'Financial Astrology requires natal chart data.',
      }, { status: 400 });
    }

    let state;
    try {
      state = buildFinancialAstrologyState(payload);
    } catch {
      return NextResponse.json({
        success: false,
        error:
          'Financial Astrology requires natal chart data. Generate your chart first to use Ask the Seer.',
      }, { status: 400 });
    }

    const slice = getFinancialAstrologySliceForQuestionType(questionType, state);
    const displayName = (userProfile?.displayName ?? '').trim();
    const systemPrompt = buildFinancialAstrologySeerSystemPrompt(slice, questionType, {
      displayName: displayName || undefined,
    });

    const memory = new ConversationalMemory(userId);
    await memory.initializeAllMemory(true);
    const workingMemory = memory.getWorkingMemory();
    const conversationHistory = workingMemory.lastExchanges
      .filter((msg: MemoryMessage) => msg.type === 'user' || msg.type === 'seer')
      .map((msg: MemoryMessage, index: number, arr: MemoryMessage[]) => {
        if (msg.type === 'user') {
          const seerResponse = arr[index + 1];
          return {
            question: msg.content,
            answer: seerResponse?.type === 'seer' ? seerResponse.content : '',
          };
        }
        return null;
      })
      .filter((item: any) => item !== null)
      .slice(-10);

    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.flatMap((h: { question: string; answer: string } | null) =>
          h ? [
            { role: 'user' as const, content: h.question },
            { role: 'assistant' as const, content: h.answer },
          ] : []
        ),
        { role: 'user', content: question },
      ],
      temperature: 0.6,
      maxTokens: 800,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          try {
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            if (!fullResponse.includes(FINANCIAL_DISCLAIMER)) {
              controller.enqueue(
                new TextEncoder().encode(`\n\n${FINANCIAL_DISCLAIMER}`)
              );
              fullResponse += `\n\n${FINANCIAL_DISCLAIMER}`;
            }
            const userMessage: MemoryMessage = {
              id: `msg_${Date.now()}_user`,
              timestamp: Date.now(),
              type: 'user',
              content: question,
              questionType: questionType,
              keywords: question.split(' ').slice(0, 5),
            };
            const seerMessage: MemoryMessage = {
              id: `msg_${Date.now()}_seer`,
              timestamp: Date.now(),
              type: 'seer',
              content: fullResponse,
              questionType: questionType,
              confidence: 0.85,
              sources: ['financial-astrology'],
            };
            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question);
            await memory.saveAllMemory();
            try {
              const db = getFirebaseDB();
              if (db) {
                const session = sessionId || `session_${Date.now()}`;
                await setDoc(
                  doc(db, 'financialSeerConversations', userId, 'sessions', session, 'messages', `msg_${Date.now()}`),
                  {
                    question,
                    answer: fullResponse,
                    timestamp: Date.now(),
                    confidence: 0.85,
                    chartReferences: {},
                    followUpQuestions: [],
                  }
                );
              }
            } catch {
              /* non-fatal */
            }
          } catch (error) {
            devLog.error('Error during streaming:', error);
            controller.enqueue(
              new TextEncoder().encode(
                'I apologize, but I encountered an error. Please try again.'
              )
            );
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
    devLog.error('Error in Financial Seer API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}
