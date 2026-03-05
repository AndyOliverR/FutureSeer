/**
 * Seer Intent Router
 * Maps user questions to intents and sub-intents for the Ask the Seer flow.
 * Used by QA tests and conversational memory.
 */

export interface RouteIntentResult {
  intent: string;
  subIntent: string | null;
  confidence?: number;
  clarificationQuestion?: string;
  blockedRemedyTypes?: string[];
}

const REMEDY_SUB_INTENTS: Record<string, { subIntent: string; blockGemstones: boolean }> = {
  mudra: { subIntent: 'mudras', blockGemstones: true },
  mudras: { subIntent: 'mudras', blockGemstones: true },
  colour: { subIntent: 'colors', blockGemstones: true },
  color: { subIntent: 'colors', blockGemstones: true },
  colours: { subIntent: 'colors', blockGemstones: true },
  colors: { subIntent: 'colors', blockGemstones: true },
  gemstone: { subIntent: 'gemstones', blockGemstones: false },
  gemstones: { subIntent: 'gemstones', blockGemstones: false },
};

const INTENT_KEYWORDS: Array<{ intent: string; keywords: string[]; confidence: number }> = [
  { intent: 'purpose', keywords: ['life purpose', 'purpose', 'soul', 'calling'], confidence: 0.85 },
  { intent: 'timing', keywords: ['when should', 'when to', 'launch', 'timing', 'when can'], confidence: 0.8 },
  { intent: 'decision', keywords: ['which option', 'better for me', 'choose between', 'decision'], confidence: 0.8 },
  { intent: 'remedies', keywords: ['remedies', 'remedy', 'mudra', 'gemstone', 'colour', 'color', 'practice'], confidence: 0.85 },
];

const GENERIC_REMEDY_QUESTION = 'Would you like guidance on gemstones, mudras, colours, or other remedies?';

export function routeIntent(question: string): RouteIntentResult {
  const q = (question || '').toLowerCase().trim();
  if (!q) {
    return {
      intent: 'general',
      subIntent: null,
      confidence: 0,
      clarificationQuestion: 'What would you like to know about your chart?',
    };
  }

  // Remedy sub-intent detection
  if (q.includes('remed') || q.includes('mudra') || q.includes('gemstone') || q.includes('colour') || q.includes('color')) {
    for (const [key, { subIntent, blockGemstones }] of Object.entries(REMEDY_SUB_INTENTS)) {
      if (q.includes(key)) {
        return {
          intent: 'remedies',
          subIntent,
          confidence: 0.9,
          blockedRemedyTypes: blockGemstones ? ['gemstones'] : [],
        };
      }
    }
    // Generic remedy question
    if (q.includes('remed') && !q.includes('gemstone') && !q.includes('mudra') && !q.includes('colour') && !q.includes('color')) {
      return {
        intent: 'remedies',
        subIntent: null,
        confidence: 0.7,
        clarificationQuestion: GENERIC_REMEDY_QUESTION,
      };
    }
  }

  // Other intents
  for (const { intent, keywords, confidence } of INTENT_KEYWORDS) {
    if (keywords.some((kw) => q.includes(kw))) {
      const isGenericRemedy = intent === 'remedies' && !q.match(/mudra|gemstone|colour|color|colours/);
      return {
        intent,
        subIntent: null,
        confidence,
        clarificationQuestion: isGenericRemedy ? GENERIC_REMEDY_QUESTION : undefined,
      };
    }
  }

  // Vague / unknown
  return {
    intent: 'general',
    subIntent: null,
    confidence: 0.3,
    clarificationQuestion: 'What would you like to know about your chart?',
  };
}

export function shouldAskClarification(result: RouteIntentResult): boolean {
  return Boolean(result.clarificationQuestion && (result.confidence ?? 1) < 0.8);
}
