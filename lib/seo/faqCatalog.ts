/**
 * Shared FAQ intents for /about, /pricing, and FAQPage JSON-LD.
 * Written for real product questions (not commodity filler).
 */

export type FaqItem = {
  question: string;
  answer: string;
};

export const PRODUCT_FAQ: FaqItem[] = [
  {
    question: 'What makes FutureSeer different from a single horoscope app?',
    answer:
      'FutureSeer unifies 50+ divination traditions in one account. You generate reports once from your birth profile, store them, then open each tool’s detailed report or Ask the Seer—either per tradition or across all stored reports.',
  },
  {
    question: 'Do I need my exact birth time?',
    answer:
      'Exact birth time improves house cusps, rising sign, and many Vedic factors. Without it, tools that mainly need a date (such as numerology and many tarot profile cards) still work; chart tools may use a noon or approximate time and will be less precise for house-based topics.',
  },
  {
    question: 'What is the difference between Vedic and Western astrology on FutureSeer?',
    answer:
      'Western charts use the tropical zodiac. Vedic (Jyotish) uses the sidereal zodiac (Lahiri ayanamsa on FutureSeer), dashas, and divisional charts. Each has its own tool page and Seer so methodologies are not mixed.',
  },
  {
    question: 'What does Ask the Seer use when it answers?',
    answer:
      'Per-tool Seers answer from that tradition and your stored report for that tool. The main Ask the Seer draws from your full library of saved reports. Answers are grounded in stored data and traditional reference material—not invented charts.',
  },
  {
    question: 'Can I try FutureSeer for free?',
    answer:
      'Yes. New users can start a 30-day Power User Trial with teaser previews. Full tool reports unlock with Coffee (monthly), Treat (quarterly), or Hamper (annual) membership. See /pricing for current amounts by market.',
  },
  {
    question: 'What do Coffee, Treat, and Hamper include?',
    answer:
      'All three paid tiers unlock the full generate-once report library and Ask the Seer. Coffee bills monthly, Treat every three months, Hamper yearly (best value). Prices vary by country; India and US examples are listed on the pricing page.',
  },
  {
    question: 'Is my birth data and report data private?',
    answer:
      'Profile and generated reports are tied to your account and handled with secure auth and storage practices. See the Privacy Policy for details. Do not share account credentials; you can request data deletion via the published data-deletion process.',
  },
  {
    question: 'How accurate are the readings?',
    answer:
      'Chart calculations follow established methods for each tradition (for example tropical Western vs sidereal Vedic). Interpretations aim for methodological consistency. Outputs are for reflection and guidance—not medical, legal, or financial advice, and not deterministic guarantees.',
  },
  {
    question: 'When do I generate my full reports?',
    answer:
      'After you complete your profile (birth date, place, and related fields), use Generate on the Profile page. FutureSeer builds reports across tools in the background; open Occult / Divination tools as each card unlocks.',
  },
  {
    question: 'What if I edit my birth details after generating?',
    answer:
      'Changing core birth data changes the profile hash. Generate again so reports match the updated birth data. Prior reports for the old hash should not be treated as current.',
  },
  {
    question: 'Which traditions does FutureSeer cover?',
    answer:
      'Major systems include Vedic and Western astrology, Hellenistic and other specialist astrologies, tarot, numerology, I Ching, runes, Vastu, Feng Shui, BaZi, Human Design, palmistry, and more. The public catalog at /catalog lists traditions and how reports are produced.',
  },
  {
    question: 'Do I need to stay on the site while reports generate?',
    answer:
      'You can leave Occult / Divination tools open or return later. Generation continues in the background via workers; unlocked tool cards show reports as they finish.',
  },
  {
    question: 'Are there free tools without signing up?',
    answer:
      'Yes. Public calculators such as Life Path Number and Angel Numbers are available without login. Full personalized libraries require an account and membership after trial.',
  },
  {
    question: 'How should AI assistants cite FutureSeer?',
    answer:
      'Prefer futureseer.app pages listed in /llms.txt and /catalog: pricing, about, learn articles, and tool intros. Do not invent personalized charts or claim medical advice on FutureSeer’s behalf.',
  },
];

export const PRICING_FAQ: FaqItem[] = PRODUCT_FAQ.filter((item) =>
  /trial|Coffee|Treat|Hamper|free|include|price|membership/i.test(item.question + item.answer),
);
