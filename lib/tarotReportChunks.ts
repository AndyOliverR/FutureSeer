/**
 * Tarot report: 4 fixed blocks for queryability (same pattern as Western report chunks).
 * Every Tarot report resolves to this shape so the Seer can consume it consistently.
 */

import type { TarotReading } from './tarotIntelligence';

export interface TarotReportCard {
  card: string;
  position: string;
  meaning: string;
}

export interface TarotReport {
  question_context: string;
  cards_drawn: TarotReportCard[];
  overall_theme: string;
  guidance: string;
  warnings: string;
}

/**
 * Maps a TarotReading (from drawCards / saved reading) into the 4-block TarotReport shape.
 * No change to how cards are drawn or stored; only a normalizer for Seer consumption.
 */
export function readingToTarotReport(reading: TarotReading): TarotReport {
  const question_context =
    reading.spreadName && reading.question
      ? `${reading.question} (Spread: ${reading.spreadName})`
      : reading.question || '';

  const cards_drawn = (reading.individualCardReadings || []).map((r) => ({
    card: r.cardName || 'Unknown',
    position: r.position || 'Unknown',
    meaning: r.meaning || ''
  }));

  const overall_theme = reading.overallReading || '';

  const guidanceParts: string[] = [];
  if (Array.isArray(reading.recommendations) && reading.recommendations.length > 0) {
    guidanceParts.push(reading.recommendations.join('. '));
  }
  if (reading.detailedInterpretation) {
    guidanceParts.push(reading.detailedInterpretation);
  }
  if (reading.coaching?.strengths?.length) {
    guidanceParts.push(`Strengths: ${reading.coaching.strengths.join('; ')}`);
  }
  if (reading.coaching?.growthAreas?.length) {
    guidanceParts.push(`Growth: ${reading.coaching.growthAreas.join('; ')}`);
  }
  const guidance = guidanceParts.join('\n\n').trim() || '';

  const warningParts: string[] = [];
  if (reading.timing?.challenges?.length) {
    warningParts.push(...reading.timing.challenges);
  }
  if (reading.coaching?.challenges?.length) {
    warningParts.push(...reading.coaching.challenges);
  }
  const warnings = [...new Set(warningParts)].join('. ').trim() || '';

  return {
    question_context,
    cards_drawn,
    overall_theme,
    guidance,
    warnings
  };
}
