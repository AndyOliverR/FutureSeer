/**
 * Kerykeion chart integration — client-safe (no server-only / AI imports).
 */

import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { userSubdocSet } from '@/lib/userSubcollectionFirestore';

export interface KerykeionData {
  birthChart: {
    planets: Array<{
      name: string;
      longitude: number;
      latitude: number;
      sign: string;
      house: number;
      degree: number;
    }>;
    houses: Array<{
      house: number;
      sign: string;
      degree: number;
    }>;
    aspects: Array<{
      planet1: string;
      planet2: string;
      aspect: string;
      orb: number;
    }>;
  };
  svgChart: string;
  synastry?: {
    compatibility: number;
    aspects: Array<{
      planet1: string;
      planet2: string;
      aspect: string;
      orb: number;
    }>;
  };
  transits?: Array<{
    planet: string;
    aspect: string;
    targetPlanet: string;
    date: string;
    orb: number;
  }>;
}

export class KerykeionIntegration {
  async generateKerykeionReading(
    userId: string,
    birthData: {
      date: string;
      time: string;
      place: string;
      latitude: number;
      longitude: number;
    },
    options: {
      includeSynastry?: boolean;
      includeTransits?: boolean;
      chartType?: 'natal' | 'synastry' | 'composite';
    } = {},
  ): Promise<KerykeionData> {
    try {
      const chartData = await this.calculateBirthChart(birthData);
      const svgChart = await this.generateSVGChart(chartData);

      const result: KerykeionData = {
        birthChart: chartData,
        svgChart,
      };

      if (options.includeSynastry) {
        result.synastry = await this.calculateSynastry(chartData);
      }

      if (options.includeTransits) {
        result.transits = await this.calculateTransits(chartData);
      }

      if (getFirebaseDB()) {
        await userSubdocSet(userId, 'readings', 'kerykeion', {
          ...(result as unknown as Record<string, unknown>),
          timestamp: Date.now(),
          source: 'kerykeion',
        });
      }

      return result;
    } catch (error) {
      devLog.error('Kerykeion integration error:', error, 'kerykeionIntegration');
      throw error;
    }
  }

  private async calculateBirthChart(_birthData: unknown): Promise<KerykeionData['birthChart']> {
    return {
      planets: [
        { name: 'Sun', longitude: 120.5, latitude: 0, sign: 'Leo', house: 5, degree: 0.5 },
        { name: 'Moon', longitude: 45.2, latitude: 2.1, sign: 'Taurus', house: 2, degree: 15.2 },
      ],
      houses: [
        { house: 1, sign: 'Aries', degree: 0 },
        { house: 2, sign: 'Taurus', degree: 30 },
      ],
      aspects: [{ planet1: 'Sun', planet2: 'Moon', aspect: 'Trine', orb: 2.5 }],
    };
  }

  private async generateSVGChart(_chartData: unknown): Promise<string> {
    return '<svg>...</svg>';
  }

  private async calculateSynastry(_chartData: unknown): Promise<NonNullable<KerykeionData['synastry']>> {
    return {
      compatibility: 0.75,
      aspects: [],
    };
  }

  private async calculateTransits(_chartData: unknown): Promise<NonNullable<KerykeionData['transits']>> {
    return [];
  }
}

export const kerykeionIntegration = new KerykeionIntegration();
