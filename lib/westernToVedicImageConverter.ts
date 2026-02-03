// Western to Vedic Chart Image Converter
// Converts Western chart images from AstroApp into authentic Vedic chart formats

export interface WesternChartImageData {
  imageUrl: string;
  planetaryPositions: Array<{
    planet: string;
    longitude: number;
    latitude: number;
    speed: number;
    house: number;
  }>;
  houseCusps: Array<{
    number: number;
    longitude: number;
  }>;
  metadata: {
    ayanamsa: number;
    houseSystem: string;
    generatedAt: string;
  };
}

export interface VedicChartImage {
  svg: string;
  metadata: {
    type: string;
    generatedAt: string;
    ayanamsa: number;
    source: string;
  };
}

export class WesternToVedicImageConverter {
  private westernData: WesternChartImageData;
  private ayanamsa: number = 23.85; // Default Lahiri ayanamsa

  constructor(westernData: WesternChartImageData) {
    this.westernData = westernData;
    this.ayanamsa = westernData.metadata?.ayanamsa || 23.85;
  }

  /**
   * Convert Western chart image to all Vedic chart formats
   */
  public convertToVedicCharts(): {
    northIndian: VedicChartImage;
    southIndian: VedicChartImage;
    nakshatraWheel: VedicChartImage;
  } {
    const vedicPlanets = this.convertPlanetaryPositions();
    
    return {
      northIndian: this.generateNorthIndianChart(vedicPlanets),
      southIndian: this.generateSouthIndianChart(vedicPlanets),
      nakshatraWheel: this.generateNakshatraWheel(vedicPlanets)
    };
  }

  /**
   * Convert Western planetary positions to Vedic format
   */
  private convertPlanetaryPositions(): Array<{
    planet: string;
    sign: string;
    degree: number;
    minute: number;
    house: number;
    nakshatra: string;
    nakshatraLord: string;
    isRetrograde: boolean;
    isExalted: boolean;
    isDebilitated: boolean;
  }> {
    return this.westernData.planetaryPositions.map(planet => {
      // Convert tropical longitude to sidereal (subtract ayanamsa)
      const siderealLongitude = planet.longitude - this.ayanamsa;
      
      // Ensure positive longitude
      const adjustedLongitude = siderealLongitude < 0 ? siderealLongitude + 360 : siderealLongitude;
      
      // Calculate sign, degree, and minute
      const signIndex = Math.floor(adjustedLongitude / 30);
      const sign = this.getVedicSign(signIndex);
      const degreeInSign = adjustedLongitude % 30;
      const degree = Math.floor(degreeInSign);
      const minute = Math.floor((degreeInSign - degree) * 60);
      
      // Calculate house (simplified - using equal house system)
      const house = (signIndex + 1);
      
      // Calculate nakshatra
      const nakshatraIndex = Math.floor(adjustedLongitude / (360 / 27));
      const nakshatra = this.getNakshatra(nakshatraIndex);
      const nakshatraLord = this.getNakshatraLord(nakshatraIndex);
      
      // Determine if retrograde (simplified check)
      const isRetrograde = planet.speed < 0;
      
      // Determine exaltation/debilitation (simplified)
      const isExalted = this.isPlanetExalted(planet.planet, sign);
      const isDebilitated = this.isPlanetDebilitated(planet.planet, sign);
      
      return {
        planet: planet.planet,
        sign,
        degree,
        minute,
        house,
        nakshatra,
        nakshatraLord,
        isRetrograde,
        isExalted,
        isDebilitated
      };
    });
  }

  /**
   * Generate North Indian chart (diamond/square format)
   */
  private generateNorthIndianChart(planets: any[]): VedicChartImage {
    const size = 600;
    const centerX = size / 2;
    const centerY = size / 2;
    const chartSize = size * 0.6;
    const houseSize = chartSize / 3;

    let svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .chart-bg { fill: #ffffff; stroke: #ffd700; stroke-width: 3; }
            .house-border { fill: none; stroke: #000000; stroke-width: 1; }
            .house-number { font-family: Arial, sans-serif; font-size: 18px; fill: #000000; font-weight: bold; text-anchor: middle; }
            .planet-symbol { font-family: Arial, sans-serif; font-size: 14px; fill: #000000; text-anchor: middle; }
            .planet-name { font-family: Arial, sans-serif; font-size: 8px; fill: #000000; text-anchor: middle; }
            .degree-text { font-family: Arial, sans-serif; font-size: 7px; fill: #666666; text-anchor: middle; }
            .retrograde-text { font-family: Arial, sans-serif; font-size: 8px; fill: #ff0000; font-weight: bold; }
            .title-text { font-family: Arial, sans-serif; font-size: 18px; fill: #ffd700; font-weight: bold; text-anchor: middle; }
            .branding-text { font-family: Arial, sans-serif; font-size: 12px; fill: #666666; text-anchor: middle; }
            .zodiac-symbol { font-family: Arial, sans-serif; font-size: 12px; fill: #000000; text-anchor: middle; }
          </style>
        </defs>
        
        <!-- Background with high border radius -->
        <rect width="${size}" height="${size}" rx="200" ry="200" class="chart-bg"/>
        
        <!-- Title -->
        <text x="${centerX}" y="40" text-anchor="middle" class="title-text">North Indian Chart</text>
    `;

    // Define house positions in North Indian format (diamond/square layout)
    const housePositions = [
      // Top row
      { x: centerX - houseSize, y: centerY - houseSize, house: 1, zodiac: 'Aries' },
      { x: centerX, y: centerY - houseSize, house: 2, zodiac: 'Taurus' },
      { x: centerX + houseSize, y: centerY - houseSize, house: 3, zodiac: 'Gemini' },
      
      // Middle row
      { x: centerX - houseSize, y: centerY, house: 4, zodiac: 'Cancer' },
      { x: centerX, y: centerY, house: 5, zodiac: 'Leo' },
      { x: centerX + houseSize, y: centerY, house: 6, zodiac: 'Virgo' },
      
      // Bottom row
      { x: centerX - houseSize, y: centerY + houseSize, house: 7, zodiac: 'Libra' },
      { x: centerX, y: centerY + houseSize, house: 8, zodiac: 'Scorpio' },
      { x: centerX + houseSize, y: centerY + houseSize, house: 9, zodiac: 'Sagittarius' },
      
      // Left column
      { x: centerX - houseSize * 1.5, y: centerY, house: 10, zodiac: 'Capricorn' },
      { x: centerX - houseSize * 1.5, y: centerY - houseSize, house: 11, zodiac: 'Aquarius' },
      { x: centerX - houseSize * 1.5, y: centerY + houseSize, house: 12, zodiac: 'Pisces' }
    ];

    // Draw houses
    housePositions.forEach((pos, index) => {
      const houseCenterX = pos.x + houseSize / 2;
      const houseCenterY = pos.y + houseSize / 2;
      
      // House border (square shape)
      svg += `<rect x="${pos.x}" y="${pos.y}" width="${houseSize}" height="${houseSize}" class="house-border"/>`;
      
      // House number
      svg += `<text x="${houseCenterX}" y="${houseCenterY - 15}" class="house-number">${pos.house}</text>`;
      
      // Zodiac symbol
      svg += `<text x="${houseCenterX}" y="${houseCenterY + 5}" class="zodiac-symbol">${this.getZodiacSymbol(pos.zodiac)}</text>`;
      
      // Add planets in this house
      const planetsInHouse = planets.filter(p => p.house === pos.house);
      planetsInHouse.forEach((planet, planetIndex) => {
        const planetY = houseCenterY + 20 + (planetIndex * 15);
        const symbol = this.getPlanetSymbol(planet.planet);
        
        svg += `<text x="${houseCenterX}" y="${planetY}" class="planet-symbol">${symbol}</text>`;
        svg += `<text x="${houseCenterX}" y="${planetY + 12}" class="planet-name">${planet.planet}</text>`;
        svg += `<text x="${houseCenterX}" y="${planetY + 22}" class="degree-text">${planet.degree}°${planet.minute}'</text>`;
        
        if (planet.isRetrograde) {
          svg += `<text x="${houseCenterX + 20}" y="${planetY}" class="retrograde-text">R</text>`;
        }
      });
    });

    // Add FutureSeer branding
    svg += `<text x="${centerX}" y="580" text-anchor="middle" class="branding-text">Generated by FutureSeer</text>`;
    svg += '</svg>';
    
    return {
      svg,
      metadata: {
        type: 'North Indian',
        generatedAt: new Date().toISOString(),
        ayanamsa: this.ayanamsa,
        source: 'Western Chart Conversion'
      }
    };
  }

  /**
   * Generate South Indian chart (diamond format)
   */
  private generateSouthIndianChart(planets: any[]): VedicChartImage {
    const size = 600;
    const centerX = size / 2;
    const centerY = size / 2;
    const chartRadius = size * 0.3;

    let svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .chart-bg { fill: #ffffff; stroke: #ffd700; stroke-width: 3; }
            .house-border { fill: none; stroke: #000000; stroke-width: 1; }
            .house-number { font-family: Arial, sans-serif; font-size: 16px; fill: #000000; font-weight: bold; text-anchor: middle; }
            .planet-symbol { font-family: Arial, sans-serif; font-size: 12px; fill: #000000; text-anchor: middle; }
            .planet-name { font-family: Arial, sans-serif; font-size: 7px; fill: #000000; text-anchor: middle; }
            .degree-text { font-family: Arial, sans-serif; font-size: 6px; fill: #666666; text-anchor: middle; }
            .retrograde-text { font-family: Arial, sans-serif; font-size: 7px; fill: #ff0000; font-weight: bold; }
            .title-text { font-family: Arial, sans-serif; font-size: 18px; fill: #ffd700; font-weight: bold; text-anchor: middle; }
            .branding-text { font-family: Arial, sans-serif; font-size: 12px; fill: #666666; text-anchor: middle; }
            .zodiac-symbol { font-family: Arial, sans-serif; font-size: 10px; fill: #000000; text-anchor: middle; }
          </style>
        </defs>
        
        <!-- Background with high border radius -->
        <rect width="${size}" height="${size}" rx="200" ry="200" class="chart-bg"/>
        
        <!-- Title -->
        <text x="${centerX}" y="40" text-anchor="middle" class="title-text">South Indian Chart</text>
    `;

    // Draw diamond-shaped houses
    const houseAngles = [];
    for (let i = 0; i < 12; i++) {
      houseAngles.push(i * 30);
    }

    // Draw house divisions
    houseAngles.forEach((angle, index) => {
      const nextAngle = houseAngles[(index + 1) % 12];
      const x1 = centerX + chartRadius * Math.cos((angle - 90) * Math.PI / 180);
      const y1 = centerY + chartRadius * Math.sin((angle - 90) * Math.PI / 180);
      const x2 = centerX + chartRadius * Math.cos((nextAngle - 90) * Math.PI / 180);
      const y2 = centerY + chartRadius * Math.sin((nextAngle - 90) * Math.PI / 180);
      
      // House line
      svg += `<line x1="${centerX}" y1="${centerY}" x2="${x1}" y2="${y1}" class="house-border"/>`;
      
      // House number
      const houseAngle = angle + 15;
      const houseX = centerX + (chartRadius * 0.7) * Math.cos((houseAngle - 90) * Math.PI / 180);
      const houseY = centerY + (chartRadius * 0.7) * Math.sin((houseAngle - 90) * Math.PI / 180);
      svg += `<text x="${houseX}" y="${houseY}" class="house-number">${index + 1}</text>`;
      
      // Add planets in this house
      const planetsInHouse = planets.filter(p => p.house === index + 1);
      planetsInHouse.forEach((planet, planetIndex) => {
        const planetAngle = houseAngle + (planetIndex * 5);
        const planetX = centerX + (chartRadius * 0.5) * Math.cos((planetAngle - 90) * Math.PI / 180);
        const planetY = centerY + (chartRadius * 0.5) * Math.sin((planetAngle - 90) * Math.PI / 180);
        const symbol = this.getPlanetSymbol(planet.planet);
        
        svg += `<text x="${planetX}" y="${planetY}" class="planet-symbol">${symbol}</text>`;
        svg += `<text x="${planetX}" y="${planetY + 10}" class="planet-name">${planet.planet}</text>`;
        svg += `<text x="${planetX}" y="${planetY + 18}" class="degree-text">${planet.degree}°${planet.minute}'</text>`;
        
        if (planet.isRetrograde) {
          svg += `<text x="${planetX + 15}" y="${planetY - 5}" class="retrograde-text">R</text>`;
        }
      });
    });

    // Add FutureSeer branding
    svg += `<text x="${centerX}" y="580" text-anchor="middle" class="branding-text">Generated by FutureSeer</text>`;
    svg += '</svg>';
    
    return {
      svg,
      metadata: {
        type: 'South Indian',
        generatedAt: new Date().toISOString(),
        ayanamsa: this.ayanamsa,
        source: 'Western Chart Conversion'
      }
    };
  }

  /**
   * Generate Nakshatra wheel chart
   */
  private generateNakshatraWheel(planets: any[]): VedicChartImage {
    const size = 600;
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.35;
    const middleRadius = size * 0.25;
    const innerRadius = size * 0.15;

    let svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .chart-bg { fill: #ffffff; stroke: #ffd700; stroke-width: 3; }
            .nakshatra-border { fill: none; stroke: #000000; stroke-width: 1; }
            .house-border { fill: none; stroke: #000000; stroke-width: 2; }
            .nakshatra-text { font-family: Arial, sans-serif; font-size: 8px; fill: #000000; text-anchor: middle; }
            .house-number { font-family: Arial, sans-serif; font-size: 14px; fill: #000000; font-weight: bold; text-anchor: middle; }
            .planet-symbol { font-family: Arial, sans-serif; font-size: 12px; fill: #000000; text-anchor: middle; }
            .planet-name { font-family: Arial, sans-serif; font-size: 6px; fill: #000000; text-anchor: middle; }
            .degree-text { font-family: Arial, sans-serif; font-size: 5px; fill: #666666; text-anchor: middle; }
            .retrograde-text { font-family: Arial, sans-serif; font-size: 6px; fill: #ff0000; font-weight: bold; }
            .title-text { font-family: Arial, sans-serif; font-size: 18px; fill: #ffd700; font-weight: bold; text-anchor: middle; }
            .branding-text { font-family: Arial, sans-serif; font-size: 12px; fill: #666666; text-anchor: middle; }
            .zodiac-symbol { font-family: Arial, sans-serif; font-size: 8px; fill: #000000; text-anchor: middle; }
          </style>
        </defs>
        
        <!-- Background with high border radius -->
        <rect width="${size}" height="${size}" rx="200" ry="200" class="chart-bg"/>
        
        <!-- Title -->
        <text x="${centerX}" y="40" text-anchor="middle" class="title-text">Nakshatra Wheel</text>
    `;

    // Draw outer nakshatra ring (27 nakshatras)
    for (let i = 0; i < 27; i++) {
      const angle = (i * (360 / 27)) - 90;
      const nextAngle = ((i + 1) * (360 / 27)) - 90;
      
      // Nakshatra division line
      const x1 = centerX + outerRadius * Math.cos(angle * Math.PI / 180);
      const y1 = centerY + outerRadius * Math.sin(angle * Math.PI / 180);
      const x2 = centerX + outerRadius * Math.cos(nextAngle * Math.PI / 180);
      const y2 = centerY + outerRadius * Math.sin(nextAngle * Math.PI / 180);
      
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="nakshatra-border"/>`;
      
      // Nakshatra name
      const nakshatraAngle = angle + (360 / 27 / 2);
      const nakshatraX = centerX + (outerRadius * 0.9) * Math.cos(nakshatraAngle * Math.PI / 180);
      const nakshatraY = centerY + (outerRadius * 0.9) * Math.sin(nakshatraAngle * Math.PI / 180);
      svg += `<text x="${nakshatraX}" y="${nakshatraY}" class="nakshatra-text">${this.getNakshatra(i)}</text>`;
    }

    // Draw middle house ring (12 houses)
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) - 90;
      const nextAngle = ((i + 1) * 30) - 90;
      
      // House division line
      const x1 = centerX + middleRadius * Math.cos(angle * Math.PI / 180);
      const y1 = centerY + middleRadius * Math.sin(angle * Math.PI / 180);
      const x2 = centerX + middleRadius * Math.cos(nextAngle * Math.PI / 180);
      const y2 = centerY + middleRadius * Math.sin(nextAngle * Math.PI / 180);
      
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="house-border"/>`;
      
      // House number
      const houseAngle = angle + 15;
      const houseX = centerX + (middleRadius * 0.8) * Math.cos(houseAngle * Math.PI / 180);
      const houseY = centerY + (middleRadius * 0.8) * Math.sin(houseAngle * Math.PI / 180);
      svg += `<text x="${houseX}" y="${houseY}" class="house-number">${i + 1}</text>`;
      
      // Add planets in this house
      const planetsInHouse = planets.filter(p => p.house === i + 1);
      planetsInHouse.forEach((planet, planetIndex) => {
        const planetAngle = houseAngle + (planetIndex * 8);
        const planetX = centerX + (innerRadius * 0.8) * Math.cos(planetAngle * Math.PI / 180);
        const planetY = centerY + (innerRadius * 0.8) * Math.sin(planetAngle * Math.PI / 180);
        const symbol = this.getPlanetSymbol(planet.planet);
        
        svg += `<text x="${planetX}" y="${planetY}" class="planet-symbol">${symbol}</text>`;
        svg += `<text x="${planetX}" y="${planetY + 8}" class="planet-name">${planet.planet}</text>`;
        svg += `<text x="${planetX}" y="${planetY + 14}" class="degree-text">${planet.degree}°${planet.minute}'</text>`;
        
        if (planet.isRetrograde) {
          svg += `<text x="${planetX + 10}" y="${planetY - 2}" class="retrograde-text">R</text>`;
        }
      });
    }

    // Add FutureSeer branding
    svg += `<text x="${centerX}" y="580" text-anchor="middle" class="branding-text">Generated by FutureSeer</text>`;
    svg += '</svg>';
    
    return {
      svg,
      metadata: {
        type: 'Nakshatra Wheel',
        generatedAt: new Date().toISOString(),
        ayanamsa: this.ayanamsa,
        source: 'Western Chart Conversion'
      }
    };
  }

  // Helper methods
  private getVedicSign(index: number): string {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[index % 12];
  }

  private getNakshatra(index: number): string {
    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    return nakshatras[index % 27];
  }

  private getNakshatraLord(index: number): string {
    const lords = [
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
      'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
      'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
      'Jupiter', 'Saturn', 'Mercury'
    ];
    return lords[index % 27];
  }

  private getZodiacSymbol(zodiac: string): string {
    const symbols: { [key: string]: string } = {
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
    return symbols[zodiac] || zodiac;
  }

  private getPlanetSymbol(planet: string): string {
    const symbols: { [key: string]: string } = {
      'Sun': '☉',
      'Moon': '☽',
      'Mercury': '☿',
      'Venus': '♀',
      'Mars': '♂',
      'Jupiter': '♃',
      'Saturn': '♄',
      'Uranus': '♅',
      'Neptune': '♆',
      'Pluto': '♇',
      'Mean Node': '☊',
      'True Node': '☊',
      'Ascendant': 'AS',
      'Midheaven': 'MC'
    };
    return symbols[planet] || planet;
  }

  private isPlanetExalted(planet: string, sign: string): boolean {
    const exaltations: { [key: string]: string } = {
      'Sun': 'Aries',
      'Moon': 'Taurus',
      'Mercury': 'Virgo',
      'Venus': 'Pisces',
      'Mars': 'Capricorn',
      'Jupiter': 'Cancer',
      'Saturn': 'Libra'
    };
    return exaltations[planet] === sign;
  }

  private isPlanetDebilitated(planet: string, sign: string): boolean {
    const debilitations: { [key: string]: string } = {
      'Sun': 'Libra',
      'Moon': 'Scorpio',
      'Mercury': 'Pisces',
      'Venus': 'Virgo',
      'Mars': 'Cancer',
      'Jupiter': 'Capricorn',
      'Saturn': 'Aries'
    };
    return debilitations[planet] === sign;
  }
}

/**
 * Main function to convert Western chart image to Vedic formats
 */
export function convertWesternChartImageToVedic(westernData: WesternChartImageData): {
  northIndian: VedicChartImage;
  southIndian: VedicChartImage;
  nakshatraWheel: VedicChartImage;
} {
  const converter = new WesternToVedicImageConverter(westernData);
  return converter.convertToVedicCharts();
}