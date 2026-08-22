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

// Distinct sign hues (not gold) used only as cool pastel tints; houses themselves stay white.
const SIGN_COLORS: { [key: string]: string } = {
  'Aries': '#fecaca',
  'Taurus': '#fed7aa',
  'Gemini': '#fde68a',
  'Cancer': '#a5f3fc',
  'Leo': '#fde047',
  'Virgo': '#bbf7d0',
  'Libra': '#bfdbfe',
  'Scorpio': '#c4b5fd',
  'Sagittarius': '#93c5fd',
  'Capricorn': '#cbd5e1',
  'Aquarius': '#67e8f9',
  'Pisces': '#a5b4fc'
};

const PLANET_COLORS: { [key: string]: string } = {
  'Sun': '#f59e0b',
  'Moon': '#64748b',
  'Mercury': '#22c55e',
  'Venus': '#ec4899',
  'Mars': '#ef4444',
  'Jupiter': '#3b82f6',
  'Saturn': '#57534e'
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
          stroke="rgba(59, 130, 246, 0.45)"
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
                fill="#ffffff"
                fillOpacity="1"
                stroke="#3b82f6"
                strokeWidth="1.5"
              className="cursor-pointer transition-all duration-300 ease-in-out hover:opacity-80 hover:stroke-sky-500"
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
                className="text-[10px] font-medium pointer-events-none"
              fill={SIGN_COLORS[house.sign] || '#334155'}
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
              fill={PLANET_COLORS[planet.name] || '#3b82f6'}
              stroke="#3b82f6"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-300 ease-in-out hover:stroke-sky-500 hover:stroke-width-3"
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
                  fill="rgba(255, 255, 255, 0.98)"
                  rx="6"
                  stroke="#3b82f6"
                  strokeWidth="1"
                />
                <text
                  x={planet.position.x}
                  y={planet.position.y - 35}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-sky-800 font-semibold"
                >
                  {planet.name} in {planet.sign}
                </text>
                <text
                  x={planet.position.x}
                  y={planet.position.y - 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] fill-slate-600"
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
              fill="#3b82f6"
              stroke="#2563eb"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-300 ease-in-out hover:fill-sky-500 hover:stroke-sky-400"
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
                  fill="rgba(255, 255, 255, 0.98)"
                  rx="6"
                  stroke="#3b82f6"
                  strokeWidth="1"
                />
                <text
                  x={lot.position.x}
                  y={lot.position.y - 35}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-sky-800 font-semibold"
                >
                  {lot.name}
                </text>
                <text
                  x={lot.position.x}
                  y={lot.position.y - 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] fill-slate-600"
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
                stroke="#3b82f6"
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
                className="text-xs fill-sky-700 font-bold"
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
          fill="#ffffff"
          stroke="#3b82f6"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />
        
        {/* Center text */}
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm fill-sky-800 font-semibold"
        >
          Whole Sign
        </text>
        <text
          x={centerX}
          y={centerY + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-slate-600"
        >
          Houses
        </text>
      </svg>
    </div>
  );
}

