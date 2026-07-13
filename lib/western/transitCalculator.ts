/**
 * Transit Calculator for Western Astrology
 * Calculates current planetary positions and their aspects to natal chart
 */

import { getTropicalSkyBodies } from '@/lib/astrology/computedSkyPositions';
import type { Planet } from './astroChartAdapter';

export interface TransitPlanet {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  isRetrograde: boolean;
  sign: string;
  house: number;
  degree: number;
}

export interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  orb: number;
  exactness: number; // 0-1, how exact the aspect is
  strength: 'weak' | 'moderate' | 'strong' | 'exact';
  nature: 'harmonious' | 'challenging' | 'neutral';
  description: string;
}

export interface TransitInterpretation {
  planet: string;
  aspect: string;
  natalPlanet: string;
  interpretation: string;
  influence: string;
  duration: string;
  advice: string;
}

/**
 * Calculate current planetary positions for transit overlay (Astronomia tropical).
 */
export async function calculateCurrentTransits(date: Date = new Date()): Promise<TransitPlanet[]> {
  return getTropicalSkyBodies(date).map((body) => ({
    ...body,
    house: body.house ?? 0,
  }));
}

/**
 * Calculate aspects between transiting planets and natal planets
 */
export function calculateTransitAspects(
  natalPlanets: Planet[],
  transitPlanets: TransitPlanet[]
): TransitAspect[] {
  const aspects: TransitAspect[] = [];
  
  natalPlanets.forEach(natal => {
    transitPlanets.forEach(transit => {
      const aspect = calculateAspect(natal.longitude, transit.longitude);
      
      if (aspect && aspect.orb <= 8) { // Only significant aspects
        aspects.push({
          transitPlanet: transit.name,
          natalPlanet: natal.name,
          aspectType: aspect.type as TransitAspect['aspectType'],
          orb: aspect.orb,
          exactness: 1 - (aspect.orb / aspect.maxOrb),
          strength: getAspectStrength(aspect.orb),
          nature: getAspectNature(aspect.type),
          description: generateTransitDescription(transit.name, natal.name, aspect.type, aspect.orb)
        });
      }
    });
  });
  
  return aspects.sort((a, b) => b.exactness - a.exactness); // Most exact first
}

/**
 * Generate interpretations for transit aspects
 */
export function generateTransitInterpretations(aspects: TransitAspect[]): TransitInterpretation[] {
  return aspects.map(aspect => ({
    planet: aspect.transitPlanet,
    aspect: aspect.aspectType,
    natalPlanet: aspect.natalPlanet,
    interpretation: generateAspectInterpretation(aspect),
    influence: generateAspectInfluence(aspect),
    duration: getTransitDuration(aspect.transitPlanet),
    advice: generateTransitAdvice(aspect)
  }));
}

function calculateAspect(longitude1: number, longitude2: number): { type: string; orb: number; maxOrb: number } | null {
  const angle = Math.abs(longitude1 - longitude2);
  const normalizedAngle = Math.min(angle, 360 - angle);
  
  const aspects = [
    { type: 'conjunction', degrees: 0, maxOrb: 8 },
    { type: 'sextile', degrees: 60, maxOrb: 6 },
    { type: 'square', degrees: 90, maxOrb: 8 },
    { type: 'trine', degrees: 120, maxOrb: 8 },
    { type: 'opposition', degrees: 180, maxOrb: 8 },
    { type: 'quincunx', degrees: 150, maxOrb: 3 }
  ];
  
  for (const aspect of aspects) {
    const orb = Math.abs(normalizedAngle - aspect.degrees);
    if (orb <= aspect.maxOrb) {
      return { type: aspect.type, orb, maxOrb: aspect.maxOrb };
    }
  }
  
  return null;
}

function getAspectStrength(orb: number): 'weak' | 'moderate' | 'strong' | 'exact' {
  if (orb <= 1) return 'exact';
  if (orb <= 3) return 'strong';
  if (orb <= 5) return 'moderate';
  return 'weak';
}

function getAspectNature(type: string): 'harmonious' | 'challenging' | 'neutral' {
  const harmonious = ['trine', 'sextile'];
  const challenging = ['opposition', 'square'];
  
  if (harmonious.includes(type)) return 'harmonious';
  if (challenging.includes(type)) return 'challenging';
  return 'neutral';
}

function generateTransitDescription(transitPlanet: string, natalPlanet: string, aspectType: string, orb: number): string {
  const orbText = orb <= 1 ? 'exact' : orb <= 3 ? 'close' : 'wide';
  return `${transitPlanet} ${aspectType} ${natalPlanet} (${orb.toFixed(1)}° orb - ${orbText})`;
}

function generateAspectInterpretation(aspect: TransitAspect): string {
  const interpretations = {
    conjunction: `${aspect.transitPlanet} is joining forces with your natal ${aspect.natalPlanet}, intensifying its energy and bringing new opportunities.`,
    opposition: `${aspect.transitPlanet} opposes your natal ${aspect.natalPlanet}, creating tension that requires balance and compromise.`,
    trine: `${aspect.transitPlanet} harmoniously supports your natal ${aspect.natalPlanet}, bringing ease and natural flow.`,
    square: `${aspect.transitPlanet} challenges your natal ${aspect.natalPlanet}, creating friction that demands action and growth.`,
    sextile: `${aspect.transitPlanet} gently influences your natal ${aspect.natalPlanet}, offering opportunities for growth.`,
    quincunx: `${aspect.transitPlanet} forms an awkward angle with your natal ${aspect.natalPlanet}, requiring adjustment and adaptation.`
  };
  
  return interpretations[aspect.aspectType] || 'A significant astrological influence is affecting your chart.';
}

function generateAspectInfluence(aspect: TransitAspect): string {
  const influences = {
    harmonious: 'This transit brings positive energy and opportunities for growth.',
    challenging: 'This transit presents challenges that lead to important life lessons.',
    neutral: 'This transit provides a neutral influence that requires conscious awareness.'
  };
  
  return influences[aspect.nature];
}

function getTransitDuration(planet: string): string {
  const durations = {
    Sun: '1-2 days',
    Moon: '2-3 hours',
    Mercury: '1-2 weeks',
    Venus: '1-2 weeks',
    Mars: '1-2 months',
    Jupiter: '1-2 years',
    Saturn: '2-3 years',
    Uranus: '7-8 years',
    Neptune: '14-15 years',
    Pluto: '20-30 years'
  };
  
  return durations[planet as keyof typeof durations] || 'Variable duration';
}

function generateTransitAdvice(aspect: TransitAspect): string {
  const advice = {
    harmonious: 'Embrace this positive energy and take action on opportunities.',
    challenging: 'Stay patient and use this energy constructively for growth.',
    neutral: 'Remain aware and make conscious choices during this period.'
  };
  
  return advice[aspect.nature];
}
