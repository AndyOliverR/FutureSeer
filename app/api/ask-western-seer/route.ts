import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { createAIStream } from '@/lib/aiGateway';
import { parseDatesFromQuestion, formatDateForContext } from '@/lib/dateParser';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';
import { calculateLifePathNumber, calculateDestinyNumber } from '@/lib/numerologyCalculations';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import { buildChartState, getChartSliceForQuestionType } from '@/lib/westernChartState';
import { SEER_GOVERNING_SENTENCE } from '@/lib/askTheSeerDiscipline';

interface WesternSeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  westernChartData: any; // Accept pre-generated Western chart data
  astroNumerologyData?: {
    sunSign: string;
    lifePathNumber: number;
    nameNumber: number;
    comprehensiveReport?: any; // Full comprehensive report if available
  };
  sessionId?: string;
}

interface WesternSeerResponse {
  success: boolean;
  data: {
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
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, question, userProfile, westernChartData, astroNumerologyData, sessionId }: WesternSeerRequest = await request.json();

    if (!userId || !question || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId, question, or userProfile'
      }, { status: 400 });
    }

    if (!westernChartData) {
      return NextResponse.json({
        success: false,
        error: 'Missing Western chart data. Please ensure you are accessing this from the Western astrology page.'
      }, { status: 400 });
    }

    devLog.info('🔮 Western Seer API: Processing question for user:', userId, 'ask-western-seer');

    // Fetch or calculate Astro-Numerology data if not provided
    let numerologyData = astroNumerologyData;
    if (!numerologyData && userProfile?.birthDate && userProfile?.displayName) {
      try {
        const sunSign = westernChartData.planets?.find((p: any) => p.name === 'Sun')?.sign?.signName || 
                       westernChartData.planets?.find((p: any) => p.name === 'Sun')?.sign || 'Unknown';
        const lifePathNumber = calculateLifePathNumber(userProfile.birthDate);
        const fullName = userProfile.displayName || userProfile.fullName || '';
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

    // Parse dates from question for future transit calculations
    const parsedDates = parseDatesFromQuestion(question);
    let futureTransits: any[] | null = null;
    let futureTransitsByDate: Array<{ date: string; transits: any[] }> | null = null;

    const isFullYearRange = parsedDates?.endDate && parsedDates.isDateRange &&
      parsedDates.startDate.getUTCMonth() === 0 && parsedDates.startDate.getUTCDate() === 1 &&
      parsedDates.endDate.getUTCMonth() === 11 && parsedDates.endDate.getUTCDate() === 31 &&
      parsedDates.startDate.getUTCFullYear() === parsedDates.endDate.getUTCFullYear();

    if (parsedDates) {
      devLog.debug('📅 Dates detected in question:', parsedDates.rawText, 'ask-western-seer');
      devLog.debug('📅 Start date:', formatDateForContext(parsedDates.startDate), 'ask-western-seer');

      const birthData: BirthData = {
        birthDate: userProfile.birthDate || '',
        birthTime: userProfile.birthTime || '',
        birthPlace: userProfile.birthPlace || '',
        latitude: userProfile.birthLatitude || 12.3051828,
        longitude: userProfile.birthLongitude || 76.6553609
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
          console.error('⚠️ Failed to calculate quarterly future transits:', error);
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
          console.error('⚠️ Failed to calculate future transits:', error);
        }
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
      .filter((item: any) => item !== null)
      .slice(-10);

    // Analyze question type (Western-specific and Astro-Numerology)
    const questionType = analyzeWesternQuestionType(question);

    // Refusal: synastry requires partner chart — we only have the user's natal + transits
    const synastryRefusalMessage = "Relationship comparison (synastry) requires a partner's birth data. Please use the Synastry tool with both birth details to get insights into compatibility.";
    if (questionType === 'synastry') {
      devLog.info('🔮 Western Seer: Refusing synastry question (no partner chart)', undefined, 'ask-western-seer');
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(synastryRefusalMessage));
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

    // Chart state + slice: reason only from relevant chart data
    const chartState = buildChartState(
      westernChartData,
      futureTransits ?? undefined,
      futureTransitsByDate ?? undefined
    );
    const chartSlice = getChartSliceForQuestionType(questionType, chartState);

    // Build Astro-Numerology context if data is available
    const numerologyContext = numerologyData ? buildAstroNumerologyContext(numerologyData) : '';

    // Stream conversational response via AI Gateway or direct Groq (strict: slice only)
    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile', // Fast, high-quality, free tier
      messages: [
        {
          role: 'system',
          content: buildWesternSystemPrompt(chartSlice, numerologyContext, questionType)
        },
        ...conversationHistory.map(h => [
          { role: 'user' as const, content: h.question },
          { role: 'assistant' as const, content: h.answer }
        ]).flat(),
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      maxTokens: 1000
    });

    // Return streaming response (500+ tokens/second!)
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
            await storeConversation(userId, sessionId, question, {
              answer: fullResponse,
              confidence: 0.90,
              chartReferences: extractWesternChartReferences(fullResponse, westernChartData),
              timing: {
                favorable: westernChartData.transits?.favorable || [],
                challenging: westernChartData.transits?.challenging || []
              },
              followUpQuestions: generateWesternFollowUpQuestions(questionType, westernChartData, numerologyData)
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
    console.error('Error in Western Seer API:', error);
    return NextResponse.json({
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

// Build Western astrology context for AI
function buildWesternAstrologyContext(westernChart: any, questionType: string, futureTransits?: any, parsedDates?: any): string {
  const planets = westernChart.planets || [];
  const houses = westernChart.houses || [];
  const aspects = westernChart.aspects || [];
  
  // Extract key placements
  const sunPlanet = planets.find((p: any) => p.name === 'Sun');
  const moonPlanet = planets.find((p: any) => p.name === 'Moon');
  const risingSign = houses[0]?.sign || houses[0]?.signName || 'Unknown';
  
  const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
  const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'Unknown';
  
  let context = `# Western Astrology Chart Analysis

## Core Identity (The Big Three)
- **Sun Sign**: ${sunSign} (Core identity, ego, life purpose)
- **Moon Sign**: ${moonSign} (Emotions, inner self, subconscious needs)
- **Rising Sign (Ascendant)**: ${risingSign} (Outer personality, first impression, life approach)

## Planetary Positions
`;

  // Add all planetary positions
  planets.forEach((planet: any) => {
    const sign = planet.sign?.signName || planet.sign || 'Unknown';
    const house = planet.house || 'Unknown';
    const degree = planet.degree?.toFixed(2) || '0';
    const retrograde = planet.isRetrograde ? ' (Retrograde)' : '';
    
    context += `- **${planet.name}** in ${sign}, ${house}th house at ${degree}°${retrograde}\n`;
  });

  context += `\n## House Cusps\n`;
  
  // Add house information
  houses.slice(0, 12).forEach((house: any, index: number) => {
    const sign = house.sign?.signName || house.sign || 'Unknown';
    const degree = house.degree?.toFixed(2) || '0';
    
    context += `- **House ${index + 1}**: ${sign} at ${degree}°\n`;
  });

  context += `\n## Major Aspects\n`;
  
  // Add significant aspects
  const significantAspects = aspects.filter((a: any) => a.strength > 0.7 || a.orb < 3);
  significantAspects.slice(0, 10).forEach((aspect: any) => {
    const type = aspect.type || 'aspect';
    const orb = aspect.orb?.toFixed(2) || '0';
    
    context += `- **${aspect.planet1} ${type} ${aspect.planet2}** (orb: ${orb}°)\n`;
  });

  // Add current transits if available
  if (westernChart.transits && westernChart.transits.length > 0) {
    context += `\n## Current Transits (Today)\n`;
    westernChart.transits.slice(0, 5).forEach((transit: any) => {
      const retrograde = transit.isRetrograde ? ' (Retrograde)' : '';
      context += `- ${transit.name} in ${transit.sign} at ${transit.degree.toFixed(2)}°${retrograde}\n`;
    });
  }

  // Add future transits if calculated
  if (futureTransits && futureTransits.length > 0 && parsedDates) {
    const futureDateStr = formatDateForContext(parsedDates.startDate);
    context += `\n## Future Transits for ${futureDateStr}\n`;
    context += `IMPORTANT: The user is asking about ${parsedDates.rawText}. Use these transits to answer their question.\n\n`;
    
    futureTransits.slice(0, 5).forEach((transit: any) => {
      const retrograde = transit.isRetrograde ? ' (Retrograde)' : '';
      context += `- ${transit.name} in ${transit.sign} at ${transit.degree.toFixed(2)}° (${transit.house}th house)${retrograde}\n`;
    });
  }

  return context;
}

// Build Astro-Numerology context
function buildAstroNumerologyContext(numerologyData: { sunSign: string; lifePathNumber: number; nameNumber: number; comprehensiveReport?: any }): string {
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
    if (comprehensiveReport.personalitySynthesis) {
      context += `\n## Personality Synthesis\n${comprehensiveReport.personalitySynthesis}\n`;
    }
    if (comprehensiveReport.careerGuidance) {
      context += `\n## Career & Life Path Guidance\n${comprehensiveReport.careerGuidance}\n`;
    }
    if (comprehensiveReport.relationshipInsights) {
      context += `\n## Relationship Dynamics\n${comprehensiveReport.relationshipInsights}\n`;
    }
    if (comprehensiveReport.lifePurpose) {
      context += `\n## Life Purpose & Destiny\n${comprehensiveReport.lifePurpose}\n`;
    }
    if (comprehensiveReport.personalGrowth) {
      context += `\n## Personal Growth Roadmap\n${comprehensiveReport.personalGrowth}\n`;
    }
    if (comprehensiveReport.challenges && comprehensiveReport.challenges.length > 0) {
      context += `\n## Challenges\n${comprehensiveReport.challenges.map((c: string) => `- ${c}`).join('\\n')}\n`;
    }
    if (comprehensiveReport.opportunities && comprehensiveReport.opportunities.length > 0) {
      context += `\n## Opportunities\n${comprehensiveReport.opportunities.map((o: string) => `- ${o}`).join('\\n')}\n`;
    }
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
- If data is missing for this question, say so explicitly (e.g. "This can't be concluded without progressions" or "I don't have transit data for that date").
- Never improvise meanings or add placements not in the slice. If the slice doesn't contain something, say "data not available" or "can't be concluded without [X]".
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
- If data is missing: say "This can't be concluded without [X]."
- Keep answers short: 1–2 sentences when possible. For timing/electional, state the date and one brief reason; avoid long paragraphs unless the user asks for more detail. Be conversational, warm, and supportive. Be direct; no beating around the bush. Descriptive but brief.

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
    timing: `Focus on: Transits (current and future if provided). Use only transit data in the slice. If progressions are noted as not available, say so. Response format: First line = recommended date (e.g. **YYYY-MM-DD** or "Recommended: YYYY-MM-DD"). Second line blank. Then full reasoning (comparison of transit dates, numerology if available, caveats). Keep the answer brief: recommended date plus 1–2 short sentences; only add more detail if the user explicitly asks.`,
    electional: `Focus on: Transits for the asked date. Use only transit data in the slice. If data for the date is missing, say "This can't be concluded without transit data for that date." Response format: First line = recommended date (e.g. **YYYY-MM-DD** or "Recommended: YYYY-MM-DD"). Second line blank. Then full reasoning (comparison of transit dates, numerology if available, caveats). Keep the answer brief: recommended date plus 1–2 short sentences; only add more detail if the user explicitly asks.`,
    synastry: `(Not used — synastry questions are refused; partner chart required.)`,
    houses: `Focus on: Life areas, experiences, where energies manifest, environmental influences`,
    career: `Focus on: 10th house, Midheaven, Sun/Saturn placements, vocational indicators, success potential`,
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

// Extract chart references from response
function extractWesternChartReferences(response: string, westernChart: any): any {
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
function generateWesternFollowUpQuestions(questionType: string, westernChart: any, numerologyData?: any): string[] {
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

// Get conversation history
async function getConversationHistory(userId: string, sessionId?: string): Promise<any[]> {
  try {
    const db = getFirebaseDB();
    const session = sessionId || `session_${Date.now()}`;
    
    const messagesRef = collection(db, 'westernSeerConversations', userId, 'sessions', session, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data()).reverse();
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

// Store conversation
async function storeConversation(userId: string, sessionId: string | undefined, question: string, response: any) {
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
    console.error('Error storing conversation:', error);
  }
}

