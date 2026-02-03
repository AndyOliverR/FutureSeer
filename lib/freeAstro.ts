// FreeAstro API Integration for Testing
// This is a placeholder implementation for testing purposes

export class FreeAstro {
  static async planets(payload: any) {
    return {
      planets: [
        { name: 'Sun', longitude: 15.25, latitude: 0, speed: 1.0 },
        { name: 'Moon', longitude: 105.50, latitude: 0, speed: 13.0 }
      ]
    };
  }

  static async rasiSvg(payload: any) {
    return {
      svg: '<svg>Mock Rasi Chart</svg>'
    };
  }

  static async navamsaSvg(payload: any) {
    return {
      svg: '<svg>Mock Navamsa Chart</svg>'
    };
  }

  static async shadbalaSummary(payload: any) {
    return {
      summary: 'Mock Shadbala data'
    };
  }

  static async navamsaInfo(payload: any) {
    return {
      info: 'Mock Navamsa info'
    };
  }

  static async vimsottariMaha(payload: any) {
    return {
      mahadashas: [
        { planet: 'Sun', start: '2020-01-01', end: '2026-01-01' }
      ]
    };
  }

  static async vimsottariByDate(payload: any) {
    return {
      currentDasha: { planet: 'Sun', period: '2020-2026' }
    };
  }

  static async completePanchang(payload: any) {
    return {
      dateISO: payload.date,
      data: {
        tithi: 'Shukla Paksha',
        nakshatra: 'Ashwini',
        yoga: 'Siddhi',
        karana: 'Bava'
      }
    };
  }
}
