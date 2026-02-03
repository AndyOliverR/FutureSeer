import { useState, useEffect, useCallback } from "react";
import { getChart } from "@/lib/astronomia-vedic";
import { getCoordinatesWithFallback } from "@/lib/geocoding";
import { resolveBirthTime } from "@/lib/birthTimeResolver";

interface UseVedicChartProps {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  nodeMode?: "true" | "mean";
  enabled?: boolean;
}

/**
 * Custom hook for managing Vedic chart data
 * Handles chart generation, caching, and state management
 */
export function useVedicChart({
  birthDate,
  birthTime,
  birthPlace,
  nodeMode = "true",
  enabled = true,
}: UseVedicChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  const generateChart = useCallback(async () => {
    if (!enabled || !birthDate || !birthTime || !birthPlace) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Resolve coordinates
      const coords = await getCoordinatesWithFallback(birthPlace);
      setCoordinates(coords);

      // Resolve birth time
      const resolvedTime = resolveBirthTime(birthTime);

      // Generate chart
      const chart = await getChart({
        date: birthDate,
        time: resolvedTime,
        latitude: coords.latitude,
        longitude: coords.longitude,
        nodeMode,
      });

      setChartData(chart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate chart";
      setError(errorMessage);
      console.error("Error generating Vedic chart:", err);
    } finally {
      setIsLoading(false);
    }
  }, [birthDate, birthTime, birthPlace, nodeMode, enabled]);

  useEffect(() => {
    generateChart();
  }, [generateChart]);

  return {
    chartData,
    isLoading,
    error,
    coordinates,
    refetch: generateChart,
  };
}
