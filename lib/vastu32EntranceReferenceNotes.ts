/**
 * Optional long-form “reference sheet” copy for main-door segments (32 padas).
 * Distinct from deity lines in vastu32Padas.ts — used for expanded homeowner-oriented notes.
 * Phrasing is generalized; lineages vary.
 */

import { VASTU_32_PADA_IDS } from '@/lib/vastuDirections';

export type PadaId = (typeof VASTU_32_PADA_IDS)[number];

/** Quadrant grouping for accordion UI. */
export type PadaQuadrant = 'north' | 'east' | 'south' | 'west';

export const PADAS_BY_QUADRANT: Record<PadaQuadrant, PadaId[]> = {
  north: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8'],
  east: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'],
  south: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
  west: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
};

/**
 * Reference note per pada: traditional entrance-segment associations (symbolic).
 */
export const VASTU_32_ENTRANCE_REFERENCE_NOTES: Record<PadaId, string> = {
  N1: 'Some traditions associate this segment with sensitivity to others’ intentions or social friction.',
  N2: 'Some traditions associate this segment with feelings of comparison or jealousy in the environment.',
  N3: 'Often highlighted as a strong segment for prosperity themes in North-facing layouts.',
  N4: 'Often associated with stability, lineage, and steady resources in traditional texts.',
  N5: 'Often described as calm, devotional, or non-aggressive household tone.',
  N6: 'Some lineages flag social friction or reputation stress for entrances here.',
  N7: 'Some texts discuss family boundaries or independence themes for this segment.',
  N8: 'Often linked to savings and banking themes in traditional summaries.',

  E1: 'Some traditions caution fire, sudden events, or unexpected loss themes.',
  E2: 'Often linked to spending patterns and household gender balance in traditional summaries.',
  E3: 'Frequently marked auspicious for money and success in East-facing guidance.',
  E4: 'Often associated with networks, authority figures, and structured growth.',
  E5: 'Some texts mention irritability or short temper in household tone.',
  E6: 'Some traditions discuss reliability and follow-through themes.',
  E7: 'Some lineages discuss empathy and social awareness themes.',
  E8: 'Some traditions caution accidents, security, or sudden financial stress themes.',

  S1: 'Some texts discuss children’s independence or boundary-testing themes.',
  S2: 'Often associated with service, employment, or corporate-style work themes.',
  S3: 'Frequently highlighted for prosperity and practical success in traditional summaries.',
  S4: 'Often linked to industry, recognition, and male-line themes in some texts.',
  S5: 'Some traditions discuss debt, pressure, or under-used skills themes.',
  S6: 'Some lineages flag hardship or scarcity themes for entrances here.',
  S7: 'Often linked to wasted effort or disconnection themes in traditional summaries.',
  S8: 'Some texts discuss harsh speech, isolation, or compounded life stress themes.',

  W1: 'Some traditions discuss financial strain or vitality themes for entrances here.',
  W2: 'Often linked to career instability, insecurity, or unclear direction themes.',
  W3: 'Frequently highlighted for growth and prosperity in West-facing guidance.',
  W4: 'Often described as moderate outcomes: neither extreme gain nor extreme loss.',
  W5: 'Some texts discuss perfectionism, ambition, and burnout themes.',
  W6: 'Some lineages flag low mood or depression themes.',
  W7: 'Some traditions discuss dependency, escapism, or happiness themes.',
  W8: 'Some texts caution ethics, shortcuts, or reputational risk themes.',
};
