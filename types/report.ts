// types/report.ts
export interface ReportSchema {
  user_info: { 
    userId: string; 
    name: string; 
    dob: string; 
    tob: string; 
    place: string; 
    lat: number; 
    lon: number; 
    tz: number 
  };
  charts: { 
    rasi_svg: string; 
    navamsa_svg: string; 
    varga_svgs: Record<string, string>; 
  };
  planetary_positions: {
    planet: string; 
    sign: string; 
    house: number; 
    degree: string;
    nakshatra?: string; 
    pada?: number; 
    retrograde?: boolean; 
    combust?: boolean;
  }[];
  divisional_positions?: Record<string, { planet: string; sign: string; house?: number }[]>; // e.g., D9, D10 tables
  strength: {
    shadbala: Record<string, number>;
    shadbala_breakup?: Record<string, Record<string, number>>; // Sthana, Dig, etc.
  };
  dasha: { 
    period: string; 
    dasha: string; 
    level: "maha" | "antara" | "pratyantara" | "byDate"; 
    starts: string; 
    ends: string 
  }[];
  panchang_snapshot?: { 
    dateISO: string; 
    data: unknown 
  }; // store last fetched panchang for UX
}

export interface ChartGenerationRequest {
  userId: string;
  name: string;
  dob: string;
  tob: string;
  place: string;
  lat?: number;
  lon?: number;
  tz?: number;
}

export interface FreeAstrologyAPIResponse {
  planets?: unknown;
  planetsExtended?: unknown;
  rasiSvg?: string;
  navamsaSvg?: string;
  navamsaInfo?: unknown;
  vargaSvgs?: Record<string, string>;
  shadbalaSummary?: unknown;
  shadbalaBreakup?: unknown;
  dashaMaha?: unknown;
  dashaByDate?: unknown;
  panchang?: unknown;
}

