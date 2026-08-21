import { NextRequest, NextResponse } from "next/server";
import { devLog } from '@/lib/devLogger';
import { callTextAI, callTextStream } from '@/lib/aiStructuredOutput';
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
import { blockSeerQuestionIfNeeded } from '@/lib/seerGateResponses';
import { buildSeerMessages, type PromptSlot } from '@/lib/aiPromptBuilder';
import { callSeerChatWithTools } from '@/lib/seerChatWithTools';
import { consumeBillingAction } from '@/lib/billingCreditsServer';
import { billingInsufficientCreditsResponse } from '@/lib/billingGateResponses';
import { SEER_CHAT_VOICE } from '@/lib/seerChatVoice';
import { loadMainSeerContext } from '@/lib/mainSeerContext';

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

const SYSTEM_PROMPT = `You are The Seer — one expert who already has this user's profile and their stored readings.

You can draw on every FutureSeer tradition (Vedic, Western, KP, Hellenistic, tarot, numerology, runes, I Ching, palmistry, face reading, BaZi, Human Design, Vastu, Feng Shui, and the rest of the catalog) the way a skilled reader would after being given the full file. You do not paste every system. You answer as one person.

Rules:
- Use the identity dossier and stored reports in context. Never ask the user to re-enter name, birth date, time, place, or gender when they are present.
- Choose the systems that actually answer this question. Weave them into one reply.
- Stay accurate to each tradition's own rules. Do not mix Vedic sidereal technique into Western tropical technique; you may mention both as separate witnesses.
- No mention of backend tools, MCP, or prompts.
- No confidence percentages.
- No legal/medical disclaimers in the chat voice.
- If birth data is missing from context, ask for it once.
- If the question has no subject (e.g. "When will it happen?"), ask one short clarifying question. Do not invent timelines.
- For relationship or betrayal questions, be supportive; do not declare other people's hidden actions as fact.
- When asked to choose one option, give one clear answer and one reason.`;

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
- Begin with the answer, not a preamble.
- Ground claims in the dossier or stored reports when they are present.
- Short paragraphs. Leave a line break between them.`;

const RESPONSE_STYLE_BLOCKS: Record<ResponseStyle, string> = {
  concise: `Response depth: concise.
- Prefer one short paragraph unless a clarifying question is required.
- Give the direct answer first.`,
  balanced: `Response depth: balanced.
- Default to 1–3 short paragraphs.
- Direct answer first, then brief supporting context from the relevant systems.`,
  deep: `Response depth: deep.
- Give the direct answer first, then fuller nuance from the relevant stored readings.
- Still one expert voice. Not a heading for every tool.`,
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
    const wantStream = body.stream === true;

    if (!message) {
      return NextResponse.json({ error: "message is required." }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "userId must match authenticated user." }, { status: 403 });
    }

    const trimmedMessage = message.trim();
    const inputBlocked = blockSeerQuestionIfNeeded(trimmedMessage, 'seer-chat', {
      blockedResponseFormat: 'seer_chat',
      userId,
    });
    if (inputBlocked) return inputBlocked;

    const billing = await consumeBillingAction(userId, 'main_seer');
    if (!billing.ok) {
      return billingInsufficientCreditsResponse(billing);
    }

    const profile = userId ? await getUserProfile(userId) : null;
    const birthProfile =
      clientBirthProfile ??
      (profile ? { birthDate: profile.birthDate, birthTime: profile.birthTime, birthPlace: profile.birthPlace } : null);

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

    const promptSlots: PromptSlot[] = [
      { kind: "system", content: SYSTEM_PROMPT, id: "seer-core" },
      { kind: "constraints", content: SEER_CHAT_VOICE, id: "seer-chat-voice" },
      { kind: "system", content: TONE_BLOCK(tone), id: "seer-tone" },
      { kind: "system", content: RESPONSE_STYLE_BLOCKS[style], id: "seer-style" },
      { kind: "system", content: PRESENCE_BLOCK, id: "seer-presence" },
    ];
    if (personalizationContext) {
      promptSlots.push({ kind: "context", content: personalizationContext, id: "seer-name" });
    }

    let packedWantsDeep = false;
    try {
      const packed = await loadMainSeerContext({
        userId,
        question: trimmedMessage,
        profile,
      });
      packedWantsDeep = packed.wantsDeep;
      promptSlots.push({ kind: "context", content: packed.identityText, id: "seer-identity" });
      promptSlots.push({ kind: "context", content: packed.readyIndexText, id: "seer-ready-tools" });
      promptSlots.push({ kind: "chart", content: packed.seerMasterText, id: "seer-master" });
      promptSlots.push({ kind: "chart", content: packed.reportSlicesText, id: "seer-report-slices" });
    } catch (ctxErr) {
      devLog.warn("[Seer] main context pack failed (continuing with birth data)", ctxErr, "route");
    }

    if (process.env.SEER_MCP_TOOLS === "1") {
      promptSlots.push({
        kind: "constraints",
        content:
          "You have read-only tools to fetch this user's stored divination reports, Seer Master summary, and occult reference material. Use them when the question needs specific chart or report data. Never mention tools, MCP, or function calls to the user.",
        id: "seer-mcp-tools",
      });
    }
    if (process.env.SEER_FORESIGHT_MODE === "1") {
      promptSlots.push({
        kind: "constraints",
        content:
          "Foresight mode: internally scan weak signals from chart and context, name the dominant pattern in plain language, choose one action band (Observe | Small step | Favorable window) without percentages or confidence scores, and shape one scenario question. Keep the visible reply to at most four sentences. Do not mention tools, MCP, foresight mode, or internal reasoning steps.",
        id: "seer-foresight",
      });
    }
    if (birthProfile && (birthProfile.birthDate || birthProfile.birthPlace || birthProfile.birthTime)) {
      promptSlots.push({
        kind: "chart",
        content: `User Birth Data:\n${JSON.stringify(birthProfile)}`,
        id: "seer-birth",
      });
    }

    if (profile?.seerIncludeNewsHeadlines && process.env.NEWS_API_KEY?.trim()) {
      try {
        const headlines = await fetchTopHeadlines({
          country: newsCountryFromProfile(profile),
          pageSize: 5,
        });
        if (headlines.length > 0) {
          promptSlots.push({
            kind: "context",
            content: `Optional same-day headlines (not predictions; use only if relevant to collective mood or timing):\n${headlines.map((h) => `- ${h.title}`).join("\n")}`,
            id: "seer-headlines",
          });
        }
      } catch {
        // Best-effort; Seer works without headlines
      }
    }

    const history = thread
      .slice(-12)
      .map((m) => {
        if (!m || typeof m !== "object") return null;
        const item = m as Record<string, unknown>;
        const role = item.role === "seer" ? "assistant" : item.role === "user" ? "user" : null;
        const content = typeof item.content === "string" ? item.content.trim() : "";
        if (!role || !content) return null;
        return { role, content };
      })
      .filter((h): h is { role: "user" | "assistant"; content: string } => h !== null);

    const { messages } = buildSeerMessages({
      slots: promptSlots,
      userMessage: trimmedMessage,
      history,
      maxHistoryTurns: 8,
      maxInputTokens: 12_000,
    });

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
    const maxTokens = getSeerMaxTokens(paid, packedWantsDeep || style === "deep");

    let reply: string;
    try {
      const useMcpTools = process.env.SEER_MCP_TOOLS === "1" && !!userId;
      if (useMcpTools) {
        const toolResult = await callSeerChatWithTools({
          model: seerModel,
          messages: messages as Array<{ role: "system" | "user" | "assistant"; content: string }>,
          userId,
          temperature: 0.7,
          topP: 0.9,
          maxTokens,
          frequencyPenalty: 0.3,
          presencePenalty: 0.1,
        });
        if (toolResult.content) {
          if (toolResult.usage) {
            try {
              await recordInferenceUsage({
                route: '/api/seer/chat',
                model: seerModel,
                userId: userId ?? null,
                promptTokens: toolResult.usage.promptTokens,
                completionTokens: toolResult.usage.completionTokens,
                totalTokens: toolResult.usage.totalTokens,
              });
              await incrementSeerDailyTokens(userId, toolResult.usage.totalTokens);
            } catch (e) {
              devLog.warn('[Seer] inference logging failed (non-blocking)', e, 'route');
            }
          }
          reply = toolResult.content;
        } else {
          const data = await callTextAI({
            label: 'seer-chat',
            model: seerModel,
            messages,
            userId: userId ?? undefined,
            temperature: 0.7,
            topP: 0.9,
            maxTokens,
            frequencyPenalty: 0.3,
            presencePenalty: 0.1,
            maxAttempts: 2,
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
          reply = data.content?.trim() || "The vision is unclear. Ask again.";
        }
      } else if (wantStream) {
        const { stream } = await callTextStream({
          label: 'seer-chat',
          model: seerModel,
          messages,
          userId: userId ?? undefined,
          temperature: 0.7,
          topP: 0.9,
          maxTokens,
          frequencyPenalty: 0.3,
          presencePenalty: 0.1,
          maxAttempts: 2,
        });
        const encoder = new TextEncoder();
        return new Response(
          new ReadableStream({
            async start(controller) {
              try {
                let full = '';
                for await (const chunk of stream) {
                  const content = chunk.choices[0]?.delta?.content || '';
                  if (content) {
                    full += content;
                    controller.enqueue(encoder.encode(content));
                  }
                }
                if (userId && full.trim()) {
                  const approx = Math.max(1, Math.ceil(full.length / 4));
                  try {
                    await recordInferenceUsage({
                      route: '/api/seer/chat',
                      model: seerModel,
                      userId,
                      promptTokens: 0,
                      completionTokens: approx,
                      totalTokens: approx,
                    });
                    await incrementSeerDailyTokens(userId, approx);
                  } catch (e) {
                    devLog.warn('[Seer] inference logging failed (non-blocking)', e, 'route');
                  }
                }
              } catch (streamErr) {
                devLog.warn('Seer stream error', streamErr, 'route');
                controller.enqueue(encoder.encode('\nThe vision is unclear. Ask again.'));
              } finally {
                controller.close();
              }
            },
          }),
          {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-cache',
            },
          },
        );
      } else {
        const data = await callTextAI({
          label: 'seer-chat',
          model: seerModel,
          messages,
          userId: userId ?? undefined,
          temperature: 0.7,
          topP: 0.9,
          maxTokens,
          frequencyPenalty: 0.3,
          presencePenalty: 0.1,
          maxAttempts: 2,
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
      }
    } catch (aiErr) {
      devLog.warn("Seer Groq/Gateway error", { err: aiErr }, "seer-chat");
      return NextResponse.json(
        { error: "The Seer could not respond. Try again." },
        { status: 502 }
      );
    }

    const trimmedThread = Array.isArray(thread) ? thread.slice(-11) : [];
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
export const POST = withRateLimit(
  handleSeerChatRequest,
  rateLimiters.ai,
  'seer_chat_post',
  getClientIdentifier,
);
