"use client";

export function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FutureSeer",
    "alternateName": "FutureSeer",
    "url": "https://futureseer.app",
    "logo": "https://futureseer.app/placeholder-logo.png",
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
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "AI-assisted divination and astrology platform: Vedic and Western astrology, numerology, tarot, I Ching, Vastu, Feng Shui, and unified Ask the Seer chat.",
    publisher: {
      "@type": "Organization",
      name: "FutureSeer",
      url: "https://futureseer.app",
    },
    copyrightNotice: "FutureSeer (futureseer.app)",
  };

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What makes FutureSeer different from other astrology apps?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FutureSeer combines traditional astrological wisdom with advanced AI algorithms. We use proprietary astronomical calculations alongside machine learning to provide personalized, accurate insights across multiple divination systems."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to know my exact birth time?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For Vedic astrology and detailed chart readings, knowing your birth time improves accuracy significantly. However, many of our tools (like Tarot, Numerology, and I Ching) don't require birth time at all. If you don't know your exact time, we can still provide valuable insights."
        }
      },
      {
        "@type": "Question",
        "name": "Is my personal information secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Your privacy is sacred to us. We employ bank-level encryption to protect your birth data and readings. Your information is yours alone—we never sell, share, or monetize your personal data. Period."
        }
      },
      {
        "@type": "Question",
        "name": "Can I try FutureSeer before subscribing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We offer a free tier that includes basic readings and limited access to our tools. You can explore Vedic astrology, generate your birth chart, and try the Seer AI chat to see if FutureSeer resonates with you."
        }
      },
      {
        "@type": "Question",
        "name": "What divination systems do you support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer Vedic (Jyotish) astrology, Western astrology, Tarot, Numerology, I Ching, Angel Numbers, Palmistry, and more. Each system is integrated with AI interpretation engines that provide comprehensive, personalized guidance."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate are the predictions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We use precise astronomical calculations and time-tested traditional methods. However, astrology and divination are tools for self-reflection and guidance, not deterministic prediction. Our AI helps you interpret patterns and possibilities, empowering you to make informed decisions."
        }
      }
    ]
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema),
        }}
      />
    </>
  );
}
