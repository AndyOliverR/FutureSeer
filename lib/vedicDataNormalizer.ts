// Vedic Data Normalizer
// Helper functions for formatting and displaying Vedic astrology data

export function getPlanetEmoji(planetName: string): string {
  const emojiMap: Record<string, string> = {
    'Sun': '☉',
    'Moon': '☽',
    'Mars': '♂',
    'Mercury': '☿',
    'Jupiter': '♃',
    'Venus': '♀',
    'Saturn': '♄',
    'Rahu': '☊',
    'Ketu': '☋',
    'Ascendant': 'Asc',
    'Asc': 'Asc'
  };
  
  return emojiMap[planetName] || planetName.substring(0, 2).toUpperCase();
}

export function getSignEmoji(signName: string): string {
  const emojiMap: Record<string, string> = {
    'Aries': '♈',
    'Taurus': '♉',
    'Gemini': '♊',
    'Cancer': '♋',
    'Leo': '♌',
    'Virgo': '♍',
    'Libra': '♎',
    'Scorpio': '♏',
    'Sagittarius': '♐',
    'Capricorn': '♑',
    'Aquarius': '♒',
    'Pisces': '♓'
  };
  
  return emojiMap[signName] || signName.substring(0, 3);
}

export function formatDegree(degree: number): string {
  const deg = Math.floor(degree);
  const min = Math.floor((degree - deg) * 60);
  const sec = Math.floor(((degree - deg) * 60 - min) * 60);
  
  return `${deg}°${min}'${sec}"`;
}

export function formatDegreeSimple(degree: number): string {
  return `${degree.toFixed(2)}°`;
}

export function getNakshatraName(longitude: number): string {
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  
  const nakshatraIndex = Math.floor(longitude / 13.333333);
  return nakshatras[nakshatraIndex] || 'Unknown';
}

export function getNakshatraPada(longitude: number): number {
  const degreeInNakshatra = longitude % 13.333333;
  return Math.floor(degreeInNakshatra / 3.333333) + 1;
}

export function getHouseName(houseNumber: number): string {
  const houseNames = [
    'Lagna (Self)', 'Dhana (Wealth)', 'Sahaja (Siblings)', 'Sukha (Home)',
    'Putra (Children)', 'Ripu (Enemies)', 'Kalatra (Spouse)', 'Ayu (Longevity)',
    'Dharma (Fortune)', 'Karma (Career)', 'Labha (Gains)', 'Vyaya (Losses)'
  ];
  
  return houseNames[houseNumber - 1] || `House ${houseNumber}`;
}

export function normalizeVedicData(data: any): any {
  // Normalize various Vedic data formats into a consistent structure
  if (!data) return null;
  
  return {
    ...data,
    planets: data.planets?.map((planet: any) => ({
      ...planet,
      emoji: getPlanetEmoji(planet.name || planet.planet),
      signEmoji: getSignEmoji(planet.sign || planet.signName),
      degreeFormatted: formatDegree(planet.degree || planet.degreeInSign || 0),
      nakshatra: planet.nakshatra || getNakshatraName(planet.longitude || 0),
      nakshatraPada: planet.nakshatraPada || getNakshatraPada(planet.longitude || 0)
    }))
  };
}

