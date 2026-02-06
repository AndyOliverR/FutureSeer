# TypeScript errors audit – feed one by one

Use this list to fix errors **one file (or one item) at a time**. Tell the assistant:

- **"Fix item N"** – fix all TypeScript errors in the file at item N below, or  
- **"Fix &lt;file path&gt;"** – fix all errors in that file (e.g. `app/api/community/members/route.ts`).

After each fix, run `pnpm exec tsc --noEmit` to confirm. Full error text is in **tsc-errors-audit.txt** (or run `pnpm exec tsc --noEmit 2>&1 | Out-File tsc-errors-audit.txt` to refresh).

---

## How to use

1. Pick one item number or one file path from the list below.
2. Say: **"Fix item 1"** or **"Fix app/api/community/members/route.ts"**.
3. The assistant will fix only that file’s errors.
4. Run `pnpm exec tsc --noEmit` and fix any regressions.
5. Repeat with the next item until the list is done.

---

## Numbered list of files (by area)

### API routes (1–8)

| # | File path |
|---|-----------|
| 1 | app/api/community/members/route.ts |
| 2 | app/api/community/referrals/user/[userId]/route.ts |
| 3 | app/api/seer/query/route.ts |
| 4 | app/api/tools/horary-astrology/current-transits/route.ts |
| 5 | app/api/tools/horary-astrology/generate-custom/route.ts |
| 6 | app/api/tools/kp-astrology/current-transits/route.ts |
| 7 | app/api/vedic-astro-numerology/analysis/route.ts |
| 8 | app/api/western-astrology/comprehensive/route.ts |

### App pages (9–23)

| # | File path |
|---|-----------|
| 9 | app/notes/page.tsx |
| 10 | app/profile/page.tsx |
| 11 | app/settings/page.tsx |
| 12 | app/tools/astroscribe/page.tsx |
| 13 | app/tools/chinese-astrology/page.tsx |
| 14 | app/tools/dream-symbols/page.tsx |
| 15 | app/tools/energy-healing/page.tsx |
| 16 | app/tools/hellenistic-astrology/page.tsx |
| 17 | app/tools/i-ching/page.tsx |
| 18 | app/tools/iching/page.tsx |
| 19 | app/tools/kerykeion/page.tsx |
| 20 | app/tools/kp-astrology/page.tsx |
| 21 | app/tools/numerology/page.tsx |
| 22 | app/tools/tarot/page.tsx |
| 23 | app/tools/vedic/page.tsx |

### Components (24–…)

| # | File path |
|---|-----------|
| 24 | components/AdvancedProfileSetup.tsx |
| 25 | components/angel-numbers/AngelNumbersLookupResults.tsx |
| 26 | components/AngelNumbersCoachInterface.tsx |
| 27 | components/AskTheSeerChatInterface.tsx |
| 28 | components/bazi/BaziDashboardHero.tsx |
| 29 | components/ChartDisplay.tsx |
| 30 | components/chinese/ZiWeiReportGenerator.tsx |
| 31 | components/ContributionTiers.tsx |
| 32 | components/DataSourceStatus.tsx |
| 33 | components/FaceReadingCoachInterface.tsx |
| 34 | components/FinancialAstrologyCoachInterface.tsx |
| 35 | components/FinancialSeerChatInterface.tsx |
| 36 | components/medical/MedicalSeerChat.tsx |
| 37 | components/MedicalAstrologyCoachInterface.tsx |
| 38 | components/MundaneAstrologyCoachInterface.tsx |
| 39 | components/MysticalFeedback.tsx |
| 40 | components/NameAnalysisCoachInterface.tsx |
| 41 | components/NameAnalysisSeerChatInterface.tsx |
| 42 | components/navaratna/GemstoneRecommendationCard.tsx |
| 43 | components/numerology/NumerologySeerChatInterface.tsx |
| 44 | components/NumerologyCoachInterface.tsx |
| 45 | components/NumerologyTool.tsx |
| 46 | components/PaymentMethodCapture.tsx |
| 47 | components/PendulumSeerChatInterface.tsx |
| 48 | components/PersonalizedRemedyCard.tsx |
| 49 | components/PlanSelectionStep.tsx |
| 50 | components/ReadyToUseVedicChart.tsx |
| 51 | components/ReferralBenefitsSection.tsx |
| 52 | components/SignupFlow.tsx |
| 53 | components/sortilege/SortilegeCastingInterface.tsx |
| 54 | components/tarot/ArcanaDistributionChart.tsx |
| 55 | components/tarot/ElementalBalanceWheel.tsx |
| 56 | components/tarot/TarotDashboardHero.tsx |
| 57 | components/TarotCoachInterface.tsx |
| 58 | components/TarotTool.tsx |
| 59 | components/ThirteenSignsZodiacCoachInterface.tsx |
| 60 | components/ui/calendar.tsx |
| 61 | components/ui/chart.tsx |
| 62 | components/ui/fab.tsx |
| 63 | components/VastuTool.tsx |
| 64 | components/vedic/DivisionalChartsViewer.tsx |
| 65 | components/vedic/NakshatraAnalysis.tsx |
| 66 | components/vedic/ShadbalaAnalysis.tsx |
| 67 | components/VedicChartNorthPro.tsx |
| 68 | components/VedicChartSouthPro.tsx |
| 69 | components/VedicCoachInterface.tsx |
| 70 | components/VimshottariPanel.tsx |
| 71 | components/western/AstroChartWrapper.tsx |
| 72 | components/western/ComprehensiveWesternReport.tsx |
| 73 | components/WesternAstrologyCoachInterface.tsx |
| 74 | components/WesternAstrologyTool.tsx |
| 75 | components/YogaPanel.tsx |
| 76 | components/YogaPanelSimplified.tsx |

### Hooks (77–89)

| # | File path |
|---|-----------|
| 77 | hooks/use-dream-symbols.tsx |
| 78 | hooks/use-intersection-observer.ts |
| 79 | hooks/use-name-analysis.tsx |
| 80 | hooks/use-palmistry.tsx |
| 81 | hooks/use-thirteen-signs-zodiac.tsx |
| 82 | hooks/use-trichakra.tsx |
| 83 | hooks/use-vedic-enhanced.tsx |
| 84 | hooks/useAstroScribe.tsx |
| 85 | hooks/useFinancialAstrology.tsx |
| 86 | hooks/usePlacements.ts |
| 87 | hooks/useVedicChart.ts |
| 88 | hooks/useVedicStorage.tsx |

### Lib (89–…)

All remaining errors are under **lib/** plus **services/** and **utils/**. Exact file list and line numbers are in **tsc-errors-audit.txt**. Summary of lib files with errors (same usage: “Fix &lt;path&gt;” or “Fix item N” once numbered):

- lib/aiGateway.ts
- lib/aiInterpretation.ts
- lib/analytics.ts
- lib/astroCalculations.ts
- lib/astroCoach.ts
- lib/astrologyUnified.ts
- lib/astrologyUtils.ts
- lib/astronomia-vedic.ts
- lib/baziIntelligence.ts
- lib/birthTimeResolver.ts
- lib/chartImageService.ts
- lib/chartStorage.ts
- lib/chinese/chineseAstrologyService.ts
- lib/comprehensiveRemedyDatabase.ts
- lib/comprehensiveRemedyGenerator.ts
- lib/comprehensiveSeerEngine.ts
- lib/dailyDecisionsIntelligence.ts
- lib/dashboardDataExtractor.ts
- lib/data/toolIntroductions.ts
- lib/dreamSymbolsSeerState.ts
- lib/energyHealing/userProfileExtractor.ts
- lib/enhancedPanchangaCalculator.ts
- lib/enhancedToolIntegration.ts
- lib/faceReadingIntelligence.ts
- lib/financialAstrologyIntelligence.ts
- lib/futureSeerQualityAssurance.ts
- lib/futureSeerVedAstroIntegration.ts
- lib/hellenisticAstrologyIntelligence.ts
- lib/horaryEngine.ts
- lib/humanDesign/humanDesignCalculator.ts
- lib/hybridHoraryEngine.ts
- lib/ichingIntelligence.ts
- lib/kabbalisticNumerologyIntelligence.ts
- lib/kpAstrologyIntelligence.ts
- lib/medical/ancientWisdom.ts
- lib/medical/astrologicalFormulas.ts
- lib/medical/fertilityCalculator.ts
- lib/medicalAstrologyIntelligence.ts
- lib/mundaneAstrologyIntelligence.ts
- lib/nakshatraCalculator.ts
- lib/nameAnalysisIntelligence.ts
- lib/nameMeanings.ts
- lib/numerology/numerologyRemedyAnalyzer.ts
- lib/oghamIntelligence.ts
- lib/palmistry/palmistryImageAnalyzer.ts
- lib/palmistry/palmistryRemedyAnalyzer.ts
- lib/panchanga.ts
- lib/pendulumIntelligence.ts
- lib/prediction-engine.ts
- lib/pricingConfig.ts
- lib/professionalAstroEngine.ts
- lib/professionalChartGenerator.ts
- lib/razorpay.ts
- lib/runesIntelligence.ts
- lib/seerChatbot/evidenceAggregator.ts
- lib/transitCalculator.ts
- lib/transitCalculatorServer.ts
- lib/trichakraSeerState.ts
- lib/universalDataAggregator.ts
- lib/universalInterpretationEngine.ts
- lib/utils/devotionistFormatter.ts
- lib/vastuIntelligence.ts
- lib/vedAstroApiService.ts
- lib/vedAstroDasaService.ts
- lib/vedic/siderealCalculator.ts
- lib/vedicAstrology.ts
- lib/vedicIntelligence.ts
- lib/vedicInterpretationEnhancer.ts
- lib/vedicResponseEngine.ts
- lib/vedicSeerPrompts.ts
- lib/western/transitCalculator.ts
- lib/western/tropicalCalculator.ts
- lib/western/westernTerminology.ts
- lib/westernAstrologyIntelligence.ts
- lib/westernToVedicImageConverter.ts

### Services & utils (last items)

| # | File path |
|---|-----------|
| (see audit) | services/timezone.ts |
| (see audit) | utils/isAppleDevice.ts |

---

## Quick start

- Start with **“Fix item 1”** (app/api/community/members/route.ts), then **“Fix item 2”**, and so on.
- Or say **“Fix app/api/community/members/route.ts”** then **“Fix app/api/community/referrals/user/[userId]/route.ts”**, etc.
- After each file, run: `pnpm exec tsc --noEmit`.

When all listed files are fixed and **tsc --noEmit** exits 0, remove `typescript: { ignoreBuildErrors: true }` from **next.config.mjs** and run **pnpm run build** to verify.
