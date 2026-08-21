import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { callTextAI } from '@/lib/aiStructuredOutput';
import { BaziReading } from '@/lib/baziIntelligence';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

/**
 * API Route: /api/bazi/comprehensive
 * Generates comprehensive AI-enhanced BaZi analysis report
 * Features: Request validation, caching (30-day TTL), error handling
 */

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
      devLog.warn('[BAZI] Error getting document:', error, 'route');
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
      devLog.warn('[BAZI] Error setting document:', error, 'route');
    }
  }
}

interface ComprehensiveBaziRequest {
  userId: string;
  reading: BaziReading;
  userProfile?: {
    displayName?: string;
    fullName?: string;
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
  };
}

/**
 * Validates request payload
 */
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }
  
  if (!body.userId || typeof body.userId !== 'string') {
    return { valid: false, error: 'Valid userId is required' };
  }
  
  if (!body.reading || typeof body.reading !== 'object') {
    return { valid: false, error: 'Valid reading object is required' };
  }
  
  // Validate reading structure
  if (!body.reading.dayMaster || !body.reading.chart || !body.reading.elements) {
    return { valid: false, error: 'Invalid reading structure' };
  }
  
  return { valid: true };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse and validate request body
    let body: ComprehensiveBaziRequest;
    try {
      body = await req.json();
    } catch (parseError) {
      if (process.env.NODE_ENV === 'development') {
        devLog.error('[BAZI] JSON parse error:', parseError, 'route');
      }
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      if (process.env.NODE_ENV === 'development') {
        devLog.warn('[BAZI] Validation failed:', validation.error, 'route');
      }
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { userId, reading, userProfile } = body;

    // Check cache first (30-day TTL)
    const cacheKey = `bazi_${userId}_${userProfile?.birthDate || ''}_${userProfile?.birthTime || ''}`;
    
    try {
      const cachedDoc = await getCachedDoc(['users', userId, 'baziReports'], 'comprehensive');

      if (cachedDoc && cachedDoc.exists()) {
        const cachedData = cachedDoc.data();
        const cacheAge = Date.now() - (cachedData?.timestamp || 0);
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        // Return cached data if less than 30 days old and cache key matches
        if (cacheAge < thirtyDays && cachedData?.cacheKey === cacheKey) {
          const cacheAgeDays = Math.floor(cacheAge / (24 * 60 * 60 * 1000));
          if (process.env.NODE_ENV === 'development') {
            devLog.debug(`[BAZI] Returning cached report (${cacheAgeDays} days old)`);
          }
          return NextResponse.json({
            success: true,
            data: cachedData.comprehensiveAnalysis,
            cached: true,
            cacheAge: `${cacheAgeDays} days`,
            responseTime: `${Date.now() - startTime}ms`
          });
        }
      }
    } catch (cacheError) {
      // Log cache error but continue with generation
      if (process.env.NODE_ENV === 'development') {
        devLog.warn('[BAZI] Cache read error (continuing with generation)', cacheError, 'bazi-comprehensive');
      }
    }

    // Generate comprehensive analysis
    if (process.env.NODE_ENV === 'development') {
      devLog.debug('[BAZI] Generating new comprehensive report...');
    }

    const comprehensiveAnalysis = await generateComprehensiveAnalysis(reading, userProfile);

    // Cache the result (non-blocking)
    setCachedDoc(
      ['users', userId, 'baziReports'],
      'comprehensive',
      {
        comprehensiveAnalysis,
        cacheKey,
        timestamp: Date.now(),
        generatedAt: new Date().toISOString()
      }
    ).catch((cacheError) => {
      // Log cache write error but don't fail the request
      if (process.env.NODE_ENV === 'development') {
        devLog.warn('[BAZI] Cache write error (non-critical)', cacheError, 'bazi-comprehensive');
      }
    });

    const responseTime = Date.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      devLog.debug(`[BAZI] Report generated successfully in ${responseTime}ms`);
    }

    const { _usage: baziUsage, ...data } = comprehensiveAnalysis as typeof comprehensiveAnalysis & { _usage?: { promptTokens: number; completionTokens: number; totalTokens: number } };
    return NextResponse.json({
      success: true,
      data,
      cached: false,
      responseTime: `${responseTime}ms`,
      _usage: baziUsage,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    if (process.env.NODE_ENV === 'development') {
      devLog.error('[BAZI] Error generating comprehensive report:', {
        message: errorMessage,
        stack: errorStack,
        responseTime: `${Date.now() - startTime}ms`
      });
    } else {
      // Production logging (less verbose)
      devLog.error('[BAZI] Error generating report:', errorMessage, 'route');
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate comprehensive report',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: 500 }
    );
  }
}

/**
 * Generates comprehensive AI-enhanced BaZi analysis
 * Creates multiple AI prompts for different aspects of the analysis
 */
async function generateComprehensiveAnalysis(
  reading: BaziReading, 
  userProfile?: ComprehensiveBaziRequest['userProfile']
): Promise<{
  chartOverview: string;
  lifePathInsights: string;
  elementHarmonization: string;
  timingAndOpportunities: string;
  generatedAt: string;
  version: string;
  _usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}> {
  const userName = userProfile?.displayName || userProfile?.fullName || 'Seeker';
  
  // Chart Overview Prompt
  const chartOverviewPrompt = `You are a master BaZi (Four Pillars of Destiny) practitioner. Generate a comprehensive chart overview for ${userName}.

BaZi Chart Data:
- Day Master: ${reading.dayMaster.name} (${reading.dayMaster.element} ${reading.dayMaster.yinYang})
- Year Pillar: ${reading.chart.yearPillar.heavenlyStem.name} ${reading.chart.yearPillar.earthlyBranch.name}
- Month Pillar: ${reading.chart.monthPillar.heavenlyStem.name} ${reading.chart.monthPillar.earthlyBranch.name}
- Day Pillar: ${reading.chart.dayPillar.heavenlyStem.name} ${reading.chart.dayPillar.earthlyBranch.name}
- Hour Pillar: ${reading.chart.hourPillar.heavenlyStem.name} ${reading.chart.hourPillar.earthlyBranch.name}
- Element Balance: Wood ${reading.elements.wood.toFixed(1)}, Fire ${reading.elements.fire.toFixed(1)}, Earth ${reading.elements.earth.toFixed(1)}, Metal ${reading.elements.metal.toFixed(1)}, Water ${reading.elements.water.toFixed(1)}

Provide a 3-4 paragraph comprehensive overview covering:
1. The overall essence of their chart and what makes it unique
2. How their Day Master element influences their core personality
3. The dynamic interplay between their Four Pillars
4. Key themes and patterns in their destiny blueprint

Write in second person, be insightful and practical. Avoid generic statements.`;

  const chartOverviewResult = await callTextAI({
    label: 'bazi-chart-overview',
    model: GROQ_DEFAULT_TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a master BaZi (Four Pillars of Destiny) practitioner with deep knowledge of Chinese metaphysics.'
      },
      {
        role: 'user',
        content: chartOverviewPrompt
      }
    ],
    maxTokens: 800,
    temperature: 0.7,
    maxAttempts: 2,
  });

  const chartOverview = chartOverviewResult.content;

  // Life Path Insights Prompt
  const lifePathPrompt = `Based on ${userName}'s BaZi chart with Day Master ${reading.dayMaster.element}, provide detailed life path insights covering:

Current Luck Cycle: ${reading.luckCycles[0]?.element} ${reading.luckCycles[0]?.animal} (Ages ${reading.luckCycles[0]?.startAge}-${reading.luckCycles[0]?.endAge})
Personality Strengths: ${reading.personality.strengths.join(', ')}
Career Paths: ${reading.career.suitablePaths.join(', ')}
Wealth Pattern: ${reading.wealth.wealthPattern}

Provide:
1. Overall life purpose and direction based on the Four Pillars
2. How current and upcoming luck cycles will influence their journey
3. Timing for major life decisions and transitions
4. Strategies for working with their element balance

Be specific, actionable, and inspiring. 3-4 paragraphs.`;

  const lifePathResult = await callTextAI({
    label: 'bazi-life-path',
    model: GROQ_DEFAULT_TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a master BaZi (Four Pillars of Destiny) practitioner with deep knowledge of Chinese metaphysics.'
      },
      {
        role: 'user',
        content: lifePathPrompt
      }
    ],
    maxTokens: 800,
    temperature: 0.7,
    maxAttempts: 2,
  });

  const lifePathInsights = lifePathResult.content;

  // Element Harmonization Prompt
  const elementPrompt = `For ${userName} with Day Master ${reading.dayMaster.element}:

Element Distribution:
- Wood: ${reading.elements.wood.toFixed(1)} (${((reading.elements.wood / Object.values(reading.elements).reduce((a,b)=>a+b,0)) * 100).toFixed(0)}%)
- Fire: ${reading.elements.fire.toFixed(1)} (${((reading.elements.fire / Object.values(reading.elements).reduce((a,b)=>a+b,0)) * 100).toFixed(0)}%)
- Earth: ${reading.elements.earth.toFixed(1)} (${((reading.elements.earth / Object.values(reading.elements).reduce((a,b)=>a+b,0)) * 100).toFixed(0)}%)
- Metal: ${reading.elements.metal.toFixed(1)} (${((reading.elements.metal / Object.values(reading.elements).reduce((a,b)=>a+b,0)) * 100).toFixed(0)}%)
- Water: ${reading.elements.water.toFixed(1)} (${((reading.elements.water / Object.values(reading.elements).reduce((a,b)=>a+b,0)) * 100).toFixed(0)}%)

Favorable Elements: ${reading.favorable.elements.join(', ')}
Favorable Colors: ${reading.favorable.colors.join(', ')}
Favorable Directions: ${reading.favorable.directions.join(', ')}

Provide practical advice on:
1. How to strengthen weak elements through lifestyle
2. How to balance dominant elements
3. Specific activities, colors, and environments that support element harmony
4. Daily practices for element balance

Be practical and specific with actionable guidance. 2-3 paragraphs.`;

  const elementResult = await callTextAI({
    label: 'bazi-element-harmonization',
    model: GROQ_DEFAULT_TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a master BaZi (Four Pillars of Destiny) practitioner with deep knowledge of Chinese metaphysics.'
      },
      {
        role: 'user',
        content: elementPrompt
      }
    ],
    maxTokens: 600,
    temperature: 0.7,
    maxAttempts: 2,
  });

  const elementHarmonization = elementResult.content;

  // Timing & Opportunities Prompt
  const timingPrompt = `Based on ${userName}'s BaZi luck cycles and current element transits:

Next 3 Luck Cycles:
1. ${reading.luckCycles[0]?.element} ${reading.luckCycles[0]?.animal} (Ages ${reading.luckCycles[0]?.startAge}-${reading.luckCycles[0]?.endAge})
2. ${reading.luckCycles[1]?.element} ${reading.luckCycles[1]?.animal} (Ages ${reading.luckCycles[1]?.startAge}-${reading.luckCycles[1]?.endAge})
3. ${reading.luckCycles[2]?.element} ${reading.luckCycles[2]?.animal} (Ages ${reading.luckCycles[2]?.startAge}-${reading.luckCycles[2]?.endAge})

Provide:
1. Best timing windows for career moves, investments, and major life decisions in the next 10 years
2. Years to be cautious and conservative
3. Optimal periods for starting new ventures
4. Relationship and family timing considerations

Be specific with ages/years and explain the elemental reasoning. 2-3 paragraphs.`;

  const timingResult = await callTextAI({
    label: 'bazi-timing',
    model: GROQ_DEFAULT_TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a master BaZi (Four Pillars of Destiny) practitioner with deep knowledge of Chinese metaphysics.'
      },
      {
        role: 'user',
        content: timingPrompt
      }
    ],
    maxTokens: 600,
    temperature: 0.7,
    maxAttempts: 2,
  });

  const timingAndOpportunities = timingResult.content;

  return {
    chartOverview,
    lifePathInsights,
    elementHarmonization,
    timingAndOpportunities,
    generatedAt: new Date().toISOString(),
    version: '1.0',
  };
}
