# ASO Localization Pipeline

This runbook defines a repeatable pipeline for localized App Store / Play Store assets for:

- `en`
- `es`
- `pt`
- `fr`
- `de`
- `hi`
- `zh-Hans` (Mandarin markets: CN, SG)
- `zh-Hant` (Traditional/Cantonese-facing markets: HK, TW)

## 1) Source-of-truth files

- Locale metadata pack: `docs/marketing/aso/locale-packs.json`
- Screenshot copy template: `docs/marketing/aso/screenshot-copy-template.json`
- Icon QA checklist: `docs/marketing/aso/icon-checklist.md`

## 2) Operational workflow

1. Update keyword/title/subtitle values in `locale-packs.json`.
2. Regenerate screenshot text overlays using `screenshot-copy-template.json`.
3. Generate ready-to-paste store text:
   - `node scripts/generate-aso-copy.mjs`
   - output: `docs/marketing/aso/generated/store-copy.md`
4. Export App Store keyword CSV by locale:
   - `node scripts/export-aso-keywords-csv.mjs`
   - output: `docs/marketing/aso/generated/app-store-keywords.csv`
3. Export screenshots for each store locale.
4. Validate icon compliance with `icon-checklist.md`.
5. Publish locale metadata + screenshots in App Store Connect and Play Console.
6. Track per-locale CVR and keyword ranking deltas weekly.

## 3) Publishing checklist

- [ ] App title is localized and within store limits.
- [ ] Subtitle/short description is localized and policy-safe.
- [ ] Keyword set is localized (not direct English copy/paste).
- [ ] Screenshots use localized text overlays.
- [ ] Hero screenshot communicates value proposition in local language.
- [ ] Icon passes legibility and contrast checks at small sizes.
- [ ] Locale listing links back to same canonical product brand: FutureSeer.

## 4) KPI tracking per locale

- Impression -> Product page view CTR
- Product page view -> Install CVR
- Install -> Trial start rate
- Trial start -> Paid conversion rate
- Day-7 retention

Record metrics weekly and prioritize 2 lowest-performing locales for iteration.
