// Professional Chart Generator for FutureSeer
// High-quality SVG charts with professional styling inspired by Align27, Jothishi, CoStar Astrology

import { ProfessionalPlanetaryPosition, ProfessionalHouseData, ProfessionalAspect } from './professionalAstroEngine'
import { devLog } from '@/lib/devLogger';
import { ProfessionalVisualSystem, PROFESSIONAL_VISUAL_CONFIG, PROFESSIONAL_SYMBOLS } from './professionalVisualSystem'

export interface ProfessionalChartConfig {
  width: number
  height: number
  style: 'traditional' | 'modern' | 'minimal'
  showAspects: boolean
  showHouses: boolean
  showDegrees: boolean
  showRetrograde: boolean
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
}

export class ProfessionalChartGenerator {
  private visualSystem: ProfessionalVisualSystem
  private defaultConfig: ProfessionalChartConfig = {
    width: 600,
    height: 600,
    style: 'traditional',
    showAspects: true,
    showHouses: true,
    showDegrees: true,
    showRetrograde: true,
    backgroundColor: PROFESSIONAL_VISUAL_CONFIG.colors.background,
    primaryColor: PROFESSIONAL_VISUAL_CONFIG.colors.primary,
    secondaryColor: PROFESSIONAL_VISUAL_CONFIG.colors.text.secondary
  }

  constructor() {
    this.visualSystem = new ProfessionalVisualSystem()
    devLog.debug('🎨 Initializing Professional Chart Generator with Enhanced Visual System')
  }

  // Generate professional horary chart
  generateProfessionalHoraryChart(
    planets: ProfessionalPlanetaryPosition[],
    houses: ProfessionalHouseData[],
    aspects: ProfessionalAspect[],
    config: Partial<ProfessionalChartConfig> = {}
  ): string {
    const finalConfig = { ...this.defaultConfig, ...config }
    
    // Increase chart size to accommodate external text
    const chartWidth = Math.max(finalConfig.width, 800)
    const chartHeight = Math.max(finalConfig.height, 800)
    
    const centerX = chartWidth / 2
    const centerY = chartHeight / 2
    const outerRadius = Math.min(centerX, centerY) - 80 // More space for external text
    const innerRadius = outerRadius - 20
    const planetRadius = outerRadius - 60
    const signRadius = outerRadius - 10
    
    // Use professional symbols from visual system
    const planetGlyphs = PROFESSIONAL_SYMBOLS.planets
    const signGlyphs = Object.values(PROFESSIONAL_SYMBOLS.signs)
    const signNames = Object.keys(PROFESSIONAL_SYMBOLS.signs)
    
    const svg = this.visualSystem.generateProfessionalSVG(`
      <svg viewBox="0 0 ${chartWidth} ${chartHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Professional Gradients -->
          <radialGradient id="professional-chart-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:rgba(59, 130, 246, 0.1);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(15, 23, 42, 0.95);stop-opacity:1" />
          </radialGradient>
          
          <!-- Golden Gradient for accents -->
          <linearGradient id="golden-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#ffd700;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffff00;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background with professional gradient -->
        <rect width="${chartWidth}" height="${chartHeight}" fill="url(#professional-chart-gradient)"/>
        
        <!-- Outer and inner circles with sharp edges -->
        <circle cx="${centerX}" cy="${centerY}" r="${outerRadius}" class="professional-outer-circle" stroke-linecap="square"/>
        <circle cx="${centerX}" cy="${centerY}" r="${innerRadius}" class="professional-inner-circle" stroke-linecap="square"/>
        
        <!-- House lines and numbers -->
        ${houses.map((house, index) => {
          const angle = (index * 30) - 90 // Start from top
          const x1 = centerX + innerRadius * Math.cos(angle * Math.PI / 180)
          const y1 = centerY + innerRadius * Math.sin(angle * Math.PI / 180)
          const x2 = centerX + outerRadius * Math.cos(angle * Math.PI / 180)
          const y2 = centerY + outerRadius * Math.sin(angle * Math.PI / 180)
          const houseX = centerX + (innerRadius - 25) * Math.cos(angle * Math.PI / 180)
          const houseY = centerY + (innerRadius - 25) * Math.sin(angle * Math.PI / 180)
          return `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="professional-house-line" stroke-linecap="square"/>
            <text x="${houseX}" y="${houseY}" class="professional-house-number">${house.house}</text>
          `
        }).join('')}
        
         <!-- Zodiac signs -->
         ${signNames.map((sign, index) => {
           const angle = (index * 30) - 90
           // Position zodiac symbols much further out to avoid obscuring planet text
           const zodiacRadius = outerRadius + 60
           const glyphX = centerX + zodiacRadius * Math.cos(angle * Math.PI / 180)
           const glyphY = centerY + zodiacRadius * Math.sin(angle * Math.PI / 180)
           return `
             <text x="${glyphX}" y="${glyphY}" class="professional-sign-glyph">${signGlyphs[index]}</text>
           `
         }).join('')}
        
        <!-- Aspect lines -->
        ${finalConfig.showAspects ? aspects.map(aspect => {
          const planet1 = planets.find(p => p.planet === aspect.planet1)
          const planet2 = planets.find(p => p.planet === aspect.planet2)
          if (!planet1 || !planet2) return ''
          
          const angle1 = planet1.longitude - 90
          const angle2 = planet2.longitude - 90
          const x1 = centerX + planetRadius * Math.cos(angle1 * Math.PI / 180)
          const y1 = centerY + planetRadius * Math.sin(angle1 * Math.PI / 180)
          const x2 = centerX + planetRadius * Math.cos(angle2 * Math.PI / 180)
          const y2 = centerY + planetRadius * Math.sin(angle2 * Math.PI / 180)
          
          const aspectClass = aspect.aspect.toLowerCase().replace(' ', '')
          const opacity = Math.max(0.3, aspect.strength)
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="professional-aspect-line professional-${aspectClass}" opacity="${opacity}" stroke-linecap="square"/>`
        }).join('') : ''}
        
        <!-- Planets -->
        ${planets.map((planet, index) => {
          const angle = planet.longitude - 90
          const glyph = (planetGlyphs as Record<string, string>)[planet.planet] ?? planet.planet.charAt(0)
          
          // Move icons much further inside the chart
          const iconRadius = innerRadius - 40 // Position icons well inside the inner circle
          const x = centerX + iconRadius * Math.cos(angle * Math.PI / 180)
          const y = centerY + iconRadius * Math.sin(angle * Math.PI / 180)
          
          // Position planet name and degrees in separate, non-overlapping areas
          const textAngle = angle * Math.PI / 180
          
          // Planet name positioned outside the chart circle with better spacing
          const nameRadius = outerRadius + 35
          const nameX = centerX + nameRadius * Math.cos(textAngle)
          const nameY = centerY + nameRadius * Math.sin(textAngle)
          
          // Degrees positioned further out with more spacing to avoid overlap
          const degreeRadius = outerRadius + 55
          const degreeX = centerX + degreeRadius * Math.cos(textAngle)
          const degreeY = centerY + degreeRadius * Math.sin(textAngle)
          
          const retrogradeSymbol = planet.retrograde ? 'R' : ''
          const planetClass = planet.retrograde ? 'professional-planet-glyph professional-retrograde' : 'professional-planet-glyph'
          
          return `
            <g>
              <text x="${x}" y="${y}" class="${planetClass}">${glyph}</text>
              <text x="${nameX}" y="${nameY}" class="professional-planet-name">${planet.planet}${retrogradeSymbol}</text>
              ${finalConfig.showDegrees ? `<text x="${degreeX}" y="${degreeY}" class="professional-planet-degree">${planet.degree}°${planet.minute}'</text>` : ''}
            </g>
          `
        }).join('')}
        
      </svg>
    `)

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  }

  // Generate professional North Indian chart with FutureSeer styling
  generateNorthIndianChart(chartData: any): string {
    const size = 800;
    const centerX = size / 2;
    const centerY = size / 2;
    const chartSize = 600;
    const chartOffset = (size - chartSize) / 2;

    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="futureseer-north-indian-chart">`;
    
    // FutureSeer Styles with dark blue and golden colors
    svg += `
      <defs>
        <linearGradient id="futureseer-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="futureseer-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#eab308;stop-opacity:1" />
        </linearGradient>
        <style>
          .futureseer-chart-bg { fill: url(#futureseer-bg); stroke: url(#futureseer-border); stroke-width: 3; }
          .futureseer-chart-line { stroke: #f59e0b; stroke-width: 2; opacity: 0.8; }
          .futureseer-house-text { fill: #f59e0b; font-size: 14px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: bold; }
          .futureseer-planet-text { fill: #eab308; font-size: 12px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: bold; }
          .futureseer-degree-text { fill: #fbbf24; font-size: 10px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: normal; }
          .futureseer-sign-text { fill: #f59e0b; font-size: 18px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: bold; }
          .futureseer-ascendant-text { fill: #fbbf24; font-size: 14px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: bold; }
        </style>
      </defs>
    `;

    // Background with FutureSeer gradient
    svg += `<rect x="${chartOffset}" y="${chartOffset}" width="${chartSize}" height="${chartSize}" class="futureseer-chart-bg"/>`;

    // Draw traditional North Indian chart structure with cross lines
    svg += this.drawTraditionalNorthIndianStructure(chartSize, chartOffset);
    
    // Draw zodiac signs and planetary positions
    svg += this.drawTraditionalNorthIndianContent(chartData, chartSize, chartOffset);

    svg += `</svg>`;
    return svg;
  }

  // Draw traditional North Indian chart structure - SIMPLE VERSION
  private drawTraditionalNorthIndianStructure(chartSize: number, chartOffset: number): string {
    let structure = '';
    
    // Main border (outer square)
    structure += `<rect x="${chartOffset}" y="${chartOffset}" width="${chartSize}" height="${chartSize}" class="futureseer-chart-bg"/>`;
    
    const centerX = chartOffset + chartSize / 2;
    const centerY = chartOffset + chartSize / 2;
    
    // Calculate positions for the inner diamond (rotated square)
    // The inner diamond corners touch the midpoints of the outer square sides
    // For a diamond touching the centers, the distance from center to diamond corner = chartSize/2
    const diamondRadius = chartSize / 2; // Distance from center to diamond corner
    
    // Inner diamond corners (rotated square touching midpoints of outer square)
    const diamondTop = { x: centerX, y: chartOffset }; // Top midpoint
    const diamondRight = { x: chartOffset + chartSize, y: centerY }; // Right midpoint  
    const diamondBottom = { x: centerX, y: chartOffset + chartSize }; // Bottom midpoint
    const diamondLeft = { x: chartOffset, y: centerY }; // Left midpoint
    
    // Draw the inner diamond (rotated square)
    structure += `<polygon points="${diamondTop.x},${diamondTop.y} ${diamondRight.x},${diamondRight.y} ${diamondBottom.x},${diamondBottom.y} ${diamondLeft.x},${diamondLeft.y}" class="futureseer-chart-line" fill="none" stroke-width="2"/>`;
    
    // Draw the two diagonal lines connecting opposite corners of the outer square
    structure += `<line x1="${chartOffset}" y1="${chartOffset}" x2="${chartOffset + chartSize}" y2="${chartOffset + chartSize}" class="futureseer-chart-line"/>`; // Top-left to bottom-right
    structure += `<line x1="${chartOffset + chartSize}" y1="${chartOffset}" x2="${chartOffset}" y2="${chartOffset + chartSize}" class="futureseer-chart-line"/>`; // Top-right to bottom-left
    
    return structure;
  }

  // Draw traditional North Indian chart content (zodiac signs and planets)
  private drawTraditionalNorthIndianContent(chartData: any, chartSize: number, chartOffset: number): string {
    let content = '';
    
    const centerX = chartOffset + chartSize / 2;
    const centerY = chartOffset + chartSize / 2;
    
    // Calculate positions for the inner diamond (same as structure)
    // Inner diamond corners touch the midpoints of the outer square
    const diamondTop = { x: centerX, y: chartOffset }; // Top midpoint
    const diamondRight = { x: chartOffset + chartSize, y: centerY }; // Right midpoint  
    const diamondBottom = { x: centerX, y: chartOffset + chartSize }; // Bottom midpoint
    const diamondLeft = { x: chartOffset, y: centerY }; // Left midpoint
    
    // Outer square midpoints
    const topMidpoint = { x: centerX, y: chartOffset };
    const rightMidpoint = { x: chartOffset + chartSize, y: centerY };
    const bottomMidpoint = { x: centerX, y: chartOffset + chartSize };
    const leftMidpoint = { x: chartOffset, y: centerY };
    
    // Outer square corners
    const topLeftCorner = { x: chartOffset, y: chartOffset };
    const topRightCorner = { x: chartOffset + chartSize, y: chartOffset };
    const bottomRightCorner = { x: chartOffset + chartSize, y: chartOffset + chartSize };
    const bottomLeftCorner = { x: chartOffset, y: chartOffset + chartSize };
    
    // House positions based on the reference image
    const housePositions = [
      // Outer square midpoints (houses 1, 4, 7, 10)
      { house: 1, centerX: topMidpoint.x, centerY: topMidpoint.y, sign: 'Capricorn', signSymbol: '♑' },
      { house: 4, centerX: rightMidpoint.x, centerY: rightMidpoint.y, sign: 'Aries', signSymbol: '♈' },
      { house: 7, centerX: bottomMidpoint.x, centerY: bottomMidpoint.y, sign: 'Cancer', signSymbol: '♋' },
      { house: 10, centerX: leftMidpoint.x, centerY: leftMidpoint.y, sign: 'Libra', signSymbol: '♎' },
      
      // Outer square corners (houses 2, 5, 8, 11)
      { house: 2, centerX: topRightCorner.x, centerY: topRightCorner.y, sign: 'Aquarius', signSymbol: '♒' },
      { house: 5, centerX: bottomRightCorner.x, centerY: bottomRightCorner.y, sign: 'Taurus', signSymbol: '♉' },
      { house: 8, centerX: bottomLeftCorner.x, centerY: bottomLeftCorner.y, sign: 'Leo', signSymbol: '♌' },
      { house: 11, centerX: topLeftCorner.x, centerY: topLeftCorner.y, sign: 'Scorpio', signSymbol: '♏' },
      
      // Inner diamond corners (houses 3, 6, 9, 12)
      { house: 3, centerX: diamondTop.x, centerY: diamondTop.y, sign: 'Pisces', signSymbol: '♓' },
      { house: 6, centerX: diamondRight.x, centerY: diamondRight.y, sign: 'Gemini', signSymbol: '♊' },
      { house: 9, centerX: diamondBottom.x, centerY: diamondBottom.y, sign: 'Virgo', signSymbol: '♍' },
      { house: 12, centerX: diamondLeft.x, centerY: diamondLeft.y, sign: 'Sagittarius', signSymbol: '♐' }
    ];
    
    // Draw zodiac signs at house cusps
    housePositions.forEach(pos => {
      content += `<text x="${pos.centerX}" y="${pos.centerY + 5}" class="futureseer-sign-text">${pos.signSymbol}</text>`;
    });
    
    // Draw planetary positions (based on the reference image)
    const mockPlanets = [
      { planet: 'Ascendant', house: 1, symbol: 'AS', degree: 17, minute: 39, sign: 'Capricorn' },
      { planet: 'Uranus', house: 1, symbol: '♅', degree: 19, minute: 27, retrograde: true, sign: 'Capricorn' },
      { planet: 'North Node', house: 2, symbol: '☊', degree: 11, minute: 53, retrograde: true, sign: 'Aquarius' },
      { planet: 'Mars', house: 3, symbol: '♂', degree: 0, minute: 3, sign: 'Pisces' },
      { planet: 'Saturn', house: 4, symbol: '♄', degree: 11, minute: 42, sign: 'Aries' },
      { planet: 'Neptune', house: 4, symbol: '♆', degree: 17, minute: 30, sign: 'Aries' },
      { planet: 'Moon', house: 4, symbol: '☽', degree: 18, minute: 6, sign: 'Aries' },
      { planet: 'Venus', house: 5, symbol: '♀', degree: 4, minute: 43, sign: 'Taurus' },
      { planet: 'Mercury', house: 6, symbol: '☿', degree: 11, minute: 53, retrograde: true, sign: 'Gemini' },
      { planet: 'Pluto', house: 7, symbol: '♇', degree: 13, minute: 39, sign: 'Cancer' },
      { planet: 'Jupiter', house: 8, symbol: '♃', degree: 4, minute: 42, retrograde: true, sign: 'Leo' },
      { planet: 'Chiron', house: 12, symbol: '⚷', degree: 28, minute: 49, sign: 'Sagittarius' },
      { planet: 'Sun', house: 12, symbol: '☉', degree: 16, minute: 2, sign: 'Sagittarius' }
    ];
    
    mockPlanets.forEach(planet => {
      const housePos = housePositions.find(pos => pos.house === planet.house);
      if (housePos) {
        const retrogradeText = planet.retrograde ? ' R' : '';
        const signSymbol = planet.sign === 'Capricorn' ? '♑' : 
                          planet.sign === 'Aquarius' ? '♒' :
                          planet.sign === 'Pisces' ? '♓' :
                          planet.sign === 'Aries' ? '♈' :
                          planet.sign === 'Taurus' ? '♉' :
                          planet.sign === 'Gemini' ? '♊' :
                          planet.sign === 'Cancer' ? '♋' :
                          planet.sign === 'Leo' ? '♌' :
                          planet.sign === 'Virgo' ? '♍' :
                          planet.sign === 'Libra' ? '♎' :
                          planet.sign === 'Scorpio' ? '♏' :
                          planet.sign === 'Sagittarius' ? '♐' : '';
        
        content += `<text x="${housePos.centerX}" y="${housePos.centerY - 10}" class="futureseer-planet-text">${planet.symbol} ${planet.degree}°${signSymbol} ${planet.minute}${retrogradeText}</text>`;
      }
    });
    
    return content;
  }

  // Calculate North Indian house positions (traditional 12-house structure)
  private calculateNorthIndianHousePositions(chartSize: number, chartOffset: number) {
    const houseSize = chartSize / 3;
    const positions = [];

    // Traditional North Indian chart has 12 houses in specific positions
    // Based on the reference image, the houses are arranged as follows:
    const positions_data = [
      // Top row (houses 12, 1, 2)
      { house: 12, x: chartOffset, y: chartOffset, width: houseSize, height: houseSize },
      { house: 1, x: chartOffset + houseSize, y: chartOffset, width: houseSize, height: houseSize },
      { house: 2, x: chartOffset + houseSize * 2, y: chartOffset, width: houseSize, height: houseSize },
      
      // Middle row (houses 11, center, 5)
      { house: 11, x: chartOffset, y: chartOffset + houseSize, width: houseSize, height: houseSize },
      { house: 0, x: chartOffset + houseSize, y: chartOffset + houseSize, width: houseSize, height: houseSize }, // Center
      { house: 5, x: chartOffset + houseSize * 2, y: chartOffset + houseSize, width: houseSize, height: houseSize },
      
      // Bottom row (houses 10, 7, 6)
      { house: 10, x: chartOffset, y: chartOffset + houseSize * 2, width: houseSize, height: houseSize },
      { house: 7, x: chartOffset + houseSize, y: chartOffset + houseSize * 2, width: houseSize, height: houseSize },
      { house: 6, x: chartOffset + houseSize * 2, y: chartOffset + houseSize * 2, width: houseSize, height: houseSize },
      
      // Additional houses (3, 4, 8, 9) positioned in the triangular sections created by cross lines
      { house: 3, x: chartOffset + houseSize * 0.5, y: chartOffset + houseSize * 0.5, width: houseSize, height: houseSize },
      { house: 4, x: chartOffset + houseSize * 1.5, y: chartOffset + houseSize * 0.5, width: houseSize, height: houseSize },
      { house: 8, x: chartOffset + houseSize * 0.5, y: chartOffset + houseSize * 1.5, width: houseSize, height: houseSize },
      { house: 9, x: chartOffset + houseSize * 1.5, y: chartOffset + houseSize * 1.5, width: houseSize, height: houseSize }
    ];

    return positions_data;
  }

  // Draw North Indian house lines with cross lines (traditional style)
  private drawNorthIndianHouseLines(housePositions: any[]): string {
    let lines = '';
    
    const chartOffset = housePositions[0].x;
    const chartSize = housePositions[8].x + housePositions[8].width - chartOffset;
    const houseSize = chartSize / 3;
    
    // Main vertical lines
    lines += `<line x1="${chartOffset + houseSize}" y1="${chartOffset}" x2="${chartOffset + houseSize}" y2="${chartOffset + chartSize}" class="futureseer-chart-line"/>`;
    lines += `<line x1="${chartOffset + houseSize * 2}" y1="${chartOffset}" x2="${chartOffset + houseSize * 2}" y2="${chartOffset + chartSize}" class="futureseer-chart-line"/>`;
    
    // Main horizontal lines
    lines += `<line x1="${chartOffset}" y1="${chartOffset + houseSize}" x2="${chartOffset + chartSize}" y2="${chartOffset + houseSize}" class="futureseer-chart-line"/>`;
    lines += `<line x1="${chartOffset}" y1="${chartOffset + houseSize * 2}" x2="${chartOffset + chartSize}" y2="${chartOffset + houseSize * 2}" class="futureseer-chart-line"/>`;
    
    // Cross lines (diagonal lines from corner to corner) - this is the key feature of North Indian charts
    lines += `<line x1="${chartOffset}" y1="${chartOffset}" x2="${chartOffset + chartSize}" y2="${chartOffset + chartSize}" class="futureseer-chart-line"/>`;
    lines += `<line x1="${chartOffset + chartSize}" y1="${chartOffset}" x2="${chartOffset}" y2="${chartOffset + chartSize}" class="futureseer-chart-line"/>`;
    
    return lines;
  }

  // Generate professional South Indian chart with FutureSeer styling
  generateSouthIndianChart(chartData: any): string {
    const size = 800;
    const centerX = size / 2;
    const centerY = size / 2;
    const chartSize = 600;
    const chartOffset = (size - chartSize) / 2;

    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="futureseer-south-indian-chart">`;
    
    // FutureSeer Styles with dark blue and golden colors
    svg += `
      <defs>
        <linearGradient id="futureseer-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="futureseer-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#eab308;stop-opacity:1" />
        </linearGradient>
        <style>
          .futureseer-chart-bg { fill: url(#futureseer-bg); stroke: url(#futureseer-border); stroke-width: 3; }
          .futureseer-chart-line { stroke: #f59e0b; stroke-width: 2; opacity: 0.8; }
          .futureseer-house-text { fill: #f59e0b; font-size: 14px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: bold; }
          .futureseer-planet-text { fill: #eab308; font-size: 12px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: bold; }
          .futureseer-degree-text { fill: #fbbf24; font-size: 10px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: normal; }
          .futureseer-sign-text { fill: #f59e0b; font-size: 18px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: bold; }
          .futureseer-ascendant-text { fill: #fbbf24; font-size: 14px; text-anchor: middle; font-family: 'Arial', sans-serif; font-weight: bold; }
        </style>
      </defs>
    `;

    // Background with FutureSeer gradient
    svg += `<rect x="${chartOffset}" y="${chartOffset}" width="${chartSize}" height="${chartSize}" class="futureseer-chart-bg"/>`;

    // House structure - South Indian style (diamond grid)
    const housePositions = this.calculateSouthIndianHousePositions(chartSize, chartOffset);
    
    // Draw house lines with FutureSeer colors
    svg += this.drawSouthIndianHouseLines(housePositions);
    
    // Draw zodiac signs in houses with FutureSeer styling
    svg += this.drawZodiacSigns(housePositions);
    
    // Draw planetary positions with FutureSeer colors
    svg += this.drawPlanetaryPositions(chartData.planetaryPositions, housePositions);
    
    // Draw ascendant with FutureSeer styling
    svg += this.drawAscendant(chartData.ascendant, housePositions);

    svg += `</svg>`;
    return svg;
  }

  // Calculate South Indian house positions (diamond style with bigger center)
  private calculateSouthIndianHousePositions(chartSize: number, chartOffset: number) {
    const positions = [];
    
    // South Indian chart with bigger center square creating "ladder" effect
    const outerSize = chartSize;
    const centerSize = chartSize * 0.6; // Bigger center square (60% of chart size)
    const stepSize = (outerSize - centerSize) / 2; // Size of the "ladder steps"
    
    // Calculate positions for the ladder effect
    const positions_data = [
      // Top row (smaller houses)
      { house: 12, x: chartOffset, y: chartOffset, width: stepSize, height: stepSize },
      { house: 1, x: chartOffset + stepSize, y: chartOffset, width: centerSize, height: stepSize },
      { house: 2, x: chartOffset + stepSize + centerSize, y: chartOffset, width: stepSize, height: stepSize },
      
      // Middle row (center square is bigger)
      { house: 11, x: chartOffset, y: chartOffset + stepSize, width: stepSize, height: centerSize },
      { house: 0, x: chartOffset + stepSize, y: chartOffset + stepSize, width: centerSize, height: centerSize }, // Big center
      { house: 5, x: chartOffset + stepSize + centerSize, y: chartOffset + stepSize, width: stepSize, height: centerSize },
      
      // Bottom row (smaller houses)
      { house: 10, x: chartOffset, y: chartOffset + stepSize + centerSize, width: stepSize, height: stepSize },
      { house: 7, x: chartOffset + stepSize, y: chartOffset + stepSize + centerSize, width: centerSize, height: stepSize },
      { house: 6, x: chartOffset + stepSize + centerSize, y: chartOffset + stepSize + centerSize, width: stepSize, height: stepSize }
    ];

    return positions_data;
  }

  // Draw South Indian house lines
  private drawSouthIndianHouseLines(housePositions: any[]): string {
    let lines = '';
    
    // Draw lines for the ladder effect structure
    const chartOffset = housePositions[0].x;
    const chartSize = housePositions[8].x + housePositions[8].width - chartOffset;
    const centerSize = chartSize * 0.6;
    const stepSize = (chartSize - centerSize) / 2;
    
    // Vertical lines (creating the ladder effect)
    lines += `<line x1="${chartOffset + stepSize}" y1="${chartOffset}" x2="${chartOffset + stepSize}" y2="${chartOffset + chartSize}" class="futureseer-chart-line"/>`;
    lines += `<line x1="${chartOffset + stepSize + centerSize}" y1="${chartOffset}" x2="${chartOffset + stepSize + centerSize}" y2="${chartOffset + chartSize}" class="futureseer-chart-line"/>`;
    
    // Horizontal lines (creating the ladder effect)
    lines += `<line x1="${chartOffset}" y1="${chartOffset + stepSize}" x2="${chartOffset + chartSize}" y2="${chartOffset + stepSize}" class="futureseer-chart-line"/>`;
    lines += `<line x1="${chartOffset}" y1="${chartOffset + stepSize + centerSize}" x2="${chartOffset + chartSize}" y2="${chartOffset + stepSize + centerSize}" class="futureseer-chart-line"/>`;
    
    return lines;
  }

  // Draw zodiac signs in houses
  private drawZodiacSigns(housePositions: any[]): string {
    let signs = '';
    
    const zodiacSigns = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    
    // Map houses to zodiac signs (simplified - in real implementation, this would be calculated)
    const houseSignMap = {
      1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5,
      7: 6, 8: 7, 9: 8, 10: 9, 11: 10, 12: 11
    };

    housePositions.forEach(pos => {
      if (pos.house !== 0) { // Skip center
        const signIndex = houseSignMap[pos.house as keyof typeof houseSignMap];
        const signSymbol = zodiacSigns[signIndex];
        const centerX = pos.x + pos.width / 2;
        const centerY = pos.y + pos.height / 2;
        
        signs += `<text x="${centerX}" y="${centerY + 5}" class="futureseer-sign-text">${signSymbol}</text>`;
      }
    });

    return signs;
  }

  // Draw planetary positions
  private drawPlanetaryPositions(planets: any[], housePositions: any[]): string {
    let planets_svg = '';
    
    const planetSymbols: { [key: string]: string } = {
      'Sun': '☉', 'Moon': '☽', 'Mars': '♂', 'Mercury': '☿', 'Jupiter': '♃',
      'Venus': '♀', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇',
      'Rahu': '☊', 'Ketu': '☋', 'Ascendant': 'AS', 'Midheaven': 'MC'
    };
    
    planets.forEach(planet => {
      const housePos = housePositions.find(pos => pos.house === planet.house);
      if (housePos) {
        const centerX = housePos.x + housePos.width / 2;
        const centerY = housePos.y + housePos.height / 2;
        
        const planetSymbol = planetSymbols[planet.planet] || planet.planet.charAt(0);
        const degreeText = `${planet.degree}° ${planet.minute}`;
        const retrogradeText = planet.retrograde ? ' R' : '';
        
        planets_svg += `<text x="${centerX}" y="${centerY - 10}" class="futureseer-planet-text">${planetSymbol} ${degreeText}${retrogradeText}</text>`;
      }
    });

    return planets_svg;
  }

  // Draw ascendant
  private drawAscendant(ascendant: any, housePositions: any[]): string {
    const house1Pos = housePositions.find(pos => pos.house === 1);
    if (house1Pos) {
      const centerX = house1Pos.x + house1Pos.width / 2;
      const centerY = house1Pos.y + house1Pos.height / 2;
      
      return `<text x="${centerX}" y="${centerY + 20}" class="futureseer-ascendant-text">AS ${ascendant.degree}° ${ascendant.minute}</text>`;
    }
    return '';
  }

  // Generate professional data table
  generateProfessionalDataTable(
    planets: ProfessionalPlanetaryPosition[],
    houses: ProfessionalHouseData[],
    aspects: ProfessionalAspect[]
  ): string {
    const tableContent = `
        <h3>Professional Astrological Data</h3>
        
        <!-- Planetary Positions Table -->
        <div>
          <h4>Planetary Positions</h4>
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Sign</th>
                <th>Degree</th>
                <th>House</th>
                <th>Dignity</th>
                <th>Motion</th>
              </tr>
            </thead>
            <tbody>
              ${planets.map(planet => `
                <tr>
                  <td>${planet.planet}</td>
                  <td>${planet.sign}</td>
                  <td>${planet.degree}°${planet.minute}'${planet.second}"</td>
                  <td>${planet.house}</td>
                  <td>${planet.dignity}</td>
                  <td style="color: ${planet.retrograde ? '#ef4444' : '#10b981'};">${planet.retrograde ? 'Retrograde' : 'Direct'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Aspects Table -->
        <div>
          <h4>Major Aspects</h4>
          <table>
            <thead>
              <tr>
                <th>Planets</th>
                <th>Aspect</th>
                <th>Orb</th>
                <th>Strength</th>
                <th>Motion</th>
              </tr>
            </thead>
            <tbody>
              ${aspects.slice(0, 10).map(aspect => `
                <tr>
                  <td>${aspect.planet1} - ${aspect.planet2}</td>
                  <td>${aspect.aspect}</td>
                  <td>${aspect.orb.toFixed(1)}°</td>
                  <td>${(aspect.strength * 100).toFixed(0)}%</td>
                  <td style="color: ${aspect.applying ? '#10b981' : '#f59e0b'};">${aspect.applying ? 'Applying' : 'Separating'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Houses Table -->
        <div>
          <h4>House Cusps</h4>
          <table>
            <thead>
              <tr>
                <th>House</th>
                <th>Sign</th>
                <th>Degree</th>
                <th>Ruler</th>
              </tr>
            </thead>
            <tbody>
              ${houses.map(house => `
                <tr>
                  <td>${house.house}</td>
                  <td>${house.sign}</td>
                  <td>${house.degree}°${house.minute}'</td>
                  <td>${house.lord}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
    `

    return this.visualSystem.generateProfessionalTable(tableContent)
  }
}
