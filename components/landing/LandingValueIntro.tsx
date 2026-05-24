import { FutureSeerWordmark } from "@/components/brand/FutureSeerWordmark";

/**
 * Condensed landing value prop — sits below hero (sign-in + scroll cue) and above feature cards.
 */
export function LandingValueIntro() {
  return (
    <section
      className="mx-auto max-w-2xl px-4 pt-2 pb-8 md:pb-10 text-center"
      aria-label="What FutureSeer does"
    >
      <p className="text-sm md:text-base text-primary/85 font-light leading-relaxed tracking-normal normal-case">
        Ask one question. <FutureSeerWordmark size="sm" className="inline-block align-baseline" /> reads your birth
        profile across Vedic astrology, Tarot, Numerology, and more—one clear answer, not generic horoscope filler.
      </p>
      <p className="mt-3 text-xs md:text-sm text-primary/75 font-normal leading-relaxed">
        Create your profile once · ask about love, career, money, or timing · one profile for every tradition, Swiss
        Ephemeris charts, traditional rules—no re-entering details or juggling apps.
      </p>
    </section>
  );
}
