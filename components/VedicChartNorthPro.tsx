"use client";
import React, { useRef } from "react";
import { devLog } from '@/lib/devLogger';
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { planetSymbols, getPlanetColor, formatPlanetDisplay } from "@/lib/chart-utils";
import { CHART_SVG_FONT_FAMILY } from "@/lib/charts/svgTypography";

interface VedicChartNorthProProps {
  chart: {
    houses: any[];
    planets: Record<string, any>;
    ascendant?: any;
    metadata?: any;
  };
  name?: string;
  className?: string;
  onPlanetClick?: (planet: string, data: any) => void;
}

const VedicChartNorthPro: React.FC<VedicChartNorthProProps> = ({ 
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
        backgroundColor: "#ffffff",
        pixelRatio: 3,
      });
      const link = document.createElement("a");
      link.download = `${name || "north-indian-chart"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      devLog.error("Error exporting chart:", error, 'VedicChartNorthPro');
    }
  };

  const houses = chart?.houses || [];
  const planets = chart?.planets || {};

  /** Map planets to their houses **/
  const housePlanets: Record<number, string[]> = {};
  Object.entries(planets).forEach(([planet, data]: any) => {
    if (!data.house) return;
    const h = data.house;
    housePlanets[h] = [...(housePlanets[h] || []), planet];
  });

  /** Curved petal paths for North Indian chart (matching reference images) **/
  const petalPaths = {
    house1: "M 300,50 Q 275,125 250,200 Q 275,275 300,350 Q 325,275 350,200 Q 325,125 300,50 Z", // Top center
    house2: "M 300,50 Q 250,50 200,75 Q 175,100 200,150 Q 225,175 250,150 Q 275,125 300,50 Z", // Top-left
    house3: "M 200,75 Q 150,100 125,150 Q 100,200 150,250 Q 175,275 200,250 Q 225,225 200,150 Q 175,100 200,75 Z", // Left
    house4: "M 125,150 Q 100,200 125,275 Q 150,325 200,350 Q 225,375 250,350 Q 275,325 200,275 Q 175,225 125,150 Z", // Bottom-left
    house5: "M 200,350 Q 175,375 150,400 Q 125,425 150,450 Q 175,475 200,450 Q 225,425 250,400 Q 275,375 200,350 Z", // Bottom
    house6: "M 300,350 Q 350,350 400,375 Q 425,400 400,450 Q 375,475 350,450 Q 325,425 300,400 Q 275,375 300,350 Z", // Bottom-right
    house7: "M 400,375 Q 450,400 475,450 Q 500,500 450,550 Q 425,575 400,550 Q 375,525 350,500 Q 375,450 400,375 Z", // Right
    house8: "M 475,450 Q 500,500 475,575 Q 450,625 400,650 Q 375,675 350,650 Q 325,625 350,550 Q 375,500 475,450 Z", // Top-right
    house9: "M 400,650 Q 450,675 475,700 Q 500,725 475,750 Q 450,775 400,750 Q 375,725 350,700 Q 375,675 400,650 Z", // Top
    house10: "M 350,700 Q 300,700 250,675 Q 225,650 250,600 Q 275,575 300,600 Q 325,625 350,650 Q 375,675 350,700 Z", // Top-right inner
    house11: "M 250,675 Q 200,650 175,600 Q 150,550 200,500 Q 225,475 250,500 Q 275,525 300,550 Q 275,575 250,675 Z", // Right inner
    house12: "M 200,500 Q 175,450 200,375 Q 225,325 275,350 Q 300,375 275,425 Q 250,475 200,500 Z", // Inner center
  };

  /** House label positions **/
  const houseLabelPos = [
    { x: 300, y: 200 }, // 1 - Center
    { x: 237, y: 112 }, // 2 - Top-left
    { x: 162, y: 187 }, // 3 - Left
    { x: 187, y: 262 }, // 4 - Bottom-left
    { x: 225, y: 412 }, // 5 - Bottom
    { x: 337, y: 412 }, // 6 - Bottom-right
    { x: 412, y: 337 }, // 7 - Right
    { x: 412, y: 262 }, // 8 - Top-right
    { x: 375, y: 687 }, // 9 - Top
    { x: 312, y: 687 }, // 10 - Top-right inner
    { x: 237, y: 612 }, // 11 - Right inner
    { x: 237, y: 437 }, // 12 - Inner center
  ];

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <motion.svg
        ref={svgRef}
        viewBox="0 0 600 800"
        className="w-full max-w-2xl shadow-2xl rounded-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background */}
        <rect width="600" height="800" fill="#ffffff" rx="8" />

        {/* Cool blue border */}
        <rect
          x="3"
          y="3"
          width="594"
          height="794"
          stroke="url(#coolRing)"
          strokeWidth="3"
          fill="none"
          rx="8"
        />

        {/* Gradient defs */}
        <defs>
          <linearGradient id="coolRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <radialGradient id="houseBg" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ffffff" />
          </radialGradient>
        </defs>

        {/* 12 curved petal houses */}
        {Object.entries(petalPaths).map(([houseKey, path], i) => {
          const houseNum = i + 1;
          const isAscendant = houseNum === 1;
          return (
            <path
              key={houseKey}
              d={path}
              fill={isAscendant ? "url(#houseBg)" : "#ffffff"}
              stroke="#2C3E50"
              strokeWidth="2"
            />
          );
        })}

        {/* House numbers */}
        {houses.map((h: any, i: number) => {
          const pos = houseLabelPos[i] || { x: 300, y: 200 };
          return (
            <text
              key={`house-num-${i}`}
              x={pos.x}
              y={pos.y - 20}
              textAnchor="middle"
              fontSize="16"
              fill="#2C3E50"
              fontFamily={CHART_SVG_FONT_FAMILY}
              fontWeight="bold"
            >
              {h.house}
            </text>
          );
        })}

        {/* Sign names */}
        {houses.map((h: any, i: number) => {
          const pos = houseLabelPos[i] || { x: 300, y: 200 };
          return (
            <text
              key={`sign-${i}`}
              x={pos.x}
              y={pos.y - 5}
              textAnchor="middle"
              fontSize="12"
              fill="#666666"
              fontFamily={CHART_SVG_FONT_FAMILY}
            >
              {h.signName}
            </text>
          );
        })}

        {/* Planet placements with full notation */}
        {Object.entries(housePlanets).map(([house, ps]) => {
          const houseNum = Number(house);
          const pos = houseLabelPos[houseNum - 1] || { x: 300, y: 200 };
          return ps.map((planet, idx) => {
            const planetData = planets[planet];
            const planetColor = getPlanetColor(planet);
            const planetText = formatPlanetDisplay(planet, planetData);
            
            return (
              <text
                key={`planet-${planet}-${house}`}
                x={pos.x}
                y={pos.y + 15 + (idx * 20)}
                textAnchor="middle"
                fontSize="14"
                fill={planetColor}
                fontFamily={CHART_SVG_FONT_FAMILY}
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
          x="300"
          y="750"
          textAnchor="middle"
          fontSize="14"
          fill="#1e40af"
          fontFamily={CHART_SVG_FONT_FAMILY}
          fontWeight="bold"
        >
          North Indian Chart
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

export default VedicChartNorthPro;