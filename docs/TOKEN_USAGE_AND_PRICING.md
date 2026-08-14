# Token Usage and Cost Per Profile Generation

This doc explains where tokens are consumed, how to see usage, and how to relate it to your subscription pricing so you can confirm margins or adjust rates.

## Where tokens are used

- **Profile generation (“Generate my mystical profile”)** runs the full pipeline in [lib/profileGenerationOrchestrator.ts](lib/profileGenerationOrchestrator.ts). It calls **40+ tool APIs** (Vedic, Western, Tarot, Palmistry, etc.). Many of those routes use the LLM via [lib/aiGateway.ts](lib/aiGateway.ts) (Groq or OpenAI).
- **Each “edit” that leads to a new generation** runs this same pipeline once. So “cost per edit” in terms of API spend is the **cost of one full mystical profile generation**.

Token usage is **not** currently aggregated per generation:

- [lib/aiGateway.ts](lib/aiGateway.ts) returns `usage` (e.g. `promptTokens`, `completionTokens`, `totalTokens`) from Groq/OpenAI when doing non-streaming `chatCompletion`.
- The orchestrator calls tool APIs over HTTP; those APIs use `aiGateway` internally but do not return usage in the HTTP response. So there is no single place that sums tokens for one generation.

## Ask the Seer cost

- **Main Seer** ([app/api/seer/chat/route.ts](app/api/seer/chat/route.ts)): One non-streaming Groq call per user message. The Groq response includes `usage` (prompt_tokens, completion_tokens, total_tokens); the route does not currently read or log it. Typical size: system prompt + thread (last 6 messages) + new message; response `max_tokens: 500`. Rough order of magnitude: **~1k–4k tokens per exchange** (default models `openai/gpt-oss-20b` for free/trial and `openai/gpt-oss-120b` for paid, hosted by Groq).
- **Per-tool Ask the Seer** (e.g. [app/api/ask-tarot-seer/route.ts](app/api/ask-tarot-seer/route.ts)): Uses `createAIStream` from [lib/aiGateway.ts](lib/aiGateway.ts). Streaming responses do not expose usage in the same way; cost is still incurred. Use the **Groq console** for aggregate usage by time window. Typical: one short answer per question, similar scale to main Seer.

To get per-question cost for the main Seer later, you can read `data.usage` from the Groq response in the seer/chat route and log it or write it to Firestore (e.g. `seerUsage/{userId}/questions`).

## How to see usage and cost today

1. **Groq Cloud**  
   Use the [Groq console](https://console.groq.com) (usage/billing) to see total usage and spend. You can correlate with time windows when you ran profile generations to get a rough “cost per generation” (e.g. total spend in a day ÷ number of generations that day).

2. **Rough cost per generation**  
   - One full generation = many LLM calls across 40+ tools (some tools use multiple calls).  
   - Example (Groq, approximate): Llama 3.1 8B ~$0.05/M input, ~$0.08/M output. If one generation uses on the order of 500K–2M tokens in total (input + output across all tools), that’s on the order of **~$0.05–$0.20 per generation** at list price (model and region dependent).  
   - Compare that to your plans (e.g. ₹99/month, ₹199/quarter, ₹999/year) to see if you’re profiting at current rates.

3. **Optional: per-generation token tracking**  
   To know “tokens per edit” and “cost per edit” precisely you would:
   - Have each tool API that uses [lib/aiGateway.ts](lib/aiGateway.ts) include returned `usage` in its response (or log it), and
   - In the generate-mystical API (or a wrapper around the orchestrator), aggregate usage from all tool runs and optionally store it (e.g. Firestore: `profileGenerations/{userId}/runs/{runId}` with `totalPromptTokens`, `totalCompletionTokens`, `estimatedCost`).  
   That would give you exact token usage and cost per generation so you can charge accordingly.

## Summary

- **Token usage:** One “edit” that triggers a new profile = one full pipeline run = many LLM calls across 40+ tools; tokens are used in `aiGateway` (Groq/OpenAI). Ask the Seer (main and per-tool) uses one LLM call per question; main Seer usage is available in the Groq response.
- **Cost today:** Use the Groq (and OpenAI, if used) dashboards; approximate cost per generation and per Seer question from the numbers above.
- **Pricing:** Compare that cost to your subscription tiers (e.g. ₹99/199/999). Per-generation token aggregation (tool APIs return `_usage`, orchestrator sums it, generate-mystical stores in Firestore) gives exact tokens per run for reporting and pricing.
