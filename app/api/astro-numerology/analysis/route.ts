import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { createAICompletion } from '@/lib/aiGateway';
import { calculateLifePathNumber, calculateDestinyNumber } from '@/lib/numerologyCalculations';
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
      // Admin SDK API - handle nested collections
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
      // Client SDK API
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, ...collectionPath, docId);
      return await getDoc(docRef);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devLog.warn('Error getting document:', error, 'astro-numerology');
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
      // Admin SDK API - handle nested collections
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
      // Client SDK API
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(db, ...collectionPath, docId);
      await setDoc(docRef, data);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      devLog.warn('Error setting document:', error, 'astro-numerology');
    }
  }
}


interface AstroNumerologyRequest {
  userId: string;
  birthDate: string;
  fullName: string;
  sunSign?: string;
}

interface AstroNumerologyResponse {
  success: boolean;
  data?: {
    sunSign: string;
    lifePathNumber: number;
    nameNumber: number;
    comprehensiveAnalysis: {
      personalitySynthesis: string;
      careerGuidance: string;
      relationshipInsights: string;
      lifePurpose: string;
      personalGrowth: string;
      challenges: string[];
      opportunities: string[];
      yearlyForecast: string;
    };
    timestamp: number;
  };
  error?: string;
}

// Build comprehensive Groq prompt
function buildGroqPrompt(sunSign: string, lifePathNumber: number, nameNumber: number, birthDate: string, fullName: string): string {
  const currentYear = new Date().getFullYear();
  
  return `You are an expert astro-numerologist specializing in combining Western Astrology (Tropical Zodiac) with Pythagorean Numerology.

User Profile:
- Sun Sign: ${sunSign} (Western Astrology - represents core personality)
- Life Path Number: ${lifePathNumber} (from birth date - represents life journey)
- Name Number: ${nameNumber} (from full name - represents natural talents)
- Birth Date: ${birthDate}
- Full Name: ${fullName}
- Current Year: ${currentYear}

Generate a comprehensive astro-numerology analysis covering all life areas. Provide detailed, insightful, and practical guidance. Write in a warm, empowering, and accessible tone.

Format your response as a JSON object with the following structure:
{
  "personalitySynthesis": "Detailed paragraph explaining how the sun sign, life path number, and name number work together to create a unique personality profile. Be specific and insightful, showing how these energies blend.",
  "careerGuidance": "Detailed paragraph about career paths that align with these combined energies, what the life purpose reveals, and specific vocational directions.",
  "relationshipInsights": "Detailed paragraph about how these energies manifest in relationships, compatibility patterns, and interpersonal dynamics.",
  "lifePurpose": "Detailed paragraph about the deeper life purpose when combining astrological and numerological insights, including destiny themes.",
  "personalGrowth": "Detailed paragraph with specific recommendations for personal development based on the combined analysis, including actionable steps.",
  "challenges": ["Challenge 1 description", "Challenge 2 description", "Challenge 3 description"],
  "opportunities": ["Opportunity 1 description", "Opportunity 2 description", "Opportunity 3 description"],
  "yearlyForecast": "Detailed paragraph about insights for ${currentYear} based on the numbers and sun sign, including key themes and timing considerations."
}

Make each section comprehensive yet concise, providing valuable insights that help the user understand themselves better and navigate their life path.`;
}

// Parse Groq response and extract structured data
function parseGroqResponse(response: string): NonNullable<AstroNumerologyResponse['data']>['comprehensiveAnalysis'] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        personalitySynthesis: parsed.personalitySynthesis || '',
        careerGuidance: parsed.careerGuidance || '',
        relationshipInsights: parsed.relationshipInsights || '',
        lifePurpose: parsed.lifePurpose || '',
        personalGrowth: parsed.personalGrowth || '',
        challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
        yearlyForecast: parsed.yearlyForecast || ''
      };
    }
  } catch (error) {
    devLog.warn('Failed to parse JSON from Groq response, using fallback', undefined, 'astro-numerology');
  }
  
  // Fallback: Split response into sections if JSON parsing fails
  const sections = response.split(/\n\n+/);
  return {
    personalitySynthesis: sections[0] || response.substring(0, 300),
    careerGuidance: sections[1] || 'Career guidance based on your combined astro-numerology profile.',
    relationshipInsights: sections[2] || 'Relationship insights from your astro-numerology combination.',
    lifePurpose: sections[3] || 'Life purpose revealed through astro-numerology analysis.',
    personalGrowth: sections[4] || 'Personal growth recommendations for your journey.',
    challenges: ['Balancing different aspects of your personality', 'Navigating life transitions', 'Developing your full potential'],
    opportunities: ['Harnessing your unique combination of energies', 'Aligning with your life purpose', 'Building meaningful connections'],
    yearlyForecast: sections[5] || `Your ${new Date().getFullYear()} forecast based on your astro-numerology profile.`
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, birthDate, fullName, sunSign }: AstroNumerologyRequest = await request.json();

    // Validate required fields
    if (!userId || !birthDate || !fullName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: userId, birthDate, or fullName'
      }, { status: 400 });
    }

    devLog.info('🔮 Astro-Numerology API: Generating comprehensive report for user:', userId, 'astro-numerology');

    // Calculate numerology numbers
    const lifePathNumber = calculateLifePathNumber(birthDate);
    const nameNumber = calculateDestinyNumber(fullName); // Destiny Number is the Name Number

    // Get sun sign if not provided (would need to be passed from component)
    const actualSunSign = sunSign || 'Unknown';

    if (actualSunSign === 'Unknown') {
      return NextResponse.json({
        success: false,
        error: 'Sun sign is required. Please ensure Western astrology chart data is available.'
      }, { status: 400 });
    }

    // Check Firebase cache
    try {
      const docSnap = await getCachedDoc(['users', userId, 'astroNumerologyReports'], 'current');
      
      if (docSnap && docSnap.exists()) {
        const cachedData = docSnap.data();
        // Check if cache is valid (same data and < 24 hours old)
        const birthDataKey = `${birthDate}_${fullName}_${actualSunSign}`;
        const cachedBirthKey = cachedData?.birthDataKey;
        const lastUpdated = cachedData?.timestamp;
        
        if (cachedBirthKey === birthDataKey && lastUpdated) {
          const hoursSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60);
          if (hoursSinceUpdate < 24) {
            devLog.info('✅ Returning cached Astro-Numerology report for user:', userId, 'astro-numerology');
            return NextResponse.json({
              success: true,
              data: cachedData.data || cachedData
            });
          }
        }
      }
    } catch (cacheError: any) {
      if (process.env.NODE_ENV === 'development') {
        devLog.warn('⚠️ Error checking cache, proceeding with generation:', cacheError?.message || cacheError, 'astro-numerology');
      }
    }

    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      devLog.error('❌ GROQ_API_KEY is not configured', undefined, 'route');
      // Return fallback response with basic analysis
      return NextResponse.json({
        success: true,
        data: {
          sunSign: actualSunSign,
          lifePathNumber,
          nameNumber,
          comprehensiveAnalysis: {
            personalitySynthesis: `Your ${actualSunSign} sun sign combines with Life Path ${lifePathNumber} and Name Number ${nameNumber} to create a unique personality blend.`,
            careerGuidance: `Career paths that align with Life Path ${lifePathNumber} and your ${actualSunSign} traits would be most fulfilling.`,
            relationshipInsights: `Your relationship style is influenced by both your ${actualSunSign} nature and your numerological patterns.`,
            lifePurpose: `Your life purpose is revealed through the combination of your astrological and numerological influences.`,
            personalGrowth: `Focus on developing the strengths of both your sun sign and your life path number for optimal growth.`,
            challenges: ['Balancing different aspects of your personality', 'Aligning actions with your life purpose'],
            opportunities: ['Leveraging your unique combination of energies', 'Connecting with like-minded individuals'],
            yearlyForecast: `This year brings opportunities to integrate your astrological and numerological influences.`
          },
          timestamp: Date.now()
        }
      });
    }

    // Build comprehensive prompt
    const prompt = buildGroqPrompt(actualSunSign, lifePathNumber, nameNumber, birthDate, fullName);

    // Call Groq API
    devLog.info('🤖 Calling Groq API for comprehensive Astro-Numerology analysis...', undefined, 'astro-numerology');
    const result = await createAICompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert astro-numerologist specializing in combining Western Astrology (Tropical Zodiac) with Pythagorean Numerology. Provide comprehensive, insightful, and practical guidance. Always respond with valid JSON when requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.75,
      maxTokens: 2500
    });

    const aiResponse = result.content || '';
    devLog.info('✅ Groq API response received', undefined, 'astro-numerology');

    // Parse the response
    const comprehensiveAnalysis = parseGroqResponse(aiResponse);

    // Prepare response data
    const responseData: AstroNumerologyResponse['data'] = {
      sunSign: actualSunSign,
      lifePathNumber,
      nameNumber,
      comprehensiveAnalysis,
      timestamp: Date.now()
    };

    // Cache in Firebase
    try {
      const birthDataKey = `${birthDate}_${fullName}_${actualSunSign}`;
      await setCachedDoc(['users', userId, 'astroNumerologyReports'], 'current', {
        data: responseData,
        birthDataKey,
        timestamp: Date.now()
      });
      devLog.info('✅ Cached Astro-Numerology report in Firebase', undefined, 'astro-numerology');
    } catch (cacheError: any) {
      if (process.env.NODE_ENV === 'development') {
        devLog.warn('⚠️ Error caching report:', cacheError?.message || cacheError, 'astro-numerology');
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error: any) {
    devLog.error('❌ Astro-Numerology API error:', error, 'route');
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate Astro-Numerology analysis'
    }, { status: 500 });
  }
}

