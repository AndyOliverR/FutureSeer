import { NextRequest, NextResponse } from 'next/server';
import { createAICompletion } from '@/lib/aiGateway';
import { devLog } from '@/lib/devLogger';

interface PalmAnalysisRequest {
  imageUrl: string;
  dominantHand?: 'left' | 'right';
  gender?: 'male' | 'female' | 'non-binary';
  age?: number;
}

interface PalmAnalysisResponse {
  success: boolean;
  data?: {
    lines: {
      lifeLine: {
        length: 'short' | 'medium' | 'long';
        depth: 'faint' | 'clear' | 'deep';
        quality: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
        breaks?: string[];
        interpretation: string;
      };
      heartLine: {
        length: 'short' | 'medium' | 'long';
        depth: 'faint' | 'clear' | 'deep';
        quality: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
        breaks?: string[];
        interpretation: string;
      };
      headLine: {
        length: 'short' | 'medium' | 'long';
        depth: 'faint' | 'clear' | 'deep';
        quality: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
        breaks?: string[];
        interpretation: string;
      };
      fateLine: {
        presence: boolean;
        length?: 'short' | 'medium' | 'long';
        depth?: 'faint' | 'clear' | 'deep';
        quality?: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
        breaks?: string[];
        interpretation: string;
      };
      healthLine?: {
        presence: boolean;
        length?: 'short' | 'medium' | 'long';
        depth?: 'faint' | 'clear' | 'deep';
        quality?: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
        interpretation?: string;
      };
      marriageLines?: {
        count: number;
        characteristics: string[];
        interpretation: string;
      };
      travelLines?: {
        count: number;
        characteristics: string[];
        interpretation: string;
      };
      sunLine?: {
        presence: boolean;
        length?: 'short' | 'medium' | 'long';
        quality?: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
        interpretation?: string;
      };
      mercuryLine?: {
        presence: boolean;
        length?: 'short' | 'medium' | 'long';
        quality?: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
        interpretation?: string;
      };
    };
    mounts: {
      jupiter: {
        prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent';
        interpretation: string;
      };
      saturn: {
        prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent';
        interpretation: string;
      };
      apollo: {
        prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent';
        interpretation: string;
      };
      mercury: {
        prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent';
        interpretation: string;
      };
      mars: {
        prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent';
        interpretation: string;
      };
      venus: {
        prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent';
        interpretation: string;
      };
      moon: {
        prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent';
        interpretation: string;
      };
    };
    handShape: {
      type: 'earth' | 'air' | 'fire' | 'water' | 'mixed';
      characteristics: string[];
      interpretation: string;
    };
    fingers: {
      thumb: {
        length: 'short' | 'medium' | 'long';
        thickness: 'thin' | 'medium' | 'thick';
        flexibility: 'rigid' | 'normal' | 'flexible';
        shape?: 'pointed' | 'square' | 'spatulate';
        interpretation: string;
      };
      index: {
        length: 'short' | 'medium' | 'long';
        thickness: 'thin' | 'medium' | 'thick';
        flexibility: 'rigid' | 'normal' | 'flexible';
        shape?: 'pointed' | 'square' | 'spatulate';
        interpretation: string;
      };
      middle: {
        length: 'short' | 'medium' | 'long';
        thickness: 'thin' | 'medium' | 'thick';
        flexibility: 'rigid' | 'normal' | 'flexible';
        shape?: 'pointed' | 'square' | 'spatulate';
        interpretation: string;
      };
      ring: {
        length: 'short' | 'medium' | 'long';
        thickness: 'thin' | 'medium' | 'thick';
        flexibility: 'rigid' | 'normal' | 'flexible';
        shape?: 'pointed' | 'square' | 'spatulate';
        interpretation: string;
      };
      pinky: {
        length: 'short' | 'medium' | 'long';
        thickness: 'thin' | 'medium' | 'thick';
        flexibility: 'rigid' | 'normal' | 'flexible';
        shape?: 'pointed' | 'square' | 'spatulate';
        interpretation: string;
      };
    };
    markings: {
      stars?: Array<{
        location: string;
        size: 'small' | 'medium' | 'large';
        associatedFeature?: string;
        interpretation: string;
      }>;
      crosses?: Array<{
        location: string;
        size: 'small' | 'medium' | 'large';
        associatedFeature?: string;
        interpretation: string;
      }>;
      triangles?: Array<{
        location: string;
        size: 'small' | 'medium' | 'large';
        associatedFeature?: string;
        interpretation: string;
      }>;
      islands?: Array<{
        location: string;
        line: string;
        size: 'small' | 'medium' | 'large';
        interpretation: string;
      }>;
      grids?: Array<{
        location: string;
        size: 'small' | 'medium' | 'large';
        associatedFeature?: string;
        interpretation: string;
      }>;
    };
  };
  error?: string;
}

/**
 * Palm Image Analysis Endpoint
 * 
 * Uses vision-capable AI model (meta-llama/llama-4-maverick-17b-128e-instruct) to analyze actual palm images.
 * The Maverick model has 128 experts optimized for detailed multimodal vision analysis.
 * 
 * The AI examines the uploaded palm photo and provides specific assessments of:
 * - Palm lines (length, depth, quality)
 * - Mounts (prominence levels)
 * - Hand shape (element classification)
 * - Fingers (length, thickness, flexibility)
 * 
 * This provides real, personalized palmistry readings instead of generic defaults.
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, dominantHand, gender, age }: PalmAnalysisRequest = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Build detailed vision-based prompt for actual palm image analysis
    const analysisPrompt = `You are an expert palmistry analyst with vision capabilities. Analyze this palm image in EXTREME DETAIL and return a comprehensive JSON palmistry reading.

CRITICAL: Examine the ACTUAL palm image carefully. Provide SPECIFIC, VARIED observations based on what you SEE. DO NOT use generic "medium/normal/clear" for everything.

**LINES** - Examine each major line visible in the image:

1. **Life Line** (curves from between thumb/index down toward wrist):
   - length: "short" | "medium" | "long" (measure actual visible length)
   - depth: "faint" | "clear" | "deep" (assess line darkness/prominence)
   - quality: "broken" | "straight" | "wavy" | "curved" | "forked" | "chained" | "island"
   - breaks: array of any visible breaks or gaps
   - interpretation: detailed interpretation based on observations

2. **Heart Line** (horizontal below fingers):
   - Same structure as Life Line

3. **Head Line** (horizontal in middle palm):
   - Same structure as Life Line

4. **Fate Line** (vertical center, may be absent):
   - present: true | false
   - If present, same structure as Life Line

**MOUNTS** - Assess prominence of raised flesh areas (look for actual elevation):

For each mount (Jupiter, Saturn, Apollo, Mercury, Mars, Venus, Luna):
- prominence: "flat" | "normal" | "prominent" | "very-prominent"
- Look for actual raised areas, not just assume "normal"

**HAND SHAPE**:
- Measure palm-to-finger ratio visually
- earth: square palm + short fingers (practical)
- air: square palm + long fingers (intellectual)
- fire: long palm + short fingers (energetic) 
- water: long palm + long fingers (emotional)
- mixed: doesn't fit clear category

**FINGERS** - For thumb, index, middle, ring, pinky:

Each finger:
- length: "short" | "medium" | "long" (relative to palm and other fingers)
- thickness: "thin" | "medium" | "thick"
- flexibility: "rigid" | "normal" | "flexible" (if discernible from image)

**OUTPUT FORMAT** - Return ONLY valid JSON (no markdown, no code blocks):

{
  "lines": {
    "lifeLine": { "length": "...", "depth": "...", "quality": "...", "breaks": [], "interpretation": "..." },
    "heartLine": { "length": "...", "depth": "...", "quality": "...", "breaks": [], "interpretation": "..." },
    "headLine": { "length": "...", "depth": "...", "quality": "...", "breaks": [], "interpretation": "..." },
    "fateLine": { "present": true/false, "length": "...", "depth": "...", "quality": "...", "breaks": [], "interpretation": "..." }
  },
  "mounts": {
    "jupiter": { "prominence": "..." },
    "saturn": { "prominence": "..." },
    "apollo": { "prominence": "..." },
    "mercury": { "prominence": "..." },
    "mars": { "prominence": "..." },
    "venus": { "prominence": "..." },
    "luna": { "prominence": "..." }
  },
  "handShape": {
    "type": "earth|air|fire|water|mixed",
    "description": "Brief description of why this classification"
  },
  "fingers": {
    "thumb": { "length": "...", "thickness": "...", "flexibility": "..." },
    "index": { "length": "...", "thickness": "...", "flexibility": "..." },
    "middle": { "length": "...", "thickness": "...", "flexibility": "..." },
    "ring": { "length": "...", "thickness": "...", "flexibility": "..." },
    "pinky": { "length": "...", "thickness": "...", "flexibility": "..." }
  }
}

REMEMBER: Base ALL observations on the ACTUAL image. Use diverse values - not everything should be "medium/normal/clear".`;

    devLog.info('🤲 Analyzing palm image with vision-capable AI...', undefined, 'palmistry');

    const result = await createAICompletion({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: analysisPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      temperature: 0.5,  // Slightly higher for more varied, creative analysis
      maxTokens: 3000,   // More tokens for detailed analysis from Maverick
      response_format: { type: 'json_object' }
    });

    const analysisText = result.content || '';
    
    if (!analysisText) {
      throw new Error('Empty response from Groq API');
    }

    // Parse JSON response
    let palmData: any;
    try {
      palmData = JSON.parse(analysisText);
    } catch (parseError) {
      devLog.error('Failed to parse Groq response:', parseError, 'route');
      devLog.debug('Raw response:', analysisText, 'palmistry');
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || analysisText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        palmData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Invalid JSON response from Groq API');
      }
    }

    // Log if AI returned incomplete data (vision model should provide complete analysis)
    if (!palmData.lines || !palmData.mounts || !palmData.handShape || !palmData.fingers) {
      devLog.warn('⚠️ Vision AI returned incomplete data structure. Missing:', {
        lines: !palmData.lines,
        mounts: !palmData.mounts,
        handShape: !palmData.handShape,
        fingers: !palmData.fingers
      }, 'palmistry');
    }

    // Validate and ensure all required fields exist
    // Minimal defaults only - vision model should provide actual analysis
    const validatedData = {
      lines: {
        lifeLine: palmData.lines?.lifeLine || {
          length: 'medium',
          depth: 'clear',
          quality: 'straight',
          breaks: [],
          interpretation: 'Life line analysis pending - please retry analysis'
        },
        heartLine: palmData.lines?.heartLine || {
          length: 'medium',
          depth: 'clear',
          quality: 'straight',
          breaks: [],
          interpretation: 'Heart line analysis pending - please retry analysis'
        },
        headLine: palmData.lines?.headLine || {
          length: 'medium',
          depth: 'clear',
          quality: 'straight',
          breaks: [],
          interpretation: 'Head line analysis pending - please retry analysis'
        },
        fateLine: palmData.lines?.fateLine || {
          presence: false,
          interpretation: 'Fate line analysis pending - please retry analysis'
        },
        ...palmData.lines
      },
      mounts: {
        jupiter: palmData.mounts?.jupiter || {
          prominence: 'normal',
          interpretation: 'Mount analysis pending - please retry'
        },
        saturn: palmData.mounts?.saturn || {
          prominence: 'normal',
          interpretation: 'Mount analysis pending - please retry'
        },
        apollo: palmData.mounts?.apollo || {
          prominence: 'normal',
          interpretation: 'Mount analysis pending - please retry'
        },
        mercury: palmData.mounts?.mercury || {
          prominence: 'normal',
          interpretation: 'Mount analysis pending - please retry'
        },
        mars: palmData.mounts?.mars || {
          prominence: 'normal',
          interpretation: 'Mount analysis pending - please retry'
        },
        venus: palmData.mounts?.venus || {
          prominence: 'normal',
          interpretation: 'Mount analysis pending - please retry'
        },
        moon: palmData.mounts?.moon || {
          prominence: 'normal',
          interpretation: 'Mount analysis pending - please retry'
        },
        ...palmData.mounts
      },
      handShape: palmData.handShape || {
        type: 'mixed',
        characteristics: ['Analysis incomplete'],
        interpretation: 'Hand shape analysis pending - please retry analysis'
      },
      fingers: {
        thumb: palmData.fingers?.thumb || {
          length: 'medium',
          thickness: 'medium',
          flexibility: 'normal',
          shape: 'square',
          interpretation: 'Finger analysis pending - please retry'
        },
        index: palmData.fingers?.index || {
          length: 'medium',
          thickness: 'medium',
          flexibility: 'normal',
          shape: 'square',
          interpretation: 'Finger analysis pending - please retry'
        },
        middle: palmData.fingers?.middle || {
          length: 'medium',
          thickness: 'medium',
          flexibility: 'normal',
          shape: 'square',
          interpretation: 'Finger analysis pending - please retry'
        },
        ring: palmData.fingers?.ring || {
          length: 'medium',
          thickness: 'medium',
          flexibility: 'normal',
          shape: 'square',
          interpretation: 'Finger analysis pending - please retry'
        },
        pinky: palmData.fingers?.pinky || {
          length: 'medium',
          thickness: 'medium',
          flexibility: 'normal',
          shape: 'square',
          interpretation: 'Finger analysis pending - please retry'
        },
        ...palmData.fingers
      },
      markings: palmData.markings || {}
    };

    devLog.info('✅ Palm analysis completed successfully', undefined, 'palmistry');

    return NextResponse.json({
      success: true,
      data: validatedData
    } as PalmAnalysisResponse);

  } catch (error: any) {
    // Detailed error handling with user-friendly messages
    let userMessage = 'Failed to analyze palm image';
    let statusCode = 500;

    if (error.message?.includes('context_length_exceeded') || 
        error.message?.includes('reduce the length')) {
      userMessage = 'Analysis request too complex. The palm image may be too large or detailed. Please try uploading a clearer, simpler image.';
      statusCode = 400;
    } else if (error.message?.includes('rate_limit')) {
      userMessage = 'Too many requests. Please wait a moment and try again.';
      statusCode = 429;
    } else if (error.message?.includes('authentication') || error.message?.includes('API key')) {
      userMessage = 'Service configuration error. Please contact support.';
      statusCode = 503;
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    } else if (error.message?.includes('timeout')) {
      userMessage = 'Analysis timed out. Please try again with a clearer image.';
      statusCode = 504;
    }

    devLog.error('❌ Palm analysis error:', {
      error: error.message,
      stack: error.stack,
      userMessage
    }, 'route');

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        retryable: statusCode >= 500 || statusCode === 429, // Indicate if retry is recommended
        technical: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}

