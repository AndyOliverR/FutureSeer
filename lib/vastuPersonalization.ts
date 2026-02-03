// Vastu Personalization based on User Profile
// Calculates best directions based on birth details, numerology, and astrological data

import { UserProfile } from './firebase';

export interface PersonalizedVastuDirections {
  bestDirections: string[];
  avoidDirections: string[];
  luckyElements: string[];
  recommendedColors: string[];
  personalizedNotes: string[];
}

// Calculate numerology number from birth date
function calculateBirthNumber(birthDate: string): number {
  if (!birthDate) return 0;
  
  const date = new Date(birthDate);
  const day = date.getDate();
  
  // Reduce to single digit
  let num = day;
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  
  return num;
}

// Get direction based on numerology
function getDirectionFromNumerology(number: number): string[] {
  const directionMap: Record<number, string[]> = {
    1: ['north', 'northeast'], // Sun - Leadership
    2: ['southwest', 'west'], // Moon - Stability
    3: ['east', 'northeast'], // Jupiter - Growth
    4: ['south', 'southeast'], // Rahu - Transformation
    5: ['northeast', 'north'], // Mercury - Communication
    6: ['northwest', 'west'], // Venus - Relationships
    7: ['southwest', 'south'], // Ketu - Spirituality
    8: ['south', 'southeast'], // Saturn - Discipline
    9: ['east', 'southeast'] // Mars - Energy
  };
  
  return directionMap[number] || ['north', 'east'];
}

// Get element from birth date
function getElementFromBirthDate(birthDate: string): string {
  if (!birthDate) return 'Earth';
  
  const date = new Date(birthDate);
  const month = date.getMonth() + 1; // 1-12
  
  // Element mapping by month
  if ([12, 1, 2].includes(month)) return 'Water'; // Winter
  if ([3, 4, 5].includes(month)) return 'Fire'; // Spring
  if ([6, 7, 8].includes(month)) return 'Air'; // Summer
  return 'Earth'; // Fall
}

// Get direction from birth time
function getDirectionFromBirthTime(birthTime?: string): string | null {
  if (!birthTime) return null;
  
  const [hours, minutes] = birthTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Map time to direction (rough approximation)
  if (totalMinutes >= 300 && totalMinutes < 540) return 'east'; // 5 AM - 9 AM
  if (totalMinutes >= 540 && totalMinutes < 720) return 'northeast'; // 9 AM - 12 PM
  if (totalMinutes >= 720 && totalMinutes < 900) return 'south'; // 12 PM - 3 PM
  if (totalMinutes >= 900 && totalMinutes < 1080) return 'southwest'; // 3 PM - 6 PM
  if (totalMinutes >= 1080 && totalMinutes < 1260) return 'west'; // 6 PM - 9 PM
  if (totalMinutes >= 1260 || totalMinutes < 300) return 'north'; // 9 PM - 5 AM
  
  return null;
}

// Get colors based on element
function getColorsFromElement(element: string): string[] {
  const colorMap: Record<string, string[]> = {
    'Water': ['Blue', 'Black', 'Navy', 'White'],
    'Fire': ['Red', 'Orange', 'Pink', 'Coral'],
    'Air': ['Green', 'Yellow', 'Light Blue', 'White'],
    'Earth': ['Yellow', 'Brown', 'Beige', 'Orange']
  };
  
  return colorMap[element] || ['White', 'Light colors'];
}

// Calculate personalized Vastu directions
export function calculatePersonalizedVastuDirections(
  userProfile: UserProfile | null
): PersonalizedVastuDirections {
  if (!userProfile) {
    return {
      bestDirections: ['north', 'east', 'northeast'],
      avoidDirections: ['south', 'southwest'],
      luckyElements: ['Water', 'Air'],
      recommendedColors: ['Blue', 'Green', 'White'],
      personalizedNotes: ['Complete profile for personalized recommendations']
    };
  }
  
  const bestDirections: string[] = [];
  const avoidDirections: string[] = [];
  const luckyElements: string[] = [];
  const personalizedNotes: string[] = [];
  
  // Calculate from birth date numerology
  if (userProfile.birthDate) {
    const birthNumber = calculateBirthNumber(userProfile.birthDate);
    const numerologyDirections = getDirectionFromNumerology(birthNumber);
    bestDirections.push(...numerologyDirections);
    
    const element = getElementFromBirthDate(userProfile.birthDate);
    luckyElements.push(element);
    
    personalizedNotes.push(`Based on birth date (Number ${birthNumber}), ${element} element is favorable`);
  }
  
  // Add direction from birth time
  if (userProfile.birthTime) {
    const timeDirection = getDirectionFromBirthTime(userProfile.birthTime);
    if (timeDirection && !bestDirections.includes(timeDirection)) {
      bestDirections.push(timeDirection);
      personalizedNotes.push(`Birth time suggests ${timeDirection} direction is auspicious`);
    }
  }
  
  // Default auspicious directions if none calculated
  if (bestDirections.length === 0) {
    bestDirections.push('north', 'east', 'northeast');
  }
  
  // Always avoid worst directions
  avoidDirections.push('south', 'southwest');
  
  // Get colors from elements
  const recommendedColors: string[] = [];
  luckyElements.forEach(element => {
    recommendedColors.push(...getColorsFromElement(element));
  });
  
  // Remove duplicates
  const uniqueDirections = [...new Set(bestDirections)];
  const uniqueColors = [...new Set(recommendedColors)];
  
  // Add personalized greeting
  if (userProfile.fullName) {
    personalizedNotes.unshift(`Welcome ${userProfile.fullName}! Personalized Vastu recommendations are ready.`);
  }
  
  return {
    bestDirections: uniqueDirections,
    avoidDirections: [...new Set(avoidDirections)],
    luckyElements: [...new Set(luckyElements)],
    recommendedColors: uniqueColors.length > 0 ? uniqueColors : ['Blue', 'Green', 'White'],
    personalizedNotes
  };
}

// Match user's astrological elements with Vastu elements
export function matchAstrologicalElements(
  userProfile: UserProfile | null,
  vastuElement: string
): {
  compatible: boolean;
  matchScore: number;
  recommendations: string[];
} {
  if (!userProfile || !userProfile.birthDate) {
    return {
      compatible: true,
      matchScore: 50,
      recommendations: ['Complete profile for better matching']
    };
  }
  
  const userElement = getElementFromBirthDate(userProfile.birthDate);
  
  // Element compatibility matrix
  const compatibility: Record<string, Record<string, number>> = {
    'Water': {
      'Water': 100,
      'Air': 80,
      'Earth': 60,
      'Fire': 40
    },
    'Fire': {
      'Fire': 100,
      'Air': 90,
      'Earth': 70,
      'Water': 30
    },
    'Air': {
      'Air': 100,
      'Fire': 90,
      'Water': 80,
      'Earth': 60
    },
    'Earth': {
      'Earth': 100,
      'Fire': 70,
      'Water': 60,
      'Air': 50
    }
  };
  
  const matchScore = compatibility[userElement]?.[vastuElement] || 50;
  const compatible = matchScore >= 60;
  
  const recommendations: string[] = [];
  if (compatible) {
    recommendations.push(`${userElement} element is compatible with ${vastuElement} direction`);
    recommendations.push(`This direction will enhance natural energy`);
  } else {
    recommendations.push(`${userElement} element may conflict with ${vastuElement} direction`);
    recommendations.push(`Consider using balancing elements or remedies`);
  }
  
  return {
    compatible,
    matchScore,
    recommendations
  };
}

// Get Nakshatra-based room recommendations
function getNakshatraRoomRecommendations(nakshatra: string, roomType: string): string[] {
  const recommendations: string[] = [];
  
  // Nakshatra to direction mapping for room placement
  const nakshatraDirections: Record<string, Record<string, string>> = {
    'Ashwini': { bedroom: 'northeast', kitchen: 'southeast', prayer: 'northeast' },
    'Bharani': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Krittika': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Rohini': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Mrigashira': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Ardra': { bedroom: 'west', kitchen: 'southeast', prayer: 'northeast' },
    'Punarvasu': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Pushya': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Ashlesha': { bedroom: 'west', kitchen: 'southeast', prayer: 'northeast' },
    'Magha': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Purva Phalguni': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Uttara Phalguni': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Hasta': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Chitra': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Swati': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Vishakha': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Anuradha': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Jyeshtha': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Mula': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Purva Ashadha': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Uttara Ashadha': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Shravana': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Dhanishta': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Shatabhisha': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Purva Bhadrapada': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Uttara Bhadrapada': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' },
    'Revati': { bedroom: 'southwest', kitchen: 'southeast', prayer: 'northeast' }
  };
  
  const nakshatraData = nakshatraDirections[nakshatra];
  if (nakshatraData && nakshatraData[roomType.toLowerCase()]) {
    recommendations.push(`${nakshatra} Nakshatra favors ${roomType} in ${nakshatraData[roomType.toLowerCase()]} direction`);
  }
  
  return recommendations;
}

// Get personalized room recommendations
export function getPersonalizedRoomRecommendations(
  userProfile: UserProfile | null,
  roomType: string
): string[] {
  const recommendations: string[] = [];
  
  if (!userProfile) {
    return recommendations;
  }
  
  const personalized = calculatePersonalizedVastuDirections(userProfile);
  
  // Add personalized notes based on user's lucky directions
  if (personalized.bestDirections.length > 0) {
    recommendations.push(`Consider aligning ${roomType} with lucky directions: ${personalized.bestDirections.join(', ')}`);
  }
  
  if (personalized.recommendedColors.length > 0) {
    recommendations.push(`Use colors: ${personalized.recommendedColors.slice(0, 3).join(', ')} for better harmony`);
  }
  
  // Add Nakshatra-based recommendations if available
  // Note: This would require getting Nakshatra from birth chart data
  // For now, we'll add a note that Nakshatra-based recommendations are available
  if (userProfile.birthDate && userProfile.birthTime) {
    recommendations.push(`Nakshatra-based room placement recommendations available based on birth chart`);
  }
  
  return recommendations;
}

// Get Nakshatra-based recommendations (requires Nakshatra from chart)
export function getNakshatraBasedRecommendations(
  nakshatra: string,
  userProfile: UserProfile | null
): {
  roomPlacements: Record<string, string>;
  colors: string[];
  directions: string[];
  recommendations: string[];
} {
  const roomPlacements: Record<string, string> = {};
  const colors: string[] = [];
  const directions: string[] = [];
  const recommendations: string[] = [];
  
  if (!nakshatra) {
    return { roomPlacements, colors, directions, recommendations };
  }
  
  // Nakshatra to favorable directions
  const nakshatraDirectionMap: Record<string, string[]> = {
    'Ashwini': ['northeast', 'east'],
    'Bharani': ['southwest', 'west'],
    'Krittika': ['southeast', 'east'],
    'Rohini': ['southwest', 'west'],
    'Mrigashira': ['southwest', 'west'],
    'Ardra': ['west', 'northwest'],
    'Punarvasu': ['northeast', 'north'],
    'Pushya': ['northeast', 'north'],
    'Ashlesha': ['west', 'northwest'],
    'Magha': ['south', 'southwest'],
    'Purva Phalguni': ['southwest', 'west'],
    'Uttara Phalguni': ['north', 'northeast'],
    'Hasta': ['northeast', 'east'],
    'Chitra': ['southeast', 'east'],
    'Swati': ['northeast', 'north'],
    'Vishakha': ['southeast', 'east'],
    'Anuradha': ['southwest', 'west'],
    'Jyeshtha': ['south', 'southwest'],
    'Mula': ['south', 'southwest'],
    'Purva Ashadha': ['southeast', 'east'],
    'Uttara Ashadha': ['north', 'northeast'],
    'Shravana': ['north', 'northeast'],
    'Dhanishta': ['southwest', 'west'],
    'Shatabhisha': ['north', 'northeast'],
    'Purva Bhadrapada': ['southwest', 'west'],
    'Uttara Bhadrapada': ['north', 'northeast'],
    'Revati': ['northeast', 'east']
  };
  
  const nakshatraDirections = nakshatraDirectionMap[nakshatra] || ['north', 'east', 'northeast'];
  directions.push(...nakshatraDirections);
  
  // Nakshatra-based room placements
  roomPlacements.bedroom = 'southwest'; // Default, can be customized per Nakshatra
  roomPlacements.kitchen = 'southeast';
  roomPlacements.prayer = 'northeast';
  
  // Nakshatra-based color recommendations
  const nakshatraColorMap: Record<string, string[]> = {
    'Ashwini': ['Red', 'Orange'],
    'Bharani': ['Red', 'Pink'],
    'Krittika': ['Red', 'Orange'],
    'Rohini': ['White', 'Cream'],
    'Mrigashira': ['Silver', 'White'],
    'Ardra': ['Green', 'Blue'],
    'Punarvasu': ['Yellow', 'Gold'],
    'Pushya': ['Yellow', 'Gold'],
    'Ashlesha': ['Blue', 'Black'],
    'Magha': ['Red', 'Orange'],
    'Purva Phalguni': ['Pink', 'Rose'],
    'Uttara Phalguni': ['Green', 'Yellow'],
    'Hasta': ['Yellow', 'Gold'],
    'Chitra': ['Pink', 'Red'],
    'Swati': ['Blue', 'Green'],
    'Vishakha': ['Red', 'Orange'],
    'Anuradha': ['Red', 'Pink'],
    'Jyeshtha': ['Red', 'Orange'],
    'Mula': ['Red', 'Orange'],
    'Purva Ashadha': ['Blue', 'Green'],
    'Uttara Ashadha': ['Yellow', 'Gold'],
    'Shravana': ['Blue', 'Green'],
    'Dhanishta': ['Blue', 'Green'],
    'Shatabhisha': ['Blue', 'Green'],
    'Purva Bhadrapada': ['Blue', 'Green'],
    'Uttara Bhadrapada': ['Yellow', 'Gold'],
    'Revati': ['Yellow', 'Gold']
  };
  
  const nakshatraColors = nakshatraColorMap[nakshatra] || ['White', 'Light colors'];
  colors.push(...nakshatraColors);
  
  recommendations.push(`${nakshatra} Nakshatra favors directions: ${nakshatraDirections.join(', ')}`);
  recommendations.push(`Recommended colors for ${nakshatra}: ${nakshatraColors.join(', ')}`);
  
  return { roomPlacements, colors, directions, recommendations };
}

