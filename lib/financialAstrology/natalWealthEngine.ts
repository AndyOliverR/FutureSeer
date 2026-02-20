/**
 * Natal Wealth Engine
 * Evaluates wealth houses, wealth planets, and computes financial temperament scores.
 * Uses chart data (planets, houses) from Western/Tropical astrology.
 */

export interface PlanetInChart {
  name: string;
  sign?: string | { signName?: string };
  house?: number;
  longitude?: number;
  degree?: number;
  isRetrograde?: boolean;
}

export interface HouseInChart {
  number: number;
  sign?: string | { signName?: string };
  cusp?: number;
  longitude?: number;
}

export interface WealthHouseAnalysis {
  houseNumber: number;
  label: string;
  sign: string;
  ruler: string;
  occupants: string[];
  strength: number; // 0-100
  maleficStress: number; // 0-100
  summary: string;
}

export interface WealthPlanetAnalysis {
  planet: string;
  sign: string;
  house: number;
  dignity: 'strong' | 'neutral' | 'weak';
  financialRole: string;
  score: number; // 0-100
}

export interface NatalWealthProfile {
  incomeStabilityScore: number; // 0-100
  speculativeRiskIndex: number; // 0-100
  longTermAccumulationScore: number; // 0-100
  liquidityStressIndex: number; // 0-100
  wealthHouses: WealthHouseAnalysis[];
  wealthPlanets: WealthPlanetAnalysis[];
  temperamentSummary: string;
}

const WEALTH_HOUSE_LABELS: Record<number, string> = {
  2: 'Liquid assets, currency, immediate income',
  5: 'Speculation, stock market, risk-taking',
  6: 'Employment cash flow, service income',
  8: "Other people's money, debt, insurance, windfalls",
  10: 'Career income source',
  11: 'Realized gains, cash flow, market profit',
};

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

const WEALTH_PLANETS = ['Venus', 'Jupiter', 'Saturn', 'Mercury', 'Mars', 'Pluto'];
const BENEFIC_PLANETS = ['Venus', 'Jupiter'];
const MALEFIC_PLANETS = ['Mars', 'Saturn', 'Pluto'];

function getSignStr(obj: string | { signName?: string } | undefined): string {
  if (!obj) return 'Unknown';
  if (typeof obj === 'string') return obj;
  return (obj as { signName?: string }).signName ?? 'Unknown';
}

function getPlanetsInHouse(planets: PlanetInChart[], houseNum: number): string[] {
  return planets
    .filter((p) => p.house === houseNum || (p.house === undefined && houseNum === 1))
    .map((p) => p.name);
}

function getHouseSign(houses: HouseInChart[], houseNum: number): string {
  const h = houses.find((x) => x.number === houseNum || x.number === houseNum - 1);
  return getSignStr(h?.sign) ?? 'Unknown';
}

function assessDignity(planet: string, sign: string): 'strong' | 'neutral' | 'weak' {
  const domicile: Record<string, string[]> = {
    Mars: ['Aries', 'Scorpio'],
    Venus: ['Taurus', 'Libra'],
    Mercury: ['Gemini', 'Virgo'],
    Moon: ['Cancer'],
    Sun: ['Leo'],
    Jupiter: ['Sagittarius', 'Pisces'],
    Saturn: ['Capricorn', 'Aquarius'],
    Uranus: ['Aquarius'],
    Neptune: ['Pisces'],
    Pluto: ['Scorpio'],
  };
  const exaltation: Record<string, string> = {
    Sun: 'Aries',
    Moon: 'Taurus',
    Mars: 'Capricorn',
    Mercury: 'Virgo',
    Jupiter: 'Cancer',
    Venus: 'Pisces',
    Saturn: 'Libra',
  };
  const planets = domicile[planet];
  if (planets?.includes(sign)) return 'strong';
  if (exaltation[planet] === sign) return 'strong';
  const detriment = Object.entries(domicile).find(([, signs]) => signs.includes(sign))?.[0];
  if (planet === detriment) return 'weak';
  return 'neutral';
}

export function evaluateWealthHouses(
  planets: PlanetInChart[],
  houses: HouseInChart[]
): WealthHouseAnalysis[] {
  const wealthHouseNums = [2, 5, 6, 8, 10, 11];
  return wealthHouseNums.map((num) => {
    const sign = getHouseSign(houses, num);
    const ruler = SIGN_RULERS[sign] ?? 'Unknown';
    const occupants = getPlanetsInHouse(planets, num);
    const maleficCount = occupants.filter((p) => MALEFIC_PLANETS.includes(p)).length;
    const beneficCount = occupants.filter((p) => BENEFIC_PLANETS.includes(p)).length;
    const strength = Math.min(100, 50 + beneficCount * 15 - maleficCount * 15);
    const maleficStress = Math.min(100, maleficCount * 25);
    let summary = `House ${num} (${sign}): ${occupants.length ? occupants.join(', ') + ' present' : 'empty'}. `;
    if (strength > 60) summary += 'Favorable for wealth. ';
    if (maleficStress > 40) summary += 'Some stress or delays possible. ';
    return {
      houseNumber: num,
      label: WEALTH_HOUSE_LABELS[num] ?? '',
      sign,
      ruler,
      occupants,
      strength: Math.max(0, strength),
      maleficStress,
      summary,
    };
  });
}

export function evaluateWealthPlanets(planets: PlanetInChart[]): WealthPlanetAnalysis[] {
  const roles: Record<string, string> = {
    Venus: 'Financial flow, values, luxury',
    Jupiter: 'Expansion, opportunity, abundance',
    Saturn: 'Long-term accumulation, discipline',
    Mercury: 'Trade, communication, volatility',
    Mars: 'Speculative aggression, initiative',
    Pluto: 'Transformation, high-risk/reward',
  };
  return WEALTH_PLANETS.map((planetName) => {
    const p = planets.find(
      (x) => x.name === planetName || x.name?.toLowerCase() === planetName.toLowerCase()
    );
    const sign = p ? getSignStr(p.sign) : 'Unknown';
    const house = p?.house ?? 0;
    const dignity = p ? assessDignity(planetName, sign) : 'neutral';
    const baseScore = dignity === 'strong' ? 80 : dignity === 'weak' ? 40 : 60;
    const houseBonus = [2, 5, 8, 10, 11].includes(house) ? 10 : 0;
    const score = Math.min(100, baseScore + houseBonus);
    return {
      planet: planetName,
      sign,
      house,
      dignity,
      financialRole: roles[planetName] ?? 'General influence',
      score,
    };
  });
}

export function computeNatalWealthProfile(
  planets: PlanetInChart[],
  houses: HouseInChart[]
): NatalWealthProfile {
  const wealthHouses = evaluateWealthHouses(planets, houses);
  const wealthPlanets = evaluateWealthPlanets(planets);

  const house2 = wealthHouses.find((h) => h.houseNumber === 2);
  const house8 = wealthHouses.find((h) => h.houseNumber === 8);
  const saturn = wealthPlanets.find((p) => p.planet === 'Saturn');
  const jupiter = wealthPlanets.find((p) => p.planet === 'Jupiter');
  const mars5 = wealthHouses.find((h) => h.houseNumber === 5)?.occupants.includes('Mars');
  const uranusIn5or8 =
    planets.some((p) => p.name === 'Uranus' && (p.house === 5 || p.house === 8)) ?? false;

  const incomeStabilityScore =
    ((house2?.strength ?? 50) * 0.5 + (saturn?.score ?? 50) * 0.3 + 50 * 0.2);
  const speculativeRiskIndex = Math.min(
    100,
    (mars5 ? 25 : 0) + (uranusIn5or8 ? 25 : 0) + 30 - (saturn?.score ?? 50) * 0.3
  );
  const longTermAccumulationScore =
    (jupiter?.score ?? 50) * 0.4 + (saturn?.score ?? 50) * 0.4 + (house2?.strength ?? 50) * 0.2;
  const liquidityStressIndex = Math.min(
    100,
    (house8?.maleficStress ?? 0) * 0.4 + (house2?.maleficStress ?? 0) * 0.4 + 20
  );

  let temperamentSummary = 'Balanced financial temperament. ';
  if (incomeStabilityScore > 70)
    temperamentSummary += 'Strong income stability and steady cash flow. ';
  if (speculativeRiskIndex > 60)
    temperamentSummary += 'Higher appetite for speculative and high-risk investments. ';
  if (longTermAccumulationScore > 65)
    temperamentSummary += 'Favorable for long-term wealth building. ';
  if (liquidityStressIndex > 50)
    temperamentSummary += 'Periods of liquidity stress may occur; maintain reserves. ';

  return {
    incomeStabilityScore: Math.round(Math.min(100, Math.max(0, incomeStabilityScore))),
    speculativeRiskIndex: Math.round(Math.min(100, Math.max(0, speculativeRiskIndex))),
    longTermAccumulationScore: Math.round(Math.min(100, Math.max(0, longTermAccumulationScore))),
    liquidityStressIndex: Math.round(Math.min(100, Math.max(0, liquidityStressIndex))),
    wealthHouses,
    wealthPlanets,
    temperamentSummary: temperamentSummary.trim(),
  };
}
