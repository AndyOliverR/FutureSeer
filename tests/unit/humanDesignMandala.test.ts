/**
 * @jest-environment node
 */

import { birthLocalToUTC } from '@/lib/birthDateTimeToUTC';
import {
  CHANNELS,
  definedCenterIdsForActiveGates,
  getGateFromPlanetPosition,
  getLineFromPlanetPosition,
} from '@/lib/humanDesign/humanDesignData';
import { calculateHumanDesignChart } from '@/lib/humanDesign/humanDesignCalculator';
import { calculateTropicalPlanets } from '@/lib/western/tropicalCalculator';

describe('Human Design Rave Mandala', () => {
  it('places published anchors on the wheel that starts at 2° Aquarius', () => {
    // Gate 41 line 1 begins at 2°00' Aquarius. The old formula returned gate 54.
    expect(Math.floor(302 / 5.625) + 1).toBe(54);
    expect(getGateFromPlanetPosition(302)).toBe(41);
    expect(getLineFromPlanetPosition(302)).toBe(1);
    expect(getGateFromPlanetPosition(302 + 0.9375)).toBe(41);
    expect(getLineFromPlanetPosition(302 + 0.9375)).toBe(2);

    // Gate 25 line 1 begins at 28°15' Pisces (358.25°).
    expect(getGateFromPlanetPosition(358.25)).toBe(25);
    expect(getLineFromPlanetPosition(358.25)).toBe(1);

    // 0° Aries sits inside Gate 25, line 2 — not Gate 1.
    expect(getGateFromPlanetPosition(0)).toBe(25);
    expect(getLineFromPlanetPosition(0)).toBe(2);

    // Gate 18 runs from 3°52'30" Libra (183.875°).
    expect(getGateFromPlanetPosition(183.875)).toBe(18);
    expect(getLineFromPlanetPosition(183.875)).toBe(1);
  });

  it('defines a center only when both gates of its channel are active', () => {
    expect(Object.keys(CHANNELS)).toHaveLength(36);
    expect(definedCenterIdsForActiveGates(new Set([1]))).toEqual([]);
    expect(definedCenterIdsForActiveGates(new Set([21]))).toEqual([]);
    expect(definedCenterIdsForActiveGates(new Set([1, 8])).sort()).toEqual(['g', 'throat']);
    expect(definedCenterIdsForActiveGates(new Set([21, 45])).sort()).toEqual(['heart', 'throat']);
    expect(CHANNELS['1-8'].center1).toBe('g');
    expect(CHANNELS['1-8'].center2).toBe('throat');
    expect(CHANNELS['34-57'].center1).toBe('sacral');
    expect(CHANNELS['34-57'].center2).toBe('spleen');
  });
});

describe('Human Design chart', () => {
  it('casts personality at local time and design 88° of solar arc earlier', async () => {
    const chart = await calculateHumanDesignChart({
      birthDate: '1990-06-15',
      birthTime: '14:30',
      birthPlace: 'Mumbai, India',
      latitude: 19.076,
      longitude: 72.8777,
    });

    const personalityUtc = birthLocalToUTC('1990-06-15', '14:30', {
      latitude: 19.076,
      longitude: 72.8777,
    });
    const personalitySun = calculateTropicalPlanets(personalityUtc).sun.longitude;
    const sun = chart.gates.find((gate) => gate.planet === 'Sun');
    const earth = chart.gates.find((gate) => gate.planet === 'Earth');
    const designSun = chart.gates.find((gate) => gate.planet === 'Design Sun');

    expect(chart.mandalaVersion).toBe(2);
    expect(sun).toBeDefined();
    expect(designSun).toBeDefined();
    expect(earth).toBeDefined();
    expect(sun!.longitude).toBeCloseTo(personalitySun, 5);
    expect(sun!.gate).toBe(getGateFromPlanetPosition(personalitySun));
    expect(sun!.line).toBe(getLineFromPlanetPosition(personalitySun));

    const designArc = (sun!.longitude - designSun!.longitude + 360) % 360;
    expect(designArc).toBeCloseTo(88, 2);
    expect(chart.profile.id).toBe(`${sun!.line}/${designSun!.line}`);

    // Earth is exactly opposite the Sun, so its line matches the Sun line.
    // The old profile used that pair (n/n) and fell back to 1/3.
    expect(earth!.line).toBe(sun!.line);
    if (designSun!.line !== sun!.line) {
      expect(chart.profile.id).not.toBe(`${sun!.line}/${sun!.line}`);
    }

    for (const centerId of chart.centers.defined) {
      expect(chart.channels.some((channel) => channel.centers.includes(centerId))).toBe(true);
    }
    if (chart.centers.defined.includes('sacral')) {
      expect(chart.type.id).toBe('generator');
    }
    if (chart.type.id === 'manifestor') {
      expect(chart.centers.defined).not.toContain('sacral');
    }
  });
});
