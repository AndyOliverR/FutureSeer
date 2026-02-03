"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Planet {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
  house: number;
}

interface House {
  number: number;
  sign: string;
  planets: string[];
}

interface Lot {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
  house: number;
}

interface HellenisticChartWheelProps {
  planets: Planet[];
  houses: House[];
  lots?: Lot[];
  ascendant: {
    sign: string;
    degree: number;
    longitude: number;
  };
  width?: number;
  height?: number;
}

// FutureSeer color scheme - amber/gold palette with variations
const SIGN_COLORS: { [key: string]: string } = {
  'Aries': '#F59E0B',      // amber-500
  'Taurus': '#FCD34D',     // amber-300
  'Gemini': '#FBBF24',     // amber-400
  'Cancer': '#F59E0B',     // amber-500
  'Leo': '#FCD34D',        // amber-300
  'Virgo': '#FBBF24',      // amber-400
  'Libra': '#F59E0B',      // amber-500
  'Scorpio': '#FCD34D',    // amber-300
  'Sagittarius': '#FBBF24', // amber-400
  'Capricorn': '#F59E0B',   // amber-500
  'Aquarius': '#FCD34D',    // amber-300
  'Pisces': '#FBBF24'       // amber-400
};

const PLANET_COLORS: { [key: string]: string } = {
  'Sun': '#FFD700',        // gold
  'Moon': '#FCD34D',       // amber-300 (lighter gold)
  'Mercury': '#F59E0B',    // amber-500
  'Venus': '#FBBF24',      // amber-400
  'Mars': '#DC2626',       // red-600 (for Mars, but muted)
  'Jupiter': '#F59E0B',    // amber-500
  'Saturn': '#92400E'       // amber-800 (darker amber)
};

export default function HellenisticChartWheel({
  planets,
  houses,
  lots = [],
  ascendant,
  width = 600,
  height = 600
}: HellenisticChartWheelProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) * 0.4;
  const middleRadius = outerRadius * 0.7;
  const innerRadius = outerRadius * 0.5;

  // Convert longitude to angle (0° = Aries, counter-clockwise)
  const longitudeToAngle = (longitude: number): number => {
    return (longitude - 90) * (Math.PI / 180); // -90 to start at top
  };

  // Convert angle to position
  const angleToPosition = (angle: number, radius: number) => {
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  // Get sign index
  const getSignIndex = (sign: string): number => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs.indexOf(sign);
  };

  // Calculate house positions (Whole Sign - each sign is a house)
  const housePositions = houses.map((house, index) => {
    const signIndex = getSignIndex(house.sign);
    const startAngle = (signIndex * 30 - 90) * (Math.PI / 180);
    const endAngle = ((signIndex + 1) * 30 - 90) * (Math.PI / 180);
    const midAngle = (startAngle + endAngle) / 2;
    
    return {
      ...house,
      startAngle,
      endAngle,
      midAngle,
      position: angleToPosition(midAngle, middleRadius)
    };
  });

  // Calculate planet positions
  const planetPositions = planets.map(planet => {
    const angle = longitudeToAngle(planet.longitude);
    return {
      ...planet,
      angle,
      position: angleToPosition(angle, outerRadius * 0.85)
    };
  });

  // Calculate lot positions
  const lotPositions = lots.map(lot => {
    const angle = longitudeToAngle(lot.longitude);
    return {
      ...lot,
      angle,
      position: angleToPosition(angle, outerRadius * 0.75)
    };
  });

  return (
    <div className="relative flex items-center justify-center" role="img" aria-label="Hellenistic astrology chart wheel showing planetary positions in Whole Sign Houses">
      <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
        {/* Outer circle - Zodiac signs */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="none"
          stroke="rgba(251, 191, 36, 0.4)"
          strokeWidth="2.5"
          className="transition-opacity duration-300"
        />

        {/* Draw house segments (Whole Sign Houses) */}
        {housePositions.map((house, index) => {
          const signIndex = getSignIndex(house.sign);
          const startAngle = (signIndex * 30 - 90) * (Math.PI / 180);
          const endAngle = ((signIndex + 1) * 30 - 90) * (Math.PI / 180);
          
          const x1 = centerX + outerRadius * Math.cos(startAngle);
          const y1 = centerY + outerRadius * Math.sin(startAngle);
          const x2 = centerX + outerRadius * Math.cos(endAngle);
          const y2 = centerY + outerRadius * Math.sin(endAngle);
          
          const largeArc = 0; // Each sign is 30 degrees
          
          return (
            <g key={`house-${house.number}`}>
              {/* House segment */}
              <path
                d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={SIGN_COLORS[house.sign] || '#F59E0B'}
                fillOpacity="0.2"
                stroke="rgba(251, 191, 36, 0.5)"
                strokeWidth="1.5"
              className="cursor-pointer transition-all duration-300 ease-in-out hover:opacity-60 hover:stroke-amber-400"
              onMouseEnter={() => setHoveredElement(`house-${house.number}`)}
              onMouseLeave={() => setHoveredElement(null)}
              aria-label={`House ${house.number} in ${house.sign}`}
              role="button"
              tabIndex={0}
              />
              
              {/* House number and sign label */}
              <text
                x={house.position.x}
                y={house.position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-slate-800 font-semibold pointer-events-none"
              >
                {house.number}
              </text>
              
              {/* Sign abbreviation */}
              <text
                x={house.position.x}
                y={house.position.y + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] fill-slate-700 font-medium pointer-events-none"
              >
                {house.sign.substring(0, 3)}
              </text>
            </g>
          );
        })}

        {/* Draw aspect lines (simplified - would need actual aspect calculations) */}
        
        {/* Draw planets */}
        {planetPositions.map(planet => (
          <g key={planet.name}>
            <circle
              cx={planet.position.x}
              cy={planet.position.y}
              r="12"
              fill={PLANET_COLORS[planet.name] || '#FBBF24'}
              stroke="rgba(251, 191, 36, 0.9)"
              strokeWidth="2.5"
              className="cursor-pointer transition-all duration-300 ease-in-out hover:scale-125 hover:stroke-amber-400 hover:stroke-width-3"
              onMouseEnter={() => setHoveredElement(`planet-${planet.name}`)}
              onMouseLeave={() => setHoveredElement(null)}
              aria-label={`${planet.name} in ${planet.sign} at ${planet.degree.toFixed(1)} degrees in House ${planet.house}`}
              role="button"
              tabIndex={0}
            />
            <text
              x={planet.position.x}
              y={planet.position.y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-slate-800 font-medium pointer-events-none"
            >
              {planet.name.substring(0, 3)}
            </text>
            {hoveredElement === `planet-${planet.name}` && (
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <rect
                  x={planet.position.x - 40}
                  y={planet.position.y - 50}
                  width="80"
                  height="30"
                  fill="rgba(20, 25, 50, 0.95)"
                  rx="6"
                  stroke="rgba(251, 191, 36, 0.6)"
                  strokeWidth="1"
                />
                <text
                  x={planet.position.x}
                  y={planet.position.y - 35}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-amber-300 font-semibold"
                >
                  {planet.name} in {planet.sign}
                </text>
                <text
                  x={planet.position.x}
                  y={planet.position.y - 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] fill-amber-400"
                >
                  {planet.degree.toFixed(1)}° - House {planet.house}
                </text>
              </motion.g>
            )}
          </g>
        ))}

        {/* Draw Lots */}
        {lotPositions.map(lot => (
          <g key={lot.name}>
            <polygon
              points={`${lot.position.x},${lot.position.y - 8} ${lot.position.x - 6},${lot.position.y + 6} ${lot.position.x + 6},${lot.position.y + 6}`}
              fill="#FBBF24"
              stroke="rgba(251, 191, 36, 0.9)"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-300 ease-in-out hover:scale-125 hover:fill-amber-400 hover:stroke-amber-300"
              onMouseEnter={() => setHoveredElement(`lot-${lot.name}`)}
              onMouseLeave={() => setHoveredElement(null)}
              aria-label={`${lot.name} in ${lot.sign} at ${lot.degree.toFixed(1)} degrees in House ${lot.house}`}
              role="button"
              tabIndex={0}
            />
            <text
              x={lot.position.x}
              y={lot.position.y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] fill-slate-800 font-medium pointer-events-none"
            >
              {lot.name.includes('Fortune') ? 'PF' : 'PS'}
            </text>
            {hoveredElement === `lot-${lot.name}` && (
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <rect
                  x={lot.position.x - 50}
                  y={lot.position.y - 50}
                  width="100"
                  height="40"
                  fill="rgba(20, 25, 50, 0.95)"
                  rx="6"
                  stroke="rgba(251, 191, 36, 0.6)"
                  strokeWidth="1"
                />
                <text
                  x={lot.position.x}
                  y={lot.position.y - 35}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-amber-300 font-semibold"
                >
                  {lot.name}
                </text>
                <text
                  x={lot.position.x}
                  y={lot.position.y - 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] fill-amber-400"
                >
                  {lot.sign} {lot.degree.toFixed(1)}° - H{lot.house}
                </text>
              </motion.g>
            )}
          </g>
        ))}

        {/* Ascendant line */}
        {(() => {
          const ascAngle = longitudeToAngle(ascendant.longitude);
          const ascPos = angleToPosition(ascAngle, outerRadius);
          return (
            <g>
              <line
                x1={centerX}
                y1={centerY}
                x2={ascPos.x}
                y2={ascPos.y}
                stroke="#FBBF24"
                strokeWidth="2.5"
                strokeDasharray="5,5"
                opacity="0.7"
                className="transition-opacity duration-300"
              />
              <text
                x={ascPos.x + 10}
                y={ascPos.y}
                textAnchor="start"
                dominantBaseline="middle"
                className="text-xs fill-amber-400 font-bold"
              >
                ASC
              </text>
            </g>
          );
        })()}

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="rgba(15, 23, 42, 0.85)"
          stroke="rgba(251, 191, 36, 0.6)"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />
        
        {/* Center text */}
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm fill-amber-300 font-semibold"
        >
          Whole Sign
        </text>
        <text
          x={centerX}
          y={centerY + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-amber-400"
        >
          Houses
        </text>
      </svg>
    </div>
  );
}

