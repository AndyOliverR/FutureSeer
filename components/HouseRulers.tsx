"use client";

import React from "react";
import { Placements } from "@/lib/astrology";
import { getSignName, getHouseRuler } from "@/lib/vedic-core";

interface HouseRulersProps {
  placements: Placements;
  className?: string;
}

export default function HouseRulers({ placements, className = "" }: HouseRulersProps) {
  const getHouseColor = (houseNumber: number) => {
    const colors = [
      'bg-red-50 border-red-200',     // 1st house
      'bg-orange-50 border-orange-200', // 2nd house
      'bg-yellow-50 border-yellow-200', // 3rd house
      'bg-green-50 border-green-200',   // 4th house
      'bg-blue-50 border-blue-200',     // 5th house
      'bg-indigo-50 border-indigo-200', // 6th house
      'bg-purple-50 border-purple-200', // 7th house
      'bg-pink-50 border-pink-200',     // 8th house
      'bg-rose-50 border-rose-200',     // 9th house
      'bg-amber-50 border-amber-200',   // 10th house
      'bg-lime-50 border-lime-200',     // 11th house
      'bg-cyan-50 border-cyan-200'      // 12th house
    ];
    return colors[(houseNumber - 1) % 12];
  };

  const getHouseIcon = (houseNumber: number) => {
    const icons = [
      '🏠', '💰', '📚', '🏡', '🎨', '⚕️',
      '💑', '💀', '📖', '👑', '👥', '🕉️'
    ];
    return icons[(houseNumber - 1) % 12];
  };

  const getHouseName = (houseNumber: number) => {
    const names = [
      'Lagna', 'Dhana', 'Sahaja', 'Sukha', 'Putra', 'Ari',
      'Kalatra', 'Ayu', 'Bhagya', 'Karma', 'Labha', 'Vyaya'
    ];
    return names[(houseNumber - 1) % 12];
  };

  const getHouseDescription = (houseNumber: number) => {
    const descriptions = [
      'Self, personality, appearance, health',
      'Wealth, family, speech, food habits',
      'Siblings, courage, communication, short journeys',
      'Mother, home, education, property',
      'Children, creativity, romance, speculation',
      'Health, enemies, service, daily routine',
      'Marriage, partnerships, open enemies',
      'Longevity, transformation, occult, inheritance',
      'Father, higher learning, spirituality, long journeys',
      'Career, reputation, authority, status',
      'Gains, friends, hopes, aspirations',
      'Losses, expenses, spirituality, foreign lands'
    ];
    return descriptions[(houseNumber - 1) % 12];
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">House Rulers</h3>
        <p className="text-sm text-gray-600">12 houses with their signs and ruling planets</p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {placements.map((house) => {
            const houseNumber = house.house;
            const signName = house.signName;
            const ruler = getHouseRuler(house.signIndex);
            const planetCount = house.planets.length;
            
            return (
              <div
                key={houseNumber}
                className={`p-4 rounded-lg border ${getHouseColor(houseNumber)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getHouseIcon(houseNumber)}</span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        House {houseNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getHouseName(houseNumber)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {signName}
                    </div>
                    <div className="text-xs text-gray-600">
                      Ruled by {ruler}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-xs text-gray-600 mb-2">
                    {getHouseDescription(houseNumber)}
                  </div>
                  
                  {planetCount > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        Planets ({planetCount}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {house.planets.map((planet, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-white rounded border text-gray-700"
                          >
                            {planet.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">House Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Angular Houses:</span>
              <div className="text-gray-600">1, 4, 7, 10</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Succedent Houses:</span>
              <div className="text-gray-600">2, 5, 8, 11</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cadent Houses:</span>
              <div className="text-gray-600">3, 6, 9, 12</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Planets:</span>
              <div className="text-gray-600">
                {placements.reduce((sum, house) => sum + house.planets.length, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
