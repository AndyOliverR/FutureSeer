'use client';

import { useSyncExternalStore } from 'react';
import { getHeroCtaVariant, type HeroCtaVariant } from '@/lib/heroCtaVariant';

/** Client-only hero CTA A/B variant with a stable SSR snapshot. */
export function useHeroCtaVariant(): HeroCtaVariant {
  return useSyncExternalStore(
    () => () => {},
    () => getHeroCtaVariant(),
    () => 'early_access',
  );
}
