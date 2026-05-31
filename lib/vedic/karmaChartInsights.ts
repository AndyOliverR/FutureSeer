type PlanetRow = {
  name?: string;
  signName?: string;
  sign?: string | number;
  house?: number;
  nakshatra?: string;
};

type ChartLike = {
  ascendant?: { signName?: string; sign?: string };
  planets?: PlanetRow[] | Record<string, PlanetRow>;
  currentDasha?: { planet?: string; name?: string; antardasha?: string };
  dasha?: Array<{ planet?: string; startDate?: string; endDate?: string }>;
};

const KARMA_KARAKAS = ['Saturn', 'Rahu', 'Ketu'] as const;

const DASHA_KARMA_HINT: Record<string, string> = {
  Saturn: 'Structure, accountability, and patience are the lesson — delays often mean refinement, not rejection.',
  Rahu: 'Unfamiliar paths and strong desires surface — growth comes from conscious choices, not obsession.',
  Ketu: 'Release and simplification — what falls away makes room for deeper clarity.',
  Mars: 'Courage and decisive action are tested — channel intensity into purposeful effort.',
  Sun: 'Identity and authority themes — ego and purpose align when you lead with integrity.',
  Moon: 'Emotional patterns repeat until understood — nurture and boundaries both matter.',
  Mercury: 'Mind, communication, and skill-building — overthinking eases when you act on one clear step.',
  Jupiter: 'Expansion and meaning — wisdom grows when optimism meets discipline.',
  Venus: 'Relationship, value, and comfort — learn what truly nourishes versus what merely distracts.',
};

function normalizePlanets(planets: ChartLike['planets']): PlanetRow[] {
  if (!planets) return [];
  if (Array.isArray(planets)) return planets;
  return Object.entries(planets).map(([key, value]) => ({
    ...value,
    name: value.name ?? key,
  }));
}

function findPlanet(planets: PlanetRow[], names: string[]): PlanetRow | undefined {
  const lowered = names.map((n) => n.toLowerCase());
  return planets.find((p) => lowered.includes(String(p.name ?? '').toLowerCase()));
}

function formatPlacement(planet: PlanetRow): string {
  const sign = planet.signName || (typeof planet.sign === 'string' ? planet.sign : '');
  const house = typeof planet.house === 'number' ? `house ${planet.house}` : '';
  return [sign, house].filter(Boolean).join(', ');
}

export interface VedicKarmaInsightBundle {
  /** Short philosophy block — always shown */
  philosophy: string;
  /** Chart-specific bullets; empty when no chart */
  chartSignals: string[];
  /** Current dasha karma theme */
  dashaTheme: string | null;
  /** Reflective prompts (awareness-oriented) */
  reflectionPrompts: string[];
}

export function buildVedicKarmaInsights(chart: ChartLike | null | undefined): VedicKarmaInsightBundle {
  const philosophy =
    'In Jyotish, your chart maps tendencies and timing — not a fixed fate. Difficult periods often mark preparation, redirection, or inner refinement. Dashas show when themes activate; your choices shape how they unfold.';

  const reflectionPrompts = [
    'What pattern keeps repeating in this dasha — and what might it be asking you to learn?',
    'Where am I forcing outcomes instead of aligning with the current planetary chapter?',
    'What would “aligned effort” look like this month — push, prepare, or pause?',
  ];

  if (!chart) {
    return {
      philosophy,
      chartSignals: [],
      dashaTheme: null,
      reflectionPrompts,
    };
  }

  const planets = normalizePlanets(chart.planets);
  const signals: string[] = [];

  const moon = findPlanet(planets, ['Moon', 'Chandra']);
  const lagnaSign = chart.ascendant?.signName || chart.ascendant?.sign;
  if (moon) {
    const moonLine = formatPlacement(moon);
    signals.push(
      `Moon${moonLine ? ` in ${moonLine}` : ''}${moon.nakshatra ? ` (${moon.nakshatra} nakshatra)` : ''} — emotional habit and dasha sequence seed; inner responses often run deeper than Sun-sign labels.`,
    );
  }
  if (lagnaSign) {
    signals.push(`Lagna in ${lagnaSign} — life approach and house-lord logic; full-chart reading starts here, not from Sun sign alone.`);
  }

  for (const karaka of KARMA_KARAKAS) {
    const p = findPlanet(planets, [karaka]);
    if (!p) continue;
    const place = formatPlacement(p);
    if (karaka === 'Saturn') {
      signals.push(`Saturn${place ? ` in ${place}` : ''} — sustained lessons, discipline, and long-term maturation.`);
    } else if (karaka === 'Rahu') {
      signals.push(`Rahu${place ? ` in ${place}` : ''} — unconventional growth and desire; watch alignment vs compulsion.`);
    } else if (karaka === 'Ketu') {
      signals.push(`Ketu${place ? ` in ${place}` : ''} — release, detachment, and spiritual depth through letting go.`);
    }
  }

  const dusthanaOccupants = planets.filter(
    (p) => typeof p.house === 'number' && [6, 8, 12].includes(p.house),
  );
  if (dusthanaOccupants.length > 0) {
    const list = dusthanaOccupants
      .slice(0, 4)
      .map((p) => `${p.name} (house ${p.house})`)
      .join(', ');
    signals.push(`Planets in 6th, 8th, or 12th houses (${list}) — transformative life themes; friction can signal growth, not punishment.`);
  }

  const dashaPlanet =
    chart.currentDasha?.planet ||
    chart.currentDasha?.name ||
    chart.dasha?.find((d) => {
      if (!d.startDate || !d.endDate) return false;
      const now = Date.now();
      return now >= Date.parse(d.startDate) && now <= Date.parse(d.endDate);
    })?.planet;

  const dashaTheme = dashaPlanet
    ? DASHA_KARMA_HINT[dashaPlanet] ??
      `${dashaPlanet} mahadasha — this planetary chapter colors priorities and lessons now.`
    : null;

  if (dashaPlanet) {
    signals.push(`Current ${dashaPlanet} dasha — timing activates chart themes; effort lands differently in each planetary period.`);
  }

  return {
    philosophy,
    chartSignals: signals.slice(0, 6),
    dashaTheme,
    reflectionPrompts,
  };
}
