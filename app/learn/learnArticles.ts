/**
 * Original educational copy for SEO / learn hub. Not copied from third-party sites.
 */

export type LearnArticle = {
  slug: string
  title: string
  description: string
  /** Short HTML-safe paragraphs; rendered as JSX in page */
  sections: { heading?: string; body: string[] }[]
}

export const LEARN_ARTICLES: Record<string, LearnArticle> = {
  "vastu-compass-and-zones": {
    slug: "vastu-compass-and-zones",
    title: "How to use a Vastu compass: 4 cardinals through 45 fields, 16 zones, and 32 padas",
    description:
      "Understand cardinal directions versus Vastu’s 16 zones, 32 entrance padas, and optional 45-field grid—and how FutureSeer maps your phone’s compass to each with a visual dial.",
    sections: [
      {
        body: [
          "Vastu Shastra often divides the compass into finer slices than “north, south, east, west.” Traditional practice uses **16 directional zones** (each 22.5°) for overall placement and **32 padas** (each 11.25°) for details such as the main entrance.",
          "Your device’s magnetometer gives a heading in degrees. FutureSeer’s Vastu tool converts that heading into the precision you need: **four cardinals**, **eight winds**, **sixteen zones**, **thirty-two padas**, or a **45-field** (8°) reference grid—with a **rotating compass dial** so you can align plot facing, main door, and optional Shakti-style fields in one session.",
        ],
      },
      {
        heading: "Try it in the app",
        body: [
          "Open the **Vastu** tool, go to **Room Placement**, and use the compass controls with **4**, **8**, **16**, **32**, or **45** precision. Use **Open full-screen compass** for a dedicated view. Apply the reading to **facing direction** (16 zones), **main door pada** (32), or **45-field** label as shown.",
        ],
      },
    ],
  },
  "vastu-main-entrance-basics": {
    slug: "vastu-main-entrance-basics",
    title: "Main entrance in Vastu: what practitioners look for",
    description:
      "A plain-language overview of why the main door matters in Vastu and how personalized charts support entrance guidance.",
    sections: [
      {
        body: [
          "The main entrance is treated as a primary channel for energy flow into the home. Texts vary by region and lineage; many systems score the **direction** and **segment** of the door along the compass.",
          "FutureSeer combines **traditional directional rules** with **your birth chart–based** auspicious directions where available, so you can compare general guidance with personalized suggestions.",
        ],
      },
      {
        heading: "Next step",
        body: [
          "Use the **Main Entrance** tab in the Vastu tool for pada-level notes and the **Ask the Seer** tab for questions in your own words.",
        ],
      },
    ],
  },
  "lucky-number-numerology-astrology": {
    slug: "lucky-number-numerology-astrology",
    title: "Lucky numbers: numerology, name numbers, and chart context",
    description:
      "How people combine numerology and astrology to explore “lucky” numbers—and where FutureSeer fits in.",
    sections: [
      {
        body: [
          "Many searchers ask what their **lucky number** is “according to astrology or numerology.” Numerology often derives numbers from a birth date or name; astrology may highlight certain numbers through houses, nakshatras, or timing—not a single universal digit for everyone.",
          "FutureSeer offers **dedicated numerology** and **Vedic/Western** tools so you can see numbers from different systems side by side instead of one oversimplified answer.",
        ],
      },
      {
        heading: "Tools to use",
        body: [
          "Try **Numerology**, **Name Analysis**, and **Vedic** or **Western** astrology for complementary perspectives.",
        ],
      },
    ],
  },
  "lucky-colour-and-favourable-shades": {
    slug: "lucky-colour-and-favourable-shades",
    title: "Lucky colours and favourable shades across traditions",
    description:
      "Why colour suggestions differ by system and how to explore them responsibly in the app.",
    sections: [
      {
        body: [
          "Questions like “what colour should I wear today for income?” appear in search every day. **Vedic** approaches may link colours to planets or weekdays; **Western** astrology may use sign or aspect symbolism; **numerology** may map colours to numbers.",
          "There is no single answer that satisfies every tradition. FutureSeer is built as a **multi-tool** workspace so you can compare insights and keep notes that match your practice.",
        ],
      },
      {
        heading: "Where to look",
        body: [
          "Explore **Vedic**, **Western**, **Numerology**, and **Daily** insights after you save your birth profile.",
        ],
      },
    ],
  },
  "vastu-shastra-vs-feng-shui": {
    slug: "vastu-shastra-vs-feng-shui",
    title: "Vastu Shastra vs Feng Shui: different roots, same goal",
    description:
      "A short comparison of Indian Vastu and Chinese Feng Shui for space harmony—without claiming one replaces the other.",
    sections: [
      {
        body: [
          "**Vastu Shastra** is rooted in Indian architectural texts and directional grids (often 16 zones, 32 padas). **Feng Shui** uses concepts like bagua, five elements, and compass or form school methods.",
          "Both aim to support harmony between people and space; they are **not interchangeable**. FutureSeer includes **separate Vastu and Feng Shui** experiences so you can follow the method you prefer—or learn both.",
        ],
      },
      {
        heading: "Tools",
        body: ["Open **Vastu** and **Feng Shui** under Mystical Tools."],
      },
    ],
  },
  "multi-divination-one-app": {
    slug: "multi-divination-one-app",
    title: "Multi-divination: one app for astrology, tarot, numerology, and more",
    description:
      "Why a unified platform helps when you search across astrology, numerology, divination, and Vastu.",
    sections: [
      {
        body: [
          "Real searches rarely stay in one lane. People mix **astrology**, **numerology**, **tarot**, **Vastu**, and **occult** topics in the same session. FutureSeer is designed as a **single profile** with **many tools** and a **unified Ask the Seer** so context travels with you.",
          "If you came from a search like “AI astrology numerology horoscope” or “multi divination app,” the tools and **community** are organized around that workflow.",
        ],
      },
      {
        heading: "Try",
        body: [
          "Browse **Tools**, open **Ask the Seer**, and join **Community** for discussion.",
        ],
      },
    ],
  },
  "daily-guidance-astrology-numerology": {
    slug: "daily-guidance-astrology-numerology",
    title: "Daily guidance: astrology, numerology, and mindful habits",
    description:
      "How daily pages and tools can support reflection without replacing professional advice.",
    sections: [
      {
        body: [
          "Many users look for **daily** colour, number, or mood prompts tied to the stars or numbers. FutureSeer’s **Daily** area and tool-specific readings are meant for **reflection and exploration**, not medical, legal, or financial decisions.",
          "Use your **saved profile** so timing and numerology features stay consistent.",
        ],
      },
      {
        heading: "Links",
        body: ["Visit **Daily** and the **Tarot**, **I Ching**, or **Angel Numbers** tools for quick rituals."],
      },
    ],
  },
  "community-and-occult-discussion": {
    slug: "community-and-occult-discussion",
    title: "Community: discuss divination, occult tools, and experiences",
    description:
      "How FutureSeer’s community complements private readings and tools.",
    sections: [
      {
        body: [
          "Learning from others is part of how traditions stay alive. The **Community** space is for **discussion, questions, and respectful exchange** about divination systems and experiences.",
          "Pair community threads with **tool reports** and **Ask the Seer** for a full loop: learn, practice, share.",
        ],
      },
      {
        heading: "Join",
        body: ["Open **Community** from the main navigation after sign-in."],
      },
    ],
  },
  "purusha-mandala-overview": {
    slug: "purusha-mandala-overview",
    title: "Vastu Purusha mandala in brief",
    description:
      "A high-level introduction to the cosmic grid used in many Vastu analyses.",
    sections: [
      {
        body: [
          "The **Vastu Purusha mandala** is a symbolic grid of energy fields laid over a site. Texts describe **45** or other subdivisions depending on region and school. It is a conceptual map, not a substitute for structural engineering or local building codes.",
          "FutureSeer’s **Vastu** tool focuses on **directional placement**, **entrance padas**, and **personalized** hints where your chart is available.",
        ],
      },
      {
        heading: "Explore",
        body: ["Use **Room Placement** and **Construction** tabs for practical checklists."],
      },
    ],
  },
  "astrology-search-intent-household-name": {
    slug: "astrology-search-intent-household-name",
    title: "Searching for astrology, numerology, Vastu, and more in one place",
    description:
      "How FutureSeer aligns with common search intents like lucky numbers, colours, and multi-tool divination.",
    sections: [
      {
        body: [
          "People often search with long phrases: “what is my lucky number according to astrology,” “what to wear today,” “Vastu main door,” or “horoscope numerology together.” A product that respects **multiple traditions** needs **clear tools** and **honest copy**—not a single buzzword.",
          "FutureSeer’s roadmap includes **more guides** (like this one) and **technical SEO** so people who need a **multi-divination** home can find **futureseer.app**.",
        ],
      },
      {
        heading: "Get started",
        body: [
          "Create an account, complete your profile, **generate your mystical profile**, then explore any tool and **Ask the Seer**.",
        ],
      },
    ],
  },
  "divination-research-and-practitioner-perspectives": {
    slug: "divination-research-and-practitioner-perspectives",
    title: "Divination: research perspectives and what practitioners often report",
    description:
      "An educational overview of how academics and practitioners talk about divination—utility, narrative, and ethics—without replacing professional medical or legal advice.",
    sections: [
      {
        heading: "Disclaimer",
        body: [
          "This guide summarizes **descriptive** themes from psychology, anthropology, and religious studies. It is **not** medical, psychiatric, or legal advice. If you are in crisis, contact qualified local emergency or mental health services.",
        ],
      },
      {
        heading: "Two different meanings of “success”",
        body: [
          "In controlled research, **factual prediction** (whether a reading foretells specific future events) is difficult to validate at above-chance levels across many designs. By contrast, **personal utility**—whether a session helped someone feel clearer, calmer, or more able to act—is often what surveys and qualitative studies measure.",
          "That distinction matters for honest marketing: FutureSeer offers **structured tools** and **reflection**, not guarantees about the future.",
        ],
      },
      {
        heading: "Themes from practitioner accounts (anecdotal patterns)",
        body: [
          "**Intention and focus:** Many traditions emphasize clear intent, preparation, and treating the session as a deliberate act rather than a casual scroll.",
          "**Symbolism and archetypes:** Systems like **Tarot** or **I Ching** use rich symbols; people often describe readings as helping them **reframe** a problem or name a feeling, similar to how narrative or projective techniques work in therapy-adjacent contexts (not as a substitute for licensed care).",
          "**Structure and grounding:** Traditional spreads, rules, and timing can reduce impulsive interpretation and give the mind a **shared frame**—something academic writers sometimes compare to “boundary objects” that bridge intuition and language.",
        ],
      },
      {
        heading: "When things go wrong (common pitfalls)",
        body: [
          "**Strong emotional distress:** Seeking certainty while panicked can amplify regret; ethical readers avoid exploiting fear.",
          "**Replacing action:** Divination can clarify options; it is a poor substitute for medical care, legal steps, or financial planning when those are what the situation requires.",
          "**Overuse:** Heavy reliance on repeated readings for reassurance may track with anxiety in some populations—see also our Learn article on **ethics, grounding, and boundaries**.",
        ],
      },
      {
        heading: "More on FutureSeer",
        body: [
          "Read **Tarot, psychology, and research**, **Vastu Shastra: traditional practice and modern research**, and **Ethics, grounding, and boundaries** in Learn. Open **Community** for discussion—guests can browse public threads; sign in for full participation.",
        ],
      },
    ],
  },
  "tarot-psychology-research-perspectives": {
    slug: "tarot-psychology-research-perspectives",
    title: "Tarot and psychology: projective tools, narrative, and research angles",
    description:
      "How Tarot is sometimes studied—as a symbolic practice and narrative device—and how that differs from claims of literal prediction.",
    sections: [
      {
        heading: "Disclaimer",
        body: [
          "Educational summary only. FutureSeer does not reproduce third-party papers in full; consult the original sources for methodology and limits.",
        ],
      },
      {
        heading: "Academic angles you may encounter",
        body: [
          "**Projective and narrative frameworks:** Some researchers treat Tarot similarly to other **structured imagery** tasks: the cards invite stories that organize ambiguity. That can feel “accurate” because it helps people articulate what they already sense—without proving a supernatural mechanism.",
          "**Empirical psychology studies:** Universities sometimes host student or faculty research on divination practices. For example, Fordham’s **Digital Research Repository** (research.library.fordham.edu) hosts searchable theses; you can look for titles that mention divination or Tarot to read methodology and conclusions directly.",
          "**Literature reviews:** Platforms like ResearchGate or journal indexes list **Tarot** reviews that discuss Tarot as a psychological or cultural object—always check the journal’s peer-review status and the date.",
        ],
      },
      {
        heading: "What this means for you in the app",
        body: [
          "FutureSeer’s **Tarot** tool uses **traditional card meanings** and AI assistance to support reflection. **Ask the Seer** with your profile adds personalization—behind sign-in. Neither replaces professional care when you need it.",
        ],
      },
      {
        heading: "Related guides",
        body: [
          "See **Divination: research perspectives and what practitioners often report** and **Ethics, grounding, and boundaries in divination and occult practice** in Learn.",
        ],
      },
    ],
  },
  "occult-ethics-grounding-and-boundaries": {
    slug: "occult-ethics-grounding-and-boundaries",
    title: "Ethics, grounding, and boundaries in divination and occult practice",
    description:
      "Respectful practice, consent, mental hygiene, and when to seek professional help—aligned with FutureSeer’s community and product values.",
    sections: [
      {
        heading: "Disclaimer",
        body: [
          "This is **not** therapy or legal guidance. If you or someone else is unsafe, use local emergency resources.",
        ],
      },
      {
        heading: "Consent and boundaries",
        body: [
          "Many traditions stress **not** reading for someone who has not asked, **not** using insights to manipulate or coerce, and being clear about limits when you share interpretations online or in **Community**.",
        ],
      },
      {
        heading: "Grounding and mental hygiene",
        body: [
          "Before and after intense sessions, simple practices—sleep, food, movement, journaling, or a short walk—can help separate **story** from **urgent emotion**. That supports clearer use of **Tarot**, **I Ching**, **numerology**, or astrology tools without spiraling.",
        ],
      },
      {
        heading: "When harm or fraud appears",
        body: [
          "Reports of abuse, coercion, or financial exploitation in spiritual contexts often point to **support networks** and **licensed professionals** (counselors, psychologists) as the primary remedy—not more divination. FutureSeer’s **Community** is moderated; use reporting and guidelines if you see abuse.",
        ],
      },
      {
        heading: "Try in FutureSeer",
        body: [
          "Explore **Numerology**, **Western** or **Vedic** astrology, **Tarot**, and **Community** with these boundaries in mind. **Ask the Seer** is for signed-in users with a profile; this page stays public for discovery.",
        ],
      },
    ],
  },
  "vastu-research-and-traditional-practice": {
    slug: "vastu-research-and-traditional-practice",
    title: "Vastu Shastra: traditional practice and how modern research fits in",
    description:
      "Separating classical Vastu methods from general environmental psychology—without copying commercial sites or promising medical outcomes.",
    sections: [
      {
        heading: "Disclaimer",
        body: [
          "Vastu is a **traditional architectural and spatial** system. FutureSeer presents **Vastu** as cultural and practical exploration, not a substitute for structural engineering, building codes, or medical advice.",
        ],
      },
      {
        heading: "What “traditional” means here",
        body: [
          "Classical **Vastu** uses **directions**, **zones** (often sixteen), **padas** (often thirty-two for entrances), and texts like the **Purusha mandala** as organizing ideas. Lineages differ by region; your teacher or text may emphasize different rules than a generic article.",
        ],
      },
      {
        heading: "Modern research (general environment)",
        body: [
          "Peer-reviewed **environmental psychology** and **health** research sometimes studies light, noise, ventilation, and layout—without proving Vastu claims as a single science. We mention this only to separate **general wellbeing** research from **Vastu-specific** scripture.",
        ],
      },
      {
        heading: "Using FutureSeer’s Vastu tool",
        body: [
          "Use the **device compass** in **4**, **8**, **16**, **32**, or **45** precision (with a visual dial), **main entrance** guidance, and **room placement** tabs. **Ask the Vastu Seer** uses your saved inputs when you are signed in. For compass basics, see **vastu-compass-and-zones** and **purusha-mandala-overview**.",
        ],
      },
    ],
  },
  "angel-numbers-why-you-keep-seeing-111": {
    slug: "angel-numbers-why-you-keep-seeing-111",
    title: "Angel numbers: why you might keep seeing 111 (and what to do next)",
    description:
      "A grounded look at repeating digits, pattern-seeking, and how to explore them in FutureSeer without hype.",
    sections: [
      {
        body: [
          "Many people notice **repeating numbers** on clocks, receipts, or license plates. Psychology research describes **selective attention** and **apophenia**—finding meaningful patterns in randomness. That does not erase personal meaning; it helps separate **curiosity** from **panic**.",
          "Traditional **Angel Numbers** frameworks assign themes to sequences like **111** (often described as alignment or attention). FutureSeer includes an **Angel Numbers** tool that works with your profile so you can explore interpretations in one place.",
        ],
      },
      {
        heading: "Try in FutureSeer",
        body: [
          "Create your profile, generate your **mystical profile**, then open **Angel Numbers** under Tools. Use **Ask the Seer** for questions specific to that tool after sign-in.",
        ],
      },
    ],
  },
  "synastry-relationship-patterns-intro": {
    slug: "synastry-relationship-patterns-intro",
    title: "Synastry: relationship charts and repeating patterns",
    description:
      "How compatibility charts are used in astrology and how FutureSeer supports reflection—not certainty about another person.",
    sections: [
      {
        body: [
          "**Synastry** compares two birth charts to describe dynamics, tensions, and harmonies. It is a **symbolic language**, not proof of behaviour. Ethical practice avoids diagnosing partners without consent.",
          "FutureSeer’s **Synastry** experience is for **reflection and timing** with your saved data. Pair it with **Ask the Seer** for nuanced questions after your profile is complete.",
        ],
      },
      {
        heading: "Get started",
        body: [
          "Complete your birth details, generate your profile, then open **Synastry** from Mystical Tools.",
        ],
      },
    ],
  },
  "vedic-birth-chart-what-to-expect": {
    slug: "vedic-birth-chart-what-to-expect",
    title: "Vedic astrology: what a birth chart reading usually includes",
    description:
      "Lahiri sidereal positions, houses, and how FutureSeer presents Vedic insights alongside other systems.",
    sections: [
      {
        body: [
          "**Vedic** (Jyotish) charts use **sidereal** zodiac positions and a rich set of techniques: houses, nakshatras, dashas, and more. Different teachers emphasise different layers.",
          "FutureSeer runs **Vedic** analysis from your saved birth time and place. Your **mystical profile** generation includes Vedic alongside other tools so you don’t have to re-enter data.",
        ],
      },
      {
        heading: "Next step",
        body: [
          "Sign in, complete **Profile**, **Generate My Mystical Profile**, then visit **Vedic** under Tools.",
        ],
      },
    ],
  },
  "tarot-reflection-and-questions": {
    slug: "tarot-reflection-and-questions",
    title: "Tarot: questions, spreads, and reflection (not a guarantee)",
    description:
      "How Tarot supports structured reflection in the app, aligned with traditional card meanings.",
    sections: [
      {
        body: [
          "Tarot uses **78 cards** with established symbolism. Many readers treat spreads as **conversation starters** for intuition and decision clarity—not fortune-telling with fixed outcomes.",
          "FutureSeer’s **Tarot** tool respects traditional meanings and pairs with **Ask the Seer** for follow‑ups when you are signed in.",
        ],
      },
      {
        heading: "Try it",
        body: [
          "After your profile is generated, open **Tarot** from Mystical Tools and explore **Ask the Seer** on that page.",
        ],
      },
    ],
  },
  "vastu-home-energy-quick-intro": {
    slug: "vastu-home-energy-quick-intro",
    title: "Vastu: directions, entrance, and home energy in brief",
    description:
      "A short intro to directional placement and how Vastu fits next to other tools in FutureSeer.",
    sections: [
      {
        body: [
          "**Vastu Shastra** maps directions, zones, and often **entrance padas** (fine compass segments). It is **not** interchangeable with Feng Shui; FutureSeer keeps them as **separate tools**.",
          "Use the **Vastu** tool with your device compass for **4 / 8 / 16 / 32 / 45** precision where supported (including the full-screen compass dial), and read **Learn** articles on compass basics for deeper context.",
        ],
      },
      {
        heading: "Open the tool",
        body: [
          "Sign in, complete your profile, generate your mystical profile, then choose **Vastu** under Mystical Tools.",
        ],
      },
    ],
  },
}

export const LEARN_SLUGS = Object.keys(LEARN_ARTICLES) as string[]
