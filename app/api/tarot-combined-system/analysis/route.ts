/* eslint-disable security/detect-non-literal-regexp */
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { runStructuredReportAI } from '@/lib/aiStructuredOutput';
import { resolveAiReportWithFallback, mapStructuredReportRun } from '@/lib/aiFallbackRouter';
import { tarotIntelligence } from '@/lib/tarotIntelligence';
import { calculateLifePathNumber, calculateDestinyNumber, calculateSoulNumber, calculatePersonalityNumber, calculatePersonalYearNumber } from '@/lib/numerologyCalculations';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';
import { devLog } from '@/lib/devLogger';

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
      devLog.warn('Error getting document:', error, 'tarot-combined-system');
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
      devLog.warn('Error setting document:', error, 'tarot-combined-system');
    }
  }
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_VERSION = '1.2'; // Increment to invalidate old caches (v1.2: second-person perspective fix)

type HolisticAnalysis = {
  overview: string;
  integration: string;
  timing: string;
  guidance: string;
};

function convertToSecondPerson(text: string): string {
  return text
    .replace(/\bthis individual\b/gi, 'you')
    .replace(/\bthis person\b/gi, 'you')
    .replace(/\btheir\b/gi, 'your')
    .replace(/\bthey\b/gi, 'you')
    .replace(/\bthem\b/gi, 'you')
    .replace(/\bthemselves\b/gi, 'yourself')
    .replace(/\bTheir\b/g, 'Your')
    .replace(/\bThey\b/g, 'You')
    .replace(/\bThis individual\b/g, 'You')
    .replace(/\bThis person\b/g, 'You');
}

function mapHolisticFromParsed(parsed: Record<string, unknown>, personalYearNumber: number): HolisticAnalysis {
  return {
    overview: convertToSecondPerson(
      (parsed.overview as string) || 'Your combined divination profile reveals a unique spiritual path.',
    ),
    integration: convertToSecondPerson(
      (parsed.integration as string) || 'These systems work together to provide multi-layered insights.',
    ),
    timing: convertToSecondPerson(
      (parsed.timing as string) ||
        `Your Personal Year ${personalYearNumber} brings specific themes and opportunities.`,
    ),
    guidance: convertToSecondPerson(
      (parsed.guidance as string) ||
        'Use these insights to navigate life with greater awareness and purpose.',
    ),
  };
}

function buildHolisticDeterministic(personalYearNumber: number): HolisticAnalysis {
  return mapHolisticFromParsed({}, personalYearNumber);
}

function extractHolisticFromRaw(raw: string, personalYearNumber: number): HolisticAnalysis {
  const extractField = (fieldName: string): string => {
    const regex = new RegExp(`"${fieldName}":\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's');
    const match = raw.match(regex);
    if (match && match[1]) {
      return match[1]
        .replace(/\\n/g, ' ')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
    return '';
  };
  return mapHolisticFromParsed(
    {
      overview: extractField('overview'),
      integration: extractField('integration'),
      timing: extractField('timing'),
      guidance: extractField('guidance'),
    },
    personalYearNumber,
  );
}

interface CombinedSystemRequest {
  userId: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  fullName: string;
}

interface CombinedSystemResponse {
  success: boolean;
  data?: {
    tarotProfile: {
      birthCard: any;
      lifePathCard: any;
      soulCard: any;
      personalityCard: any;
    };
    numerology: {
      lifePathNumber: number;
      destinyNumber: number;
      soulNumber: number;
      personalityNumber: number;
      personalYearNumber?: number;
    };
    westernAstrology: {
      sunSign?: string;
      moonSign?: string;
      risingSign?: string;
    };
    holisticAnalysis: {
      overview: string;
      integration: string;
      timing: string;
      guidance: string;
    };
    crossReferences: {
      tarotNumerologyLinks: Array<{ tarotCard: string; numerologyNumber: number; connection: string }>;
      astrologyTarotLinks: Array<{ planet: string; tarotCard: string; connection: string }>;
      timingInsights: string;
    };
    recommendations: string[];
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, birthDate, birthTime, birthPlace, fullName }: CombinedSystemRequest = await request.json();

    if (!userId || !birthDate || !fullName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId, birthDate, or fullName'
      }, { status: 400 });
    }

    devLog.info('🔮 Combined System API: Generating analysis for user:', userId, 'tarot-combined-system');

    // Check cache first - but only if we have valid parsed data and matching version
    const cacheDoc = await getCachedDoc(['users', userId, 'combinedSystemReports'], 'current');
    if (cacheDoc?.exists()) {
      const cachedData = cacheDoc.data();
      const lastUpdated = cachedData?.lastUpdated;
      const cacheVersion = cachedData?.version;
      
      // Also check if cached data has valid holisticAnalysis format
      const hasValidFormat = cachedData?.data?.holisticAnalysis?.overview && 
                             typeof cachedData.data.holisticAnalysis.overview === 'string' &&
                             !cachedData.data.holisticAnalysis.overview.includes('```json') &&
                             !cachedData.data.holisticAnalysis.overview.includes('```');
      
      if (lastUpdated && hasValidFormat && cacheVersion === CACHE_VERSION) {
        const cacheAge = new Date().getTime() - new Date(lastUpdated).getTime();
        if (cacheAge < CACHE_TTL) {
          devLog.info('✅ Returning cached Combined System report for user:', userId, 'tarot-combined-system');
          return NextResponse.json({
            success: true,
            data: cachedData.data
          });
        }
      } else {
        if (!hasValidFormat) {
          devLog.info('⚠️ Cached data has invalid format, regenerating...', undefined, 'tarot-combined-system');
        } else if (cacheVersion !== CACHE_VERSION) {
          devLog.info('⚠️ Cache version mismatch, regenerating...', undefined, 'tarot-combined-system');
        }
      }
    }

    // Calculate Tarot Profile Cards
    const tarotProfile = tarotIntelligence.calculateProfileCards(birthDate, fullName);
    devLog.debug('📊 Tarot profile calculated', undefined, 'tarot-combined-system');

    // Calculate Numerology
    const lifePathNumber = calculateLifePathNumber(birthDate);
    const destinyNumber = calculateDestinyNumber(fullName);
    const soulNumber = calculateSoulNumber(fullName);
    const personalityNumber = calculatePersonalityNumber(fullName);
    
    // Calculate Personal Year
    const currentYear = new Date().getFullYear();
    const personalYearNumber = calculatePersonalYearNumber(birthDate, currentYear);

    devLog.debug('🔢 Numerology calculated', undefined, 'tarot-combined-system');

    // Calculate Western Astrology (if birth time and place available)
    let westernAstrology: { sunSign?: string; moonSign?: string; risingSign?: string } = {};
    if (birthTime && birthPlace) {
      try {
        const birthData: BirthData = {
          birthDate,
          birthTime,
          birthPlace,
          latitude: 0, // Will be looked up if needed
          longitude: 0
        };
        
        const chartResult = await universalOccultService.calculateWesternChart(birthData, {
          houseSystem: 'placidus',
          includeAspects: false
        });

        const sunPlanet = chartResult.data?.planets?.find((p: any) => p.name === 'Sun');
        const moonPlanet = chartResult.data?.planets?.find((p: any) => p.name === 'Moon');
        const risingHouse = chartResult.data?.houses?.[0];

        westernAstrology = {
          sunSign: sunPlanet?.sign?.signName || sunPlanet?.sign,
          moonSign: moonPlanet?.sign?.signName || moonPlanet?.sign,
          risingSign: risingHouse?.sign?.signName || risingHouse?.sign
        };

        devLog.debug('⭐ Western Astrology calculated', undefined, 'tarot-combined-system');
      } catch (error) {
        devLog.warn('⚠️ Failed to calculate Western Astrology:', error, 'tarot-combined-system');
      }
    }

    // Create cross-references
    const tarotNumerologyLinks: Array<{ tarotCard: string; numerologyNumber: number; connection: string }> = [];
    
    // Link Life Path Number to Life Path Card
    if (tarotProfile.lifePathCard && lifePathNumber) {
      tarotNumerologyLinks.push({
        tarotCard: tarotProfile.lifePathCard.name,
        numerologyNumber: lifePathNumber,
        connection: `Your Life Path Number ${lifePathNumber} aligns with the ${tarotProfile.lifePathCard.name}, indicating core life themes and spiritual lessons.`
      });
    }

    // Link Personality Number to Personality Card
    if (tarotProfile.personalityCard && personalityNumber) {
      tarotNumerologyLinks.push({
        tarotCard: tarotProfile.personalityCard.name,
        numerologyNumber: personalityNumber,
        connection: `Your Personality Number ${personalityNumber} resonates with the ${tarotProfile.personalityCard.name}, revealing how you express yourself to the world.`
      });
    }

    // Link Soul Number to Soul Card
    if (tarotProfile.soulCard && soulNumber) {
      tarotNumerologyLinks.push({
        tarotCard: tarotProfile.soulCard.name,
        numerologyNumber: soulNumber,
        connection: `Your Soul Number ${soulNumber} connects with the ${tarotProfile.soulCard.name}, representing your inner desires and motivations.`
      });
    }

    // Create astrology-tarot links if we have astrological data
    const astrologyTarotLinks: Array<{ planet: string; tarotCard: string; connection: string }> = [];
    if (westernAstrology.sunSign && tarotProfile.birthCard) {
      astrologyTarotLinks.push({
        planet: `Sun in ${westernAstrology.sunSign}`,
        tarotCard: tarotProfile.birthCard.name,
        connection: `Your Sun Sign ${westernAstrology.sunSign} energy harmonizes with your Birth Card ${tarotProfile.birthCard.name}, creating a powerful expression of your core identity.`
      });
    }

    // Generate holistic analysis using AI
    const analysisPrompt = `You are an expert in Tarot, Western Astrology, and Numerology writing a personal reading. CRITICAL: Write EVERYTHING in SECOND PERSON. Use "you", "your", "yourself" - NEVER use third person like "this individual", "this person", "their", "they", "them". Address the reader directly as "you".

Profile Data:
Tarot Profile:
- Birth Card: ${tarotProfile.birthCard?.name || 'Unknown'}
- Life Path Card: ${tarotProfile.lifePathCard?.name || 'Unknown'}
- Soul Card: ${tarotProfile.soulCard?.name || 'Unknown'}
- Personality Card: ${tarotProfile.personalityCard?.name || 'Unknown'}

Numerology:
- Life Path Number: ${lifePathNumber}
- Destiny Number: ${destinyNumber}
- Soul Number: ${soulNumber}
- Personality Number: ${personalityNumber}
- Personal Year Number: ${personalYearNumber}

Western Astrology:
- Sun Sign: ${westernAstrology.sunSign || 'Not available'}
- Moon Sign: ${westernAstrology.moonSign || 'Not available'}
- Rising Sign: ${westernAstrology.risingSign || 'Not available'}

Write in SECOND PERSON ONLY:
- Say "You are..." not "This individual is..."
- Say "Your Life Path..." not "Their Life Path..."
- Say "You can expect..." not "They can expect..."
- Say "your journey" not "their journey"

Provide:
1. Overview: A unified understanding of your spiritual and life path, written directly to you using "you" and "your" (2-3 sentences)
2. Integration: How these three systems complement and enhance each other in your life using "you" and "your" (3-4 sentences)
3. Timing: Your current Personal Year ${personalYearNumber} insights and when your key energies are strongest using "you" and "your" (2-3 sentences)
4. Guidance: Practical advice for you to navigate life using all three systems using "you" and "your" (2-3 sentences)

Format as JSON with keys: overview, integration, timing, guidance`;

    const holisticResolved = await resolveAiReportWithFallback({
      label: 'tarot-combined-analysis',
      userId,
      tryLlm: async () => {
        const aiRun = await runStructuredReportAI({
          label: 'tarot-combined-analysis',
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: analysisPrompt }],
          maxTokens: 800,
          temperature: 0.7,
          maxAttempts: 3,
        });
        const mapped = mapStructuredReportRun(aiRun, (parsed) =>
          mapHolisticFromParsed(parsed, personalYearNumber),
        );
        if (mapped.data) {
          devLog.debug('✅ Successfully parsed holistic analysis', undefined, 'tarot-combined-system');
          return mapped;
        }
        if (aiRun.lastRaw) {
          return {
            data: extractHolisticFromRaw(aiRun.lastRaw, personalYearNumber),
            attempts: aiRun.attempts,
            failureMode: aiRun.failureMode,
          };
        }
        return mapped;
      },
      readFirestoreCache: async () => {
        const cacheDoc = await getCachedDoc(['users', userId, 'combinedSystemReports'], 'current');
        if (!cacheDoc?.exists()) return null;
        const cachedData = cacheDoc.data();
        const holistic = cachedData?.data?.holisticAnalysis as HolisticAnalysis | undefined;
        if (
          holistic?.overview &&
          typeof holistic.overview === 'string' &&
          !holistic.overview.includes('```json') &&
          !holistic.overview.includes('```')
        ) {
          return holistic;
        }
        return null;
      },
      buildDeterministic: () => buildHolisticDeterministic(personalYearNumber),
    });

    const holisticAnalysis = holisticResolved.data;

    // Generate timing insights
    const timingInsights = `Your Personal Year ${personalYearNumber} aligns with your ${tarotProfile.lifePathCard?.name || 'Life Path Card'}, indicating this is a time of ${personalYearNumber === 1 ? 'new beginnings' : personalYearNumber === 2 ? 'partnership and cooperation' : personalYearNumber === 3 ? 'creativity and expression' : personalYearNumber === 4 ? 'stability and building' : personalYearNumber === 5 ? 'change and freedom' : personalYearNumber === 6 ? 'responsibility and service' : personalYearNumber === 7 ? 'introspection and learning' : personalYearNumber === 8 ? 'power and achievement' : 'completion and wisdom'}.`;

    // Generate recommendations
    const recommendations = [
      `Draw a Tarot card each day and connect it with your Personal Year ${personalYearNumber} energy.`,
      `Use your ${westernAstrology.sunSign ? `${westernAstrology.sunSign} ` : ''}Sun Sign qualities to express your ${tarotProfile.personalityCard?.name || 'Personality Card'} energy.`,
      `Align major decisions with your Life Path Number ${lifePathNumber} purpose and your ${tarotProfile.lifePathCard?.name || 'Life Path Card'} themes.`,
      `During ${westernAstrology.moonSign ? `${westernAstrology.moonSign} ` : ''}Moon phases, focus on your ${tarotProfile.soulCard?.name || 'Soul Card'} inner needs.`
    ];

    const result = {
      tarotProfile,
      numerology: {
        lifePathNumber,
        destinyNumber,
        soulNumber,
        personalityNumber,
        personalYearNumber
      },
      westernAstrology,
      holisticAnalysis,
      crossReferences: {
        tarotNumerologyLinks,
        astrologyTarotLinks,
        timingInsights
      },
      recommendations
    };

    if (holisticResolved.degraded && holisticResolved.source !== 'llm') {
      devLog.warn(
        `⚠️ Tarot combined degraded (${holisticResolved.source}) — not caching fresh LLM output`,
        undefined,
        'tarot-combined-system',
      );
      return NextResponse.json({
        success: true,
        data: result,
        parsingFailed: holisticResolved.parsingFailed ?? true,
        fallbackSource: holisticResolved.source,
        error:
          holisticResolved.source === 'firestore_cache'
            ? 'Using last saved report; AI narrative refresh failed'
            : 'Failed to parse AI response, using combined-system defaults',
      });
    }

    await setCachedDoc(['users', userId, 'combinedSystemReports'], 'current', {
      data: result,
      lastUpdated: new Date().toISOString(),
      version: CACHE_VERSION,
      userId,
      birthDate,
      fullName,
    });

    devLog.info('✅ Combined System analysis generated and cached for user:', userId, 'tarot-combined-system');

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    devLog.error('❌ Error generating Combined System analysis:', error, 'tarot-combined-system');
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate combined system analysis'
    }, { status: 500 });
  }
}
