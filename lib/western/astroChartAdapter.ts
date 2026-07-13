/**
 * Data Transformation Utilities for AstroChart Integration
 * Converts our internal data format to AstroChart's expected format
 */

import { BirthData } from '@/lib/universalOccultService';

// Our internal data types
export interface Planet {
  name: string;
  longitude: number;
  sign: string;
  house: number;
  degree: number;
  isRetrograde?: boolean;
}

export interface House {
  number: number;
  cusp: number;
  sign: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
}

// AstroChart expected format
export interface AstroChartPlanet {
  name: string;
  longitude: number;
  latitude?: number;
  distance?: number;
  speed?: number;
  isRetrograde?: boolean;
}

export interface AstroChartHouse {
  number: number;
  longitude: number;
  sign: string;
}

export interface AstroChartAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

/**
 * Transform our planets to AstroChart format
 */
export function transformPlanetsToAstroChart(planets: Planet[]): AstroChartPlanet[] {
  return planets.map(planet => ({
    name: planet.name,
    longitude: planet.longitude,
    isRetrograde: planet.isRetrograde || false
  }));
}

/**
 * Transform our houses to AstroChart format
 */
export function transformHousesToAstroChart(houses: House[]): AstroChartHouse[] {
  return houses.map(house => ({
    number: house.number,
    longitude: house.cusp,
    sign: house.sign
  }));
}

/**
 * Transform our aspects to AstroChart format
 */
export function transformAspectsToAstroChart(aspects: Aspect[]): AstroChartAspect[] {
  return aspects
    .filter(aspect => ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(aspect.type))
    .map(aspect => ({
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      type: aspect.type,
      orb: aspect.orb
    }));
}

/**
 * Get current planetary positions for transit overlay (Astronomia tropical).
 */
export async function getCurrentTransits(date: Date = new Date()): Promise<AstroChartPlanet[]> {
  const { getTropicalSkyBodies } = await import('@/lib/astrology/computedSkyPositions');
  return getTropicalSkyBodies(date).map((body) => ({
    name: body.name,
    longitude: body.longitude,
    latitude: body.latitude,
    speed: body.speed,
    isRetrograde: body.isRetrograde,
  }));
}

/**
 * Prepare synastry data for compatibility charts
 */
export function prepareSynastryData(
  userPlanets: Planet[],
  partnerBirthData: BirthData
): { userPlanets: AstroChartPlanet[], partnerPlanets: AstroChartPlanet[] } {
  // Transform user planets
  const userTransformed = transformPlanetsToAstroChart(userPlanets);
  
  // For partner planets, we'd need to calculate their chart first
  // This is a placeholder - in production, use our existing chart calculation
  const partnerPlanets: AstroChartPlanet[] = userTransformed.map(planet => ({
    ...planet,
    longitude: (planet.longitude + 180) % 360 // Mock: opposite positions
  }));

  return {
    userPlanets: userTransformed,
    partnerPlanets
  };
}

/**
 * Calculate transit aspects to natal chart
 */
export function calculateTransitAspects(
  natalPlanets: Planet[],
  transitPlanets: AstroChartPlanet[]
): AstroChartAspect[] {
  const aspects: AstroChartAspect[] = [];
  
  natalPlanets.forEach(natal => {
    transitPlanets.forEach(transit => {
      const angle = Math.abs(natal.longitude - transit.longitude);
      const normalizedAngle = Math.min(angle, 360 - angle);
      
      // Check for major aspects
      const aspectTolerance = 8; // degrees
      
      if (Math.abs(normalizedAngle) < aspectTolerance) {
        aspects.push({
          planet1: natal.name,
          planet2: transit.name,
          type: 'conjunction',
          orb: normalizedAngle
        });
      } else if (Math.abs(normalizedAngle - 60) < aspectTolerance) {
        aspects.push({
          planet1: natal.name,
          planet2: transit.name,
          type: 'sextile',
          orb: Math.abs(normalizedAngle - 60)
        });
      } else if (Math.abs(normalizedAngle - 90) < aspectTolerance) {
        aspects.push({
          planet1: natal.name,
          planet2: transit.name,
          type: 'square',
          orb: Math.abs(normalizedAngle - 90)
        });
      } else if (Math.abs(normalizedAngle - 120) < aspectTolerance) {
        aspects.push({
          planet1: natal.name,
          planet2: transit.name,
          type: 'trine',
          orb: Math.abs(normalizedAngle - 120)
        });
      } else if (Math.abs(normalizedAngle - 180) < aspectTolerance) {
        aspects.push({
          planet1: natal.name,
          planet2: transit.name,
          type: 'opposition',
          orb: Math.abs(normalizedAngle - 180)
        });
      }
    });
  });
  
  return aspects;
}

/**
 * Get chart theme configuration for FutureSeer styling
 */
export function getFutureSeerChartTheme() {
  return {
    background: {
      color: '#0F172A', // slate-900
      opacity: 1
    },
    planets: {
      colors: {
        Sun: '#FBBF24', // amber-400
        Moon: '#F3F4F6', // gray-100
        Mercury: '#60A5FA', // blue-400
        Venus: '#F472B6', // pink-400
        Mars: '#F87171', // red-400
        Jupiter: '#A78BFA', // violet-400
        Saturn: '#6B7280', // gray-500
        Uranus: '#34D399', // emerald-400
        Neptune: '#22D3EE', // cyan-400
        Pluto: '#A855F7' // purple-500
      }
    },
    aspects: {
      colors: {
        conjunction: '#FFFFFF',
        opposition: '#EF4444', // red-500
        trine: '#3B82F6', // blue-500
        square: '#F59E0B', // amber-500
        sextile: '#10B981' // emerald-500
      }
    },
    houses: {
      color: '#6B7280', // gray-500
      opacity: 0.8
    },
    zodiac: {
      colors: [
        '#EF4444', // Aries - red
        '#F97316', // Taurus - orange
        '#FBBF24', // Gemini - amber
        '#84CC16', // Cancer - lime
        '#22C55E', // Leo - green
        '#10B981', // Virgo - emerald
        '#14B8A6', // Libra - teal
        '#06B6D4', // Scorpio - cyan
        '#3B82F6', // Sagittarius - blue
        '#6366F1', // Capricorn - indigo
        '#8B5CF6', // Aquarius - violet
        '#EC4899'  // Pisces - pink
      ]
    },
    text: {
      color: '#F8FAFC', // slate-50
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  };
}
