// 32 Padas System for Vastu Shastra
// Based on Vastu Purusha Mandala with 32 deities/energy fields

export interface VastuPada {
  id: string; // e.g., "N3", "E5", "S1"
  name: string; // Deity name
  direction: 'north' | 'south' | 'east' | 'west';
  index: number; // 1-8 for each direction
  auspicious: boolean;
  effects: string[];
  recommendations: string[];
  deity: string;
  element: string;
  color: string;
}

// 32 Padas mapping based on Vastu Purusha Mandala
export const VASTU_32_PADAS: Record<string, VastuPada> = {
  // North Direction Padas (N1-N8)
  'N1': {
    id: 'N1',
    name: 'Roga',
    direction: 'north',
    index: 1,
    auspicious: false,
    effects: ['Health issues', 'Diseases', 'Weakness'],
    recommendations: ['Avoid entrance here', 'Use remedies if unavoidable'],
    deity: 'Roga',
    element: 'Water',
    color: 'Avoid dark colors'
  },
  'N2': {
    id: 'N2',
    name: 'Naga',
    direction: 'north',
    index: 2,
    auspicious: false,
    effects: ['Snake energy', 'Hidden dangers'],
    recommendations: ['Not ideal for entrance'],
    deity: 'Naga',
    element: 'Water',
    color: 'Neutral colors'
  },
  'N3': {
    id: 'N3',
    name: 'Mukhya',
    direction: 'north',
    index: 3,
    auspicious: true,
    effects: ['Wealth', 'Male children', 'Prosperity'],
    recommendations: ['Excellent for main entrance', 'Best pada for north-facing houses'],
    deity: 'Mukhya',
    element: 'Water',
    color: 'Blue/Black'
  },
  'N4': {
    id: 'N4',
    name: 'Bhallat',
    direction: 'north',
    index: 4,
    auspicious: true,
    effects: ['Abundance', 'Wealth', 'Blessings'],
    recommendations: ['Very auspicious for entrance', 'Brings abundance'],
    deity: 'Bhallat',
    element: 'Water',
    color: 'Blue/Black'
  },
  'N5': {
    id: 'N5',
    name: 'Soma',
    direction: 'north',
    index: 5,
    auspicious: true,
    effects: ['Wealth', 'Children', 'Spiritual growth'],
    recommendations: ['Auspicious entrance', 'Kubera energy', 'Moon blessings'],
    deity: 'Soma (Kubera)',
    element: 'Water',
    color: 'Blue/White'
  },
  'N6': {
    id: 'N6',
    name: 'Shikhi',
    direction: 'north',
    index: 6,
    auspicious: false,
    effects: ['Danger', 'Problems'],
    recommendations: ['Avoid entrance', 'Not recommended even though in NE zone'],
    deity: 'Shikhi',
    element: 'Water + Air',
    color: 'Avoid'
  },
  'N7': {
    id: 'N7',
    name: 'Parjanya',
    direction: 'north',
    index: 7,
    auspicious: false,
    effects: ['Rain energy', 'Uncertainty'],
    recommendations: ['Not ideal for entrance'],
    deity: 'Parjanya',
    element: 'Water',
    color: 'Neutral'
  },
  'N8': {
    id: 'N8',
    name: 'Jaya',
    direction: 'north',
    index: 8,
    auspicious: false,
    effects: ['Mixed results'],
    recommendations: ['Moderate pada'],
    deity: 'Jaya',
    element: 'Water',
    color: 'Neutral'
  },
  
  // East Direction Padas (E1-E8)
  'E1': {
    id: 'E1',
    name: 'Aditi',
    direction: 'east',
    index: 1,
    auspicious: true,
    effects: ['New beginnings', 'Growth', 'Prosperity'],
    recommendations: ['Good for entrance', 'Morning energy'],
    deity: 'Aditi',
    element: 'Air',
    color: 'Green'
  },
  'E2': {
    id: 'E2',
    name: 'Diti',
    direction: 'east',
    index: 2,
    auspicious: false,
    effects: ['Challenges', 'Obstacles'],
    recommendations: ['Avoid entrance'],
    deity: 'Diti',
    element: 'Air',
    color: 'Avoid'
  },
  'E3': {
    id: 'E3',
    name: 'Indra',
    direction: 'east',
    index: 3,
    auspicious: true,
    effects: ['Leadership', 'Power', 'Success'],
    recommendations: ['Excellent entrance', 'King energy'],
    deity: 'Indra',
    element: 'Air',
    color: 'Green/White'
  },
  'E4': {
    id: 'E4',
    name: 'Surya',
    direction: 'east',
    index: 4,
    auspicious: true,
    effects: ['Sun energy', 'Vitality', 'Health'],
    recommendations: ['Very auspicious', 'Sun blessings'],
    deity: 'Surya',
    element: 'Fire + Air',
    color: 'Orange/Red'
  },
  'E5': {
    id: 'E5',
    name: 'Satya',
    direction: 'east',
    index: 5,
    auspicious: true,
    effects: ['Truth', 'Honesty', 'Clarity'],
    recommendations: ['Good entrance', 'Positive energy'],
    deity: 'Satya',
    element: 'Air',
    color: 'Green'
  },
  'E6': {
    id: 'E6',
    name: 'Bhrisha',
    direction: 'east',
    index: 6,
    auspicious: false,
    effects: ['Anger', 'Conflict'],
    recommendations: ['Avoid entrance'],
    deity: 'Bhrisha',
    element: 'Air',
    color: 'Avoid'
  },
  'E7': {
    id: 'E7',
    name: 'Apa',
    direction: 'east',
    index: 7,
    auspicious: false,
    effects: ['Water issues', 'Emotional problems'],
    recommendations: ['Not ideal'],
    deity: 'Apa',
    element: 'Water + Air',
    color: 'Neutral'
  },
  'E8': {
    id: 'E8',
    name: 'Aryama',
    direction: 'east',
    index: 8,
    auspicious: false,
    effects: ['Mixed energy'],
    recommendations: ['Moderate pada'],
    deity: 'Aryama',
    element: 'Air',
    color: 'Neutral'
  },
  
  // South Direction Padas (S1-S8)
  'S1': {
    id: 'S1',
    name: 'Yama',
    direction: 'south',
    index: 1,
    auspicious: false,
    effects: ['Death energy', 'Negativity'],
    recommendations: ['Avoid entrance', 'Worst pada'],
    deity: 'Yama',
    element: 'Fire',
    color: 'Avoid'
  },
  'S2': {
    id: 'S2',
    name: 'Gandharva',
    direction: 'south',
    index: 2,
    auspicious: false,
    effects: ['Confusion', 'Illusion'],
    recommendations: ['Avoid entrance'],
    deity: 'Gandharva',
    element: 'Fire',
    color: 'Avoid'
  },
  'S3': {
    id: 'S3',
    name: 'Mrigha',
    direction: 'south',
    index: 3,
    auspicious: false,
    effects: ['Animal energy', 'Instability'],
    recommendations: ['Avoid entrance', 'Very inauspicious'],
    deity: 'Mrigha',
    element: 'Fire',
    color: 'Avoid'
  },
  'S4': {
    id: 'S4',
    name: 'Pitra',
    direction: 'south',
    index: 4,
    auspicious: false,
    effects: ['Ancestral issues', 'Past karma'],
    recommendations: ['Avoid entrance', 'Worst padas in SW'],
    deity: 'Pitra',
    element: 'Fire + Earth',
    color: 'Avoid'
  },
  'S5': {
    id: 'S5',
    name: 'Dauvarnika',
    direction: 'south',
    index: 5,
    auspicious: false,
    effects: ['Poverty', 'Lack'],
    recommendations: ['Avoid entrance'],
    deity: 'Dauvarnika',
    element: 'Fire',
    color: 'Avoid'
  },
  'S6': {
    id: 'S6',
    name: 'Sugreeva',
    direction: 'south',
    index: 6,
    auspicious: false,
    effects: ['Monkey energy', 'Instability'],
    recommendations: ['Not ideal'],
    deity: 'Sugreeva',
    element: 'Fire',
    color: 'Neutral'
  },
  'S7': {
    id: 'S7',
    name: 'Pusha',
    direction: 'south',
    index: 7,
    auspicious: true,
    effects: ['Nourishment', 'Growth'],
    recommendations: ['Center of south wall can be good', 'Moderate'],
    deity: 'Pusha',
    element: 'Fire',
    color: 'Red/Orange'
  },
  'S8': {
    id: 'S8',
    name: 'Vitatha',
    direction: 'south',
    index: 8,
    auspicious: false,
    effects: ['Waste', 'Loss'],
    recommendations: ['Avoid entrance'],
    deity: 'Vitatha',
    element: 'Fire',
    color: 'Avoid'
  },
  
  // West Direction Padas (W1-W8)
  'W1': {
    id: 'W1',
    name: 'Varuna',
    direction: 'west',
    index: 1,
    auspicious: false,
    effects: ['Water issues', 'Emotional problems'],
    recommendations: ['Not ideal for entrance'],
    deity: 'Varuna',
    element: 'Earth',
    color: 'Neutral'
  },
  'W2': {
    id: 'W2',
    name: 'Asura',
    direction: 'west',
    index: 2,
    auspicious: false,
    effects: ['Negative energy', 'Conflict'],
    recommendations: ['Avoid entrance', 'Worst pada in NW'],
    deity: 'Asura',
    element: 'Water + Earth',
    color: 'Avoid'
  },
  'W3': {
    id: 'W3',
    name: 'Sosha',
    direction: 'west',
    index: 3,
    auspicious: false,
    effects: ['Drying energy', 'Loss'],
    recommendations: ['Avoid entrance', 'Worst pada in NW'],
    deity: 'Sosha',
    element: 'Water + Earth',
    color: 'Avoid'
  },
  'W4': {
    id: 'W4',
    name: 'Papyakshama',
    direction: 'west',
    index: 4,
    auspicious: false,
    effects: ['Sin', 'Negative karma'],
    recommendations: ['Avoid entrance', 'Worst pada in NW'],
    deity: 'Papyakshama',
    element: 'Water + Earth',
    color: 'Avoid'
  },
  'W5': {
    id: 'W5',
    name: 'Roga',
    direction: 'west',
    index: 5,
    auspicious: false,
    effects: ['Health issues'],
    recommendations: ['Not ideal'],
    deity: 'Roga',
    element: 'Earth',
    color: 'Neutral'
  },
  'W6': {
    id: 'W6',
    name: 'Naga',
    direction: 'west',
    index: 6,
    auspicious: false,
    effects: ['Snake energy'],
    recommendations: ['Moderate'],
    deity: 'Naga',
    element: 'Earth',
    color: 'Neutral'
  },
  'W7': {
    id: 'W7',
    name: 'Mukhya',
    direction: 'west',
    index: 7,
    auspicious: true,
    effects: ['Stability', 'Grounding'],
    recommendations: ['Good entrance', 'Stable energy'],
    deity: 'Mukhya',
    element: 'Earth',
    color: 'Yellow/Brown'
  },
  'W8': {
    id: 'W8',
    name: 'Bhallat',
    direction: 'west',
    index: 8,
    auspicious: true,
    effects: ['Abundance', 'Stability'],
    recommendations: ['Auspicious entrance'],
    deity: 'Bhallat',
    element: 'Earth',
    color: 'Yellow/Brown'
  }
};

// Get auspicious padas for a direction
export function getAuspiciousPadas(direction: 'north' | 'south' | 'east' | 'west'): VastuPada[] {
  return Object.values(VASTU_32_PADAS)
    .filter(pada => pada.direction === direction && pada.auspicious);
}

// Get inauspicious padas for a direction
export function getInauspiciousPadas(direction: 'north' | 'south' | 'east' | 'west'): VastuPada[] {
  return Object.values(VASTU_32_PADAS)
    .filter(pada => pada.direction === direction && !pada.auspicious);
}

// Get worst padas (most inauspicious)
export function getWorstPadas(): VastuPada[] {
  const worstPadaIds = [
    'S4', // Pitra (SW)
    'S3', // Mrigha (SW)
    'S2', // Gandharva (SW)
    'W2', // Asura (NW)
    'W3', // Sosha (NW)
    'W4', // Papyakshama (NW)
  ];
  return worstPadaIds.map(id => VASTU_32_PADAS[id]).filter(Boolean);
}

// Get pada by ID
export function getPadaById(padaId: string): VastuPada | undefined {
  return VASTU_32_PADAS[padaId.toUpperCase()];
}

// Calculate pada from entrance direction and position
export function calculatePada(
  direction: 'north' | 'south' | 'east' | 'west',
  position: number // 1-8, where 1 is leftmost, 8 is rightmost
): VastuPada | undefined {
  const padaId = `${direction.charAt(0).toUpperCase()}${position}`;
  return VASTU_32_PADAS[padaId];
}

// Get recommendations for house facing direction
export function getEntranceRecommendations(
  houseFacing: 'north' | 'south' | 'east' | 'west'
): {
  bestPadas: VastuPada[];
  avoidPadas: VastuPada[];
  colorRecommendations: string;
  doorOpening: string;
} {
  const bestPadas = getAuspiciousPadas(houseFacing);
  const avoidPadas = getInauspiciousPadas(houseFacing);
  
  let colorRecommendations = '';
  let doorOpening = 'Clockwise from right side';
  
  switch (houseFacing) {
    case 'north':
      colorRecommendations = 'Shades of blue on main gate ensure new opportunities';
      break;
    case 'south':
      colorRecommendations = 'Shades of red, pink, or orange for money and wealth';
      break;
    case 'east':
      colorRecommendations = 'Green colors for growth and new beginnings';
      break;
    case 'west':
      colorRecommendations = 'Yellow or brown for stability';
      break;
  }
  
  return {
    bestPadas,
    avoidPadas,
    colorRecommendations,
    doorOpening
  };
}

