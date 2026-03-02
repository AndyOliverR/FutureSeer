"use client";
import React, { useRef } from "react";
import { devLog } from '@/lib/devLogger';
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { planetSymbols, getPlanetColor, formatPlanetDisplay, signSymbols } from "@/lib/chart-utils";

interface VedicChartSouthProProps {
  chart: {
    houses: any[];
    planets: Record<string, any>;
    ascendant?: any;
  };
  name?: string;
  className?: string;
  onPlanetClick?: (planet: string, data: any) => void;
}

const VedicChartSouthPro: React.FC<VedicChartSouthProProps> = ({ 
  chart, 
  name, 
  className = "",
  onPlanetClick 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  /** 🖼 Export chart to PNG **/
  const exportToPNG = async () => {
    if (!svgRef.current) return;
    try {
      const dataUrl = await toPng(svgRef.current as unknown as HTMLElement, {
        backgroundColor: "#0b0f1a",
        pixelRatio: 3,
      });
      const link = document.createElement("a");
      link.download = `${name || "south-indian-chart"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      devLog.error("Error exporting chart:", error, 'VedicChartSouthPro');
    }
  };

  const houses = chart?.houses || [];
  const planets = chart?.planets || {};

  /** Map planets to houses **/
  const housePlanets: Record<number, string[]> = {};
  Object.entries(planets).forEach(([planet, data]: any) => {
    if (!data.house) return;
    const h = data.house;
    housePlanets[h] = [...(housePlanets[h] || []), planet];
  });

  /** Perfect 4x4 grid layout (matching reference image 9) **/
  const boxSize = 100;
  const gridLayout: Record<number, { row: number; col: number }> = {
    1: { row: 2, col: 1 },   // Center-left
    2: { row: 3, col: 0 },   // Bottom-left
    3: { row: 2, col: 0 },   // Left
    4: { row: 1, col: 0 },   // Top-left
    5: { row: 0, col: 0 },   // Top-left corner
    6: { row: 0, col: 1 },   // Top
    7: { row: 0, col: 2 },   // Top-right
    8: { row: 0, col: 3 },   // Top-right corner
    9: { row: 1, col: 3 },   // Right-top
    10: { row: 2, col: 3 },  // Right
    11: { row: 3, col: 3 },  // Bottom-right
    12: { row: 3, col: 2 },  // Bottom
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <motion.svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="w-full max-w-2xl shadow-2xl rounded-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background */}
        <rect width="400" height="400" fill="#FFFFFF" rx="8" />

        {/* Simple black border */}
        <rect
          x="3"
          y="3"
          width="394"
          height="394"
          stroke="#000000"
          strokeWidth="1"
          fill="none"
          rx="8"
        />

        {/* 4x4 Grid - 16 boxes total */}
        {Array.from({ length: 16 }, (_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const x = col * boxSize;
          const y = row * boxSize;
          
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="0.5"
            />
          );
        })}

        {/* House numbers with diagonal lines */}
        {Object.entries(gridLayout).map(([house, { row, col }]) => {
          const x = col * boxSize;
          const y = row * boxSize;
          const houseNum = Number(house);
          
          return (
            <g key={`house-${house}`}>
              {/* Diagonal line */}
              <line
                x1={x}
                y1={y}
                x2={x + 15}
                y2={y + 15}
                stroke="#000000"
                strokeWidth="1"
              />
              {/* House number */}
              <text
                x={x + 5}
                y={y + 12}
                fontSize="10"
                fill="#666666"
                fontFamily="Arial"
                fontWeight="normal"
              >
                {houseNum}
              </text>
            </g>
          );
        })}

        {/* Sign symbols in each house */}
        {houses.map((h: any) => {
          const pos = gridLayout[h.house];
          if (!pos) return null;
          const x = pos.col * boxSize;
          const y = pos.row * boxSize;
          const signSymbol = signSymbols[h.signName?.toLowerCase() as keyof typeof signSymbols];
          
          return (
            <text
              key={`sign-${h.house}`}
              x={x + boxSize / 2}
              y={y + 20}
              textAnchor="middle"
              fontSize="16"
              fill="#2C3E50"
              fontFamily="Arial"
              fontWeight="bold"
            >
              {signSymbol}
            </text>
          );
        })}

        {/* Planet placements with full notation */}
        {Object.entries(housePlanets).map(([house, ps]) => {
          const pos = gridLayout[Number(house)];
          if (!pos) return null;
          const x = pos.col * boxSize;
          const y = pos.row * boxSize;
          
          return ps.map((planet, idx) => {
            const planetData = planets[planet];
            const planetColor = getPlanetColor(planet);
            const planetSymbol = planetSymbols[planet as keyof typeof planetSymbols] || '?';
            
            // Format degrees and minutes
            const degreeInSign = planetData?.degreeInSign || 0;
            const degrees = Math.floor(degreeInSign);
            const minutes = Math.floor(((degreeInSign % 1) * 60));
            
            // Get sign symbol for the planet's current sign
            const signName = planetData?.signName?.toLowerCase();
            const signSymbol = signSymbols[signName as keyof typeof signSymbols] || '';
            
            // Format: "☉ 9° ♓ 35 ♈" (Symbol + Degrees + Minutes + Sign)
            const planetText = `${planetSymbol} ${degrees}° ${signSymbol} ${minutes}${minutes < 10 ? ' ' : ''}`;
            
            return (
              <text
                key={`planet-${planet}-${house}`}
                x={x + boxSize / 2}
                y={y + 40 + (idx * 20)}
                textAnchor="middle"
                fontSize="11"
                fill={planetColor}
                fontFamily="Arial"
                fontWeight="bold"
                style={{ cursor: onPlanetClick ? "pointer" : "default" }}
                onClick={() => onPlanetClick?.(planet, planetData)}
              >
                {planetText}
              </text>
            );
          });
        })}

        {/* Center title */}
        <text
          x="200"
          y="390"
          textAnchor="middle"
          fontSize="12"
          fill="#333333"
          fontFamily="Arial"
          fontWeight="bold"
        >
          South Indian Chart
        </text>
      </motion.svg>

      <Button
        onClick={exportToPNG}
        className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-semibold shadow-lg transition-all"
      >
        📥 Export Chart as PNG
      </Button>
    </div>
  );
};

export default VedicChartSouthPro;