"use client";

import React, { useState, useMemo } from "react";
import { Placements } from "@/lib/astrology";
import { getSignName, getHouseRuler } from "@/lib/vedic-core";
import { ChevronUp, ChevronDown } from "lucide-react";

interface GrahaTableProps {
  placements: Placements;
  className?: string;
}

type SortField = 'name' | 'sign' | 'degree' | 'house' | 'nakshatra' | 'd9Sign' | 'd9House';
type SortDirection = 'asc' | 'desc';

type GrahaSortButtonProps = {
  field: SortField;
  children: React.ReactNode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
};

function GrahaSortButton({ field, children, sortField, sortDirection, onSort }: GrahaSortButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-blue-600"
    >
      <span>{children}</span>
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ChevronUp className="w-4 h-4" aria-hidden />
        ) : (
          <ChevronDown className="w-4 h-4" aria-hidden />
        ))}
    </button>
  );
}

export default function GrahaTable({ placements, className = "" }: GrahaTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Flatten all planets from all houses
  const allPlanets = useMemo(() => {
    return placements.flatMap(house => 
      house.planets.map(planet => ({
        ...planet,
        house: house.house,
        houseSign: house.signName,
        houseRuler: getHouseRuler(house.signIndex)
      }))
    );
  }, [placements]);

  // Sort planets
  const sortedPlanets = useMemo(() => {
    return [...allPlanets].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'sign':
          aValue = a.signIndex;
          bValue = b.signIndex;
          break;
        case 'degree':
          aValue = a.degreeInSign;
          bValue = b.degreeInSign;
          break;
        case 'house':
          aValue = a.house;
          bValue = b.house;
          break;
        case 'nakshatra':
          aValue = a.nakshatraIndex || 0;
          bValue = b.nakshatraIndex || 0;
          break;
        case 'd9Sign':
          aValue = a.d9SignIndex || 0;
          bValue = b.d9SignIndex || 0;
          break;
        case 'd9House':
          aValue = a.d9House || 0;
          bValue = b.d9House || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allPlanets, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Planetary Positions</h3>
        <p className="text-sm text-gray-600">D1 (Rashi) and D9 (Navamsa) details</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <GrahaSortButton field="name" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Planet</GrahaSortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <GrahaSortButton field="sign" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>D1 Sign</GrahaSortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <GrahaSortButton field="degree" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Degree</GrahaSortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <GrahaSortButton field="house" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>House</GrahaSortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <GrahaSortButton field="nakshatra" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Nakshatra</GrahaSortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <GrahaSortButton field="d9Sign" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>D9 Sign</GrahaSortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <GrahaSortButton field="d9House" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>D9 House</GrahaSortButton>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedPlanets.map((planet, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{planet.name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {getSignName(planet.signIndex)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {planet.houseSign} ({planet.houseRuler})
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {planet.degreeInSign.toFixed(2)}°
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    House {planet.house}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {planet.nakshatraName ? (
                    <div>
                      <div className="text-sm text-gray-900">
                        {planet.nakshatraName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Pada {planet.pada} ({planet.nakshatraLord})
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">-</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {planet.d9SignIndex !== undefined ? (
                    <div className="text-sm text-gray-900">
                      {getSignName(planet.d9SignIndex)}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">-</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {planet.d9House ? (
                    <div className="text-sm text-gray-900">
                      House {planet.d9House}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">-</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedPlanets.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <div className="text-lg font-medium">No planetary data available</div>
          <div className="text-sm">Please check your birth details</div>
        </div>
      )}
    </div>
  );
}
