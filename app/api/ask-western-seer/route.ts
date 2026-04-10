import { NextRequest, NextResponse } from 'next/server';
import { appendAttribution } from '@/lib/attribution/attributionStamp';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { parseDatesFromQuestion, formatDateForContext } from '@/lib/dateParser';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';
import { calculateLifePathNumber, calculateDestinyNumber } from '@/lib/numerologyCalculations';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import { buildChartState, getChartSliceForQuestionType } from '@/lib/westernChartState';
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline';
import { getWesternReportChunksForUser, getSectionsForIntent, formatChunksForPrompt } from '@/lib/westernSeerRetrieval';
import { buildWesternRetrievalSystemPrompt } from '@/lib/westernSeerPrompts';

const X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet';
const SEER_MARKER_FAMILY = 'ask-western-seer';

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


type WesternChartPlanet = {
  name?: string;
  sign?: { signName?: string } | string;
  house?: number | string;
  degree?: number;
  isRetrograde?: boolean;
};

type WesternChartData = Record<string, unknown> & {
  planets?: WesternChartPlanet[];
  houses?: Array<{
    sign?: { signName?: string } | string;
    signName?: string;
    degree?: number;
  }>;
  aspects?: Array<{
    strength?: number;
    orb?: number;
    type?: string;
    planet1?: string;
    planet2?: string;
  }>;
  transits?:
    | Array<Record<string, unknown> & { name?: string; sign?: string; degree?: number; isRetrograde?: boolean; house?: number }>
    | { favorable?: string[]; challenging?: string[] };
};

type WesternTransitRow = Record<string, unknown> & {
  name?: string;
  sign?: string;
  degree?: number;
  isRetrograde?: boolean;
  house?: number;
};

interface WesternSeerRequest {
  userId: string;
  question: string;
  userProfile: Record<string, unknown>;
  westernChartData: WesternChartData;
  astroNumerologyData?: {
    sunSign: string;
    lifePathNumber: number;
    nameNumber: number;
    comprehensiveReport?: Record<string, unknown>;
  };
  sessionId?: string;
}

interface WesternSeerStoredPayload {
  answer: string;
  confidence: number;
  chartReferences: {
    planets: string[];
    houses: number[];
    aspects: string[];
    signs: string[];
  };
  timing: {
    favorable: string[];
    challenging: string[];
  };
  followUpQuestions: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { userId, question, userProfile, westernChartData, astroNumerologyData, sessionId }: WesternSeerRequest = await request.json();

    if (!userId || !question || !userProfile) {
      return jsonWithRobots({
        success: false,
        error: 'Missing required parameters: userId, question, or userProfile'
      }, { status: 400 });
    }

    if (!westernChartData) {
      return jsonWithRobots({
        success: false,
        error: 'Missing Western chart data. Please ensure you are accessing this from the Western astrology page.'
      }, { status: 400 });
    }

    devLog.info('🔮 Western Seer API: Processing question for user:', userId, 'ask-western-seer');

    // Fetch or calculate Astro-Numerology data if not provided
    let numerologyData = astroNumerologyData;
    if (!numerologyData && userProfile?.birthDate && userProfile?.displayName) {
      try {
        const sunPlanet = westernChartData.planets?.find((p) => p.name === 'Sun');
        const sunSignRaw = sunPlanet?.sign;
        const sunSign =
          typeof sunSignRaw === 'string'
            ? sunSignRaw
            : sunSignRaw && typeof sunSignRaw === 'object' && 'signName' in sunSignRaw
              ? String((sunSignRaw as { signName?: string }).signName ?? 'Unknown')
              : 'Unknown';
        const lifePathNumber = calculateLifePathNumber(
          typeof userProfile.birthDate === 'string' ? userProfile.birthDate : String(userProfile.birthDate ?? '')
        );
        const fullName = String(userProfile.displayName ?? userProfile.fullName ?? '');
        const nameNumber = calculateDestinyNumber(fullName);
        
        numerologyData = {
          sunSign,
          lifePathNumber,
          nameNumber
        };
        devLog.info('✅ Calculated Astro-Numerology data on-the-fly', undefined, 'ask-western-seer');
      } catch (error) {
        devLog.warn('⚠️ Failed to calculate Astro-Numerology data:', error, 'ask-western-seer');
      }
    }

    // Analyze question type early so we can compute default future transits for timing/career when no date in question
    const questionType = analyzeWesternQuestionType(question);

    // Parse dates from question for future transit calculations
    const parsedDates = parseDatesFromQuestion(question);
    let futureTransits: WesternTransitRow[] | null = null;
    let futureTransitsByDate: Array<{ date: string; transits: WesternTransitRow[] }> | null = null;

    const isFullYearRange = parsedDates?.endDate && parsedDates.isDateRange &&
      parsedDates.startDate.getUTCMonth() === 0 && parsedDates.startDate.getUTCDate() === 1 &&
      parsedDates.endDate.getUTCMonth() === 11 && parsedDates.endDate.getUTCDate() === 31 &&
      parsedDates.startDate.getUTCFullYear() === parsedDates.endDate.getUTCFullYear();

    if (parsedDates) {
      devLog.debug('📅 Dates detected in question:', parsedDates.rawText, 'ask-western-seer');
      devLog.debug('📅 Start date:', formatDateForContext(parsedDates.startDate), 'ask-western-seer');

      const birthData: BirthData = {
        birthDate: String(userProfile.birthDate ?? ''),
        birthTime: String(userProfile.birthTime ?? ''),
        birthPlace: String(userProfile.birthPlace ?? ''),
        latitude: Number(userProfile.birthLatitude) || 12.3051828,
        longitude: Number(userProfile.birthLongitude) || 76.6553609
      };

      if (isFullYearRange) {
        // Quarterly transits for the full year: Jan 1, Apr 1, Jul 1, Oct 1
        const year = parsedDates.startDate.getUTCFullYear();
        const quarterlyDates = [
          new Date(Date.UTC(year, 0, 1)),
          new Date(Date.UTC(year, 3, 1)),
          new Date(Date.UTC(year, 6, 1)),
          new Date(Date.UTC(year, 9, 1))
        ];
        futureTransitsByDate = [];
        try {
          for (const d of quarterlyDates) {
            const transitChartData = await universalOccultService.calculateWesternChart(birthData, {
              houseSystem: 'placidus',
              includeAspects: false,
              includeTransits: true,
              transitDate: d.toISOString()
            });
            futureTransitsByDate.push({
              date: formatDateForContext(d),
              transits: transitChartData.data.transits || []
            });
          }
          devLog.info('✅ Future transits calculated for quarterly dates in', year, 'ask-western-seer');
        } catch (error) {
          devLog.error('⚠️ Failed to calculate quarterly future transits:', error);
          futureTransitsByDate = null;
        }
      } else {
        // Single date: use startDate
        try {
          const transitChartData = await universalOccultService.calculateWesternChart(birthData, {
            houseSystem: 'placidus',
            includeAspects: false,
            includeTransits: true,
            transitDate: parsedDates.startDate.toISOString()
          });
          futureTransits = transitChartData.data.transits;
          devLog.info('✅ Future transits calculated for', formatDateForContext(parsedDates.startDate), 'ask-western-seer');
        } catch (error) {
          devLog.error('⚠️ Failed to calculate future transits:', error);
        }
      }
    } else if (!parsedDates && (questionType === 'timing' || questionType === 'career')) {
      // Default future transits for next 4 months when user asks about favorable period but does not specify a date
      const birthData: BirthData = {
        birthDate: String(userProfile.birthDate ?? ''),
        birthTime: String(userProfile.birthTime ?? ''),
        birthPlace: String(userProfile.birthPlace ?? ''),
        latitude: Number(userProfile.birthLatitude) || 12.3051828,
        longitude: Number(userProfile.birthLongitude) || 76.6553609
      };
      const now = new Date();
      const defaultDates = [
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 1)),
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 3, 1)),
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 4, 1))
      ];
      futureTransitsByDate = [];
      try {
        for (const d of defaultDates) {
          const transitChartData = await universalOccultService.calculateWesternChart(birthData, {
            houseSystem: 'placidus',
            includeAspects: false,
            includeTransits: true,
            transitDate: d.toISOString()
          });
          futureTransitsByDate.push({
            date: formatDateForContext(d),
            transits: transitChartData.data.transits || []
          });
        }
        devLog.info('✅ Default future transits calculated for timing/career (next 5 months)', undefined, 'ask-western-seer');
      } catch (error) {
        devLog.error('⚠️ Failed to calculate default future transits:', error);
        futureTransitsByDate = null;
      }
    }

    // Initialize conversational memory with cross-session context
    const memory = new ConversationalMemory(userId);
    await memory.initializeAllMemory(true);
    
    // Get conversation history from unified memory system
    const workingMemory = memory.getWorkingMemory();
    const conversationHistory = workingMemory.lastExchanges
      .filter((msg: MemoryMessage) => msg.type === 'user' || msg.type === 'seer')
      .map((msg: MemoryMessage, index: number, arr: MemoryMessage[]) => {
        if (msg.type === 'user') {
          const seerResponse = arr[index + 1];
          return {
            question: msg.content,
            answer: seerResponse?.type === 'seer' ? seerResponse.content : ''
          };
        }
        return null;
      })
      .filter((item): item is { question: string; answer: string } => item !== null)
      .slice(-10);

    // Refusal: synastry requires partner chart — we only have the user's natal + transits
    const synastryRefusalMessage = "Relationship comparison (synastry) requires a partner's birth data. Please use the Synastry tool with both birth details to get insights into compatibility.";
    if (questionType === 'synastry') {
      devLog.info('🔮 Western Seer: Refusing synastry question (no partner chart)', undefined, 'ask-western-seer');
      return withRobotsResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(synastryRefusalMessage));
            appendAttributionTail(controller);
            controller.close();
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
    }

    // Prefer retrieval from stored report chunks when available; else chart-slice fallback
    let systemPromptContent: string;
    const reportChunks = await getWesternReportChunksForUser(userId);
    if (reportChunks) {
      const chunkKeys = getSectionsForIntent(questionType);
      const chunkContext = formatChunksForPrompt(reportChunks, chunkKeys);
      systemPromptContent = buildWesternRetrievalSystemPrompt(chunkContext);
      devLog.info('✅ Western Seer: using retrieval path (report chunks)', undefined, 'ask-western-seer');
    } else {
      const chartState = buildChartState(
        westernChartData,
        futureTransits ?? undefined,
        futureTransitsByDate ?? undefined
      );
      const chartSlice = getChartSliceForQuestionType(questionType, chartState);
      const numerologyContext = numerologyData ? buildAstroNumerologyContext(numerologyData) : '';
      systemPromptContent = buildWesternSystemPrompt(chartSlice, numerologyContext, questionType);
    }

    // Stream conversational response via AI Gateway or direct Groq
    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile', // Fast, high-quality, free tier
      messages: [
        {
          role: 'system',
          content: systemPromptContent
        },
        ...conversationHistory.flatMap((h) =>
          h ? [
            { role: 'user' as const, content: h.question },
            { role: 'assistant' as const, content: h.answer },
          ] : []
        ),
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      maxTokens: 1000
    });

    // Return streaming response (500+ tokens/second!)
    return withRobotsResponse(
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
            
            // Store conversation in unified memory system
            const userMessage: MemoryMessage = {
              id: `msg_${Date.now()}_user`,
              timestamp: Date.now(),
              type: 'user',
              content: question,
              questionType: questionType,
              keywords: question.split(' ').slice(0, 5)
            };
            
            const seerMessage: MemoryMessage = {
              id: `msg_${Date.now()}_seer`,
              timestamp: Date.now(),
              type: 'seer',
              content: fullResponse,
              questionType: questionType,
              confidence: 0.9,
              sources: ['western-astrology']
            };
            
            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question);
            await memory.saveAllMemory();
            
            // Also store in old format for backward compatibility
            const transitSummary =
              westernChartData.transits &&
              typeof westernChartData.transits === 'object' &&
              !Array.isArray(westernChartData.transits)
                ? (westernChartData.transits as { favorable?: string[]; challenging?: string[] })
                : null;
            await storeConversation(userId, sessionId, question, {
              answer: fullResponse,
              confidence: 0.90,
              chartReferences: extractWesternChartReferences(fullResponse),
              timing: {
                favorable: transitSummary?.favorable ?? [],
                challenging: transitSummary?.challenging ?? []
              },
              followUpQuestions: generateWesternFollowUpQuestions(questionType, numerologyData)
            });
            
          } catch (error) {
            devLog.error('Error during streaming:', error);
            controller.enqueue(new TextEncoder().encode(stampText('I apologize, but I encountered an error. Please try again.')));
          } finally {
            appendAttributionTail(controller);
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
    devLog.error('Error in Western Seer API:', error);
    return jsonWithRobots({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Analyze Western astrology question type
function analyzeWesternQuestionType(question: string): string {
  const lowerQuestion = question.toLowerCase();

  // Synastry / relationship comparison (requires partner chart — refuse)
  if (/synastry|compatibility.*with.*(another|partner|someone|him|her|them)|compare.*(our|two).*charts|our.*charts|relationship.*between.*(me|us).*and|compatibility.*between/.test(lowerQuestion) ||
      /partner.*chart|their.*birth|another.*person.*chart|two.*birth.*charts/.test(lowerQuestion)) {
    return 'synastry';
  }

  // Timing / when questions (use transits; progressions not available)
  if (/when.*should|when.*will|when.*is.*(good|best)|timing|best.*time|good.*time|when.*to.*(act|start|move)/.test(lowerQuestion) &&
      !/relationship|partner|compatibility/.test(lowerQuestion)) {
    return 'timing';
  }

  // Electional (choosing a time)
  if (/electional|choose.*(time|date)|best.*(day|date).*for|auspicious.*(time|date)/.test(lowerQuestion)) {
    return 'electional';
  }

  // Sun sign questions
  if (/sun.*sign|leo|aries|taurus|gemini|cancer|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces/i.test(lowerQuestion) &&
      /personality|traits|character|identity|ego|core|essence/.test(lowerQuestion)) {
    return 'sun_sign';
  }

  // Moon sign questions
  if (/moon.*sign|emotional|feelings|emotions|inner.*self|subconscious/.test(lowerQuestion)) {
    return 'moon_sign';
  }

  // Rising/Ascendant questions
  if (/rising|ascendant|first.*impression|appearance|how.*others.*see/.test(lowerQuestion)) {
    return 'rising_sign';
  }

  // Aspect questions
  if (/aspect|conjunction|square|trine|sextile|opposition|angle/.test(lowerQuestion)) {
    return 'aspects';
  }

  // Transit questions
  if (/transit|current|now|today|this.*month|this.*year|affecting.*me/.test(lowerQuestion)) {
    return 'transits';
  }

  // House questions
  if (/house|1st.*house|2nd.*house|3rd.*house|4th.*house|5th.*house|6th.*house|7th.*house|8th.*house|9th.*house|10th.*house|11th.*house|12th.*house/.test(lowerQuestion)) {
    return 'houses';
  }

  // Career questions
  if (/career|job|work|profession|vocation|calling|10th.*house|midheaven/.test(lowerQuestion)) {
    return 'career';
  }

  // Relationship questions (single-person chart only; synastry handled above)
  if (/relationship|love|marriage|partner|romance|7th.*house|venus/.test(lowerQuestion)) {
    return 'relationships';
  }
  
  // Money/wealth questions
  if (/money|wealth|financial|income|2nd.*house|8th.*house/.test(lowerQuestion)) {
    return 'wealth';
  }
  
  // Life purpose questions
  if (/purpose|meaning|why.*born|destiny|calling|north.*node/.test(lowerQuestion)) {
    return 'life_purpose';
  }
  
  // Remedy questions
  if (/remedy|remedies|solution|fix|improve|help|what.*should.*i.*do|how.*can.*i.*overcome|how.*can.*i.*deal|how.*can.*i.*handle|what.*can.*i.*do|suggestions.*for|advice.*for|guidance.*for/.test(lowerQuestion)) {
    return 'remedies';
  }
  
  // Astro-Numerology specific questions
  if (/life.*path.*number|life path|birth.*number|date.*number|path.*number/.test(lowerQuestion)) {
    return 'life_path_number';
  }
  
  if (/name.*number|destiny.*number|name.*value|name.*calculation|destiny/.test(lowerQuestion)) {
    return 'name_number';
  }
  
  if (/astro.*numerology|numerology|combining.*sun.*sign|sun.*sign.*and.*number/.test(lowerQuestion)) {
    return 'astro_numerology';
  }
  
  if (/life.*path.*and.*sun|name.*number.*and.*sun|combining.*both|both.*systems|sun.*sign.*and.*life.*path/.test(lowerQuestion)) {
    return 'combined_analysis';
  }
  
  return 'general';
}

// Build Astro-Numerology context
function buildAstroNumerologyContext(numerologyData: {
  sunSign: string;
  lifePathNumber: number;
  nameNumber: number;
  comprehensiveReport?: Record<string, unknown>;
}): string {
  const { sunSign, lifePathNumber, nameNumber, comprehensiveReport } = numerologyData;
  
  // Life Path Number meanings
  const lifePathMeanings: { [key: number]: string } = {
    1: 'The Pioneer - Leadership, independence, innovation',
    2: 'The Mediator - Cooperation, diplomacy, sensitivity',
    3: 'The Communicator - Creativity, expression, joy',
    4: 'The Builder - Stability, organization, hard work',
    5: 'The Adventurer - Freedom, change, experience',
    6: 'The Nurturer - Responsibility, harmony, service',
    7: 'The Seeker - Analysis, spirituality, wisdom',
    8: 'The Achiever - Power, material success, authority',
    9: 'The Humanitarian - Compassion, idealism, completion',
    11: 'The Intuitive - Spiritual insight, inspiration, illumination',
    22: 'The Master Builder - Practical vision, large-scale achievement',
    33: 'The Master Teacher - Universal love, healing, guidance'
  };
  
  // Name Number meanings
  const nameNumberMeanings: { [key: number]: string } = {
    1: 'Natural leader with strong willpower and determination',
    2: 'Diplomatic peacemaker with intuitive understanding',
    3: 'Creative communicator with artistic talents',
    4: 'Practical organizer with strong work ethic',
    5: 'Versatile explorer with adaptability and freedom',
    6: 'Responsible caregiver with nurturing qualities',
    7: 'Analytical thinker with spiritual depth',
    8: 'Ambitious achiever with material success',
    9: 'Compassionate humanitarian with universal love',
    11: 'Intuitive visionary with spiritual gifts',
    22: 'Master builder with practical wisdom',
    33: 'Master teacher with healing abilities'
  };
  
  let context = `# Astro-Numerology Profile

## Core Numbers
- **Sun Sign**: ${sunSign} (Western Astrology - Core personality and identity)
- **Life Path Number**: ${lifePathNumber}${lifePathNumber === 11 || lifePathNumber === 22 || lifePathNumber === 33 ? ' (Master Number)' : ''}
  - ${lifePathMeanings[lifePathNumber] || 'Life journey and purpose'}
- **Name Number (Destiny Number)**: ${nameNumber}${nameNumber === 11 || nameNumber === 22 || nameNumber === 33 ? ' (Master Number)' : ''}
  - ${nameNumberMeanings[nameNumber] || 'Natural talents and destiny'}

## How They Work Together
The combination of your Sun Sign (${sunSign}), Life Path Number (${lifePathNumber}), and Name Number (${nameNumber}) creates a unique energetic profile. Your Sun Sign reveals your core identity and how you express yourself, your Life Path Number shows your life's journey and lessons, and your Name Number indicates your natural talents and destiny path.
`;

  // Add comprehensive report sections if available
  if (comprehensiveReport) {
    const str = (k: string) => {
      const v = comprehensiveReport[k];
      return typeof v === 'string' ? v : '';
    };
    const lines = (k: string) => {
      const v = comprehensiveReport[k];
      if (!Array.isArray(v)) return '';
      return v.filter((x): x is string => typeof x === 'string').map((c) => `- ${c}`).join('\n');
    };
    if (str('personalitySynthesis')) {
      context += `\n## Personality Synthesis\n${str('personalitySynthesis')}\n`;
    }
    if (str('careerGuidance')) {
      context += `\n## Career & Life Path Guidance\n${str('careerGuidance')}\n`;
    }
    if (str('relationshipInsights')) {
      context += `\n## Relationship Dynamics\n${str('relationshipInsights')}\n`;
    }
    if (str('lifePurpose')) {
      context += `\n## Life Purpose & Destiny\n${str('lifePurpose')}\n`;
    }
    if (str('personalGrowth')) {
      context += `\n## Personal Growth Roadmap\n${str('personalGrowth')}\n`;
    }
    const ch = lines('challenges');
    if (ch) context += `\n## Challenges\n${ch}\n`;
    const op = lines('opportunities');
    if (op) context += `\n## Opportunities\n${op}\n`;
  }

  return context;
}

// Build system prompt for Western astrology and Astro-Numerology (strict: reason only from chart slice)
function buildWesternSystemPrompt(chartSlice: string, numerologyContext: string, questionType: string): string {
  const hasNumerology = numerologyContext.length > 0;

  const basePrompt = `You are an expert in Western Astrology${hasNumerology ? ' and Astro-Numerology' : ''}. You must reason ONLY from the chart facts provided below. You do not decide astrology facts; you decide what to look at in the slice, then explain.
${SEER_GOVERNING_SENTENCE}

## CRITICAL RULES
- Answer strictly using the following chart facts. Do not use generic astrology knowledge.
- If data is missing for a non-timing question, say so explicitly (e.g. "This can't be concluded without progressions"). For timing questions (launch, release, marriage, relocation, etc.), use the Timing fallback below to give derived guidance from natal placements before refusing.
- Never improvise meanings or add placements not in the slice. Do not invent calendar dates or mention transits not in the slice. If the slice doesn't contain something and it's not a timing question, say "data not available" or "can't be concluded without [X]".
- Use Western terminology only: Sun sign, Moon sign, Rising sign, aspects (conjunction, square, trine, sextile, opposition), houses, transits. DO NOT mention Vedic concepts (nakshatras, dashas, Rahu/Ketu, sidereal).

## CHART FACTS (use only these)
${chartSlice}
${hasNumerology ? `\n${numerologyContext}` : ''}

## Chart context
- The chart facts above are from the user's Western birth chart. This chat is on the Western astrology tool page with their birth data. Never say "there is no information provided about the individual's birth chart," "no birth chart," or "no chart data"—if chart facts are present, the chart is provided.
- For questions astrology cannot or should not answer (e.g. death, exact life expectancy, exact date of death), refuse in one short sentence and do not claim missing data. Example: "Astrology cannot predict death or life expectancy. I have your chart from this page, but I don't use it for that."

## EXPLANATION LAYER (how to answer)
- State why you're saying something: reference placements explicitly (e.g. "This comes from Saturn transiting your 10th house Sun...").
- Avoid absolutes; use language like "often correlates with," "can suggest," "may indicate."
- If data is missing for a non-timing question: say "This can't be concluded without [X]." For timing questions, use the Timing fallback below before refusing.
- Keep answers short: 1–2 sentences when possible. For timing/electional, state the date and one brief reason when transit data exists; avoid long paragraphs unless the user asks for more detail. Be conversational, warm, and supportive. Be direct; no beating around the bush. Descriptive but brief.

## Timing fallback
- If the user asks for timing (launch, release, marriage, relocation, etc.) and exact dates or transit data are not in the chart facts, do not only say "can't be concluded." Use the natal chart (e.g. 10th/6th/7th house, Sun, Mercury, Jupiter) to give favorable periods, themes, or preparation/action guidance. Allowed: favorable periods, themes, avoid/prepare/proceed guidance. Not allowed: inventing dates, mentioning transits not in the slice.

## Future dates
- If "Future transits" are in the chart facts above, USE THEM for timing questions. Never say you need exact transits for that period if they are already provided.
- If "Future transits for [date]" appears in the chart facts for a date the user asked about, you have transit data for that date—use it and do not say you need more data for that date.
- When giving a single best date, put that date on the first line of your answer, then the full reasoning below.

## Western "Remedies"
- In Western astrology, remedies are psychological and practical, NOT ritualistic. Focus on self-awareness, mindfulness, lifestyle adjustments, and professional counseling/therapy when appropriate. Do not suggest gemstones, mantras, or talismans.

`;

  // Add question-type specific guidance
  const typeGuidance: Record<string, string> = {
    sun_sign: `Focus on: Core identity, life purpose, ego expression, creative potential, leadership style`,
    moon_sign: `Focus on: Emotional needs, inner world, subconscious patterns, comfort zones, nurturing style`,
    rising_sign: `Focus on: Outer personality, first impressions, life approach, physical appearance, life path`,
    aspects: `Focus on: Planetary relationships, inner dynamics, challenges and gifts, integration of energies`,
    transits: `Focus on: Current planetary influences, timing, opportunities, challenges, growth areas`,
    timing: `Focus on: Transits (current and future if provided). Use only transit data in the slice. When Current transits or Future transits are present in the chart facts, you MUST include at least one specific favorable date or window (e.g. **YYYY-MM-DD** or "early March", "mid-April") in your answer. First line = recommended date or window; then reasoning. If no transit dates are in the slice, still give derived timing from natal placements (periods, themes, preparation vs action) instead of refusing. If progressions are noted as not available, say so. Do not end with "timing isn't indicated" without first offering the best available dates or windows, or Tier 2 guidance.`,
    electional: `Focus on: Transits for the asked date. Use only transit data in the slice. When transit data is present, you MUST include at least one specific favorable date or window (e.g. **YYYY-MM-DD** or "early March"). First line = recommended date or window; then reasoning. If data for the date is missing, say "This can't be concluded without transit data for that date."`,
    synastry: `(Not used — synastry questions are refused; partner chart required.)`,
    houses: `Focus on: Life areas, experiences, where energies manifest, environmental influences`,
    career: `Focus on: 10th house, Midheaven, Sun/Saturn placements, vocational indicators, success potential. When the slice includes "Current transits" or "Future transits for [date]", the answer must include at least one favorable date or window for career (e.g. recommended date or "Good windows: early March, late April") before any caveat. If no transit dates are in the slice, still give derived timing from natal placements (periods, themes, preparation vs action) instead of refusing.`,
    relationships: `Focus on: 7th house, Venus/Mars placements, partnership patterns, love style (single chart only)`,
    wealth: `Focus on: 2nd house (earned income), 8th house (shared resources), Jupiter/Saturn aspects`,
    life_purpose: `Focus on: Sun placement, North Node, 10th house, major aspects, life direction. If Astro-Numerology data is available, also integrate Life Path Number insights about life purpose.`,
    remedies: `Focus on: Psychological techniques, self-awareness practices, lifestyle adjustments, mindfulness, conscious engagement with chart energies. Emphasize that Western astrology uses self-knowledge and free will, not ritualistic solutions. Provide practical guidance for working with challenging planetary placements through self-reflection, counseling/therapy if appropriate, and developing conscious awareness of planetary influences.`,
    life_path_number: `Focus on: Life Path Number meaning, life journey, lessons to learn, how the number influences personality and life direction. If Sun Sign is available, explain how Life Path Number and Sun Sign work together.`,
    name_number: `Focus on: Name Number (Destiny Number) meaning, natural talents, destiny path, how the name influences personality. If Sun Sign is available, explain how Name Number and Sun Sign complement each other.`,
    astro_numerology: `Focus on: The combination of Sun Sign, Life Path Number, and Name Number. Explain how these three elements work together to create a unique personality profile. Discuss the synthesis of astrological and numerological insights.`,
    combined_analysis: `Focus on: Integrating insights from both Western Astrology and Astro-Numerology. Show how the Sun Sign, Life Path Number, and Name Number work together with planetary placements, houses, and aspects. Provide a holistic analysis that combines both systems.`,
    general: `Provide a balanced overview touching on the most relevant areas. If Astro-Numerology data is available, consider integrating numerological insights where relevant.`
  };

  return basePrompt + `\n## Question Type: ${questionType}\n${typeGuidance[questionType] || typeGuidance.general}`;
}

interface WesternChartRefExtraction {
  planets: string[];
  houses: number[];
  aspects: string[];
  signs: string[];
}

// Extract chart references from response
function extractWesternChartReferences(response: string): WesternChartRefExtraction {
  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const aspects = ['conjunction', 'square', 'trine', 'sextile', 'opposition'];
  
  return {
    planets: planets.filter(p => response.includes(p)),
    houses: Array.from({ length: 12 }, (_, i) => i + 1).filter(h => 
      response.includes(`${h}th house`) || response.includes(`${h}st house`) || response.includes(`${h}nd house`) || response.includes(`${h}rd house`)
    ),
    aspects: aspects.filter(a => response.includes(a)),
    signs: signs.filter(s => response.includes(s))
  };
}

// Generate follow-up questions
function generateWesternFollowUpQuestions(
  questionType: string,
  numerologyData?: WesternSeerRequest['astroNumerologyData']
): string[] {
  const hasNumerology = !!numerologyData;
  
  const followUps: Record<string, string[]> = {
    sun_sign: [
      'How can I express my Sun sign energy more authentically?',
      'What challenges does my Sun sign face?',
      'How does my Sun sign interact with my Moon sign?',
      ...(hasNumerology ? ['How does my Sun sign work with my Life Path Number?'] : [])
    ],
    moon_sign: [
      'What emotional patterns should I be aware of?',
      'How can I better nurture my emotional needs?',
      'How does my Moon sign affect my relationships?'
    ],
    rising_sign: [
      'How can I align my outer personality with my inner self?',
      'What life lessons is my Rising sign teaching me?',
      'How do others typically perceive me?'
    ],
    aspects: [
      'What are my most powerful planetary aspects?',
      'How can I work with challenging aspects?',
      'What gifts do my harmonious aspects bring?'
    ],
    transits: [
      'What should I focus on during this transit?',
      'When will this transit end?',
      'What other transits are coming up?'
    ],
    career: [
      'What career path suits my chart best?',
      'When is a good time for career changes?',
      'How can I achieve success in my field?',
      ...(hasNumerology ? ['How does my Name Number influence my career path?'] : [])
    ],
    relationships: [
      'What type of partner suits me best?',
      'What relationship patterns should I be aware of?',
      'How can I improve my relationships?'
    ],
    life_path_number: [
      'What does my Life Path Number reveal about my life purpose?',
      'How does my Life Path Number influence my personality?',
      'What lessons am I here to learn according to my Life Path Number?',
      ...(hasNumerology ? ['How does my Life Path Number work with my Sun Sign?'] : [])
    ],
    name_number: [
      'What does my Name Number say about my natural talents?',
      'How does my Name Number influence my destiny?',
      'What career paths align with my Name Number?',
      ...(hasNumerology ? ['How does my Name Number complement my Sun Sign?'] : [])
    ],
    astro_numerology: [
      'How do my Sun Sign, Life Path Number, and Name Number work together?',
      'What insights can I gain from combining astrology and numerology?',
      'How can I use my Astro-Numerology profile for personal growth?'
    ],
    combined_analysis: [
      'How do my astrological and numerological energies combine?',
      'What are the strengths of my combined profile?',
      'How can I align with both my astrological and numerological purpose?'
    ],
    general: [
      'What are my greatest strengths according to my chart?',
      'What challenges should I be aware of?',
      'What is my chart telling me about my life purpose?',
      ...(hasNumerology ? ['How can I use both my astrological and numerological insights?'] : [])
    ]
  };

  return followUps[questionType] || followUps.general;
}

// Store conversation
async function storeConversation(
  userId: string,
  sessionId: string | undefined,
  question: string,
  response: WesternSeerStoredPayload
) {
  try {
    const db = getFirebaseDB();
    const session = sessionId || `session_${Date.now()}`;
    const timestamp = Date.now();
    
    const messageId = `msg_${timestamp}`;
    const messageRef = doc(db, 'westernSeerConversations', userId, 'sessions', session, 'messages', messageId);
    
    await setDoc(messageRef, {
      question,
      answer: response.answer,
      timestamp,
      confidence: response.confidence,
      chartReferences: response.chartReferences,
      followUpQuestions: response.followUpQuestions
    });
    
    devLog.info('✅ Western Seer conversation stored successfully', undefined, 'ask-western-seer');
  } catch (error) {
    devLog.error('Error storing conversation:', error);
  }
}

