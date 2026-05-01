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
const NAKSHATRA_SHORT = NAKSHATRAS.map((name) => name.length > 9 ? `${name.slice(0, 8)}.` : name);

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
  sun: '#EA580C', moon: '#1D4ED8', mars: '#DC2626', mercury: '#0F766E',
  jupiter: '#7C3AED', venus: '#BE185D', saturn: '#0F172A', rahu: '#374151', ketu: '#6B21A8'
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
  const planetEntries = Object.entries(planets).map(([planetKey, planetData]) => ({
    planetKey,
    planetData,
    lon: Number((planetData as { lonSidereal?: number; lon?: number })?.lonSidereal ?? (planetData as { lonSidereal?: number; lon?: number })?.lon ?? 0),
  })).sort((a, b) => a.lon - b.lon);

  const clusterMetaByPlanet = new Map<string, { idx: number; size: number }>();
  let i = 0;
  while (i < planetEntries.length) {
    let j = i + 1;
    while (j < planetEntries.length && Math.abs(planetEntries[j].lon - planetEntries[j - 1].lon) < 10) {
      j += 1;
    }
    const cluster = planetEntries.slice(i, j);
    cluster.forEach((entry, idx) => clusterMetaByPlanet.set(entry.planetKey, { idx, size: cluster.length }));
    i = j;
  }

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
        shapeRendering="geometricPrecision"
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
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
              stroke="#B0B8C2"
              strokeWidth="0.8"
            />
          );
        })}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CONCENTRIC CIRCLES (ring boundaries) */}
        {/* ═══════════════════════════════════════════════════════ */}
        
        {/* Outer circle boundary */}
        <circle cx={CENTER} cy={CENTER} r={OUTER_EDGE} fill="none" stroke="#334155" strokeWidth="1.3" />
        
        {/* Zodiac ring outer boundary */}
        <circle cx={CENTER} cy={CENTER} r={ZODIAC_OUTER} fill="none" stroke="#334155" strokeWidth="1.1" />
        
        {/* Zodiac ring inner boundary (cyan band) */}
        <circle cx={CENTER} cy={CENTER} r={ZODIAC_INNER} fill="none" stroke="#334155" strokeWidth="1.3" />
        
        {/* Center white circle */}
        <circle cx={CENTER} cy={CENTER} r={CENTER_CIRCLE} fill="#FFFFFF" stroke="#334155" strokeWidth="1.3" />

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
              fill="#22D3EE"
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
              fontSize="31"
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
              fontSize="13.5"
              fill="#334155"
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
              fontSize="12.5"
              fill="#0F172A"
              fontFamily="Arial, sans-serif"
              transform={`rotate(${angle}, ${pos.x}, ${pos.y})`}
            >
              {NAKSHATRA_SHORT[i]}
            </text>
          );
        })}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PLANETS (placed at their sidereal longitude) */}
        {/* ═══════════════════════════════════════════════════════ */}
        {Object.entries(planets).map(([planetKey, planetData]: any, idx) => {
          const lon = planetData?.lonSidereal || planetData?.lon || 0;
          const meta = clusterMetaByPlanet.get(planetKey) ?? { idx: 0, size: 1 };
          const centeredIdx = meta.idx - (meta.size - 1) / 2;
          const radiusOffset = centeredIdx * 10;
          const pos = polarToCartesian(lon, CENTER_CIRCLE - 23 + radiusOffset); // Spread dense clusters radially
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
                fontSize="23"
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
