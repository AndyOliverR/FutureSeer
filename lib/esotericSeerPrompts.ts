/**
 * Esoteric Astrology: report-generation and Ask-the-Seer system prompts.
 * Soul evolution only; no prediction of events, timing, or remedies.
 */

/** Precomputed chart-derived context (injected by API from static data + chart). */
export interface EsotericPrecomputedContext {
  ascendant_sign?: string;
  esoteric_ruler?: string;
  key_mantra?: string;
  life_direction_cross?: string;
  life_direction_focus?: string;
  life_direction_tests?: string;
  sun_sign?: string;
  sun_house?: number;
  moon_sign?: string;
  moon_house?: number;
  north_node_sign?: string;
  south_node_sign?: string;
  /** Orthodox (exoteric) ruler of Ascendant */
  ascendant_orthodox_ruler?: string;
  /** Esoteric ruler of Sun sign */
  sun_esoteric_ruler?: string;
  /** Orthodox ruler of Sun sign */
  sun_orthodox_ruler?: string;
  /** Esoteric ruler of Ascendant: its sign and house in chart (path to the soul) */
  esoteric_ruler_sign?: string;
  esoteric_ruler_house?: number;
  /** Seven Rays (computed) */
  ray_soul?: string;
  ray_personality?: string;
  ray_dominant?: string;
  /** Three Crosses: dominant cross from planetary count */
  cross_dominant?: string;
  cross_planet_counts?: { Cardinal: number; Fixed: number; Mutable: number };
  evolutionary_stage?: string;
  /** Veiled planets */
  veiled_by_sun?: string[];
  veiled_by_moon?: string[];
  /** Triangle emphasis (e.g. "Aries–Leo–Capricorn: 3 planets") */
  triangle_emphasis?: string[];
}

/** Schema for comprehensive esoteric analysis (mandatory + extended output shape). */
export interface EsotericAnalysisSchema {
  soul_ruler: string;
  personality_ruler: string;
  dominant_ray: string;
  evolutionary_theme: string;
  spiritual_challenges: string[];
  soul_growth_focus: string;
  integration_guidance: string;
  soul_purpose_interpretation?: string;
  instrument_paragraph?: string;
  moon_warning?: string;
  moon_esoteric_task?: string;
  life_direction_sentence?: string;
  south_node_theme?: string;
  north_node_theme?: string;
  karmic_axis_actions?: string[];
  major_energy_circuit?: string;
  growth_strengths?: string[];
  growth_patterns_to_transcend?: string[];
  growth_habits?: string[];
  growth_mindset_shifts?: string[];
  core_soul_theme?: string;
  primary_karmic_lesson?: string;
  key_life_arena?: string;
  growth_strategy?: string;
  /** New sections (Alice Bailey comprehensive report) */
  executive_soul_profile?: string;
  cross_of_evolution_assessment?: string;
  ray_dominance_matrix?: string;
  esoteric_rulership_analysis?: string;
  personality_vs_soul_conflict_zones?: string;
  spiritual_service_orientation?: string;
  group_karma_indicators?: string;
  current_evolutionary_phase?: string;
}

/** Build system prompt for generating the structured esoteric report (comprehensive API). */
export function buildEsotericReportSystemPrompt(
  chartContext: string,
  precomputed?: EsotericPrecomputedContext
): string {
  const preblock = precomputed
    ? `
## Precomputed (use these; do not contradict)
- Ascendant: ${precomputed.ascendant_sign ?? 'Unknown'} | Orthodox ruler: ${precomputed.ascendant_orthodox_ruler ?? '—'} | Esoteric ruler: ${precomputed.esoteric_ruler ?? 'Unknown'} (path to soul: sign ${precomputed.esoteric_ruler_sign ?? '—'}, house ${precomputed.esoteric_ruler_house ?? '?'})
- Sun: ${precomputed.sun_sign ?? 'Unknown'} (House ${precomputed.sun_house ?? '?'}) | Orthodox ruler: ${precomputed.sun_orthodox_ruler ?? '—'} | Esoteric ruler: ${precomputed.sun_esoteric_ruler ?? '—'}
- Soul Keynote / Key Mantra: ${precomputed.key_mantra ?? '—'}
- Life Direction Cross: ${precomputed.life_direction_cross ?? 'Unknown'} (focus: ${precomputed.life_direction_focus ?? '—'}, tests: ${precomputed.life_direction_tests ?? '—'})
- Cross of Evolution: dominant cross ${precomputed.cross_dominant ?? '—'} (planets: Cardinal ${precomputed.cross_planet_counts?.Cardinal ?? 0}, Fixed ${precomputed.cross_planet_counts?.Fixed ?? 0}, Mutable ${precomputed.cross_planet_counts?.Mutable ?? 0}); evolutionary stage: ${precomputed.evolutionary_stage ?? '—'}
- Seven Rays: Soul Ray ${precomputed.ray_soul ?? '—'}, Personality Ray ${precomputed.ray_personality ?? '—'}, Dominant Ray ${precomputed.ray_dominant ?? '—'}
- Veiled planets: by Sun ${(precomputed.veiled_by_sun?.length ? precomputed.veiled_by_sun.join(', ') : 'none')}; by Moon ${(precomputed.veiled_by_moon?.length ? precomputed.veiled_by_moon.join(', ') : 'none')}
- Triangle emphasis: ${(precomputed.triangle_emphasis?.length ? precomputed.triangle_emphasis.join('; ') : '—')}
- Moon: ${precomputed.moon_sign ?? 'Unknown'} (House ${precomputed.moon_house ?? '?'})
- North Node: ${precomputed.north_node_sign ?? 'Unknown'}, South Node: ${precomputed.south_node_sign ?? 'Unknown'}
`
    : '';

  return `You are an expert in Esoteric Astrology (Alice A. Bailey / Tibetan tradition). Your task is to produce a soul-evolution analysis only. You do NOT predict events, timing, or outcomes.

## What Esoteric Astrology IS
- Soul ruler vs personality ruler (different from exoteric rulers).
- Seven Rays and spiritual qualities.
- Evolutionary purpose of signs and houses.
- Inner alignment and service/contribution focus.
- Answers: why the person is here, what the soul seeks to develop, what higher lesson is unfolding.

## What you must NOT do
- Do not predict material events, career success, marriage timing, or remedies.
- Do not give calendar dates or timing.
- If ray or soul ruler cannot be derived from the chart, use "Unknown" or a short cautious phrase and still output valid JSON.
- Keep paragraphs short (1-3 sentences). Use bullets for lists. Non-mystical, clear language.
${preblock}

## Chart context (Western natal)
${chartContext || 'No chart data provided.'}

Respond with a single JSON object only, no markdown or extra text. Use this exact structure (include all keys; use empty string or empty array if uncertain):
{
  "soul_ruler": "planet name e.g. Neptune",
  "personality_ruler": "planet name e.g. Mars",
  "dominant_ray": "e.g. Second Ray – Love-Wisdom",
  "evolutionary_theme": "short phrase e.g. compassion through strength",
  "spiritual_challenges": ["challenge1", "challenge2"],
  "soul_growth_focus": "one sentence",
  "integration_guidance": "one sentence",
  "soul_purpose_interpretation": "1-2 sentences: how the esoteric ruler guides the soul toward higher calling",
  "instrument_paragraph": "2-3 sentences: how the personality (Sun) aligns with soul (Ascendant); vehicle for soul work",
  "moon_warning": "one sentence: tendency to retreat into Moon-sign traits when stressed; this is the past not the future",
  "moon_esoteric_task": "one sentence: how to use Moon stability without stagnation",
  "life_direction_sentence": "one sentence: life focused on Initiation/Stability/Change; challenges test Will/Loyalty/Adaptability",
  "south_node_theme": "short phrase: comfort zone, past mastery, overuse risks",
  "north_node_theme": "short phrase: required development, growth tension",
  "karmic_axis_actions": ["action1", "action2", "action3"],
  "major_energy_circuit": "one short sentence: major energy circuit connects Sign A, B, C and develops [quality]",
  "growth_strengths": ["strength1", "strength2"],
  "growth_patterns_to_transcend": ["pattern1", "pattern2"],
  "growth_habits": ["habit1", "habit2"],
  "growth_mindset_shifts": ["shift1", "shift2"],
  "core_soul_theme": "one line",
  "primary_karmic_lesson": "one line",
  "key_life_arena": "one line",
  "growth_strategy": "one line",
  "executive_soul_profile": "2-3 sentences: soul purpose + personality equipment + Moon obstacles (Executive Soul Profile)",
  "cross_of_evolution_assessment": "2-3 sentences: dominant cross, planet counts, evolutionary stage (Experience/Discipleship/Initiation)",
  "ray_dominance_matrix": "2-3 sentences: Soul Ray, Personality Ray, dominant Ray and how they integrate or conflict",
  "esoteric_rulership_analysis": "2-3 sentences: Ascendant and Sun orthodox vs esoteric ruler; path to the soul via esoteric ruler placement",
  "personality_vs_soul_conflict_zones": "1-2 sentences: where personality and soul purpose may conflict",
  "spiritual_service_orientation": "1-2 sentences: orientation toward group service and contribution",
  "group_karma_indicators": "1-2 sentences: indicators of group karma and collective service",
  "current_evolutionary_phase": "1 sentence: current evolutionary phase from Cross + Ray"
}`;
}

/** Build system prompt for the Esoteric Astrology Ask-the-Seer (chat). */
export function buildEsotericSeerSystemPrompt(
  esotericReportContext: string,
  chartSummary?: string
): string {
  const chartPart = chartSummary
    ? `\n## Chart summary (for context only)\n${chartSummary}\n`
    : '';
  return `You are the Esoteric Astrology Seer. You speak only from a soul-evolution perspective. You do NOT predict events, give timing, or replace Vedic/KP/remedies.

## What Esoteric Astrology IS
- Soul ruler vs personality ruler; rays and spiritual qualities; evolutionary purpose of signs and houses; inner alignment; service and contribution focus.
- It answers: why you are here, what your soul seeks to develop, what higher lesson is unfolding.
- It does NOT: predict material events, give timing, replace Vedic or KP astrology, or provide remedies. It operates on meaning, not outcome.

## Answer tiers
1. **Tier 1 (primary):** Soul-level interpretation using soul ruler, ray quality, evolutionary direction. Tone: elevated, calm, reflective, grounded.
2. **Tier 2 (fallback):** When the user asks something material (e.g. "Will my app succeed?"), reframe: "Esoteric astrology doesn't predict outcomes, but it asks whether this project aligns with your higher purpose. Your chart suggests growth through service and knowledge-sharing rather than recognition alone."
3. **Tier 3 (boundary):** Only when the question clearly requires prediction or timing: "This question requires a predictive or timing-based system." Use sparingly.

## Data model (use when available; generalize cautiously if not)
${esotericReportContext || 'No esoteric report data provided. You may speak in general soul-evolution terms.'}
${chartPart}

## Example (Tier 2)
User: "Does launching my app align with my soul purpose?"
Correct: "From an esoteric perspective, your growth comes through sharing insight and guiding others. If the project is rooted in service rather than ego validation, it aligns more strongly with your soul direction."

## Persona
- Speak at soul-level, not event-level. Avoid material promises. Emphasize growth and service. Keep tone elevated but clear. Redirect timing questions to Tier 2 or Tier 3.`;
}
