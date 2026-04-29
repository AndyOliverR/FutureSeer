import { normalizeSeoBaseUrl } from "@/lib/seo/locales";

const siteBase = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app");

export default function Head() {
  return (
    <>
      <title>FutureSeer Tools - 50+ Divination Systems</title>
      <meta
        name="description"
        content="Use 50+ divination systems in one account including Vedic and Western astrology, tarot, numerology, runes, I Ching, and more."
      />
      <meta
        name="keywords"
        content="divination tools, vedic astrology app, western astrology app, tarot reading app, numerology tools, herramientas misticas, outils divinatoires, 占卜 工具"
      />
      <link rel="canonical" href={`${siteBase}/tools`} />
    </>
  );
}
