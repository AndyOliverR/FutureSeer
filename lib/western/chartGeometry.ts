/**
 * SVG Chart Geometry Calculations for Western Astrology
 * Inspired by AstroChart and Kerykeion libraries
 */

export interface ChartDimensions {
  centerX: number;
  centerY: number;
  radius: number;
  innerRadius: number;
  middleRadius: number;
  outerRadius: number;
}

export interface PlanetPosition {
  x: number;
  y: number;
  angle: number;
}

export interface PlanetClusterPosition extends PlanetPosition {
  clusterIndex: number;
  clusterSize: number;
}

export interface HouseCusp {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number;
}

/**
 * Calculate chart dimensions based on container size
 */
export function calculateChartDimensions(containerWidth: number, containerHeight: number): ChartDimensions {
  const minDimension = Math.min(containerWidth, containerHeight);
  const radius = Math.min(minDimension * 0.43, 225); // Slightly larger while preserving margins
  
  return {
    centerX: containerWidth / 2,
    centerY: containerHeight / 2,
    radius: radius,
    innerRadius: radius * 0.3,  // Zodiac signs
    middleRadius: radius * 0.6, // Houses
    outerRadius: radius * 0.9   // Planets
  };
}

/**
 * Spread clustered longitudes to avoid planet-label overlaps.
 */
export function distributePlanetLongitudes(
  longitudes: number[],
  thresholdDegrees: number = 10
): PlanetClusterPosition[] {
  const ordered = longitudes
    .map((lon, index) => ({ lon, index }))
    .sort((a, b) => a.lon - b.lon);
  const clusterMeta = new Map<number, { clusterIndex: number; clusterSize: number }>();
  let start = 0;
  while (start < ordered.length) {
    let end = start + 1;
    while (end < ordered.length && Math.abs(ordered[end].lon - ordered[end - 1].lon) < thresholdDegrees) end += 1;
    const cluster = ordered.slice(start, end);
    cluster.forEach((entry, idx) => {
      clusterMeta.set(entry.index, { clusterIndex: idx, clusterSize: cluster.length });
    });
    start = end;
  }
  return longitudes.map((lon, originalIndex) => ({
    x: 0,
    y: 0,
    angle: lon,
    ...(clusterMeta.get(originalIndex) ?? { clusterIndex: 0, clusterSize: 1 }),
  }));
}

/**
 * Convert longitude to SVG coordinates
 */
export function longitudeToPosition(longitude: number, radius: number, centerX: number, centerY: number): PlanetPosition {
  // Convert longitude to angle (0° = 3 o'clock, 90° = 6 o'clock)
  const angle = (longitude - 90) * (Math.PI / 180);
  
  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);
  
  return { x, y, angle: longitude };
}

/**
 * Calculate house cusp line coordinates
 */
export function calculateHouseCusp(cuspLongitude: number, dimensions: ChartDimensions): HouseCusp {
  const angle = (cuspLongitude - 90) * (Math.PI / 180);
  
  const x1 = dimensions.centerX + dimensions.innerRadius * Math.cos(angle);
  const y1 = dimensions.centerY + dimensions.innerRadius * Math.sin(angle);
  const x2 = dimensions.centerX + dimensions.outerRadius * Math.cos(angle);
  const y2 = dimensions.centerY + dimensions.outerRadius * Math.sin(angle);
  
  return { x1, y1, x2, y2, angle: cuspLongitude };
}

/**
 * Calculate aspect line between two planets
 */
export function calculateAspectLine(
  planet1Longitude: number,
  planet2Longitude: number,
  dimensions: ChartDimensions
): { x1: number; y1: number; x2: number; y2: number } | null {
  const pos1 = longitudeToPosition(planet1Longitude, dimensions.outerRadius, dimensions.centerX, dimensions.centerY);
  const pos2 = longitudeToPosition(planet2Longitude, dimensions.outerRadius, dimensions.centerX, dimensions.centerY);
  
  return {
    x1: pos1.x,
    y1: pos1.y,
    x2: pos2.x,
    y2: pos2.y
  };
}

/**
 * Get zodiac sign color
 */
export function getZodiacSignColor(sign: string): string {
  const colors: Record<string, string> = {
    'Aries': '#FF6B6B',      // Fire - Red
    'Taurus': '#4ECDC4',     // Earth - Teal
    'Gemini': '#45B7D1',     // Air - Blue
    'Cancer': '#96CEB4',     // Water - Green
    'Leo': '#FFEAA7',        // Fire - Yellow
    'Virgo': '#DDA0DD',      // Earth - Purple
    'Libra': '#98D8C8',      // Air - Mint
    'Scorpio': '#F7DC6F',    // Water - Gold
    'Sagittarius': '#BB8FCE', // Fire - Lavender
    'Capricorn': '#85C1E9',  // Earth - Light Blue
    'Aquarius': '#F8C471',   // Air - Orange
    'Pisces': '#82E0AA'      // Water - Light Green
  };
  
  return colors[sign] || '#FFFFFF';
}

/**
 * Get planet color
 */
export function getPlanetColor(planet: string): string {
  const colors: Record<string, string> = {
    'Sun': '#FFD700',        // Gold
    'Moon': '#C0C0C0',       // Silver
    'Mercury': '#87CEEB',    // Sky Blue
    'Venus': '#FFB6C1',      // Light Pink
    'Mars': '#FF6347',       // Tomato
    'Jupiter': '#4169E1',    // Royal Blue
    'Saturn': '#8B4513',     // Saddle Brown
    'Uranus': '#00CED1',     // Dark Turquoise
    'Neptune': '#0000FF',    // Blue
    'Pluto': '#800080'       // Purple
  };
  
  return colors[planet] || '#FFFFFF';
}

/**
 * Get aspect color based on type
 */
export function getAspectColor(aspectType: string): string {
  const colors: Record<string, string> = {
    'conjunction': '#FFFFFF',   // White
    'opposition': '#FF6B6B',    // Red (challenging)
    'trine': '#4ECDC4',         // Teal (harmonious)
    'square': '#FF6347',        // Tomato (challenging)
    'sextile': '#45B7D1',       // Blue (harmonious)
    'quincunx': '#DDA0DD',      // Purple (neutral)
    'semisextile': '#98D8C8'    // Mint (neutral)
  };
  
  return colors[aspectType] || '#FFFFFF';
}

/**
 * Generate SVG path data for zodiac sign arcs
 */
export function generateZodiacArc(
  centerX: number, 
  centerY: number, 
  radius: number, 
  startAngle: number, 
  endAngle: number
): string {
  const startAngleRad = (startAngle - 90) * (Math.PI / 180);
  const endAngleRad = (endAngle - 90) * (Math.PI / 180);
  
  const x1 = centerX + radius * Math.cos(startAngleRad);
  const y1 = centerY + radius * Math.sin(startAngleRad);
  const x2 = centerX + radius * Math.cos(endAngleRad);
  const y2 = centerY + radius * Math.sin(endAngleRad);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    `M ${centerX} ${centerY}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    'Z'
  ].join(' ');
}

/**
 * Calculate degree marker positions
 */
export function calculateDegreeMarkers(
  centerX: number, 
  centerY: number, 
  outerRadius: number, 
  interval: number = 10
): Array<{x1: number, y1: number, x2: number, y2: number, angle: number}> {
  const markers = [];
  const tickCount = 360 / interval;
  
  for (let i = 0; i < tickCount; i++) {
    const angle = i * interval;
    const angleRad = (angle - 90) * (Math.PI / 180);
    const innerTickRadius = outerRadius + 5;
    const outerTickRadius = outerRadius + (angle % 30 === 0 ? 15 : 10);
    
    markers.push({
      angle,
      x1: centerX + innerTickRadius * Math.cos(angleRad),
      y1: centerY + innerTickRadius * Math.sin(angleRad),
      x2: centerX + outerTickRadius * Math.cos(angleRad),
      y2: centerY + outerTickRadius * Math.sin(angleRad)
    });
  }
  
  return markers;
}

/**
 * Position house labels optimally
 */
export function positionHouseLabel(
  centerX: number, 
  centerY: number, 
  radius: number, 
  angle: number
): {x: number, y: number} {
  const angleRad = (angle - 90) * (Math.PI / 180);
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad)
  };
}

/**
 * Get vibrant zodiac colors matching AstroApp style
 */
export function getVibrantZodiacColors(): Record<string, string> {
  return {
    'Aries': '#FF0000',      // Red
    'Taurus': '#FF4500',     // Orange-Red
    'Gemini': '#FFA500',     // Orange
    'Cancer': '#FFFF00',     // Yellow
    'Leo': '#ADFF2F',        // Yellow-Green
    'Virgo': '#00FF00',      // Green
    'Libra': '#00FFFF',      // Cyan
    'Scorpio': '#0000FF',    // Blue
    'Sagittarius': '#4B0082', // Indigo
    'Capricorn': '#8B00FF',   // Purple
    'Aquarius': '#FF00FF',    // Magenta
    'Pisces': '#FF1493'       // Deep Pink
  };
}