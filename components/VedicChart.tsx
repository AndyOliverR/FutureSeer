'use client';

import React from 'react';
import { Placements, PlanetLabel } from '@/lib/astrology';

interface VedicChartProps {
  placements: Placements;
  chartType: 'north-indian' | 'south-indian';
  className?: string;
}

const VEDIC_COLORS = {
  signs: {
    'Aries': '#FF6B6B',
    'Taurus': '#4ECDC4', 
    'Gemini': '#45B7D1',
    'Cancer': '#96CEB4',
    'Leo': '#FFEAA7',
    'Virgo': '#DDA0DD',
    'Libra': '#98D8C8',
    'Scorpio': '#F7DC6F',
    'Sagittarius': '#BB8FCE',
    'Capricorn': '#85C1E9',
    'Aquarius': '#F8C471',
    'Pisces': '#82E0AA'
  },
  planets: {
    'Sun': '#FFD700',
    'Moon': '#C0C0C0',
    'Mars': '#FF4500',
    'Mercury': '#32CD32',
    'Jupiter': '#4169E1',
    'Venus': '#FF69B4',
    'Saturn': '#708090',
    'Rahu': '#8B0000',
    'Ketu': '#4B0082',
    'Asc': '#FF6347'
  }
};

const PLANET_SYMBOLS = {
  'Sun': '☉',
  'Moon': '☽',
  'Mars': '♂',
  'Mercury': '☿',
  'Jupiter': '♃',
  'Venus': '♀',
  'Saturn': '♄',
  'Rahu': '☊',
  'Ketu': '☋',
  'Asc': 'ASC'
};

export default function VedicChart({ placements, chartType, className = '' }: VedicChartProps) {
  const getPlanetsInHouse = (houseNumber: number): PlanetLabel[] => {
    const house = placements.find(h => h.house === houseNumber);
    return house ? house.planets : [];
  };

  const getSignColor = (_signName: string): string => {
    void _signName
    return '#ffffff'
  };

  const getPlanetColor = (planetName: string): string => {
    return VEDIC_COLORS.planets[planetName as keyof typeof VEDIC_COLORS.planets] || '#FFFFFF';
  };

  const formatDegree = (degree: number): string => {
    return `${Math.floor(degree)}°`;
  };

  const renderNorthIndianChart = () => {
    return (
      <div className="relative w-full h-full max-w-2xl mx-auto">
        {/* Outer decorative border */}
        <div className="absolute inset-0 border-4 border-amber-400 rounded-lg shadow-2xl">
          <div className="absolute inset-2 border-2 border-amber-300 rounded-md">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-amber-500 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-amber-500 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-amber-500 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-amber-500 rounded-br-lg"></div>
          </div>
        </div>

        {/* Main chart grid */}
        <div className="relative w-full h-full p-8">
          {/* House 1 (Top Middle) */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg" 
               style={{ backgroundColor: getSignColor(placements[0]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">1</div>
              <div className="text-xs text-amber-800">{placements[0]?.signName || ''}</div>
              {getPlanetsInHouse(1).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* House 2 (Top Right) */}
          <div className="absolute top-0 right-0 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[1]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">2</div>
              <div className="text-xs text-amber-800">{placements[1]?.signName || ''}</div>
              {getPlanetsInHouse(2).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* House 3 (Middle Right) */}
          <div className="absolute top-1/3 right-0 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[2]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">3</div>
              <div className="text-xs text-amber-800">{placements[2]?.signName || ''}</div>
              {getPlanetsInHouse(3).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* House 4 (Bottom Right) */}
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[3]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">4</div>
              <div className="text-xs text-amber-800">{placements[3]?.signName || ''}</div>
              {getPlanetsInHouse(4).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* House 5 (Bottom Middle) */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[4]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">5</div>
              <div className="text-xs text-amber-800">{placements[4]?.signName || ''}</div>
              {getPlanetsInHouse(5).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* House 6 (Bottom Left) */}
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[5]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">6</div>
              <div className="text-xs text-amber-800">{placements[5]?.signName || ''}</div>
              {getPlanetsInHouse(6).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* House 7 (Middle Left) */}
          <div className="absolute top-1/3 left-0 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[6]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">7</div>
              <div className="text-xs text-amber-800">{placements[6]?.signName || ''}</div>
              {getPlanetsInHouse(7).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* House 8 (Top Left) */}
          <div className="absolute top-0 left-0 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[7]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">8</div>
              <div className="text-xs text-amber-800">{placements[7]?.signName || ''}</div>
              {getPlanetsInHouse(8).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Central area with decorative elements */}
          <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border-4 border-amber-500 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg">
            <div className="absolute inset-4 border-2 border-amber-400 rounded-full bg-gradient-to-br from-amber-50 to-amber-100">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-800">D1</div>
                  <div className="text-sm text-amber-700">Lagna</div>
                </div>
              </div>
            </div>
          </div>

          {/* Remaining houses (9-12) */}
          {/* House 9 (Top Middle Right) */}
          <div className="absolute top-0 left-1/3 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[8]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">9</div>
              <div className="text-xs text-amber-800">{placements[8]?.signName || ''}</div>
              {getPlanetsInHouse(9).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* House 10 (Middle Right Bottom) */}
          <div className="absolute top-2/3 right-0 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[9]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">10</div>
              <div className="text-xs text-amber-800">{placements[9]?.signName || ''}</div>
              {getPlanetsInHouse(10).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* House 11 (Bottom Middle Left) */}
          <div className="absolute bottom-0 left-1/3 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[10]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">11</div>
              <div className="text-xs text-amber-800">{placements[10]?.signName || ''}</div>
              {getPlanetsInHouse(11).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* House 12 (Middle Left Top) */}
          <div className="absolute top-0 left-0 w-1/3 h-1/3 border-2 border-amber-400 rounded-lg"
               style={{ backgroundColor: getSignColor(placements[11]?.signName || '') }}>
            <div className="p-2 text-center">
              <div className="text-xs font-bold text-amber-900">12</div>
              <div className="text-xs text-amber-800">{placements[11]?.signName || ''}</div>
              {getPlanetsInHouse(12).map((planet, idx) => (
                <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                  {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                  <div className="text-xs">{formatDegree(planet.degreeInSign)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative corner flowers */}
        <div className="absolute top-2 left-2 text-amber-500 text-2xl">🌸</div>
        <div className="absolute top-2 right-2 text-amber-500 text-2xl">🌸</div>
        <div className="absolute bottom-2 left-2 text-amber-500 text-2xl">🌸</div>
        <div className="absolute bottom-2 right-2 text-amber-500 text-2xl">🌸</div>
      </div>
    );
  };

  const renderSouthIndianChart = () => {
    return (
      <div className="relative w-full h-full max-w-2xl mx-auto">
        {/* Outer decorative border */}
        <div className="absolute inset-0 border-4 border-purple-400 rounded-lg shadow-2xl">
          <div className="absolute inset-2 border-2 border-purple-300 rounded-md">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-purple-500 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-purple-500 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-purple-500 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-purple-500 rounded-br-lg"></div>
          </div>
        </div>

        {/* Main chart grid - South Indian style */}
        <div className="relative w-full h-full p-8">
          {/* Create 4x4 grid */}
          <div className="grid grid-cols-4 grid-rows-4 h-full w-full gap-1">
            {Array.from({ length: 16 }, (_, i) => {
              const houseNumber = i + 1;
              const house = placements[houseNumber - 1];
              const planets = getPlanetsInHouse(houseNumber);
              
              return (
                <div key={houseNumber} 
                     className="border-2 border-purple-400 rounded-lg flex flex-col items-center justify-center p-1"
                     style={{ backgroundColor: getSignColor(house?.signName || '') }}>
                  <div className="text-xs font-bold text-purple-900">{houseNumber}</div>
                  <div className="text-xs text-purple-800">{house?.signName || ''}</div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {planets.map((planet, idx) => (
                      <div key={idx} className="text-xs" style={{ color: getPlanetColor(planet.name) }}>
                        {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decorative corner flowers */}
        <div className="absolute top-2 left-2 text-purple-500 text-2xl">🌺</div>
        <div className="absolute top-2 right-2 text-purple-500 text-2xl">🌺</div>
        <div className="absolute bottom-2 left-2 text-purple-500 text-2xl">🌺</div>
        <div className="absolute bottom-2 right-2 text-purple-500 text-2xl">🌺</div>
      </div>
    );
  };

  return (
    <div className={`vedic-chart-container ${className}`}>
      {chartType === 'north-indian' ? renderNorthIndianChart() : renderSouthIndianChart()}
    </div>
  );
}