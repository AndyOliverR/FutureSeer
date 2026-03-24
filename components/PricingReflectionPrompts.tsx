"use client";

/**
 * Optional reflective prompts (ethical framing: fragmentation, clarity — not fear-based fate claims).
 * Helps visitors articulate fit before choosing a membership tier.
 */
export function PricingReflectionPrompts() {
  const prompts = [
    'What have you already tried to get consistent insight across astrology, tarot, or other systems?',
    'If nothing changed for six months, what would you most want to be clearer about?',
    'What would “success” look like for you here — one trusted place to return to, or a single burning question answered?',
    'What would make this membership feel like the right fit for how you actually practice?',
  ];

  return (
    <section
      className="max-w-3xl mx-auto mb-12 rounded-2xl border border-amber-500/25 bg-slate-900/50 px-5 py-6 text-left"
      aria-labelledby="pricing-reflection-heading"
    >
      <h2 id="pricing-reflection-heading" className="text-lg font-semibold text-amber-400 mb-3">
        Before you choose a tier
      </h2>
      <p className="text-sm text-white/70 mb-4">
        There is no wrong answer — these questions help you decide if a membership matches what you are looking for.
      </p>
      <ul className="space-y-3 text-sm text-white/85 list-decimal list-inside">
        {prompts.map((p) => (
          <li key={p} className="pl-1">
            {p}
          </li>
        ))}
      </ul>
    </section>
  );
}
