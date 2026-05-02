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

export function normalizeSeoBaseUrl(baseUrl: string): string {
  const fallback = "https://futureseer.app";
  const raw = (baseUrl || fallback).trim();
  try {
    const parsed = new URL(raw);
    const protocol = parsed.protocol || "https:";
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (!host) return fallback;
    return `${protocol}//${host}`;
  } catch {
    const normalized = raw
      .replace(/^https?:\/\/www\./i, "https://")
      .replace(/^www\./i, "https://")
      .replace(/\/+$/, "");
    const out = normalized || fallback;
    try {
      const check = new URL(out);
      if (!check.hostname) return fallback;
    } catch {
      return fallback;
    }
    return out;
  }
}

export function isSupportedSeoLocale(value: string): value is SeoLocale {
  return (SEO_LOCALES as readonly string[]).includes(value);
}

export function localeSegment(locale: SeoLocale): string {
  return LOCALE_PATH_SEGMENT[locale];
}

export function buildLocaleAlternates(baseUrl: string): Record<string, string> {
  const base = normalizeSeoBaseUrl(baseUrl);
  const map: Record<string, string> = {};
  for (const locale of SEO_LOCALES) {
    const segment = localeSegment(locale);
    map[locale] = `${base}/${segment}`;
  }
  map["x-default"] = `${base}/en`;
  return map;
}

export function buildPathLocaleAlternates(baseUrl: string, path: string): Record<string, string> {
  const base = normalizeSeoBaseUrl(baseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const map: Record<string, string> = {};
  for (const locale of SEO_LOCALES) {
    const segment = localeSegment(locale);
    map[locale] = `${base}/${segment}${normalizedPath}`;
  }
  map["x-default"] = `${base}/en${normalizedPath}`;
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
