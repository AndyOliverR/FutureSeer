"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  calculateChartDimensions, 
  longitudeToPosition, 
  calculateHouseCusp,
  calculateAspectLine,
  getZodiacSignColor,
  getPlanetColor,
  getAspectColor,
  type ChartDimensions,
  type PlanetPosition
} from '@/lib/western/chartGeometry';
import { getPlanetGlyph, getZodiacSymbol } from '@/lib/western/planetGlyphs';

interface Planet {
  name: string;
  longitude: number;
  sign: string;
  house: number;
  degree: number;
  isRetrograde?: boolean;
}

interface House {
  number: number;
  cusp: number;
  sign: string;
  lord: string;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength: number;
  influence: 'harmonious' | 'challenging' | 'neutral';
}

interface WesternChartWheelProps {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  width?: number;
  height?: number;
}

export default function WesternChartWheel({ 
  planets, 
  houses, 
  aspects, 
  width = 800, 
  height = 800 
}: WesternChartWheelProps) {
  const [dimensions, setDimensions] = useState<ChartDimensions | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  useEffect(() => {
    setDimensions(calculateChartDimensions(width, height));
  }, [width, height]);

  if (!dimensions) return null;

  const { centerX, centerY, innerRadius, middleRadius, outerRadius } = dimensions;

  // Generate zodiac sign segments
  const zodiacSegments = Array.from({ length: 12 }, (_, i) => {
    const startAngle = i * 30;
    const endAngle = (i + 1) * 30;
    const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    return {
      sign: signNames[i],
      startAngle,
      endAngle,
      color: getZodiacSignColor(signNames[i])
    };
  });

  // Calculate planet positions
  const planetPositions = planets.map(planet => ({
    ...planet,
    position: longitudeToPosition(planet.longitude, outerRadius, centerX, centerY)
  }));

  // Calculate house cusps
  const houseCusps = houses.map(house => 
    calculateHouseCusp(house.cusp, dimensions)
  );

  // Calculate aspect lines (only major aspects)
  const majorAspects = aspects.filter(aspect => 
    ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(aspect.type)
  );

  const aspectLines = majorAspects.map(aspect => {
    const planet1 = planets.find(p => p.name === aspect.planet1);
    const planet2 = planets.find(p => p.name === aspect.planet2);
    
    if (!planet1 || !planet2) return null;
    
    return {
      ...aspect,
      line: calculateAspectLine(planet1.longitude, planet2.longitude, dimensions)
    };
  }).filter(Boolean);

  return (
    <div className="relative w-full h-full">
      <svg width={width} height={height} className="w-full h-full">
        <rect width={width} height={height} fill="#ffffff" />
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="#ffffff"
          stroke="#3b82f6"
          strokeWidth="1"
        />

        {/* Zodiac sign segments */}
        {zodiacSegments.map((segment, index) => {
          const startAngleRad = (segment.startAngle - 90) * (Math.PI / 180);
          const endAngleRad = (segment.endAngle - 90) * (Math.PI / 180);
          
          const largeArcFlag = segment.endAngle - segment.startAngle <= 180 ? "0" : "1";
          
          const x1 = centerX + innerRadius * Math.cos(startAngleRad);
          const y1 = centerY + innerRadius * Math.sin(startAngleRad);
          const x2 = centerX + innerRadius * Math.cos(endAngleRad);
          const y2 = centerY + innerRadius * Math.sin(endAngleRad);
          
          const pathData = [
            `M ${x1} ${y1}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${centerX} ${centerY}`,
            'Z'
          ].join(' ');

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={segment.color}
                fillOpacity="0.1"
                stroke={segment.color}
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
              {/* Zodiac sign labels */}
              <text
                x={centerX + (innerRadius * 0.7) * Math.cos((segment.startAngle + 15 - 90) * (Math.PI / 180))}
                y={centerY + (innerRadius * 0.7) * Math.sin((segment.startAngle + 15 - 90) * (Math.PI / 180))}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-amber-300 font-semibold"
              >
                {getZodiacSymbol(segment.sign)}
              </text>
            </g>
          );
        })}

        {/* House cusp lines */}
        {houseCusps.map((cusp, index) => (
          <line
            key={index}
            x1={cusp.x1}
            y1={cusp.y1}
            x2={cusp.x2}
            y2={cusp.y2}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
          />
        ))}

        {/* Aspect lines */}
        {aspectLines.map((aspect, index) => {
          if (!aspect?.line) return null;
          
          return (
            <motion.line
              key={index}
              x1={aspect.line.x1}
              y1={aspect.line.y1}
              x2={aspect.line.x2}
              y2={aspect.line.y2}
              stroke={getAspectColor(aspect.type)}
              strokeWidth={aspect.strength > 0.8 ? 2 : 1}
              strokeOpacity={aspect.strength}
              strokeDasharray={aspect.influence === 'challenging' ? '5,5' : 'none'}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          );
        })}

        {/* Planets */}
        {planetPositions.map((planet, index) => (
          <motion.g
            key={planet.name}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseEnter={() => setHoveredPlanet(planet.name)}
            onMouseLeave={() => setHoveredPlanet(null)}
            className="cursor-pointer"
          >
            {/* Planet circle */}
            <circle
              cx={planet.position.x}
              cy={planet.position.y}
              r="12"
              fill={getPlanetColor(planet.name)}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="1"
              className="hover:r-4 transition-all duration-200"
            />
            
            {/* Planet glyph */}
            <text
              x={planet.position.x}
              y={planet.position.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-white font-bold"
            >
              {getPlanetGlyph(planet.name)}
            </text>
            
            {/* Retrograde indicator */}
            {planet.isRetrograde && (
              <text
                x={planet.position.x + 15}
                y={planet.position.y - 15}
                className="text-xs fill-red-400 font-bold"
              >
                R
              </text>
            )}
            
            {/* Planet tooltip */}
            {hoveredPlanet === planet.name && (
              <motion.foreignObject
                x={planet.position.x + 20}
                y={planet.position.y - 30}
                width="200"
                height="60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none"
              >
                <div className="bg-slate-900/90 backdrop-blur-sm border border-amber-500/50 rounded-lg p-2 text-xs text-white">
                  <div className="font-semibold text-amber-300">{planet.name}</div>
                  <div>{planet.sign} {planet.degree.toFixed(1)}°</div>
                  <div>House {planet.house}</div>
                </div>
              </motion.foreignObject>
            )}
          </motion.g>
        ))}

        {/* Center point */}
        <circle
          cx={centerX}
          cy={centerY}
          r="3"
          fill="rgba(255, 255, 255, 0.8)"
        />
      </svg>
      
      {/* Chart legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 text-xs text-white">
        <div className="font-semibold text-amber-300 mb-2">Chart Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span>Harmonious aspects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Challenging aspects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span>Neutral aspects</span>
          </div>
        </div>
      </div>
    </div>
  );
}
