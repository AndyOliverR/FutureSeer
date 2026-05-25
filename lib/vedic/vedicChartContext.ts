/** Build compact chart context strings for focused Vedic report prompts. */

export type ChartDataInput = {
  ascendant?: { signName?: string; sign?: string };
  planets?: Array<{
    name?: string;
    sign?: string | number;
    signName?: string;
    house?: number;
    nakshatra?: string;
    retrograde?: boolean;
  }>;
  houses?: Array<{ sign?: string; signName?: string; lord?: string; number?: number }>;
  currentDasha?: {
    planet?: string;
    antardasha?: string;
    startDate?: string;
    endDate?: string;
  };
  dasha?: Array<{ planet?: string; startDate?: string; endDate?: string }>;
  yogas?: Array<{ name?: string; description?: string } | string>;
  doshas?: string[];
  nakshatra?: { name?: string; lord?: string };
};

export function formatChartContextBlock(chart: ChartDataInput, extras?: string): string {
  const ascendant = chart.ascendant?.signName || chart.ascendant?.sign || 'Unknown';
  const planets = chart.planets || [];
  const houses = chart.houses || [];
  const currentDasha =
    chart.currentDasha?.planet || chart.dasha?.[0]?.planet || 'Unknown';
  const antardasha = chart.currentDasha?.antardasha || '';
  const dashaDates =
    chart.currentDasha?.startDate && chart.currentDasha?.endDate
      ? `${chart.currentDasha.startDate} to ${chart.currentDasha.endDate}`
      : '';

  const planetLines = planets
    .map(
      (p) =>
        `${p.name}: ${p.signName || p.sign} in house ${p.house ?? '?'}${p.retrograde ? ' (R)' : ''}${p.nakshatra ? `, nakshatra ${p.nakshatra}` : ''}`,
    )
    .join('\n');

  const houseLines = houses
    .map((h, i) => {
      const num = h.number ?? i + 1;
      return `House ${num}: ${h.signName || h.sign || '?'}, lord ${h.lord || '?'}`;
    })
    .join('\n');

  const yogaLines = (chart.yogas || [])
    .map((y) => (typeof y === 'string' ? y : `${y.name || 'Yoga'}: ${y.description || ''}`))
    .filter(Boolean)
    .join('\n');

  const doshaLines = (chart.doshas || []).join(', ') || 'None listed';

  const nakshatra =
    chart.nakshatra?.name ||
    planets.find((p) => String(p.name).toLowerCase() === 'moon')?.nakshatra ||
    'Unknown';

  return `CHART DATA (Lahiri sidereal — use only this data):
- Ascendant (Lagna): ${ascendant}
- Birth Nakshatra (Moon): ${nakshatra}
- Current Mahadasha: ${currentDasha}${antardasha ? `, Antardasha: ${antardasha}` : ''}${dashaDates ? ` (${dashaDates})` : ''}
- Doshas: ${doshaLines}

Planets:
${planetLines || 'Not provided'}

Houses:
${houseLines || 'Not provided'}

Yogas:
${yogaLines || 'Analyze from planetary combinations if not listed'}
${extras ? `\n${extras}` : ''}`;
}
