// Enhanced Panchanga Calculator using astronomia-vedic data
// Provides accurate Panchanga calculations for both birth date and current date

import { getChart } from './astronomia-vedic';

export interface AccuratePanchangaData {
  tithi: { 
    number: number; 
    name: string; 
    paksha: string; 
    progress: number; 
    endTime: Date;
    significance: string;
  };
  nakshatra: { 
    number: number; 
    name: string; 
    lord: string; 
    progress: number; 
    endTime: Date;
    significance: string;
  };
  yoga: { 
    number: number; 
    name: string; 
    progress: number; 
    endTime: Date;
    significance: string;
  };
  karana: { 
    number: number; 
    name: string; 
    progress: number; 
    endTime: Date;
  };
  vara: { 
    number: number; 
    name: string; 
    lord: string;
  };
  sunrise: Date;
  sunset: Date;
  ayanamsa: number;
}

// Tithi names
const TITHI_NAMES = [
  'Purnima', 'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi',
  'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
];

// Nakshatra names
const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

// Yoga names
const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti'
];

// Karana names
const KARANA_NAMES = [
  'Kimstughna', 'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija',
  'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
];

// Vara (weekday) names
const VARA_NAMES = [
  'Ravivar', 'Somavar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'
];

// Vara lords
const VARA_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Nakshatra lords for Vimshottari
const NAKSHATRA_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

// Calculate Panchanga from existing chart data (birth date)
export function calculateAccuratePanchanga(chartData: any, birthData: any): AccuratePanchangaData | null {
  console.log('🔮 Calculating accurate Panchanga from chart data');
  
  // Add null check for defensive programming
  if (!chartData || !chartData.planets || !chartData.metadata) {
    console.error('❌ Invalid chart data for Panchanga calculation:', {
      chartData: !!chartData,
      hasPlanets: chartData?.planets ? 'yes' : 'no',
      hasMetadata: chartData?.metadata ? 'yes' : 'no',
      planetsType: typeof chartData?.planets,
      planetsKeys: chartData?.planets ? Object.keys(chartData.planets) : []
    });
    return null;
  }

  // Validate planets object has sun and moon
  if (!chartData.planets.sun && !chartData.planets.Sun) {
    console.error('❌ No Sun data in planets object');
    return null;
  }
  if (!chartData.planets.moon && !chartData.planets.Moon) {
    console.error('❌ No Moon data in planets object');
    return null;
  }
  
  const { planets, metadata } = chartData;
  
  // Extract Sun and Moon positions from accurate astronomia-vedic data
  // planets is an object with keys like {sun: {...}, moon: {...}}
  const sunLon = planets.sun?.lonSidereal || planets.Sun?.lonSidereal || 0;
  const moonLon = planets.moon?.lonSidereal || planets.Moon?.lonSidereal || 0;
  
  console.log('📊 Sun longitude:', sunLon);
  console.log('📊 Moon longitude:', moonLon);
  
  const tithi = calculateTithiFromLongitudes(sunLon, moonLon);
  const nakshatra = calculateNakshatraFromLongitude(moonLon);
  const yoga = calculateYogaFromLongitudes(sunLon, moonLon);
  const karana = calculateKaranaFromTithi(tithi);
  const vara = calculateVaraFromDate(birthData.birthDate);
  
  // Validate metadata has coordinates
  if (!metadata || typeof metadata.latitude !== 'number' || typeof metadata.longitude !== 'number') {
    console.error('❌ Missing or invalid coordinates in metadata:', {
      hasMetadata: !!metadata,
      latitude: metadata?.latitude,
      longitude: metadata?.longitude
    });
    return null;
  }
  
  console.log('✅ Valid metadata coordinates:', {
    latitude: metadata.latitude,
    longitude: metadata.longitude
  });
  
  // Get accurate sunrise/sunset from astronomia-vedic
  console.log('🔍 Sunrise/Sunset debug:', {
    sunrise: metadata.sunrise,
    sunriseType: typeof metadata.sunrise,
    sunriseJSON: JSON.stringify(metadata.sunrise),
    sunset: metadata.sunset,
    sunsetType: typeof metadata.sunset,
    sunsetJSON: JSON.stringify(metadata.sunset)
  });

  const { sunrise, sunset } = getAccurateSunriseSunset(
    birthData.birthDate,
    metadata.latitude,
    metadata.longitude
  );

  console.log('🔍 Raw sunrise/sunset from getAccurateSunriseSunset:', {
    sunrise,
    sunriseType: typeof sunrise,
    sunriseString: String(sunrise),
    sunset,
    sunsetType: typeof sunset,
    sunsetString: String(sunset)
  });

  // Use the Date objects directly - no parsing needed since getAccurateSunriseSunset returns Date objects
  const parsedSunrise = sunrise;
  const parsedSunset = sunset;
  
  console.log('🔍 Ayanamsha debug:', {
    metadataAyanamsha: metadata.ayanamsha,
    metadataAyanamshaType: typeof metadata.ayanamsha,
    metadataAyanamshaJSON: JSON.stringify(metadata.ayanamsha),
    chartDataAyanamsha: chartData.ayanamsha,
    chartDataAyanamshaJSON: JSON.stringify(chartData.ayanamsha)
  });

  const ayanamshaRaw = metadata.ayanamsha || chartData.ayanamsha;
  let ayanamsa: number;

  if (typeof ayanamshaRaw === 'number') {
    ayanamsa = ayanamshaRaw;
  } else if (typeof ayanamshaRaw === 'object' && ayanamshaRaw !== null) {
    // Try common property names for ayanamsa values
    ayanamsa = Number(ayanamshaRaw.value || ayanamshaRaw.degrees || ayanamshaRaw.lon || ayanamshaRaw.ayanamsha || ayanamshaRaw) || 23.85;
  } else {
    ayanamsa = Number(ayanamshaRaw) || 23.85;
  }
  
  console.log('✅ Panchanga calculated:', {
    tithi: tithi.name,
    nakshatra: nakshatra.name,
    yoga: yoga.name,
    sunrise: sunrise.toLocaleTimeString(),
    sunset: sunset.toLocaleTimeString(),
    ayanamsa: ayanamsa,
    ayanamsaType: typeof ayanamsa
  });
  
  return { tithi, nakshatra, yoga, karana, vara, sunrise: parsedSunrise, sunset: parsedSunset, ayanamsa };
}

// Calculate current Panchanga for today
export function calculateCurrentPanchanga(birthPlace: string, latitude: number, longitude: number): AccuratePanchangaData {
  console.log('🔮 Calculating current Panchanga for today');
  
  const today = new Date();
  const currentChart = getChart({
    date: today,
    latitude,
    longitude,
    name: 'Current Chart',
    place: birthPlace,
    birthDate: null  // No birth date for current Panchanga
  });
  
  return calculateAccuratePanchanga(currentChart, {
    birthDate: today.toISOString().split('T')[0],
    birthTime: '12:00',
    birthPlace
  });
}

// Calculate Tithi from accurate Sun/Moon longitudes
function calculateTithiFromLongitudes(sunLon: number, moonLon: number) {
  const diff = moonLon - sunLon;
  const normalizedDiff = ((diff % 360) + 360) % 360;
  
  const tithiNumber = Math.floor(normalizedDiff / 12) + 1;
  const progress = ((normalizedDiff % 12) / 12) * 100;
  
  const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
  const tithiIndex = tithiNumber <= 15 ? tithiNumber - 1 : tithiNumber - 16;
  
  const significance = getTithiSignificance(tithiNumber, paksha);
  
  return {
    number: tithiNumber,
    name: TITHI_NAMES[tithiIndex],
    paksha,
    progress: Math.round(progress * 10) / 10,
    endTime: new Date(Date.now() + (100 - progress) * 24 * 60 * 60 * 1000 / 100),
    significance
  };
}

// Calculate Nakshatra from accurate Moon longitude
function calculateNakshatraFromLongitude(moonLon: number) {
  const nakshatraNumber = Math.floor(moonLon / 13.333333) + 1;
  const progress = ((moonLon % 13.333333) / 13.333333) * 100;
  
  const significance = getNakshatraSignificance(NAKSHATRA_NAMES[(nakshatraNumber - 1) % 27]);
  
  return {
    number: nakshatraNumber,
    name: NAKSHATRA_NAMES[(nakshatraNumber - 1) % 27],
    lord: NAKSHATRA_LORDS[(nakshatraNumber - 1) % 27],
    progress: Math.round(progress * 10) / 10,
    endTime: new Date(Date.now() + (100 - progress) * 24 * 60 * 60 * 1000 / 100),
    significance
  };
}

// Calculate Yoga from accurate Sun/Moon longitudes
function calculateYogaFromLongitudes(sunLon: number, moonLon: number) {
  const sum = sunLon + moonLon;
  const normalizedSum = ((sum % 360) + 360) % 360;
  
  const yogaNumber = Math.floor(normalizedSum / 13.333333) + 1;
  const progress = ((normalizedSum % 13.333333) / 13.333333) * 100;
  
  const significance = getYogaSignificance(YOGA_NAMES[(yogaNumber - 1) % 27]);
  
  return {
    number: yogaNumber,
    name: YOGA_NAMES[(yogaNumber - 1) % 27],
    progress: Math.round(progress * 10) / 10,
    endTime: new Date(Date.now() + (100 - progress) * 24 * 60 * 60 * 1000 / 100),
    significance
  };
}

// Calculate Karana from Tithi
function calculateKaranaFromTithi(tithi: any) {
  const karanaNumber = Math.floor((tithi.number - 1) * 2) + 1;
  const progress = (tithi.progress / 100) * 50; // Each karana is half a tithi
  
  return {
    number: karanaNumber,
    name: KARANA_NAMES[(karanaNumber - 1) % 11],
    progress: Math.round(progress * 10) / 10,
    endTime: new Date(Date.now() + (50 - progress) * 24 * 60 * 60 * 1000 / 100)
  };
}

// Calculate Vara from birth date
function calculateVaraFromDate(birthDate: string) {
  const date = new Date(birthDate);
  const dayOfWeek = date.getDay();
  
  return {
    number: dayOfWeek + 1,
    name: VARA_NAMES[dayOfWeek],
    lord: VARA_LORDS[dayOfWeek]
  };
}

// Get accurate sunrise/sunset using corrected astronomical algorithm
function getAccurateSunriseSunset(date: string, latitude: number, longitude: number) {
  console.log('🔍 getAccurateSunriseSunset called with:', { date, latitude, longitude });
  
  // Validate inputs
  if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
    console.error('❌ Invalid latitude:', latitude);
    return {
      sunrise: new Date(1983, 1, 24, 6, 0),
      sunset: new Date(1983, 1, 24, 18, 0)
    };
  }
  
  if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
    console.error('❌ Invalid longitude:', longitude);
    return {
      sunrise: new Date(1983, 1, 24, 6, 0),
      sunset: new Date(1983, 1, 24, 18, 0)
    };
  }
  
  console.log('✅ Valid coordinates:', { latitude, longitude });
  
  // Validate date string parsing
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    console.error('❌ Invalid date string:', date);
    return {
      sunrise: new Date(1983, 1, 24, 6, 0),  // Fallback with hardcoded values
      sunset: new Date(1983, 1, 24, 18, 0)
    };
  }
  
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();
  
  console.log('🔍 Parsed date components:', { year, month, day, originalDate: date });
  
  // Calculate day of year (1-366)
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((targetDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Constants
  const rad = Math.PI / 180;
  
  // Calculate solar declination
  const declination = 23.45 * Math.sin((284 + dayOfYear) * 360 / 365 * rad);
  
  // Calculate hour angle with atmospheric refraction correction
  const latRad = latitude * rad;
  const decRad = declination * rad;
  const zenith = 90.833; // 90° 50' for sunrise/sunset (includes refraction)
  
  const cosHourAngle = (Math.cos(zenith * rad) - Math.sin(latRad) * Math.sin(decRad)) / 
                      (Math.cos(latRad) * Math.cos(decRad));
  
  // Check for polar day/night
  if (cosHourAngle > 1 || cosHourAngle < -1) {
    console.warn('⚠️ Polar day/night detected, using fallback times');
    return {
      sunrise: new Date(year, month, day, 6, 0),
      sunset: new Date(year, month, day, 18, 0)
    };
  }
  
  const hourAngle = Math.acos(cosHourAngle) / rad;
  
  // Calculate local mean time (in hours)
  const sunriseLocalMean = 12 - hourAngle / 15;
  const sunsetLocalMean = 12 + hourAngle / 15;
  
  // Log astronomical calculation inputs
  console.log('🔍 Astronomical calculation inputs:');
  console.log('  dayOfYear:', dayOfYear);
  console.log('  declination:', declination);
  console.log('  hourAngle:', hourAngle);
  console.log('  sunriseLocalMean:', sunriseLocalMean);
  console.log('  sunsetLocalMean:', sunsetLocalMean);
  
  // Apply longitude correction (4 minutes per degree)
  // For locations east of prime meridian, sunrise is earlier
  const longitudeCorrection = longitude / 15; // Convert to hours
  const sunriseUTC = sunriseLocalMean - longitudeCorrection;
  const sunsetUTC = sunsetLocalMean - longitudeCorrection;
  
  // Get timezone offset for the location
  const timezoneOffset = getTimezoneOffset(latitude, longitude);
  
  // Convert UTC to local time
  const sunriseLocal = sunriseUTC + timezoneOffset;
  const sunsetLocal = sunsetUTC + timezoneOffset;
  
  // Log before normalization to debug calculation - EXPLICIT VALUES
  console.log('🔍 Before normalization - EXPLICIT VALUES:');
  console.log('  sunriseLocal:', sunriseLocal);
  console.log('  sunsetLocal:', sunsetLocal);
  console.log('  sunriseUTC:', sunriseUTC);
  console.log('  sunsetUTC:', sunsetUTC);
  console.log('  timezoneOffset:', timezoneOffset);
  console.log('  longitudeCorrection:', longitudeCorrection);
  
  // Normalize to 0-24 range and handle edge cases
  let normalizeSunriseLocal = ((sunriseLocal % 24) + 24) % 24;
  let normalizeSunsetLocal = ((sunsetLocal % 24) + 24) % 24;
  
  // Validate and clamp values to ensure they're in valid ranges
  const sunriseHour = Math.max(0, Math.min(23, Math.floor(normalizeSunriseLocal)));
  const sunriseMinute = Math.max(0, Math.min(59, Math.round((normalizeSunriseLocal % 1) * 60)));
  const sunsetHour = Math.max(0, Math.min(23, Math.floor(normalizeSunsetLocal)));
  const sunsetMinute = Math.max(0, Math.min(59, Math.round((normalizeSunsetLocal % 1) * 60)));
  
  // Validate reasonable sunrise/sunset times (4 AM - 8 AM for sunrise, 4 PM - 8 PM for sunset)
  if (sunriseHour < 4 || sunriseHour > 8) {
    console.warn('⚠️ Unusual sunrise time calculated:', sunriseHour, ':', sunriseMinute.toString().padStart(2, '0'));
  }
  if (sunsetHour < 16 || sunsetHour > 20) {
    console.warn('⚠️ Unusual sunset time calculated:', sunsetHour, ':', sunsetMinute.toString().padStart(2, '0'));
  }
  
  // Check for NaN values before creating Date objects
  if (isNaN(year) || isNaN(month) || isNaN(day) || 
      isNaN(sunriseHour) || isNaN(sunriseMinute) ||
      isNaN(sunsetHour) || isNaN(sunsetMinute)) {
    console.error('❌ NaN detected in date components:', {
      year, month, day, sunriseHour, sunriseMinute, sunsetHour, sunsetMinute
    });
    return {
      sunrise: new Date(year || 1983, month || 1, day || 24, 6, 0),
      sunset: new Date(year || 1983, month || 1, day || 24, 18, 0)
    };
  }
  
  console.log('🔍 About to create Date - EXPLICIT VALUES:');
  console.log('  year:', year);
  console.log('  month:', month);
  console.log('  day:', day);
  console.log('  sunriseHour:', sunriseHour);
  console.log('  sunriseMinute:', sunriseMinute);
  console.log('  sunsetHour:', sunsetHour);
  console.log('  sunsetMinute:', sunsetMinute);
  
  // Create Date objects in local time with validated values
  const sunrise = new Date(year, month, day, sunriseHour, sunriseMinute);
  const sunset = new Date(year, month, day, sunsetHour, sunsetMinute);
  
  // Verify dates are valid
  if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
    console.error('❌ Invalid dates created, using fallback');
    return {
      sunrise: new Date(year, month, day, 6, 0),
      sunset: new Date(year, month, day, 18, 0)
    };
  }
  
  console.log('🔍 Created Date objects - EXPLICIT VALUES:');
  console.log('  sunrise.toString():', sunrise.toString());
  console.log('  sunset.toString():', sunset.toString());
  console.log('  sunriseValid:', !isNaN(sunrise.getTime()));
  console.log('  sunsetValid:', !isNaN(sunset.getTime()));
  console.log('  sunrise.getTime():', sunrise.getTime());
  console.log('  sunset.getTime():', sunset.getTime());
  
  console.log('🔍 Calculated times:', {
    dayOfYear,
    declination: declination.toFixed(2),
    hourAngle: hourAngle.toFixed(2),
    longitudeCorrection: longitudeCorrection.toFixed(2),
    timezoneOffset,
    sunriseUTC: sunriseUTC.toFixed(2),
    sunsetUTC: sunsetUTC.toFixed(2),
    sunriseLocal: normalizeSunriseLocal.toFixed(2),
    sunsetLocal: normalizeSunsetLocal.toFixed(2),
    sunrise: sunrise.toLocaleTimeString(),
    sunset: sunset.toLocaleTimeString()
  });
  
  return { sunrise, sunset };
}

// Get timezone offset based on location (default IST for Indian coordinates)
function getTimezoneOffset(latitude: number, longitude: number): number {
  // For Indian subcontinent (rough bounds)
  if (latitude >= 6 && latitude <= 37 && longitude >= 68 && longitude <= 97) {
    return 5.5; // IST = UTC+5:30
  }
  
  // For other locations, use a simple longitude-based approximation
  // This is a rough estimate - in production, use a proper timezone library
  return longitude / 15; // 15 degrees = 1 hour
}

// Significance functions
function getTithiSignificance(tithiNumber: number, paksha: string) {
  const significances: Record<number, string> = {
    1: 'New beginnings, auspicious for starting ventures',
    2: 'Good for partnerships and relationships',
    3: 'Favorable for creative activities',
    4: 'Good for spiritual practices',
    5: 'Auspicious for learning and education',
    6: 'Good for health-related activities',
    7: 'Favorable for travel and movement',
    8: 'Good for transformation and change',
    9: 'Auspicious for worship and devotion',
    10: 'Good for business and commerce',
    11: 'Favorable for fasting and spiritual practices',
    12: 'Good for charity and service',
    13: 'Favorable for meditation and introspection',
    14: 'Good for preparation and planning',
    15: paksha === 'Shukla' ? 'Full Moon - Peak energy' : 'New Moon - New beginnings'
  };
  
  return significances[tithiNumber] || 'Neutral day';
}

function getNakshatraSignificance(nakshatraName: string) {
  const significances: Record<string, string> = {
    'Ashwini': 'Healing, beginnings, swift action',
    'Bharani': 'Transformation, creativity, fertility',
    'Krittika': 'Purification, determination, leadership',
    'Rohini': 'Growth, abundance, beauty',
    'Mrigashira': 'Searching, curiosity, communication',
    'Ardra': 'Transformation, storms, renewal',
    'Punarvasu': 'Renewal, restoration, healing',
    'Pushya': 'Nourishment, protection, spirituality',
    'Ashlesha': 'Transformation, intensity, healing',
    'Magha': 'Royalty, authority, ancestors',
    'Purva Phalguni': 'Creativity, romance, celebration',
    'Uttara Phalguni': 'Service, healing, partnership',
    'Hasta': 'Skill, dexterity, healing',
    'Chitra': 'Artistry, beauty, creation',
    'Swati': 'Independence, movement, change',
    'Vishakha': 'Achievement, success, determination',
    'Anuradha': 'Friendship, devotion, success',
    'Jyeshtha': 'Power, authority, transformation',
    'Mula': 'Roots, foundation, destruction',
    'Purva Ashadha': 'Invincibility, strength, victory',
    'Uttara Ashadha': 'Universal victory, leadership',
    'Shravana': 'Learning, listening, wisdom',
    'Dhanishtha': 'Wealth, music, dance',
    'Shatabhisha': 'Healing, medicine, mysticism',
    'Purva Bhadrapada': 'Transformation, spirituality',
    'Uttara Bhadrapada': 'Spirituality, liberation',
    'Revati': 'Compassion, completion, healing'
  };
  
  return significances[nakshatraName] || 'Mystical influence';
}

function getYogaSignificance(yogaName: string) {
  const significances: Record<string, string> = {
    'Vishkambha': 'Support, foundation, stability',
    'Priti': 'Love, affection, harmony',
    'Ayushman': 'Longevity, health, vitality',
    'Saubhagya': 'Good fortune, prosperity',
    'Shobhana': 'Beauty, elegance, refinement',
    'Atiganda': 'Obstacles, challenges, delays',
    'Sukarma': 'Good deeds, righteousness',
    'Dhriti': 'Patience, endurance, stability',
    'Shula': 'Pain, suffering, obstacles',
    'Ganda': 'Danger, obstacles, challenges',
    'Vriddhi': 'Growth, expansion, progress',
    'Dhruva': 'Stability, permanence, constancy',
    'Vyaghata': 'Obstacles, conflicts, challenges',
    'Harshana': 'Joy, happiness, celebration',
    'Vajra': 'Strength, power, determination',
    'Siddhi': 'Success, accomplishment, perfection',
    'Vyatipata': 'Reversal, change, transformation',
    'Variyan': 'Water, fluidity, adaptability',
    'Parigha': 'Obstacles, barriers, restrictions',
    'Shiva': 'Destruction, transformation, renewal',
    'Siddha': 'Accomplishment, success, perfection',
    'Sadhya': 'Achievable, attainable, possible',
    'Shubha': 'Auspicious, favorable, beneficial',
    'Shukla': 'Pure, bright, auspicious',
    'Brahma': 'Creation, knowledge, wisdom',
    'Indra': 'Power, authority, leadership',
    'Vaidhriti': 'Separation, division, obstacles'
  };
  
  return significances[yogaName] || 'Cosmic influence';
}
