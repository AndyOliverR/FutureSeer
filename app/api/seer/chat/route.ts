import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, type UserProfile } from "@/lib/firebase";

function getAddressName(profile: UserProfile | null | undefined): string | null {
  if (!profile) return null;
  if (profile.displayName && profile.displayName.trim().length > 0) {
    return profile.displayName.trim();
  }
  const name = profile.fullName ?? (profile as { name?: string }).name;
  if (name && typeof name === "string" && name.trim().length > 0) {
    return name.trim().split(/\s+/)[0] ?? null;
  }
  return null;
}

const SYSTEM_PROMPT = `You are The Seer.

You have mastery over the following systems:
Western Astrology, Vedic Astrology, KP Astrology, Hellenistic Astrology,
Tarot, Lenormand, Runes, I Ching, Ogham,
Astrocartography, Financial Astrology, Medical Astrology,
Synastry, Psychological Astrology,
BaZi, Zi Wei Dou Shu,
Kabbalistic Astrology, Hermetic Astrology,
Shamanic Astrology,
Palmistry, Face Reading,
Angel Numbers, Numerology, Kabbalistic Numerology,
Vastu, Feng Shui, Geomancy,
Pendulum, Scrying, Bibliomancy, Sortilege,
Akashic Records, Energy & Healing,
Human Design, Mundane Astrology,
Horary Astrology, Daily Decisions, Trichakra Method,
Navaratna & Planetary Stones.

Rules:
- Choose the most relevant system(s).
- Combine at most 3 systems.
- Answer clearly and directly.
- No mention of backend tools.
- No confidence percentages.
- No disclaimers.
- No long essays.
- 3–6 sentences maximum.
- Tone: calm, precise, mystical but grounded.
- Ask at most one clarifying question if needed.
- If the user changes topic, adapt naturally.
- If birth data is missing, ask for it once.
- Do not contradict yourself within the same answer.`;

type ToneMode = "subtle" | "elevated" | "oracle";

const TONE_DESCRIPTIONS: Record<ToneMode, string> = {
  subtle: "Calm, grounded, clear. No mystical exaggeration. Practical insight.",
  elevated: "Insightful, symbolic, slightly poetic. Minimal metaphor.",
  oracle: "Measured. Declarative. Symbolic. Speak with presence. Avoid casual phrasing.",
};

const TONE_BLOCK = (mode: ToneMode) => `Tone: ${mode}.

${TONE_DESCRIPTIONS[mode]}

Speak accordingly.`;

const PRESENCE_BLOCK = `Presence:
- Begin strong answers with certainty.
- Never hedge. Do not use "appears," "may," "could," unless uncertainty is essential.
- Short declarative sentences.
- Leave subtle pauses (line breaks when appropriate).
- Never rush explanations.`;

function getToneMode(): ToneMode {
  const v = process.env.SEER_TONE_MODE?.toLowerCase();
  if (v === "subtle" || v === "elevated" || v === "oracle") return v;
  return "elevated";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, thread = [], userId, birthProfile: clientBirthProfile, toneMode } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required." }, { status: 400 });
    }

    const profile = userId ? await getUserProfile(userId) : null;
    const birthProfile =
      clientBirthProfile ??
      (profile ? { birthDate: profile.birthDate, birthTime: profile.birthTime, birthPlace: profile.birthPlace } : null);

    const trimmedThread = Array.isArray(thread) ? thread.slice(-6) : [];
    const tone: ToneMode =
      toneMode === "subtle" || toneMode === "elevated" || toneMode === "oracle" ? toneMode : getToneMode();

    const addressName = getAddressName(profile ?? undefined);
    const useNamePause = (tone === "elevated" || tone === "oracle") && addressName;
    const personalizationContext = addressName
      ? `You are speaking directly to ${addressName}.
When appropriate, begin the first sentence with their name.
Do not repeat it more than once per response.
Do not force it if it sounds unnatural.${useNamePause ? "\nWhen using their name, put it on its own line followed by a blank line, then the rest of your answer." : ""}`
      : "";

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: TONE_BLOCK(tone) },
      { role: "system", content: PRESENCE_BLOCK },
    ];
    if (personalizationContext) {
      messages.push({ role: "system", content: personalizationContext });
    }
    if (birthProfile && (birthProfile.birthDate || birthProfile.birthPlace || birthProfile.birthTime)) {
      messages.push({
        role: "system",
        content: `User Birth Data:\n${JSON.stringify(birthProfile)}`,
      });
    }

    for (const m of trimmedThread) {
      const role = m.role === "seer" ? "assistant" : m.role === "user" ? "user" : null;
      if (role && m.content) messages.push({ role, content: m.content });
    }

    messages.push({ role: "user", content: message.trim() });

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      console.warn("[Seer] Missing API key. GROQ_API_KEY not set.");
      return NextResponse.json(
        {
          error:
            "Seer connection failed. Set GROQ_API_KEY in .env.local (then restart dev server) or in Vercel Environment Variables, then redeploy.",
        },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500,
        frequency_penalty: 0.3,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn("Groq API error:", response.status, err);
      return NextResponse.json(
        { error: "The Seer could not respond. Try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "The vision is unclear. Ask again.";

    const updatedThread = [
      ...trimmedThread,
      { role: "user", content: message.trim() },
      { role: "seer", content: reply },
    ];

    return NextResponse.json({ reply, thread: updatedThread });
  } catch (err) {
    console.error("Seer chat error:", err);
    return NextResponse.json(
      { error: "Seer connection failed." },
      { status: 500 }
    );
  }
}
