/**
 * Professional North Indian Chart Generator
 * Generates AstroApp.com style North Indian charts with user's actual data
 */

export interface PlanetaryPosition {
  planet: string;
  degree: number;
  minute: number;
  sign: string;
  house: number;
  retrograde?: boolean;
}

export interface ChartData {
  planetaryPositions: PlanetaryPosition[];
  ascendant: {
    degree: number;
    minute: number;
    sign: string;
  };
  userInfo: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  };
}

export class ProfessionalNorthIndianChartGenerator {
  private readonly zodiacSigns = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  private readonly signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  private readonly planetSymbols: { [key: string]: string } = {
    'Sun': '☉', 'Moon': '☽', 'Mars': '♂', 'Mercury': '☿', 'Jupiter': '♃',
    'Venus': '♀', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇',
    'Rahu': '☊', 'Ketu': '☋', 'Ascendant': 'AS', 'Midheaven': 'MC'
  };

  /**
   * Generate a professional North Indian chart SVG
   */
  generateChart(chartData: ChartData): string {
    const size = 800;
    const centerX = size / 2;
    const centerY = size / 2;
    const chartSize = 600;
    const chartOffset = (size - chartSize) / 2;

    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" className="professional-north-indian-chart">`;
    
    // Styles
    svg += `
      <defs>
        <style>
          .chart-bg { fill: #ffffff; stroke: #000000; stroke-width: 2; }
          .chart-line { stroke: #000000; stroke-width: 1; }
          .house-text { fill: #000000; font-size: 14px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: normal; }
          .planet-text { fill: #000000; font-size: 12px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: normal; }
          .degree-text { fill: #000000; font-size: 10px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: normal; }
          .sign-text { fill: #000000; font-size: 16px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: normal; }
        </style>
      </defs>
    `;

    // Background
    svg += `<rect x="${chartOffset}" y="${chartOffset}" width="${chartSize}" height="${chartSize}" class="chart-bg"/>`;

    // House structure - North Indian style (square grid)
    const housePositions = this.calculateHousePositions(chartSize, chartOffset);
    
    // Draw house lines
    svg += this.drawHouseLines(housePositions);
    
    // Draw zodiac signs in houses
    svg += this.drawZodiacSigns(housePositions);
    
    // Draw planetary positions
    svg += this.drawPlanetaryPositions(chartData.planetaryPositions, housePositions);
    
    // Draw ascendant
    svg += this.drawAscendant(chartData.ascendant, housePositions);

    svg += `</svg>`;
    return svg;
  }

  /**
   * Calculate house positions for North Indian chart
   */
  private calculateHousePositions(chartSize: number, chartOffset: number) {
    const houseSize = chartSize / 3;
    const positions = [];

    // North Indian chart has 9 main positions (3x3 grid)
    const positions_data = [
      { house: 12, x: chartOffset, y: chartOffset, width: houseSize, height: houseSize },
      { house: 1, x: chartOffset + houseSize, y: chartOffset, width: houseSize, height: houseSize },
      { house: 2, x: chartOffset + houseSize * 2, y: chartOffset, width: houseSize, height: houseSize },
      { house: 11, x: chartOffset, y: chartOffset + houseSize, width: houseSize, height: houseSize },
      { house: 0, x: chartOffset + houseSize, y: chartOffset + houseSize, width: houseSize, height: houseSize }, // Center
      { house: 5, x: chartOffset + houseSize * 2, y: chartOffset + houseSize, width: houseSize, height: houseSize },
      { house: 10, x: chartOffset, y: chartOffset + houseSize * 2, width: houseSize, height: houseSize },
      { house: 7, x: chartOffset + houseSize, y: chartOffset + houseSize * 2, width: houseSize, height: houseSize },
      { house: 6, x: chartOffset + houseSize * 2, y: chartOffset + houseSize * 2, width: houseSize, height: houseSize }
    ];

    return positions_data;
  }

  /**
   * Draw house lines
   */
  private drawHouseLines(housePositions: any[]): string {
    let lines = '';
    
    // Vertical lines
    const chartOffset = housePositions[0].x;
    const chartSize = housePositions[8].x + housePositions[8].width - chartOffset;
    const houseSize = chartSize / 3;
    
    lines += `<line x1="${chartOffset + houseSize}" y1="${chartOffset}" x2="${chartOffset + houseSize}" y2="${chartOffset + chartSize}" class="chart-line"/>`;
    lines += `<line x1="${chartOffset + houseSize * 2}" y1="${chartOffset}" x2="${chartOffset + houseSize * 2}" y2="${chartOffset + chartSize}" class="chart-line"/>`;
    
    // Horizontal lines
    lines += `<line x1="${chartOffset}" y1="${chartOffset + houseSize}" x2="${chartOffset + chartSize}" y2="${chartOffset + houseSize}" class="chart-line"/>`;
    lines += `<line x1="${chartOffset}" y1="${chartOffset + houseSize * 2}" x2="${chartOffset + chartSize}" y2="${chartOffset + houseSize * 2}" class="chart-line"/>`;
    
    return lines;
  }

  /**
   * Draw zodiac signs in houses
   */
  private drawZodiacSigns(housePositions: any[]): string {
    let signs = '';
    
    // Map houses to zodiac signs (simplified - in real implementation, this would be calculated)
    const houseSignMap = {
      1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5,
      7: 6, 8: 7, 9: 8, 10: 9, 11: 10, 12: 11
    };

    housePositions.forEach(pos => {
      if (pos.house !== 0) { // Skip center
        const signIndex = houseSignMap[pos.house as keyof typeof houseSignMap];
        const signSymbol = this.zodiacSigns[signIndex];
        const centerX = pos.x + pos.width / 2;
        const centerY = pos.y + pos.height / 2;
        
        signs += `<text x="${centerX}" y="${centerY + 5}" class="sign-text">${signSymbol}</text>`;
      }
    });

    return signs;
  }

  /**
   * Draw planetary positions
   */
  private drawPlanetaryPositions(planets: PlanetaryPosition[], housePositions: any[]): string {
    let planets_svg = '';
    
    planets.forEach(planet => {
      const housePos = housePositions.find(pos => pos.house === planet.house);
      if (housePos) {
        const centerX = housePos.x + housePos.width / 2;
        const centerY = housePos.y + housePos.height / 2;
        
        const planetSymbol = this.planetSymbols[planet.planet] || planet.planet.charAt(0);
        const degreeText = `${planet.degree}° ${planet.minute}`;
        const retrogradeText = planet.retrograde ? ' R' : '';
        
        planets_svg += `<text x="${centerX}" y="${centerY - 10}" class="planet-text">${planetSymbol} ${degreeText}${retrogradeText}</text>`;
      }
    });

    return planets_svg;
  }

  /**
   * Draw ascendant
   */
  private drawAscendant(ascendant: any, housePositions: any[]): string {
    const house1Pos = housePositions.find(pos => pos.house === 1);
    if (house1Pos) {
      const centerX = house1Pos.x + house1Pos.width / 2;
      const centerY = house1Pos.y + house1Pos.height / 2;
      
      return `<text x="${centerX}" y="${centerY + 20}" class="planet-text">AS ${ascendant.degree}° ${ascendant.minute}</text>`;
    }
    return '';
  }
}
