import { buildSoftwareApplicationOffers } from '@/lib/seo/publicPricingCatalog';

export function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FutureSeer",
    "alternateName": "FutureSeer",
    "url": "https://futureseer.app",
    "logo": "https://futureseer.app/icons/icon-512.png",
    "description": "AI-powered mystical insights platform combining traditional astrological wisdom with advanced AI algorithms",
    "foundingDate": "2025",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "url": "https://futureseer.app/contact"
    },
    "areaServed": "Worldwide",
    "sameAs": ["https://futureseer.app"],
    "copyrightNotice": "FutureSeer (futureseer.app)",
    "knowsAbout": [
      "Astrology",
      "Numerology",
      "Tarot Reading",
      "Vedic Astrology",
      "Western Astrology",
      "Divination",
      "AI-Powered Insights"
    ]
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FutureSeer",
    url: "https://futureseer.app",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: buildSoftwareApplicationOffers(),
    description:
      "AI-assisted divination and astrology platform: Vedic and Western astrology, numerology, tarot, I Ching, Vastu, Feng Shui, and unified Ask the Seer chat.",
    publisher: {
      "@type": "Organization",
      name: "FutureSeer",
      url: "https://futureseer.app",
    },
    copyrightNotice: "FutureSeer (futureseer.app)",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />
    </>
  );
}

export function buildItemListSchema(params: {
  url: string;
  name: string;
  description: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.name,
    description: params.description,
    url: params.url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: params.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function buildLearnArticleSchema(params: {
  url: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    url: params.url,
    author: {
      "@type": "Organization",
      name: "FutureSeer",
      url: "https://futureseer.app",
    },
    publisher: {
      "@type": "Organization",
      name: "FutureSeer",
      url: "https://futureseer.app",
    },
  };
}

export function buildFaqPageSchema(params: {
  url: string;
  faqs: Array<{ question: string; answer: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: params.url,
    mainEntity: params.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
