export type HeroCtaVariant = 'early_access' | 'help_shape';

const STORAGE_KEY = 'fs_hero_cta_v1';

export function getHeroCtaVariant(): HeroCtaVariant {
  if (typeof window === 'undefined') return 'early_access';
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'early_access' || stored === 'help_shape') return stored;
    const variant: HeroCtaVariant = Math.random() < 0.5 ? 'early_access' : 'help_shape';
    sessionStorage.setItem(STORAGE_KEY, variant);
    return variant;
  } catch {
    return 'early_access';
  }
}

export function heroCtaLabel(variant: HeroCtaVariant): string {
  return variant === 'help_shape' ? 'Help Shape FutureSeer' : 'Get Early Access';
}
