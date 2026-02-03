"use client";

import React from "react";

interface VedicSouthChartProps {
  chart: any;
  className?: string;
  onPlanetClick?: (planet: string, data: any) => void;
}

export default function VedicSouthChart({ chart, className = "", onPlanetClick }: VedicSouthChartProps) {
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
  const housePlanets: Record<number, Array<{ name: string; data: any }>> = {};
  Object.entries(planetMap).forEach(([planet, data]: any) => {
    if (data && data.sign !== undefined) {
      // In South Indian chart, planets are placed by sign, not house
      const sign = data.sign;
      if (!housePlanets[sign]) housePlanets[sign] = [];
      housePlanets[sign].push({ name: planet, data });
    }
  });

  // South Indian chart layout: 4x4 grid with specific cell positions
  // Layout (0-indexed):
  //  0  1  2  3
  //  4  5  6  7
  //  8  9 10 11
  // 12 13 14 15
  
  // Sign positions in South Indian chart (fixed layout)
  const signPositions = [
    { sign: 0, row: 0, col: 1 },   // Aries
    { sign: 1, row: 0, col: 2 },   // Taurus
    { sign: 2, row: 0, col: 3 },   // Gemini
    { sign: 3, row: 1, col: 3 },   // Cancer
    { sign: 4, row: 2, col: 3 },   // Leo
    { sign: 5, row: 3, col: 3 },   // Virgo
    { sign: 6, row: 3, col: 2 },   // Libra
    { sign: 7, row: 3, col: 1 },   // Scorpio
    { sign: 8, row: 3, col: 0 },   // Sagittarius
    { sign: 9, row: 2, col: 0 },   // Capricorn
    { sign: 10, row: 1, col: 0 },  // Aquarius
    { sign: 11, row: 0, col: 0 },  // Pisces
  ];

  // Create 4x4 grid
  const grid: Array<Array<{ sign: number; signName: string; planets: Array<{ name: string; data: any }> }>> = [];
  for (let row = 0; row < 4; row++) {
    grid[row] = [];
    for (let col = 0; col < 4; col++) {
      const pos = signPositions.find(p => p.row === row && p.col === col);
      if (pos) {
        const signName = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][pos.sign];
        grid[row][col] = {
          sign: pos.sign,
          signName,
          planets: housePlanets[pos.sign] || []
        };
      } else {
        // Empty cell (center cells)
        grid[row][col] = { sign: -1, signName: "", planets: [] };
      }
    }
  }

  const padding = 0;
  const legendHeight = 20;
  const chartWidth = 450;
  const chartHeight = 333;
  const availableWidth = chartWidth;
  const availableHeight = chartHeight - legendHeight;
  const cellWidth = availableWidth / 4;
  const cellHeight = availableHeight / 4;

  return (
    <svg
      width="450"
      height="333"
      viewBox="0 0 450 333"
      style={{ background: "#fdfaf6", display: 'block', margin: 0, padding: 0, verticalAlign: 'top' }}
    >
        {/* Draw grid */}
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const x = padding + colIdx * cellWidth;
            const y = padding + rowIdx * cellHeight;
            const isCenter = (rowIdx === 1 || rowIdx === 2) && (colIdx === 1 || colIdx === 2);
            
            if (isCenter) {
              // Center cells - show chart title
              if (rowIdx === 1 && colIdx === 1) {
                return (
                  <g key={`${rowIdx}-${colIdx}`}>
                    <rect
                      x={x}
                      y={y}
                      width={cellWidth * 2}
                      height={cellHeight * 2}
                      fill="#fff9e6"
                      stroke="black"
                      strokeWidth="1"
                    />
                    <text
                      x={x + cellWidth}
                      y={y + cellHeight - 10}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="bold"
                      fill="#92400e"
                    >
                      South Indian
                    </text>
                    <text
                      x={x + cellWidth}
                      y={y + cellHeight + 10}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#92400e"
                    >
                      Vedic Chart
                    </text>
                    {chart.ascendant && (
                      <text
                        x={x + cellWidth}
                        y={y + cellHeight + 30}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#059669"
                      >
                        Asc: {chart.ascendant.signName}
                      </text>
                    )}
                  </g>
                );
              }
              return null;
            }

            return (
              <g key={`${rowIdx}-${colIdx}`}>
                {/* Cell background */}
                <rect
                  x={x}
                  y={y}
                  width={cellWidth}
                  height={cellHeight}
                  fill="#ffffff"
                  stroke="black"
                  strokeWidth="1"
                />

                {/* Sign name */}
                <text
                  x={x + 5}
                  y={y + 15}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#d97706"
                >
                  {cell.signName}
                </text>

                {/* Sign number */}
                <text
                  x={x + cellWidth - 5}
                  y={y + 15}
                  textAnchor="end"
                  fontSize="8"
                  fill="gray"
                >
                  {cell.sign + 1}
                </text>

                {/* Planets */}
                {cell.planets.map((planet, idx) => {
                  const planetAbbr = planet.name.substring(0, 2).toUpperCase();
                  const yPos = y + 30 + (idx * 15);
                  
                  // Color code by dignity
                  let color = "#7c3aed"; // Default purple
                  if (planet.data.dignity) {
                    if (planet.data.dignity.exalted) color = "#059669"; // Green
                    else if (planet.data.dignity.debilitated) color = "#dc2626"; // Red
                    else if (planet.data.dignity.ownSign) color = "#2563eb"; // Blue
                  }

                  return (
                    <text
                      key={idx}
                      x={x + cellWidth / 2}
                      y={yPos}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill={color}
                      style={{ cursor: onPlanetClick ? 'pointer' : 'default' }}
                      onClick={() => onPlanetClick && onPlanetClick(planet.name, planet.data)}
                    >
                      {planetAbbr}
                      {planet.data.dignity?.exalted && "↑"}
                      {planet.data.dignity?.debilitated && "↓"}
                    </text>
                  );
                })}

                {/* Ascendant marker */}
                {chart.ascendant && chart.ascendant.sign === cell.sign && (
                  <text
                    x={x + cellWidth / 2}
                    y={y + cellHeight - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#059669"
                  >
                    ASC
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Legend */}
        <text x={chartWidth / 2} y={chartHeight - 5} textAnchor="middle" fontSize="9">
          <tspan fill="#059669">↑ Exalted</tspan>
          <tspan fill="#6b7280"> | </tspan>
          <tspan fill="#dc2626">↓ Debilitated</tspan>
          <tspan fill="#6b7280"> | </tspan>
          <tspan fill="#2563eb">Own Sign</tspan>
        </text>
      </svg>
  );
}
