"use client";
import React from "react";

// Match the same interface as North/South Indian charts
interface PlanetData {
  name: string;
  sign: number;
  degreeInSign: number;
  isRetrograde?: boolean;
}

interface VedicChartEastProps {
  planets: PlanetData[];
  ascendantSign: number;
  ascendantDegree?: number;
  chartType?: string;
}

const VedicChartEast: React.FC<VedicChartEastProps> = ({
  planets,
  ascendantSign,
  ascendantDegree = 0,
  chartType = "D1"
}) => {
  // Chart dimensions (matching South Indian chart)
  const chartWidth = 550;
  const chartHeight = 400;
  const boxWidth = 550 / 3;  // ≈ 183.33
  const boxHeight = 400 / 3; // ≈ 133.33

  // Simple planet symbols mapping
  const planetSymbols: { [key: string]: string } = {
  'Sun': '☉',
  'Moon': '☽', 
  'Mars': '♂',
  'Mercury': '☿',
  'Jupiter': '♃',
  'Venus': '♀',
  'Saturn': '♄',
  'Rahu': '☊',
  'Ketu': '☋'
  };

// Zodiac sign symbols
  const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

  // Calculate house positions for East Indian chart (same as South Indian)
  const getHouseSign = (houseNumber: number) => {
    return (ascendantSign + houseNumber - 1) % 12;
  };

  // Get planets in a specific house
  const getPlanetsInHouse = (houseNumber: number) => {
    const houseSign = getHouseSign(houseNumber);
    return planets.filter(planet => planet.sign === houseSign);
  };

  // Get planet color
  const getPlanetColor = (planetName: string): string => {
    switch (planetName) {
      case 'Sun':
      case 'Mars':
        return '#EF4444'; // Red
      case 'Moon':
      case 'Venus':
        return '#3B82F6'; // Blue
      case 'Mercury':
        return '#10B981'; // Green
      case 'Jupiter':
        return '#EC4899'; // Magenta
      case 'Saturn':
      case 'Rahu':
      case 'Ketu':
        return '#000000'; // Black
      default:
        return '#6B7280'; // Gray
    }
  };

  // Format planet position: "25° 30'" (degrees and minutes)
  const formatPlanetPosition = (planet: PlanetData): string => {
    const degrees = Math.floor(planet.degreeInSign);
    const minutes = Math.floor((planet.degreeInSign % 1) * 60);
    return `${degrees}° ${minutes}'`;
  };

  // Define the 3x3 grid layout (East Indian convention - Lagna at top-middle)
  const boxPositions = [
    { row: 0, col: 0, house: 12 },  // Top-left (corner with diagonal)
    { row: 0, col: 1, house: 1 },   // Top-middle ← ASCENDANT HERE
    { row: 0, col: 2, house: 2 },   // Top-right (corner with diagonal)
    { row: 1, col: 0, house: 11 },  // Middle-left
    { row: 1, col: 1, house: null }, // Center (empty)
    { row: 1, col: 2, house: 3 },   // Middle-right
    { row: 2, col: 0, house: 10 },  // Bottom-left (corner with diagonal)
    { row: 2, col: 1, house: 9 },   // Bottom-middle
    { row: 2, col: 2, house: 8 }    // Bottom-right (corner with diagonal)
  ];

  // Corner boxes that need diagonal lines
  const cornerBoxes = [
    { row: 0, col: 0 },  // Top-left
    { row: 0, col: 2 },  // Top-right
    { row: 2, col: 0 },  // Bottom-left
    { row: 2, col: 2 }   // Bottom-right
  ];

  // Function to get diagonal line coordinates for corner box
  const getCornerDiagonalLine = (row: number, col: number) => {
    const x = col * boxWidth;
    const y = row * boxHeight;
    
    if (row === 0 && col === 0) {
      // Top-left: inner bottom-right to outer top-left
      return { x1: x + boxWidth, y1: y + boxHeight, x2: x, y2: y };
    } else if (row === 0 && col === 2) {
      // Top-right: inner bottom-left to outer top-right
      return { x1: x, y1: y + boxHeight, x2: x + boxWidth, y2: y };
    } else if (row === 2 && col === 0) {
      // Bottom-left: inner top-right to outer bottom-left
      return { x1: x + boxWidth, y1: y, x2: x, y2: y + boxHeight };
    } else if (row === 2 && col === 2) {
      // Bottom-right: inner top-left to outer bottom-right
      return { x1: x, y1: y, x2: x + boxWidth, y2: y + boxHeight };
    }
    return null;
  };

  return (
    <div style={{ display: 'inline-block', lineHeight: 0 }}>
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="border-2 border-blue-800 bg-white shadow-lg"
        style={{ borderRadius: '12px', display: 'block' }}
      >
        {/* White background */}
        <rect 
          width={chartWidth} 
          height={chartHeight} 
          fill="#FFFFFF"
        />
        
        {/* Clip path for rounded corners */}
        <defs>
          <clipPath id="eastIndianClip">
            <rect 
              width={chartWidth} 
              height={chartHeight} 
              rx="12" 
              ry="12"
            />
          </clipPath>
        </defs>
        
        {/* Apply clip path */}
        <g clipPath="url(#eastIndianClip)">
          
          {/* Grid lines - horizontal */}
          {[0, 1, 2, 3].map(i => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * boxHeight}
              x2={chartWidth}
              y2={i * boxHeight}
              stroke="#000000"
              strokeWidth="2"
            />
          ))}
          
          {/* Grid lines - vertical */}
          {[0, 1, 2, 3].map(i => (
            <line
              key={`v-${i}`}
              x1={i * boxWidth}
              y1={0}
              x2={i * boxWidth}
              y2={chartHeight}
              stroke="#000000"
              strokeWidth="2"
            />
          ))}

          {/* Diagonal lines for corner boxes */}
          {cornerBoxes.map(({ row, col }) => {
            const diagonal = getCornerDiagonalLine(row, col);
            if (diagonal) {
                return (
                  <line 
                  key={`diagonal-${row}-${col}`}
                  x1={diagonal.x1}
                  y1={diagonal.y1}
                  x2={diagonal.x2}
                  y2={diagonal.y2}
                    stroke="#000000" 
                  strokeWidth="2"
                />
              );
            }
            return null;
          })}

          {/* Houses content */}
          {boxPositions.map(({ row, col, house }) => {
            if (house === null) return null; // Skip center box
            
            const x = col * boxWidth;
            const y = row * boxHeight;
            const houseSign = getHouseSign(house);
            const planetsInHouse = getPlanetsInHouse(house);
            const isCornerBox = cornerBoxes.some(corner => corner.row === row && corner.col === col);

            return (
              <g key={`house-${house}`}>
                {/* Zodiac sign symbol */}
              <text
                  x={x + boxWidth / 2}
                  y={y + 30}
                  fontSize="24"
                  fill="#9333EA"
                  textAnchor="middle"
                fontWeight="bold"
              >
                  {zodiacSymbols[houseSign]}
              </text>
              
                {/* Ascendant marker */}
                {house === 1 && (
                  <g>
              <text
                      x={x + boxWidth - 20}
                      y={y + 20}
                fontSize="12"
                      fill="#EF4444"
                fontWeight="bold"
                      textAnchor="middle"
              >
                      AS {Math.floor(ascendantDegree)}° {Math.floor((ascendantDegree % 1) * 60)}'
              </text>
                    <line
                      x1={x + boxWidth - 30}
                      y1={y + 25}
                      x2={x + boxWidth - 10}
                      y2={y + boxHeight - 10}
                      stroke="#000000"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Planets */}
                {planetsInHouse.map((planet, planetIndex) => {
                  const planetColor = getPlanetColor(planet.name);
                  const planetText = `${planetSymbols[planet.name] || planet.name.charAt(0)} ${formatPlanetPosition(planet)}${planet.isRetrograde ? ' ℞' : ''}`;
                  
                  // Position text away from diagonal line in corner boxes
                  let textX = x + 10;
                  let textY = y + 60 + (planetIndex * 16);
                  
                  if (isCornerBox) {
                    if ((row === 0 && col === 0) || (row === 2 && col === 2)) {
                      // Top-left and bottom-right corners: position text to the left
                      textX = x + 10;
                    } else {
                      // Top-right and bottom-left corners: position text to the right
                      textX = x + boxWidth - 10;
                    }
                  }
                
                return (
                    <text
                      key={`planet-${planet.name}-${house}`}
                      x={textX}
                      y={textY}
                      fontSize="11"
                      fill={planetColor}
                      textAnchor={isCornerBox ? (textX < x + boxWidth/2 ? "start" : "end") : "start"}
                    >
                      {planetText}
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

export default VedicChartEast;