"use client";

import React, { useState } from "react";
import { DashaPeriod } from "@/types/mystical";
import { ChevronDown, ChevronRight } from "lucide-react";

interface VimshottariPanelProps {
  dasha: DashaPeriod[];
  currentDasha: DashaPeriod | null;
  className?: string;
}

export default function VimshottariPanel({ dasha, currentDasha, className = "" }: VimshottariPanelProps) {
  const [expandedPeriods, setExpandedPeriods] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedPeriods);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPeriods(newExpanded);
  };

  const getDashaColor = (planet: string) => {
    const colors: { [key: string]: string } = {
      'Sun': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Moon': 'bg-blue-100 text-blue-800 border-blue-200',
      'Mars': 'bg-red-100 text-red-800 border-red-200',
      'Mercury': 'bg-green-100 text-green-800 border-green-200',
      'Jupiter': 'bg-purple-100 text-purple-800 border-purple-200',
      'Venus': 'bg-pink-100 text-pink-800 border-pink-200',
      'Saturn': 'bg-gray-100 text-gray-800 border-gray-200',
      'Rahu': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Ketu': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[planet] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDashaIcon = (planet: string) => {
    const icons: { [key: string]: string } = {
      'Sun': '☉',
      'Moon': '☽',
      'Mars': '♂',
      'Mercury': '☿',
      'Jupiter': '♃',
      'Venus': '♀',
      'Saturn': '♄',
      'Rahu': '☊',
      'Ketu': '☋'
    };
    return icons[planet] || '●';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Vimshottari Dasha</h3>
        <p className="text-sm text-gray-600">120-year planetary periods based on Moon's nakshatra</p>
      </div>
      
      <div className="p-4">
        {/* Current Dasha Highlight */}
        {currentDasha && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getDashaIcon(currentDasha.planet)}</span>
                  <h4 className="text-lg font-semibold text-blue-900">
                    Current: {currentDasha.planet} Dasha
                  </h4>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {currentDasha.startDate} to {currentDasha.endDate}
                </p>
                <p className="text-sm text-blue-600">
                  Duration: {currentDasha.duration} years
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {(currentDasha.progress ?? 0).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600">Complete</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${currentDasha.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-blue-600 mt-1">
                <span>Start</span>
                <span>End</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Dasha Timeline */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 mb-3">Complete Dasha Sequence</h4>
          
          {dasha.map((period, index) => {
            const isExpanded = expandedPeriods.has(index);
            const isCurrent = period.isCurrent;
            
            return (
              <div
                key={index}
                className={`border rounded-lg transition-all duration-200 ${
                  isCurrent 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => toggleExpanded(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" aria-hidden />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" aria-hidden />
                      )}
                      
                      <span className="text-lg">{getDashaIcon(period.planet)}</span>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          {period.planet} Dasha
                          {isCurrent && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {period.startDate} to {period.endDate}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {period.duration} years
                      </div>
                      {isCurrent && (
                        <div className="text-sm text-blue-600">
                          {(period.progress ?? 0).toFixed(1)}% complete
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bar for current dasha */}
                  {isCurrent && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${period.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-gray-200 bg-gray-50">
                    <div className="pt-3 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Start Date:</span>
                          <span className="ml-2 text-gray-600">{period.startDate}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">End Date:</span>
                          <span className="ml-2 text-gray-600">{period.endDate}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Duration:</span>
                          <span className="ml-2 text-gray-600">{period.duration} years</span>
                        </div>
                        {isCurrent && (
                          <div>
                            <span className="font-medium text-gray-700">Progress:</span>
                            <span className="ml-2 text-gray-600">{(period.progress ?? 0).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Dasha description */}
                      <div className="mt-3 p-3 bg-white rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">
                          {period.planet} Dasha Characteristics
                        </h5>
                        <p className="text-sm text-gray-600">
                          {getDashaDescription(period.planet)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>Total Cycle:</strong> 120 years (Vimshottari Dasha)
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <strong>Current Age:</strong> {currentDasha ? 
              `${Math.floor((new Date().getTime() - new Date(currentDasha.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years` 
              : 'Unknown'
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function getDashaDescription(planet: string): string {
  const descriptions: { [key: string]: string } = {
    'Sun': 'Leadership, authority, recognition, and self-expression. Period of personal growth and public visibility.',
    'Moon': 'Emotions, intuition, family, and nurturing. Period of emotional development and domestic harmony.',
    'Mars': 'Energy, courage, competition, and action. Period of dynamic activity and potential conflicts.',
    'Mercury': 'Communication, learning, commerce, and intellect. Period of mental activity and social connections.',
    'Jupiter': 'Wisdom, expansion, spirituality, and prosperity. Period of growth and philosophical development.',
    'Venus': 'Love, beauty, arts, and relationships. Period of harmony and aesthetic appreciation.',
    'Saturn': 'Discipline, responsibility, limitations, and karma. Period of hard work and life lessons.',
    'Rahu': 'Desires, illusions, technology, and foreign influences. Period of material pursuits and spiritual confusion.',
    'Ketu': 'Spirituality, detachment, past life karma, and liberation. Period of spiritual growth and letting go.'
  };
  return descriptions[planet] || 'Planetary influence period with unique characteristics and life themes.';
}
