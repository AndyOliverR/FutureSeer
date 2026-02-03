import nationalChartsData from './nationalCharts.json';

export interface NationalChart {
  name: string;
  code: string;
  foundingDate: string;
  foundingTime: string;
  foundingPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  chartSource: string;
  chartType: string;
  description: string;
}

/**
 * Get national chart by country name or code
 */
export function getNationalChart(countryNameOrCode: string): NationalChart | null {
  const normalized = countryNameOrCode.toLowerCase().trim();
  
  const chart = nationalChartsData.countries.find(
    (c) => c.name.toLowerCase() === normalized || c.code.toLowerCase() === normalized
  );
  
  return chart || null;
}

/**
 * Get all available national charts
 */
export function getAllNationalCharts(): NationalChart[] {
  return nationalChartsData.countries;
}

/**
 * Get national chart by country code
 */
export function getNationalChartByCode(code: string): NationalChart | null {
  const chart = nationalChartsData.countries.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );
  
  return chart || null;
}

/**
 * Search national charts by partial name
 */
export function searchNationalCharts(query: string): NationalChart[] {
  const normalized = query.toLowerCase().trim();
  
  return nationalChartsData.countries.filter(
    (c) => c.name.toLowerCase().includes(normalized) || 
           c.code.toLowerCase().includes(normalized)
  );
}

/**
 * Get chart data formatted for astrological calculation
 */
export function getNationalChartBirthData(countryNameOrCode: string) {
  const chart = getNationalChart(countryNameOrCode);
  
  if (!chart) {
    return null;
  }
  
  return {
    birthDate: chart.foundingDate,
    birthTime: chart.foundingTime,
    birthPlace: chart.foundingPlace,
    latitude: chart.latitude,
    longitude: chart.longitude,
    timezone: chart.timezone,
    chartSource: chart.chartSource,
    chartType: chart.chartType
  };
}

