/**
 * Dry run: timing engine only (no API). Shows deterministic output for Q1–Q4; Q5 not timing.
 */
import {
  detectTimingType,
  detectTimingDomain,
  scoreTimingWindow,
  compareYears,
  findNextFavorableWindow,
  formatTimingAnswer,
} from '../lib/timingEngine';

const mockUniversalData = {
  vedicAstrology: {
    dashas: { currentDasha: { mahadasha: 'Jupiter' } },
    transits: { favorable: [{}], challenging: [] },
  },
};

const q1 = 'When will I get a promotion?';
const q2 = 'Is 2026 better than 2025 for marriage?';
const q3 = 'When will my financial situation stabilize?';
const q4 = 'What is the best month to launch my app?';
const q5 = 'Why do I always miss good opportunities?';

console.log('--- Timing validation (dry run: engine only) ---\n');

// 1 Event window (promotion)
const t1 = detectTimingType(q1);
const d1 = detectTimingDomain(q1);
const r1 = scoreTimingWindow(mockUniversalData, d1, undefined, q1);
console.log('### 1: When will I get a promotion?');
console.log('Type:', t1, '| Domain:', d1);
console.log(formatTimingAnswer(r1, t1, d1));
console.log('Confidence:', r1.confidence + '%');
console.log('');

// 2 Comparison
const t2 = detectTimingType(q2);
const d2 = detectTimingDomain(q2);
const r2 = compareYears(2025, 2026, d2, mockUniversalData, q2);
console.log('### 2: Is 2026 better than 2025 for marriage?');
console.log('Type:', t2, '| Domain:', d2);
console.log(formatTimingAnswer(r2 as any, t2, d2));
console.log('Confidence:', (r2 as any).confidence != null ? (r2 as any).confidence + '%' : 'N/A');
console.log('');

// 3 Period stability
const t3 = detectTimingType(q3);
const d3 = detectTimingDomain(q3);
const r3 = scoreTimingWindow(mockUniversalData, d3, undefined, q3);
console.log('### 3: When will my financial situation stabilize?');
console.log('Type:', t3, '| Domain:', d3);
console.log(formatTimingAnswer(r3, t3, d3));
console.log('Confidence:', r3.confidence + '%');
console.log('');

// 4 Micro
const t4 = detectTimingType(q4);
const d4 = detectTimingDomain(q4);
const r4 = findNextFavorableWindow(d4, mockUniversalData, 3, q4);
console.log('### 4: What is the best month to launch my app?');
console.log('Type:', t4, '| Domain:', d4);
console.log(formatTimingAnswer(r4 as any, t4, d4));
console.log('Confidence:', r4.confidence != null ? r4.confidence + '%' : 'N/A');
console.log('');

// 5 Negative: should NOT be timing (reason question → purpose path)
const t5 = detectTimingType(q5);
const d5 = detectTimingDomain(q5);
console.log('### 5: Why do I always miss good opportunities?');
console.log('Type:', t5, '| Domain:', d5);
console.log(t5 === null ? '✓ Not timing — handled by purpose/psychology path (no windows, no scoring).' : '(Expected: null; this question should NOT use timing engine.)');
console.log('');

// 6 Vague (lower intent clarity → lower confidence)
const q6 = 'When will it happen?';
const t6 = detectTimingType(q6);
const d6 = detectTimingDomain(q6);
const r6 = scoreTimingWindow(mockUniversalData, d6, undefined, q6);
console.log('### 6: When will it happen? (vague)');
console.log('Type:', t6, '| Domain:', d6);
console.log(formatTimingAnswer(r6, t6, d6));
console.log('Confidence:', r6.confidence + '% (expect lower: vague intent)');
console.log('');
console.log('--- End dry run ---');
