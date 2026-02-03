/**
 * Human Design Data Definitions
 * Complete reference data for Human Design system
 */

// 9 Energy Centers
export const CENTERS = {
  HEAD: { id: 'head', name: 'Head', description: 'Inspiration and mental pressure' },
  AJNA: { id: 'ajna', name: 'Ajna', description: 'Mental awareness and conceptualization' },
  THROAT: { id: 'throat', name: 'Throat', description: 'Communication and manifestation' },
  G: { id: 'g', name: 'G Center', description: 'Identity, love, and direction' },
  HEART: { id: 'heart', name: 'Heart/Ego', description: 'Willpower and ego' },
  SOLAR_PLEXUS: { id: 'solar_plexus', name: 'Solar Plexus', description: 'Emotions and awareness' },
  SACRAL: { id: 'sacral', name: 'Sacral', description: 'Life force and work energy' },
  ROOT: { id: 'root', name: 'Root', description: 'Adrenaline and pressure to evolve' },
  SPLEEN: { id: 'spleen', name: 'Spleen', description: 'Intuition, health, and survival' }
} as const;

// Motor Centers (for Type determination)
export const MOTOR_CENTERS = ['root', 'sacral', 'solar_plexus', 'heart'] as const;

// 4 Human Design Types
export const TYPES = {
  MANIFESTOR: {
    id: 'manifestor',
    name: 'Manifestor',
    strategy: 'Inform',
    description: 'Initiators who are here to impact others. They have a defined Throat connected to a motor center.',
    percentage: 8,
    notSelfTheme: 'Anger'
  },
  GENERATOR: {
    id: 'generator',
    name: 'Generator',
    strategy: 'Wait to Respond',
    description: 'Builders of the world with consistent life force energy. They have a defined Sacral center.',
    percentage: 37,
    notSelfTheme: 'Frustration'
  },
  PROJECTOR: {
    id: 'projector',
    name: 'Projector',
    strategy: 'Wait for Invitation',
    description: 'Guides who see others clearly. They have no motor centers defined but have other defined centers.',
    percentage: 20,
    notSelfTheme: 'Bitterness'
  },
  REFLECTOR: {
    id: 'reflector',
    name: 'Reflector',
    strategy: 'Wait a Lunar Cycle',
    description: 'Rare mirrors who reflect the health of their community. They have no centers defined.',
    percentage: 1,
    notSelfTheme: 'Disappointment'
  }
} as const;

// Authorities
export const AUTHORITIES = {
  EMOTIONAL: {
    id: 'emotional',
    name: 'Emotional Authority',
    description: 'Wait for emotional clarity. Make decisions after experiencing the full emotional wave.',
    centers: ['solar_plexus']
  },
  SACRAL: {
    id: 'sacral',
    name: 'Sacral Authority',
    description: 'Respond with gut responses. Trust your immediate "uh-huh" or "uh-uh" sounds.',
    centers: ['sacral']
  },
  SPLENIC: {
    id: 'splenic',
    name: 'Splenic Authority',
    description: 'Trust your first instinct. Make decisions in the moment based on immediate knowing.',
    centers: ['spleen']
  },
  SELF_PROJECTED: {
    id: 'self_projected',
    name: 'Self-Projected Authority',
    description: 'Speak to know. Talk through decisions to hear your truth.',
    centers: ['g', 'throat']
  },
  EGO: {
    id: 'ego',
    name: 'Ego Authority',
    description: 'Wait for clarity about what you want. Make decisions from your willpower center.',
    centers: ['heart']
  },
  ENVIRONMENTAL: {
    id: 'environmental',
    name: 'Environmental Authority',
    description: 'Wait a full lunar cycle (28 days) to make major decisions.',
    centers: []
  },
  LUNAR: {
    id: 'lunar',
    name: 'Lunar Authority',
    description: 'Wait a full lunar cycle to make decisions. Reflect on options over 28 days.',
    centers: []
  }
} as const;

// 12 Profiles (combinations of 6 lines)
export const PROFILES = {
  '1/3': {
    name: 'Investigator/Martyr',
    description: 'The Investigator/Martyr seeks truth through trial and error, learning through experience.',
    line1: 'Investigator',
    line2: 'Martyr',
    role: 'To investigate and discover through personal experience'
  },
  '1/4': {
    name: 'Investigator/Opportunist',
    description: 'The Investigator/Opportunist seeks truth and shares it with their network.',
    line1: 'Investigator',
    line2: 'Opportunist',
    role: 'To investigate and share discoveries with your network'
  },
  '2/4': {
    name: 'Hermit/Opportunist',
    description: 'The Hermit/Opportunist has natural talents that emerge when called upon by their network.',
    line1: 'Hermit',
    line2: 'Opportunist',
    role: 'To develop natural talents and share them when invited'
  },
  '2/5': {
    name: 'Hermit/Heretic',
    description: 'The Hermit/Heretic has natural talents that project onto others, creating expectations.',
    line1: 'Hermit',
    line2: 'Heretic',
    role: 'To develop talents and project them onto the world'
  },
  '3/5': {
    name: 'Martyr/Heretic',
    description: 'The Martyr/Heretic learns through trial and error, projecting universal solutions.',
    line1: 'Martyr',
    line2: 'Heretic',
    role: 'To learn through experience and share universal solutions'
  },
  '3/6': {
    name: 'Martyr/Role Model',
    description: 'The Martyr/Role Model learns through trial and error, becoming a role model in later life.',
    line1: 'Martyr',
    line2: 'Role Model',
    role: 'To learn through experience and become a role model'
  },
  '4/1': {
    name: 'Opportunist/Investigator',
    description: 'The Opportunist/Investigator shares discoveries with their network and seeks truth.',
    line1: 'Opportunist',
    line2: 'Investigator',
    role: 'To share opportunities and investigate truth'
  },
  '4/6': {
    name: 'Opportunist/Role Model',
    description: 'The Opportunist/Role Model shares opportunities and becomes a role model.',
    line1: 'Opportunist',
    line2: 'Role Model',
    role: 'To share opportunities and model the way'
  },
  '5/1': {
    name: 'Heretic/Investigator',
    description: 'The Heretic/Investigator projects universal solutions and seeks truth.',
    line1: 'Heretic',
    line2: 'Investigator',
    role: 'To project solutions and investigate truth'
  },
  '5/2': {
    name: 'Heretic/Hermit',
    description: 'The Heretic/Hermit projects solutions and has natural talents.',
    line1: 'Heretic',
    line2: 'Hermit',
    role: 'To project universal solutions from natural talents'
  },
  '6/2': {
    name: 'Role Model/Hermit',
    description: 'The Role Model/Hermit has natural talents and becomes a role model.',
    line1: 'Role Model',
    line2: 'Hermit',
    role: 'To develop talents and become a role model'
  },
  '6/3': {
    name: 'Role Model/Martyr',
    description: 'The Role Model/Martyr learns through experience and becomes a role model.',
    line1: 'Role Model',
    line2: 'Martyr',
    role: 'To learn through experience and model the way'
  }
} as const;

// 64 I Ching Gates (simplified - full meanings would be extensive)
export const GATES: Record<number, { name: string; center: string; description: string }> = {
  1: { name: 'The Creative', center: 'g', description: 'Self-expression and creativity' },
  2: { name: 'The Receptive', center: 'g', description: 'Direction and navigation' },
  3: { name: 'Difficulty at the Beginning', center: 'sacral', description: 'Ordering and organizing' },
  4: { name: 'Youthful Folly', center: 'ajna', description: 'Formulating answers' },
  5: { name: 'Waiting', center: 'sacral', description: 'Fixed patterns and rhythms' },
  6: { name: 'Conflict', center: 'throat', description: 'Friction and conflict resolution' },
  7: { name: 'The Army', center: 'g', description: 'The role of the self' },
  8: { name: 'Holding Together', center: 'throat', description: 'Contribution and support' },
  9: { name: 'The Taming Power of the Small', center: 'ajna', description: 'Focus and attention' },
  10: { name: 'Treading', center: 'g', description: 'Behavior and the self' },
  11: { name: 'Peace', center: 'ajna', description: 'Ideas and peace' },
  12: { name: 'Standstill', center: 'ajna', description: 'Caution and knowing what not to do' },
  13: { name: 'Fellowship', center: 'g', description: 'The listener and the voice' },
  14: { name: 'Possession in Great Measure', center: 'spleen', description: 'Power skills' },
  15: { name: 'Modesty', center: 'g', description: 'Extremes and rhythm' },
  16: { name: 'Enthusiasm', center: 'throat', description: 'Skills and talents' },
  17: { name: 'Following', center: 'ajna', description: 'Opinions and following' },
  18: { name: 'Work on What Has Been Spoiled', center: 'spleen', description: 'Correction and improvement' },
  19: { name: 'Approach', center: 'root', description: 'Wanting and need' },
  20: { name: 'Contemplation', center: 'throat', description: 'The now and awareness' },
  21: { name: 'Biting Through', center: 'heart', description: 'The hunter and the hunt' },
  22: { name: 'Grace', center: 'throat', description: 'The right and the left' },
  23: { name: 'Splitting Apart', center: 'throat', description: 'Assimilation and conceptualization' },
  24: { name: 'Return', center: 'ajna', description: 'Rationalization and mental process' },
  25: { name: 'Innocence', center: 'heart', description: 'The spirit of the self' },
  26: { name: 'The Taming Power of the Great', center: 'g', description: 'The egoist' },
  27: { name: 'Nourishment', center: 'spleen', description: 'Self-care and care of others' },
  28: { name: 'Preponderance of the Great', center: 'root', description: 'The game player' },
  29: { name: 'The Abysmal Water', center: 'root', description: 'Saying yes and saying no' },
  30: { name: 'The Clinging Fire', center: 'solar_plexus', description: 'Feelings and emotions' },
  31: { name: 'Influence', center: 'throat', description: 'Leading and following' },
  32: { name: 'Duration', center: 'spleen', description: 'Continuity and transformation' },
  33: { name: 'Retreat', center: 'throat', description: 'Privacy and withdrawal' },
  34: { name: 'The Power of the Great', center: 'sacral', description: 'Power and empowerment' },
  35: { name: 'Progress', center: 'throat', description: 'Change and transformation' },
  36: { name: 'Darkening of the Light', center: 'solar_plexus', description: 'Crisis and transformation' },
  37: { name: 'The Family', center: 'g', description: 'Friendship and equality' },
  38: { name: 'Opposition', center: 'root', description: 'The fighter and fighting' },
  39: { name: 'Obstruction', center: 'root', description: 'Provocation and stimulation' },
  40: { name: 'Deliverance', center: 'root', description: 'Aloneness and being alone' },
  41: { name: 'Decrease', center: 'root', description: 'Fantasy and imagination' },
  42: { name: 'Increase', center: 'root', description: 'Growth and development' },
  43: { name: 'Breakthrough', center: 'ajna', description: 'Insight and breakthrough' },
  44: { name: 'Coming to Meet', center: 'spleen', description: 'Alertness and awareness' },
  45: { name: 'Gathering Together', center: 'solar_plexus', description: 'The collector and collecting' },
  46: { name: 'Pushing Upward', center: 'g', description: 'Determination and the self' },
  47: { name: 'Oppression', center: 'ajna', description: 'Realization and understanding' },
  48: { name: 'The Well', center: 'spleen', description: 'Depth and depth of understanding' },
  49: { name: 'Revolution', center: 'solar_plexus', description: 'Principles and principles' },
  50: { name: 'The Cauldron', center: 'spleen', description: 'Values and values' },
  51: { name: 'The Arousing', center: 'heart', description: 'Shock and shock' },
  52: { name: 'Keeping Still', center: 'root', description: 'Stilling and stillness' },
  53: { name: 'Development', center: 'root', description: 'Beginnings and beginnings' },
  54: { name: 'The Marrying Maiden', center: 'root', description: 'Ambition and ambition' },
  55: { name: 'Abundance', center: 'solar_plexus', description: 'Spirit and spirit' },
  56: { name: 'The Wanderer', center: 'spleen', description: 'Stimulation and stimulation' },
  57: { name: 'The Gentle', center: 'spleen', description: 'Intuition and intuition' },
  58: { name: 'The Joyous', center: 'root', description: 'Vitality and vitality' },
  59: { name: 'Dispersion', center: 'root', description: 'Sexuality and sexuality' },
  60: { name: 'Limitation', center: 'root', description: 'Acceptance and acceptance' },
  61: { name: 'Inner Truth', center: 'ajna', description: 'Mystery and mystery' },
  62: { name: 'Preponderance of the Small', center: 'throat', description: 'Detail and detail' },
  63: { name: 'After Completion', center: 'ajna', description: 'Doubt and doubt' },
  64: { name: 'Before Completion', center: 'ajna', description: 'Confusion and confusion' }
};

// 36 Channels (connections between centers via gates)
export const CHANNELS: Record<string, { name: string; center1: string; center2: string; gates: [number, number]; description: string }> = {
  '1-8': { name: 'Channel of Inspiration', center1: 'head', center2: 'ajna', gates: [1, 8], description: 'Creative expression and mental clarity' },
  '2-14': { name: 'Channel of The Beat', center1: 'g', center2: 'spleen', gates: [2, 14], description: 'Direction and timing' },
  '3-60': { name: 'Channel of Mutation', center1: 'sacral', center2: 'root', gates: [3, 60], description: 'Rhythmic patterns and change' },
  '4-63': { name: 'Channel of Logic', center1: 'ajna', center2: 'head', gates: [4, 63], description: 'Mental pressure and logical thinking' },
  '5-15': { name: 'Channel of Rhythm', center1: 'sacral', center2: 'g', gates: [5, 15], description: 'Natural rhythms and flow' },
  '6-59': { name: 'Channel of Mating', center1: 'spleen', center2: 'sacral', gates: [6, 59], description: 'Intimacy and reproduction' },
  '7-31': { name: 'Channel of The Alpha', center1: 'g', center2: 'throat', gates: [7, 31], description: 'Leadership and direction' },
  '9-52': { name: 'Channel of Concentration', center1: 'ajna', center2: 'root', gates: [9, 52], description: 'Focus and determination' },
  '10-20': { name: 'Channel of Awakening', center1: 'g', center2: 'throat', gates: [10, 20], description: 'Self-expression and awareness' },
  '10-34': { name: 'Channel of Exploration', center1: 'g', center2: 'sacral', gates: [10, 34], description: 'Following and empowerment' },
  '10-57': { name: 'Channel of Perfected Form', center1: 'g', center2: 'spleen', gates: [10, 57], description: 'Survival and intuition' },
  '11-56': { name: 'Channel of Curiosity', center1: 'ajna', center2: 'spleen', gates: [11, 56], description: 'Seeking and stimulation' },
  '12-22': { name: 'Channel of Openness', center1: 'throat', center2: 'ajna', gates: [12, 22], description: 'Social being and grace' },
  '13-33': { name: 'Channel of The Prodigal', center1: 'g', center2: 'throat', gates: [13, 33], description: 'The witness and privacy' },
  '16-48': { name: 'Channel of The Wavelength', center1: 'throat', center2: 'spleen', gates: [16, 48], description: 'Talent and depth' },
  '17-62': { name: 'Channel of Acceptance', center1: 'ajna', center2: 'throat', gates: [17, 62], description: 'Opinions and organization' },
  '18-58': { name: 'Channel of Judgment', center1: 'spleen', center2: 'root', gates: [18, 58], description: 'Correction and vitality' },
  '19-49': { name: 'Channel of Synthesis', center1: 'root', center2: 'solar_plexus', gates: [19, 49], description: 'Wanting and principles' },
  '20-34': { name: 'Channel of Charisma', center1: 'throat', center2: 'sacral', gates: [20, 34], description: 'The now and empowerment' },
  '20-57': { name: 'Channel of The Brainwave', center1: 'throat', center2: 'spleen', gates: [20, 57], description: 'Awareness and intuition' },
  '21-45': { name: 'Channel of The Money Line', center1: 'heart', center2: 'solar_plexus', gates: [21, 45], description: 'Materialism and the material world' },
  '23-43': { name: 'Channel of Structuring', center1: 'throat', center2: 'ajna', gates: [23, 43], description: 'Individual expression and insight' },
  '24-61': { name: 'Channel of Awareness', center1: 'ajna', center2: 'head', gates: [24, 61], description: 'Mental process and inspiration' },
  '25-51': { name: 'Channel of Initiation', center1: 'heart', center2: 'g', gates: [25, 51], description: 'The spirit and shock' },
  '26-44': { name: 'Channel of Surrender', center1: 'g', center2: 'spleen', gates: [26, 44], description: 'The egoist and awareness' },
  '27-50': { name: 'Channel of Preservation', center1: 'spleen', center2: 'spleen', gates: [27, 50], description: 'Caring and values' },
  '28-38': { name: 'Channel of Struggle', center1: 'root', center2: 'root', gates: [28, 38], description: 'The game player and the fighter' },
  '29-46': { name: 'Channel of Discovery', center1: 'root', center2: 'g', gates: [29, 46], description: 'Saying yes and determination' },
  '30-41': { name: 'Channel of Recognition', center1: 'solar_plexus', center2: 'root', gates: [30, 41], description: 'Feelings and fantasy' },
  '32-54': { name: 'Channel of Transformation', center1: 'spleen', center2: 'root', gates: [32, 54], description: 'Continuity and ambition' },
  '35-36': { name: 'Channel of Transitoriness', center1: 'throat', center2: 'solar_plexus', gates: [35, 36], description: 'Change and crisis' },
  '37-40': { name: 'Channel of Community', center1: 'g', center2: 'root', gates: [37, 40], description: 'Friendship and aloneness' },
  '39-55': { name: 'Channel of Emoting', center1: 'root', center2: 'solar_plexus', gates: [39, 55], description: 'Provocation and spirit' },
  '42-53': { name: 'Channel of Maturation', center1: 'root', center2: 'root', gates: [42, 53], description: 'Growth and beginnings' },
  '47-64': { name: 'Channel of Abstraction', center1: 'ajna', center2: 'head', gates: [47, 64], description: 'Understanding and confusion' }
};

// Incarnation Crosses (based on Sun/Earth gates)
export const INCARNATION_CROSSES: Record<string, { name: string; description: string }> = {
  // This is a simplified version - full system has many combinations
  'RA': { name: 'Right Angle Cross', description: 'Personal destiny focused on individual development' },
  'JX': { name: 'Juxtaposition Cross', description: 'Fixed destiny with specific life purpose' },
  'LX': { name: 'Left Angle Cross', description: 'Transpersonal destiny focused on others' }
};

// Helper function to get gate from planet position
export function getGateFromPlanetPosition(planetLongitude: number): number {
  // Human Design uses a specific mapping: each 5.625 degrees = 1 gate
  // Gate 1 starts at 0 degrees, gate 2 at 5.625, etc.
  const gate = Math.floor(planetLongitude / 5.625) + 1;
  return gate > 64 ? gate - 64 : gate;
}

// Helper function to get line from planet position
export function getLineFromPlanetPosition(planetLongitude: number): number {
  // Each gate is divided into 6 lines, each line = 0.9375 degrees
  const gatePosition = planetLongitude % 5.625;
  const line = Math.floor(gatePosition / 0.9375) + 1;
  return line > 6 ? 6 : line;
}

