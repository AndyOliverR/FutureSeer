export const SEO_LOCALES = [
  "en",
  "es",
  "pt",
  "fr",
  "de",
  "hi",
  "zh-Hans",
  "zh-Hant",
] as const;

export type SeoLocale = (typeof SEO_LOCALES)[number];

const LOCALE_PATH_SEGMENT: Record<SeoLocale, string> = {
  en: "en",
  es: "es",
  pt: "pt",
  fr: "fr",
  de: "de",
  hi: "hi",
  "zh-Hans": "zh",
  "zh-Hant": "zh-hant",
};

export const DEFAULT_SEO_LOCALE: SeoLocale = "en";

export function isSupportedSeoLocale(value: string): value is SeoLocale {
  return (SEO_LOCALES as readonly string[]).includes(value);
}

export function localeSegment(locale: SeoLocale): string {
  return LOCALE_PATH_SEGMENT[locale];
}

export function buildLocaleAlternates(baseUrl: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of SEO_LOCALES) {
    const segment = localeSegment(locale);
    map[locale] = `${baseUrl}/${segment}`;
  }
  map["x-default"] = `${baseUrl}/en`;
  return map;
}

export function buildLocalizedKeywordSet(seedKeywords: string[]): string[] {
  const localeHints = [
    "astrologia",
    "tarot IA",
    "astrologie",
    "mystik app",
    "jyotish app",
    "占星 应用",
    "塔罗 AI",
  ];
  return [...new Set([...seedKeywords, ...localeHints])];
}

export function localizedOgImagePath(locale: SeoLocale): string {
  const segment = localeSegment(locale);
  return `/marketing/og/og-${segment}.png`;
}
