/**
 * Bibliomancy Report Generator
 * Builds a comprehensive report from local sacred texts with seeded selection,
 * thematic tagging, and domain mapping. No runtime scraping.
 */

import type { SacredTextId } from './textReader';
import { pickPassage, seededRandom } from './textReader';
import {
  THEMES,
  ARCHETYPES,
  TONES,
  POLARITY,
  DIRECTIVES,
  type LifeDomain,
  type Polarity,
  type Directive,
  getDomainInterpretation,
} from './themes';

export const SACRED_TEXT_IDS: SacredTextId[] = ['bible', 'quran', 'gita', 'torah', 'hafez'];

export interface BibliomancyPassageReport {
  textId: SacredTextId;
  citation: string;
  passage: string;
  version: string;
  literalMeaningSummary: string;
  primaryTheme: string;
  secondaryTheme?: string;
  archetype: string;
  tone: string;
  lifeDomainInterpretation: string;
  directive: Directive;
  polarity: Polarity;
  sanskrit?: string;
  themeHint?: string;
}

export interface BibliomancyReport {
  generatedAt: string;
  seed: number;
  definitions: {
    bibliomancyVsSortilege: string;
    agentByTradition: Record<string, string>;
  };
  rituals: {
    quran: string;
    hafez: string;
    bibleTorah: string;
  };
  interpretations: {
    ambiguity: string;
    directVsMetaphor: string;
  };
  texts: Record<SacredTextId, BibliomancyPassageReport>;
  crossTraditionSummary?: string;
}

export interface UserProfileForBibliomancy {
  fullName?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  userId?: string;
}

function hashSeed(userId: string, timestamp: string): number {
  let h = 0;
  const s = `${userId}|${timestamp}`;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h = h & 0x7fffffff;
  }
  return h || 1;
}

function pickFrom<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function buildLiteralSummary(textId: SacredTextId, passage: string): string {
  const hints: Record<SacredTextId, string> = {
    bible: 'This verse from the Bible speaks to divine care, guidance, or moral instruction.',
    quran: 'This verse from the Quran reflects divine mercy, guidance, or the relationship between the believer and Allah.',
    gita: 'This verse from the Bhagavad Gita addresses duty, devotion, or the path of right action.',
    torah: 'This passage from the Torah conveys covenant, guidance, or the relationship between the divine and the community.',
    hafez: 'This line from Hafez carries the poet’s characteristic blend of mystical and worldly love, open to personal interpretation.',
  };
  return hints[textId] + ' Consider its resonance with your current question or situation.';
}

function selectThemeForPassage(
  textId: SacredTextId,
  themeHint?: string,
  rand: () => number
): { primary: string; secondary?: string } {
  const themeList = THEMES as unknown as string[];
  if (themeHint && themeList.includes(themeHint))
    return { primary: themeHint, secondary: pickFrom(THEMES, rand) };
  return {
    primary: pickFrom(THEMES, rand),
    secondary: pickFrom(THEMES, rand),
  };
}

function selectLifeDomain(rand: () => number): LifeDomain {
  const domains: LifeDomain[] = ['finance', 'relationship', 'career', 'spiritual', 'health', 'general'];
  return domains[Math.floor(rand() * domains.length)];
}

/**
 * Generate one passage report for a single sacred text.
 */
function generatePassageReport(
  textId: SacredTextId,
  rand: () => number
): BibliomancyPassageReport {
  const result = pickPassage(textId, rand);
  const { primary: primaryTheme, secondary: secondaryTheme } = selectThemeForPassage(
    textId,
    result.themeHint,
    rand
  );
  const domain = selectLifeDomain(rand);
  const directive = pickFrom(DIRECTIVES, rand);
  const polarity = pickFrom(POLARITY, rand);
  const archetype = pickFrom(ARCHETYPES, rand);
  const tone = pickFrom(TONES, rand);

  const lifeDomainInterpretation = getDomainInterpretation(primaryTheme, domain);

  return {
    textId,
    citation: result.citation,
    passage: result.text,
    version: result.version,
    literalMeaningSummary: buildLiteralSummary(textId, result.text),
    primaryTheme,
    secondaryTheme,
    archetype,
    tone,
    lifeDomainInterpretation,
    directive,
    polarity,
    sanskrit: result.sanskrit,
    themeHint: result.themeHint,
  };
}

/**
 * Generate the full bibliomancy report for a user.
 * Deterministic for same userId + generatedAt.
 */
export function generateBibliomancyReport(
  userProfile: UserProfileForBibliomancy,
  generatedAt: Date = new Date()
): BibliomancyReport {
  const timestamp = generatedAt.toISOString();
  const userId = userProfile.userId ?? 'anonymous';
  const seed = hashSeed(userId, timestamp);
  const rand = seededRandom(seed);

  const texts = SACRED_TEXT_IDS.reduce(
    (acc, id) => {
      acc[id] = generatePassageReport(id, rand);
      return acc;
    },
    {} as Record<SacredTextId, BibliomancyPassageReport>
  );

  const themes = Object.values(texts).map((t) => t.primaryTheme);
  const count: Record<string, number> = {};
  themes.forEach((t) => {
    count[t] = (count[t] ?? 0) + 1;
  });
  const dominant =
    Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? themes[0] ?? 'Guidance';
  const crossTraditionSummary =
    themes.length > 0
      ? `Across the selected passages, the dominant motif is ${dominant.toLowerCase()}. Consider how this theme appears in your current life phase.`
      : undefined;

  return {
    generatedAt: timestamp,
    seed,
    definitions: {
      bibliomancyVsSortilege:
        'Bibliomancy is divination by book—a specific form of sortilege (casting lots). A passage is selected by chance and interpreted for symbolic guidance.',
      agentByTradition: {
        bible: 'In Christian tradition, the answer is often attributed to Divine Providence—God directing the hand or the moment.',
        torah: 'In Jewish tradition, the same idea of divine guidance (Goral) applies to the selection of a verse.',
        quran: 'In Islamic practice, Istikhara is a prayer for guidance (fully sanctioned); Fal (fortune-telling by random opening) is treated with caution in strict theology.',
        gita: 'The Gita is used for reflection on duty (dharma) and the fruit of action; the “agent” is the teaching itself.',
        hafez: 'Hafez is called Lesan-ol-Ghaib (the Tongue of the Unseen)—the poet is the spiritual medium through whom meaning is sought.',
      },
    },
    rituals: {
      quran:
        'Traditional Fal: open the Quran, count seven pages back or forward, and read the first line of the seventh page. Istikhara is a separate prayer for guidance.',
      hafez:
        'Fal-e Hafez: focus on a question (Niyyat), ask Hafez by the soul of his beloved (Shakh-e Nabat) to reveal the truth, open at random; the first ghazal on the right-hand page is the answer; the next couplet is the Shahed (witness) that clarifies it.',
      bibleTorah:
        'Sortes Sanctorum: open the Bible or Torah to a random page and place the finger on a verse. The selection is attributed to divine guidance (Goral).',
    },
    interpretations: {
      ambiguity:
        'Hafez’s poetry is intentionally ambiguous (mystical vs. secular love), allowing the reader to project their own context onto the verse.',
      directVsMetaphor:
        'The Bible and Quran often yield direct commands or imperatives; the Gita and Hafez tend to offer philosophical states, duty, or metaphor. Adapt the reading to your tradition and intention.',
    },
    texts,
    crossTraditionSummary,
  };
}
