// Vastu Aaya/Aayushya Calculations
// Based on traditional Vastu Shastra calculations for property auspiciousness
// References: SaathvikNS/_Vaasthu_AayaVarga and traditional Vastu texts

import { UserProfile } from './firebase';

export interface AayaCalculation {
  aaya: number; // Income/Wealth factor (1-8)
  aayushya: number; // Longevity factor (1-8)
  dhana: number; // Wealth accumulation (1-8)
  runa: number; // Debt factor (1-8)
  overallScore: number; // Combined auspiciousness score (0-100)
  interpretation: string;
  recommendations: string[];
}

export interface PropertyAayaData {
  propertyType: 'residential' | 'commercial' | 'office';
  plotShape: 'square' | 'rectangular' | 'irregular';
  entranceDirection: string;
  totalRooms: number;
  floors: number;
}

// Calculate Aaya (Income/Wealth factor) based on property characteristics
function calculateAaya(propertyData: PropertyAayaData, userProfile?: UserProfile | null): number {
  let aaya = 5; // Base score
  
  // Property type influence
  if (propertyData.propertyType === 'residential') aaya += 1;
  else if (propertyData.propertyType === 'commercial') aaya += 2;
  else if (propertyData.propertyType === 'office') aaya += 1.5;
  
  // Plot shape influence
  if (propertyData.plotShape === 'square') aaya += 2;
  else if (propertyData.plotShape === 'rectangular') aaya += 1;
  else aaya -= 1; // Irregular shapes reduce Aaya
  
  // Entrance direction influence
  const auspiciousDirections = ['north', 'east', 'northeast'];
  const moderateDirections = ['northwest', 'west'];
  if (auspiciousDirections.includes(propertyData.entranceDirection.toLowerCase())) {
    aaya += 2;
  } else if (moderateDirections.includes(propertyData.entranceDirection.toLowerCase())) {
    aaya += 0.5;
  } else {
    aaya -= 1;
  }
  
  // Numerology influence from birth date
  if (userProfile?.birthDate) {
    const birthNumber = calculateBirthNumber(userProfile.birthDate);
    // Numbers 1, 3, 5, 6, 8 are favorable for wealth
    if ([1, 3, 5, 6, 8].includes(birthNumber)) {
      aaya += 0.5;
    }
  }
  
  // Clamp between 1 and 8
  return Math.max(1, Math.min(8, Math.round(aaya * 10) / 10));
}

// Calculate Aayushya (Longevity factor)
function calculateAayushya(propertyData: PropertyAayaData, userProfile?: UserProfile | null): number {
  let aayushya = 5; // Base score
  
  // Square plots are best for longevity
  if (propertyData.plotShape === 'square') aayushya += 2;
  else if (propertyData.plotShape === 'rectangular') aayushya += 1;
  else aayushya -= 1.5;
  
  // Northeast direction is most auspicious for longevity
  if (propertyData.entranceDirection.toLowerCase() === 'northeast') {
    aayushya += 2;
  } else if (['north', 'east'].includes(propertyData.entranceDirection.toLowerCase())) {
    aayushya += 1;
  } else if (['south', 'southwest'].includes(propertyData.entranceDirection.toLowerCase())) {
    aayushya -= 1.5;
  }
  
  // Residential properties are better for longevity
  if (propertyData.propertyType === 'residential') aayushya += 1;
  
  // Birth time influence (morning birth times are favorable)
  if (userProfile?.birthTime) {
    const [hours] = userProfile.birthTime.split(':').map(Number);
    if (hours >= 5 && hours < 9) { // Early morning
      aayushya += 0.5;
    }
  }
  
  // Clamp between 1 and 8
  return Math.max(1, Math.min(8, Math.round(aayushya * 10) / 10));
}

// Calculate Dhana (Wealth accumulation)
function calculateDhana(propertyData: PropertyAayaData, userProfile?: UserProfile | null): number {
  let dhana = 5; // Base score
  
  // North direction is best for wealth
  if (propertyData.entranceDirection.toLowerCase() === 'north') {
    dhana += 2.5;
  } else if (propertyData.entranceDirection.toLowerCase() === 'northeast') {
    dhana += 2;
  } else if (propertyData.entranceDirection.toLowerCase() === 'east') {
    dhana += 1.5;
  } else if (['south', 'southwest'].includes(propertyData.entranceDirection.toLowerCase())) {
    dhana -= 1.5;
  }
  
  // Commercial properties have higher wealth potential
  if (propertyData.propertyType === 'commercial') dhana += 1.5;
  else if (propertyData.propertyType === 'office') dhana += 1;
  
  // Square plots are better for wealth accumulation
  if (propertyData.plotShape === 'square') dhana += 1;
  else if (propertyData.plotShape === 'irregular') dhana -= 1;
  
  // Numerology influence
  if (userProfile?.birthDate) {
    const birthNumber = calculateBirthNumber(userProfile.birthDate);
    // Numbers 1, 5, 6, 8 are very favorable for wealth
    if ([1, 5, 6, 8].includes(birthNumber)) {
      dhana += 1;
    } else if ([2, 4, 7].includes(birthNumber)) {
      dhana -= 0.5;
    }
  }
  
  // Clamp between 1 and 8
  return Math.max(1, Math.min(8, Math.round(dhana * 10) / 10));
}

// Calculate Runa (Debt factor) - lower is better
function calculateRuna(propertyData: PropertyAayaData, userProfile?: UserProfile | null): number {
  let runa = 5; // Base score (lower is better)
  
  // Southwest direction increases debt
  if (propertyData.entranceDirection.toLowerCase() === 'southwest') {
    runa += 2;
  } else if (propertyData.entranceDirection.toLowerCase() === 'south') {
    runa += 1.5;
  } else if (['north', 'northeast', 'east'].includes(propertyData.entranceDirection.toLowerCase())) {
    runa -= 1.5;
  }
  
  // Irregular plots increase debt risk
  if (propertyData.plotShape === 'irregular') runa += 1.5;
  else if (propertyData.plotShape === 'square') runa -= 1;
  
  // Commercial properties may have higher debt risk
  if (propertyData.propertyType === 'commercial') runa += 0.5;
  
  // Numerology influence
  if (userProfile?.birthDate) {
    const birthNumber = calculateBirthNumber(userProfile.birthDate);
    // Numbers 4, 7, 8 can indicate debt challenges
    if ([4, 7].includes(birthNumber)) {
      runa += 0.5;
    } else if ([1, 3, 5, 6].includes(birthNumber)) {
      runa -= 0.5;
    }
  }
  
  // Clamp between 1 and 8 (lower is better, so we want to minimize this)
  return Math.max(1, Math.min(8, Math.round(runa * 10) / 10));
}

// Calculate birth number from date
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

// Generate interpretation and recommendations
function generateAayaInterpretation(calculation: AayaCalculation, propertyData: PropertyAayaData): {
  interpretation: string;
  recommendations: string[];
} {
  const { aaya, aayushya, dhana, runa, overallScore } = calculation;
  
  let interpretation = '';
  const recommendations: string[] = [];
  
  // Overall interpretation
  if (overallScore >= 75) {
    interpretation = 'Property shows excellent auspiciousness with strong potential for wealth, health, and prosperity.';
  } else if (overallScore >= 60) {
    interpretation = 'Property is generally auspicious with good potential. Minor adjustments may enhance benefits.';
  } else if (overallScore >= 45) {
    interpretation = 'Property has moderate auspiciousness. Some remedies and adjustments are recommended.';
  } else {
    interpretation = 'Property requires significant Vastu remedies to improve auspiciousness and avoid challenges.';
  }
  
  // Aaya-specific recommendations
  if (aaya >= 6) {
    recommendations.push('Strong income potential - maintain positive energy flow in northeast direction');
  } else if (aaya < 4) {
    recommendations.push('Enhance income potential by strengthening north and northeast directions with water elements');
  }
  
  // Aayushya-specific recommendations
  if (aayushya >= 6) {
    recommendations.push('Excellent longevity factors - keep center (Brahmasthan) open and clean');
  } else if (aayushya < 4) {
    recommendations.push('Improve longevity by ensuring proper ventilation and avoiding heavy structures in center');
  }
  
  // Dhana-specific recommendations
  if (dhana >= 6) {
    recommendations.push('Strong wealth accumulation potential - maintain clean and organized spaces');
  } else if (dhana < 4) {
    recommendations.push('Enhance wealth by placing wealth symbols in north direction and keeping it clean');
  }
  
  // Runa-specific recommendations
  if (runa >= 6) {
    recommendations.push('High debt risk - strengthen southwest direction and avoid loans during inauspicious periods');
    recommendations.push('Use remedies like placing heavy objects in southwest and keeping it higher than northeast');
  } else if (runa <= 3) {
    recommendations.push('Low debt risk - maintain current Vastu compliance to preserve financial stability');
  }
  
  // Direction-specific recommendations
  if (!['north', 'east', 'northeast'].includes(propertyData.entranceDirection.toLowerCase())) {
    recommendations.push(`Consider remedies for ${propertyData.entranceDirection} facing entrance to improve overall auspiciousness`);
  }
  
  // Shape-specific recommendations
  if (propertyData.plotShape === 'irregular') {
    recommendations.push('Irregular plot shape reduces auspiciousness - consider Vastu remedies to balance energy');
    recommendations.push('Use plants, mirrors, or architectural adjustments to create visual balance');
  }
  
  return { interpretation, recommendations };
}

// Main function to calculate Aaya/Aayushya
export function calculateAayaAayushya(
  propertyData: PropertyAayaData,
  userProfile?: UserProfile | null
): AayaCalculation {
  const aaya = calculateAaya(propertyData, userProfile);
  const aayushya = calculateAayushya(propertyData, userProfile);
  const dhana = calculateDhana(propertyData, userProfile);
  const runa = calculateRuna(propertyData, userProfile);
  
  // Calculate overall score (0-100)
  // Higher Aaya, Aayushya, Dhana = better, Lower Runa = better
  const overallScore = Math.round(
    ((aaya / 8) * 25) + 
    ((aayushya / 8) * 25) + 
    ((dhana / 8) * 25) + 
    (((8 - runa) / 8) * 25)
  );
  
  const calculation: AayaCalculation = {
    aaya,
    aayushya,
    dhana,
    runa,
    overallScore,
    interpretation: '',
    recommendations: []
  };
  
  const { interpretation, recommendations } = generateAayaInterpretation(calculation, propertyData);
  calculation.interpretation = interpretation;
  calculation.recommendations = recommendations;
  
  return calculation;
}

