/**
 * Transit Calculator for Western Astrology
 * Calculates current planetary positions and their aspects to natal chart
 */

import { BirthData } from '@/lib/universalOccultService';
import { Planet } from './astroChartAdapter';

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
 * Calculate current planetary positions for transit overlay
 */
export async function calculateCurrentTransits(): Promise<TransitPlanet[]> {
  const now = new Date();
  
  // In production, this would use Swiss Ephemeris or Astronomia
  // For now, we'll create realistic mock data based on current time
  const transits: TransitPlanet[] = [
    {
      name: 'Sun',
      longitude: getSunLongitude(now),
      latitude: 0,
      speed: 0.9856, // degrees per day
      isRetrograde: false,
      sign: getSignFromLongitude(getSunLongitude(now)),
      house: 0, // Will be calculated based on house system
      degree: getDegreeFromLongitude(getSunLongitude(now))
    },
    {
      name: 'Moon',
      longitude: getMoonLongitude(now),
      latitude: 0,
      speed: 13.37, // degrees per day
      isRetrograde: false,
      sign: getSignFromLongitude(getMoonLongitude(now)),
      house: 0,
      degree: getDegreeFromLongitude(getMoonLongitude(now))
    },
    {
      name: 'Mercury',
      longitude: getMercuryLongitude(now),
      latitude: 0,
      speed: 1.38,
      isRetrograde: isMercuryRetrograde(now),
      sign: getSignFromLongitude(getMercuryLongitude(now)),
      house: 0,
      degree: getDegreeFromLongitude(getMercuryLongitude(now))
    },
    {
      name: 'Venus',
      longitude: getVenusLongitude(now),
      latitude: 0,
      speed: 1.19,
      isRetrograde: isVenusRetrograde(now),
      sign: getSignFromLongitude(getVenusLongitude(now)),
      house: 0,
      degree: getDegreeFromLongitude(getVenusLongitude(now))
    },
    {
      name: 'Mars',
      longitude: getMarsLongitude(now),
      latitude: 0,
      speed: 0.524,
      isRetrograde: isMarsRetrograde(now),
      sign: getSignFromLongitude(getMarsLongitude(now)),
      house: 0,
      degree: getDegreeFromLongitude(getMarsLongitude(now))
    },
    {
      name: 'Jupiter',
      longitude: getJupiterLongitude(now),
      latitude: 0,
      speed: 0.0831,
      isRetrograde: isJupiterRetrograde(now),
      sign: getSignFromLongitude(getJupiterLongitude(now)),
      house: 0,
      degree: getDegreeFromLongitude(getJupiterLongitude(now))
    },
    {
      name: 'Saturn',
      longitude: getSaturnLongitude(now),
      latitude: 0,
      speed: 0.0334,
      isRetrograde: isSaturnRetrograde(now),
      sign: getSignFromLongitude(getSaturnLongitude(now)),
      house: 0,
      degree: getDegreeFromLongitude(getSaturnLongitude(now))
    },
    {
      name: 'Uranus',
      longitude: getUranusLongitude(now),
      latitude: 0,
      speed: 0.0118,
      isRetrograde: isUranusRetrograde(now),
      sign: getSignFromLongitude(getUranusLongitude(now)),
      house: 0,
      degree: getDegreeFromLongitude(getUranusLongitude(now))
    },
    {
      name: 'Neptune',
      longitude: getNeptuneLongitude(now),
      latitude: 0,
      speed: 0.006,
      isRetrograde: isNeptuneRetrograde(now),
      sign: getSignFromLongitude(getNeptuneLongitude(now)),
      house: 0,
      degree: getDegreeFromLongitude(getNeptuneLongitude(now))
    },
    {
      name: 'Pluto',
      longitude: getPlutoLongitude(now),
      latitude: 0,
      speed: 0.004,
      isRetrograde: isPlutoRetrograde(now),
      sign: getSignFromLongitude(getPlutoLongitude(now)),
      house: 0,
      degree: getDegreeFromLongitude(getPlutoLongitude(now))
    }
  ];

  return transits;
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

// Helper functions for planetary positions (mock calculations)

function getSunLongitude(date: Date): number {
  // Approximate: Sun moves ~0.9856 degrees per day
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return (dayOfYear * 0.9856) % 360;
}

function getMoonLongitude(date: Date): number {
  // Moon moves ~13.37 degrees per day
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return (daysSinceEpoch * 13.37) % 360;
}

function getMercuryLongitude(date: Date): number {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return (daysSinceEpoch * 1.38 + Math.sin(daysSinceEpoch * 0.0172) * 30) % 360;
}

function getVenusLongitude(date: Date): number {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return (daysSinceEpoch * 1.19 + Math.sin(daysSinceEpoch * 0.0137) * 45) % 360;
}

function getMarsLongitude(date: Date): number {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return (daysSinceEpoch * 0.524 + Math.sin(daysSinceEpoch * 0.0098) * 60) % 360;
}

function getJupiterLongitude(date: Date): number {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return (daysSinceEpoch * 0.0831 + Math.sin(daysSinceEpoch * 0.0047) * 90) % 360;
}

function getSaturnLongitude(date: Date): number {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return (daysSinceEpoch * 0.0334 + Math.sin(daysSinceEpoch * 0.0034) * 120) % 360;
}

function getUranusLongitude(date: Date): number {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return (daysSinceEpoch * 0.0118 + Math.sin(daysSinceEpoch * 0.0024) * 150) % 360;
}

function getNeptuneLongitude(date: Date): number {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return (daysSinceEpoch * 0.006 + Math.sin(daysSinceEpoch * 0.0017) * 180) % 360;
}

function getPlutoLongitude(date: Date): number {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return (daysSinceEpoch * 0.004 + Math.sin(daysSinceEpoch * 0.0012) * 200) % 360;
}

// Retrograde calculations (simplified)

function isMercuryRetrograde(date: Date): boolean {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return Math.sin(daysSinceEpoch * 0.0172) > 0.7;
}

function isVenusRetrograde(date: Date): boolean {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return Math.sin(daysSinceEpoch * 0.0137) > 0.8;
}

function isMarsRetrograde(date: Date): boolean {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return Math.sin(daysSinceEpoch * 0.0098) > 0.9;
}

function isJupiterRetrograde(date: Date): boolean {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return Math.sin(daysSinceEpoch * 0.0047) > 0.95;
}

function isSaturnRetrograde(date: Date): boolean {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return Math.sin(daysSinceEpoch * 0.0034) > 0.9;
}

function isUranusRetrograde(date: Date): boolean {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return Math.sin(daysSinceEpoch * 0.0024) > 0.8;
}

function isNeptuneRetrograde(date: Date): boolean {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return Math.sin(daysSinceEpoch * 0.0017) > 0.7;
}

function isPlutoRetrograde(date: Date): boolean {
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / 86400000;
  return Math.sin(daysSinceEpoch * 0.0012) > 0.6;
}

// Utility functions

function getSignFromLongitude(longitude: number): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs[Math.floor(longitude / 30)];
}

function getDegreeFromLongitude(longitude: number): number {
  return longitude % 30;
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
