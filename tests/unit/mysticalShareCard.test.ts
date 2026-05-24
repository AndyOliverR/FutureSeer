import { buildMysticalSharePayload } from '@/lib/growth/mysticalShareCard';
import { resolveArchetypeAccent, blendHaloWithAccent } from '@/lib/growth/mysticalShareCardArchetypeAccent';
import { resolveMysticalShareCardTheme } from '@/lib/growth/mysticalShareCardTheme';

describe('buildMysticalSharePayload', () => {
  it('returns null when profile has no ready reports', () => {
    expect(buildMysticalSharePayload({})).toBeNull();
  });

  it('builds payload from western report teaser fields', () => {
    const profile = {
      displayName: 'Alex Morgan',
      western: {
        chartOverview: 'A steady presence with sharp intuition beneath the surface.',
        personality: { summary: 'You lead with calm clarity.' },
      },
    };
    const payload = buildMysticalSharePayload(profile, {
      referralCode: 'ABC123',
      userId: 'uid-1',
    });
    expect(payload).not.toBeNull();
    expect(payload?.displayName).toBe('Alex');
    expect(payload?.archetypeTitle).toBeTruthy();
    expect(payload?.hookLine.length).toBeGreaterThan(10);
    expect(payload?.highlightToolSlug).toBe('western');
    expect(payload?.shareUrl).toContain('futureseer.app');
    expect(payload?.shareUrl).toContain('ref=ABC123');
  });
});

describe('resolveArchetypeAccent', () => {
  it('maps Tension Alchemist to tension overlay with red stroke', () => {
    const accent = resolveArchetypeAccent('Tension Alchemist');
    expect(accent.kind).toBe('tension');
    expect(accent.stroke).toContain('239, 68, 68');
  });

  it('maps Cosmic Anchor to anchor overlay', () => {
    expect(resolveArchetypeAccent('Cosmic Anchor').kind).toBe('anchor');
  });

  it('maps Steady Builder to anchor via keyword fallback', () => {
    expect(resolveArchetypeAccent('Steady Builder').kind).toBe('anchor');
  });

  it('maps Harmonic Triad to harmony overlay', () => {
    expect(resolveArchetypeAccent('Harmonic Triad').kind).toBe('harmony');
  });

  it('is deterministic for unknown titles', () => {
    const a = resolveArchetypeAccent('Mystery Archetype X');
    const b = resolveArchetypeAccent('Mystery Archetype X');
    expect(a.kind).toBe(b.kind);
  });
});

describe('blendHaloWithAccent', () => {
  it('appends archetype tint to tool halo', () => {
    const blended = blendHaloWithAccent('radial-gradient(circle, gold)', resolveArchetypeAccent('Tension Alchemist'));
    expect(blended).toContain('radial-gradient(circle, gold)');
    expect(blended).toContain('239, 68, 68');
  });
});

describe('resolveMysticalShareCardTheme', () => {
  it('maps western to zodiac wheel art and crimson-gold palette', () => {
    const theme = resolveMysticalShareCardTheme('western');
    expect(theme.ornament).toBe('zodiac-wheel');
    expect(theme.topMark).toBe('☉');
    expect(theme.palette.baseGradient).toContain('220, 38, 38');
  });

  it('maps tarot to celestial art', () => {
    expect(resolveMysticalShareCardTheme('tarot').ornament).toBe('tarot-celestial');
  });

  it('falls back to cosmic default for unknown slugs', () => {
    expect(resolveMysticalShareCardTheme('unknownTool').ornament).toBe('cosmic-default');
  });
});
