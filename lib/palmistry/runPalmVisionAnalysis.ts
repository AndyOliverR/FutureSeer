/**
 * Shared palm vision analysis (Groq multimodal).
 * Used by the authenticated HTTP route and trusted server callers
 * (Stage B orchestrator, update-palmistry) so internal generation
 * does not depend on an open public proxy.
 */

import { runStructuredReportAI } from '@/lib/aiStructuredOutput';
import { resolveAiReportWithFallback } from '@/lib/aiFallbackRouter';
import { parseLlmJsonRecord } from '@/lib/aiStructuredOutputParse';
import { devLog } from '@/lib/devLogger';
import { getGroqVisionModel } from '@/lib/groqModels';

export type PalmVisionValidatedData = {
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

/** Normalize vision model JSON into the stable palm analysis response shape. */
export function validatePalmVisionData(palmData: Record<string, unknown>): PalmVisionValidatedData {
  const linesRaw = palmData.lines as Record<string, unknown> | undefined;
  const mountsRaw = palmData.mounts as Record<string, unknown> | undefined;
  const fingersRaw = palmData.fingers as Record<string, unknown> | undefined;

  if (!linesRaw || !mountsRaw || !palmData.handShape || !fingersRaw) {
    devLog.warn('⚠️ Vision AI returned incomplete data structure. Missing:', {
      lines: !linesRaw,
      mounts: !mountsRaw,
      handShape: !palmData.handShape,
      fingers: !fingersRaw,
    }, 'palmistry');
  }

  return {
    lines: {
      ...(linesRaw as PalmVisionValidatedData['lines']),
      lifeLine: (linesRaw?.lifeLine as PalmVisionValidatedData['lines']['lifeLine']) || {
        length: 'medium',
        depth: 'clear',
        quality: 'straight',
        breaks: [],
        interpretation: 'Life line analysis pending - please retry analysis',
      },
      heartLine: (linesRaw?.heartLine as PalmVisionValidatedData['lines']['heartLine']) || {
        length: 'medium',
        depth: 'clear',
        quality: 'straight',
        breaks: [],
        interpretation: 'Heart line analysis pending - please retry analysis',
      },
      headLine: (linesRaw?.headLine as PalmVisionValidatedData['lines']['headLine']) || {
        length: 'medium',
        depth: 'clear',
        quality: 'straight',
        breaks: [],
        interpretation: 'Head line analysis pending - please retry analysis',
      },
      fateLine: (linesRaw?.fateLine as PalmVisionValidatedData['lines']['fateLine']) || {
        presence: false,
        interpretation: 'Fate line analysis pending - please retry analysis',
      },
    },
    mounts: {
      ...(mountsRaw as PalmVisionValidatedData['mounts']),
      jupiter: (mountsRaw?.jupiter as PalmVisionValidatedData['mounts']['jupiter']) || {
        prominence: 'normal',
        interpretation: 'Mount analysis pending - please retry',
      },
      saturn: (mountsRaw?.saturn as PalmVisionValidatedData['mounts']['saturn']) || {
        prominence: 'normal',
        interpretation: 'Mount analysis pending - please retry',
      },
      apollo: (mountsRaw?.apollo as PalmVisionValidatedData['mounts']['apollo']) || {
        prominence: 'normal',
        interpretation: 'Mount analysis pending - please retry',
      },
      mercury: (mountsRaw?.mercury as PalmVisionValidatedData['mounts']['mercury']) || {
        prominence: 'normal',
        interpretation: 'Mount analysis pending - please retry',
      },
      mars: (mountsRaw?.mars as PalmVisionValidatedData['mounts']['mars']) || {
        prominence: 'normal',
        interpretation: 'Mount analysis pending - please retry',
      },
      venus: (mountsRaw?.venus as PalmVisionValidatedData['mounts']['venus']) || {
        prominence: 'normal',
        interpretation: 'Mount analysis pending - please retry',
      },
      moon: (mountsRaw?.moon as PalmVisionValidatedData['mounts']['moon']) || {
        prominence: 'normal',
        interpretation: 'Mount analysis pending - please retry',
      },
    },
    handShape: (palmData.handShape as PalmVisionValidatedData['handShape']) || {
      type: 'mixed',
      characteristics: ['Analysis incomplete'],
      interpretation: 'Hand shape analysis pending - please retry analysis',
    },
    fingers: {
      ...(fingersRaw as PalmVisionValidatedData['fingers']),
      thumb: (fingersRaw?.thumb as PalmVisionValidatedData['fingers']['thumb']) || {
        length: 'medium',
        thickness: 'medium',
        flexibility: 'normal',
        shape: 'square',
        interpretation: 'Finger analysis pending - please retry',
      },
      index: (fingersRaw?.index as PalmVisionValidatedData['fingers']['index']) || {
        length: 'medium',
        thickness: 'medium',
        flexibility: 'normal',
        shape: 'square',
        interpretation: 'Finger analysis pending - please retry',
      },
      middle: (fingersRaw?.middle as PalmVisionValidatedData['fingers']['middle']) || {
        length: 'medium',
        thickness: 'medium',
        flexibility: 'normal',
        shape: 'square',
        interpretation: 'Finger analysis pending - please retry',
      },
      ring: (fingersRaw?.ring as PalmVisionValidatedData['fingers']['ring']) || {
        length: 'medium',
        thickness: 'medium',
        flexibility: 'normal',
        shape: 'square',
        interpretation: 'Finger analysis pending - please retry',
      },
      pinky: (fingersRaw?.pinky as PalmVisionValidatedData['fingers']['pinky']) || {
        length: 'medium',
        thickness: 'medium',
        flexibility: 'normal',
        shape: 'square',
        interpretation: 'Finger analysis pending - please retry',
      },
    },
    markings: (palmData.markings as PalmVisionValidatedData['markings']) || {},
  };
}

const ANALYSIS_PROMPT = `You are an expert palmistry analyst with vision capabilities. Analyze this palm image in EXTREME DETAIL and return a comprehensive JSON palmistry reading.

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

export type PalmVisionAnalysisResult = {
  data: PalmVisionValidatedData;
  degraded: boolean;
  source: string;
  parsingFailed?: boolean;
};

/**
 * Run Groq vision palm analysis for a trusted caller.
 * Throws if GROQ_API_KEY is missing; otherwise may return deterministic defaults when LLM fails.
 */
export async function runPalmVisionAnalysis(imageUrl: string): Promise<PalmVisionAnalysisResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  devLog.info('🤲 Analyzing palm image with vision-capable AI...', undefined, 'palmistry');

  const resolved = await resolveAiReportWithFallback({
    label: 'palmistry-vision-analysis',
    tryLlm: async () => {
      const aiRun = await runStructuredReportAI({
        label: 'palmistry-vision-analysis',
        model: getGroqVisionModel(),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: ANALYSIS_PROMPT },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        temperature: 0.5,
        maxTokens: 3000,
        maxAttempts: 3,
      });

      const palmData =
        (aiRun.raw as Record<string, unknown> | null) ??
        parseLlmJsonRecord(aiRun.lastRaw ?? '');
      if (!palmData) {
        return {
          data: null,
          attempts: aiRun.attempts,
          failureMode: aiRun.failureMode,
          parsingFailed: true,
        };
      }

      return {
        data: validatePalmVisionData(palmData),
        attempts: aiRun.attempts,
        failureMode: 'none' as const,
      };
    },
    buildDeterministic: () => validatePalmVisionData({}),
  });

  return {
    data: resolved.data,
    degraded: Boolean(resolved.degraded && resolved.source !== 'llm'),
    source: resolved.source,
    parsingFailed: resolved.parsingFailed,
  };
}
