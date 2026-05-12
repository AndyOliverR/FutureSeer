# FutureSeer Occult Knowledge Base

## Purpose

This folder contains deep reference material for FutureSeer's divination and occult tools. The content here supplements the structured data in `lib/` (tarotData.ts, nakshatraData.ts, etc.) with richer interpretive guidance, cross-tool correlations, and advanced techniques that the Seer AI can draw from at interpretation time.

## Structure

```
knowledge/
  astrology/
    vedic/       -- Nakshatra depth, dasha mastery, rare yogas, divisional charts
    western/     -- Aspect patterns, house systems, retrograde guides
    financial/   -- Planetary market cycles, Mercury retrograde impact, eclipse trading
  tarot/         -- Esoteric Major Arcana, court card mastery, reversal depth
  numerology/    -- Master numbers, karmic debt, name vibration science
  i-ching/       -- Hexagram pairs, moving line mastery
  runes/         -- Bind runes, runic meditation
  cross-tool/    -- Astro-tarot synthesis, elemental mapping, timing convergence, archetypes
```

## How It Works

1. Files are loaded by `lib/knowledgeLoader.ts` at runtime (server-side only).
2. The loader caches files in memory after first read.
3. When a user asks a Seer question, the prompt pipeline calls `searchKnowledge()` to find relevant reference material.
4. Relevant content is injected into the system prompt as a `## Reference Material` section (max ~2000 tokens).
5. The AI uses this material to ground its interpretation in traditional sources.

## Rules for Adding Content

- **Accuracy**: All content must follow traditional rules of each divination system. Cite established sources (Parashara, Waite, King Wen, etc.) where applicable.
- **Depth over breadth**: Each file should cover its topic thoroughly. Surface-level content belongs in `lib/` data files, not here.
- **No disclaimers**: These are internal reference files. Legal disclaimers appear in the UI, not in knowledge files.
- **Markdown format**: Use H2/H3 headers, bullet lists, and tables for structure. The loader parses plain text.
- **File naming**: Use kebab-case. Name should describe the topic clearly.
- **Updates**: When updating, note the change reason. The loader re-caches on server restart.
