"use client";

import React from 'react';
import { 
  calculateChartDimensions, 
  longitudeToPosition, 
  calculateHouseCusp,
  calculateAspectLine,
  getZodiacSignColor,
  getPlanetColor,
  getAspectColor,
  generateZodiacArc,
  calculateDegreeMarkers,
  positionHouseLabel,
  getVibrantZodiacColors,
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
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
}

interface StaticWesternChartProps {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  width?: number;
  height?: number;
}

export default function StaticWesternChart({ 
  planets, 
  houses, 
  aspects, 
  width = 400, 
  height = 400 
}: StaticWesternChartProps) {
  const dimensions = calculateChartDimensions(width, height);
  const { centerX, centerY, innerRadius, middleRadius, outerRadius } = dimensions;

  // Generate zodiac sign segments with vibrant colors
  const vibrantColors = getVibrantZodiacColors();
  const zodiacSegments = Array.from({ length: 12 }, (_, i) => {
    const startAngle = i * 30;
    const endAngle = (i + 1) * 30;
    const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    return {
      sign: signNames[i],
      symbol: getZodiacSymbol(signNames[i]),
      startAngle,
      endAngle,
      color: vibrantColors[signNames[i]]
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

  // Generate degree markers (every 10 degrees)
  const degreeMarkers = calculateDegreeMarkers(centerX, centerY, outerRadius, 10);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg 
        viewBox="0 0 800 800" 
        className="w-full h-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        <rect width="800" height="800" fill="#ffffff" />
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius + 20}
          fill="#ffffff"
          stroke="#3b82f6"
          strokeWidth="1"
        />

        {/* Zodiac Sign Arcs */}
        {zodiacSegments.map((segment, index) => {
          const pathData = generateZodiacArc(centerX, centerY, outerRadius, segment.startAngle, segment.endAngle);
          const midAngle = (segment.startAngle + segment.endAngle) / 2;
          const symbolPosition = positionHouseLabel(centerX, centerY, outerRadius - 20, midAngle);

          return (
            <g key={segment.sign}>
              {/* Zodiac arc */}
              <path
                d={pathData}
                fill={segment.color}
                stroke="rgba(0, 0, 0, 0.3)"
                strokeWidth="0.5"
              />
              
              {/* Zodiac symbol */}
              <text
                x={symbolPosition.x}
                y={symbolPosition.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-white font-bold"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {segment.symbol}
              </text>
            </g>
          );
        })}

        {/* Degree markers */}
        {degreeMarkers.map((marker, index) => (
          <line
            key={index}
            x1={marker.x1}
            y1={marker.y1}
            x2={marker.x2}
            y2={marker.y2}
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth={marker.angle % 30 === 0 ? "2" : "1"}
          />
        ))}

        {/* House division lines */}
        {houseCusps.map((cusp, index) => (
          <line
            key={index}
            x1={cusp.x1}
            y1={cusp.y1}
            x2={cusp.x2}
            y2={cusp.y2}
            stroke="rgba(0, 0, 0, 0.8)"
            strokeWidth="2"
          />
        ))}

        {/* House numbers */}
        {houses.map((house, index) => {
          const labelPosition = positionHouseLabel(centerX, centerY, middleRadius + 15, house.cusp);
          
          return (
            <text
              key={index}
              x={labelPosition.x}
              y={labelPosition.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-white font-bold"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
            >
              {house.number}
            </text>
          );
        })}

        {/* Aspect lines */}
        {aspectLines.map((aspect, index) => {
          if (!aspect || !aspect.line) return null;
          
          const lineColor = aspect.nature === 'challenging' ? '#FF0000' : 
                           aspect.nature === 'harmonious' ? '#0000FF' : '#888888';
          const lineWidth = aspect.nature === 'challenging' ? '3' : '2';
          
          return (
            <line
              key={index}
              x1={aspect.line.x1}
              y1={aspect.line.y1}
              x2={aspect.line.x2}
              y2={aspect.line.y2}
              stroke={lineColor}
              strokeWidth={lineWidth}
              opacity="0.7"
            />
          );
        })}

        {/* Planets */}
        {planetPositions.map((planet, index) => (
          <g key={planet.name}>
            {/* Planet circle */}
            <circle
              cx={planet.position.x}
              cy={planet.position.y}
              r="12"
              fill={getPlanetColor(planet.name)}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="1"
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
          </g>
        ))}

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="8"
          fill="rgba(255, 255, 255, 0.9)"
          stroke="rgba(0, 0, 0, 0.5)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
