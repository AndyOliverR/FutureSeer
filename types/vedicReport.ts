// Vedic report schema for AI interpretation and storage
export interface VedicReportSchema {
  planetary_positions?: Array<{
    planet?: string;
    shadbala?: number;
    strength?: string;
    [key: string]: unknown;
  }>;
  house_analysis?: Array<{
    house?: number;
    strength?: string;
    [key: string]: unknown;
  }>;
  personality_analysis?: unknown;
  current_influences?: {
    current_dasha?: string;
    retrograde_planets?: string[];
    [key: string]: unknown;
  };
  dasha_forecast?: unknown;
  nakshatra_analysis?: Array<{ nakshatra?: string; [key: string]: unknown }>;
  yogas_doshas?: {
    yogas?: Array<{ name?: string; [key: string]: unknown }>;
    doshas?: unknown[];
    [key: string]: unknown;
  };
  strength_analysis?: unknown;
  [key: string]: unknown;
}
