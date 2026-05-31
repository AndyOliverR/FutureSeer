"use client";

import { useMemo } from "react";
import { DevotionistStyleCard } from "@/components/western/DevotionistStyleCard";
import { buildVedicKarmaInsights } from "@/lib/vedic/karmaChartInsights";
import { Compass, Moon, Clock, Scale, Sparkles, Target } from "lucide-react";

type VedicKarmaAwarenessPanelProps = {
  chartData?: Record<string, unknown> | null;
  /** Compact layout for overview tab */
  variant?: "full" | "compact";
};

const FOUNDATION_PRINCIPLES = [
  {
    title: "Moon & Lagna over Sun-sign labels",
    body: "Sidereal Moon sign and nakshatra describe emotional truth; Lagna shapes life approach. Sun sign alone is not enough for Jyotish depth.",
  },
  {
    title: "Full chart, not horoscope snippets",
    body: "Houses, lords, divisional charts, yogas, and dashas together explain why two people with the same Sun sign can live very different lives.",
  },
  {
    title: "Dashas as life chapters",
    body: "Your chart shows potential; Vimshottari dasha shows when themes activate — preparation phases and breakthrough periods both have purpose.",
  },
  {
    title: "Timing and aligned effort",
    body: "The same action can meet resistance or flow depending on the dasha and transits. Awareness helps you push, prepare, or pause wisely.",
  },
];

export function VedicKarmaAwarenessPanel({
  chartData,
  variant = "full",
}: VedicKarmaAwarenessPanelProps) {
  const insights = useMemo(
    () => buildVedicKarmaInsights(chartData as Parameters<typeof buildVedicKarmaInsights>[0]),
    [chartData],
  );

  const showFoundations = variant === "full";

  return (
    <div className="space-y-4">
      <DevotionistStyleCard
        icon={<Scale className="w-6 h-6" />}
        title="Karma, Chart & Conscious Timing"
        summary={insights.philosophy}
        variant="callout"
        colorScheme="purple"
      />

      {insights.dashaTheme && (
        <DevotionistStyleCard
          icon={<Clock className="w-6 h-6" />}
          title="Your current dasha chapter"
          summary={insights.dashaTheme}
          variant="default"
          colorScheme="amber"
        />
      )}

      {insights.chartSignals.length > 0 ? (
        <DevotionistStyleCard
          icon={<Moon className="w-6 h-6" />}
          title="Karmic signals in your chart"
          summary="Traditional Jyotish pointers from your stored birth chart — tendencies and timing, not fixed fate."
          items={insights.chartSignals.map((text) => ({ text, type: "neutral" as const }))}
          variant="default"
          colorScheme="blue"
        />
      ) : (
        <DevotionistStyleCard
          icon={<Sparkles className="w-6 h-6" />}
          title="Personalized karmic signals"
          summary="Complete your birth profile and generate your mystical profile to see Moon, Lagna, Saturn, nodes, and dasha-linked insights here."
          variant="default"
          colorScheme="blue"
        />
      )}

      {showFoundations && (
        <DevotionistStyleCard
          icon={<Compass className="w-6 h-6" />}
          title="Five foundations of real Jyotish"
          summary="What separates a full Vedic reading from generic Sun-sign astrology."
          items={FOUNDATION_PRINCIPLES.map((p) => ({
            text: `${p.title}: ${p.body}`,
            type: "neutral" as const,
          }))}
          variant="default"
          colorScheme="amber"
        />
      )}

      <DevotionistStyleCard
        icon={<Target className="w-6 h-6" />}
        title="Reflection prompts"
        summary="Use these with Ask the Vedic Seer or during a challenging dasha — awareness over fatalism."
        items={insights.reflectionPrompts.map((text) => ({ text, type: "positive" as const }))}
        variant="default"
        colorScheme="purple"
      />
    </div>
  );
}
