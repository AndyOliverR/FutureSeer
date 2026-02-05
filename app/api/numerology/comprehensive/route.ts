import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { createAICompletion } from '@/lib/aiGateway';
import { devLog, devWarn } from '@/lib/devLogger';
import { computeChaldeanProfile } from '@/lib/numerology/chaldean';
import { calcPersonalYear } from '@/lib/numerology/personalYear';
import { calcDriver, calcConductor } from '@/lib/numerology/driverConductor';

// Helper to check if we're using Admin SDK
function isAdminSDK(db: any): boolean {
  return db && typeof db.collection === 'function';
}

// Helper to get document using Admin SDK or Client SDK
async function getCachedDoc(collectionPath: string[], docId: string): Promise<any> {
  const db = getFirebaseDB();
  if (!db) return null;

  try {
    if (isAdminSDK(db)) {
      let ref: any = db.collection(collectionPath[0]);
      for (let i = 1; i < collectionPath.length; i += 2) {
        const docIdInPath = collectionPath[i];
        if (i + 1 < collectionPath.length) {
          const nextCollection = collectionPath[i + 1];
          ref = ref.doc(docIdInPath).collection(nextCollection);
        } else {
          ref = ref.doc(docIdInPath);
        }
      }
      if (ref.get && typeof ref.get === 'function') {
        const snapshot = await ref.doc(docId).get();
        return snapshot.exists ? { exists: () => true, data: () => snapshot.data() } : { exists: () => false, data: () => null };
      } else {
        const snapshot = await ref.get();
        return snapshot.exists ? { exists: () => true, data: () => snapshot.data() } : { exists: () => false, data: () => null };
      }
    } else {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, ...collectionPath, docId);
      return await getDoc(docRef);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devWarn('Error getting document:', error, 'numerology');
    }
    return { exists: () => false, data: () => null };
  }
}

// Helper to set document using Admin SDK or Client SDK
async function setCachedDoc(collectionPath: string[], docId: string, data: any): Promise<void> {
  const db = getFirebaseDB();
  if (!db) return;

  try {
    if (isAdminSDK(db)) {
      let ref: any = db.collection(collectionPath[0]);
      for (let i = 1; i < collectionPath.length; i += 2) {
        const docIdInPath = collectionPath[i];
        if (i + 1 < collectionPath.length) {
          const nextCollection = collectionPath[i + 1];
          ref = ref.doc(docIdInPath).collection(nextCollection);
        } else {
          ref = ref.doc(docIdInPath);
        }
      }
      if (ref.doc && typeof ref.doc === 'function') {
        await ref.doc(docId).set(data);
      } else {
        await ref.set(data);
      }
    } else {
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(db, ...collectionPath, docId);
      await setDoc(docRef, data);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devWarn('Error setting document:', error, 'numerology');
    }
  }
}

const COMPREHENSIVE_REPORT_SCHEMA_VERSION = '1.0';

interface ComprehensiveNumerologyRequest {
  userId: string;
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
  userProfile?: {
    birthDate?: string;
    fullName?: string;
    displayName?: string;
  };
}

interface ComprehensiveNumerologyResponse {
  success: boolean;
  data?: {
    comprehensiveAnalysis: {
      profileOverview: string;
      coreNumbersAnalysis: Array<{ number: string; value: number; analysis: string }>;
      lifePathAnalysis: string;
      expressionAnalysis: string;
      soulUrgeAnalysis: string;
      personalityAnalysis: string;
      destinyAnalysis: string;
      personalYearAnalysis: string;
      challengesAndOpportunities: {
        challenges: string[];
        opportunities: string[];
      };
      predictiveInsights: {
        todaysQuickWin: string;
        currentWeek: string;
        currentMonth: string;
        currentYear: string;
        nextYearSneakPeek: string;
        longerTermCycles: string;
      };
    };
    timestamp: number;
  };
  error?: string;
}

// Build comprehensive Groq prompt for numerology
function buildGroqPrompt(numerologyData: ComprehensiveNumerologyRequest['numerologyData'], userProfile?: any): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  const nextYear = currentYear + 1;
  const currentMonth = today.toLocaleString('en-US', { month: 'long' });
  
  const lifePath = numerologyData.lifePathNumber || 0;
  const expression = numerologyData.expressionNumber || numerologyData.destinyNumber || 0;
  const soulUrge = numerologyData.soulUrgeNumber || 0;
  const personality = numerologyData.personalityNumber || 0;
  const destiny = numerologyData.destinyNumber || 0;
  const personalYear = numerologyData.personalYearNumber || calcPersonalYear(userProfile?.birthDate || '') || 0;
  
  const fullName = userProfile?.fullName || userProfile?.displayName || 'the user';
  const birthDate = userProfile?.birthDate || '';

  return `You are an expert Chaldean Numerologist specializing in the ancient Babylonian number system. Provide comprehensive, insightful, and practical guidance based on the complete numerology profile.

TIME CONTEXT:
- Today's Date: ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Current Month: ${currentMonth} ${currentYear}
- Current Year: ${currentYear}
- Next Year: ${nextYear}

NUMEROLOGY DATA:
- Full Name: ${fullName}
- Birth Date: ${birthDate || 'Not provided'}

CORE NUMBERS:
- Life Path Number: ${lifePath}${lifePath === 11 || lifePath === 22 || lifePath === 33 ? ' (Master Number)' : ''}
- Expression Number (Destiny): ${expression}${expression === 11 || expression === 22 || expression === 33 ? ' (Master Number)' : ''}
- Soul Urge Number: ${soulUrge}${soulUrge === 11 || soulUrge === 22 || soulUrge === 33 ? ' (Master Number)' : ''}
- Personality Number: ${personality}${personality === 11 || personality === 22 || personality === 33 ? ' (Master Number)' : ''}
- Destiny Number: ${destiny}${destiny === 11 || destiny === 22 || destiny === 33 ? ' (Master Number)' : ''}
- Personal Year Number: ${personalYear}${personalYear === 11 || personalYear === 22 || personalYear === 33 ? ' (Master Number)' : ''}

IMPORTANT CONTEXT - Chaldean Numerology Philosophy:
Chaldean Numerology is an ancient Babylonian system that reveals life patterns, destiny, and character traits through numbers. It focuses on:
- Understanding your life's purpose and lessons (Life Path)
- Discovering your natural talents and abilities (Expression/Destiny)
- Revealing your inner desires and motivations (Soul Urge)
- Understanding how others perceive you (Personality)
- Identifying your ultimate life purpose (Destiny)
- Navigating current life cycles (Personal Year)

PREDICTION REQUIREMENTS - CRITICAL:
ALL predictions MUST be personalized to THIS specific numerology profile. Generic numerology text is NOT acceptable.

- todaysQuickWin: MUST reference the Personal Year Number ${personalYear} and how it influences today's energy. Example: "With your Personal Year ${personalYear}, today's energy aligns with [specific theme]..."
- currentWeek: MUST mention how the Personal Year ${personalYear} influences this week's themes. Example: "This week, your Personal Year ${personalYear} brings focus to [specific area]..."
- currentMonth: MUST reference how ${currentMonth}'s energy interacts with your Personal Year ${personalYear} and core numbers. Example: "This month, your Life Path ${lifePath} and Personal Year ${personalYear} combine to..."
- currentYear: MUST identify how Personal Year ${personalYear} influences the entire year ${currentYear}. Reference your Life Path ${lifePath} and Expression ${expression} numbers. Example: "Your Personal Year ${personalYear} throughout ${currentYear} brings [specific themes]..."
- nextYearSneakPeek: MUST calculate and reference the Personal Year for ${nextYear} and how it will differ from ${currentYear}. Example: "Next year (${nextYear}), you'll enter Personal Year [number], which will shift focus to..."
- longerTermCycles: MUST reference your Life Path ${lifePath} journey, Expression ${expression} destiny, and how Personal Year cycles evolve over time.

Personalization Rules:
✓ Reference actual numbers from CORE NUMBERS section above
✓ Mention specific number combinations (e.g., "Life Path ${lifePath} with Expression ${expression}")
✓ Connect Personal Year cycles to core numbers
✓ Use language like "your Life Path ${lifePath}", "your Expression Number ${expression}", "your Personal Year ${personalYear}"
✗ DO NOT write generic numerology text that could apply to anyone
✗ DO NOT ignore the numerology data provided
✗ DO NOT create predictions without referencing specific numbers

Generate a comprehensive Chaldean Numerology analysis covering all life areas. Format your response as a JSON object with the following structure:
{
  "profileOverview": "Detailed paragraph summarizing the numerology profile's dominant themes, number combinations, overall character, and key patterns.",
  "coreNumbersAnalysis": [
    {"number": "Life Path", "value": ${lifePath}, "analysis": "Detailed interpretation of Life Path Number ${lifePath}'s meaning, purpose, and life lessons"},
    {"number": "Expression", "value": ${expression}, "analysis": "Detailed interpretation of Expression Number ${expression}'s meaning, talents, and abilities"},
    {"number": "Soul Urge", "value": ${soulUrge}, "analysis": "Detailed interpretation of Soul Urge Number ${soulUrge}'s meaning, inner desires, and motivations"},
    {"number": "Personality", "value": ${personality}, "analysis": "Detailed interpretation of Personality Number ${personality}'s meaning and how others perceive you"},
    {"number": "Destiny", "value": ${destiny}, "analysis": "Detailed interpretation of Destiny Number ${destiny}'s meaning and ultimate life purpose"},
    {"number": "Personal Year", "value": ${personalYear}, "analysis": "Detailed interpretation of Personal Year ${personalYear}'s meaning and current life cycle themes"}
  ],
  "lifePathAnalysis": "Comprehensive analysis of Life Path Number ${lifePath}, including life purpose, lessons, challenges, and opportunities. Reference specific traits and characteristics of this number.",
  "expressionAnalysis": "Comprehensive analysis of Expression Number ${expression}, including natural talents, abilities, career paths, and how to express yourself authentically.",
  "soulUrgeAnalysis": "Comprehensive analysis of Soul Urge Number ${soulUrge}, including inner desires, motivations, emotional needs, and what truly drives you.",
  "personalityAnalysis": "Comprehensive analysis of Personality Number ${personality}, including how others perceive you, your outer personality, and social interactions.",
  "destinyAnalysis": "Comprehensive analysis of Destiny Number ${destiny}, including your ultimate life purpose, destiny path, and long-term goals.",
  "personalYearAnalysis": "Comprehensive analysis of Personal Year ${personalYear}, including current life cycle themes, focus areas, and what to expect during this year.",
  "challengesAndOpportunities": {
    "challenges": [
      "Specific challenge related to Life Path ${lifePath}",
      "Specific challenge related to Expression ${expression}",
      "Specific challenge related to number combinations"
    ],
    "opportunities": [
      "Specific opportunity related to Life Path ${lifePath}",
      "Specific opportunity related to Expression ${expression}",
      "Specific opportunity related to Personal Year ${personalYear}"
    ]
  },
  "predictiveInsights": {
    "todaysQuickWin": "MUST reference Personal Year ${personalYear} and how it influences today. Example: 'With your Personal Year ${personalYear}, today's energy aligns with [theme]...' Keep it concise (2-3 sentences) and actionable.",
    "currentWeek": "MUST mention how Personal Year ${personalYear} influences this week. Example: 'This week, your Personal Year ${personalYear} brings focus to [area]...' Keep it practical and specific.",
    "currentMonth": "MUST reference how ${currentMonth}'s energy interacts with Personal Year ${personalYear} and core numbers. Example: 'This month, your Life Path ${lifePath} and Personal Year ${personalYear} combine to...' Provide actionable insights.",
    "currentYear": "MUST identify how Personal Year ${personalYear} influences ${currentYear}. Reference Life Path ${lifePath} and Expression ${expression}. Example: 'Your Personal Year ${personalYear} throughout ${currentYear} brings [themes]...' Highlight key periods.",
    "nextYearSneakPeek": "MUST calculate Personal Year for ${nextYear} and how it differs. Example: 'Next year (${nextYear}), you'll enter Personal Year [number], which will shift focus to...' Provide insight based on number cycles.",
    "longerTermCycles": "MUST reference Life Path ${lifePath} journey, Expression ${expression} destiny, and how Personal Year cycles evolve. Connect longer-term patterns to core numbers."
  }
}

Make each section comprehensive yet concise. Focus on practical guidance, self-awareness, and empowering insights. Write in a warm, insightful tone.`;
}

// Parse Groq response and extract structured data
type ComprehensiveAnalysis = NonNullable<ComprehensiveNumerologyResponse['data']>['comprehensiveAnalysis'];
function parseGroqResponse(response: string, numerologyData: ComprehensiveNumerologyRequest['numerologyData']): ComprehensiveAnalysis {
  devLog.debug('🔍 Parsing Groq response for numerology', undefined, 'numerology');
  
  if (!response || response.length === 0) {
    throw new Error('Empty response from Groq');
  }

  const hasJsonStructure = /\{[\s\S]*\}/.test(response);
  if (!hasJsonStructure) {
    throw new Error('Response does not contain valid JSON structure');
  }

  try {
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch || jsonMatch[0].length < 100) {
      const codeBlockMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonMatch = [codeBlockMatch[1]];
      }
    }

    if (jsonMatch && jsonMatch[0]) {
      let jsonString = jsonMatch[0];
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
      jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, '');
      
      const parsed = JSON.parse(jsonString);
      
      // Ensure all required fields exist
      const lifePath = numerologyData.lifePathNumber || 0;
      const expression = numerologyData.expressionNumber || numerologyData.destinyNumber || 0;
      const soulUrge = numerologyData.soulUrgeNumber || 0;
      const personality = numerologyData.personalityNumber || 0;
      const destiny = numerologyData.destinyNumber || 0;
      
      return {
        profileOverview: parsed.profileOverview || `Your numerology profile reveals a Life Path ${lifePath}, Expression ${expression}, and Soul Urge ${soulUrge}, creating a unique numerological signature.`,
        coreNumbersAnalysis: parsed.coreNumbersAnalysis || [
          { number: 'Life Path', value: lifePath, analysis: `Life Path ${lifePath} reveals your life's purpose and lessons.` },
          { number: 'Expression', value: expression, analysis: `Expression ${expression} shows your natural talents and abilities.` },
          { number: 'Soul Urge', value: soulUrge, analysis: `Soul Urge ${soulUrge} reveals your inner desires and motivations.` },
          { number: 'Personality', value: personality, analysis: `Personality ${personality} shows how others perceive you.` },
          { number: 'Destiny', value: destiny, analysis: `Destiny ${destiny} indicates your ultimate life purpose.` }
        ],
        lifePathAnalysis: parsed.lifePathAnalysis || `Life Path ${lifePath} guides your life's journey and purpose.`,
        expressionAnalysis: parsed.expressionAnalysis || `Expression ${expression} reveals your natural talents and how you express yourself.`,
        soulUrgeAnalysis: parsed.soulUrgeAnalysis || `Soul Urge ${soulUrge} shows what truly motivates you from within.`,
        personalityAnalysis: parsed.personalityAnalysis || `Personality ${personality} influences how others see and interact with you.`,
        destinyAnalysis: parsed.destinyAnalysis || `Destiny ${destiny} points toward your ultimate life purpose.`,
        personalYearAnalysis: parsed.personalYearAnalysis || `Your current Personal Year brings specific themes and opportunities.`,
        challengesAndOpportunities: parsed.challengesAndOpportunities || {
          challenges: [],
          opportunities: []
        },
        predictiveInsights: parsed.predictiveInsights || {
          todaysQuickWin: 'Focus on aligning with your numerology profile today.',
          currentWeek: 'This week brings opportunities related to your core numbers.',
          currentMonth: 'This month aligns with your numerology cycles.',
          currentYear: 'This year offers growth aligned with your numerology profile.',
          nextYearSneakPeek: 'Next year will bring new cycles and opportunities.',
          longerTermCycles: 'Your numerology profile reveals longer-term patterns and cycles.'
        }
      };
    }
    
    throw new Error('No JSON structure found in response');
  } catch (error: any) {
    devWarn('Error parsing Groq response:', error, 'numerology');
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, numerologyData, userProfile }: ComprehensiveNumerologyRequest = await request.json();

    if (!userId || !numerologyData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId or numerologyData'
      }, { status: 400 });
    }

    devLog.info('🔮 Comprehensive Numerology API: Generating report for user:', userId, 'numerology');

    // Check Firebase cache
    try {
      const docSnap = await getCachedDoc(['users', userId, 'numerologyReports'], 'comprehensive');
      
      if (docSnap && docSnap.exists()) {
        const cachedData = docSnap.data();
        const lastUpdated = cachedData?.timestamp;
        
        if (lastUpdated) {
          const hoursSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60);
          
          if (hoursSinceUpdate < 24) {
            const actualData = cachedData.data || cachedData;
            devLog.info('✅ Returning cached comprehensive Numerology report for user:', userId, 'numerology');
            return NextResponse.json({
              success: true,
              data: actualData
            });
          }
        }
      }
    } catch (cacheError: any) {
      devWarn('⚠️ Error checking cache, proceeding with generation:', cacheError?.message || cacheError, 'numerology');
    }

    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      devWarn('⚠️ GROQ_API_KEY not configured, using fallback', undefined, 'numerology');
      // Return fallback response
      const fallbackAnalysis = parseGroqResponse('', numerologyData);
      return NextResponse.json({
        success: true,
        data: {
          comprehensiveAnalysis: fallbackAnalysis,
          timestamp: Date.now()
        }
      });
    }

    // Build comprehensive prompt
    const prompt = buildGroqPrompt(numerologyData, userProfile);

    // Call AI Gateway or direct Groq API
    devLog.info('🤖 Calling AI Gateway/Groq API for comprehensive Numerology analysis...', undefined, 'numerology');
    const result = await createAICompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Chaldean Numerologist specializing in the ancient Babylonian number system. Provide comprehensive, insightful, and practical guidance. Always respond with valid JSON when requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.75,
      maxTokens: 3500
    });

    const aiResponse = result.content || '';
    devLog.info('✅ Groq API response received', undefined, 'numerology');

    // Parse the response
    let comprehensiveAnalysis;
    try {
      comprehensiveAnalysis = parseGroqResponse(aiResponse, numerologyData);
    } catch (parseError: any) {
      devWarn('⚠️ Parsing failed, using fallback', parseError, 'numerology');
      comprehensiveAnalysis = parseGroqResponse('', numerologyData);
    }

    // Prepare response data
    const responseData: ComprehensiveNumerologyResponse['data'] = {
      comprehensiveAnalysis,
      timestamp: Date.now()
    };

    // Cache in Firebase
    try {
      await setCachedDoc(['users', userId, 'numerologyReports'], 'comprehensive', {
        data: responseData,
        timestamp: Date.now(),
        schemaVersion: COMPREHENSIVE_REPORT_SCHEMA_VERSION
      });
      devLog.info('✅ Cached comprehensive Numerology report in Firebase', undefined, 'numerology');
    } catch (cacheError: any) {
      devWarn('⚠️ Error caching report:', cacheError?.message || cacheError, 'numerology');
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error: any) {
    console.error('❌ Comprehensive Numerology API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate comprehensive Numerology analysis'
    }, { status: 500 });
  }
}

