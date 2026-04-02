/**
 * Vastu Seer State and Slice.
 * Rule: Vastu reduces resistance; it does not create success by itself.
 * Spatial-constraint system — orientation, zones, severity, minimal correction.
 */

export interface VastuZones {
  north: string;
  north_east: string;
  east: string;
  south_east: string;
  south: string;
  south_west: string;
  west: string;
  north_west: string;
  center: string;
}

/** User-provided layout: facing + room placements. Enables Ask the Seer without full analysis. */
export interface VastuLayoutInput {
  facing_direction?: string;
  /** Optional 45-field label (8° Mahavastu-style grid) when user sets compass to 45 mode. */
  facing_45?: string;
  main_door?: string;
  kitchen?: string;
  bedroom?: string;
  toilet?: string;
  living_room?: string;
  prayer_room?: string;
  center?: string;
}

export interface VastuState {
  property_type: string;
  usage: string;
  orientation: string;
  construction_stage: string;
  zones: VastuZones;
  occupant_context: {
    family?: boolean;
    work_from_home?: boolean;
  };
  /** Main door 32-pada when provided (e.g. N3, E4). */
  main_door_pada?: string;
  /** Optional 45-field label from compass (8° grid). */
  facing_45_field?: string;
}

export type VastuQuestionType =
  | 'layout_balanced'
  | 'what_causing_instability'
  | 'what_correct_first'
  | 'placement_acceptable'
  | 'general'
  | 'refusal';

/** Payload: from VastuReading (propertyType, entranceDirection, rooms, mainEntranceAnalysis) or VastuLayoutInput. */
export interface VastuReadingPayload {
  propertyType?: string;
  plotShape?: string;
  entranceDirection?: string;
  construction_stage?: string;
  rooms?: Array<{
    name: string;
    currentDirection?: string | null;
    idealDirection?: string | null;
    status?: string;
  }>;
  mainEntranceAnalysis?: { houseFacing?: string };
  occupant_context?: { family?: boolean; work_from_home?: boolean };
  /** User-provided layout override: room -> direction. When present, used to build zones. */
  layout?: VastuLayoutInput;
}

const DIR_ALIAS: Record<string, keyof VastuZones> = {
  north: 'north',
  n: 'north',
  south: 'south',
  s: 'south',
  east: 'east',
  e: 'east',
  west: 'west',
  w: 'west',
  northeast: 'north_east',
  north_east: 'north_east',
  'north-east': 'north_east',
  ne: 'north_east',
  northwest: 'north_west',
  north_west: 'north_west',
  'north-west': 'north_west',
  nw: 'north_west',
  southeast: 'south_east',
  south_east: 'south_east',
  'south-east': 'south_east',
  se: 'south_east',
  southwest: 'south_west',
  south_west: 'south_west',
  'south-west': 'south_west',
  sw: 'south_west',
  // 16 Vastu zones -> map to 8 primary zones for zone-to-function logic
  'north-north-east': 'north_east',
  north_north_east: 'north_east',
  nne: 'north_east',
  'east-of-north-east': 'north_east',
  east_north_east: 'north_east',
  ene: 'north_east',
  'east-of-south-east': 'south_east',
  east_south_east: 'south_east',
  ese: 'south_east',
  'south-of-south-east': 'south_east',
  south_south_east: 'south_east',
  sse: 'south_east',
  'south-of-south-west': 'south_west',
  south_south_west: 'south_west',
  ssw: 'south_west',
  'west-of-south-west': 'south_west',
  west_south_west: 'south_west',
  wsw: 'south_west',
  'west-of-north-west': 'north_west',
  west_north_west: 'north_west',
  wnw: 'north_west',
  'north-of-north-west': 'north_west',
  north_north_west: 'north_west',
  nnw: 'north_west',
};

const VALID_ZONE_KEYS: (keyof VastuZones)[] = ['north', 'north_east', 'east', 'south_east', 'south', 'south_west', 'west', 'north_west', 'center'];

function normalizeDir(raw: string | null | undefined): keyof VastuZones | null {
  if (!raw || typeof raw !== 'string') return null;
  const key = raw.toLowerCase().trim().replace(/\s+/g, '_');
  if (key === 'center' || key === 'centre') return 'center';
  const mapped = DIR_ALIAS[key];
  if (mapped && VALID_ZONE_KEYS.includes(mapped)) return mapped;
  return null;
}

function emptyZones(): VastuZones {
  return {
    north: '',
    north_east: '',
    east: '',
    south_east: '',
    south: '',
    south_west: '',
    west: '',
    north_west: '',
    center: 'open',
  };
}

const LAYOUT_ROOM_LABELS: Record<string, string> = {
  main_door: 'Main door',
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
  toilet: 'Toilet',
  living_room: 'Living room',
  prayer_room: 'Prayer room',
  center: 'Center',
};

/**
 * Build VastuState from a reading payload. Requires orientation (entranceDirection, houseFacing, or layout.facing_direction) and layout or rooms.
 */
export function buildVastuState(payload: VastuReadingPayload): VastuState {
  const layoutOverride = payload.layout;
  const orientationRaw =
    payload.entranceDirection ??
    payload.mainEntranceAnalysis?.houseFacing ??
    layoutOverride?.facing_direction ??
    '';
  const orientation = orientationRaw
    ? `${String(orientationRaw).toLowerCase().trim().replace(/\s+/g, '_')}_facing`
    : 'unknown';
  if (!orientationRaw || orientation === 'unknown_facing') {
    throw new Error(
      'Vastu requires orientation (entrance/facing direction). Fill in the facing direction or provide layout to use Ask the Seer.'
    );
  }

  const zones = emptyZones();

  if (layoutOverride && (layoutOverride.kitchen || layoutOverride.bedroom || layoutOverride.toilet || layoutOverride.main_door || layoutOverride.living_room || layoutOverride.prayer_room || layoutOverride.center)) {
    for (const [roomKey, direction] of Object.entries(layoutOverride)) {
      if (roomKey === 'facing_direction' || roomKey === 'facing_45' || !direction || String(direction).toLowerCase() === 'unknown') continue;
      if (roomKey === 'center') {
        zones.center = String(direction);
        continue;
      }
      const zoneKey = normalizeDir(String(direction));
      if (zoneKey && zones[zoneKey] !== undefined) {
        zones[zoneKey] = LAYOUT_ROOM_LABELS[roomKey] ?? String(roomKey).replace(/_/g, ' ');
      }
    }
  } else {
    const rooms = payload.rooms ?? [];
    for (const room of rooms) {
      const dir = normalizeDir(room.currentDirection ?? room.idealDirection);
      if (dir && zones[dir] !== undefined) {
        zones[dir] = room.name;
      }
    }
  }

  const property_type = payload.propertyType ?? 'residential';
  const usage =
    property_type === 'residential'
      ? 'living'
      : property_type === 'commercial'
        ? 'business'
        : 'office';
  const construction_stage = payload.construction_stage ?? 'existing';
  const occupant_context = payload.occupant_context ?? {};
  const main_door_raw = layoutOverride?.main_door;
  const main_door_pada =
    typeof main_door_raw === 'string' && /^[NSEW][1-8]$/i.test(main_door_raw.trim())
      ? main_door_raw.trim().toUpperCase()
      : undefined;
  const facing_45_field = layoutOverride?.facing_45?.trim() || undefined;

  return {
    property_type,
    usage,
    orientation,
    construction_stage,
    zones,
    occupant_context,
    main_door_pada,
    facing_45_field,
  };
}

/**
 * Classify Vastu question. Refusal: predictions, guarantees, fate. Valid: layout balance, what's causing instability, what to correct first, placement acceptable.
 */
export function classifyVastuQuestion(question: string): VastuQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(will this bring (success|money|wealth)|when will (results|things) come|can this change my fate|guarantee|predict|definitely (bring|get))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(mixing (astrology|horoscope)|astrology (outcome|result)|horoscope (say|say))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(is (this )?layout balanced|layout (balanced|good)|space (balanced|harmony))\b/.test(
      lower
    )
  ) {
    return 'layout_balanced';
  }
  if (
    /\b(what is causing (instability|problem)|what('s| is) causing|instability|imbalance)\b/.test(
      lower
    )
  ) {
    return 'what_causing_instability';
  }
  if (
    /\b(what should (be )?corrected first|correct first|priority (correction|fix)|what to (fix|correct) first)\b/.test(
      lower
    )
  ) {
    return 'what_correct_first';
  }
  if (
    /\b(is (this )?placement acceptable|placement (acceptable|ok|good)|is (this )?room (placement|position) (ok|acceptable))\b/.test(
      lower
    )
  ) {
    return 'placement_acceptable';
  }
  if (
    /\b(vastu|orientation|zone|direction|room (place|placement)|brahmasthan|northeast|southwest)\b/.test(
      lower
    )
  ) {
    return 'general';
  }

  return 'general';
}

/** Refusal phrase for missing data. */
export const VASTU_REFUSAL_DATA_PHRASE =
  'Reliable Vastu analysis requires accurate layout and orientation data.';

/** Refusal phrase for outcome guarantees. */
export const VASTU_REFUSAL_OUTCOME_PHRASE =
  'Vastu evaluates spatial harmony, not outcomes.';

/**
 * Build slice for system prompt: state, zone-to-function mapping, severity, correction logic, construction stage, refusal, permanent rule.
 */
export function getVastuSliceForQuestionType(
  questionType: VastuQuestionType,
  state: VastuState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${VASTU_REFUSAL_OUTCOME_PHRASE}" or "${VASTU_REFUSAL_DATA_PHRASE}" Do not guarantee results, predict timing, or mix astrology outcomes. Vastu corrects spatial imbalance; it does not alter destiny.`;
  }

  const z = state.zones;
  const mainDoorLine = state.main_door_pada ? `- Main door pada: ${state.main_door_pada} (32-pada system)\n` : '';
  const field45Line = state.facing_45_field
    ? `- 45-field compass bearing (reference grid): ${state.facing_45_field}\n`
    : '';
  const stateBlock = `
VASTU STATE (use this only):
- Property type: ${state.property_type}; Usage: ${state.usage}
- Orientation: ${state.orientation}
- Construction stage: ${state.construction_stage}
${mainDoorLine}${field45Line}- Zones: North=${z.north || 'unset'}, North-East=${z.north_east || 'unset'}, East=${z.east || 'unset'}, South-East=${z.south_east || 'unset'}, South=${z.south || 'unset'}, South-West=${z.south_west || 'unset'}, West=${z.west || 'unset'}, North-West=${z.north_west || 'unset'}, Center=${z.center || 'open'}
- Occupant: family=${state.occupant_context.family ?? 'unknown'}, work_from_home=${state.occupant_context.work_from_home ?? 'unknown'}
`.trim();

  const zoneBlock = `
ZONE-TO-FUNCTION (spine):
- North / East → growth, movement, clarity. Heavy or stagnant use here = conflict.
- South / West → stability, weight, rest. Light or open use here = weak support.
- North-East (Ishanya) → purity, flow. Toilet/kitchen/weight here = critical violation.
- South-West (Nairutya) → grounding, authority. Master bedroom/weight here = ideal.
- Center (Brahmasthan) → circulation. Blocked or heavy use = critical.
Always say: "This function conflicts with this zone." No symbolism dumping.
`.trim();

  const severityBlock = `
SEVERITY:
- Critical: NE toilet, SW kitchen, blocked center.
- Moderate: bedroom misplacement, wrong room in wrong zone.
- Minor: furniture alignment, color.
Prioritize: "Correct this first; others are secondary."
`.trim();

  const correctionBlock = `
CORRECTION LOGIC (minimalism is authority):
- Allowed: reallocation of usage, decluttering, weight/light balance, directional orientation (bed, desk), color moderation.
- Forbidden by default: demolition, excess yantras, ritual stacking.
- Rule: One violation → one correction.
`.trim();

  const stageBlock = `
CONSTRUCTION STAGE:
- Under construction → structural guidance allowed.
- Existing building → non-invasive corrections only.
- Rented property → behavioral adjustments only.
Adapt advice accordingly.
`.trim();

  const documentedRemediesBlock = `
DOCUMENTED VASTU REMEDIES (cite when relevant):
- Sea salt: bowls in corners (especially bathroom), replace weekly. Mix in mopping water for purification.
- Vastu pyramids: copper/brass/plastic above doors or defect areas to balance energy.
- Mirrors: N/E walls for financial energy; never face entrance, bed, or another mirror.
- Camphor: burn in puja room or bathroom for purification.
- Wind chimes: 6 or 8 rods at entrance or windows to break stagnant energy.
- Auspicious symbols: Om, Swastik, Trishul at main entrance as protective shield.
- Fish aquarium: NE or dining, clean and aerated.
- Plants: Tulsi in NE; Money Plant/Bamboo in N or E.
- Ganesh/Hanuman: facing entrance to correct defects.
- Color: light (white, yellow, green) in NE; avoid dark/red in NE.
- Entrance: Swastik/Om, well-lit, clean.
- Toilet in NE: sea salt bowl (weekly), door closed, copper strips.
- Bedroom: bed SW, no mirror facing bed, head not north.
- Kitchen in NE: bronze bowls upside down on ceiling or red bulb at night.
- Leaking taps: repair immediately (symbolizes wealth drain).
`.trim();

  const framingBlock = `
ANSWER FRAMING:
- Practical, unemotional. Example: "The North-East toilet disrupts flow and should be corrected first to reduce instability."
- No fear. No promises. No "this is very bad Vastu" without clear cause and one correction.
`.trim();

  const permanentRule = `
PERMANENT RULE:
Vastu reduces resistance; it does not create success by itself.
`.trim();

  return `${stateBlock}

${zoneBlock}

${severityBlock}

${correctionBlock}

${stageBlock}

${documentedRemediesBlock}

${framingBlock}

${permanentRule}`;
}
