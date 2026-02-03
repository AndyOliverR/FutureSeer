"use client";
import React from "react";

// Match the same interface as North/East Indian charts
interface PlanetData {
  name: string;
  sign: number;
  degreeInSign: number;
  isRetrograde?: boolean;
}

interface VedicChartSouthProps {
  planets: PlanetData[];
  ascendantSign: number;
  ascendantDegree?: number;
  chartType?: string;
}

const VedicChartSouth: React.FC<VedicChartSouthProps> = ({
  planets,
  ascendantSign,
  ascendantDegree = 0,
  chartType = "D1"
}) => {
  // Planet symbols mapping
  const planetSymbols: { [key: string]: string } = {
  'Sun': '☉',
  'Moon': '☽', 
  'Mars': '♂',
  'Mercury': '☿',
  'Jupiter': '♃',
  'Venus': '♀',
  'Saturn': '♄',
  'Rahu': '☊',
    'Ketu': '☋',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇'
  };

  // Zodiac sign symbols
  const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  const zodiacNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  // Planet color scheme matching the reference image
  const getPlanetColor = (planetName: string): string => {
    switch(planetName) {
      case 'Sun':
      case 'Mars': return '#EF4444'; // Red
      case 'Moon':
      case 'Mercury':
      case 'Venus': return '#3B82F6'; // Blue
      case 'Jupiter': return '#8B5CF6'; // Purple
      case 'Saturn':
      case 'Uranus':
      case 'Neptune':
      case 'Pluto':
      case 'Rahu': return '#000000'; // Black
      case 'Ketu': return '#000000'; // Black
      default: return '#6B7280'; // Gray
    }
  };

  // Format planet position: "25° 30'" (degrees and minutes)
  const formatPlanetPosition = (planet: PlanetData): string => {
    const degrees = Math.floor(planet.degreeInSign);
    const minutes = Math.floor((planet.degreeInSign % 1) * 60);
    return `${degrees}° ${minutes}'`;
  };

  // Fixed zodiac positions in South Indian layout with proper spacing
  const zodiacLayout = [
    // Row 0 - TOP ROW (4 boxes)
    { zodiac: 11, row: 0, col: 0, boxNumber: 12 }, // Pisces
    { zodiac: 0, row: 0, col: 1, boxNumber: 1 },   // Aries
    { zodiac: 1, row: 0, col: 2, boxNumber: 2 },   // Taurus
    { zodiac: 2, row: 0, col: 3, boxNumber: 3 },   // Gemini
    
    // Row 1 - MIDDLE ROW (2 boxes on edges, 2 empty in center)
    { zodiac: 10, row: 1, col: 0, boxNumber: 11 }, // Aquarius (left edge)
    { zodiac: 3, row: 1, col: 3, boxNumber: 4 },   // Cancer (right edge)
    
    // Row 2 - MIDDLE ROW (2 boxes on edges, 2 empty in center)
    { zodiac: 9, row: 2, col: 0, boxNumber: 10 },  // Capricorn (left edge)
    { zodiac: 4, row: 2, col: 3, boxNumber: 5 },   // Leo (right edge)
    
    // Row 3 - BOTTOM ROW (4 boxes)
    { zodiac: 8, row: 3, col: 0, boxNumber: 9 },   // Sagittarius
    { zodiac: 7, row: 3, col: 1, boxNumber: 8 },   // Scorpio
    { zodiac: 6, row: 3, col: 2, boxNumber: 7 },   // Libra
    { zodiac: 5, row: 3, col: 3, boxNumber: 6 }    // Virgo
  ];

  // Get planets in a specific zodiac sign
  const getPlanetsInZodiac = (zodiacSign: number) => {
    return planets.filter(planet => planet.sign === zodiacSign);
  };

  // Box dimensions and spacing
  const boxWidth = 137.5;  // Box width
  const boxHeight = 100; // Box height
  const gapX = 0;        // No horizontal gap between boxes
  const gapY = 0;        // No vertical gap between boxes
  const margin = 0;      // No margin - boxes go to edges

  // Calculate box position with spacing
  const getBoxPosition = (row: number, col: number) => ({
    x: col * (boxWidth + gapX) + margin,
    y: row * (boxHeight + gapY) + margin
  });

  // Calculate total chart dimensions
  const totalWidth = 4 * boxWidth + 2 * margin; // 4 columns + margins (no gaps)
  const totalHeight = 4 * boxHeight + 2 * margin; // 4 rows + margins (no gaps)
  const fontSize = 12;

  return (
    <div style={{ display: 'inline-block', lineHeight: 0 }}>
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="border-2 border-blue-800 bg-white shadow-lg"
        style={{ borderRadius: '12px', display: 'block' }}
      >
        <defs>
          <clipPath id="rounded-corners">
            <rect 
              width={totalWidth} 
              height={totalHeight} 
              rx="12" 
              ry="12"
            />
          </clipPath>
        </defs>
        
        {/* Apply clip path to main content */}
        <g clipPath="url(#rounded-corners)">
          {/* White background with rounded corners */}
          <rect 
            width={totalWidth} 
            height={totalHeight} 
            fill="#FFFFFF" 
            rx="12" 
            ry="12"
          />
        
        {/* Render each zodiac box separately with spacing */}
        {zodiacLayout.map((layout, index) => {
          const { zodiac, row, col } = layout;
          const position = getBoxPosition(row, col);
          const { x, y } = position;
          const zodiacSymbol = zodiacSymbols[zodiac];
          const planetsInZodiac = getPlanetsInZodiac(zodiac);
          
          return (
            <g key={`zodiac-${zodiac}`}>
              {/* Box border */}
              <rect 
                x={x} 
                y={y} 
                width={boxWidth} 
                height={boxHeight}
                fill="#FFFFFF"
                  stroke="#000000" 
                  strokeWidth="1"
                />
              
              {/* Diagonal Ascendant line for the zodiac sign that matches ascendantSign */}
              {zodiac === ascendantSign && (
                <g>
                  {/* Diagonal line from top-right to bottom-left */}
                  <line
                    x1={x + boxWidth}
                    y1={y}
                    x2={x}
                    y2={y + boxHeight}
                    stroke="#EC4899"
                    strokeWidth="2"
                  />
                  
                  {/* AS marker text away from diagonal */}
                  <text
                    x={x + boxWidth * 0.25}
                    y={y + boxHeight * 0.45}
                    fontSize={10}
                    fill="#EF4444"
                    fontWeight="bold"
                  >
                    AS {Math.floor(ascendantDegree)}° {Math.floor((ascendantDegree % 1) * 60)}'
                  </text>
                </g>
              )}

              {/* Enhanced zodiac sign symbol */}
              <text
                x={x + boxWidth - 35}
                y={y + 30}
                fontSize={24}
                fill="#7C3AED"
                fontWeight="bold"
                opacity="0.8"
              >
                {zodiacSymbol}
              </text>
              
              {/* Planets in this zodiac sign */}
              {planetsInZodiac.map((planet, planetIndex) => {
                const planetSymbol = planetSymbols[planet.name] || planet.name.charAt(0);
                const planetColor = getPlanetColor(planet.name);
                const positionText = formatPlanetPosition(planet);
                const retrogradeText = planet.isRetrograde ? ' ℞' : '';
                
                return (
                    <text
                    key={`${planet.name}-${zodiac}`}
                    x={x + 10}
                    y={y + 65 + (planetIndex * 18)}
                    fontSize={fontSize}
                      fill={planetColor}
                    fontWeight="normal"
                    >
                    {planetSymbol} {positionText}{retrogradeText}
                    </text>
                );
              })}
            </g>
          );
        })}
        </g>

      </svg>
    </div>
  );
};

export default VedicChartSouth;
export { VedicChartSouth as SouthIndianVedicChart };