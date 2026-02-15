import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB, UserProfile } from './firebase';
import { getEntranceRecommendations, getAuspiciousPadas, getInauspiciousPadas, getWorstPadas, type VastuPada } from './vastu32Padas';
import { calculatePersonalizedVastuDirections, matchAstrologicalElements, getPersonalizedRoomRecommendations } from './vastuPersonalization';

export interface VastuDirection {
  name: string;
  element: string;
  deity: string;
  color: string;
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
  recommendations: string[];
}

export interface VastuRoom {
  name: string;
  idealDirection: string;
  element: string;
  currentDirection?: string | null;
  status: 'optimal' | 'good' | 'warning' | 'critical';
  recommendations: string[];
  remedies: string[];
  energyScore: number;
  description?: string;
  furniturePlacement?: string[];
  colors?: string[];
  appliances?: string[];
}

export interface VastuDosha {
  type: 'vastu' | 'directional' | 'elemental' | 'structural';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  affectedAreas: string[];
  remedies: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface VastuEnergyFlow {
  direction: string;
  element: string;
  strength: number;
  flow: 'positive' | 'neutral' | 'negative';
  description: string;
  recommendations: string[];
}

export interface VastuRecommendation {
  category: 'room' | 'direction' | 'element' | 'structure';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string[];
  expectedBenefits: string[];
  timeline: string;
}

export interface VastuMainEntranceAnalysis {
  houseFacing: 'north' | 'south' | 'east' | 'west';
  bestPadas: VastuPada[];
  avoidPadas: VastuPada[];
  currentPada?: VastuPada;
  colorRecommendations: string;
  doorOpening: string;
  remedies: string[];
  ganeshaPlacement: {
    location: string;
    position: string;
    notes: string;
  };
}

export interface VastuReading {
  id: string;
  userId: string;
  timestamp: Date;
  propertyType: 'residential' | 'commercial' | 'office';
  plotShape: 'square' | 'rectangular' | 'irregular';
  entranceDirection: string;
  directions: VastuDirection[];
  rooms: VastuRoom[];
  doshas: VastuDosha[];
  energyFlows: VastuEnergyFlow[];
  recommendations: VastuRecommendation[];
  overallScore: number | null; // null for profile-based reports
  mainEntranceAnalysis?: VastuMainEntranceAnalysis;
  personalizedInsights?: {
    userLuckyDirections: string[];
    personalizedRecommendations: string[];
    elementCompatibility: Record<string, number>;
  };
  personality: {
    strengths: string[];
    challenges: string[];
    lifePath: string;
    careerGuidance: string;
    relationshipInsights: string;
    healthIndicators: string[];
  };
  remedies: {
    structural: string[];
    elemental: string[];
    directional: string[];
    lifestyle: string[];
  };
  coaching: {
    currentFocus: string;
    recommendations: string[];
    affirmations: string[];
    nextSteps: string[];
  };
  metadata: {
    calculationMethod: string;
    system: string;
    lastUpdated: Date;
    isProfileBased?: boolean; // Flag to indicate if this is a profile-based recommendation (no actual property analyzed)
    cacheVersion?: string; // Cache version for invalidating old cached data when logic changes
  };
}

// Cache version for invalidating old cached data when recommendation generation logic changes
const CACHE_VERSION = '2.0'; // Updated for varied wording implementation

// Vastu calculation constants
const DIRECTION_DATA = {
  north: {
    element: 'Water',
    deity: 'Kubera',
    color: 'Blue/Black',
    description: 'Wealth and prosperity direction',
    recommendations: ['Keep water elements', 'Avoid heavy objects', 'Use blue colors']
  },
  south: {
    element: 'Fire',
    deity: 'Yama',
    color: 'Red/Orange',
    description: 'Energy and transformation direction',
    recommendations: ['Keep fire elements', 'Avoid water', 'Use red colors']
  },
  east: {
    element: 'Air',
    deity: 'Indra',
    color: 'Green',
    description: 'New beginnings and growth direction',
    recommendations: ['Keep airy spaces', 'Avoid heavy furniture', 'Use green colors']
  },
  west: {
    element: 'Earth',
    deity: 'Varuna',
    color: 'Yellow/Brown',
    description: 'Stability and grounding direction',
    recommendations: ['Keep earth elements', 'Avoid fire', 'Use yellow colors']
  },
  northeast: {
    element: 'Water + Air',
    deity: 'Ishanya',
    color: 'White',
    description: 'Spiritual and knowledge direction',
    recommendations: ['Keep prayer room', 'Avoid heavy objects', 'Use white colors']
  },
  northwest: {
    element: 'Water + Earth',
    deity: 'Vayu',
    color: 'Grey',
    description: 'Movement and travel direction',
    recommendations: ['Keep guest room', 'Avoid fire', 'Use grey colors']
  },
  southeast: {
    element: 'Fire + Air',
    deity: 'Agni',
    color: 'Orange',
    description: 'Energy and activity direction',
    recommendations: ['Keep kitchen', 'Avoid water', 'Use orange colors']
  },
  southwest: {
    element: 'Fire + Earth',
    deity: 'Nairutya',
    color: 'Red',
    description: 'Stability and relationships direction',
    recommendations: ['Keep master bedroom', 'Avoid water elements', 'Use red colors']
  }
};

// Brahmasthan (Center) - The most sacred space in Vastu
const BRAHMASTHAN = {
  importance: 'The center of the house (Brahmasthan) is the most sacred space, representing the cosmic energy point',
  rules: [
    'Keep Brahmasthan completely open and free',
    'No heavy furniture, pillars, or structures in center',
    'No toilets, kitchen, or storage in center',
    'Ideal for open courtyard, meditation space, or light decorative elements',
    'Maintain cleanliness and positive energy flow',
    'Avoid placing anything that blocks energy flow'
  ],
  benefits: [
    'Enhanced positive energy flow throughout home',
    'Better health and well-being for residents',
    'Harmonious family relationships',
    'Increased prosperity and success'
  ]
};

// Time-based Vastu recommendations
const TIME_BASED_VASTU = {
  morning: {
    directions: ['east', 'northeast'],
    activities: ['Prayer', 'Meditation', 'Study', 'Exercise'],
    colors: ['White', 'Light yellow', 'Pink'],
    elements: ['Air', 'Water']
  },
  afternoon: {
    directions: ['south', 'southeast'],
    activities: ['Cooking', 'Work', 'Business activities'],
    colors: ['Orange', 'Red', 'Yellow'],
    elements: ['Fire', 'Air']
  },
  evening: {
    directions: ['west', 'northwest'],
    activities: ['Dining', 'Socializing', 'Relaxation'],
    colors: ['Grey', 'Blue', 'Purple'],
    elements: ['Earth', 'Water']
  },
  night: {
    directions: ['southwest', 'south'],
    activities: ['Sleep', 'Rest', 'Intimacy'],
    colors: ['Dark blue', 'Black', 'Deep red'],
    elements: ['Earth', 'Fire']
  }
};

// Seasonal Vastu adjustments
const SEASONAL_VASTU = {
  spring: {
    focus: 'Renewal and growth',
    directions: ['east', 'northeast'],
    colors: ['Green', 'Yellow', 'Pink'],
    recommendations: ['Open windows for fresh air', 'Use light colors', 'Plant new vegetation']
  },
  summer: {
    focus: 'Cooling and energy management',
    directions: ['north', 'northeast'],
    colors: ['White', 'Light blue', 'Green'],
    recommendations: ['Keep water elements active', 'Use cooling colors', 'Maintain ventilation']
  },
  monsoon: {
    focus: 'Protection and stability',
    directions: ['southwest', 'west'],
    colors: ['Yellow', 'Orange', 'Brown'],
    recommendations: ['Ensure proper drainage', 'Protect from water damage', 'Use earth elements']
  },
  winter: {
    focus: 'Warmth and comfort',
    directions: ['south', 'southeast'],
    colors: ['Red', 'Orange', 'Yellow'],
    recommendations: ['Use fire elements', 'Warm colors', 'Ensure proper heating']
  }
};

const ROOM_DATA = {
  bedroom: {
    idealDirection: 'southwest',
    element: 'Earth',
    description: 'Rest and relationships',
    recommendations: ['Head towards south', 'Avoid mirrors facing bed', 'Use calming colors'],
    furniturePlacement: [
      'Bed should face south or east',
      'Avoid bed under beam',
      'Keep headboard against solid wall',
      'No storage under bed',
      'Dresser in southwest corner'
    ],
    colors: ['Light blue', 'Green', 'Pink', 'Avoid red and black'],
    appliances: ['Avoid TV in bedroom', 'No mirrors facing bed'],
    masterBedroom: true,
    childrenBedroom: {
      idealDirection: 'west',
      alternativeDirection: 'northwest',
      recommendations: ['West or northwest for children', 'Face east while studying']
    }
  },
  kitchen: {
    idealDirection: 'southeast',
    element: 'Fire',
    description: 'Nourishment and health',
    recommendations: ['Face east while cooking', 'Keep fire in southeast', 'Avoid water in kitchen'],
    furniturePlacement: [
      'Stove in southeast corner',
      'Face east while cooking',
      'Sink should not be opposite to stove',
      'Keep refrigerator in southeast or east',
      'Storage in south or west walls'
    ],
    colors: ['Orange', 'Red', 'Yellow', 'Avoid black and blue'],
    appliances: [
      'Fridge: Southeast or East direction (best)',
      'Stove: Southeast corner, face east',
      'Sink: Northeast corner if possible',
      'Avoid: Fridge in southwest or northeast'
    ],
    fridgePlacement: {
      best: ['Southeast', 'East'],
      avoid: ['Southwest', 'Northeast', 'Northwest'],
      notes: 'Fridge represents water element, but can be in fire zone if in SE/E'
    }
  },
  livingRoom: {
    idealDirection: 'north',
    element: 'Water',
    description: 'Social interactions and wealth',
    recommendations: ['Face north or east', 'Keep water elements', 'Use blue colors'],
    furniturePlacement: [
      'Sofa facing north or east',
      'Host should face east or north',
      'Guests face west or south',
      'TV in southeast corner',
      'Water fountain in northeast'
    ],
    colors: ['Blue', 'Green', 'White', 'Avoid red'],
    appliances: ['TV in southeast', 'Water elements in north'],
    brahmasthan: 'Keep center (Brahmasthan) open and free'
  },
  bathroom: {
    idealDirection: 'northwest',
    element: 'Water',
    description: 'Cleansing and purification',
    recommendations: ['Keep clean and organized', 'Avoid mirrors facing door', 'Use white colors'],
    furniturePlacement: [
      'Toilet in west or north',
      'Bath in north or east',
      'Mirror not facing door',
      'Keep door closed',
      'Ventilation important'
    ],
    colors: ['White', 'Light blue', 'Avoid dark colors'],
    appliances: ['Avoid: Bathroom in southeast, southwest, or south'],
    avoidDirections: ['Southeast', 'Southwest', 'South', 'Northeast']
  },
  study: {
    idealDirection: 'northeast',
    element: 'Air',
    description: 'Learning and knowledge',
    recommendations: ['Face east or north', 'Keep books organized', 'Use green colors'],
    furniturePlacement: [
      'Study table facing east or north',
      'Bookshelf in east or north wall',
      'Keep organized and clutter-free',
      'Good lighting from east',
      'Avoid heavy furniture'
    ],
    colors: ['Green', 'White', 'Light yellow', 'Avoid dark colors'],
    appliances: ['Computer facing east', 'Good ventilation']
  },
  dining: {
    idealDirection: 'west',
    element: 'Earth',
    description: 'Nourishment and family',
    recommendations: ['Face east while eating', 'Keep table clean', 'Use yellow colors'],
    furniturePlacement: [
      'Dining table in west',
      'Face east while eating',
      'Keep table clean and organized',
      'Avoid dining in northeast',
      'Good lighting'
    ],
    colors: ['Yellow', 'Orange', 'Light colors', 'Avoid dark'],
    appliances: ['Avoid heavy appliances nearby']
  },
  prayer: {
    idealDirection: 'northeast',
    element: 'Air',
    description: 'Spirituality and meditation',
    recommendations: ['Face east or north', 'Keep clean and peaceful', 'Use white colors'],
    furniturePlacement: [
      'Idols facing east or north',
      'Keep clean and peaceful',
      'No storage below',
      'Good lighting from east',
      'Place Ganesha at entrance (north/NE)'
    ],
    colors: ['White', 'Light yellow', 'Saffron', 'Avoid dark'],
    appliances: ['Lamp in northeast', 'Bell in east'],
    ganeshaPlacement: {
      location: 'North or Northeast',
      position: 'Back facing outside',
      notes: 'Sitting position Ganesha ideal for entrance'
    }
  },
  storage: {
    idealDirection: 'southwest',
    element: 'Earth',
    description: 'Stability and organization',
    recommendations: ['Keep organized', 'Avoid fire elements', 'Use brown colors'],
    furniturePlacement: [
      'Heavy items in southwest',
      'Keep organized',
      'Avoid clutter',
      'No storage in northeast',
      'Use brown or earth tones'
    ],
    colors: ['Brown', 'Yellow', 'Earth tones', 'Avoid bright colors'],
    appliances: ['Avoid heavy appliances in northeast']
  }
};

const DOSHA_TYPES = {
  vastu: {
    description: 'Basic Vastu violations affecting overall harmony',
    remedies: ['Follow Vastu principles', 'Use proper colors', 'Maintain cleanliness']
  },
  directional: {
    description: 'Directional misalignments affecting specific areas',
    remedies: ['Correct room placements', 'Use directional remedies', 'Balance elements']
  },
  elemental: {
    description: 'Element imbalances causing disharmony',
    remedies: ['Balance five elements', 'Use elemental remedies', 'Maintain harmony']
  },
  structural: {
    description: 'Structural issues affecting energy flow',
    remedies: ['Fix structural problems', 'Use structural remedies', 'Improve flow']
  }
};

// Calculate main entrance analysis with 32 padas
function calculateMainEntranceAnalysis(
  entranceDirection: string
): VastuMainEntranceAnalysis | undefined {
  const direction = entranceDirection.toLowerCase() as 'north' | 'south' | 'east' | 'west';
  
  if (!['north', 'south', 'east', 'west'].includes(direction)) {
    return undefined;
  }
  
  const recommendations = getEntranceRecommendations(direction);
  const worstPadas = getWorstPadas();
  
  // Check if current entrance is in worst padas
  const isWorstPada = worstPadas.some(pada => 
    pada.direction === direction
  );
  
  const remedies: string[] = [];
  if (isWorstPada || !recommendations.bestPadas.some(p => p.direction === direction)) {
    remedies.push('Place Ganesha idol at entrance (north/NE, back facing outside)');
    remedies.push('Use auspicious symbols and colors');
    remedies.push('Ensure entrance is well-lit');
    remedies.push('Keep entrance clean and obstacle-free');
    remedies.push('Avoid shoe racks in front of entrance');
    remedies.push('Main door should be larger than other doors');
    remedies.push('Door should open clockwise from right side');
  }
  
  return {
    houseFacing: direction,
    bestPadas: recommendations.bestPadas,
    avoidPadas: recommendations.avoidPadas,
    colorRecommendations: recommendations.colorRecommendations,
    doorOpening: recommendations.doorOpening,
    remedies,
    ganeshaPlacement: {
      location: 'North or Northeast',
      position: 'Back facing outside',
      notes: 'Sitting position Ganesha ideal for home entrance'
    }
  };
}

// Calculate Vastu analysis based on property details with personalization
// Helper function to generate varied recommendation text
// Uses a pool of varied phrases to avoid repetition
function generateVariedDirectionRecommendation(direction: string, birthDate?: string): string {
  const dirCapitalized = direction.charAt(0).toUpperCase() + direction.slice(1);
  const birthSuffix = birthDate ? ` (born ${birthDate})` : '';
  
  // Pool of varied phrases for direction recommendations
  const variations = [
    `${dirCapitalized} direction is highly auspicious${birthSuffix} and promises prosperity and positive outcomes.`,
    `${dirCapitalized} direction holds exceptional energy${birthSuffix} and will enhance well-being and achievements.`,
    `${dirCapitalized} direction is extremely favorable${birthSuffix} and will attract abundance and harmony.`,
    `${dirCapitalized} direction is particularly beneficial${birthSuffix} and will support growth and fulfillment.`,
    `${dirCapitalized} direction is remarkably auspicious${birthSuffix} and will bring prosperity and positive transformations.`,
    `${dirCapitalized} direction is deeply favorable${birthSuffix} and will enhance success and positive energy flow.`,
    `${dirCapitalized} direction is exceptionally harmonious${birthSuffix} and will promote well-being and favorable circumstances.`,
    `${dirCapitalized} direction is powerfully aligned${birthSuffix} and will attract success and positive developments.`,
    `${dirCapitalized} direction is significantly beneficial${birthSuffix} and will support prosperity and harmonious living.`,
    `${dirCapitalized} direction is optimally positioned${birthSuffix} and will enhance opportunities and positive outcomes.`
  ];
  
  // Use a simple hash to deterministically select a variation
  let hash = 0;
  for (let i = 0; i < direction.length; i++) {
    hash = ((hash << 5) - hash) + direction.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % variations.length;
  return variations[index];
}

function generateVariedRoomRecommendation(roomName: string, directions: string[], colors: string[]): string {
  const dirsText = directions.join(', ');
  const colorsText = colors.join(', ');
  
  // Pool of varied phrases for room recommendations
  const variations = [
    `${roomName}: Align with lucky directions: ${dirsText}. Use colors: ${colorsText} for enhanced harmony.`,
    `${roomName}: Position towards ${dirsText} directions. Incorporate colors: ${colorsText} to optimize energy flow.`,
    `${roomName}: Optimal placement in ${dirsText} directions. Apply colors: ${colorsText} for balanced vibrations.`,
    `${roomName}: Favorable alignment with ${dirsText} directions. Integrate colors: ${colorsText} to support positive energy.`,
    `${roomName}: Recommended orientation towards ${dirsText} directions. Utilize colors: ${colorsText} for harmonious resonance.`,
    `${roomName}: Ideal positioning in ${dirsText} directions. Employ colors: ${colorsText} to enhance positive influences.`,
    `${roomName}: Beneficial placement facing ${dirsText} directions. Use colors: ${colorsText} for optimal energy alignment.`,
    `${roomName}: Auspicious arrangement in ${dirsText} directions. Apply colors: ${colorsText} to promote well-being.`
  ];
  
  // Use a simple hash to deterministically select a variation
  let hash = 0;
  for (let i = 0; i < roomName.length; i++) {
    hash = ((hash << 5) - hash) + roomName.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % variations.length;
  return variations[index];
}

function generateVariedColorRecommendation(roomName: string, colors: string[]): string {
  const colorsText = colors.join(', ');
  
  // Pool of varied phrases for color recommendations
  const variations = [
    `${roomName} colors: ${colorsText} resonate strongly with birth chart alignment.`,
    `${roomName} colors: ${colorsText} are particularly harmonious based on astrological compatibility.`,
    `${roomName} colors: ${colorsText} align well with birth chart energies.`,
    `${roomName} colors: ${colorsText} are optimally matched to astrological profile.`,
    `${roomName} colors: ${colorsText} create favorable resonance with birth chart configuration.`,
    `${roomName} colors: ${colorsText} are especially compatible with astrological alignment.`,
    `${roomName} colors: ${colorsText} harmonize effectively with birth chart influences.`,
    `${roomName} colors: ${colorsText} are well-suited based on astrological compatibility.`
  ];
  
  // Use a simple hash to deterministically select a variation
  let hash = 0;
  for (let i = 0; i < roomName.length; i++) {
    hash = ((hash << 5) - hash) + roomName.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % variations.length;
  return variations[index];
}

function calculateVastuAnalysis(
  propertyType: string,
  plotShape: string,
  entranceDirection: string,
  rooms: { [key: string]: boolean },
  userProfile?: UserProfile | null,
  isProfileBased: boolean = false
): {
  directions: VastuDirection[];
  roomAnalysis: VastuRoom[];
  doshas: VastuDosha[];
  energyFlows: VastuEnergyFlow[];
  recommendations: VastuRecommendation[];
  overallScore: number | null; // null for profile-based reports
  mainEntranceAnalysis?: VastuMainEntranceAnalysis;
  personalizedInsights?: {
    userLuckyDirections: string[];
    personalizedRecommendations: string[];
    elementCompatibility: Record<string, number>;
  };
} {
  // Get personalized directions if user profile available
  const personalized = userProfile ? calculatePersonalizedVastuDirections(userProfile) : null;
  const userLuckyDirections = personalized?.bestDirections || [];
  const userName = userProfile?.fullName || '';
  const birthDate = userProfile?.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  
  // Analyze directions with personalization weighting
  const directions: VastuDirection[] = Object.entries(DIRECTION_DATA).map(([direction, data]) => {
    const isEntrance = direction === entranceDirection;
    let strength: 'strong' | 'moderate' | 'weak' = isEntrance ? 'strong' : Math.random() > 0.5 ? 'moderate' : 'weak';
    
    // Personalize based on user's lucky directions
    if (personalized) {
      const dirLower = direction.toLowerCase();
      if (userLuckyDirections.includes(dirLower)) {
        // Boost strength if it's a lucky direction
        if (strength === 'weak') strength = 'moderate';
        else if (strength === 'moderate') strength = 'strong';
      } else if (personalized.avoidDirections.includes(dirLower)) {
        // Reduce strength if it's an avoid direction
        if (strength === 'strong') strength = 'moderate';
        else if (strength === 'moderate') strength = 'weak';
      }
    }
    
    return {
      name: direction.charAt(0).toUpperCase() + direction.slice(1),
      element: data.element,
      deity: data.deity,
      color: data.color,
      strength,
      description: data.description,
      recommendations: data.recommendations
    };
  });

  // Analyze rooms
  const roomAnalysis = Object.entries(rooms)
    .filter(([_, hasRoom]) => hasRoom)
    .map(([roomKey, _]) => {
      const roomData = ROOM_DATA[roomKey as keyof typeof ROOM_DATA];
      
      // Safety check: skip invalid room keys
      if (!roomData) {
        devLog.warn(`Room data not found for key: ${roomKey}. Skipping room analysis.`, undefined, 'vastuIntelligence');
        return null;
      }
      
      // For profile-based reports, don't generate fake current directions
      const currentDirection = isProfileBased ? null : getRandomDirection();
      const isOptimal = isProfileBased ? true : currentDirection === roomData.idealDirection;
      const status = isProfileBased ? 'optimal' : 
                    (isOptimal ? 'optimal' : 
                    currentDirection === getAdjacentDirection(roomData.idealDirection) ? 'good' :
                    currentDirection === getOppositeDirection(roomData.idealDirection) ? 'critical' : 'warning');
      
      const energyScore = isProfileBased ? 95 + Math.random() * 5 :
                         (isOptimal ? 90 + Math.random() * 10 :
                         status === 'good' ? 70 + Math.random() * 20 :
                         status === 'warning' ? 40 + Math.random() * 30 :
                         20 + Math.random() * 20);

      return {
        name: roomKey.charAt(0).toUpperCase() + roomKey.slice(1),
        idealDirection: roomData.idealDirection,
        element: roomData.element,
        currentDirection: currentDirection || null,
        status,
        recommendations: roomData.recommendations,
        remedies: isProfileBased ? [] : generateRoomRemedies(roomKey, currentDirection || '', roomData.idealDirection),
        energyScore: Math.round(energyScore),
        description: roomData.description || '',
        furniturePlacement: roomData.furniturePlacement || [],
        colors: roomData.colors || [],
        appliances: roomData.appliances || []
      };
    })
    .filter(room => room !== null) as VastuRoom[];

  // Analyze doshas
  const doshas: VastuDosha[] = [];
  
  // Check for entrance dosha
  if (entranceDirection === 'south' || entranceDirection === 'southwest') {
    doshas.push({
      type: 'directional',
      severity: 'moderate',
      description: 'Entrance in inauspicious direction affecting energy flow',
      affectedAreas: ['Overall energy', 'Relationships', 'Health'],
      remedies: ['Use entrance remedies', 'Place auspicious symbols', 'Maintain cleanliness'],
      priority: 'high'
    });
  }

  // Check for room placement doshas
  roomAnalysis.forEach(room => {
    if (room.status === 'critical') {
      doshas.push({
        type: 'directional',
        severity: 'severe',
        description: `${room.name} in critical direction affecting ${room.element} energy`,
        affectedAreas: [room.name, 'Health', 'Relationships'],
        remedies: room.remedies,
        priority: 'high'
      });
    }
  });

  // Check for elemental imbalances
  const elementCounts = roomAnalysis.reduce((acc, room) => {
    acc[room.element] = (acc[room.element] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  Object.entries(elementCounts).forEach(([element, count]) => {
    if (count > 3) {
      doshas.push({
        type: 'elemental',
        severity: 'moderate',
        description: `Excess ${element} element causing imbalance`,
        affectedAreas: ['Energy balance', 'Health', 'Relationships'],
        remedies: ['Balance elements', 'Use counter elements', 'Maintain harmony'],
        priority: 'medium'
      });
    }
  });

  // Analyze energy flows
  const energyFlows: VastuEnergyFlow[] = directions.map(direction => {
    const flow = direction.strength === 'strong' ? 'positive' :
                 direction.strength === 'moderate' ? 'neutral' : 'negative';
    const strength = direction.strength === 'strong' ? 80 + Math.random() * 20 :
                    direction.strength === 'moderate' ? 50 + Math.random() * 30 :
                    20 + Math.random() * 30;

    return {
      direction: direction.name,
      element: direction.element,
      strength: Math.round(strength),
      flow,
      description: `${direction.name} direction has ${flow} energy flow`,
      recommendations: direction.recommendations
    };
  });

  // Generate recommendations with personalization
  const recommendations: VastuRecommendation[] = [];
  const personalizedRecommendations: string[] = [];
  
  // Add personalized direction recommendations
  if (personalized && userLuckyDirections.length > 0) {
    userLuckyDirections.forEach(dir => {
      const elementMatch = matchAstrologicalElements(userProfile ?? null, DIRECTION_DATA[dir as keyof typeof DIRECTION_DATA]?.element || '');
      
        // Use varied recommendation text
        personalizedRecommendations.push(
          generateVariedDirectionRecommendation(dir, birthDate ?? undefined)
        );

        if (elementMatch.compatible && elementMatch.matchScore >= 80) {
          personalizedRecommendations.push(
            `${personalized.luckyElements[0] || 'element'} element is highly compatible with ${dir.charAt(0).toUpperCase() + dir.slice(1)} direction (${elementMatch.matchScore}% match), making it ideal for this space.`
          );
        }
    });
    
    // Add room-specific personalized recommendations
    roomAnalysis.forEach(room => {
      // Generate varied room recommendation with directions and colors
      if (userLuckyDirections.length > 0 && personalized.recommendedColors.length > 0) {
        const roomColors = personalized.recommendedColors.slice(0, 3);
        personalizedRecommendations.push(
          generateVariedRoomRecommendation(room.name, userLuckyDirections, roomColors)
        );
      } else {
        // Fallback to original method if personalized data is incomplete
        const roomRecs = getPersonalizedRoomRecommendations(userProfile ?? null, room.name);
        if (roomRecs.length > 0) {
          personalizedRecommendations.push(
            `${room.name}: ${roomRecs.join('. ')}`
          );
        }
      }
      
      // Add personalized color recommendations for each room with varied wording
      if (personalized.recommendedColors.length > 0 && room.colors && room.colors.length > 0) {
        const matchingColors = room.colors.filter(c =>
          personalized.recommendedColors.some(rc =>
            c.toLowerCase().includes(rc.toLowerCase()) || rc.toLowerCase().includes(c.toLowerCase())
          )
        );
        if (matchingColors.length > 0) {
          personalizedRecommendations.push(
            generateVariedColorRecommendation(room.name, matchingColors)
          );
        }
      }
    });
  }
  
  // High priority recommendations for critical issues (with personalization)
  doshas.filter(d => d.priority === 'high').forEach(dosha => {
    const personalizedDesc = personalized ? 
      `Addressing this ${dosha.type} dosha is especially important based on birth chart alignment. ${dosha.description}` :
      dosha.description;
    
    recommendations.push({
      category: 'direction',
      priority: 'high',
      title: `Fix ${dosha.type} dosha`,
      description: personalizedDesc,
      implementation: dosha.remedies,
      expectedBenefits: ['Improved energy flow', 'Better health', 'Harmonious relationships'],
      timeline: 'Immediate action required'
    });
  });

  // Room-specific recommendations (with personalization)
  roomAnalysis.filter(r => r.status !== 'optimal').forEach(room => {
    let personalizedRoomDesc = `${room.name} is in ${room.status} position`;
    if (personalized && userLuckyDirections.includes(room.idealDirection.toLowerCase())) {
      personalizedRoomDesc = `Placing ${room.name} in ${room.idealDirection} direction aligns with lucky directions and will enhance well-being.`;
    }
    
    recommendations.push({
      category: 'room',
      priority: room.status === 'critical' ? 'high' : 'medium',
      title: `Optimize ${room.name} placement`,
      description: personalizedRoomDesc,
      implementation: room.recommendations,
      expectedBenefits: [`Better ${room.name} energy`, 'Improved functionality', 'Enhanced well-being'],
      timeline: 'Within 1-2 months'
    });
  });

  // Calculate main entrance analysis with 32 padas
  const mainEntranceAnalysis = calculateMainEntranceAnalysis(entranceDirection);
  
  // Add dosha for worst padas
  if (mainEntranceAnalysis) {
    const worstPadas = getWorstPadas();
    const isWorstPada = worstPadas.some(pada => 
      pada.direction === mainEntranceAnalysis.houseFacing
    );
    
    if (isWorstPada) {
      doshas.push({
        type: 'directional',
        severity: 'severe',
        description: 'Entrance in worst pada (Pitra, Mrigha, Gandharva, Asura, Sosha, or Papyakshama) - very inauspicious',
        affectedAreas: ['Overall energy', 'Health', 'Wealth', 'Relationships'],
        remedies: mainEntranceAnalysis.remedies,
        priority: 'high'
      });
    }
  }

  // Calculate overall score with personalization boost
  const roomScores = roomAnalysis.map(r => r.energyScore);
  const averageRoomScore = roomScores.length > 0 
    ? roomScores.reduce((a, b) => a + b, 0) / roomScores.length 
    : 50;
  const doshaPenalty = doshas.length * 10;
  const entrancePenalty = mainEntranceAnalysis && 
    mainEntranceAnalysis.avoidPadas.some(p => p.direction === mainEntranceAnalysis.houseFacing) ? 15 : 0;
  
  // Personalization boost: if entrance is in user's lucky direction, reduce penalty
  let personalizationBoost = 0;
  if (personalized && userLuckyDirections.includes(entranceDirection.toLowerCase())) {
    personalizationBoost = 10; // Boost score if entrance is in lucky direction
  }
  
  // For profile-based reports, don't calculate a score (no property to evaluate)
  const overallScore = isProfileBased 
    ? null 
    : Math.max(0, Math.min(100, averageRoomScore - doshaPenalty - entrancePenalty + personalizationBoost));

  // Calculate element compatibility scores
  const elementCompatibility: Record<string, number> = {};
  if (personalized && userProfile) {
    Object.entries(DIRECTION_DATA).forEach(([dir, data]) => {
      const match = matchAstrologicalElements(userProfile, data.element);
      elementCompatibility[dir] = match.matchScore;
    });
  }

  return {
    directions,
    roomAnalysis,
    doshas,
    energyFlows,
    recommendations,
    overallScore: overallScore === null ? null : Math.round(overallScore),
    mainEntranceAnalysis,
    personalizedInsights: personalized ? {
      userLuckyDirections: userLuckyDirections,
      personalizedRecommendations: personalizedRecommendations,
      elementCompatibility
    } : undefined
  };
}

// Helper functions
function getRandomDirection(): string {
  const directions = ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'];
  return directions[Math.floor(Math.random() * directions.length)];
}

function getAdjacentDirection(direction: string): string {
  const adjacent = {
    'north': 'northeast',
    'northeast': 'east',
    'east': 'southeast',
    'southeast': 'south',
    'south': 'southwest',
    'southwest': 'west',
    'west': 'northwest',
    'northwest': 'north'
  };
  return adjacent[direction as keyof typeof adjacent] || direction;
}

function getOppositeDirection(direction: string): string {
  const opposite = {
    'north': 'south',
    'south': 'north',
    'east': 'west',
    'west': 'east',
    'northeast': 'southwest',
    'southwest': 'northeast',
    'northwest': 'southeast',
    'southeast': 'northwest'
  };
  return opposite[direction as keyof typeof opposite] || direction;
}

function generateRoomRemedies(roomKey: string, currentDirection: string, idealDirection: string): string[] {
  const remedies: string[] = [];
  
  if (currentDirection !== idealDirection) {
    remedies.push(`Move ${roomKey} to ${idealDirection} direction if possible`);
    remedies.push(`Use ${ROOM_DATA[roomKey as keyof typeof ROOM_DATA].element} elements in ${roomKey}`);
  }
  
  remedies.push(`Keep ${roomKey} clean and organized`);
  remedies.push(`Use appropriate colors for ${roomKey}`);
  
  return remedies;
}

// Generate personality insights based on Vastu analysis with personalization
function generatePersonalityInsights(
  directions: VastuDirection[],
  roomAnalysis: VastuRoom[],
  doshas: VastuDosha[],
  userProfile?: UserProfile | null
): VastuReading['personality'] {
  const strengths: string[] = [];
  const challenges: string[] = [];
  const userName = userProfile?.fullName || '';
  const personalized = userProfile ? calculatePersonalizedVastuDirections(userProfile) : null;
  
  // Analyze strong directions with personalization
  const strongDirections = directions.filter(d => d.strength === 'strong');
  strongDirections.forEach(direction => {
    const dirLower = direction.name.toLowerCase();
    const isLucky = personalized?.bestDirections.includes(dirLower);
    
    if (direction.element === 'Water') {
      strengths.push(isLucky ? 
        `Natural wealth attraction through ${direction.name} direction aligns with birth chart` :
        'Natural wealth attraction');
    }
    if (direction.element === 'Fire') {
      strengths.push(isLucky ?
        `Strong energy and transformation ability through ${direction.name} direction is auspicious` :
        'Strong energy and transformation ability');
    }
    if (direction.element === 'Air') {
      strengths.push(isLucky ?
        `Adaptability and growth mindset through ${direction.name} direction supports the path` :
        'Adaptability and growth mindset');
    }
    if (direction.element === 'Earth') {
      strengths.push(isLucky ?
        `Stability and grounding nature through ${direction.name} direction enhances the foundation` :
        'Stability and grounding nature');
    }
  });
  
  // Analyze doshas for challenges
  doshas.forEach(dosha => {
    if (dosha.type === 'directional') challenges.push('Directional imbalances affecting life areas');
    if (dosha.type === 'elemental') challenges.push('Elemental disharmony causing stress');
    if (dosha.type === 'structural') challenges.push('Structural issues affecting energy flow');
  });
  
  return {
    strengths: strengths.length > 0 ? strengths : ['Balanced approach to life'],
    challenges: challenges.length > 0 ? challenges : ['Minor adjustments needed'],
    lifePath: getLifePath(directions, roomAnalysis, userProfile),
    careerGuidance: getCareerGuidance(directions, roomAnalysis, userProfile),
    relationshipInsights: getRelationshipInsights(directions, roomAnalysis, userProfile),
    healthIndicators: getHealthIndicators(directions, roomAnalysis, userProfile)
  };
}

function getLifePath(directions: VastuDirection[], roomAnalysis: VastuRoom[], userProfile?: UserProfile | null): string {
  const userName = userProfile?.fullName || '';
  const strongElements = directions
    .filter(d => d.strength === 'strong')
    .map(d => d.element);
  
  if (strongElements.includes('Water')) {
    return userProfile ? 
      `The path of abundance and prosperity aligns with birth chart` :
      'Path of abundance and prosperity';
  }
  if (strongElements.includes('Fire')) {
    return userProfile ?
      `The path of transformation and leadership is supported by cosmic alignment` :
      'Path of transformation and leadership';
  }
  if (strongElements.includes('Air')) {
    return userProfile ?
      `The path of learning and growth resonates with astrological profile` :
      'Path of learning and growth';
  }
  if (strongElements.includes('Earth')) {
    return userProfile ?
      `The path of stability and service matches elemental nature` :
      'Path of stability and service';
  }
  
  return userProfile ? 
    `A balanced life path with multiple opportunities awaits` :
    'Balanced life path with multiple opportunities';
}

function getCareerGuidance(directions: VastuDirection[], roomAnalysis: VastuRoom[], userProfile?: UserProfile | null): string {
  const userName = userProfile?.fullName || '';
  const strongElements = directions
    .filter(d => d.strength === 'strong')
    .map(d => d.element);
  
  if (strongElements.includes('Water')) {
    return userProfile ?
      `Excellent opportunities in business, finance, and wealth creation based on birth chart` :
      'Excellent for business, finance, and wealth creation';
  }
  if (strongElements.includes('Fire')) {
    return userProfile ?
      `Perfect alignment for leadership, entrepreneurship, and innovation` :
      'Perfect for leadership, entrepreneurship, and innovation';
  }
  if (strongElements.includes('Air')) {
    return userProfile ?
      `Ideal paths in education, communication, and technology` :
      'Ideal for education, communication, and technology';
  }
  if (strongElements.includes('Earth')) {
    return userProfile ?
      `Great potential in service, healthcare, and stable careers` :
      'Great for service, healthcare, and stable careers';
  }
  
  return userProfile ?
    `Versatile career options with potential in multiple fields` :
    'Versatile career options with potential in multiple fields';
}

function getRelationshipInsights(directions: VastuDirection[], roomAnalysis: VastuRoom[], userProfile?: UserProfile | null): string {
  const userName = userProfile?.fullName || '';
  const bedroom = roomAnalysis.find(r => r.name === 'Bedroom');
  
  if (bedroom?.status === 'optimal') {
    return userProfile ?
      `Harmonious relationships with strong partnership potential, supported by birth chart alignment` :
      'Harmonious relationships with strong partnership potential';
  }
  if (bedroom?.status === 'good') {
    return userProfile ?
      `Good relationships with minor adjustments needed to optimize cosmic alignment` :
      'Good relationships with minor adjustments needed';
  }
  if (bedroom?.status === 'warning') {
    return userProfile ?
      `Relationship challenges requiring attention - consider aligning with lucky directions` :
      'Relationship challenges requiring attention';
  }
  if (bedroom?.status === 'critical') {
    return userProfile ?
      `Serious relationship issues requiring immediate remedies - birth chart suggests focusing on ${userProfile ? calculatePersonalizedVastuDirections(userProfile).bestDirections[0] : 'auspicious'} direction` :
      'Serious relationship issues requiring immediate remedies';
  }
  
  return userProfile ?
    `A balanced approach to relationships with learning opportunities` :
    'Balanced approach to relationships with learning opportunities';
}

function getHealthIndicators(directions: VastuDirection[], roomAnalysis: VastuRoom[], userProfile?: UserProfile | null): string[] {
  const userName = userProfile?.fullName || '';
  const indicators: string[] = [];
  const kitchen = roomAnalysis.find(r => r.name === 'Kitchen');
  
  if (kitchen?.status === 'optimal') {
    indicators.push(userProfile ?
      `Excellent digestive health and nutrition, aligned with birth chart` :
      'Excellent digestive health and nutrition');
  }
  if (kitchen?.status === 'critical') {
    indicators.push(userProfile ?
      `Digestive issues requiring dietary attention - consider kitchen placement in lucky directions` :
      'Digestive issues requiring dietary attention');
  }
  
  const strongElements = directions
    .filter(d => d.strength === 'strong')
    .map(d => d.element);
  
  if (strongElements.includes('Water')) {
    indicators.push(userProfile ?
      `Good kidney and fluid balance supported by elemental alignment` :
      'Good kidney and fluid balance');
  }
  if (strongElements.includes('Fire')) {
    indicators.push(userProfile ?
      `Strong metabolism and energy levels enhanced by birth chart` :
      'Strong metabolism and energy levels');
  }
  if (strongElements.includes('Air')) {
    indicators.push(userProfile ?
      `Healthy respiratory system aligned with cosmic profile` :
      'Healthy respiratory system');
  }
  if (strongElements.includes('Earth')) {
    indicators.push(userProfile ?
      `Strong immune system and stability supported by elemental nature` :
      'Strong immune system and stability');
  }
  
  return indicators.length > 0 ? indicators : [
    userProfile ? 
      `Generally good health with minor concerns` :
      'Generally good health with minor concerns'
  ];
}

// Generate remedies with personalization
function generateRemedies(
  directions: VastuDirection[],
  doshas: VastuDosha[],
  roomAnalysis: VastuRoom[],
  userProfile?: UserProfile | null
): VastuReading['remedies'] {
  const userName = userProfile?.fullName || '';
  const personalized = userProfile ? calculatePersonalizedVastuDirections(userProfile) : null;
  const structural: string[] = [];
  const elemental: string[] = [];
  const directional: string[] = [];
  const lifestyle: string[] = [];
  
  // Structural remedies with Brahmasthan importance
  structural.push('Maintain clean and organized spaces');
  structural.push('Fix any structural damages immediately');
  structural.push('Ensure proper ventilation in all rooms');
  structural.push(`Brahmasthan (center): ${BRAHMASTHAN.importance}`);
  structural.push('Keep the center of the home completely open - no heavy furniture, pillars, or structures');
  structural.push('Ideal center use: open courtyard, meditation space, or light decorative elements only');
  if (userProfile) {
    structural.push(`Maintaining structural harmony aligns with birth chart requirements`);
  }
  
  // Elemental remedies with personalization
  elemental.push('Balance five elements in the space');
  if (personalized && personalized.luckyElements.length > 0) {
    elemental.push(`Focus on ${personalized.luckyElements.join(' and ')} elements which are favorable based on birth chart`);
  }
  elemental.push('Use appropriate colors for each direction');
  if (personalized && personalized.recommendedColors.length > 0) {
    elemental.push(`Use colors: ${personalized.recommendedColors.slice(0, 3).join(', ')} for enhanced harmony`);
  }
  elemental.push('Place elemental objects strategically');
  
  // Directional remedies with personalization
  directions.forEach(direction => {
    if (direction.strength === 'weak') {
      const dirLower = direction.name.toLowerCase();
      if (personalized && personalized.bestDirections.includes(dirLower)) {
        directional.push(`Strengthen ${direction.name} direction (lucky direction) with ${direction.element} elements for maximum benefit`);
      } else {
        directional.push(`Strengthen ${direction.name} direction with ${direction.element} elements`);
      }
    }
  });

  // Documented remedies where applicable (room/defect-specific)
  const bathroom = roomAnalysis.find(r => r.name.toLowerCase().includes('bath') || r.name.toLowerCase().includes('toilet'));
  const kitchen = roomAnalysis.find(r => r.name.toLowerCase().includes('kitchen'));
  const hasEntranceDosha = doshas.some(d => d.description.toLowerCase().includes('entrance'));

  if (bathroom && (bathroom.status === 'critical' || bathroom.currentDirection?.toLowerCase().includes('northeast'))) {
    structural.push('Place sea salt bowls in bathroom corners (replace weekly) to absorb and neutralize negative energy; keep door closed');
  }
  if (kitchen && kitchen.currentDirection?.toLowerCase().includes('northeast')) {
    directional.push('Kitchen in NE: place bronze bowls upside down on ceiling or use a red light bulb at night to introduce fire energy');
  }
  if (hasEntranceDosha) {
    directional.push('Place brass or copper Swastik/Om at main entrance; hang 6 or 8-rod wind chimes to attract positive energy');
  }

  structural.push('Repair leaking taps immediately—they symbolize drainage of wealth and health');
  lifestyle.push('Remove broken clocks, mirrors, and pottery; keep home free of cobwebs and clutter');
  
  // Lifestyle remedies with time-based and seasonal recommendations
  lifestyle.push('Wake up before sunrise for optimal energy');
  lifestyle.push('Maintain positive thoughts and actions');
  lifestyle.push('Practice regular cleaning and decluttering');
  lifestyle.push('Use natural materials and elements');
  
  // Time-based recommendations
  lifestyle.push('Morning: Use East/Northeast directions for prayer, meditation, and study');
  lifestyle.push('Afternoon: Southeast direction is ideal for cooking and work activities');
  lifestyle.push('Evening: West/Northwest directions are favorable for dining and socializing');
  lifestyle.push('Night: Southwest direction is best for sleep and rest');
  
  // Seasonal adjustments
  const currentMonth = new Date().getMonth() + 1;
  let currentSeason = 'spring';
  if ([12, 1, 2].includes(currentMonth)) currentSeason = 'winter';
  else if ([3, 4, 5].includes(currentMonth)) currentSeason = 'spring';
  else if ([6, 7, 8].includes(currentMonth)) currentSeason = 'summer';
  else currentSeason = 'monsoon';
  
  const seasonalData = SEASONAL_VASTU[currentSeason as keyof typeof SEASONAL_VASTU];
  if (seasonalData) {
    lifestyle.push(`Current season (${currentSeason}): Focus on ${seasonalData.focus}`);
    lifestyle.push(`Seasonal colors: ${seasonalData.colors.join(', ')}`);
    seasonalData.recommendations.forEach(rec => {
      lifestyle.push(`Seasonal tip: ${rec}`);
    });
  }
  
  if (userProfile) {
    lifestyle.push(`Aligning daily routine with lucky directions enhances cosmic harmony`);
  }
  
  return { structural, elemental, directional, lifestyle };
}

// Generate coaching insights with personalization
function generateCoachingInsights(
  directions: VastuDirection[],
  doshas: VastuDosha[],
  recommendations: VastuRecommendation[],
  userProfile?: UserProfile | null
): VastuReading['coaching'] {
  const userName = userProfile?.fullName || '';
  const personalized = userProfile ? calculatePersonalizedVastuDirections(userProfile) : null;
  const criticalIssues = doshas.filter(d => d.priority === 'high');
  const weakDirections = directions.filter(d => d.strength === 'weak');
  
  let currentFocus = userProfile ?
    `Focus on maintaining harmony and balance in the space, aligned with birth chart` :
    'Focus on maintaining harmony and balance in the space';
  let recommendations_list: string[] = [];
  let affirmations: string[] = [];
  let nextSteps: string[] = [];
  
  if (criticalIssues.length > 0) {
    currentFocus = userProfile ?
      `Address ${criticalIssues.length} critical Vastu issues for immediate improvement - birth chart indicates this is especially important` :
      `Address ${criticalIssues.length} critical Vastu issues for immediate improvement`;
  }
  
  if (weakDirections.length > 0) {
    recommendations_list.push(userProfile ?
      `Strengthen ${weakDirections.length} weak directions with appropriate remedies, prioritizing lucky directions: ${personalized?.bestDirections.join(', ') || 'north, east'}` :
      `Strengthen ${weakDirections.length} weak directions with appropriate remedies`);
  }
  
  if (personalized && personalized.bestDirections.length > 0) {
    recommendations_list.push(`Prioritize directions: ${personalized.bestDirections.join(', ')} which are auspicious based on birth chart`);
  }
  
  recommendations_list.push('Implement high-priority recommendations first');
  recommendations_list.push('Maintain cleanliness and organization');
  recommendations_list.push('Use appropriate colors and elements');
  
  affirmations.push(userProfile ?
    `The space is harmonious and supports well-being` :
    'The space is harmonious and supports well-being');
  affirmations.push('I attract positive energy and abundance');
  affirmations.push('I am creating a balanced and peaceful environment');
  
  nextSteps.push('Start with structural remedies');
  if (personalized && personalized.bestDirections.length > 0) {
    nextSteps.push(`Implement directional corrections focusing on: ${personalized.bestDirections.join(', ')}`);
  } else {
    nextSteps.push('Implement directional corrections');
  }
  nextSteps.push('Balance elements in the space');
  nextSteps.push('Maintain regular Vastu practices');
  
  return { currentFocus, recommendations: recommendations_list, affirmations, nextSteps };
}

// Main function to get intelligent Vastu data with personalization
export async function getIntelligentVastuData(
  userId: string,
  propertyType: 'residential' | 'commercial' | 'office',
  plotShape: 'square' | 'rectangular' | 'irregular',
  entranceDirection: string,
  rooms: { [key: string]: boolean },
  userProfile?: UserProfile | null
): Promise<VastuReading> {
  const db = getFirebaseDB();
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  const docRef = doc(db, 'users', userId, 'vastu-readings', 'current');
  
  try {
    // Check if we have cached data
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const cachedData = docSnap.data() as VastuReading;
      const lastUpdated = cachedData.metadata.lastUpdated;
      const lastUpdatedMs = lastUpdated instanceof Date ? lastUpdated.getTime() : (lastUpdated as { toDate(): Date }).toDate().getTime();
      const hoursSinceUpdate = (new Date().getTime() - lastUpdatedMs) / (1000 * 60 * 60);
      
      // Return cached data if less than 24 hours old
      if (hoursSinceUpdate < 24) {
        devLog.debug('Returning cached Vastu data for user:', userId);
        return cachedData;
      }
    }
  } catch (error) {
    devLog.warn('Error checking cached Vastu data:', error, 'vastuIntelligence');
  }
  
  // Calculate new Vastu analysis with personalization
  devLog.debug('Calculating new Vastu analysis for user:', userId, userProfile ? `(${userProfile.fullName})` : '');
  const {
    directions,
    roomAnalysis,
    doshas,
    energyFlows,
    recommendations,
    overallScore,
    mainEntranceAnalysis,
    personalizedInsights
  } = calculateVastuAnalysis(propertyType, plotShape, entranceDirection, rooms, userProfile);
  
  // Generate insights with personalization
  const personality = generatePersonalityInsights(directions, roomAnalysis, doshas, userProfile);
  const remedies = generateRemedies(directions, doshas, roomAnalysis, userProfile);
  const coaching = generateCoachingInsights(directions, doshas, recommendations, userProfile);
  
  // Create comprehensive reading
  const reading: VastuReading = {
    id: 'current',
    userId,
    timestamp: new Date(),
    propertyType,
    plotShape,
    entranceDirection,
    directions,
    rooms: roomAnalysis,
    doshas,
    energyFlows,
    recommendations,
    overallScore,
    ...(mainEntranceAnalysis ? { mainEntranceAnalysis } : {}),
    ...(personalizedInsights ? { personalizedInsights } : {}),
    personality,
    remedies,
    coaching,
    metadata: {
      calculationMethod: userProfile ?
        'Traditional Vastu Shastra with 32 Padas System + Personalized Recommendations' :
        'Traditional Vastu Shastra with 32 Padas System',
      system: 'Intelligent Vastu Guidance',
      lastUpdated: new Date(),
      isProfileBased: false, // This is a property-based analysis
      cacheVersion: CACHE_VERSION // Cache version for invalidating old cached data
    }
  };
  
  // Cache the data
  try {
    await setDoc(docRef, reading);
    devLog.debug('Cached Vastu data for user:', userId);
  } catch (error) {
    devLog.warn('Error caching Vastu data:', error, 'vastuIntelligence');
  }
  
  return reading;
}

// Profile-based Vastu report - generates report using ONLY user profile (no property details needed)
export async function getPersonalizedVastuReport(
  userId: string,
  userProfile: UserProfile | null
): Promise<VastuReading> {
  const db = getFirebaseDB();
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  // Check cache first - but force refresh if metadata doesn't have isProfileBased flag or cache version mismatch
  const docRef = doc(db, 'users', userId, 'vastu-readings', 'personalized');
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const cachedData = docSnap.data() as VastuReading;
      const cachedVersion = cachedData.metadata?.cacheVersion;
      
      // Force refresh if cached data doesn't have isProfileBased flag (legacy data) or cache version mismatch
      if (!cachedData.metadata?.isProfileBased) {
        devLog.debug('Cached data missing isProfileBased flag, forcing refresh for user:', userId);
      } else if (cachedVersion !== CACHE_VERSION) {
        devLog.debug(`Cache version mismatch (cached: ${cachedVersion}, current: ${CACHE_VERSION}), forcing refresh for user:`, userId);
      } else {
        const lastUpdated = cachedData.metadata.lastUpdated;
        const lastUpdatedMs = lastUpdated instanceof Date ? lastUpdated.getTime() : (lastUpdated as { toDate(): Date }).toDate().getTime();
        const hoursSinceUpdate = (new Date().getTime() - lastUpdatedMs) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate < 24) {
          devLog.debug('Returning cached personalized Vastu report for user:', userId);
          return cachedData;
        }
      }
    }
  } catch (error) {
    devLog.warn('Error checking cached personalized Vastu data:', error, 'vastuIntelligence');
  }
  
  // Get user's personalized directions
  const personalized = userProfile ? calculatePersonalizedVastuDirections(userProfile) : null;
  const userLuckyDirections = personalized?.bestDirections || ['north', 'east', 'northeast'];
  
  // Use user's best direction as default entrance direction
  // Map to cardinal direction if needed (main entrance analysis only accepts cardinal directions)
  const cardinalDirections = ['north', 'south', 'east', 'west'];
  const firstLuckyDirection = userLuckyDirections[0] || 'north';
  const defaultEntranceDirection = cardinalDirections.includes(firstLuckyDirection) 
    ? firstLuckyDirection 
    : userLuckyDirections.find(dir => cardinalDirections.includes(dir)) || 'north';
  
  // Default property values for profile-based report
  const defaultPropertyType: 'residential' | 'commercial' | 'office' = 'residential';
  const defaultPlotShape: 'square' | 'rectangular' | 'irregular' = 'rectangular';
  
  // Default rooms - include common rooms for comprehensive report
  const defaultRooms: { [key: string]: boolean } = {
    bedroom: true,
    kitchen: true,
    bathroom: true,
    livingRoom: true,
    prayer: true,
    study: true,
    dining: true,
    storage: true
  };
  
  devLog.debug('Generating personalized Vastu report for user:', userId, userProfile ? `(${userProfile.fullName})` : '');
  devLog.debug('Using best direction:', defaultEntranceDirection);
  
  // Generate analysis using defaults and user profile
  const {
    directions,
    roomAnalysis,
    doshas,
    energyFlows,
    recommendations,
    overallScore,
    mainEntranceAnalysis,
    personalizedInsights
  } = calculateVastuAnalysis(
    defaultPropertyType,
    defaultPlotShape,
    defaultEntranceDirection,
    defaultRooms,
    userProfile,
    true // isProfileBased - no actual property data, just recommendations
  );
  
  // Generate insights with personalization
  const personality = generatePersonalityInsights(directions, roomAnalysis, doshas, userProfile);
  const remedies = generateRemedies(directions, doshas, roomAnalysis, userProfile);
  const coaching = generateCoachingInsights(directions, doshas, recommendations, userProfile);
  
  // Create comprehensive personalized reading
  const reading: VastuReading = {
    id: 'personalized',
    userId,
    timestamp: new Date(),
    propertyType: defaultPropertyType,
    plotShape: defaultPlotShape,
    entranceDirection: defaultEntranceDirection,
    directions,
    rooms: roomAnalysis,
    doshas,
    energyFlows,
    recommendations,
    overallScore,
    ...(mainEntranceAnalysis ? { mainEntranceAnalysis } : {}),
    ...(personalizedInsights ? { personalizedInsights } : {}),
    personality,
    remedies,
    coaching,
    metadata: {
      calculationMethod: userProfile ? 
        'Personalized Vastu Recommendations - Profile-Based Guidance with 32 Padas System' :
        'General Vastu Recommendations - 32 Padas System',
      system: 'Intelligent Personalized Vastu Guidance',
      lastUpdated: new Date(),
      isProfileBased: true, // This is a profile-based recommendation, not a property analysis
      cacheVersion: CACHE_VERSION // Cache version for invalidating old cached data
    }
  };
  
  // Cache the personalized report
  try {
    await setDoc(docRef, reading);
    devLog.debug('Cached personalized Vastu report for user:', userId);
  } catch (error) {
    devLog.warn('Error caching personalized Vastu report:', error, 'vastuIntelligence');
  }
  
  return reading;
}

// Function to clear Vastu data cache
export async function clearVastuDataCache(userId: string): Promise<void> {
  const db = getFirebaseDB();
  if (!db) return;
  
  const docRef = doc(db, 'users', userId, 'vastu-readings', 'current');
  
  try {
    await setDoc(docRef, {});
    devLog.debug('Cleared Vastu data cache for user:', userId);
  } catch (error) {
    devLog.warn('Error clearing Vastu data cache:', error, 'vastuIntelligence');
  }
} 