"use client";

import { useState, useEffect, useCallback } from "react";
import { generateChartData, NodeMode, ChartData } from "@/lib/astrology";
import { nakshatraFromLongitude, d9AscHouseNumber, calculateCurrentDasha } from "@/lib/vedic-core";

export interface BirthProfile {
  fullName: string;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:mm (24h)
  placeName: string;
  latitude: number;
  longitude: number;
  tzOffsetMinutes?: number;
  preferences?: {
    nodeMode?: NodeMode;
    chartStyle?: "north" | "south" | "both";
  };
}

export interface UsePlacementsResult {
  chartData: ChartData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  nodeMode: NodeMode;
  setNodeMode: (mode: NodeMode) => void;
  chartStyle: "north" | "south" | "both";
  setChartStyle: (style: "north" | "south" | "both") => void;
}

export function usePlacements(profile: BirthProfile | null): UsePlacementsResult {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodeMode, setNodeMode] = useState<NodeMode>(profile?.preferences?.nodeMode || "true");
  const [chartStyle, setChartStyle] = useState<"north" | "south" | "both">(
    profile?.preferences?.chartStyle || "both"
  );

  const calculatePlacements = useCallback(async () => {
    if (!profile) {
      setChartData(null);
      setError("No birth profile available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate profile data
      if (!profile.date || !profile.time || !profile.placeName) {
        throw new Error("Incomplete birth profile. Please check date, time, and location.");
      }
      
      // If latitude/longitude are 0, we need to resolve them from placeName
      let latitude = profile.latitude;
      let longitude = profile.longitude;
      
      if (latitude === 0 && longitude === 0) {
        // For now, use default coordinates - the chart generation will handle place resolution
        // TODO: Implement proper geocoding here if needed
        latitude = 12.2958; // Default to Mysore coordinates as fallback
        longitude = 76.6394;
      }

      // Generate chart data using the unified astrology engine
      const data = await generateChartData(
        profile.date,
        profile.time,
        latitude,
        longitude,
        nodeMode
      );

      // Enrich placements with additional Vedic calculations
      const enrichedData = await enrichChartData(data, profile);

      setChartData(enrichedData);
    } catch (err) {
      console.error("Error calculating placements:", err);
      setError(err instanceof Error ? err.message : "Failed to calculate chart data");
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  }, [profile, nodeMode]);

  const enrichChartData = async (data: ChartData, profile: BirthProfile): Promise<ChartData> => {
    // Handle both old and new data structures
    if (!data.placements || !Array.isArray(data.placements) || data.placements.length === 0) {
      // New structure - return data as-is since it's already enriched by astronomia wrapper
      console.log('📊 Using new astronomia wrapper data structure, skipping enrichment');
      return data;
    }

    // Get D9 ascendant for house mapping (old structure)
    const ascendantPlanet = data.placements[0].planets.find(p => p.name === "Asc");
    const d9AscSign = ascendantPlanet?.d9SignIndex || 0;

    // Enrich each planet with additional Vedic data
    const enrichedPlacements = data.placements.map(house => ({
      ...house,
      planets: house.planets.map(planet => {
        // Add nakshatra data if not already present
        if (!planet.nakshatraName) {
          const nakshatraData = nakshatraFromLongitude(planet.longitude);
          planet.nakshatraIndex = nakshatraData.index;
          planet.nakshatraName = nakshatraData.name;
          planet.pada = nakshatraData.pada;
          planet.nakshatraLabel = `${nakshatraData.name} ${nakshatraData.pada}`;
        }

        // Add D9 house mapping if not already present
        if (planet.d9SignIndex !== undefined && !planet.d9House) {
          planet.d9House = d9AscHouseNumber(d9AscSign, planet.d9SignIndex);
        }

        return planet;
      })
    }));

    // Calculate enhanced dasha information
    const moonPlanet = enrichedPlacements.flatMap(h => h.planets).find(p => p.name === "Moon");
    const moonLongitude = moonPlanet?.longitude || 0;
    
    // Use the existing dasha calculation or enhance it
    let enhancedDasha = data.dasha;
    let enhancedCurrentDasha = data.currentDasha;

    if (moonLongitude > 0) {
      try {
        const currentDashaInfo = calculateCurrentDasha(profile.date, moonLongitude);
        if (currentDashaInfo.currentDasha) {
          enhancedCurrentDasha = {
            planet: currentDashaInfo.currentDasha.lord,
            startDate: profile.date, // Simplified - would need proper calculation
            endDate: new Date(Date.now() + 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            duration: currentDashaInfo.currentDasha.years,
            isCurrent: true,
            progress: currentDashaInfo.progress
          };
        }
      } catch (err) {
        console.warn("Error calculating enhanced dasha:", err);
      }
    }

    return {
      ...data,
      placements: enrichedPlacements,
      dasha: enhancedDasha,
      currentDasha: enhancedCurrentDasha
    };
  };

  const refresh = useCallback(() => {
    console.log('🔄 Force refreshing chart data...');
    calculatePlacements();
  }, [calculatePlacements]);

  // Recalculate when profile or nodeMode changes
  useEffect(() => {
    // Only calculate if profile is valid
    if (profile && profile.date && profile.time && profile.latitude && profile.longitude) {
      calculatePlacements();
    }
  }, [calculatePlacements, profile]);

  // Update nodeMode when profile preferences change
  useEffect(() => {
    if (profile?.preferences?.nodeMode) {
      setNodeMode(profile.preferences.nodeMode);
    }
  }, [profile?.preferences?.nodeMode]);

  // Update chartStyle when profile preferences change
  useEffect(() => {
    if (profile?.preferences?.chartStyle) {
      setChartStyle(profile.preferences.chartStyle);
    }
  }, [profile?.preferences?.chartStyle]);

  return {
    chartData,
    isLoading,
    error,
    refresh,
    nodeMode,
    setNodeMode,
    chartStyle,
    setChartStyle
  };
}
