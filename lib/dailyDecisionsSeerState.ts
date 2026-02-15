/**
 * Daily Decisions Seer State and Slice Selector.
 * Rule-based Panchanga execution; timing suitability only, not outcomes.
 * Rule: Daily Decisions reduces avoidable friction; it does not create success.
 */

import type { DailyDecisionsAnalysis, DailyDecisionRecommendation } from './dailyDecisionsIntelligence';

export interface DailyDecisionState {
  date: string;
  location: string | null;
  panchanga: {
    tithi: string;
    nakshatra: string;
    vara: string;
    vara_english: string;
    yoga: string;
    sunrise?: string;
    sunset?: string;
  };
  inauspicious_times: {
    rahu_kaal: string;
    gulika_kaal: string;
  };
  user_context: {
    janma_nakshatra: string;
    janma_tithi: string;
    current_dasha: string | null;
    current_dasha_progress: number | null;
    ascendant: string;
  };
  recommendations: DailyDecisionsAnalysis['recommendations'];
  property_construction: DailyDecisionsAnalysis['propertyConstruction'];
}

export type DailyDecisionQuestionType =
  | 'lend_money'
  | 'borrow_money'
  | 'pay_debts'
  | 'travel'
  | 'haircut'
  | 'cut_nails'
  | 'hair_oil'
  | 'property_construction'
  | 'when_today'
  | 'today_or_tomorrow'
  | 'general'
  | 'refusal';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getWeekdayEnglishFromDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  const dayIndex = d.getUTCDay();
  return WEEKDAYS[dayIndex] ?? 'Unknown';
}

/**
 * Build DailyDecisionState from DailyDecisionsAnalysis.
 */
export function buildDailyDecisionState(
  analysis: DailyDecisionsAnalysis,
  selectedDate?: string
): DailyDecisionState {
  const date = selectedDate ?? analysis.date;
  const dasha = analysis.userContext.currentDasha;
  return {
    date,
    location: null,
    panchanga: {
      tithi: analysis.panchangaSummary.tithi,
      nakshatra: analysis.panchangaSummary.nakshatra,
      vara: analysis.panchangaSummary.vara,
      vara_english: getWeekdayEnglishFromDate(date),
      yoga: analysis.panchangaSummary.yoga,
      sunrise: analysis.panchangaSummary.sunrise,
      sunset: analysis.panchangaSummary.sunset,
    },
    inauspicious_times: {
      rahu_kaal: analysis.rahuKaal.formatted,
      gulika_kaal: analysis.gulikaKaal.formatted,
    },
    user_context: {
      janma_nakshatra: analysis.userContext.janmaNakshatra,
      janma_tithi: analysis.userContext.janmaTithi,
      current_dasha: dasha ? dasha.planet : null,
      current_dasha_progress: dasha ? dasha.progress : null,
      ascendant: analysis.userContext.ascendant,
    },
    recommendations: analysis.recommendations,
    property_construction: analysis.propertyConstruction,
  };
}

/**
 * Classify Daily Decision question. Returns refusal for outcome/success/karma questions.
 */
export function classifyDailyDecisionQuestion(question: string): DailyDecisionQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal: outcome prediction, success, karma, life questions, emotional counseling
  if (
    /will\s+this\s+bring\s+success|will\s+i\s+succeed|what\s+will\s+happen\s+if\s+i\s+do|is\s+this\s+karmically\s+good|will\s+i\s+get\s+rich|will\s+it\s+work\s+out|guarantee|certain\s+outcome|proof\s+that|predict/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /will\s+i\s+get\s+married|career\s+destiny|life\s+purpose|life\s+path\s+question|should\s+i\s+leave\s+my\s+job|how\s+do\s+i\s+feel|emotional\s+counseling|therapy|relationship\s+destiny/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Choice comparison: today or tomorrow / today or wait
  if (
    /today\s+or\s+tomorrow|should\s+i\s+do\s+this\s+today\s+or\s+wait|better\s+today\s+or\s+tomorrow|start\s+this\s+task\s+today\s+or\s+wait/.test(
      lower
    )
  ) {
    return 'today_or_tomorrow';
  }

  // When today (micro-muhurta)
  if (
    /when\s+(should\s+i\s+)?(do|start)\s+(it\s+)?today|what\s+time\s+today|when\s+today|best\s+time\s+today/.test(
      lower
    )
  ) {
    return 'when_today';
  }

  // Activity-specific
  if (/\blend\s+money|lending\s+money|loan\s+out\b/.test(lower)) return 'lend_money';
  if (/\bborrow\s+money|borrowing|take\s+(a\s+)?loan/.test(lower)) return 'borrow_money';
  if (/\bpay\s+(back\s+)?(debt|debts)|repay|paying\s+debts/.test(lower)) return 'pay_debts';
  if (/\btravel|journey|trip|start\s+(a\s+)?journey|leave\s+for\b/.test(lower)) return 'travel';
  if (/\bhaircut|cut\s+(my\s+)?hair|get\s+a\s+haircut/.test(lower)) return 'haircut';
  if (/\bcut\s+nails|nail\s+cutting|cutting\s+nails|nails\s+today/.test(lower)) return 'cut_nails';
  if (/\bhair\s+oil|apply\s+hair\s+oil|oil\s+my\s+hair/.test(lower)) return 'hair_oil';
  if (
    /\bproperty|construction|moving|vastu|renovation|foundation|house\s+warming|griha\s+pravesh|bhoomi\s+pujan/.test(
      lower
    )
  ) {
    return 'property_construction';
  }

  // Valid timing-suitability phrasing
  if (
    /is\s+today\s+good\s+for|should\s+i\s+avoid\s+.*\s+today|when\s+should\s+i\s+do\s+.*\s+today|good\s+(day|time)\s+for/.test(
      lower
    )
  ) {
    // Try to infer activity from context
    if (/\blend|loan\s+out/.test(lower)) return 'lend_money';
    if (/\bborrow|loan\b/.test(lower)) return 'borrow_money';
    if (/\bdebt|repay/.test(lower)) return 'pay_debts';
    if (/\btravel|trip|journey/.test(lower)) return 'travel';
    if (/\bhaircut|hair\s+cut/.test(lower)) return 'haircut';
    if (/\bnail/.test(lower)) return 'cut_nails';
    if (/\bhair\s+oil|oil/.test(lower)) return 'hair_oil';
    if (/\bproperty|construction|vastu|moving/.test(lower)) return 'property_construction';
  }

  return 'general';
}

function formatRecommendationForSlice(rec: DailyDecisionRecommendation): string {
  const parts: string[] = [
    `score: ${rec.score}`,
    `bestDays: ${rec.bestDays.join(', ')}`,
    `avoidDays: ${rec.avoidDays.join(', ')}`,
    `avoidTimes: ${rec.avoidTimes.join(', ')}`,
    `personalizedNote: ${rec.personalizedNote}`,
  ];
  if (rec.avoidAfterSunset) parts.push('avoidAfterSunset: true');
  return parts.join('\n');
}

const ACTIVITY_LABELS: Record<string, string> = {
  lendMoney: 'lending money',
  borrowMoney: 'borrowing',
  payBackDebts: 'paying debts',
  travel: 'travel',
  haircut: 'grooming',
  cutNails: 'cut nails',
  hairOil: 'hair oil',
};

function buildSummaryBlock(state: DailyDecisionState): string {
  const recs = state.recommendations;
  const entries = [
    { key: 'lendMoney', score: recs.lendMoney.score },
    { key: 'borrowMoney', score: recs.borrowMoney.score },
    { key: 'payBackDebts', score: recs.payBackDebts.score },
    { key: 'travel', score: recs.travel.score },
    { key: 'haircut', score: recs.haircut.score },
    { key: 'cutNails', score: recs.cutNails.score },
    { key: 'hairOil', score: recs.hairOil.score },
  ];
  const favorable: string[] = [];
  const neutral: string[] = [];
  const avoid: string[] = [];
  for (const { key, score } of entries) {
    const label = ACTIVITY_LABELS[key] ?? key;
    if (score >= 70) favorable.push(label);
    else if (score >= 40) neutral.push(label);
    else avoid.push(label);
  }
  const avg =
    entries.reduce((s, e) => s + e.score, 0) / entries.length;
  let day_quality: string;
  if (avg >= 70) day_quality = 'favorable';
  else if (avg >= 40) day_quality = 'neutral';
  else day_quality = 'avoid';

  const lines: string[] = [
    `day_quality: ${day_quality}`,
    `favorable_activities: ${favorable.length ? favorable.join(', ') : 'none'}`,
    `neutral_activities: ${neutral.length ? neutral.join(', ') : 'none'}`,
    `avoid_activities: ${avoid.length ? avoid.join(', ') : 'none'}`,
  ];
  const recMap = state.recommendations as Record<string, DailyDecisionRecommendation>;
  const notes = entries
    .map(e => recMap[e.key]?.personalizedNote)
    .filter((n): n is string => Boolean(n));
  if (notes.length > 0) {
    lines.push(`overall_guidance: ${notes.slice(0, 2).join(' ')}`);
  }
  lines.push(`time_windows: avoid Rahu Kaal and Gulika Kaal (see inauspicious_times below).`);
  return lines.join('\n');
}

/**
 * Build slice for system prompt. Activity-specific; never reuse rules across activities.
 */
export function getDailyDecisionSliceForQuestionType(
  questionType: DailyDecisionQuestionType,
  state: DailyDecisionState
): string {
  if (questionType === 'refusal') {
    return 'Daily Decisions addresses timing suitability, not outcomes. Refuse with: "Daily Decisions does not assess outcomes, only timing suitability."';
  }

  const panchangaBlock = `
date: ${state.date}
panchanga:
  tithi: ${state.panchanga.tithi}
  nakshatra: ${state.panchanga.nakshatra}
  vara: ${state.panchanga.vara}
  weekday_english: ${state.panchanga.vara_english}
  yoga: ${state.panchanga.yoga}
  sunrise: ${state.panchanga.sunrise ?? '—'}
  sunset: ${state.panchanga.sunset ?? '—'}
inauspicious_times:
  rahu_kaal: ${state.inauspicious_times.rahu_kaal}
  gulika_kaal: ${state.inauspicious_times.gulika_kaal}
user_context:
  janma_nakshatra: ${state.user_context.janma_nakshatra}
  janma_tithi: ${state.user_context.janma_tithi}
  current_dasha: ${state.user_context.current_dasha ?? '—'}${state.user_context.current_dasha_progress != null ? ` (${state.user_context.current_dasha_progress}%)` : ''}
  ascendant: ${state.user_context.ascendant}
`.trim();

  const absoluteProhibitionsNote =
    'If any absolute prohibition is triggered (Janma Nakshatra day, Janma Tithi for grooming, Rahu Kaal, Gulika Kaal, after sunset for grooming), score cannot exceed 65 and you must say avoid.';

  switch (questionType) {
    case 'lend_money': {
      const rec = state.recommendations.lendMoney;
      return `${panchangaBlock}

ACTIVITY: Lend Money (guidance for this activity only)
${formatRecommendationForSlice(rec)}

Absolute prohibitions for lending: avoid on Janma Nakshatra day; avoid during Rahu Kaal and Gulika Kaal for starting the transaction.
${absoluteProhibitionsNote}`;
    }
    case 'borrow_money': {
      const rec = state.recommendations.borrowMoney;
      return `${panchangaBlock}

ACTIVITY: Borrow Money (guidance for this activity only)
${formatRecommendationForSlice(rec)}

Absolute prohibitions: avoid on Janma Nakshatra day; avoid starting during Rahu Kaal and Gulika Kaal.
${absoluteProhibitionsNote}`;
    }
    case 'pay_debts': {
      const rec = state.recommendations.payBackDebts;
      return `${panchangaBlock}

ACTIVITY: Pay Back Debts (guidance for this activity only)
${formatRecommendationForSlice(rec)}

Absolute prohibitions: avoid starting during Rahu Kaal and Gulika Kaal. Tuesday is often recommended for paying debts (Gulika time on Tuesday).
${absoluteProhibitionsNote}`;
    }
    case 'travel': {
      const rec = state.recommendations.travel;
      return `${panchangaBlock}

ACTIVITY: Travel / Start Journey (guidance for this activity only)
${formatRecommendationForSlice(rec)}

Absolute prohibitions: do not start journey during Rahu Kaal or Gulika Kaal.
${absoluteProhibitionsNote}`;
    }
    case 'haircut': {
      const rec = state.recommendations.haircut;
      return `${panchangaBlock}

ACTIVITY: Haircut (guidance for this activity only)
${formatRecommendationForSlice(rec)}

Absolute prohibitions: avoid on Janma Nakshatra day; avoid on Janma Tithi; avoid Saturday and Tuesday; avoid during Rahu Kaal and Gulika Kaal.
${absoluteProhibitionsNote}`;
    }
    case 'cut_nails': {
      const rec = state.recommendations.cutNails;
      return `${panchangaBlock}

ACTIVITY: Cut Nails (guidance for this activity only)
${formatRecommendationForSlice(rec)}

Absolute prohibitions: avoid on Janma Nakshatra day; avoid on Janma Tithi; avoid after sunset until sunrise; avoid during Rahu Kaal and Gulika Kaal.
${absoluteProhibitionsNote}`;
    }
    case 'hair_oil': {
      const rec = state.recommendations.hairOil;
      return `${panchangaBlock}

ACTIVITY: Apply Hair Oil (guidance for this activity only)
${formatRecommendationForSlice(rec)}

Absolute prohibitions: avoid Thursday and Saturday; avoid during Rahu Kaal and Gulika Kaal if starting.
${absoluteProhibitionsNote}`;
    }
    case 'property_construction': {
      if (!state.property_construction) {
        return `${panchangaBlock}

No property/construction data for this date. Use panchanga and inauspicious times only.`;
      }
      const pc = state.property_construction;
      return `${panchangaBlock}

ACTIVITY: Property / Construction / Moving / Vastu (guidance for this activity only)
auspiciousScore: ${pc.auspiciousScore}
isAuspicious: ${pc.isAuspicious}
bestActivities: ${pc.bestActivities.join(', ')}
avoidActivities: ${pc.avoidActivities.join(', ')}
recommendations: ${pc.recommendations.slice(0, 3).join('; ')}

Absolute prohibitions: do not start during Rahu Kaal or Gulika Kaal.
${absoluteProhibitionsNote}`;
    }
    case 'when_today': {
      return `${panchangaBlock}

TIME WINDOW RESOLVER: Remove Rahu Kaal and Gulika Kaal from the day; for grooming (haircut, nails, hair oil), also remove time after sunset until sunrise. Return only the remaining safe windows. No astrology narration.`;
    }
    case 'today_or_tomorrow': {
      const summary = buildSummaryBlock(state);
      const activityScores = [
        `lend_money: ${state.recommendations.lendMoney.score}`,
        `borrow_money: ${state.recommendations.borrowMoney.score}`,
        `pay_debts: ${state.recommendations.payBackDebts.score}`,
        `travel: ${state.recommendations.travel.score}`,
        `haircut: ${state.recommendations.haircut.score}`,
        `cut_nails: ${state.recommendations.cutNails.score}`,
        `hair_oil: ${state.recommendations.hairOil.score}`,
      ];
      if (state.property_construction) {
        activityScores.push(`property_construction: ${state.property_construction.auspiciousScore}`);
      }
      return `${panchangaBlock}

${summary}

Activities (scores 0–100): ${activityScores.join('; ')}

User is asking to compare today vs another day. Use Tier 2: compare day quality for this date; recommend the stronger day for the activity or suggest preparation today and execution on a better day.`;
    }
    case 'general':
    default: {
      const summary = buildSummaryBlock(state);
      const activityScores = [
        `lend_money: ${state.recommendations.lendMoney.score}`,
        `borrow_money: ${state.recommendations.borrowMoney.score}`,
        `pay_debts: ${state.recommendations.payBackDebts.score}`,
        `travel: ${state.recommendations.travel.score}`,
        `haircut: ${state.recommendations.haircut.score}`,
        `cut_nails: ${state.recommendations.cutNails.score}`,
        `hair_oil: ${state.recommendations.hairOil.score}`,
      ];
      if (state.property_construction) {
        activityScores.push(`property_construction: ${state.property_construction.auspiciousScore}`);
      }
      return `${panchangaBlock}

${summary}

Activities (scores 0–100): ${activityScores.join('; ')}

If the user did not specify an activity, ask one question only: "Which activity are you asking about?" (e.g. lending money, haircut, travel, etc.)`;
    }
  }
}
