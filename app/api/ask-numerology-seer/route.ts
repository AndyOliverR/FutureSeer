import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { calcPersonalYear } from '@/lib/numerology/personalYear';
import { calcDriver, calcConductor } from '@/lib/numerology/driverConductor';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildChaldeanState,
  classifyChaldeanQuestion,
  getChaldeanSliceForQuestionType,
  type ChaldeanQuestionType,
} from '@/lib/chaldeanSeerState';
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline';

interface NumerologySeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  numerologyData: {
    lifePathNumber?: number;
    expressionNumber?: number;
    soulUrgeNumber?: number;
    personalityNumber?: number;
    destinyNumber?: number;
    birthdayNumber?: number;
    maturityNumber?: number;
    personalYearNumber?: number;
    breakdown?: any;
  };
  comprehensiveReport?: any;
  sessionId?: string;
}

// Get conversation history
async function getConversationHistory(userId: string, sessionId?: string): Promise<Array<{ question: string; answer: string }>> {
  try {
    const db = getFirebaseDB();
    if (!db) return [];

    const session = sessionId || 'default';
    const historyRef = collection(db, 'users', userId, 'numerologyConversations', session, 'messages');
    const historyQuery = query(historyRef, orderBy('timestamp', 'desc'), limit(10));
    const snapshot = await getDocs(historyQuery);
    
    return snapshot.docs
      .reverse()
      .map(doc => doc.data())
      .filter(msg => msg.question && msg.answer)
      .map(msg => ({ question: msg.question, answer: msg.answer }));
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
}

// Store conversation
async function storeConversation(
  userId: string,
  sessionId: string | undefined,
  question: string,
  response: { answer: string; confidence?: number; followUpQuestions?: string[] }
): Promise<void> {
  try {
    const db = getFirebaseDB();
    if (!db) return;

    const session = sessionId || 'default';
    const messagesRef = collection(db, 'users', userId, 'numerologyConversations', session, 'messages');
    
    await setDoc(doc(messagesRef), {
      question,
      answer: response.answer,
      confidence: response.confidence || 0.85,
      timestamp: Date.now(),
      followUpQuestions: response.followUpQuestions || []
    });
  } catch (error) {
    console.error('Error storing conversation:', error);
  }
}

// Analyze numerology question type
function analyzeNumerologyQuestionType(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (/life.*path|life path|birth.*number|date.*number/.test(lowerQuestion)) {
    return 'life_path';
  }
  
  if (/expression|destiny.*number|name.*number|name.*value/.test(lowerQuestion)) {
    return 'expression';
  }
  
  if (/soul.*urge|soul urge|heart.*desire|inner.*desire/.test(lowerQuestion)) {
    return 'soul_urge';
  }
  
  if (/personality|how.*others.*see|outer.*self/.test(lowerQuestion)) {
    return 'personality';
  }
  
  if (/destiny|life.*purpose|ultimate.*purpose/.test(lowerQuestion)) {
    return 'destiny';
  }
  
  if (/personal.*year|current.*year|this.*year|year.*cycle/.test(lowerQuestion)) {
    return 'personal_year';
  }
  
  if (/career|job|work|profession|vocation/.test(lowerQuestion)) {
    return 'career';
  }
  
  if (/relationship|love|marriage|partner|romance/.test(lowerQuestion)) {
    return 'relationships';
  }
  
  if (/challenge|difficulty|struggle|obstacle/.test(lowerQuestion)) {
    return 'challenges';
  }
  
  if (/opportunity|strength|gift|talent/.test(lowerQuestion)) {
    return 'opportunities';
  }
  
  if (/remedy|remedies|solution|fix|improve/.test(lowerQuestion)) {
    return 'remedies';
  }
  
  return 'general';
}

// Build numerology context for AI
function buildNumerologyContext(numerologyData: NumerologySeerRequest['numerologyData'], userProfile: any, comprehensiveReport?: any): string {
  const lifePath = numerologyData.lifePathNumber || 0;
  const expression = numerologyData.expressionNumber || numerologyData.destinyNumber || 0;
  const soulUrge = numerologyData.soulUrgeNumber || 0;
  const personality = numerologyData.personalityNumber || 0;
  const destiny = numerologyData.destinyNumber || 0;
  const personalYear = numerologyData.personalYearNumber || calcPersonalYear(userProfile?.birthDate || '');
  
  const driver = calcDriver(userProfile?.birthDate || '');
  const conductor = calcConductor(userProfile?.birthDate || '');
  
  let context = `# Chaldean Numerology Profile

## Core Numbers
- **Life Path Number**: ${lifePath}${lifePath === 11 || lifePath === 22 || lifePath === 33 ? ' (Master Number)' : ''} - Your life's purpose and lessons
- **Expression Number (Destiny)**: ${expression}${expression === 11 || expression === 22 || expression === 33 ? ' (Master Number)' : ''} - Your natural talents and abilities
- **Soul Urge Number**: ${soulUrge}${soulUrge === 11 || soulUrge === 22 || soulUrge === 33 ? ' (Master Number)' : ''} - Your inner desires and motivations
- **Personality Number**: ${personality}${personality === 11 || personality === 22 || personality === 33 ? ' (Master Number)' : ''} - How others perceive you
- **Destiny Number**: ${destiny}${destiny === 11 || destiny === 22 || destiny === 33 ? ' (Master Number)' : ''} - Your ultimate life purpose

## Current Cycles
- **Personal Year**: ${personalYear}${personalYear === 11 || personalYear === 22 || personalYear === 33 ? ' (Master Number)' : ''} - Current year's themes and focus
- **Driver (Day Number)**: ${driver.reduced || driver.master || 'N/A'}${driver.master ? ` (Master ${driver.master})` : ''} - Daily operating style
- **Conductor (Full Date)**: ${conductor.reduced || conductor.master || 'N/A'}${conductor.master ? ` (Master ${conductor.master})` : ''} - Life's broader rhythm

## Number Combinations
The combination of Life Path ${lifePath}, Expression ${expression}, and Soul Urge ${soulUrge} creates a unique numerological signature that reveals your complete personality profile.
`;

  if (comprehensiveReport) {
    if (comprehensiveReport.profileOverview) {
      context += `\n## Profile Overview\n${comprehensiveReport.profileOverview}\n`;
    }
    if (comprehensiveReport.challengesAndOpportunities) {
      if (comprehensiveReport.challengesAndOpportunities.challenges?.length > 0) {
        context += `\n## Challenges\n${comprehensiveReport.challengesAndOpportunities.challenges.map((c: string) => `- ${c}`).join('\n')}\n`;
      }
      if (comprehensiveReport.challengesAndOpportunities.opportunities?.length > 0) {
        context += `\n## Opportunities\n${comprehensiveReport.challengesAndOpportunities.opportunities.map((o: string) => `- ${o}`).join('\n')}\n`;
      }
    }
  }

  return context;
}

// Build expert Chaldean system prompt: vibration-based, cycle gate, hierarchy, minimal remedy
function buildChaldeanSystemPrompt(chartSlice: string, questionType: ChaldeanQuestionType): string {
  return `You are an expert Chaldean Numerologist. You must reason ONLY from the numerology state below. Do not invent numbers or meanings not in the slice.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- Chaldean answers must be **vibration-based, not outcome-based**. Reason from the numerology state slice only.
- Numerology works in **cycles, not moments**. Personal Year modifies expression. Do not select an exact day; you can assess whether the current cycle supports initiation or alignment.
- **Number hierarchy** (strict priority): Life Path (core) > Name vibration > Birth number > Personal year. Resolve conflicts and explain dominance (e.g. "Even though your name vibration is supportive, your personal year creates resistance").
- **Remedy**: Allowed: favorable numbers, days of week, name spelling, color/sound resonance. Max 1 core alignment + 1 optional reinforcement. No heavy rituals or guarantees.
- **Never** give exact dates for events. Refuse medical, legal, or certainty predictions. Phrase: "Numerology aligns identity with action; it does not force outcomes."
- Be direct; no beating around the bush. Descriptive but brief. Show number interaction and cycle awareness.

## Numerology state (use only these)
${chartSlice}

## Question type
${questionType}

Answer the user's question with specific references to the numbers above.`;
}

// Generate follow-up questions
function generateNumerologyFollowUpQuestions(questionType: string, numerologyData: NumerologySeerRequest['numerologyData']): string[] {
  const lifePath = numerologyData.lifePathNumber || 0;
  const expression = numerologyData.expressionNumber || numerologyData.destinyNumber || 0;
  
  const questions: string[] = [];
  
  if (questionType !== 'life_path') {
    questions.push(`What does my Life Path Number ${lifePath} reveal about my life purpose?`);
  }
  
  if (questionType !== 'expression') {
    questions.push(`How can I express my Expression Number ${expression} more authentically?`);
  }
  
  if (questionType !== 'personal_year') {
    questions.push(`What should I focus on during my current Personal Year?`);
  }
  
  questions.push(`What are the challenges and opportunities in my numerology profile?`);
  questions.push(`How can I use numerology to improve my relationships?`);
  
  return questions.slice(0, 4);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, question, userProfile, numerologyData, comprehensiveReport, sessionId }: NumerologySeerRequest = await request.json();

    if (!userId || !question || !userProfile || !numerologyData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId, question, userProfile, or numerologyData'
      }, { status: 400 });
    }

    devLog.info('🔮 Numerology Seer API: Processing question for user:', userId, 'ask-numerology-seer');

    // Classify question; refuse exact timing, medical, legal, wealth certainty, etc.
    const questionType = classifyChaldeanQuestion(question);
    if (questionType === 'refusal') {
      const refusalMessage =
        'Numerology describes alignment, not guarantees. It cannot give exact dates or deterministic outcomes. I can help with name vibration, cycles, and alignment instead.';
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(refusalMessage));
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

    // Build state and slice (expert: reason only from slice)
    const state = buildChaldeanState(numerologyData, userProfile, comprehensiveReport);
    const chartSlice = getChaldeanSliceForQuestionType(questionType, state);

    // Initialize conversational memory with cross-session context
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

    // Stream conversational response via AI Gateway (slice-based prompt)
    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildChaldeanSystemPrompt(chartSlice, questionType),
        },
        ...conversationHistory.flatMap((h) =>
          h ? [
            { role: 'user' as const, content: h.question },
            { role: 'assistant' as const, content: h.answer },
          ] : []
        ),
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Return streaming response
    return new Response(
      new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            
            // Store in unified memory system
            const userMessage: MemoryMessage = {
              id: `msg_${Date.now()}_user`,
              timestamp: Date.now(),
              type: 'user',
              content: question,
              questionType: questionType as string,
              keywords: question.split(' ').slice(0, 5),
            };

            const seerMessage: MemoryMessage = {
              id: `msg_${Date.now()}_seer`,
              timestamp: Date.now(),
              type: 'seer',
              content: fullResponse,
              questionType: questionType as string,
              confidence: 0.9,
              sources: ['numerology'],
            };

            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question);
            await memory.saveAllMemory();

            await storeConversation(userId, sessionId, question, {
              answer: fullResponse,
              confidence: 0.90,
              followUpQuestions: generateNumerologyFollowUpQuestions(questionType as string, numerologyData),
            });
            
          } catch (error) {
            console.error('Error during streaming:', error);
            controller.enqueue(new TextEncoder().encode('I apologize, but I encountered an error. Please try again.'));
          } finally {
            controller.close();
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      }
    );

  } catch (error) {
    console.error('Error in Numerology Seer API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

