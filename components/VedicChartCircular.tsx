"use client";
import React from "react";
import { motion } from "framer-motion";

// 27 Nakshatras in traditional order
const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// 12 Zodiac Signs with symbols
const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈" },
  { name: "Taurus", symbol: "♉" },
  { name: "Gemini", symbol: "♊" },
  { name: "Cancer", symbol: "♋" },
  { name: "Leo", symbol: "♌" },
  { name: "Virgo", symbol: "♍" },
  { name: "Libra", symbol: "♎" },
  { name: "Scorpio", symbol: "♏" },
  { name: "Sagittarius", symbol: "♐" },
  { name: "Capricorn", symbol: "♑" },
  { name: "Aquarius", symbol: "♒" },
  { name: "Pisces", symbol: "♓" }
];

// Planet symbols and colors
const PLANET_SYMBOLS: { [key: string]: string } = {
  sun: '☉', moon: '☽', mars: '♂', mercury: '☿',
  jupiter: '♃', venus: '♀', saturn: '♄', rahu: '☊', ketu: '☋'
};

const PLANET_COLORS: { [key: string]: string } = {
  sun: '#FF8C00', moon: '#C0C0C0', mars: '#FF0000', mercury: '#00FF00',
  jupiter: '#FFD700', venus: '#FF1493', saturn: '#4169E1', rahu: '#808080', ketu: '#8B4513'
};

interface VedicChartCircularProps {
  chart: {
    planets: Record<string, any>;
    ascendant?: { signIndex: number };
  };
  name?: string;
  radius?: number;
  className?: string;
  onPlanetClick?: (planet: string, data: any) => void;
}

const VedicChartCircular: React.FC<VedicChartCircularProps> = ({
  chart,
  className = "",
  onPlanetClick
}) => {
  // Match East Indian chart size - using 550x550 to match East Indian chart width (550px)
  const CHART_SIZE = 550;
  const SCALE = CHART_SIZE / 1000; // Scale factor from original 1000x1000 to 550x550
  const CENTER = 275; // 500 * SCALE
  const OUTER_EDGE = 264; // 480 * SCALE - Outer edge of the wheel
  const NAKSHATRA_TEXT_R = 250; // 455 * SCALE - Radius for Nakshatra names
  const HOUSE_NUM_R = 217; // 395 * SCALE - Radius for house numbers (outer ring)
  const ZODIAC_OUTER = 198; // 360 * SCALE - Outer edge of zodiac ring
  const ZODIAC_INNER = 138; // 250 * SCALE - Inner edge of zodiac ring (cyan band)
  const CENTER_CIRCLE = 121; // 220 * SCALE - White center circle
  
  const planets = chart?.planets || {};

  // Helper function to convert degrees to radians
  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  // Helper to get position at angle and radius
  const polarToCartesian = (angle: number, radius: number) => {
    const angleRad = degToRad(angle - 90); // -90 to start from top
    return {
      x: CENTER + radius * Math.cos(angleRad),
      y: CENTER + radius * Math.sin(angleRad)
    };
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.svg
        width={CHART_SIZE}
        height={CHART_SIZE}
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        className="shadow-2xl rounded-full"
        style={{ display: 'block' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background */}
        <rect width={CHART_SIZE} height={CHART_SIZE} fill="#FFFFFF" />

        {/* ═══════════════════════════════════════════════════════ */}
        {/* RADIAL DIVISION LINES (27 lines from center to edge) */}
        {/* ═══════════════════════════════════════════════════════ */}
        {Array.from({ length: 27 }, (_, i) => {
          const angle = (i * 360) / 27;
          const start = polarToCartesian(angle, 0);
          const end = polarToCartesian(angle, OUTER_EDGE);
          
          return (
            <line
              key={`radial-${i}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#CCCCCC"
              strokeWidth="0.58"
            />
          );
        })}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CONCENTRIC CIRCLES (ring boundaries) */}
        {/* ═══════════════════════════════════════════════════════ */}
        
        {/* Outer circle boundary */}
        <circle cx={CENTER} cy={CENTER} r={OUTER_EDGE} fill="none" stroke="#666666" strokeWidth="0.87" />
        
        {/* Zodiac ring outer boundary */}
        <circle cx={CENTER} cy={CENTER} r={ZODIAC_OUTER} fill="none" stroke="#666666" strokeWidth="0.58" />
        
        {/* Zodiac ring inner boundary (cyan band) */}
        <circle cx={CENTER} cy={CENTER} r={ZODIAC_INNER} fill="none" stroke="#666666" strokeWidth="0.87" />
        
        {/* Center white circle */}
        <circle cx={CENTER} cy={CENTER} r={CENTER_CIRCLE} fill="#FFFFFF" stroke="#666666" strokeWidth="0.87" />

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CYAN ZODIAC BAND (12 segments) */}
        {/* ═══════════════════════════════════════════════════════ */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = (i * 360) / 12;
          const endAngle = ((i + 1) * 360) / 12;
          
          const outerStart = polarToCartesian(startAngle, ZODIAC_OUTER);
          const outerEnd = polarToCartesian(endAngle, ZODIAC_OUTER);
          const innerStart = polarToCartesian(startAngle, ZODIAC_INNER);
          const innerEnd = polarToCartesian(endAngle, ZODIAC_INNER);
          
          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
          
          const pathData = `
            M ${outerStart.x} ${outerStart.y}
            A ${ZODIAC_OUTER} ${ZODIAC_OUTER} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}
            L ${innerEnd.x} ${innerEnd.y}
            A ${ZODIAC_INNER} ${ZODIAC_INNER} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}
            Z
          `;
          
          return (
            <path
              key={`zodiac-${i}`}
              d={pathData}
              fill="#00CED1"
              stroke="none"
            />
          );
        })}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ZODIAC SYMBOLS (in cyan band) */}
        {/* ═══════════════════════════════════════════════════════ */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = ((i + 0.5) * 360) / 12;
          const pos = polarToCartesian(angle, (ZODIAC_OUTER + ZODIAC_INNER) / 2);
          
          return (
            <text
              key={`zodiac-symbol-${i}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="28"
              fill="#FFFFFF"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              {sign.symbol}
            </text>
          );
        })}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* HOUSE NUMBERS (outer ring, between zodiac and nakshatras) */}
        {/* ═══════════════════════════════════════════════════════ */}
        {Array.from({ length: 27 }, (_, i) => {
          const angle = ((i + 0.5) * 360) / 27;
          const pos = polarToCartesian(angle, HOUSE_NUM_R);
          
          return (
            <text
              key={`house-num-${i}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#666666"
              fontFamily="Arial, sans-serif"
            >
              {i + 1}
            </text>
          );
        })}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* NAKSHATRA NAMES (radial text along division lines) */}
        {/* ═══════════════════════════════════════════════════════ */}
        {NAKSHATRAS.map((nakshatra, i) => {
          const angle = (i * 360) / 27;
          const pos = polarToCartesian(angle, NAKSHATRA_TEXT_R);
          
          return (
            <text
              key={`nakshatra-${i}`}
              x={pos.x}
              y={pos.y}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize="11"
              fill="#333333"
              fontFamily="Arial, sans-serif"
              transform={`rotate(${angle}, ${pos.x}, ${pos.y})`}
            >
              {nakshatra}
            </text>
          );
        })}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PLANETS (placed at their sidereal longitude) */}
        {/* ═══════════════════════════════════════════════════════ */}
        {Object.entries(planets).map(([planetKey, planetData]: any, idx) => {
          const lon = planetData?.lonSidereal || planetData?.lon || 0;
          const pos = polarToCartesian(lon, CENTER_CIRCLE - 23); // Scaled: 40 * SCALE ≈ 23
          const planetSymbol = PLANET_SYMBOLS[planetKey.toLowerCase()] || planetKey.charAt(0).toUpperCase();
          const planetColor = PLANET_COLORS[planetKey.toLowerCase()] || '#000000';

          return (
            <motion.g
              key={`planet-${planetKey}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              style={{ cursor: onPlanetClick ? 'pointer' : 'default' }}
              onClick={() => onPlanetClick && onPlanetClick(planetKey, planetData)}
            >
              {/* Planet symbol */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="20"
                fill={planetColor}
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
              >
                {planetSymbol}
              </text>
            </motion.g>
          );
        })}

      </motion.svg>
    </div>
  );
};

export default VedicChartCircular;
