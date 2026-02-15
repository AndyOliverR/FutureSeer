/**
 * Seer Response Scope — Question-to-domain mapping and expert snippet extraction.
 * Ensures each tool speaks in its own lane; excludes domain-irrelevant content per question type.
 */

/** Domains to exclude from responses per question type. */
export const QUESTION_EXCLUDED_DOMAINS: Record<string, string[]> = {
  purpose: ['Health', 'Relationships', 'Marriage', 'Remedies', 'Panchanga', 'Career & Wealth', 'Current Period', 'Personality', 'Planetary Positions'],
  identity: ['Health', 'Relationships', 'Marriage', 'Remedies', 'Panchanga'],
  decision: ['Health', 'Relationships', 'Marriage', 'Remedies', 'Panchanga', 'Career & Wealth'],
  career: ['Relationships', 'Marriage', 'Remedies', 'Panchanga', 'Health'],
  marriage: ['Health', 'Remedies', 'Panchanga', 'Career & Wealth'],
  remedy: [],
  health: ['Relationships', 'Marriage', 'Career & Wealth', 'Panchanga'],
  wealth: ['Relationships', 'Marriage', 'Health', 'Remedies', 'Panchanga'],
  spiritual: ['Relationships', 'Marriage', 'Career & Wealth', 'Health', 'Remedies'],
  family: ['Career & Wealth', 'Remedies', 'Panchanga'],
  relocation: [
    'Health', 'Relationships', 'Marriage', 'Remedies', 'Personality', 'Planetary Positions',
    'Career & Wealth', 'Life Purpose & Karma', 'Spirituality', 'Current Period (Dasha)',
    'Current Period (planetary period)', 'Panchanga',
  ],
  'past-life': ['Health', 'Relationships', 'Marriage', 'Career & Wealth', 'Remedies', 'Panchanga'],
  protection: [],
  'truth-seeking': [],
  general: [],
};

/** Section headers used in expert responses (for stripping). */
const DOMAIN_SECTION_PATTERNS = [
  /\*\*Personality:\*\*[^*]*/gi,
  /\*\*Career & Wealth:\*\*[^*]*/gi,
  /\*\*Life Purpose & Karma:\*\*[^*]*/gi,
  /\*\*Relationships:\*\*[^*]*/gi,
  /\*\*Health:\*\*[^*]*/gi,
  /\*\*Spirituality:\*\*[^*]*/gi,
  /\*\*Current Period[^*]*:\*\*[^*]*/gi,
  /\*\*Remedies:\*\*[^*]*/gi,
  /\*\*Planetary Positions:\*\*[^*]*/gi,
  /\*\*Marriage[^*]*:\*\*[^*]*/gi,
  /\*\*Panchanga[^*]*\*\*[^*]*/gi,
  /\bMystical insight:\s*[^\n]+/gi,
  /\bAuspicious timing:\s*[^\n]+/gi,
  /\bRecommendations:\s*[\s\S]*?(?=\n\n|$)/gi,
];

/**
 * Returns domains allowed for a question type (inverse of excluded).
 * Used when we need to know what to include rather than exclude.
 */
export function getRelevantDomainsForQuestion(questionType: string): string[] {
  const excluded = QUESTION_EXCLUDED_DOMAINS[questionType] ?? [];
  const allDomains = [
    'Personality', 'Career & Wealth', 'Life Purpose & Karma', 'Relationships',
    'Health', 'Spirituality', 'Current Period', 'Remedies', 'Planetary Positions',
    'Marriage', 'Panchanga',
  ];
  return allDomains.filter(d => !excluded.includes(d));
}

/**
 * Extracts purpose-relevant content from an expert's full answer.
 * Looks for: life purpose, dharma, soul, mission, karmic, fulfillment.
 */
export function extractPurposeRelevantSnippet(answer: string): string {
  if (!answer || typeof answer !== 'string') return '';

  let text = answer.trim();

  // Extract **Life Purpose & Karma:** or **Life Purpose** section
  const lifePurposeMatch = text.match(/\*\*Life Purpose[^*]*:\*\*([^*]+?)(?=\*\*|$)/i);
  if (lifePurposeMatch) {
    const extracted = lifePurposeMatch[1].trim();
    if (extracted.length > 50) return extracted.slice(0, 400).trim() + (extracted.length > 400 ? '…' : '');
  }

  // Extract paragraphs containing purpose keywords
  const purposeKeywords = /\b(life purpose|dharma|soul (level|purpose|mission)|karmic|mission|fulfillment|why you are here|meant to|destiny)\b/i;
  const paragraphs = text.split(/\n\n+/);
  const relevant: string[] = [];
  for (const p of paragraphs) {
    if (purposeKeywords.test(p) && p.length > 30) {
      relevant.push(p.trim());
    }
  }
  if (relevant.length > 0) {
    const combined = relevant.join(' ').slice(0, 400).trim();
    return combined + (combined.length >= 400 ? '…' : '');
  }

  // Fallback: first 200 chars if answer is short and contains purpose-like content
  if (text.length < 500 && /\b(purpose|dharma|teach|guide|service|wisdom)\b/i.test(text)) {
    return text.slice(0, 200).trim() + (text.length > 200 ? '…' : '');
  }

  return '';
}

/**
 * Strips excluded domain sections from text for a given question type.
 */
export function stripExcludedDomains(text: string, questionType: string): string {
  if (!text || typeof text !== 'string') return '';

  const excluded = QUESTION_EXCLUDED_DOMAINS[questionType];
  if (!excluded || excluded.length === 0) return text;

  let result = text;

  for (const domain of excluded) {
    const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\*\\*${escaped}[^*]*:\\*\\*[\\s\\S]*?(?=\\*\\*[A-Za-z]|$)`, 'gi');
    result = result.replace(pattern, '');
  }

  return result.replace(/\n{3,}/g, '\n\n').trim();
}
