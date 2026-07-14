/**
 * PERFORMANCE ARCHITECTURE — Lazy tool chunk factories
 * Import from tool pages via next/dynamic + these loaders to keep initial route JS small.
 */

// —— Tarot ——
export const lazyTarotSeerChat = () =>
  import("@/components/TarotSeerChatInterface").then((m) => ({ default: m.default }));

export const lazyTarotProfileDiagram = () =>
  import("@/components/tarot/TarotProfileDiagram").then((m) => ({ default: m.TarotProfileDiagram }));

export const lazyTarotLifePathMap = () =>
  import("@/components/tarot/TarotLifePathMap").then((m) => ({ default: m.TarotLifePathMap }));

export const lazyElementalBalanceWheel = () =>
  import("@/components/tarot/ElementalBalanceWheel").then((m) => ({ default: m.ElementalBalanceWheel }));

export const lazyArcanaDistributionChart = () =>
  import("@/components/tarot/ArcanaDistributionChart").then((m) => ({ default: m.ArcanaDistributionChart }));

export const lazyTarotNumerologyIntegration = () =>
  import("@/components/tarot/TarotNumerologyIntegration").then((m) => ({
    default: m.TarotNumerologyIntegration,
  }));

// —— Vedic ——
export const lazyComprehensiveVedicReport = () =>
  import("@/components/vedic/ComprehensiveVedicReport").then((m) => ({ default: m.default }));

export const lazyVedicSeerChat = () =>
  import("@/components/VedicSeerChatInterface").then((m) => ({ default: m.default }));

export const lazyDashaPanelSimplified = () =>
  import("@/components/vedic/DashaPanelSimplified").then((m) => ({ default: m.DashaPanelSimplified }));

export const lazyGotraTab = () =>
  import("@/components/vedic/GotraTab").then((m) => ({ default: m.GotraTab }));

export const lazyVedicCareerReportPanel = () =>
  import("@/components/vedic/VedicCareerReportPanel").then((m) => ({ default: m.VedicCareerReportPanel }));

export const lazyVedicRelationshipReportPanel = () =>
  import("@/components/vedic/VedicRelationshipReportPanel").then((m) => ({
    default: m.VedicRelationshipReportPanel,
  }));

export const lazyVedicKarmaAwarenessPanel = () =>
  import("@/components/vedic/VedicKarmaAwarenessPanel").then((m) => ({
    default: m.VedicKarmaAwarenessPanel,
  }));

export const lazyProfileList = () =>
  import("@/components/profiles/ProfileList").then((m) => ({ default: m.ProfileList }));

export const lazyNorthIndianVedicChart = () =>
  import("@/components/NorthIndianVedicChart").then((m) => ({ default: m.default }));

export const lazySouthIndianVedicChart = () =>
  import("@/components/SouthIndianVedicChart").then((m) => ({ default: m.default }));

export const lazyEastIndianVedicChart = () =>
  import("@/components/EastIndianVedicChart").then((m) => ({ default: m.default }));

export const lazyVedicChartCircular = () =>
  import("@/components/VedicChartCircular").then((m) => ({ default: m.default }));

// —— KP Astrology ——
export const lazyVedicSouthChart = () =>
  import("@/components/VedicSouthChart").then((m) => ({ default: m.default }));

export const lazyKPAstrologyCoachInterface = () =>
  import("@/components/KPAstrologyCoachInterface").then((m) => ({
    default: m.KPAstrologyCoachInterface,
  }));

export const lazyKPSeerChat = () =>
  import("@/components/KPSeerChatInterface").then((m) => ({ default: m.default }));

export const lazyPhase2VisualPanel = () =>
  import("@/components/charts/Phase2VisualPanel").then((m) => ({ default: m.Phase2VisualPanel }));

// —— Western ——
export const lazyWesternSeerChat = () =>
  import("@/components/WesternSeerChatInterface").then((m) => ({ default: m.default }));

export const lazyAstroNumerologyTab = () =>
  import("@/components/western/AstroNumerologyTab").then((m) => ({ default: m.default }));

export const lazyPlanetaryDashboard = () =>
  import("@/components/western/PlanetaryDashboard").then((m) => ({ default: m.PlanetaryDashboard }));

export const lazyHouseDashboard = () =>
  import("@/components/western/HouseDashboard").then((m) => ({ default: m.HouseDashboard }));

export const lazyTransitTimeline = () =>
  import("@/components/western/TransitTimeline").then((m) => ({ default: m.TransitTimeline }));

export const lazyLifeJourneyMap = () =>
  import("@/components/western/LifeJourneyMap").then((m) => ({ default: m.LifeJourneyMap }));

export const lazyAspectPatternDiagram = () =>
  import("@/components/western/AspectPatternDiagram").then((m) => ({
    default: m.AspectPatternDiagram,
  }));

export const lazyWesternSpecialFeatures = () =>
  import("@/components/western/WesternSpecialFeatures").then((m) => ({
    default: m.WesternSpecialFeatures,
  }));

export const lazyWesternCelebritySampleSection = () =>
  import("@/components/western/WesternCelebritySampleSection").then((m) => ({
    default: m.WesternCelebritySampleSection,
  }));

export const lazyComprehensiveWesternReport = () =>
  import("@/components/western/ComprehensiveWesternReport").then((m) => ({
    default: m.default,
  }));
