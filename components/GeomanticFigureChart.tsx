'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GeomanticFigure } from '@/hooks/useGeomancy';

interface GeomanticFigureChartProps {
  figure: GeomanticFigure;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// Traditional geomantic figure patterns (4 rows × 2 columns = 8 dots)
// Each row: 1 dot = odd, 2 dots = even
// Pattern: [row1, row2, row3, row4] where each row is [left, right]
const GEOMANTIC_PATTERNS: Record<string, number[][]> = {
  'Via': [[1, 1], [1, 1], [1, 1], [1, 1]], // All odd (Fire)
  'Populus': [[2, 2], [2, 2], [2, 2], [2, 2]], // All even (Water)
  'Conjunctio': [[2, 2], [1, 1], [1, 1], [2, 2]], // Even-Even-Odd-Odd (Air)
  'Carcer': [[1, 1], [2, 2], [2, 2], [1, 1]], // Odd-Odd-Even-Even (Earth)
  'Fortuna Major': [[1, 1], [1, 1], [2, 2], [2, 2]], // Odd-Odd-Even-Even (Fire)
  'Fortuna Minor': [[2, 2], [2, 2], [1, 1], [1, 1]], // Even-Even-Odd-Odd (Air)
  'Amissio': [[1, 1], [2, 2], [1, 1], [2, 2]], // Odd-Even-Odd-Even (Water)
  'Acquisitio': [[2, 2], [1, 1], [2, 2], [1, 1]], // Even-Odd-Even-Odd (Air)
  'Laetitia': [[1, 1], [1, 1], [1, 1], [2, 2]], // Odd-Odd-Odd-Even (Fire)
  'Tristitia': [[2, 2], [1, 1], [1, 1], [1, 1]], // Even-Odd-Odd-Odd (Earth)
  'Albus': [[2, 2], [2, 2], [1, 1], [1, 1]], // Even-Even-Odd-Odd (Air)
  'Rubeus': [[1, 1], [1, 1], [2, 2], [2, 2]], // Odd-Odd-Even-Even (Fire)
  'Puella': [[1, 1], [2, 2], [2, 2], [2, 2]], // Odd-Even-Even-Even (Water)
  'Puer': [[2, 2], [2, 2], [2, 2], [1, 1]], // Even-Even-Even-Odd (Fire)
  'Caput Draconis': [[1, 1], [1, 1], [2, 2], [1, 1]], // Odd-Odd-Even-Odd (Earth)
  'Cauda Draconis': [[2, 2], [2, 2], [1, 1], [2, 2]], // Even-Even-Odd-Even (Water)
};

// Element colors
const ELEMENT_COLORS: Record<string, string> = {
  'Fire': '#ef4444', // red-500
  'Earth': '#64748b',
  'Air': '#3b82f6', // blue-500
  'Water': '#06b6d4', // cyan-500
};

export default function GeomanticFigureChart({
  figure,
  size = 'md',
  showLabel = true,
  className = ''
}: GeomanticFigureChartProps) {
  const pattern = GEOMANTIC_PATTERNS[figure.name] || GEOMANTIC_PATTERNS['Via'];
  const elementColor = ELEMENT_COLORS[figure.element] || '#6b7280';
  
  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32',
    lg: 'w-32 h-40'
  };

  const dotSize = {
    sm: 3,
    md: 4,
    lg: 5
  };

  const gap = {
    sm: 2,
    md: 3,
    lg: 4
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center ${className}`}
    >
      {/* Dot Pattern */}
      <div className={`${sizeClasses[size]} flex flex-col justify-between p-2 bg-white/5 rounded-lg border border-white/10`}>
        {pattern.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-between items-center" style={{ gap: `${gap[size]}px` }}>
            {[0, 1].map((colIndex) => {
              const dotCount = row[colIndex];
              return (
                <div
                  key={colIndex}
                  className="flex flex-col items-center justify-center"
                  style={{ width: `${(dotSize[size] * 2) + gap[size]}px` }}
                >
                  {dotCount === 1 ? (
                    <div
                      className="rounded-full"
                      style={{
                        width: `${dotSize[size]}px`,
                        height: `${dotSize[size]}px`,
                        backgroundColor: elementColor
                      }}
                    />
                  ) : (
                    <div className="flex flex-col" style={{ gap: `${gap[size] / 2}px` }}>
                      <div
                        className="rounded-full"
                        style={{
                          width: `${dotSize[size]}px`,
                          height: `${dotSize[size]}px`,
                          backgroundColor: elementColor
                        }}
                      />
                      <div
                        className="rounded-full"
                        style={{
                          width: `${dotSize[size]}px`,
                          height: `${dotSize[size]}px`,
                          backgroundColor: elementColor
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="mt-2 text-center">
          <p className="text-xs font-semibold text-white">{figure.name}</p>
          <p className="text-xs text-gray-400">{figure.element}</p>
        </div>
      )}
    </motion.div>
  );
}

