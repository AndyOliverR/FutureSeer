// Chart Accuracy Validator
// Compares generated planetary positions with known astronomical data

export interface AstronomicalValidation {
  planet: string;
  generatedPosition: {
    sign: string;
    degree: number;
    longitude: number;
  };
  expectedPosition: {
    sign: string;
    degree: number;
    longitude: number;
  };
  accuracy: {
    degreeDifference: number;
    signMatch: boolean;
    accuracyScore: number; // 0-100
  };
  isValid: boolean;
}

export interface ChartAccuracyReport {
  overallAccuracy: number;
  planetValidations: AstronomicalValidation[];
  issues: string[];
  recommendations: string[];
  timestamp: Date;
}

// Known astronomical positions for validation dates
const KNOWN_POSITIONS = {
  // February 24, 1983 - 14:15 IST (Mysore, India)
  '1983-02-24-14:15': {
    Sun: { sign: 'Aquarius', degree: 11.6, longitude: 321.6 },
    Moon: { sign: 'Cancer', degree: 0.5, longitude: 90.5 },
    Mars: { sign: 'Pisces', degree: 5.9, longitude: 335.9 },
    Mercury: { sign: 'Capricorn', degree: 19.7, longitude: 289.7 },
    Jupiter: { sign: 'Scorpio', degree: 15.8, longitude: 225.8 },
    Venus: { sign: 'Pisces', degree: 8.2, longitude: 338.2 },
    Saturn: { sign: 'Libra', degree: 10.7, longitude: 190.7, retrograde: true },
    Rahu: { sign: 'Gemini', degree: 7.4, longitude: 67.4, retrograde: true },
    Ketu: { sign: 'Sagittarius', degree: 7.4, longitude: 247.4, retrograde: true },
    Uranus: { sign: 'Scorpio', degree: 15.3, longitude: 225.3 },
    Neptune: { sign: 'Sagittarius', degree: 5.3, longitude: 245.3 },
    Pluto: { sign: 'Libra', degree: 5.7, longitude: 185.7, retrograde: true }
  }
};

export function validateChartAccuracy(
  generatedPlanets: any[],
  birthDate: string,
  birthTime: string
): ChartAccuracyReport {
  const dateKey = `${birthDate}-${birthTime}`;
  const knownPositions = KNOWN_POSITIONS[dateKey as keyof typeof KNOWN_POSITIONS];
  
  if (!knownPositions) {
    return {
      overallAccuracy: 0,
      planetValidations: [],
      issues: ['No known astronomical data available for this date/time'],
      recommendations: ['Add astronomical data for this date to validation database'],
      timestamp: new Date()
    };
  }

  const validations: AstronomicalValidation[] = [];
  const issues: string[] = [];
  let totalAccuracy = 0;
  let validPlanets = 0;

  generatedPlanets.forEach(planet => {
    const known = knownPositions[planet.name as keyof typeof knownPositions];
    
    if (!known) {
      issues.push(`No known position for planet: ${planet.name}`);
      return;
    }

    const generatedLongitude = planet.longitude || (planet.sign ? getLongitudeFromSign(planet.sign, planet.degree) : 0);
    const degreeDifference = Math.abs(generatedLongitude - known.longitude);
    const signMatch = planet.sign === known.sign;
    
    // Calculate accuracy score (0-100)
    let accuracyScore = 100;
    if (degreeDifference > 30) accuracyScore = 0;
    else if (degreeDifference > 15) accuracyScore = 50;
    else if (degreeDifference > 5) accuracyScore = 75;
    else if (degreeDifference > 1) accuracyScore = 90;
    
    if (!signMatch) accuracyScore = Math.max(0, accuracyScore - 50);

    const validation: AstronomicalValidation = {
      planet: planet.name,
      generatedPosition: {
        sign: planet.sign,
        degree: planet.degree,
        longitude: generatedLongitude
      },
      expectedPosition: {
        sign: known.sign,
        degree: known.degree,
        longitude: known.longitude
      },
      accuracy: {
        degreeDifference,
        signMatch,
        accuracyScore
      },
      isValid: accuracyScore >= 80
    };

    validations.push(validation);
    
    if (validation.isValid) {
      totalAccuracy += accuracyScore;
      validPlanets++;
    } else {
      issues.push(`${planet.name}: Sign mismatch (${planet.sign} vs ${known.sign}) or degree difference too large (${degreeDifference.toFixed(1)}°)`);
    }
  });

  const overallAccuracy = validPlanets > 0 ? totalAccuracy / validPlanets : 0;

  const recommendations: string[] = [];
  if (overallAccuracy < 80) {
    recommendations.push('Chart accuracy is below acceptable threshold - review calculation methods');
  }
  if (validations.some(v => !v.accuracy.signMatch)) {
    recommendations.push('Some planetary signs do not match expected positions - verify zodiac calculations');
  }
  if (overallAccuracy >= 90) {
    recommendations.push('Chart accuracy is excellent - calculations are working correctly');
  }

  return {
    overallAccuracy,
    planetValidations: validations,
    issues,
    recommendations,
    timestamp: new Date()
  };
}

function getLongitudeFromSign(sign: string, degree: number): number {
  const signLongitudes = {
    'Aries': 0, 'Taurus': 30, 'Gemini': 60, 'Cancer': 90,
    'Leo': 120, 'Virgo': 150, 'Libra': 180, 'Scorpio': 210,
    'Sagittarius': 240, 'Capricorn': 270, 'Aquarius': 300, 'Pisces': 330
  };
  return (signLongitudes[sign as keyof typeof signLongitudes] || 0) + degree;
}

// Export validation function for use in API routes
export async function validateVedicChartAccuracy(vedicData: any, birthDate: string, birthTime: string): Promise<ChartAccuracyReport> {
  const planets = vedicData?.rasiChart?.planets || vedicData?.objects || [];
  return validateChartAccuracy(planets, birthDate, birthTime);
}
