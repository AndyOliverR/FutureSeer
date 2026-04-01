import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { analyzeQuestionType, buildSpecializedPrompt, buildVedicSeerSystemPrompt, generateFollowUpQuestions } from '@/lib/vedicSeerPrompts';
import { TimingAnalyzer } from '@/lib/timingAnalyzer';
import { PredictiveSystem } from '@/lib/predictiveAlgorithms';
import { parseDatesFromQuestion, formatDateForContext } from '@/lib/dateParser';
import { createAIStream } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import {
  buildVedicState,
  classifyVedicQuestion,
  getVedicSliceForQuestionType,
  type VedicQuestionType,
} from '@/lib/vedicSeerState';
import {
  buildMarkovUserBehaviorSignals,
  formatPredictiveHintForVedicPrompt,
} from '@/lib/predictionUserSignals';
import { UniversalInterpretationEngine, type RemedyAnalysis } from '@/lib/universalInterpretationEngine';

interface VedicSeerRequest {
  userId: string;
  question: string;
  userProfile: any;
  vedicChartData: any; // Accept pre-generated chart data
  vedicNumerologyData?: any; // Vedic Astro-Numerology data
  sessionId?: string;
}

interface VedicSeerResponse {
  success: boolean;
  data: {
    answer: string;
    confidence: number;
    chartReferences: {
      planets: string[];
      houses: number[];
      nakshatras: string[];
      dashas: string[];
    };
    timing: {
      favorable: string[];
      challenging: string[];
    };
    remedies: string[];
    followUpQuestions: string[];
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, question, userProfile, vedicChartData, vedicNumerologyData, sessionId }: VedicSeerRequest = await request.json();

    if (!userId || !question || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId, question, or userProfile'
      }, { status: 400 });
    }

    if (!vedicChartData) {
      return NextResponse.json({
        success: false,
        error: 'Missing Vedic chart data. Please ensure you are accessing this from the Vedic astrology page.'
      }, { status: 400 });
    }

    devLog.info('🔮 Vedic Seer API: Processing question for user:', userId, 'vedic-seer');

    // Classify question; refuse medical, death, absolute certainty
    const questionType = classifyVedicQuestion(question);
    if (questionType === 'refusal') {
      const refusalMessage =
        'Vedic astrology indicates tendencies and periods, not certainties. I cannot give medical diagnosis, death prediction, or absolute certainty. I can help with timing, career, marriage, and remedies within the astrological framework.';
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(refusalMessage));
            controller.close();
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
          }
        }
      );
    }

    // Build state and slice (expert: reason only from slice)
    const state = buildVedicState(vedicChartData, userProfile);
    const chartSlice = getVedicSliceForQuestionType(questionType, state);

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
            answer: seerResponse?.type === 'seer' ? seerResponse.content : ''
          };
        }
        return null;
      })
      .filter((item: any) => item !== null)
      .slice(-10);

    const behaviorSignals = await buildMarkovUserBehaviorSignals({
      userId,
      question,
      questionType,
      recentExchanges: conversationHistory
        .filter((h): h is NonNullable<typeof h> => h != null)
        .map((h) => ({ question: h.question, answer: h.answer })),
    });

    const predictiveAnalysis = await generatePredictiveAnalysis(
      vedicChartData,
      question,
      userId,
      vedicNumerologyData,
      behaviorSignals,
      questionType
    );
    const predictiveHint = formatPredictiveHintForVedicPrompt(predictiveAnalysis);

    // Stream via AI Gateway with slice-based expert prompt (no full dump; no cache bypass)
    const stream = await createAIStream({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildVedicSeerSystemPrompt(chartSlice, questionType, predictiveHint)
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
              confidence: 0.8,
              sources: ['vedic-astrology']
            };
            
            await memory.addExchange(userMessage);
            await memory.addExchange(seerMessage);
            memory.addRecentQuestion(question);
            await memory.saveAllMemory();
            
            // Also store in old format for backward compatibility
            await storeConversation(userId, sessionId, question, {
              answer: fullResponse,
              confidence: 0.90,
              chartReferences: extractChartReferences(fullResponse, vedicChartData),
              timing: {
                favorable: vedicChartData.transits?.favorable || [],
                challenging: vedicChartData.transits?.challenging || []
              },
              remedies: [],
              followUpQuestions: generateFollowUpQuestions(String(questionType), {
                userProfile,
                vedicChart: vedicChartData,
                conversationHistory: conversationHistory
                  .filter((h): h is NonNullable<typeof h> => h != null)
                  .map((h) => ({ question: h.question, answer: h.answer, timestamp: 'timestamp' in h && typeof (h as { timestamp?: number }).timestamp === 'number' ? (h as { timestamp: number }).timestamp : 0 }))
              })
            });

            // Cache only after successful non-refusal response
            await cacheQuestionAnswer(userId, question, fullResponse);
            
          } catch (error) {
            devLog.error('Error during streaming:', error);
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
    devLog.error('Error in Vedic Seer API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Calculate timing analysis for specific dates
async function calculateTimingAnalysis(vedicChartData: any, question: string, userProfile: any): Promise<any> {
  try {
    // Extract years from question (e.g., "2025 or 2026")
    const years = extractYearsFromQuestion(question);
    
    if (years.length === 0) {
      return null; // No specific timing requested
    }

    const birthDate = new Date(userProfile.birthDate);
    const analyzer = new TimingAnalyzer(vedicChartData, birthDate);
    
    const timingAnalysis = {
      years: years,
      analyses: years.map(year => analyzer.analyzeYear(year)),
      monthlyBreakdowns: {} as { [key: number]: any }
    };

    // Calculate month-by-month breakdown for each year
    for (const year of years) {
      const analysis = analyzer.analyzeYear(year);
      timingAnalysis.monthlyBreakdowns[year] = analysis.monthlyBreakdown;
    }

    return timingAnalysis;
  } catch (error) {
    devLog.error('Error calculating timing analysis:', error);
    return null;
  }
}

// Generate predictive analysis using Markov/Bayesian algorithms
async function generatePredictiveAnalysis(
  vedicChartData: any,
  question: string,
  userId: string,
  numerologyData: any | undefined,
  userBehavior: string[],
  vedicQuestionType: string
): Promise<any> {
  try {
    const predictiveSystem = new PredictiveSystem();
    
    const currentState = mapQuestionToState(vedicQuestionType);
    
    // Generate comprehensive prediction
    const prediction = await predictiveSystem.generateComprehensivePrediction(
      userId,
      currentState,
      vedicChartData,
      numerologyData || {}, // Use provided numerology data
      userBehavior,
      { question, questionType: vedicQuestionType } // evidence
    );

    return {
      markovPrediction: prediction.markovPrediction,
      bayesianPrediction: prediction.bayesianPrediction,
      combinedPrediction: prediction.combinedPrediction,
      confidence: prediction.confidence,
      recommendations: prediction.recommendations,
      timing: prediction.timing
    };
  } catch (error) {
    devLog.error('Error generating predictive analysis:', error);
    return null;
  }
}

// Map Vedic slice question type to Markov state (see docs/MULTI_SYSTEM_PREDICTION.md)
function mapQuestionToState(questionType: string): string {
  const stateMap: { [key: string]: string } = {
    marriage: 'relationship_seeking',
    career: 'career_transition',
    business: 'entrepreneurial_phase',
    wealth: 'financial_growth',
    health: 'health_concern',
    timing: 'life_timing',
    dasha: 'dasha_period',
    remedies: 'spiritual_support',
    general: 'general_life',
    event_confirmation: 'life_timing',
    life_purpose: 'soul_seeking',
    existential: 'meaning_crisis',
    control: 'empowerment_seeking',
    transformation: 'personal_growth',
  };
  return stateMap[questionType] || 'general_life';
}

// Generate interpretation using YOUR intelligence
async function generateVedicInterpretation(vedicChartData: any, questionType: string): Promise<any> {
  try {
    const interpretationEngine = new UniversalInterpretationEngine();
    
    // Generate interpretation using existing system
    const interpretation = await interpretationEngine.generateInterpretation(
      'vedic',
      'user', // userId not needed for interpretation
      vedicChartData
    );
    
    return interpretation;
  } catch (error) {
    devLog.error('Error generating interpretation:', error);
    return {
      remedies: [],
      personality: { overview: 'Your chart reveals unique patterns' },
      career: { overview: 'Your professional path is influenced by your chart' },
      spirituality: { overview: 'Your spiritual journey is guided by planetary positions' }
    };
  }
}

// Build rich astrological context for AI
function buildAstrologyContext(vedicChart: any, interpretation: any, questionType: string, timingAnalysis?: any, predictiveAnalysis?: any, parsedDates?: any, numerologyData?: any): string {
  let context = `
VEDIC CHART DATA:
- Ascendant: ${vedicChart.ascendant?.signName} at ${vedicChart.ascendant?.degree}°
- Current Dasha: ${vedicChart.currentDasha?.planet || vedicChart.currentDasha?.name} (${vedicChart.currentDasha?.startDate} to ${vedicChart.currentDasha?.endDate})
- Chart Ruler: ${getChartRuler(vedicChart.ascendant?.signName)} in ${vedicChart.planets?.[getChartRuler(vedicChart.ascendant?.signName)]?.signName}

PLANETARY POSITIONS:
${Object.entries(vedicChart.planets || {}).map(([name, data]: any) => 
  `- ${name}: ${data.signName} (${data.house}th house), Nakshatra: ${data.nakshatra}, Strength: ${data.dignity?.strength || 'Neutral'}`
).join('\n')}

HOUSES:
${Object.entries(vedicChart.houses || {}).map(([num, house]: any) => 
  `- ${num}th House: ${house.signName}, Lord: ${house.lord}, Planets: ${house.planets?.join(', ') || 'None'}`
).join('\n')}

INTERPRETATION (from FutureSeer Intelligence):
${JSON.stringify(interpretation, null, 2)}

QUESTION TYPE: ${questionType}`;

  // Add timing analysis if available
  if (timingAnalysis) {
    context += `\n\nTIMING ANALYSIS (${timingAnalysis.years.join(' and ')}):
${JSON.stringify(timingAnalysis, null, 2)}`;
  }

  // Add predictive analysis if available
  if (predictiveAnalysis) {
    context += `\n\nPREDICTIVE ANALYSIS (Markov/Bayesian):
${JSON.stringify(predictiveAnalysis, null, 2)}`;
  }
  
  // Add future date information if detected in the question
  if (parsedDates) {
    const futureDateStr = formatDateForContext(parsedDates.startDate);
    context += `\n\nFUTURE DATE DETECTED: ${parsedDates.rawText}
- Target Date: ${futureDateStr}
- User is asking about: ${parsedDates.isDateRange ? `Date range from ${futureDateStr}${parsedDates.endDate ? ` to ${formatDateForContext(parsedDates.endDate)}` : ''}` : `Specific date ${futureDateStr}`}
- IMPORTANT: Use Dasha periods and transits to analyze what will happen on this specific date(s).
- DO NOT say "I need exact transits" - you have all the chart data and Dasha timing information needed to answer.`;
  }

  // Add Vedic Astro-Numerology data if available
  if (numerologyData) {
    context += `\n\nVEDIC ASTRO-NUMEROLOGY DATA:
${JSON.stringify(numerologyData, null, 2)}

IMPORTANT: For numerology questions, combine planetary influences with numerological insights. Use both Vedic astrology principles and numerology calculations to provide comprehensive answers.`;
  }

  return context;
}

// Build system prompt for AI (legacy; used only if expert path is bypassed)
function buildSystemPrompt(astrologyContext: string, questionType: string): string {
  const basePrompt = `You are a wise Vedic astrology and Vedic Astro-Numerology expert with deep psychological insight. You're having a natural conversation with someone seeking guidance.

IMPORTANT GUIDELINES:
1. **Be Conversational**: Write like you're speaking to a friend, not writing a report
2. **Be Direct**: Answer the specific question asked, don't give generic advice
3. **Use the Data**: Reference specific planetary positions, houses, interpretations, and numerology data provided
4. **Be Empathetic**: Acknowledge emotions and concerns
5. **Be Concise**: 3-4 paragraphs maximum unless they ask for more detail
6. **No Markdown**: Use natural language, avoid bullet points and headers (they'll be formatted automatically)
7. **Personal Touch**: Use "you" and "your", make it feel personal
8. **Use Specific Data**: Reference exact dates, Antardasha periods, planetary transits, numerology numbers, and probability scores from the provided analysis
9. **Give Concrete Dates**: When timing is provided, give specific dates (e.g., "October 15-25, 2025") not just "October or November"
10. **For Future Dates**: If the user asks about a specific future date and it's mentioned in the context, use Dasha timing + planetary transits to predict. NEVER say you need more information about transits - you have the chart data.
11. **For Numerology Questions**: Combine Vedic astrology principles with numerology calculations. Reference both planetary influences and numerological numbers (Life Path, Destiny, Soul, Personality numbers, Graha Anka, etc.) when answering.

${astrologyContext}

CRITICAL: Use the specific timing analysis and predictive data provided above. If timing analysis shows month-by-month breakdowns, reference the exact months and dates. If predictive analysis shows probability scores, include them in your response.`;

  // Add question-specific guidance
  const typeGuidance = {
    'business': 'Focus on: Is the NAME astrologically favorable? Does it resonate with their chart? Numerology of the name? Practical advice on the name itself.',
    'life_purpose': 'Focus on: Soul mission, Rahu-Ketu axis, dharma, practical steps for alignment',
    'existential': 'Focus on: Making sense of chaos, finding meaning, karmic patterns',
    'control': 'Focus on: What they can control vs. karma, empowerment, practical agency',
    'transformation': 'Focus on: Growth path, shadow work, spiritual practices, timing',
    'career': 'Focus on: Professional calling, timing, suitable fields, success factors',
    'marriage': 'Focus on: Partnership timing, compatibility, relationship patterns',
    'health': 'Focus on: Mind-body connection, preventive care, lifestyle adjustments',
    'timing': 'Focus on: Specific dates/periods, dasha timing, transit windows - USE THE EXACT DATES PROVIDED',
    'wealth': 'Focus on: Financial timing, wealth houses, dhana yogas, practical steps - USE THE EXACT DATES PROVIDED'
  };

  return basePrompt + `\n\nFOR THIS ${questionType.toUpperCase()} QUESTION:\n${typeGuidance[questionType as keyof typeof typeGuidance] || 'Provide clear, specific guidance based on their chart.'}`;
}

function buildVedicContext(userProfile: any, vedicChartData: any, conversationHistory: any[]) {
  // Use the provided chart data directly - no transformation needed
  const ascendant = vedicChartData.ascendant;
  const planets = vedicChartData.planets || {};
  const houses = vedicChartData.houses || {};
  const currentDasha = vedicChartData.currentDasha;
  const transits = vedicChartData.transits || { favorable: [], challenging: [] };
  const yogas = vedicChartData.yogas || [];

  // Determine chart ruler
  const chartRuler = getChartRuler(ascendant?.signName);

  // ADD: Extract conversation context
  const conversationContext = {
    previousQuestions: conversationHistory.map(h => h.question),
    previousTopics: conversationHistory.map(h => analyzeQuestionType(h.question)),
    lastQuestion: conversationHistory.length > 0 ? 
      conversationHistory[conversationHistory.length - 1].question : null
  };

  return {
    userProfile: {
      fullName: userProfile.fullName || userProfile.displayName,
      birthDate: userProfile.birthDate,
      birthTime: userProfile.birthTime,
      birthPlace: userProfile.birthPlace
    },
    vedicChart: {
      ascendant: {
        sign: ascendant?.signName,
        degree: ascendant?.degree,
        signName: ascendant?.signName
      },
      planets: Object.entries(planets).reduce((acc: any, [name, data]: any) => {
        acc[name] = {
          sign: data.signName,
          house: data.house,
          nakshatra: data.nakshatra,
          degree: data.degree,
          dignity: data.dignity
        };
        return acc;
      }, {}),
      houses: Object.entries(houses).reduce((acc: any, [houseNum, data]: any) => {
        acc[houseNum] = {
          sign: data.signName,
          lord: data.lord,
          planets: data.planets || []
        };
        return acc;
      }, {}),
      currentDasha: {
        mahadasha: currentDasha?.planet || currentDasha?.name,
        antardasha: currentDasha?.antardasha,
        startDate: currentDasha?.startDate,
        endDate: currentDasha?.endDate,
        progress: currentDasha?.progress
      },
      yogas: yogas.map((yoga: any) => ({
        name: yoga.name,
        description: yoga.description,
        strength: yoga.strength
      })),
      transits: {
        favorable: transits.favorable.map((t: any) => t.description || t),
        challenging: transits.challenging.map((t: any) => t.description || t)
      },
      chartRuler: {
        planet: chartRuler,
        sign: planets[chartRuler]?.signName,
        house: planets[chartRuler]?.house
      }
    },
    conversationHistory: conversationHistory.map(item => ({
      question: item.question,
      answer: item.answer.substring(0, 200) + '...',
      timestamp: item.timestamp
    })),
    conversationContext // NEW
  };
}

function getChartRuler(ascendantSign: string): string {
  const lordship: { [key: string]: string } = {
    'Aries': 'Mars',
    'Taurus': 'Venus',
    'Gemini': 'Mercury',
    'Cancer': 'Moon',
    'Leo': 'Sun',
    'Virgo': 'Mercury',
    'Libra': 'Venus',
    'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter',
    'Capricorn': 'Saturn',
    'Aquarius': 'Saturn',
    'Pisces': 'Jupiter'
  };
  return lordship[ascendantSign] || 'Mercury';
}

function replaceTemplateVariables(text: string, vedicChart: any): string {
  const replacements = {
    '{current_dasha}': vedicChart.currentDasha?.mahadasha || 'current',
    '{ascendant}': vedicChart.ascendant?.signName || 'your ascendant',
    '{chart_ruler}': vedicChart.chartRuler?.planet || 'your chart ruler',
    '{moon_nakshatra}': vedicChart.planets?.Moon?.nakshatra || 'your Moon nakshatra'
  };
  
  let result = text;
  Object.entries(replacements).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return result;
}

function remedyAnalysisToStringList(remedies: RemedyAnalysis): string[] {
  const lines: string[] = [];
  const overview = remedies.overview?.trim();
  if (overview) lines.push(overview);
  for (const m of remedies.mantras ?? []) {
    const t = m?.trim();
    if (t) lines.push(`Mantra: ${t}`);
  }
  for (const g of remedies.gemstones ?? []) {
    const t = g?.trim();
    if (t) lines.push(`Gemstone: ${t}`);
  }
  for (const r of remedies.rituals ?? []) {
    const t = r?.trim();
    if (t) lines.push(`Ritual: ${t}`);
  }
  for (const l of remedies.lifestyle ?? []) {
    const t = l?.trim();
    if (t) lines.push(`Lifestyle: ${t}`);
  }
  return lines;
}

async function generateVedicResponse(question: string, context: any): Promise<VedicSeerResponse['data']> {
  try {
    // Validate context has required data
    if (!context.vedicChart || !context.userProfile) {
      throw new Error('Incomplete chart data provided');
    }

    devLog.info('🔮 Generating Vedic response using FutureSeer intelligence for question:', question, 'vedic-seer');

    // Use existing UniversalInterpretationEngine instead of OpenAI
    const interpretationEngine = new UniversalInterpretationEngine();
    
    // Generate interpretation using existing system
    const interpretation = await interpretationEngine.generateInterpretation(
      'vedic',
      context.userProfile.userId,
      context.vedicChart
    );
    
    // Extract relevant section based on question type
    const questionType = analyzeQuestionType(question);
    const answer = buildAnswerFromInterpretation(interpretation, questionType, question, context);
    
    // Extract chart references from the response
    const chartReferences = extractChartReferences(answer, context.vedicChart);
    
    // Generate follow-up questions based on question type
    const followUpQuestions = generateFollowUpQuestions(questionType, {
      userProfile: context.userProfile,
      vedicChart: context.vedicChart,
      conversationHistory: context.conversationHistory || []
    });

    return {
      answer,
      confidence: 0.90,
      chartReferences,
      timing: {
        favorable: context.vedicChart.transits.favorable,
        challenging: context.vedicChart.transits.challenging
      },
      remedies: remedyAnalysisToStringList(interpretation.remedies),
      followUpQuestions
    };

  } catch (error) {
    devLog.error('Error generating Vedic response with FutureSeer intelligence:', error);
    
    // Fallback to template-based response
    return generateTemplateResponse(question, context);
  }
}

function areQuestionsRelated(q1: string, q2: string): boolean {
  const topic1 = analyzeQuestionType(q1);
  const topic2 = analyzeQuestionType(q2);
  
  // Same topic = related
  if (topic1 === topic2) return true;
  
  // Business + Career = related
  if ((topic1 === 'business' && topic2 === 'career') ||
      (topic1 === 'career' && topic2 === 'business')) return true;
  
  // Wealth + Business = related
  if ((topic1 === 'wealth' && topic2 === 'business') ||
      (topic1 === 'business' && topic2 === 'wealth')) return true;
  
  return false;
}

function getTopicFromQuestion(question: string): string {
  const questionType = analyzeQuestionType(question);
  const topicMap: { [key: string]: string } = {
    'marriage': 'relationships',
    'career': 'career',
    'business': 'business',
    'wealth': 'wealth',
    'health': 'health',
    'spiritual': 'spirituality',
    'karmic': 'karma',
    'timing': 'timing',
    'dasha': 'dasha periods'
  };
  return topicMap[questionType] || 'your chart';
}

function buildAnswerFromInterpretation(interpretation: any, questionType: string, question: string, context: any): string {
  const { vedicChart, conversationContext } = context;
  
  // Check if this is a follow-up question
  const isFollowUp = conversationContext?.lastQuestion && 
    areQuestionsRelated(conversationContext.lastQuestion, question);
  
  let answer = '';
  
  if (isFollowUp) {
    // Add context reference
    const topic = getTopicFromQuestion(conversationContext.lastQuestion);
    answer += `Following up on your previous question about ${topic}:\n\n`;
  }
  
  // Extract relevant sections based on question type
  switch (questionType) {
    case 'life_purpose':
      answer += buildLifePurposeAnswer(interpretation, vedicChart, question);
      break;
    
    case 'existential':
    case 'meaning':
      answer += buildExistentialAnswer(interpretation, vedicChart, question);
      break;
    
    case 'control':
      answer += buildControlAnswer(interpretation, vedicChart, question);
      break;
    
    case 'transformation':
      answer += buildTransformationAnswer(interpretation, vedicChart, question);
      break;
    
    case 'marriage':
      answer += buildMarriageAnswer(interpretation, vedicChart, question);
      break;
    
    case 'career':
      answer += buildCareerAnswer(interpretation, vedicChart, question);
      break;
    
    case 'business':
      answer += buildBusinessAnswer(interpretation, vedicChart, question);
      break;
    
    case 'wealth':
      answer += buildTimingAnswer(interpretation, vedicChart, question); // Use timing for wealth questions
      break;
    
    case 'health':
      answer += buildHealthAnswer(interpretation, vedicChart, question);
      break;
    
    case 'spiritual':
      answer += buildSpiritualAnswer(interpretation, vedicChart, question);
      break;
    
    case 'karmic':
      answer += buildKarmicAnswer(interpretation, vedicChart, question);
      break;
    
    case 'timing':
      answer += buildTimingAnswer(interpretation, vedicChart, question);
      break;
    
    case 'dasha':
      answer += buildDashaAnswer(interpretation, vedicChart, question);
      break;
    
    default:
      answer += buildGeneralAnswer(interpretation, vedicChart, question);
      break;
  }
  
  // Add psychological depth to all answers
  answer = enhanceWithPsychologicalDepth(answer, questionType, vedicChart);
  
  // Add belonging/community element
  answer += `\n\n**You're Not Alone**: Many people with similar chart patterns experience ${getSharedExperience(vedicChart, questionType)}. This is part of your collective journey.`;
  
  return answer;
}

function buildMarriageAnswer(interpretation: any, vedicChart: any, question: string): string {
  const { relationships, timing, remedies } = interpretation;
  
  const answer = `Based on your Vedic chart, let me analyze your marriage prospects:

${relationships?.overview || 'Your 7th house indicates your approach to relationships and marriage.'}

**Current Dasha Period**: You're in ${vedicChart.currentDasha.mahadasha} Mahadasha (${vedicChart.currentDasha.startDate} to ${vedicChart.currentDasha.endDate}).

**Timing**: ${relationships?.marriageTiming || timing?.overview || 'The timing for marriage depends on your current dasha and transits.'}

**Compatibility**: ${relationships?.compatibility || 'Your chart shows compatibility with partners who complement your ascendant and Moon sign.'}

**Remedies**:
${Array.isArray(remedies) ? remedies.map((r: any) => `- ${r.name}: ${r.description}`).join('\n') : '- Strengthen Venus for relationship harmony'}

Would you like me to provide more specific timing or compatibility analysis?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildLifePurposeAnswer(interpretation: any, vedicChart: any, question: string): string {
  const { spirituality, career, personality } = interpretation;
  
  const answer = `I sense you're seeking deeper meaning in your life's journey. Let me illuminate your path through your Vedic chart:

**Your Soul's Blueprint**:
Your ${vedicChart.ascendant.signName} Ascendant reveals that you came into this life to learn ${getAscendantLifeLesson(vedicChart.ascendant.signName)}. This is not random - it's your soul's chosen curriculum.

**Your Dharma (Life Purpose)**:
${buildDharmaAnalysis(vedicChart)}

**North Node (Rahu) - Your Growth Direction**:
Rahu in ${vedicChart.planets.Rahu.signName} (${vedicChart.planets.Rahu.house}th house) shows you're meant to ${getRahuPurpose(vedicChart.planets.Rahu)}. This is where you'll find fulfillment, even if it feels uncomfortable at first.

**South Node (Ketu) - Your Past Mastery**:
Ketu in ${vedicChart.planets.Ketu.signName} represents skills you've already mastered. You can rely on these, but true growth lies in embracing your Rahu direction.

**Practical Steps for Alignment**:
${buildPurposeActionSteps(vedicChart, career)}

**Psychological Insight**:
The anxiety you may feel about "finding your purpose" is natural. Your chart shows you're not meant to have just one purpose - you're here to ${getMultiPurposeGuidance(vedicChart)}. Trust the process.

**Remedies for Clarity**:
${Array.isArray(interpretation.remedies) ? interpretation.remedies.slice(0, 3).map((r: any) => 
  `- ${r.name}: ${r.description} - This will help you feel more aligned with your path`).join('\n') : 
  '- Meditate on your North Node to gain clarity on your direction'}

Remember: Your purpose isn't something you find - it's something you create through conscious choices aligned with your chart's wisdom.

Would you like to explore specific areas where you can express this purpose?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildExistentialAnswer(interpretation: any, vedicChart: any, question: string): string {
  const answer = `I understand you're grappling with life's deeper questions. Your chart offers profound insights:

**Why You're Here (Existential Framework)**:
Your ${vedicChart.currentDasha.mahadasha} Mahadasha is activating ${getDashaExistentialTheme(vedicChart.currentDasha.mahadasha)}. This period is designed to help you understand ${getExistentialLesson(vedicChart)}.

**Making Sense of Chaos**:
${buildPatternRecognition(vedicChart)}

**Your Unique Lens**:
With Moon in ${vedicChart.planets.Moon.nakshatra}, you perceive reality through ${getNakshatraWorldview(vedicChart.planets.Moon.nakshatra)}. This is your gift - embrace it rather than questioning it.

**Finding Order**:
${buildOrderInChaosGuidance(vedicChart)}

**Psychological Comfort**:
The uncertainty you feel is reflected in your chart through ${identifyUncertaintyIndicators(vedicChart)}. This isn't a flaw - it's an invitation to develop ${getGrowthOpportunity(vedicChart)}.

**Spiritual Perspective**:
${interpretation.spirituality?.overview || 'Your 12th house indicates a natural inclination toward seeking deeper truths'}

**Grounding Practices**:
${buildGroundingRemedies(interpretation.remedies)}

The questions you're asking show spiritual maturity. Your chart suggests you're in a period of philosophical awakening - lean into it.

Would you like guidance on specific existential concerns?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildControlAnswer(interpretation: any, vedicChart: any, question: string): string {
  const answer = `I hear your need for greater agency in your life. Let's explore what you can influence:

**What You CAN Control (Purushartha - Human Effort)**:
${buildControlableFactors(vedicChart)}

**What's Predetermined (Prarabdha Karma)**:
${buildKarmicFactors(vedicChart)}

**Your Power Centers**:
- **1st House (Self-Mastery)**: ${vedicChart.houses[1].signName} - You have power over ${getHousePowerArea(1, vedicChart)}
- **10th House (Outer Achievement)**: ${vedicChart.houses[10].signName} - You can influence ${getHousePowerArea(10, vedicChart)}
- **11th House (Manifestation)**: ${vedicChart.houses[11].signName} - You can attract ${getHousePowerArea(11, vedicChart)}

**Current Dasha Empowerment**:
Your ${vedicChart.currentDasha.mahadasha} period gives you special power to ${getDashaPowerGift(vedicChart.currentDasha.mahadasha)}. Use this window wisely.

**Psychological Reframe**:
The need for control often masks fear of the unknown. Your chart shows ${identifyFearPattern(vedicChart)}. Instead of trying to control outcomes, focus on controlling your response.

**Practical Agency Tools**:
${buildAgencyPractices(vedicChart)}

**Protective Remedies**:
${buildProtectionRemedies(interpretation.remedies)}

**Wisdom**:
True power comes not from controlling life, but from mastering yourself. Your chart shows you have the strength to ${getInnerStrength(vedicChart)}.

Would you like specific guidance on areas where you feel powerless?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildTransformationAnswer(interpretation: any, vedicChart: any, question: string): string {
  const answer = `Your desire for transformation is beautifully reflected in your chart. Let's map your evolution:

**Your Transformation Journey**:
${buildTransformationPath(vedicChart)}

**Current Growth Edge**:
Your ${vedicChart.currentDasha.mahadasha} Mahadasha is specifically designed to help you transform ${getDashaTransformationFocus(vedicChart.currentDasha.mahadasha)}. This is not coincidence - it's cosmic timing.

**Inner Alchemy**:
${buildInnerChangeGuidance(vedicChart)}

**Shadow Work Indicators**:
Your chart reveals ${identifyShadowAreas(vedicChart)}. These are not flaws - they're your greatest potential for growth.

**Spiritual Practices for Evolution**:
${buildEvolutionPractices(vedicChart, interpretation.spirituality)}

**Psychological Integration**:
${buildIntegrationGuidance(vedicChart)}

**Timing Your Transformation**:
- **Best period for inner work**: ${getTransformationTiming(vedicChart)}
- **Support from transits**: ${getTransformationTransits(vedicChart)}

**Remedies for Breakthrough**:
${buildTransformationRemedies(interpretation.remedies)}

**Encouragement**:
The fact that you're seeking transformation shows you're already transforming. Your chart indicates ${getTransformationPotential(vedicChart)}.

Would you like guidance on specific areas you wish to transform?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildBusinessAnswer(interpretation: any, vedicChart: any, question: string): string {
  const { career, remedies } = interpretation;
  
  // Analyze business-specific houses with null checks
  const secondHouse = vedicChart.houses?.[2] || vedicChart.houses?.['2'];
  const eleventhHouse = vedicChart.houses?.[11] || vedicChart.houses?.['11'];
  const tenthHouse = vedicChart.houses?.[10] || vedicChart.houses?.['10'];
  
  // If asking about business NAME specifically
  if (/name|called|naming/i.test(question)) {
    return buildBusinessNameAnswer(question, vedicChart, interpretation);
  }
  
  // Otherwise, general business analysis
  const answer = `Based on your Vedic chart, let me analyze your business prospects:

**Your Business Houses**:
- **2nd House (Capital & Resources)**: ${secondHouse?.signName || 'Not available'} ruled by ${secondHouse?.lord || 'unknown'}
- **11th House (Gains & Profits)**: ${eleventhHouse?.signName || 'Not available'} ruled by ${eleventhHouse?.lord || 'unknown'}
- **10th House (Reputation & Status)**: ${tenthHouse?.signName || 'Not available'} ruled by ${tenthHouse?.lord || 'unknown'}

**Business Strengths**: 
${career?.suitableProfessions ? 
  `Your chart suggests success in: ${career.suitableProfessions.filter((p: string) => 
    ['Teaching', 'Counseling', 'Spiritual guidance', 'Writing', 'Healing'].includes(p)
  ).map((p: string) => p.toLowerCase() + '-based businesses').join(', ')}` : 
  'Service-oriented businesses that help others'}

**Current Dasha Impact**: 
Your ${vedicChart.currentDasha?.mahadasha || 'current'} Mahadasha ${getDashaBusinessInfluence(vedicChart.currentDasha?.mahadasha || 'current')}

**Financial Timing**: 
${getBusinessTimingAdvice(vedicChart)}

**Recommended Business Remedies**:
${Array.isArray(remedies) ? remedies.slice(0, 3).map((r: any) => 
  `- ${r.name}: ${r.description}`).join('\n') : 
  '- Strengthen your 2nd and 11th house lords for business success'}

Would you like specific guidance on timing or business partnerships?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildBusinessNameAnswer(question: string, vedicChart: any, interpretation: any): string {
  // Extract business name from question
  const nameMatch = question.match(/(?:is |called |name |naming )([A-Z][a-zA-Z\s]+?)(?:\s+(?:a |good|bad|suitable))/i);
  const businessName = nameMatch?.[1]?.trim() || 'the name you mentioned';
  
  return `Let me analyze "${businessName}" from a Vedic astrology perspective:

**Numerological Analysis**:
The name "${businessName}" carries specific vibrations that interact with your chart. Your Mercury (communication/business) is in ${vedicChart.planets?.Mercury?.signName || 'unknown'}, which suggests ${getNameCompatibility(businessName, vedicChart)}.

**Planetary Resonance**:
For your ${vedicChart.ascendant?.signName || 'Gemini'} Ascendant, business names should resonate with ${getAscendantBusinessGuidance(vedicChart.ascendant?.signName || 'Gemini')}. This name ${evaluateNameForAscendant(businessName, vedicChart)}.

**Recommendation**:
${getBusinessNameRecommendation(businessName, vedicChart)}

Would you like me to suggest alternative names or analyze specific aspects of this name?`;
}

function getDashaBusinessInfluence(dasha: string): string {
  const influences: { [key: string]: string } = {
    'Ketu': 'brings spiritual business opportunities - healing, counseling, alternative therapies excel now',
    'Venus': 'favors luxury, beauty, arts, and relationship-based businesses',
    'Sun': 'supports leadership roles, government contracts, and authority-based ventures',
    'Moon': 'benefits food, hospitality, nurturing, and public-facing businesses',
    'Mars': 'energizes real estate, sports, competition, and action-oriented ventures',
    'Mercury': 'enhances communication, technology, writing, and trading businesses',
    'Jupiter': 'expands education, consulting, wisdom-based, and ethical businesses',
    'Saturn': 'stabilizes long-term ventures, manufacturing, and service industries',
    'Rahu': 'innovates technology, foreign trade, and unconventional businesses'
  };
  return influences[dasha] || 'creates unique business opportunities';
}

function getBusinessTimingAdvice(vedicChart: any): string {
  // Check Jupiter & Saturn transits for business timing
  const jupiter = vedicChart.transits?.favorable?.find((t: any) => 
    t.includes('Jupiter') || t.description?.includes('Jupiter')
  );
  const saturn = vedicChart.transits?.challenging?.find((t: any) => 
    t.includes('Saturn') || t.description?.includes('Saturn')
  );
  
  if (jupiter) {
    return 'Jupiter\'s favorable transit supports business expansion and new ventures now.';
  }
  if (saturn) {
    return 'Saturn\'s transit suggests consolidation rather than expansion - strengthen existing business.';
  }
  return 'Monitor planetary transits through 2nd and 11th houses for optimal timing.';
}

// Business name analysis helper functions
function getNameCompatibility(name: string, vedicChart: any): string {
  const nameLength = name.length;
  const mercurySign = vedicChart.planets?.Mercury?.signName || 'unknown';
  
  if (nameLength <= 6) {
    return 'short, punchy names work well with your Mercury placement - they\'re memorable and direct';
  } else if (nameLength <= 12) {
    return 'medium-length names balance memorability with descriptiveness for your chart';
  } else {
    return 'longer names may work but consider abbreviation for daily use';
  }
}

function getAscendantBusinessGuidance(ascendant: string): string {
  const guidance: { [key: string]: string } = {
    'Aries': 'bold, action-oriented names that convey energy and leadership',
    'Taurus': 'stable, luxurious names that suggest quality and reliability',
    'Gemini': 'clever, communicative names that play with words or concepts',
    'Cancer': 'nurturing, family-oriented names that feel safe and trustworthy',
    'Leo': 'dramatic, memorable names that command attention and respect',
    'Virgo': 'precise, service-oriented names that suggest expertise and care',
    'Libra': 'harmonious, beautiful names that appeal to aesthetics',
    'Scorpio': 'mysterious, powerful names that suggest transformation',
    'Sagittarius': 'adventurous, expansive names that suggest growth and wisdom',
    'Capricorn': 'professional, authoritative names that suggest success',
    'Aquarius': 'innovative, unique names that suggest forward-thinking',
    'Pisces': 'compassionate, spiritual names that suggest healing and service'
  };
  return guidance[ascendant] || 'names that resonate with your chart\'s energy';
}

function evaluateNameForAscendant(name: string, vedicChart: any): string {
  const ascendant = vedicChart.ascendant?.signName || 'Gemini';
  const nameVibe = getBusinessNameVibe(name);
  
  if (ascendant === 'Gemini' && nameVibe === 'communicative') {
    return 'perfectly aligns with your Gemini Ascendant\'s communicative nature';
  } else if (ascendant === 'Gemini' && nameVibe === 'technical') {
    return 'works well with your Mercury-ruled chart for analytical businesses';
  } else {
    return 'has potential but consider how it aligns with your chart\'s energy';
  }
}

function getBusinessNameVibe(name: string): string {
  const techWords = ['tech', 'data', 'digital', 'cyber', 'net', 'web'];
  const creativeWords = ['creative', 'art', 'design', 'studio', 'works'];
  const serviceWords = ['care', 'help', 'support', 'service', 'solutions'];
  
  const lowerName = name.toLowerCase();
  
  if (techWords.some(word => lowerName.includes(word))) return 'technical';
  if (creativeWords.some(word => lowerName.includes(word))) return 'creative';
  if (serviceWords.some(word => lowerName.includes(word))) return 'service';
  return 'communicative';
}

function getBusinessNameRecommendation(name: string, vedicChart: any): string {
  const ascendant = vedicChart.ascendant?.signName || 'Gemini';
  const mercurySign = vedicChart.planets?.Mercury?.signName || 'unknown';
  
  if (ascendant === 'Gemini') {
    return `For your Gemini Ascendant, "${name}" works well if it's easy to pronounce and remember. Consider adding words like "Solutions," "Consulting," or "Services" to emphasize your Mercury-ruled communication skills.`;
  }
  
  return `The name "${name}" has potential for your chart. Consider how it reflects your ${ascendant} Ascendant's energy and your Mercury in ${mercurySign}.`;
}

function buildCareerAnswer(interpretation: any, vedicChart: any, question: string): string {
  const { career, timing, remedies } = interpretation;
  
  const answer = `Let me analyze your career prospects based on your Vedic chart:

${career?.overview || 'Your 10th house and its lord indicate your professional path.'}

**Suitable Professions**: ${career?.suitableProfessions?.join(', ') || 'Fields related to your Mercury and 10th house placement'}

**Success Factors**: ${career?.successFactors?.join(', ') || 'Authenticity, hard work, and leveraging your natural talents'}

**Timing**: ${career?.timing || timing?.overview || 'Career opportunities align with your current dasha period'}

**Current Dasha**: ${vedicChart.currentDasha.mahadasha} Mahadasha brings ${getDashaCareerInfluence(vedicChart.currentDasha.mahadasha)}

**Remedies**:
${Array.isArray(remedies) ? remedies.map((r: any) => `- ${r.name}: ${r.description}`).join('\n') : '- Strengthen your 10th lord for career success'}

Would you like specific guidance on career changes or timing?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildHealthAnswer(interpretation: any, vedicChart: any, question: string): string {
  const { health, remedies } = interpretation;
  
  const answer = `Let me analyze your health based on your Vedic chart:

${health?.overview || 'Your 6th house and its lord indicate your health patterns.'}

**Constitution**: ${health?.constitution || 'Your chart shows a balanced constitution requiring attention to specific areas.'}

**Health Tips**:
${health?.healthTips?.map((tip: string) => `- ${tip}`).join('\n') || '- Maintain regular routine and balanced diet'}

**Vulnerable Areas**:
${health?.vulnerableAreas?.map((area: string) => `- ${area}`).join('\n') || '- Focus on preventive care'}

**Remedies**:
${Array.isArray(remedies) ? remedies.map((r: any) => `- ${r.name}: ${r.description}`).join('\n') : '- Strengthen your 6th lord for health'}

Would you like specific health guidance or remedies?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildSpiritualAnswer(interpretation: any, vedicChart: any, question: string): string {
  const { spirituality, remedies } = interpretation;
  
  const answer = `Let me analyze your spiritual path based on your Vedic chart:

${spirituality?.overview || 'Your 12th house and its lord indicate your spiritual journey.'}

**Spiritual Path**: ${spirituality?.spiritualPath || 'Your chart suggests a path of spiritual growth and enlightenment.'}

**Meditation Advice**: ${spirituality?.meditationAdvice || 'Regular meditation and spiritual practice will benefit you.'}

**Practices**:
${spirituality?.practices?.map((practice: string) => `- ${practice}`).join('\n') || '- Daily meditation and spiritual study'}

**Remedies**:
${Array.isArray(remedies) ? remedies.map((r: any) => `- ${r.name}: ${r.description}`).join('\n') : '- Strengthen your 12th lord for spiritual growth'}

Would you like guidance on specific spiritual practices?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildKarmicAnswer(interpretation: any, vedicChart: any, question: string): string {
  const { spirituality, remedies } = interpretation;
  
  const answer = `Let me analyze your karmic patterns based on your Vedic chart:

Your Rahu-Ketu axis reveals profound karmic patterns. Rahu in ${vedicChart.planets?.Rahu?.sign || 'unknown'} and Ketu in ${vedicChart.planets?.Ketu?.sign || 'unknown'} indicate your soul's journey.

**Karmic Lessons**:
${spirituality?.karmicLessons?.map((lesson: string) => `- ${lesson}`).join('\n') || '- Patience, discipline, and service to others'}

**Spiritual Evolution**: ${spirituality?.evolution || 'Progressive spiritual development through service and wisdom'}

**Remedies**:
${Array.isArray(remedies) ? remedies.map((r: any) => `- ${r.name}: ${r.description}`).join('\n') : '- Balance Rahu-Ketu energies through spiritual practice'}

Would you like to explore your dharma or past life patterns?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildTimingAnswer(interpretation: any, vedicChart: any, question: string): string {
  // Extract years from question (e.g., "2025 or 2026")
  const years = extractYearsFromQuestion(question);
  
  if (years.length === 0) {
    return buildGeneralTimingAnswer(interpretation, vedicChart);
  }
  
  // Create timing analyzer
  const birthDate = new Date(vedicChart.metadata?.birthDate || '1983-02-24');
  const analyzer = new TimingAnalyzer(vedicChart, birthDate);
  
  let answer = `Based on your Vedic chart with ${vedicChart.ascendant.signName} Ascendant, let me analyze timing for ${years.join(' and ')}:\n\n`;
  
  // Analyze each year
  const analyses = years.map(year => analyzer.analyzeYear(year));
  
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const analysis = analyses[i];
    
    answer += `## ${year} Analysis\n\n`;
    answer += `**Mahadasha**: ${analysis.mahadasha}\n`;
    answer += `**Active Antardashas**: ${analysis.antardashas.map(a => `${a.planet} (${a.months.join(', ')})`).join(', ')}\n\n`;
    
    answer += `### Month-by-Month Breakdown:\n\n`;
    
    // Group months by favorability
    const excellent = analysis.monthlyBreakdown.filter(m => m.favorability === 'excellent');
    const good = analysis.monthlyBreakdown.filter(m => m.favorability === 'good');
    const neutral = analysis.monthlyBreakdown.filter(m => m.favorability === 'neutral');
    const challenging = analysis.monthlyBreakdown.filter(m => m.favorability === 'challenging');
    
    if (excellent.length > 0) {
      answer += `**🌟 Excellent Months** (Wealth Score 80-100):\n`;
      excellent.forEach(m => {
        answer += `- **${m.month}**: ${m.description} (Score: ${m.wealthScore})\n`;
      });
      answer += `\n`;
    }
    
    if (good.length > 0) {
      answer += `**✨ Good Months** (Wealth Score 60-79):\n`;
      good.forEach(m => {
        answer += `- **${m.month}**: ${m.description} (Score: ${m.wealthScore})\n`;
      });
      answer += `\n`;
    }
    
    if (neutral.length > 0) {
      answer += `**📊 Neutral Months** (Wealth Score 40-59):\n`;
      answer += `${neutral.map(m => m.month).join(', ')}\n\n`;
    }
    
    if (challenging.length > 0) {
      answer += `**⚠️ Challenging Months** (Wealth Score 0-39):\n`;
      answer += `${challenging.map(m => m.month).join(', ')} - Focus on consolidation rather than expansion\n\n`;
    }
    
    answer += `**Key Transits in ${year}**:\n`;
    answer += `- Jupiter: ${analysis.transits.jupiter.description}\n`;
    answer += `- Saturn: ${analysis.transits.saturn.description}\n\n`;
  }
  
  // Compare years if multiple
  if (years.length > 1) {
    answer += `## Comparison & Recommendation\n\n`;
    answer += analyzer.compareYears(years[0], years[1]);
    answer += `\n\n`;
  }
  
  // Add wealth house analysis
  answer += `## Your Wealth Houses\n\n`;
  answer += `**2nd House (Accumulated Wealth)**: ${vedicChart.houses[2]?.signName} ruled by ${vedicChart.houses[2]?.lord}\n`;
  answer += `**11th House (Gains & Income)**: ${vedicChart.houses[11]?.signName} ruled by ${vedicChart.houses[11]?.lord}\n\n`;
  
  // Add remedies
  if (interpretation.remedies && interpretation.remedies.length > 0) {
    answer += `## Recommended Remedies\n\n`;
    interpretation.remedies.slice(0, 3).forEach((remedy: any) => {
      answer += `- **${remedy.name}**: ${remedy.description}\n`;
    });
  }
  
  return answer;
}

function buildGeneralTimingAnswer(interpretation: any, vedicChart: any): string {
  const { timing, remedies } = interpretation;
  
  const answer = `Let me analyze timing based on your Vedic chart:

**Current Dasha**: ${vedicChart.currentDasha.mahadasha} Mahadasha (${vedicChart.currentDasha.startDate} to ${vedicChart.currentDasha.endDate})

**Favorable Transits**:
${vedicChart.transits.favorable.map((t: any) => `- ${t.description || t}`).join('\n')}

**Challenging Transits**:
${vedicChart.transits.challenging.map((t: any) => `- ${t.description || t}`).join('\n')}

**Timing**: ${timing?.overview || 'The timing depends on your current dasha and planetary transits.'}

**Remedies**:
${Array.isArray(remedies) ? remedies.map((r: any) => `- ${r.name}: ${r.description}`).join('\n') : '- Strengthen favorable planets during good periods'}

Would you like specific timing for particular events?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function extractYearsFromQuestion(question: string): number[] {
  const yearRegex = /\b(20\d{2})\b/g;
  const matches = question.match(yearRegex);
  return matches ? matches.map(y => parseInt(y)) : [];
}

function buildDashaAnswer(interpretation: any, vedicChart: any, question: string): string {
  const { dasha, remedies } = interpretation;
  
  const answer = `Let me analyze your current dasha period:

**Current Mahadasha**: ${vedicChart.currentDasha.mahadasha} (${vedicChart.currentDasha.startDate} to ${vedicChart.currentDasha.endDate})

**Current Antardasha**: ${vedicChart.currentDasha.antardasha}

${dasha?.overview || 'Your current dasha period brings specific influences to your life.'}

**Upcoming Periods**:
${dasha?.upcoming?.map((period: string) => `- ${period}`).join('\n') || '- Focus on spiritual growth and service'}

**Timing**: ${dasha?.timing || 'Early morning and evening are favorable times'}

**Remedies**:
${Array.isArray(remedies) ? remedies.map((r: any) => `- ${r.name}: ${r.description}`).join('\n') : '- Strengthen the dasha lord for better results'}

Would you like to know about upcoming dasha periods?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function buildGeneralAnswer(interpretation: any, vedicChart: any, question: string): string {
  const { personality, remedies } = interpretation;
  
  const answer = `Based on your Vedic chart with ${vedicChart.ascendant.signName} Ascendant:

${personality?.overview || 'Your chart reveals your unique personality and life path.'}

**Strengths**:
${personality?.strengths?.map((strength: string) => `- ${strength}`).join('\n') || '- Natural intuition and wisdom'}

**Challenges**:
${personality?.challenges?.map((challenge: string) => `- ${challenge}`).join('\n') || '- Balancing different aspects of life'}

**Remedies**:
${Array.isArray(remedies) ? remedies.map((r: any) => `- ${r.name}: ${r.description}`).join('\n') : '- Strengthen your chart ruler for overall well-being'}

Would you like me to analyze a specific aspect of your life?`;

  return replaceTemplateVariables(answer, vedicChart);
}

function getDashaCareerInfluence(dasha: string): string {
  const influences: { [key: string]: string } = {
    'Sun': 'leadership opportunities and recognition',
    'Moon': 'emotional intelligence and nurturing careers',
    'Mars': 'action-oriented and competitive fields',
    'Mercury': 'communication, writing, and analytical work',
    'Jupiter': 'teaching, counseling, and wisdom-based careers',
    'Venus': 'arts, beauty, and relationship-focused work',
    'Saturn': 'disciplined, long-term career building',
    'Rahu': 'unconventional and technology-based careers',
    'Ketu': 'spiritual, healing, and service-oriented work'
  };
  return influences[dasha] || 'unique opportunities for growth';
}

function generateTemplateResponse(question: string, context: any): VedicSeerResponse['data'] {
  const { vedicChart, userProfile } = context;
  const questionType = analyzeQuestionType(question);
  
  // Generate template-based answer
  let answer = `Based on your Vedic chart with ${vedicChart.ascendant.signName} Ascendant:\n\n`;
  
  // Add relevant chart information
  answer += `Your chart ruler ${vedicChart.chartRuler.planet} is in ${vedicChart.chartRuler.sign} (${vedicChart.chartRuler.house || 'unknown'}th house).\n\n`;
  answer += `You're currently in ${vedicChart.currentDasha.mahadasha} Mahadasha, which influences ${getDashaInfluence(vedicChart.currentDasha.mahadasha)}.\n\n`;
  
  // Add question-specific analysis
  answer += getQuestionSpecificAnalysis(questionType, vedicChart, question);
  
  return {
    answer,
    confidence: 0.75,
    chartReferences: {
      planets: [vedicChart.chartRuler.planet],
      houses: [vedicChart.chartRuler.house],
      nakshatras: [],
      dashas: [vedicChart.currentDasha.mahadasha]
    },
    timing: {
      favorable: vedicChart.transits.favorable,
      challenging: vedicChart.transits.challenging
    },
    remedies: getBasicRemedies(vedicChart),
    followUpQuestions: generateFollowUpQuestions(questionType, {
      userProfile: userProfile || context.userProfile,
      vedicChart,
      conversationHistory: context.conversationHistory || []
    })
  };
}

function getDashaInfluence(dasha: string): string {
  const influences: { [key: string]: string } = {
    'Sun': 'leadership, recognition, and authority',
    'Moon': 'emotions, intuition, and nurturing',
    'Mars': 'action, courage, and competition',
    'Mercury': 'communication, learning, and adaptability',
    'Jupiter': 'wisdom, growth, and expansion',
    'Venus': 'beauty, relationships, and harmony',
    'Saturn': 'discipline, responsibility, and long-term goals',
    'Rahu': 'innovation, technology, and unconventional paths',
    'Ketu': 'spirituality, detachment, and healing'
  };
  return influences[dasha] || 'unique life experiences';
}

function getQuestionSpecificAnalysis(questionType: string, vedicChart: any, question: string): string {
  switch (questionType) {
    case 'marriage':
      return `For marriage timing, your 7th house lord ${vedicChart.houses[7]?.lord || 'Venus'} placement and current dasha period are key factors. The timing depends on favorable transits and dasha periods.`;
    
    case 'career':
      return `For career guidance, your 10th house lord ${vedicChart.houses[10]?.lord || 'Mercury'} placement indicates your professional path. Current dasha brings ${getDashaCareerInfluence(vedicChart.currentDasha.mahadasha)}.`;
    
    case 'health':
      return `For health guidance, your 6th house lord ${vedicChart.houses[6]?.lord || 'Mars'} placement indicates health patterns. Focus on preventive care and strengthening weak planets.`;
    
    case 'spiritual':
      return `For spiritual growth, your 12th house lord ${vedicChart.houses[12]?.lord || 'Venus'} placement indicates your spiritual path. Current dasha period supports ${getDashaInfluence(vedicChart.currentDasha.mahadasha)}.`;
    
    case 'karmic':
      return `For karmic understanding, your Rahu-Ketu axis reveals past life patterns. Rahu in ${vedicChart.planets?.Rahu?.sign || 'unknown'} and Ketu in ${vedicChart.planets?.Ketu?.sign || 'unknown'} show your soul's journey.`;
    
    case 'timing':
      return `For timing analysis, your current dasha period and planetary transits are key. Favorable periods align with strong planetary positions and beneficial transits.`;
    
    case 'dasha':
      return `Your current ${vedicChart.currentDasha.mahadasha} Mahadasha brings ${getDashaInfluence(vedicChart.currentDasha.mahadasha)}. This period focuses on specific life areas based on the dasha lord's placement.`;
    
    default:
      return `Your chart shows unique patterns that influence all areas of life. The current dasha period and planetary positions provide guidance for your questions.`;
  }
}

function getBasicRemedies(vedicChart: any): string[] {
  const remedies = [];
  
  // Add chart ruler remedy
  remedies.push(`Strengthen ${vedicChart.chartRuler.planet} (your chart ruler) for overall well-being`);
  
  // Add dasha lord remedy
  remedies.push(`Strengthen ${vedicChart.currentDasha.mahadasha} (current dasha lord) for better results`);
  
  // Add weak planet remedies
  Object.entries(vedicChart.planets || {}).forEach(([planet, data]: any) => {
    if (data.dignity?.strength === 'Weak' || data.dignity?.strength === 'Debilitated') {
      remedies.push(`Strengthen ${planet} (weak planet) for better outcomes`);
    }
  });
  
  return remedies.slice(0, 3); // Limit to 3 remedies
}

function buildUserPrompt(question: string, context: any): string {
  const conversationContext = context.conversationHistory.length > 0 
    ? `\n\nPrevious conversation:\n${context.conversationHistory.map((item: any) => 
        `Q: ${item.question}\nA: ${item.answer}`
      ).join('\n\n')}`
    : '';

  return `Question: ${question}${conversationContext}

Please provide a detailed, personalized answer based on the birth chart details provided. Reference specific planetary positions, houses, and current dasha periods in your response.`;
}

function extractChartReferences(answer: string, vedicChart: any): VedicSeerResponse['data']['chartReferences'] {
  const planets: string[] = [];
  const houses: number[] = [];
  const nakshatras: string[] = [];
  const dashas: string[] = [];

  // Extract planet references
  Object.keys(vedicChart.planets).forEach(planet => {
    if (answer.toLowerCase().includes(planet.toLowerCase())) {
      planets.push(planet);
    }
  });

  // Extract house references
  for (let i = 1; i <= 12; i++) {
    if (answer.includes(`${i}th house`) || answer.includes(`${i}st house`) || 
        answer.includes(`${i}nd house`) || answer.includes(`${i}rd house`)) {
      houses.push(i);
    }
  }

  // Extract nakshatra references
  Object.values(vedicChart.planets).forEach((planet: any) => {
    if (planet.nakshatra && answer.includes(planet.nakshatra)) {
      nakshatras.push(planet.nakshatra);
    }
  });

  // Extract dasha references
  if (answer.includes(vedicChart.currentDasha.mahadasha)) {
    dashas.push(vedicChart.currentDasha.mahadasha);
  }

  return { planets, houses, nakshatras, dashas };
}

function extractRemedies(answer: string): string[] {
  const remedies: string[] = [];
  
  // Common remedy patterns
  const remedyPatterns = [
    /wear\s+([^.]*?)(?:\.|$)/gi,
    /chant\s+([^.]*?)(?:\.|$)/gi,
    /donate\s+([^.]*?)(?:\.|$)/gi,
    /perform\s+([^.]*?)(?:\.|$)/gi,
    /practice\s+([^.]*?)(?:\.|$)/gi
  ];

  remedyPatterns.forEach(pattern => {
    const matches = answer.match(pattern);
    if (matches) {
      remedies.push(...matches.map(match => match.trim()));
    }
  });

  return remedies.slice(0, 5); // Limit to 5 remedies
}

function generateFollowUpQuestionsLocal(question: string, vedicChart: any): string[] {
  const followUps: string[] = [];
  
  // Generate context-aware follow-up questions
  if (question.toLowerCase().includes('marriage') || question.toLowerCase().includes('spouse')) {
    followUps.push('What are the characteristics of my ideal partner based on my 7th house?');
    followUps.push('How can I strengthen my chances of marriage through remedies?');
  } else if (question.toLowerCase().includes('career') || question.toLowerCase().includes('job')) {
    followUps.push('What timing is best for career changes based on my current dasha?');
    followUps.push('How can I enhance my professional success through planetary remedies?');
  } else if (question.toLowerCase().includes('health')) {
    followUps.push('What preventive measures should I take based on my 6th house?');
    followUps.push('How does my current dasha affect my health?');
  } else {
    followUps.push('What does my current Ketu Mahadasha mean for my life?');
    followUps.push('How can I make the most of my planetary strengths?');
  }

  return followUps.slice(0, 3);
}

// Legacy function - kept for backward compatibility
// New code should use ConversationalMemory instead
async function getConversationHistory(userId: string, sessionId?: string): Promise<any[]> {
  try {
    const db = getFirebaseDB();
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
    const session = sessionId || `session_${Date.now()}`;
    
    // Use proper Firestore collection reference
    const messagesRef = collection(db, 'vedicSeerConversations', userId, 'sessions', session, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data()).reverse(); // Reverse to get chronological order
  } catch (error) {
    devLog.error('Error getting conversation history:', error);
    return []; // Return empty array on error
  }
}

async function storeConversation(userId: string, sessionId: string | undefined, question: string, response: VedicSeerResponse['data']) {
  try {
    const db = getFirebaseDB();
    const { doc, setDoc } = await import('firebase/firestore');
    const session = sessionId || `session_${Date.now()}`;
    const timestamp = Date.now();
    
    // Use proper Firestore document reference
    const messageId = `msg_${timestamp}`;
    const messageRef = doc(db, 'vedicSeerConversations', userId, 'sessions', session, 'messages', messageId);
    
    await setDoc(messageRef, {
      question,
      answer: response.answer,
      timestamp,
      confidence: response.confidence,
      chartReferences: response.chartReferences,
      remedies: response.remedies
    });
    
    devLog.info('✅ Conversation stored successfully', undefined, 'vedic-seer');
  } catch (error) {
    devLog.error('Error storing conversation:', error);
    // Don't throw - conversation storage failure shouldn't break the response
  }
}

// ===== PSYCHOLOGICAL HELPER FUNCTIONS =====

function getAscendantLifeLesson(ascendant: string): string {
  const lessons: { [key: string]: string } = {
    'Aries': 'courage, independence, and pioneering new paths',
    'Taurus': 'stability, self-worth, and appreciating life\'s pleasures',
    'Gemini': 'communication, adaptability, and integrating duality',
    'Cancer': 'emotional intelligence, nurturing, and creating security',
    'Leo': 'self-expression, leadership, and radiating your authentic self',
    'Virgo': 'service, discernment, and perfecting your craft',
    'Libra': 'balance, relationships, and creating harmony',
    'Scorpio': 'transformation, depth, and mastering emotional power',
    'Sagittarius': 'wisdom, expansion, and finding meaning through experience',
    'Capricorn': 'responsibility, mastery, and building lasting structures',
    'Aquarius': 'innovation, community, and serving the collective',
    'Pisces': 'compassion, surrender, and transcending the ego'
  };
  return lessons[ascendant] || 'self-discovery and spiritual growth';
}

function buildDharmaAnalysis(vedicChart: any): string {
  const ninthHouse = vedicChart.houses[9];
  const tenthHouse = vedicChart.houses[10];
  const sun = vedicChart.planets.Sun;
  
  return `Your 9th house (Dharma) in ${ninthHouse.signName} suggests your life purpose involves ${get9thHousePurpose(ninthHouse.signName)}. Combined with your 10th house in ${tenthHouse.signName}, you're meant to ${combine9th10thPurpose(ninthHouse.signName, tenthHouse.signName)}. Your Sun in ${sun.signName} illuminates this path through ${getSunPurpose(sun.signName)}.`;
}

function getRahuPurpose(rahuData: any): string {
  const housePurposes: { [key: number]: string } = {
    1: 'develop a strong sense of self and personal identity',
    2: 'build material security and discover your true values',
    3: 'master communication and develop courage',
    4: 'create emotional security and find inner peace',
    5: 'express creativity and embrace joy',
    6: 'serve others and overcome obstacles',
    7: 'learn partnership and balance',
    8: 'embrace transformation and occult knowledge',
    9: 'seek wisdom and expand your worldview',
    10: 'achieve recognition and fulfill your ambitions',
    11: 'connect with community and manifest dreams',
    12: 'surrender ego and find spiritual liberation'
  };
  return housePurposes[rahuData.house] || 'evolve spiritually';
}

function buildPatternRecognition(vedicChart: any): string {
  return `The patterns you're noticing aren't random. Your chart shows:
- **Repeating themes**: ${identifyRepeatingThemes(vedicChart)}
- **Karmic cycles**: ${identifyKarmicCycles(vedicChart)}
- **Growth opportunities**: ${identifyGrowthPatterns(vedicChart)}

These patterns are your soul's way of teaching you ${getPatternLesson(vedicChart)}.`;
}

function buildControlableFactors(vedicChart: any): string {
  return `1. **Your Response**: You always control how you respond to circumstances
2. **Your Effort**: Your Mars in ${vedicChart.planets.Mars.signName} shows you can direct energy toward ${getMarsControlArea(vedicChart.planets.Mars)}
3. **Your Choices**: Your Mercury in ${vedicChart.planets.Mercury.signName} gives you power over ${getMercuryControlArea(vedicChart.planets.Mercury)}
4. **Your Growth**: Your Jupiter in ${vedicChart.planets.Jupiter.signName} expands your capacity for ${getJupiterControlArea(vedicChart.planets.Jupiter)}`;
}

function buildTransformationPath(vedicChart: any): string {
  const ketu = vedicChart.planets.Ketu; // Using Ketu as transformation indicator
  return `Your transformation journey is mapped through:
1. **Starting Point**: ${getTransformationStart(vedicChart)}
2. **Current Challenge**: ${getTransformationChallenge(vedicChart)}
3. **Growth Edge**: ${getTransformationEdge(vedicChart)}
4. **Destination**: ${getTransformationDestination(vedicChart)}

Your Ketu in ${ketu.signName} (${ketu.house}th house) shows you're releasing ${getKetuRelease(ketu)} to make space for new growth.`;
}

function getSharedExperience(vedicChart: any, questionType: string): string {
  const experiences: { [key: string]: string } = {
    'life_purpose': `the same search for meaning. Your ${vedicChart.ascendant.signName} Ascendant is shared by millions who are also seeking their path`,
    'existential': `similar existential questions. This is a sign of awakening consciousness`,
    'control': `the same desire for security and agency. Your chart shows this is a growth opportunity, not a weakness`,
    'transformation': `the call to evolve. You're part of a collective awakening`,
    'career': `career uncertainty. Your generation is redefining what work means`,
    'marriage': `relationship questions. Partnership is a universal teacher`,
    'business': `entrepreneurial dreams. You're part of a new wave of conscious business`,
    'health': `health concerns as spiritual messages. Your body is your ally`
  };
  return experiences[questionType] || 'similar life questions. You\'re part of humanity\'s collective journey';
}

function enhanceWithPsychologicalDepth(baseAnswer: string, questionType: string, vedicChart: any): string {
  const psychFrames = {
    'marriage': `

**Psychological Insight**: 
Your search for a partner reflects a deeper need for ${getRelationshipNeed(vedicChart)}. Your 7th house shows you're not just seeking companionship, but ${get7thHousePsychology(vedicChart)}.`,

    'career': `

**Deeper Meaning**: 
Beyond financial security, your career question reveals a need for ${getCareerPsychology(vedicChart)}. Your 10th house suggests work is how you ${get10thHousePurpose(vedicChart)}.`,

    'business': `

**Psychological Driver**: 
Your entrepreneurial spirit stems from ${getBusinessMotivation(vedicChart)}. This isn't just about money - it's about ${getBusinessPsychology(vedicChart)}.`,

    'health': `

**Mind-Body Connection**: 
Your health concerns may be reflecting ${getHealthPsychology(vedicChart)}. Your 6th house shows ${get6thHousePsychology(vedicChart)}.`,

    'timing': `

**Anxiety About Timing**: 
The urgency you feel about "when" reveals ${getTimingAnxiety(vedicChart)}. Trust that ${getTimingWisdom(vedicChart)}.`
  };

  return baseAnswer + (psychFrames[questionType as keyof typeof psychFrames] || '');
}

// Additional helper functions (simplified implementations)
function get9thHousePurpose(signName: string): string { return 'seeking wisdom and higher knowledge'; }
function combine9th10thPurpose(ninth: string, tenth: string): string { return 'serve others through your wisdom'; }
function getSunPurpose(signName: string): string { return 'illuminate your path'; }
function identifyRepeatingThemes(vedicChart: any): string { return 'lessons around communication and adaptability'; }
function identifyKarmicCycles(vedicChart: any): string { return 'cycles of learning and teaching'; }
function identifyGrowthPatterns(vedicChart: any): string { return 'opportunities for self-expression'; }
function getPatternLesson(vedicChart: any): string { return 'the art of balance and communication'; }
function getMarsControlArea(mars: any): string { return 'your energy and actions'; }
function getMercuryControlArea(mercury: any): string { return 'your thoughts and communication'; }
function getJupiterControlArea(jupiter: any): string { return 'your wisdom and growth'; }
function getTransformationStart(vedicChart: any): string { return 'where you are now'; }
function getTransformationChallenge(vedicChart: any): string { return 'letting go of old patterns'; }
function getTransformationEdge(vedicChart: any): string { return 'embracing your authentic self'; }
function getTransformationDestination(vedicChart: any): string { return 'spiritual fulfillment'; }
function getKetuRelease(ketu: any): string { return 'past-life attachments'; }
function getRelationshipNeed(vedicChart: any): string { return 'balance and harmony'; }
function get7thHousePsychology(vedicChart: any): string { return 'learning about yourself through others'; }
function getCareerPsychology(vedicChart: any): string { return 'purpose and recognition'; }
function get10thHousePurpose(vedicChart: any): string { return 'express your highest potential'; }
function getBusinessMotivation(vedicChart: any): string { return 'a desire for independence and impact'; }
function getBusinessPsychology(vedicChart: any): string { return 'creating something meaningful'; }
function getHealthPsychology(vedicChart: any): string { return 'stress and emotional patterns'; }
function get6thHousePsychology(vedicChart: any): string { return 'your relationship with service and routine'; }
function getTimingAnxiety(vedicChart: any): string { return 'a need for certainty in uncertain times'; }
function getTimingWisdom(vedicChart: any): string { return 'everything unfolds in divine timing'; }
function getDashaExistentialTheme(dasha: string): string { return 'spiritual lessons'; }
function getExistentialLesson(vedicChart: any): string { return 'the meaning of your journey'; }
function getNakshatraWorldview(nakshatra: string): string { return 'intuitive wisdom'; }
function buildOrderInChaosGuidance(vedicChart: any): string { return 'Trust that there is order in the apparent chaos of life.'; }
function identifyUncertaintyIndicators(vedicChart: any): string { return 'your Moon placement'; }
function getGrowthOpportunity(vedicChart: any): string { return 'emotional intelligence'; }
function buildGroundingRemedies(remedies: any): string { return 'Meditation and mindfulness practices will help ground you.'; }
function buildKarmicFactors(vedicChart: any): string { return 'Your past karma influences circumstances beyond your control.'; }
function getHousePowerArea(house: number, vedicChart: any): string { return 'your personal development'; }
function getDashaPowerGift(dasha: string): string { return 'special abilities'; }
function identifyFearPattern(vedicChart: any): string { return 'fear of the unknown'; }
function buildAgencyPractices(vedicChart: any): string { return 'Daily practices of mindfulness and intention setting.'; }
function buildProtectionRemedies(remedies: any): string { return 'Protective mantras and gemstones.'; }
function getInnerStrength(vedicChart: any): string { return 'overcome any challenge'; }
function getDashaTransformationFocus(dasha: string): string { return 'your inner world'; }
function buildInnerChangeGuidance(vedicChart: any): string { return 'Focus on inner transformation first.'; }
function identifyShadowAreas(vedicChart: any): string { return 'areas for growth'; }
function buildEvolutionPractices(vedicChart: any, spirituality: any): string { return 'Meditation and self-reflection practices.'; }
function buildIntegrationGuidance(vedicChart: any): string { return 'Integrate all aspects of yourself.'; }
function getTransformationTiming(vedicChart: any): string { return 'now'; }
function getTransformationTransits(vedicChart: any): string { return 'supportive planetary movements'; }
function buildTransformationRemedies(remedies: any): string { return 'Spiritual practices and gemstones.'; }
function getTransformationPotential(vedicChart: any): string { return 'great potential for growth'; }
function buildPurposeActionSteps(vedicChart: any, career: any): string { return 'Take daily actions aligned with your values.'; }
function getMultiPurposeGuidance(vedicChart: any): string { return 'serve in multiple ways'; }

// ===== QUESTION CACHING FUNCTIONS =====

// Helper function to calculate question similarity
function calculateSimilarity(question1: string, question2: string): number {
  const q1Lower = question1.toLowerCase();
  const q2Lower = question2.toLowerCase();
  
  // Extract key terms
  const keywords = ['money', 'financial', 'wealth', 'income', 'job', 'career', 'marriage', 'health', 'business', 'timing', 'when', 'will'];
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const years = ['2025', '2026', '2027', '2028'];
  
  let matches = 0;
  keywords.forEach(kw => {
    if (q1Lower.includes(kw) && q2Lower.includes(kw)) matches += 2;
  });
  months.forEach(m => {
    if (q1Lower.includes(m) && q2Lower.includes(m)) matches += 3;
  });
  years.forEach(y => {
    if (q1Lower.includes(y) && q2Lower.includes(y)) matches += 1;
  });
  
  return matches;
}

// Check for cached similar questions
async function checkCachedQuestions(userId: string, question: string): Promise<any | null> {
  try {
    const db = getFirebaseDB();
    const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
    
    const cacheRef = collection(db, 'vedicSeerCache', userId, 'questions');
    const q = query(cacheRef, orderBy('timestamp', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const cachedQA = doc.data();
      const similarity = calculateSimilarity(question, cachedQA.question);
      
      if (similarity >= 5) { // Threshold for similarity
        devLog.debug(`🎯 Found similar question with similarity score: ${similarity}`, undefined, 'vedic-seer');
        return cachedQA;
      }
    }
    
    return null;
  } catch (error) {
    devLog.error('Error checking cached questions:', error);
    return null;
  }
}

// Cache question and answer for future similar questions
async function cacheQuestionAnswer(userId: string, question: string, answer: string): Promise<void> {
  try {
    const db = getFirebaseDB();
    const { doc, setDoc } = await import('firebase/firestore');
    
    const cacheId = `qa_${Date.now()}`;
    const cacheRef = doc(db, 'vedicSeerCache', userId, 'questions', cacheId);
    
    await setDoc(cacheRef, {
      question,
      answer,
      timestamp: Date.now(),
      ttl: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days TTL
    });
    
    devLog.info('✅ Question cached for future similar questions', undefined, 'vedic-seer');
  } catch (error) {
    devLog.error('Error caching question:', error);
  }
}
