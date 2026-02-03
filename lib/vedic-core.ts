// Vedic Astrology Core Utilities
// Nakshatra, D9 house mapping, and Vimshottari dasha calculations

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati"
];

const NK_SPAN = 360 / 27;      // 13.333... degrees per nakshatra
const PADA_SPAN = NK_SPAN / 4; // 3.333... degrees per pada

export function nakshatraFromLongitude(lon: number) {
  const L = ((lon % 360) + 360) % 360;
  const index = Math.floor(L / NK_SPAN);
  const start = index * NK_SPAN;
  const within = L - start;
  const pada = Math.floor(within / PADA_SPAN) + 1; // 1..4
  return { 
    index, 
    name: NAKSHATRAS[index], 
    pada: Math.min(pada, 4) // Ensure pada doesn't exceed 4
  };
}

export function d9AscHouseNumber(d9AscSign: number, targetD9Sign: number) {
  let diff = targetD9Sign - d9AscSign;
  if (diff < 0) diff += 12;
  return diff + 1; // 1..12
}

const DASA_SEQ = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"] as const;
const DASA_YEARS: Record<string, number> = { 
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 
};

export function vimshottariTimeline(birthJD: number, moonLon: number) {
  const L = ((moonLon % 360) + 360) % 360;
  const nkIndex = Math.floor(L / NK_SPAN);
  const start = nkIndex * NK_SPAN;
  const frac = (L - start) / NK_SPAN; // 0..1 within nakshatra
  const startIdx = nkIndex % 9; // Ashwini → Ketu mapping
  const startLord = DASA_SEQ[startIdx];
  const balanceYears = (1 - frac) * DASA_YEARS[startLord];
  
  const mahadasas = [{ lord: startLord as string, years: balanceYears }];
  for (let i = 1; i < 9; i++) {
    const lord = DASA_SEQ[(startIdx + i) % 9];
    mahadasas.push({ lord: lord as string, years: DASA_YEARS[lord] });
  }
  
  return { startLord, balanceYears, mahadasas };
}

// Utility function to get nakshatra lord for Vimshottari dasha
export function getNakshatraLord(nakshatraIndex: number): string {
  const lords = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
  ];
  return lords[nakshatraIndex % 27];
}

// Calculate current dasha period with progress
export function calculateCurrentDasha(birthDate: string, moonLon: number) {
  const birthDateObj = new Date(birthDate);
  const currentDate = new Date();
  const elapsedYears = (currentDate.getTime() - birthDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  const timeline = vimshottariTimeline(birthDateObj.getTime() / (1000 * 60 * 60 * 24) + 2440588, moonLon);
  
  let totalElapsed = 0;
  let currentDasha = null;
  let progress = 0;
  
  for (const dasha of timeline.mahadasas) {
    if (totalElapsed + dasha.years > elapsedYears) {
      currentDasha = dasha;
      progress = ((elapsedYears - totalElapsed) / dasha.years) * 100;
      break;
    }
    totalElapsed += dasha.years;
  }
  
  return {
    currentDasha,
    progress: Math.min(progress, 100),
    timeline
  };
}

// Format dasha period for display
export function formatDashaPeriod(dasha: { lord: string; years: number }, progress?: number) {
  const years = Math.floor(dasha.years);
  const months = Math.floor((dasha.years - years) * 12);
  const days = Math.floor(((dasha.years - years) * 12 - months) * 30);
  
  let duration = `${years}y`;
  if (months > 0) duration += ` ${months}m`;
  if (days > 0) duration += ` ${days}d`;
  
  if (progress !== undefined) {
    return `${dasha.lord} Dasha (${duration}) - ${progress.toFixed(1)}% complete`;
  }
  
  return `${dasha.lord} Dasha (${duration})`;
}

// Get sign name from index
export function getSignName(signIndex: number): string {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  return signs[signIndex % 12];
}

// Get house ruler from sign
export function getHouseRuler(signIndex: number): string {
  const rulers = [
    "Mars",     // Aries
    "Venus",    // Taurus
    "Mercury",  // Gemini
    "Moon",     // Cancer
    "Sun",      // Leo
    "Mercury",  // Virgo
    "Venus",    // Libra
    "Mars",     // Scorpio
    "Jupiter",  // Sagittarius
    "Saturn",   // Capricorn
    "Saturn",   // Aquarius
    "Jupiter"   // Pisces
  ];
  return rulers[signIndex % 12];
}
