// Universal Occult Service - The "Google of Occult"
// Comprehensive service for all occult systems powered by Swiss Ephemeris

import { getServerBaseUrl } from './serverBaseUrl';
import { devLog } from '@/lib/devLogger';

export interface BirthData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

export interface OccultRequest {
  system: string;
  birthData?: BirthData;
  question?: string;
  options?: any;
  userProfile?: any;
}

export interface OccultResponse {
  success: boolean;
  system: string;
  data: any;
  metadata: {
    generatedAt: string;
    source: string;
    version: string;
    calculationTime: number;
  };
}

export interface SupportedSystem {
  name: string;
  description: string;
  requires: string[];
  category: string;
  isPremium: boolean;
}

class UniversalOccultService {
  private baseUrl: string;

  constructor() {
    // Use absolute URL for server-side fetch calls
    if (typeof window !== 'undefined') {
      // Client-side: use relative URL
      this.baseUrl = '/api/occult/universal';
    } else {
      // Server-side: use absolute URL
      this.baseUrl = `${getServerBaseUrl()}/api/occult/universal`;
    }
  }

  // Core occult systems
  async calculateVedicChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    return this.makeRequest('vedic', { birthData, options });
  }

  async calculateWesternChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    return this.makeRequest('western', { birthData, options });
  }

  async calculateHoraryChart(birthData: BirthData, question: string, options: any = {}): Promise<OccultResponse> {
    return this.makeRequest('horary', { birthData, question, options });
  }

  async calculateElectionalChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    return this.makeRequest('electional', { birthData, options });
  }

  async calculateMedicalChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    return this.makeRequest('medical', { birthData, options });
  }

  async calculateFinancialChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    return this.makeRequest('financial', { birthData, options });
  }

  async calculateSynastryChart(birthData: BirthData, partnerData: BirthData, options: any = {}): Promise<OccultResponse> {
    return this.makeRequest('synastry', { birthData, options: { ...options, partnerData } });
  }

  async calculateLunarChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    return this.makeRequest('lunar', { birthData, options });
  }

  async calculateFixedStarChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    return this.makeRequest('fixed-star', { birthData, options });
  }

  // Advanced occult systems (to be implemented)
  async calculateUranianChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Hamburg School astrology
    return this.makeRequest('uranian', { birthData, options });
  }

  async calculateCosmobiologicalChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Ebertin system
    return this.makeRequest('cosmobiological', { birthData, options });
  }

  async calculateEsotericChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Spiritual development astrology
    return this.makeRequest('esoteric', { birthData, options });
  }

  async calculateKabbalisticChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Tree of Life correspondences
    return this.makeRequest('kabbalistic', { birthData, options });
  }

  async calculateHermeticChart(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Hermetic principles
    return this.makeRequest('hermetic', { birthData, options });
  }

  async calculateAstrocartography(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Relocation astrology
    return this.makeRequest('astrocartography', { birthData, options });
  }

  async calculateSolarReturn(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Solar return charts
    return this.makeRequest('solar-return', { birthData, options });
  }

  async calculateLunarReturn(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Lunar return charts
    return this.makeRequest('lunar-return', { birthData, options });
  }

  async calculateProgressions(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Progressed charts
    return this.makeRequest('progressions', { birthData, options });
  }

  async calculateTransits(birthData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Transit analysis
    return this.makeRequest('transits', { birthData, options });
  }

  async calculateCompositeChart(birthData: BirthData, partnerData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Composite relationship charts
    return this.makeRequest('composite', { birthData, options: { ...options, partnerData } });
  }

  async calculateDavisonChart(birthData: BirthData, partnerData: BirthData, options: any = {}): Promise<OccultResponse> {
    // Davison relationship charts
    return this.makeRequest('davison', { birthData, options: { ...options, partnerData } });
  }

  // Comprehensive analysis
  async getComprehensiveAnalysis(birthData: BirthData, systems: string[] = []): Promise<{
    [key: string]: OccultResponse;
  }> {
    const defaultSystems = [
      'vedic', 'western', 'lunar', 'fixed-star', 'medical', 'financial'
    ];
    
    const systemsToAnalyze = systems.length > 0 ? systems : defaultSystems;
    
    const results = await Promise.allSettled(
      systemsToAnalyze.map(system => this.makeRequest(system, { birthData }))
    );

    const analysis: { [key: string]: OccultResponse } = {};
    
    results.forEach((result, index) => {
      const system = systemsToAnalyze[index];
      if (result.status === 'fulfilled') {
        analysis[system] = result.value;
      } else {
        devLog.error(`Failed to analyze ${system}:`, result.reason, 'universalOccultService');
        analysis[system] = {
          success: false,
          system,
          data: null,
          metadata: {
            generatedAt: new Date().toISOString(),
            source: 'FutureSeer Universal Occult API',
            version: '1.0.0',
            calculationTime: 0
          }
        };
      }
    });

    return analysis;
  }

  // Get supported systems
  async getSupportedSystems(): Promise<SupportedSystem[]> {
    try {
      const response = await fetch(this.baseUrl);
      const data = await response.json();
      return data.supportedSystems || [];
    } catch (error) {
      devLog.error('Failed to get supported systems:', error, 'universalOccultService');
      return this.getDefaultSupportedSystems();
    }
  }

  // Get system information
  async getSystemInfo(system: string): Promise<SupportedSystem | null> {
    const systems = await this.getSupportedSystems();
    return systems.find(s => s.name === system) || null;
  }

  // Validate request
  validateRequest(system: string, birthData?: BirthData, options: any = {}): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!system) {
      errors.push('System is required');
    }

    const systemInfo = this.getDefaultSupportedSystems().find(s => s.name === system);
    if (!systemInfo) {
      errors.push(`Unsupported system: ${system}`);
    }

    if (systemInfo?.requires.includes('birthData') && !birthData) {
      errors.push('Birth data is required for this system');
    }

    if (systemInfo?.requires.includes('question') && !options.question) {
      errors.push('Question is required for this system');
    }

    if (systemInfo?.requires.includes('partnerData') && !options.partnerData) {
      errors.push('Partner data is required for this system');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Private methods
  private async makeRequest(system: string, requestData: any): Promise<OccultResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system,
          ...requestData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      devLog.error(`Universal Occult Service Error (${system}, undefined, 'universalOccultService'):`, error);
      throw error;
    }
  }

  private getDefaultSupportedSystems(): SupportedSystem[] {
    return [
      {
        name: 'vedic',
        description: 'Ancient Indian astrological system',
        requires: ['birthData'],
        category: 'Astrology',
        isPremium: true
      },
      {
        name: 'western',
        description: 'Traditional Western zodiac system',
        requires: ['birthData'],
        category: 'Astrology',
        isPremium: false
      },
      {
        name: 'horary',
        description: 'Question-based astrological divination',
        requires: ['birthData', 'question'],
        category: 'Astrology',
        isPremium: true
      },
      {
        name: 'electional',
        description: 'Choosing auspicious times for events',
        requires: ['birthData'],
        category: 'Astrology',
        isPremium: true
      },
      {
        name: 'medical',
        description: 'Health-focused astrological analysis',
        requires: ['birthData'],
        category: 'Astrology',
        isPremium: true
      },
      {
        name: 'financial',
        description: 'Investment and wealth astrological guidance',
        requires: ['birthData'],
        category: 'Astrology',
        isPremium: true
      },
      {
        name: 'synastry',
        description: 'Relationship compatibility analysis',
        requires: ['birthData', 'partnerData'],
        category: 'Astrology',
        isPremium: true
      },
      {
        name: 'lunar',
        description: 'Moon-based astrological systems',
        requires: ['birthData'],
        category: 'Astrology',
        isPremium: false
      },
      {
        name: 'fixed-star',
        description: 'Fixed star influences and aspects',
        requires: ['birthData'],
        category: 'Astrology',
        isPremium: true
      }
    ];
  }
}

// Export singleton instance
export const universalOccultService = new UniversalOccultService();
export default universalOccultService;
