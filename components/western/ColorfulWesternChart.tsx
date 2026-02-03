'use client'

import React, { useState, useEffect } from 'react'

interface Planet {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  isRetrograde?: boolean;
  sign?: string;
  degree?: number;
  house?: number;
}

interface House {
  number: number;
  sign: string;
  degree: number;
  longitude: number;
  cusp: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength: number;
  exact: boolean;
}

interface ColorfulWesternChartProps {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  width?: number;
  height?: number;
  title?: string;
  backgroundColor?: string;
}

export default function ColorfulWesternChart({ 
  planets, 
  houses, 
  aspects, 
  width = 550, 
  height = 400,
  title = "Western Astrology Chart",
  backgroundColor = "white"
}: ColorfulWesternChartProps) {
  const [dimensions, setDimensions] = useState<{ centerX: number; centerY: number; outerRadius: number; innerRadius: number } | null>(null);

  useEffect(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.40; // Step 1: Increase to 40% for proper sizing (80% of page)
    const outerRadius = baseRadius; // Main circle edge
    const innerRadius = outerRadius * 0.55; // Step 2: Inner "chart hole" at 55% (50-60% range)
    
    setDimensions({ centerX, centerY, outerRadius, innerRadius });
  }, [width, height]);

  if (!dimensions) return null;

  const { centerX, centerY, outerRadius, innerRadius } = dimensions;

  // Vibrant zodiac colors matching reference image exactly
  const zodiacColors = {
    'Aries': '#FF0000',        // Red
    'Taurus': '#FF8000',       // Orange
    'Gemini': '#FFAA00',       // Yellow-orange
    'Cancer': '#FFFF00',       // Yellow
    'Leo': '#80FF00',          // Lime green
    'Virgo': '#00FF00',        // Bright green
    'Libra': '#00FF80',        // Teal
    'Scorpio': '#00FFFF',      // Dark teal/blue-green
    'Sagittarius': '#0080FF',  // Dark blue/purple
    'Capricorn': '#8000FF',    // Dark purple
    'Aquarius': '#FF00FF',     // Purple-pink
    'Pisces': '#FF0080'        // Bright pink
  };

  // Zodiac symbols
  const zodiacSymbols = {
    'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
    'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
    'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
  };

  // Planet symbols
  const planetSymbols = {
    'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀',
    'Mars': '♂', 'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅',
    'Neptune': '♆', 'Pluto': '♇', 'North Node': '☊', 'South Node': '☋'
  };

  // Convert longitude to position on circle
  const longitudeToPosition = (longitude: number, radius: number) => {
    const angle = (longitude - 90) * (Math.PI / 180); // -90 to start from top
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  // Generate zodiac arc path
  const generateZodiacArc = (startAngle: number, endAngle: number, radius: number) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${centerX} ${centerY} Z`;
  };

  // Calculate degree markers - REMOVED to prevent duplicate "0°" markers
  // The zodiac band already renders "0°" markers at each sign boundary
  const generateDegreeMarkers = () => {
    return []; // Return empty array to prevent duplicate markers
  };

  // Get zodiac sign from longitude
  const getSignFromLongitude = (longitude: number): string => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  };

  // Format degree display with zodiac symbol
  const formatDegree = (degree: number): string => {
    const degrees = Math.floor(degree);
    return `${degrees}°`;
  };

  // Format degree with zodiac symbol (for planetary positions)
  const formatDegreeWithSign = (longitude: number): string => {
    const degreeInSign = longitude % 30;
    const sign = getSignFromLongitude(longitude);
    const degrees = Math.floor(degreeInSign);
    return `${degrees}° ${zodiacSymbols[sign as keyof typeof zodiacSymbols]}`;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg 
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Background */}
        <rect width={width} height={height} fill={backgroundColor} />
        
        {/* Center dot - Step 1: Mark exact center */}
        <circle
          cx={centerX}
          cy={centerY}
          r="2"
          fill="black"
        />
        
        {/* Outer circle - white ring area for degree markers only */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius + 20}
          fill="none"
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth="1"
        />

        {/* Inner chart hole - Step 2: Inner blank circle (50-60% of big circle) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill={backgroundColor}
          stroke="black"
          strokeWidth="1"
        />

        {/* Zodiac sign arcs with vibrant colors - CRITICAL FIX: OUTER RIM of main circle */}
        {Array.from({ length: 12 }, (_, i) => {
          const startAngle = i * 30;
          const endAngle = (i + 1) * 30;
          const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                           'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
          const sign = signNames[i];
          const midAngle = (startAngle + endAngle) / 2;
          
          // CRITICAL FIX: Colored band is outer rim FROM 85% to 100% of main radius
          const bandInnerRadius = outerRadius * 0.85;
          const bandOuterRadius = outerRadius;
          const symbolPos = longitudeToPosition(midAngle, bandInnerRadius + (bandOuterRadius - bandInnerRadius) / 2);
          
          return (
            <g key={sign}>
              {/* Zodiac arc - positioned as OUTER RIM of main circle */}
              <path
                d={`M ${centerX + bandInnerRadius * Math.cos((startAngle - 90) * Math.PI / 180)} ${centerY + bandInnerRadius * Math.sin((startAngle - 90) * Math.PI / 180)} 
                   A ${bandInnerRadius} ${bandInnerRadius} 0 0 1 ${centerX + bandInnerRadius * Math.cos((endAngle - 90) * Math.PI / 180)} ${centerY + bandInnerRadius * Math.sin((endAngle - 90) * Math.PI / 180)}
                   L ${centerX + bandOuterRadius * Math.cos((endAngle - 90) * Math.PI / 180)} ${centerY + bandOuterRadius * Math.sin((endAngle - 90) * Math.PI / 180)}
                   A ${bandOuterRadius} ${bandOuterRadius} 0 0 0 ${centerX + bandOuterRadius * Math.cos((startAngle - 90) * Math.PI / 180)} ${centerY + bandOuterRadius * Math.sin((startAngle - 90) * Math.PI / 180)}
                   Z`}
                fill={zodiacColors[sign as keyof typeof zodiacColors]}
                stroke="rgba(0, 0, 0, 0.3)"
                strokeWidth="0.5"
              />
              
              {/* Zodiac symbol - WHITE on colored band - THINNER */}
              <text
                x={symbolPos.x}
                y={symbolPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '14px', fill: 'white', fontWeight: '500' }}
              >
                {zodiacSymbols[sign as keyof typeof zodiacSymbols]}
              </text>
              
              {/* 0° marker for each sign - OUTSIDE main circle - THINNER */}
              <text
                x={longitudeToPosition(startAngle, outerRadius + 15).x}
                y={longitudeToPosition(startAngle, outerRadius + 15).y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '8px', fill: 'black', fontWeight: '400' }}
              >
                0°
              </text>
            </g>
          );
        })}

        {/* Degree markers */}
        {generateDegreeMarkers()}

        {/* House division lines - Step 5: 4 Bold Spokes */}
        {houses.map((house, index) => {
          const pos = longitudeToPosition(house.longitude, outerRadius);
          // Step 5: Make 4 cardinal spokes THICKER and DARKER
          const isCardinal = index === 0 || index === 3 || index === 6 || index === 9; // Asc, IC, Desc, MC
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={pos.x}
              y2={pos.y}
              stroke="black"
              strokeWidth={isCardinal ? "2" : "0.5"}
              strokeOpacity={isCardinal ? "1" : "0.7"}
            />
          );
        })}

        {/* House numbers - inside colored band */}
        {houses.map((house, index) => {
          const bandInnerRadius = outerRadius * 0.85;
          const bandOuterRadius = outerRadius;
          const houseNumberRadius = bandInnerRadius + (bandOuterRadius - bandInnerRadius) * 0.3;
          const pos = longitudeToPosition(house.longitude + 15, houseNumberRadius);
          return (
            <text
              key={index}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '10px', fill: 'black', fontWeight: '400' }}
            >
              {house.number}
            </text>
          );
        })}

        {/* House cusp degrees - positioned outside main circle, WITH zodiac symbols */}
        {houses.map((house, index) => {
          const pos = longitudeToPosition(house.longitude, outerRadius + 25);
          const sign = getSignFromLongitude(house.longitude);
          const degrees = Math.floor(house.degree);
          const formattedDegree = degrees < 10 ? `0${degrees}°` : `${degrees}°`;
          
          return (
            <text
              key={index}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '8px', fill: 'black', fontWeight: '400' }}
            >
              {formattedDegree} {zodiacSymbols[sign as keyof typeof zodiacSymbols]}
            </text>
          );
        })}

        {/* Planets - Position in white ring area (between inner circle and colored band) */}
        {planets.map((planet, index) => {
          const degreeInSign = planet.longitude % 30;
          
          // Position in white ring area: from inner circle (55%) to colored band start (85%)
          const bandInnerRadius = outerRadius * 0.85;
          const planetRadius = innerRadius + (bandInnerRadius - innerRadius) * 0.7;
          const pos = longitudeToPosition(planet.longitude, planetRadius);
          
          // Check for nearby planets (within 15° longitude) and adjust position
          const nearbyPlanets = planets.filter(p => {
            const angleDiff = Math.abs(p.longitude - planet.longitude);
            const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);
            return normalizedDiff < 15 && p.name !== planet.name;
          });
          
          // Calculate offsets based on nearby planets
          let offsetX = 0;
          let offsetY = 0;
          
          if (nearbyPlanets.length > 0) {
            // Use radial offset for nearby planets
            const nearbyIndex = nearbyPlanets.findIndex(p => p.name === planet.name);
            const totalNearby = nearbyPlanets.length + 1;
            const spacing = 20;
            
            if (totalNearby > 1) {
              const angle = (nearbyIndex * 2 * Math.PI) / totalNearby;
              offsetX = Math.cos(angle) * spacing;
              offsetY = Math.sin(angle) * spacing;
            }
          }
          
          const finalX = pos.x + offsetX;
          const finalY = pos.y + offsetY;
          
          return (
            <g key={index}>
              {/* Planet symbol - Step 13: Black glyphs, Sun/Moon slightly bigger */}
              <text
                x={finalX}
                y={finalY}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ 
                  fontSize: planet.name === 'Sun' || planet.name === 'Moon' ? '14px' : '12px', 
                  fill: 'black', 
                  fontWeight: '500' 
                }}
              >
                {planetSymbols[planet.name as keyof typeof planetSymbols] || planet.name.charAt(0)}
              </text>
              
              {/* Planet degree - positioned to avoid overlap */}
              <text
                x={finalX + 16}
                y={finalY}
                textAnchor="start"
                dominantBaseline="middle"
                style={{ fontSize: '8px', fill: 'black', fontWeight: '400' }}
              >
                {formatDegreeWithSign(planet.longitude)}
              </text>
              
              {/* Retrograde indicator */}
              {planet.isRetrograde && (
                <text
                  x={finalX + 14}
                  y={finalY - 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: '6px', fill: 'red', fontWeight: '500' }}
                >
                  R
                </text>
              )}
            </g>
          );
        })}

        {/* Aries point marker - Step 4: Top reference point */}
        <g>
          <text
            x={centerX}
            y={centerY - outerRadius - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '10px', fill: 'black', fontWeight: '500' }}
          >
            ▲
          </text>
        </g>

        {/* Aspect lines - in inner circle area */}
        {aspects.filter(aspect => 
          ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(aspect.type)
        ).map((aspect, index) => {
          const planet1 = planets.find(p => p.name === aspect.planet1);
          const planet2 = planets.find(p => p.name === aspect.planet2);
          
          if (!planet1 || !planet2) return null;
          
          // Position aspect lines in the inner circle area
          const aspectRadius = innerRadius * 0.8;
          const pos1 = longitudeToPosition(planet1.longitude, aspectRadius);
          const pos2 = longitudeToPosition(planet2.longitude, aspectRadius);
          
          let strokeColor = '#000000';
          let strokeWidth = '1';
          
          if (aspect.type === 'square') {
            strokeColor = '#FF0000';  // Red for square
          } else if (aspect.type === 'trine') {
            strokeColor = '#0000FF';  // Blue for trine
          } else if (aspect.type === 'opposition') {
            strokeColor = '#000000';  // Black for opposition
          } else if (aspect.type === 'sextile') {
            strokeColor = '#87CEEB';  // Light blue for sextile
          } else if (aspect.type === 'conjunction') {
            strokeColor = '#000000';  // Black for conjunction
          }
          
          return (
            <g key={index}>
              {/* Aspect line */}
              <line
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={aspect.exact ? "none" : "3,3"}
                opacity="0.8"
              />
            </g>
          );
        })}

        {/* Angle markers */}
        {houses.length > 0 && (
          <>
            {/* Ascendant (AC) - House 1 cusp */}
            <g>
              <line
                x1={longitudeToPosition(houses[0].longitude, outerRadius - 10).x}
                y1={longitudeToPosition(houses[0].longitude, outerRadius - 10).y}
                x2={longitudeToPosition(houses[0].longitude, outerRadius - 25).x}
                y2={longitudeToPosition(houses[0].longitude, outerRadius - 25).y}
                stroke="red"
                strokeWidth="1"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={longitudeToPosition(houses[0].longitude, outerRadius - 35).x}
                y={longitudeToPosition(houses[0].longitude, outerRadius - 35).y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '10px', fill: 'red', fontWeight: '500' }}
              >
                AC
              </text>
            </g>

            {/* Descendant (DC) - House 7 cusp */}
            <g>
              <line
                x1={longitudeToPosition(houses[6].longitude, outerRadius - 10).x}
                y1={longitudeToPosition(houses[6].longitude, outerRadius - 10).y}
                x2={longitudeToPosition(houses[6].longitude, outerRadius - 25).x}
                y2={longitudeToPosition(houses[6].longitude, outerRadius - 25).y}
                stroke="red"
                strokeWidth="1"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={longitudeToPosition(houses[6].longitude, outerRadius - 35).x}
                y={longitudeToPosition(houses[6].longitude, outerRadius - 35).y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '10px', fill: 'red', fontWeight: '500' }}
              >
                DC
              </text>
            </g>

            {/* Midheaven (MC) - House 10 cusp */}
            <g>
              <line
                x1={longitudeToPosition(houses[9].longitude, outerRadius - 10).x}
                y1={longitudeToPosition(houses[9].longitude, outerRadius - 10).y}
                x2={longitudeToPosition(houses[9].longitude, outerRadius - 25).x}
                y2={longitudeToPosition(houses[9].longitude, outerRadius - 25).y}
                stroke="red"
                strokeWidth="1"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={longitudeToPosition(houses[9].longitude, outerRadius - 35).x}
                y={longitudeToPosition(houses[9].longitude, outerRadius - 35).y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '10px', fill: 'red', fontWeight: '500' }}
              >
                MC
              </text>
            </g>

            {/* Imum Coeli (IC) - House 4 cusp */}
            <g>
              <line
                x1={longitudeToPosition(houses[3].longitude, outerRadius - 10).x}
                y1={longitudeToPosition(houses[3].longitude, outerRadius - 10).y}
                x2={longitudeToPosition(houses[3].longitude, outerRadius - 25).x}
                y2={longitudeToPosition(houses[3].longitude, outerRadius - 25).y}
                stroke="red"
                strokeWidth="1"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={longitudeToPosition(houses[3].longitude, outerRadius - 35).x}
                y={longitudeToPosition(houses[3].longitude, outerRadius - 35).y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '10px', fill: 'red', fontWeight: '500' }}
              >
                IC
              </text>
            </g>
          </>
        )}

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="red"
            />
          </marker>
        </defs>

        {/* Chart title */}
        <text
          x={centerX}
          y={height - 20}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '12px', fill: 'black', fontWeight: '400' }}
        >
          {title}
        </text>
      </svg>
    </div>
  );
}
