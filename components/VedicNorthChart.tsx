"use client";

import React from "react";

interface VedicNorthChartProps {
  chart: any;
  className?: string;
  onPlanetClick?: (planet: string, data: any) => void;
}

export default function VedicNorthChart({ chart, className = "", onPlanetClick }: VedicNorthChartProps) {
  if (!chart) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chart...</p>
        </div>
      </div>
    );
  }

  const houses = chart?.houses ?? [];
  const planetMap = chart?.planets ?? {};

  // Map planets into house buckets
  const housePlanets: Record<number, string[]> = {};
  Object.entries(planetMap).forEach(([planet, data]: any) => {
    if (data && data.house !== undefined) {
      const h = data.house;
      if (!housePlanets[h]) housePlanets[h] = [];
      housePlanets[h].push(planet.toUpperCase());
    }
  });

  // Define house positions in the diamond layout
  const housePositions = [
    { house: 1, x: 200, y: 200, width: 100, height: 100 }, // Center
    { house: 2, x: 200, y: 100, width: 100, height: 100 }, // Top
    { house: 3, x: 300, y: 100, width: 100, height: 100 }, // Top-right
    { house: 4, x: 300, y: 200, width: 100, height: 100 }, // Right
    { house: 5, x: 300, y: 300, width: 100, height: 100 }, // Bottom-right
    { house: 6, x: 200, y: 300, width: 100, height: 100 }, // Bottom
    { house: 7, x: 100, y: 300, width: 100, height: 100 }, // Bottom-left
    { house: 8, x: 100, y: 200, width: 100, height: 100 }, // Left
    { house: 9, x: 100, y: 100, width: 100, height: 100 }, // Top-left
    { house: 10, x: 150, y: 150, width: 100, height: 100 }, // Inner positions
    { house: 11, x: 250, y: 150, width: 100, height: 100 },
    { house: 12, x: 250, y: 250, width: 100, height: 100 },
  ];

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto"
        style={{ background: "#fdfaf6" }}
      >
        {/* Outer border */}
        <rect
          x="5"
          y="5"
          width="390"
          height="390"
          stroke="black"
          strokeWidth="2"
          fill="none"
          rx="10"
        />

        {/* Draw house rectangles */}
        {housePositions.map(({ house, x, y, width, height }) => {
          const houseData = houses.find((h: any) => h.house === house);
          const planets = housePlanets[house] || [];
          const isAscendant = house === 1;

          return (
            <g key={house}>
              {/* House background */}
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                stroke="black"
                strokeWidth="1"
                fill={isAscendant ? "#fffbe6" : "#ffffff"}
                rx="5"
              />

              {/* House number */}
              <text
                x={x + 5}
                y={y + 15}
                fontSize="10"
                fontWeight="bold"
                fill="gray"
              >
                {house}
              </text>

              {/* Sign name */}
              <text
                x={x + width / 2}
                y={y + 25}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#1e40af"
              >
                {houseData?.signName || "---"}
              </text>

              {/* Planets */}
              <text
                x={x + width / 2}
                y={y + height / 2 + 5}
                textAnchor="middle"
                fontSize="10"
                fill="#7c3aed"
                fontWeight="500"
              >
                {planets.join(", ") || "---"}
              </text>

              {/* House lord (if available) */}
              {houseData?.lord && (
                <text
                  x={x + width / 2}
                  y={y + height - 10}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#059669"
                >
                  {houseData.lord}
                </text>
              )}
            </g>
          );
        })}

        {/* Center title */}
        <text
          x="200"
          y="50"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#92400e"
        >
          North Indian Vedic Chart
        </text>

        {/* Chart metadata */}
        <text
          x="200"
          y="380"
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {chart.metadata?.ayanamsha || "Lahiri"} • {chart.metadata?.system || "Whole Sign"}
        </text>
      </svg>
    </div>
  );
}
