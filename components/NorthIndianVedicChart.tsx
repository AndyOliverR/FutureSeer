"use client";
import React from "react";

interface PlanetData {
  name: string;
  sign: number;
  degreeInSign: number;
  isRetrograde?: boolean;
}

interface NorthIndianVedicChartProps {
  planets: PlanetData[];
  ascendantSign: number;
  ascendantDegree?: number;
  chartType?: string;
  /** Optional dimensions; when provided (e.g. 450x333), match South Indian chart size for consistent layout */
  width?: number;
  height?: number;
}

const NorthIndianVedicChart: React.FC<NorthIndianVedicChartProps> = ({
  planets,
  ascendantSign,
  ascendantDegree = 0,
  chartType = "D1",
  width: widthProp,
  height: heightProp
}) => {
  const BASE_WIDTH = 550;
  const BASE_HEIGHT = 400;
  // Default 550x400; width/height props are applied via outer SVG size while viewBox stays stable.
  const chartWidth = widthProp ?? BASE_WIDTH;
  const chartHeight = heightProp ?? BASE_HEIGHT;

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

  // Color scheme from reference image
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
      case 'Rahu':
      case 'Ketu': return '#000000'; // Black
      default: return '#6B7280';
    }
  };

  // House position coordinates in fixed logical viewBox space
  const getHousePosition = (houseNumber: number) => {
    const basePositions: Record<number, { x: number; y: number }> = {
      1: { x: 275, y: 35 },
      2: { x: 420, y: 80 },
      3: { x: 480, y: 200 },
      4: { x: 410, y: 310 },
      5: { x: 275, y: 365 },
      6: { x: 130, y: 320 },
      7: { x: 70, y: 200 },
      8: { x: 130, y: 80 },
      9: { x: 185, y: 290 },
      10: { x: 350, y: 125 },
      11: { x: 350, y: 275 },
      12: { x: 200, y: 275 }
    };
    const pos = basePositions[houseNumber];
    return pos;
  };

  // House number label positions in fixed logical viewBox space
  const getHouseNumberPosition = (houseNumber: number) => {
    const basePositions: Record<number, { x: number; y: number }> = {
      1: { x: 275, y: 15 },
      2: { x: 360, y: 50 },
      3: { x: 490, y: 120 },
      4: { x: 490, y: 280 },
      5: { x: 360, y: 350 },
      6: { x: 275, y: 385 },
      7: { x: 190, y: 350 },
      8: { x: 60, y: 280 },
      9: { x: 60, y: 120 },
      10: { x: 190, y: 50 },
      11: { x: 275, y: 100 },
      12: { x: 275, y: 300 }
    };
    const pos = basePositions[houseNumber];
    return pos;
  };

  // Calculate house from planet sign
  const calculateHouseFromSign = (planetSign: number, ascSign: number): number => {
    let house = (planetSign - ascSign + 1);
    if (house <= 0) house += 12;
    if (house > 12) house -= 12;
    return house;
  };

  // Format planet text
  const formatPlanetText = (planet: PlanetData): string => {
    const symbol = planetSymbols[planet.name] || planet.name.charAt(0);  // Add fallback
    const degrees = Math.floor(planet.degreeInSign);
    const minutes = Math.floor((planet.degreeInSign % 1) * 60);
    const retrograde = planet.isRetrograde ? ' ℞' : '';
    return `${symbol} ${degrees}° ${minutes}'${retrograde}`;
  };

  return (
    <svg
      width={chartWidth}
      height={chartHeight}
      viewBox={`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="bg-white"
      shapeRendering="geometricPrecision"
      style={{ display: 'block', margin: 0, padding: 0, verticalAlign: 'top', maxWidth: '100%', height: 'auto' }}
    >
        {/* White background */}
        <rect 
          width={chartWidth} 
          height={chartHeight} 
          fill="#FFFFFF"
        />
        
        {/* Outer rectangle */}
        <rect
          x="0"
          y="0"
          width={chartWidth}
          height={chartHeight}
          fill="none"
          stroke="black"
          strokeWidth="2"
        />

        {/* X Line 1: top-left to bottom-right */}
        <line
          x1="0"
          y1="0"
          x2={chartWidth}
          y2={chartHeight}
          stroke="black"
          strokeWidth="1.6"
        />
        
        {/* X Line 2: top-right to bottom-left */}
        <line
          x1={chartWidth}
          y1="0"
          x2="0"
          y2={chartHeight}
          stroke="black"
          strokeWidth="1.6"
        />

        {/* Central tilted diamond - corners touching rectangle midpoints */}
        <polygon
          points={`${chartWidth / 2},0 ${chartWidth},${chartHeight / 2} ${chartWidth / 2},${chartHeight} 0,${chartHeight / 2}`}
          fill="none"
          stroke="black"
          strokeWidth="1.6"
        />

        {/* House numbers - Fixed positions in corners/edges */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(houseNum => {
          const pos = getHouseNumberPosition(houseNum);
          
          return (
            <text
              key={`house-${houseNum}`}
              x={pos.x}
              y={pos.y}
              fontSize={9}
              fill="#4B5563"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="Arial, Helvetica, 'Segoe UI', sans-serif"
            >
              {houseNum}
            </text>
          );
        })}

        {/* Ascendant marker */}
        <text
          x={getHousePosition(1).x}
          y={getHousePosition(1).y}
          fontSize={12}
          fill="#EF4444"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, 'Segoe UI', sans-serif"
        >
          AS {Math.floor(ascendantDegree)}° {Math.floor((ascendantDegree % 1) * 60)}'
        </text>

        {/* Planets */}
        {planets.map((planet, index) => {
          const houseNumber = calculateHouseFromSign(planet.sign, ascendantSign);
          const position = getHousePosition(houseNumber);
          const planetColor = getPlanetColor(planet.name);
          const planetText = formatPlanetText(planet);
          
          // Handle multiple planets in same house
          const planetsInSameHouse = planets.filter(p => 
            calculateHouseFromSign(p.sign, ascendantSign) === houseNumber
          );
          const indexInHouse = planetsInSameHouse.indexOf(planet);
          
          // Add offset for Ascendant in House 1
          const ascendantOffset = houseNumber === 1 ? 14 : 0;
          
          return (
            <text
              key={`planet-${index}`}
              x={position.x}
              y={position.y + ascendantOffset + (indexInHouse * 14)} // Stack below Ascendant if House 1
              fontSize={11}
              fill={planetColor}
              fontWeight="600"
              textAnchor="middle"
              fontFamily="Arial, Helvetica, 'Segoe UI Symbol', sans-serif"
            >
              {planetText}
            </text>
          );
        })}
      </svg>
  );
};

export default NorthIndianVedicChart;