import { NextRequest, NextResponse } from "next/server";
import { devLog } from '@/lib/devLogger';
import { createAICompletion } from '@/lib/aiGateway';
import { withRateLimit, rateLimiters, getClientIdentifier } from '@/lib/rateLimit';
import { getUserProfile, type UserProfile } from "@/lib/firebase";
import { fetchTopHeadlines, newsCountryFromProfile } from "@/lib/server/newsHeadlines";
import {
  checkSeerDailyTokenCap,
  incrementSeerDailyTokens,
  recordInferenceUsage,
} from '@/lib/aiInferenceUsage';
import { getSeerChatModel, getSeerMaxTokens } from '@/lib/seerModel';
import { isPaidPlan } from '@/lib/profileEditQuota';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';

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
Pendulum, Bibliomancy, Sortilege,
Akashic Records, Energy & Healing,
Human Design,
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
- 3–4 sentences maximum.
- Tone: calm, precise, mystical but grounded.
- Ask at most one clarifying question if needed.
- If the user changes topic, adapt naturally.
- If birth data is missing, ask for it once.
- Do not contradict yourself within the same answer.
- For relationship or betrayal questions, be supportive and reflective; avoid declaring likelihoods or certainties about others' behavior.
- If the user's question lacks a clear subject (e.g. "When will it happen?"), do not assume what "it" refers to. Ask one short clarifying question instead. Do not fabricate timelines or events.
- Do not invent specific time ranges (e.g. "6–12 months") unless explicitly derived from birth data with clear reasoning.
- Never use these phrases: "The astrological influences", "The planetary transits suggest", "Your birth chart indicates", "The astrocartography map reveals". Speak with declarative presence and observational insight; do not name mechanics or tools.
- When asked to choose or recommend one thing (e.g. which country, which option), give one clear answer and one reason; no lists, no "could" or "may" for the main conclusion.
- Authority: No more than 4 sentences. First sentence must contain the conclusion. No filler intro. No mention of astrological mechanics.`;

type ToneMode = "subtle" | "elevated" | "oracle";
type ResponseStyle = "concise" | "balanced" | "deep";

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

const RESPONSE_STYLE_BLOCKS: Record<ResponseStyle, string> = {
  concise: `Response depth: concise.
- Prefer 1–2 short sentences unless a clarifying question is required.
- Give the direct answer first; keep details minimal.`,
  balanced: `Response depth: balanced.
- Keep the answer direct with brief supporting context.
- Default to clear, practical guidance with no extra verbosity.`,
  deep: `Response depth: deep.
- Give direct guidance first, then add compact context.
- Provide fuller nuance while staying concise and grounded.`,
};

function getToneMode(): ToneMode {
  const v = process.env.SEER_TONE_MODE?.toLowerCase();
  if (v === "subtle" || v === "elevated" || v === "oracle") return v;
  return "elevated";
}

async function handleSeerChatRequest(req: NextRequest) {
  try {
    const auth = await verifyUserRequest(req, 'seer-chat');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const message = typeof body.message === 'string' ? body.message : '';
    const thread = Array.isArray(body.thread) ? body.thread : [];
    const userId = resolveOwnedUserId(body.userId, auth.uid);
    const clientBirthProfile = body.birthProfile as Record<string, unknown> | undefined;
    const toneMode = body.toneMode;
    const responseStyle = body.responseStyle;

    if (!message) {
      return NextResponse.json({ error: "message is required." }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: "message too long." }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "userId must match authenticated user." }, { status: 403 });
    }

    const profile = userId ? await getUserProfile(userId) : null;
    const birthProfile =
      clientBirthProfile ??
      (profile ? { birthDate: profile.birthDate, birthTime: profile.birthTime, birthPlace: profile.birthPlace } : null);

    const trimmedThread = thread.slice(-6);
    const tone: ToneMode =
      toneMode === "subtle" || toneMode === "elevated" || toneMode === "oracle" ? toneMode : getToneMode();
    const style: ResponseStyle =
      responseStyle === "concise" || responseStyle === "balanced" || responseStyle === "deep"
        ? responseStyle
        : "balanced";

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
      { role: "system", content: RESPONSE_STYLE_BLOCKS[style] },
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

    if (profile?.seerIncludeNewsHeadlines && process.env.NEWS_API_KEY?.trim()) {
      try {
        const headlines = await fetchTopHeadlines({
          country: newsCountryFromProfile(profile),
          pageSize: 5,
        });
        if (headlines.length > 0) {
          messages.push({
            role: "system",
            content: `Optional same-day headlines (not predictions; use only if relevant to collective mood or timing):\n${headlines.map((h) => `- ${h.title}`).join("\n")}`,
          });
        }
      } catch {
        // Best-effort; Seer works without headlines
      }
    }

    for (const m of trimmedThread) {
      if (!m || typeof m !== 'object') continue;
      const item = m as Record<string, unknown>;
      const role = item.role === "seer" ? "assistant" : item.role === "user" ? "user" : null;
      const content = typeof item.content === 'string' ? item.content : '';
      if (role && content) messages.push({ role, content: content.slice(0, 2000) });
    }

    messages.push({ role: "user", content: message.trim() });

    if (!process.env.GROQ_API_KEY?.trim() && !process.env.AI_GATEWAY_API_KEY) {
      devLog.warn("[Seer] Missing AI keys. Set GROQ_API_KEY and/or AI_GATEWAY_API_KEY.", undefined, 'route');
      return NextResponse.json(
        {
          error:
            "Seer connection failed. Set GROQ_API_KEY and/or AI_GATEWAY_API_KEY in .env.local (then restart dev server) or in Vercel Environment Variables, then redeploy.",
        },
        { status: 500 }
      );
    }

    const paid = isPaidPlan(profile?.selectedPlan);
    if (userId) {
      const capError = await checkSeerDailyTokenCap(userId, paid);
      if (capError) {
        return NextResponse.json({ error: capError }, { status: 429 });
      }
    }

    const seerModel = getSeerChatModel(profile?.selectedPlan);
    const maxTokens = getSeerMaxTokens(paid);

    let reply: string;
    try {
      const data = await createAICompletion({
        model: seerModel,
        messages,
        temperature: 0.7,
        topP: 0.9,
        maxTokens,
        frequencyPenalty: 0.3,
        presencePenalty: 0.1,
      });
      if (data.usage) {
        try {
          await recordInferenceUsage({
            route: '/api/seer/chat',
            model: seerModel,
            userId: userId ?? null,
            promptTokens: data.usage.promptTokens,
            completionTokens: data.usage.completionTokens,
            totalTokens: data.usage.totalTokens,
          });
          if (userId) {
            await incrementSeerDailyTokens(userId, data.usage.totalTokens);
          }
        } catch (e) {
          devLog.warn('[Seer] inference logging failed (non-blocking)', e, 'route');
        }
      }
      if (data.usage && userId) {
        devLog.debug(
          "[Seer] Token usage",
          {
            userId,
            model: seerModel,
            prompt_tokens: data.usage.promptTokens,
            completion_tokens: data.usage.completionTokens,
            total_tokens: data.usage.totalTokens,
          },
          "route"
        );
      }
      reply = data.content?.trim() || "The vision is unclear. Ask again.";
    } catch (aiErr) {
      devLog.warn("Seer Groq/Gateway error", { err: aiErr }, "seer-chat");
      return NextResponse.json(
        { error: "The Seer could not respond. Try again." },
        { status: 502 }
      );
    }

    const updatedThread = [
      ...trimmedThread,
      { role: "user", content: message.trim() },
      { role: "seer", content: reply },
    ];

    return NextResponse.json({ reply, thread: updatedThread });
  } catch (err) {
    devLog.error("Seer chat error:", err, 'route');
    return NextResponse.json(
      { error: "Seer connection failed." },
      { status: 500 }
    );
  }
}

/** Same AI budget as legacy OpenAI oracle route; IP-based id (body userId not available pre-parse). */
export const POST = withRateLimit(handleSeerChatRequest, rateLimiters.ai, getClientIdentifier);
