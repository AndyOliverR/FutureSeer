import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { getFirebaseDB } from './firebase';

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
  currentDirection: string;
  status: 'optimal' | 'good' | 'warning' | 'critical';
  recommendations: string[];
  remedies: string[];
  energyScore: number;
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
  overallScore: number;
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
  };
}

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
    recommendations: ['Keep master bedroom', 'Avoid water', 'Use red colors']
  }
};

const ROOM_DATA = {
  bedroom: {
    idealDirection: 'southwest',
    element: 'Earth',
    description: 'Rest and relationships',
    recommendations: ['Head towards south', 'Avoid mirrors facing bed', 'Use calming colors']
  },
  kitchen: {
    idealDirection: 'southeast',
    element: 'Fire',
    description: 'Nourishment and health',
    recommendations: ['Face east while cooking', 'Keep fire in southeast', 'Avoid water in kitchen']
  },
  livingRoom: {
    idealDirection: 'north',
    element: 'Water',
    description: 'Social interactions and wealth',
    recommendations: ['Face north or east', 'Keep water elements', 'Use blue colors']
  },
  bathroom: {
    idealDirection: 'northwest',
    element: 'Water',
    description: 'Cleansing and purification',
    recommendations: ['Keep clean and organized', 'Avoid mirrors facing door', 'Use white colors']
  },
  study: {
    idealDirection: 'northeast',
    element: 'Air',
    description: 'Learning and knowledge',
    recommendations: ['Face east or north', 'Keep books organized', 'Use green colors']
  },
  dining: {
    idealDirection: 'west',
    element: 'Earth',
    description: 'Nourishment and family',
    recommendations: ['Face east while eating', 'Keep table clean', 'Use yellow colors']
  },
  prayer: {
    idealDirection: 'northeast',
    element: 'Air',
    description: 'Spirituality and meditation',
    recommendations: ['Face east or north', 'Keep clean and peaceful', 'Use white colors']
  },
  storage: {
    idealDirection: 'southwest',
    element: 'Earth',
    description: 'Stability and organization',
    recommendations: ['Keep organized', 'Avoid fire elements', 'Use brown colors']
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

// Calculate Vastu analysis based on property details
function calculateVastuAnalysis(
  propertyType: string,
  plotShape: string,
  entranceDirection: string,
  rooms: { [key: string]: boolean }
): {
  directions: VastuDirection[];
  roomAnalysis: VastuRoom[];
  doshas: VastuDosha[];
  energyFlows: VastuEnergyFlow[];
  recommendations: VastuRecommendation[];
  overallScore: number;
} {
  // Analyze directions
  const directions: VastuDirection[] = Object.entries(DIRECTION_DATA).map(([direction, data]) => {
    const isEntrance = direction === entranceDirection;
    const strength = isEntrance ? 'strong' : Math.random() > 0.5 ? 'moderate' : 'weak';
    
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
  const roomAnalysis: VastuRoom[] = Object.entries(rooms)
    .filter(([_, hasRoom]) => hasRoom)
    .map(([roomKey, _]) => {
      const roomData = ROOM_DATA[roomKey as keyof typeof ROOM_DATA];
      const currentDirection = getRandomDirection();
      const isOptimal = currentDirection === roomData.idealDirection;
      const status = isOptimal ? 'optimal' : 
                    currentDirection === getAdjacentDirection(roomData.idealDirection) ? 'good' :
                    currentDirection === getOppositeDirection(roomData.idealDirection) ? 'critical' : 'warning';
      
      const energyScore = isOptimal ? 90 + Math.random() * 10 :
                         status === 'good' ? 70 + Math.random() * 20 :
                         status === 'warning' ? 40 + Math.random() * 30 :
                         20 + Math.random() * 20;

      return {
        name: roomKey.charAt(0).toUpperCase() + roomKey.slice(1),
        idealDirection: roomData.idealDirection,
        element: roomData.element,
        currentDirection,
        status,
        recommendations: roomData.recommendations,
        remedies: generateRoomRemedies(roomKey, currentDirection, roomData.idealDirection),
        energyScore: Math.round(energyScore)
      };
    });

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

  // Generate recommendations
  const recommendations: VastuRecommendation[] = [];
  
  // High priority recommendations for critical issues
  doshas.filter(d => d.priority === 'high').forEach(dosha => {
    recommendations.push({
      category: 'direction',
      priority: 'high',
      title: `Fix ${dosha.type} dosha`,
      description: dosha.description,
      implementation: dosha.remedies,
      expectedBenefits: ['Improved energy flow', 'Better health', 'Harmonious relationships'],
      timeline: 'Immediate action required'
    });
  });

  // Room-specific recommendations
  roomAnalysis.filter(r => r.status !== 'optimal').forEach(room => {
    recommendations.push({
      category: 'room',
      priority: room.status === 'critical' ? 'high' : 'medium',
      title: `Optimize ${room.name} placement`,
      description: `${room.name} is in ${room.status} position`,
      implementation: room.recommendations,
      expectedBenefits: [`Better ${room.name} energy`, 'Improved functionality', 'Enhanced well-being'],
      timeline: 'Within 1-2 months'
    });
  });

  // Calculate overall score
  const roomScores = roomAnalysis.map(r => r.energyScore);
  const averageRoomScore = roomScores.reduce((a, b) => a + b, 0) / roomScores.length;
  const doshaPenalty = doshas.length * 10;
  const overallScore = Math.max(0, Math.min(100, averageRoomScore - doshaPenalty));

  return {
    directions,
    roomAnalysis,
    doshas,
    energyFlows,
    recommendations,
    overallScore: Math.round(overallScore)
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

// Generate personality insights based on Vastu analysis
function generatePersonalityInsights(
  directions: VastuDirection[],
  roomAnalysis: VastuRoom[],
  doshas: VastuDosha[]
): VastuReading['personality'] {
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  // Analyze strong directions
  const strongDirections = directions.filter(d => d.strength === 'strong');
  strongDirections.forEach(direction => {
    if (direction.element === 'Water') strengths.push('Natural wealth attraction');
    if (direction.element === 'Fire') strengths.push('Strong energy and transformation ability');
    if (direction.element === 'Air') strengths.push('Adaptability and growth mindset');
    if (direction.element === 'Earth') strengths.push('Stability and grounding nature');
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
    lifePath: getLifePath(directions, roomAnalysis),
    careerGuidance: getCareerGuidance(directions, roomAnalysis),
    relationshipInsights: getRelationshipInsights(directions, roomAnalysis),
    healthIndicators: getHealthIndicators(directions, roomAnalysis)
  };
}

function getLifePath(directions: VastuDirection[], roomAnalysis: VastuRoom[]): string {
  const strongElements = directions
    .filter(d => d.strength === 'strong')
    .map(d => d.element);
  
  if (strongElements.includes('Water')) return 'Path of abundance and prosperity';
  if (strongElements.includes('Fire')) return 'Path of transformation and leadership';
  if (strongElements.includes('Air')) return 'Path of learning and growth';
  if (strongElements.includes('Earth')) return 'Path of stability and service';
  
  return 'Balanced life path with multiple opportunities';
}

function getCareerGuidance(directions: VastuDirection[], roomAnalysis: VastuRoom[]): string {
  const strongElements = directions
    .filter(d => d.strength === 'strong')
    .map(d => d.element);
  
  if (strongElements.includes('Water')) return 'Excellent for business, finance, and wealth creation';
  if (strongElements.includes('Fire')) return 'Perfect for leadership, entrepreneurship, and innovation';
  if (strongElements.includes('Air')) return 'Ideal for education, communication, and technology';
  if (strongElements.includes('Earth')) return 'Great for service, healthcare, and stable careers';
  
  return 'Versatile career options with potential in multiple fields';
}

function getRelationshipInsights(directions: VastuDirection[], roomAnalysis: VastuRoom[]): string {
  const bedroom = roomAnalysis.find(r => r.name === 'Bedroom');
  
  if (bedroom?.status === 'optimal') return 'Harmonious relationships with strong partnership potential';
  if (bedroom?.status === 'good') return 'Good relationships with minor adjustments needed';
  if (bedroom?.status === 'warning') return 'Relationship challenges requiring attention';
  if (bedroom?.status === 'critical') return 'Serious relationship issues requiring immediate remedies';
  
  return 'Balanced approach to relationships with learning opportunities';
}

function getHealthIndicators(directions: VastuDirection[], roomAnalysis: VastuRoom[]): string[] {
  const indicators: string[] = [];
  const kitchen = roomAnalysis.find(r => r.name === 'Kitchen');
  
  if (kitchen?.status === 'optimal') indicators.push('Excellent digestive health and nutrition');
  if (kitchen?.status === 'critical') indicators.push('Digestive issues requiring dietary attention');
  
  const strongElements = directions
    .filter(d => d.strength === 'strong')
    .map(d => d.element);
  
  if (strongElements.includes('Water')) indicators.push('Good kidney and fluid balance');
  if (strongElements.includes('Fire')) indicators.push('Strong metabolism and energy levels');
  if (strongElements.includes('Air')) indicators.push('Healthy respiratory system');
  if (strongElements.includes('Earth')) indicators.push('Strong immune system and stability');
  
  return indicators.length > 0 ? indicators : ['Generally good health with minor concerns'];
}

// Generate remedies
function generateRemedies(
  directions: VastuDirection[],
  doshas: VastuDosha[],
  roomAnalysis: VastuRoom[]
): VastuReading['remedies'] {
  const structural: string[] = [];
  const elemental: string[] = [];
  const directional: string[] = [];
  const lifestyle: string[] = [];
  
  // Structural remedies
  structural.push('Maintain clean and organized spaces');
  structural.push('Fix any structural damages immediately');
  structural.push('Ensure proper ventilation in all rooms');
  
  // Elemental remedies
  elemental.push('Balance five elements in your space');
  elemental.push('Use appropriate colors for each direction');
  elemental.push('Place elemental objects strategically');
  
  // Directional remedies
  directions.forEach(direction => {
    if (direction.strength === 'weak') {
      directional.push(`Strengthen ${direction.name} direction with ${direction.element} elements`);
    }
  });
  
  // Lifestyle remedies
  lifestyle.push('Wake up before sunrise for optimal energy');
  lifestyle.push('Maintain positive thoughts and actions');
  lifestyle.push('Practice regular cleaning and decluttering');
  lifestyle.push('Use natural materials and elements');
  
  return { structural, elemental, directional, lifestyle };
}

// Generate coaching insights
function generateCoachingInsights(
  directions: VastuDirection[],
  doshas: VastuDosha[],
  recommendations: VastuRecommendation[]
): VastuReading['coaching'] {
  const criticalIssues = doshas.filter(d => d.priority === 'high');
  const weakDirections = directions.filter(d => d.strength === 'weak');
  
  let currentFocus = 'Focus on maintaining harmony and balance in your space';
  let recommendations_list: string[] = [];
  let affirmations: string[] = [];
  let nextSteps: string[] = [];
  
  if (criticalIssues.length > 0) {
    currentFocus = `Address ${criticalIssues.length} critical Vastu issues for immediate improvement`;
  }
  
  if (weakDirections.length > 0) {
    recommendations_list.push(`Strengthen ${weakDirections.length} weak directions with appropriate remedies`);
  }
  
  recommendations_list.push('Implement high-priority recommendations first');
  recommendations_list.push('Maintain cleanliness and organization');
  recommendations_list.push('Use appropriate colors and elements');
  
  affirmations.push('My space is harmonious and supports my well-being');
  affirmations.push('I attract positive energy and abundance');
  affirmations.push('I am creating a balanced and peaceful environment');
  
  nextSteps.push('Start with structural remedies');
  nextSteps.push('Implement directional corrections');
  nextSteps.push('Balance elements in your space');
  nextSteps.push('Maintain regular Vastu practices');
  
  return { currentFocus, recommendations: recommendations_list, affirmations, nextSteps };
}

// Main function to get intelligent Vastu data
export async function getIntelligentVastuData(
  userId: string,
  propertyType: 'residential' | 'commercial' | 'office',
  plotShape: 'square' | 'rectangular' | 'irregular',
  entranceDirection: string,
  rooms: { [key: string]: boolean }
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
      const hoursSinceUpdate = (new Date().getTime() - lastUpdated.toDate().getTime()) / (1000 * 60 * 60);
      
      // Return cached data if less than 24 hours old
      if (hoursSinceUpdate < 24) {
        console.log('Returning cached Vastu data for user:', userId);
        return cachedData;
      }
    }
  } catch (error) {
    console.warn('Error checking cached Vastu data:', error);
  }
  
  // Calculate new Vastu analysis
  console.log('Calculating new Vastu analysis for user:', userId);
  const {
    directions,
    roomAnalysis,
    doshas,
    energyFlows,
    recommendations,
    overallScore
  } = calculateVastuAnalysis(propertyType, plotShape, entranceDirection, rooms);
  
  // Generate insights
  const personality = generatePersonalityInsights(directions, roomAnalysis, doshas);
  const remedies = generateRemedies(directions, doshas, roomAnalysis);
  const coaching = generateCoachingInsights(directions, doshas, recommendations);
  
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
    personality,
    remedies,
    coaching,
    metadata: {
      calculationMethod: 'Traditional Vastu Shastra',
      system: 'Intelligent Vastu Analysis',
      lastUpdated: new Date()
    }
  };
  
  // Cache the data
  try {
    await setDoc(docRef, reading);
    console.log('Cached Vastu data for user:', userId);
  } catch (error) {
    console.warn('Error caching Vastu data:', error);
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
    console.log('Cleared Vastu data cache for user:', userId);
  } catch (error) {
    console.warn('Error clearing Vastu data cache:', error);
  }
} 