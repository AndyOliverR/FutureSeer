// Hellenistic Astrology Report Generator
// Generates comprehensive reports based on Hellenistic techniques

import { HellenisticAstrologyReading } from '../hellenisticAstrologyIntelligence';

export interface HellenisticReport {
  title: string;
  introduction: string;
  chartSummary: {
    ascendant: string;
    sect: string;
    dominantPlanet: string;
    chartType: string;
  };
  planetaryAnalysis: Array<{
    planet: string;
    sign: string;
    house: number;
    dignity: string;
    interpretation: string;
  }>;
  houseAnalysis: Array<{
    house: number;
    sign: string;
    themes: string[];
    planets: string[];
  }>;
  lotsAnalysis: {
    partOfFortune: string;
    partOfSpirit: string;
  };
  sectAnalysis: {
    type: string;
    implications: string[];
  };
  profectionsAnalysis: {
    currentYear: string;
    themes: string[];
  };
  lifeGuidance: {
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  };
  remedies: Array<{
    type: string;
    description: string;
    timing: string;
  }>;
}

export function generateHellenisticReport(reading: HellenisticAstrologyReading): HellenisticReport {
  // Find dominant planet (highest dignity score)
  const dominantPlanet = reading.planets.reduce((prev, current) => {
    const prevScore = reading.dignities[prev.name]?.score || 0;
    const currentScore = reading.dignities[current.name]?.score || 0;
    return currentScore > prevScore ? current : prev;
  }, reading.planets[0]);

  // Generate planetary analysis
  const planetaryAnalysis = reading.planets.map(planet => {
    const dignity = reading.dignities[planet.name];
    let dignityText = '';
    if (dignity.domicile) dignityText += 'Domicile, ';
    if (dignity.exaltation) dignityText += 'Exaltation, ';
    if (dignity.triplicity) dignityText += 'Triplicity, ';
    if (dignity.term) dignityText += 'Term, ';
    if (dignity.face) dignityText += 'Face';
    if (!dignityText) dignityText = 'No essential dignity';
    if (dignity.detriment) dignityText += ' (Detriment)';
    if (dignity.fall) dignityText += ' (Fall)';

    return {
      planet: planet.name,
      sign: planet.sign,
      house: planet.house,
      dignity: dignityText,
      interpretation: `${planet.name} in ${planet.sign} in House ${planet.house} indicates ${dignityText.toLowerCase()}. This placement influences ${getHouseTheme(planet.house)}.`
    };
  });

  // Generate house analysis
  const houseAnalysis = reading.houses.map(house => ({
    house: house.number,
    sign: house.sign,
    themes: getHouseThemes(house.number),
    planets: house.planets
  }));

  // Generate lots analysis
  const lotsAnalysis = {
    partOfFortune: `${reading.lots.partOfFortune.interpretation} Located in ${reading.lots.partOfFortune.sign} in House ${reading.lots.partOfFortune.house}.`,
    partOfSpirit: `${reading.lots.partOfSpirit.interpretation} Located in ${reading.lots.partOfSpirit.sign} in House ${reading.lots.partOfSpirit.house}.`
  };

  // Generate sect analysis
  const sectAnalysis = {
    type: reading.sect.type,
    implications: [
      `This is a ${reading.sect.type} chart, with ${reading.sect.sectLeader} as the primary light.`,
      `The ${reading.sect.benefic} works more beneficially in this chart type.`,
      `The ${reading.sect.malefic} may present more challenges and requires careful attention.`,
      `Working with your sect light (${reading.sect.sectLeader}) will help you align with your chart's natural energies.`
    ]
  };

  // Generate profections analysis
  const profectionsAnalysis = {
    currentYear: `Year ${reading.profections.currentYear} of life`,
    themes: [
      `The sign ${reading.profections.currentSign} is activated this year.`,
      `${reading.profections.lord} is the time-lord, bringing themes related to its nature.`,
      `Houses ${reading.profections.activatedHouses.join(', ')} are particularly active.`,
      reading.profections.timing
    ]
  };

  // Generate life guidance
  const lifeGuidance = {
    strengths: reading.interpretations.personality.strengths,
    challenges: reading.interpretations.personality.challenges,
    recommendations: [
      ...reading.remedies.general,
      `Work with your ${reading.sect.sectLeader} during important times.`,
      `Pay attention to the Part of Fortune for material matters.`,
      `Follow the Part of Spirit for spiritual guidance.`,
      `Time important actions with profections.`
    ]
  };

  // Generate remedies
  const remedies = [
    ...reading.remedies.planetary.map(r => ({
      type: 'Planetary',
      description: r.remedy,
      timing: r.timing
    })),
    ...reading.remedies.general.map(g => ({
      type: 'General',
      description: g,
      timing: 'Ongoing'
    }))
  ];

  return {
    title: `Hellenistic Astrology Report for ${reading.ascendant.sign} Ascendant`,
    introduction: `This comprehensive Hellenistic astrology report is based on ancient Greco-Roman techniques from the 1st century BCE to 7th century CE. Your chart uses Whole Sign Houses, planetary dignities, Lots, Sect, and Profections to reveal your unique cosmic blueprint.`,
    chartSummary: {
      ascendant: `${reading.ascendant.sign} ${reading.ascendant.degree.toFixed(1)}°`,
      sect: `${reading.sect.type.charAt(0).toUpperCase() + reading.sect.type.slice(1)} Chart`,
      dominantPlanet: dominantPlanet.name,
      chartType: 'Whole Sign Houses'
    },
    planetaryAnalysis,
    houseAnalysis,
    lotsAnalysis,
    sectAnalysis,
    profectionsAnalysis,
    lifeGuidance,
    remedies
  };
}

// Helper functions
function getHouseTheme(houseNumber: number): string {
  const themes: { [key: number]: string } = {
    1: 'self-identity and appearance',
    2: 'material resources and values',
    3: 'communication and siblings',
    4: 'home and family',
    5: 'creativity and children',
    6: 'health and service',
    7: 'partnerships and relationships',
    8: 'transformation and shared resources',
    9: 'philosophy and higher learning',
    10: 'career and public reputation',
    11: 'friendships and aspirations',
    12: 'spirituality and hidden matters'
  };
  return themes[houseNumber] || 'life matters';
}

function getHouseThemes(houseNumber: number): string[] {
  const themes: { [key: number]: string[] } = {
    1: ['Self', 'Identity', 'Appearance', 'First Impressions'],
    2: ['Money', 'Resources', 'Values', 'Possessions'],
    3: ['Communication', 'Siblings', 'Short Trips', 'Learning'],
    4: ['Home', 'Family', 'Roots', 'Private Life'],
    5: ['Creativity', 'Children', 'Romance', 'Pleasure'],
    6: ['Health', 'Work', 'Service', 'Daily Routine'],
    7: ['Partnerships', 'Marriage', 'Open Enemies', 'Contracts'],
    8: ['Transformation', 'Shared Resources', 'Death', 'Regeneration'],
    9: ['Philosophy', 'Higher Learning', 'Travel', 'Beliefs'],
    10: ['Career', 'Public Image', 'Authority', 'Status'],
    11: ['Friends', 'Groups', 'Aspirations', 'Social Networks'],
    12: ['Spirituality', 'Hidden Matters', 'Karma', 'Subconscious']
  };
  return themes[houseNumber] || ['Life Matters'];
}

