export interface NumerologyBlockRemedy {
  number: number;
  block: string;
  remedy: string;
  why: string;
}

export const NUMEROLOGY_PRACTICAL_DISCLAIMER =
  "Numerology guidance is reflective and practical, not a guarantee of outcomes or a substitute for professional financial, medical, or legal advice.";

const POWER_WORDS: Record<number, string> = {
  1: "Leadership",
  2: "Balance",
  3: "Expression",
  4: "Structure",
  5: "Momentum",
  6: "Harmony",
  7: "Clarity",
  8: "Discipline",
  9: "Consistency",
};

const WEALTH_TIPS: Record<number, string[]> = {
  1: [
    "Set one bold weekly target and track it daily.",
    "Use first-hour focus blocks for high-impact work.",
    "Invest in visibility: present, pitch, and lead from the front.",
  ],
  2: [
    "Build wealth through partnerships and stable routines.",
    "Review shared finances and agreements every week.",
    "Choose fewer priorities and execute them calmly.",
  ],
  3: [
    "Monetize communication: writing, teaching, presenting, or content.",
    "Use a content or outreach cadence you can sustain.",
    "Avoid scattering energy; commit to one revenue lane at a time.",
  ],
  4: [
    "Treat wealth as a systems game: process, budget, and review.",
    "Track expenses and cash flow with strict weekly discipline.",
    "Prefer long-term compounding over short-term hype.",
  ],
  5: [
    "Create multiple opportunity channels, but cap active bets.",
    "Use risk limits before entering new financial moves.",
    "Protect momentum with a weekly reset and plan.",
  ],
  6: [
    "Grow wealth through trust, service quality, and relationships.",
    "Price fairly and avoid over-giving without boundaries.",
    "Keep your home/workspace calm to reduce decision fatigue.",
  ],
  7: [
    "Research deeply before major commitments.",
    "Schedule solitude blocks for strategic thinking.",
    "Favor knowledge assets and specialized skills.",
  ],
  8: [
    "Focus on measurable outcomes and execution discipline.",
    "Use monthly scorecards for income, savings, and debt.",
    "Negotiate assertively and protect your time.",
  ],
  9: [
    "Close old loops and simplify before scaling.",
    "Channel generosity with clear financial boundaries.",
    "Use consistent routines to convert vision into results.",
  ],
};

const BLOCKS: Record<number, NumerologyBlockRemedy> = {
  1: {
    number: 1,
    block: "Impatience and solo overload.",
    remedy: "Delegate one recurring task and focus on one priority metric.",
    why: "Leadership works best when attention is concentrated, not fragmented.",
  },
  2: {
    number: 2,
    block: "Overthinking and delayed decisions.",
    remedy: "Set a decision window and act with one trusted input.",
    why: "Number 2 stabilizes when rhythm beats indecision.",
  },
  3: {
    number: 3,
    block: "Creative overflow without follow-through.",
    remedy: "Use publish-then-improve cycles with fixed deadlines.",
    why: "Expression turns into value only when shipped consistently.",
  },
  4: {
    number: 4,
    block: "Rigidity and resistance to adaptation.",
    remedy: "Keep core systems stable, but review one process weekly.",
    why: "Structure grows wealth when it is disciplined and flexible.",
  },
  5: {
    number: 5,
    block: "Impulsive switching and novelty chasing.",
    remedy: "Limit active initiatives and complete before expanding.",
    why: "Freedom is strongest when directed by clear constraints.",
  },
  6: {
    number: 6,
    block: "People-pleasing at personal cost.",
    remedy: "Define service boundaries, pricing, and recovery time.",
    why: "Sustainable care requires stable energy and clear limits.",
  },
  7: {
    number: 7,
    block: "Isolation and analysis paralysis.",
    remedy: "Pair deep research with one visible weekly action.",
    why: "Insight compounds when translated into practical execution.",
  },
  8: {
    number: 8,
    block: "Control strain and burnout.",
    remedy: "Run by dashboards, not constant urgency.",
    why: "Number 8 thrives with disciplined systems, not constant pressure.",
  },
  9: {
    number: 9,
    block: "Overextension and unfinished closures.",
    remedy: "Close one old commitment each week before new expansion.",
    why: "Completion creates energy for larger impact and prosperity.",
  },
};

const MICRO_PRACTICES: Record<number, string[]> = {
  1: ["Speak your weekly intention aloud each morning.", "Finish the highest-impact task before noon."],
  2: ["Do a 5-minute balance check: health, work, relationships.", "Pause before reacting; respond with clarity."],
  3: ["Write 5 lines daily about one idea worth sharing.", "Practice one message in a mirror for confidence."],
  4: ["Review budget and tasks at the same time daily.", "Clear one small area to reinforce order."],
  5: ["Set one adventure/learning goal and one completion goal.", "Use a timer to protect focused execution."],
  6: ["Do one meaningful act of service with clear boundaries.", "Reset your environment before key decisions."],
  7: ["Take 10 minutes for quiet reflection and journaling.", "Record one insight and one concrete next action."],
  8: ["Check your scoreboard: income, savings, discipline.", "Complete one difficult task without delay."],
  9: ["Release one outdated commitment.", "Do one consistency action that supports long-term goals."],
};

export function reduceToCoreNumber(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null;
  let n = Math.abs(Math.trunc(value));
  if (n === 0) return null;
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = n
      .toString()
      .split("")
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  if (n === 11 || n === 22 || n === 33) {
    return reduceToCoreNumber(n
      .toString()
      .split("")
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0));
  }
  return n;
}

export function powerWordByNumber(number: number | null | undefined): string {
  const n = reduceToCoreNumber(number);
  if (!n) return "Consistency";
  return POWER_WORDS[n] ?? "Consistency";
}

export function wealthAttractionByNumber(number: number | null | undefined): string[] {
  const n = reduceToCoreNumber(number);
  if (!n) return WEALTH_TIPS[9];
  return WEALTH_TIPS[n] ?? WEALTH_TIPS[9];
}

export function commonBlockByNumber(number: number | null | undefined): NumerologyBlockRemedy {
  const n = reduceToCoreNumber(number);
  if (!n) return BLOCKS[9];
  return BLOCKS[n] ?? BLOCKS[9];
}

export function dailyMicroPracticesByNumber(number: number | null | undefined): string[] {
  const n = reduceToCoreNumber(number);
  if (!n) return MICRO_PRACTICES[9];
  return MICRO_PRACTICES[n] ?? MICRO_PRACTICES[9];
}

export function practicalChecklistByNumber(number: number | null | undefined): string[] {
  const powerWord = powerWordByNumber(number);
  const wealthTips = wealthAttractionByNumber(number).slice(0, 2);
  const block = commonBlockByNumber(number);
  const micro = dailyMicroPracticesByNumber(number).slice(0, 2);
  return [
    `Weekly power word: ${powerWord}. Repeat it before your first priority task.`,
    ...wealthTips,
    `Block to watch: ${block.block}`,
    `Remedy: ${block.remedy}`,
    ...micro,
  ];
}

export const NUMEROLOGY_PRACTICAL_SLICE_BULLETS = [
  "Use a weekly power word as an attention anchor (not magic guarantee).",
  "Wealth recommendations should be habit-based: budget rhythm, focus cadence, execution discipline.",
  "Map advice to the user's core number and current cycle where available.",
  "Always frame as practical implementation steps, not deterministic outcomes.",
]
  .map((line) => `- ${line}`)
  .join("\n");

