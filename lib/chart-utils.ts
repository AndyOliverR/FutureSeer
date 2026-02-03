// Planet symbol mapping
export const planetSymbols = {
  sun: '☉', moon: '☽', mars: '♂', mercury: '☿',
  venus: '♀', jupiter: '♃', saturn: '♄',
  rahu: '☊', ketu: '☋'
};

// Zodiac symbols
export const signSymbols = {
  aries: '♈', taurus: '♉', gemini: '♊',
  cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐',
  capricorn: '♑', aquarius: '♒', pisces: '♓'
};

// Planet colors by nature (matching reference images)
export const getPlanetColor = (planet: string): string => {
  const malefics = ['mars', 'saturn'];
  const benefics = ['jupiter', 'venus', 'mercury'];
  const luminaries = ['sun', 'moon'];
  const nodes = ['rahu', 'ketu'];
  
  if (malefics.includes(planet)) return '#E63946'; // Red
  if (benefics.includes(planet)) return '#4A90E2'; // Blue
  if (luminaries.includes(planet)) return '#FF6B35'; // Orange-red
  if (nodes.includes(planet)) return '#9B5DE5'; // Purple
  return '#2C3E50'; // Dark blue-gray
};

// Get sign symbol from sign name
export const getSignSymbol = (signName: string): string => {
  const normalized = signName.toLowerCase();
  return signSymbols[normalized as keyof typeof signSymbols] || '';
};

// Format planet display with symbol, degree, and sign
export const formatPlanetDisplay = (planet: string, data: any): string => {
  const symbol = planetSymbols[planet as keyof typeof planetSymbols] || planet.toUpperCase();
  const degree = Math.round(data.degreeInSign || 0);
  const sign = getSignSymbol(data.signName || '');
  return `${symbol} ${degree}°${sign}`;
};
