// AstroApp Data Normalization for FutureSeer
// Normalizes AstroApp API responses into consistent format

export interface NormalizedAstroData {
  user: {
    userId: string;
    name: string;
    dob: string;
    tob: string;
    place: string;
    lat: number;
    lon: number;
    tz: number;
  };
  planets: any[];
  rasiSvg: string;
  navamsaSvg: string;
  shadbalaSummary: any;
  dashaMaha: any;
  panchang: any;
}

export function normalizeAstroData(data: {
  user: any;
  planets: any;
  rasiSvg: string;
  navamsaSvg: string;
  shadbalaSummary: any;
  dashaMaha: any;
  panchang: any;
}): NormalizedAstroData {
  return {
    user: {
      userId: data.user.userId || 'unknown',
      name: data.user.name || 'User',
      dob: data.user.dob || '',
      tob: data.user.tob || '',
      place: data.user.place || '',
      lat: data.user.lat || 0,
      lon: data.user.lon || 0,
      tz: data.user.tz || 0
    },
    planets: Array.isArray(data.planets) ? data.planets : [],
    rasiSvg: data.rasiSvg || '',
    navamsaSvg: data.navamsaSvg || '',
    shadbalaSummary: data.shadbalaSummary || {},
    dashaMaha: data.dashaMaha || { mahadashas: [] },
    panchang: data.panchang || { dateISO: new Date().toISOString(), data: {} }
  };
}
