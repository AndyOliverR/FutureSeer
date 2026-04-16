import { adaptWesternToUnified, adaptVedicToUnified } from '@/lib/charts/adapters';
import { applyGroqStyleVariant, validateGeometryIntegrity } from '@/lib/charts/groqVisualExperiments';
import { adaptKpOverlay, adaptNumerologyMatrix, adaptVastuCompass, adaptFengShuiBagua } from '@/lib/charts/phase2Adapters';
import {
  isKpChartsV2Enabled,
  isNumerologyChartsV2Enabled,
  isVastuChartsV2Enabled,
  isFengShuiChartsV2Enabled,
} from '@/lib/charts/featureFlags';

describe('unified chart adapters', () => {
  it('adapts western chart with deterministic placements', () => {
    const chart = adaptWesternToUnified({
      planets: [{ name: 'Sun', longitude: 15, house: 1 }],
      houses: [{ number: 1, longitude: 0 }],
      aspects: [{ planet1: 'Sun', planet2: 'Moon', type: 'trine' }],
    });
    expect(chart.layout).toBe('western-wheel');
    expect(chart.points[0].longitude).toBe(15);
  });

  it('adapts vedic chart and preserves longitudes', () => {
    const chart = adaptVedicToUnified({
      houses: [{ house: 1, lon: 0 }],
      planets: { sun: { lonSidereal: 230, house: 8, signName: 'Scorpio' } },
    });
    expect(chart.layout).toBe('vedic-north');
    expect(chart.points[0].longitude).toBe(230);
  });
});

describe('groq experiment geometry gate', () => {
  it('keeps geometry unchanged for style-only variant', () => {
    const authoritative = adaptWesternToUnified({
      planets: [{ name: 'Sun', longitude: 30, house: 1 }],
      houses: [{ number: 1, longitude: 0 }],
    });
    const candidate = applyGroqStyleVariant(authoritative, 'auric-night');
    expect(validateGeometryIntegrity(authoritative, candidate)).toBe(true);
  });
});

describe('phase2 visual adapters', () => {
  it('creates kp/numerology/vastu/fengshui visual contracts', () => {
    expect(adaptKpOverlay({ points: [{ id: 'su', label: 'Sun', longitude: 20 }] }).system).toBe('kp');
    expect(adaptNumerologyMatrix({ values: [1, 3, 6] }).system).toBe('numerology');
    expect(adaptVastuCompass({ zones: ['N', 'E', 'S', 'W'] }).system).toBe('vastu');
    expect(adaptFengShuiBagua({}).system).toBe('fengshui');
  });
});

describe('phase2 per-tool flags', () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('defaults all per-tool flags to false', () => {
    delete process.env.NEXT_PUBLIC_CHARTS_V2_KP;
    delete process.env.NEXT_PUBLIC_CHARTS_V2_NUMEROLOGY;
    delete process.env.NEXT_PUBLIC_CHARTS_V2_VASTU;
    delete process.env.NEXT_PUBLIC_CHARTS_V2_FENGSHUI;

    expect(isKpChartsV2Enabled()).toBe(false);
    expect(isNumerologyChartsV2Enabled()).toBe(false);
    expect(isVastuChartsV2Enabled()).toBe(false);
    expect(isFengShuiChartsV2Enabled()).toBe(false);
  });

  it('enables each flag independently', () => {
    process.env.NEXT_PUBLIC_CHARTS_V2_KP = '1';
    process.env.NEXT_PUBLIC_CHARTS_V2_NUMEROLOGY = '0';
    process.env.NEXT_PUBLIC_CHARTS_V2_VASTU = '1';
    process.env.NEXT_PUBLIC_CHARTS_V2_FENGSHUI = '0';

    expect(isKpChartsV2Enabled()).toBe(true);
    expect(isNumerologyChartsV2Enabled()).toBe(false);
    expect(isVastuChartsV2Enabled()).toBe(true);
    expect(isFengShuiChartsV2Enabled()).toBe(false);
  });
});

