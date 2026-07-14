import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SEO_LOCALES,
  type SeoLocale,
  isSupportedSeoLocale,
  localeSegment,
  localizedOgImagePath,
} from "@/lib/seo/locales";

type CopyBlock = {
  title: string;
  subtitle: string;
  body: string;
};

const LANDING_COPY: Record<SeoLocale, CopyBlock> = {
  en: {
    title: "FutureSeer - AI Mystical Guidance",
    subtitle: "Astrology, tarot, numerology and 50+ traditions in one account",
    body: "Generate your tool reports once and get persistent, tool-specific insights plus one unified Ask the Seer experience.",
  },
  es: {
    title: "FutureSeer - Guia Mistica con IA",
    subtitle: "Astrologia, tarot, numerologia y 50+ tradiciones en una sola cuenta",
    body: "Genera tus reportes una vez y obtiene perspectivas persistentes por herramienta y una experiencia unificada de Ask the Seer.",
  },
  pt: {
    title: "FutureSeer - Guia Mistico com IA",
    subtitle: "Astrologia, tarot, numerologia e 50+ tradicoes em uma conta",
    body: "Gere seus relatorios uma vez e tenha insights persistentes por ferramenta com uma experiencia unificada do Ask the Seer.",
  },
  fr: {
    title: "FutureSeer - Guidance Mystique IA",
    subtitle: "Astrologie, tarot, numerologie et 50+ traditions dans un seul compte",
    body: "Generez vos rapports une fois et obtenez des insights persistants par outil avec une experience unifiee Ask the Seer.",
  },
  de: {
    title: "FutureSeer - Mystische KI-Begleitung",
    subtitle: "Astrologie, Tarot, Numerologie und 50+ Traditionen in einem Konto",
    body: "Erstelle deine Tool-Berichte einmal und erhalte dauerhafte tool-spezifische Einsichten plus ein einheitliches Ask the Seer Erlebnis.",
  },
  hi: {
    title: "FutureSeer - AI Mystic Guidance",
    subtitle: "Jyotish, tarot, numerology aur 50+ parampara ek hi account me",
    body: "Ek baar apne tool reports banaiye aur har tool ke liye persistent insights ke saath unified Ask the Seer ka anubhav paiye.",
  },
  "zh-Hans": {
    title: "FutureSeer - AI 神秘指引",
    subtitle: "占星、塔罗、数字命理等 50+ 体系一站式体验",
    body: "一次生成各体系报告，持续获取专属解读，并使用统一的 Ask the Seer 跨体系咨询。",
  },
  "zh-Hant": {
    title: "FutureSeer - AI 神秘指引",
    subtitle: "占星、塔羅、數字命理等 50+ 體系一次整合",
    body: "一次建立各體系報告，持續取得專屬解讀，並使用整合版 Ask the Seer 進行跨體系提問。",
  },
};

function resolveLocaleFromSegment(segment: string): SeoLocale | null {
  const normalized = segment.toLowerCase();
  if (normalized === "zh") return "zh-Hans";
  if (normalized === "zh-hant") return "zh-Hant";
  if (isSupportedSeoLocale(normalized)) return normalized;
  return null;
}

export function generateStaticParams() {
  return SEO_LOCALES.map((locale) => ({ locale: localeSegment(locale) }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleFromSegment(localeParam);
  if (!locale) {
    return {};
  }
  const copy = LANDING_COPY[locale];
  const site = (process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app").replace("://www.", "://");
  const pageUrl = `${site}/${localeSegment(locale)}`;

  return {
    title: copy.title,
    description: copy.subtitle,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: copy.title,
      description: copy.subtitle,
      url: pageUrl,
      siteName: "FutureSeer",
      locale,
      type: "website",
      images: [
        {
          url: localizedOgImagePath(locale),
          width: 1200,
          height: 630,
          alt: copy.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.subtitle,
      images: [localizedOgImagePath(locale)],
    },
  };
}

export default async function LocalizedLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleFromSegment(localeParam);
  if (!locale) notFound();
  const copy = LANDING_COPY[locale];

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-amber-400">{copy.title}</h1>
        <p className="mt-4 text-xl text-amber-100">{copy.subtitle}</p>
        <p className="mt-6 text-base text-slate-200">{copy.body}</p>
        <div className="mt-10">
          <Link href="/signup" className="inline-flex rounded-full bg-amber-500 px-6 py-3 font-semibold text-slate-950">
            Generate your reports
          </Link>
        </div>
      </div>
    </main>
  );
}
