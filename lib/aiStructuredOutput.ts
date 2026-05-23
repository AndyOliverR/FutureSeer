/**
 * Control layer for structured LLM JSON outputs: parse, validate, retry with mutation hints.
 * Use for comprehensive reports and any route that parses JSON before Firestore writes.
 */

import {
  createAICompletion,
  createAIStream,
  type AICompletionOptions,
  type AIStreamOptions,
} from '@/lib/aiGateway';
import type { AiReportSource } from '@/lib/aiFallbackRouter';
import { isAiCircuitOpen } from '@/lib/aiCircuitBreakerControl';
import { devLog } from '@/lib/devLogger';
import { SEER_INPUT_BLOCKED_MESSAGE, validateSeerInput } from '@/lib/seerInputGuard';
import {
  normalizeForInjectionScan,
  scoreInjectionRisk,
} from '@/lib/seerInjectionClassifier';
import type { SeerQuestionCacheConfig } from '@/lib/seerQuestionCacheTypes';
import { resolveToolSeerQuestionCache } from '@/lib/toolSeerQuestionCache';
import {
  parseLlmJsonRecord,
  parseStructuredJsonFromResponse,
  validateStructuredPayload,
  type StructuredFailureMode,
  type StructuredOutputSchema,
} from '@/lib/aiStructuredOutputParse';

export type { StructuredFailureMode, StructuredOutputSchema } from '@/lib/aiStructuredOutputParse';
export {
  parseLlmJsonRecord,
  parseStructuredJsonFromResponse,
  validateStructuredPayload,
} from '@/lib/aiStructuredOutputParse';

export interface StructuredAIResult<T = Record<string, unknown>> {
  ok: boolean;
  data?: T;
  raw?: Record<string, unknown>;
  failureMode: StructuredFailureMode;
  attempts: number;
  lastRaw?: string;
}

const MUTATION_HINTS: Partial<Record<StructuredFailureMode, string>> = {
  schema_violation:
    'Return ONLY a valid JSON object. Start with { and end with }. No markdown fencing, preamble, or commentary.',
  json_parse_error:
    'Your previous reply was not valid JSON. Return a single JSON object only — no code fences or text before/after.',
  constraint_violation:
    'Re-read every numbered constraint in the prompt. Each is a hard requirement, not a suggestion.',
  empty_response: 'Respond with a complete JSON object matching the requested structure.',
};

function jitteredDelayMs(attemptIndex: number): number {
  const base = [0, 400, 900][attemptIndex] ?? 1200;
  const jitter = Math.floor(Math.random() * 120);
  return base + jitter;
}

function mutationHintFor(mode: StructuredFailureMode): string | undefined {
  return MUTATION_HINTS[mode];
}

function shouldRetryStructured(mode: StructuredFailureMode, attempt: number, maxAttempts: number): boolean {
  if (attempt >= maxAttempts) return false;
  if (mode === 'prompt_injection' || mode === 'circuit_open' || mode === 'provider_error') {
    return false;
  }
  return mode !== 'none';
}

function appendMutationHint(
  messages: AICompletionOptions['messages'],
  hint: string,
): AICompletionOptions['messages'] {
  return [
    ...messages,
    {
      role: 'user',
      content: `Constraints (correction — hard requirements):\n${hint}`,
    },
  ];
}

export interface CallStructuredAIOptions {
  label: string;
  model: string;
  messages: AICompletionOptions['messages'];
  temperature?: number;
  maxTokens?: number;
  maxAttempts?: number;
  schema?: StructuredOutputSchema;
  /** When set, runs InputGuard on this text before any LLM call. */
  guardUserText?: string;
  userId?: string;
  responseFormat?: { type: 'json_object' };
  /** Default true. Set false for prose-only completions (use callTextAI instead). */
  jsonObjectMode?: boolean;
}

export interface StructuredReportRunResult {
  raw: Record<string, unknown> | null;
  attempts: number;
  failureMode: StructuredFailureMode;
  lastRaw?: string;
}

export interface CallTextAIOptions {
  label: string;
  model: string;
  messages: AICompletionOptions['messages'];
  temperature?: number;
  maxTokens?: number;
  maxAttempts?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  userId?: string;
}

export interface TextAIResult {
  content: string;
  attempts: number;
  failureMode: StructuredFailureMode;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export type TextStreamChunk = {
  choices: Array<{ delta: { content?: string } }>;
};

export type { SeerQuestionCacheConfig } from '@/lib/seerQuestionCacheTypes';

export interface CallTextStreamOptions {
  label: string;
  model: string;
  messages: AIStreamOptions['messages'];
  temperature?: number;
  maxTokens?: number;
  maxAttempts?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  /**
   * When set, runs InputGuard before opening a provider stream.
   * Tool Ask-the-Seer routes should use `enforceToolSeerGate` instead (central guard).
   */
  guardUserText?: string;
  userId?: string;
  /** Similar-question cache (Admin Firestore). Requires `userId`. */
  questionCache?: SeerQuestionCacheConfig;
  /** Question text for auto cache resolve when `questionCache` omitted (tool `ask-*-seer` labels). */
  cacheQuestion?: string;
  /** When true and circuit is open, return a cached similar answer if found. Default true when cache is active. */
  fallbackToQuestionCacheOnCircuitOpen?: boolean;
}

function auditControlLayerCall(params: {
  label: string;
  kind: 'structured' | 'text' | 'stream';
  userId?: string;
  attempts: number;
  failureMode: StructuredFailureMode;
  passed: boolean;
  latencyMs: number;
  usage?: TextAIResult['usage'];
  fallbackSource?: AiReportSource;
  injectionScore?: number;
  injectionReasons?: string[];
}): void {
  void import('@/lib/aiAuditEvents')
    .then(({ recordAiAuditEvent }) => {
      recordAiAuditEvent({
        label: params.label,
        kind: params.kind,
        userId: params.userId,
        attempts: params.attempts,
        failureMode: params.failureMode,
        passed: params.passed,
        latencyMs: params.latencyMs,
        fallbackSource: params.fallbackSource,
        injectionScore: params.injectionScore,
        injectionReasons: params.injectionReasons,
        promptTokens: params.usage?.promptTokens,
        completionTokens: params.usage?.completionTokens,
        totalTokens: params.usage?.totalTokens,
      });
    })
    .catch((err) => {
      devLog.warn('[aiStructuredOutput] audit event skipped', err, 'aiStructuredOutput');
    });
}

async function resolveQuestionCacheHit(
  options: CallTextStreamOptions,
): Promise<{ answer: string } | null> {
  const cache = resolveToolSeerQuestionCache(options);
  const userId = options.userId;
  if (!cache || !userId) return null;

  const { findCachedSeerAnswer } = await import('@/lib/seerQuestionCache');
  return findCachedSeerAnswer({
    userId,
    collectionName: cache.collectionName,
    question: cache.question,
    keywords: cache.keywords,
    similarityThreshold: cache.similarityThreshold,
  });
}

function questionCacheStreamResult(
  options: CallTextStreamOptions,
  answer: string,
  started: number,
  fallbackSource: AiReportSource,
  failureMode: StructuredFailureMode,
): TextStreamResult {
  const result: TextStreamResult = {
    stream: staticTextStream(answer),
    attempts: 0,
    failureMode,
    fromQuestionCache: true,
  };
  auditControlLayerCall({
    label: options.label,
    kind: 'stream',
    userId: options.userId,
    attempts: 0,
    failureMode,
    passed: true,
    latencyMs: Date.now() - started,
    fallbackSource,
  });
  return result;
}

export interface TextStreamResult {
  stream: AsyncIterable<TextStreamChunk>;
  attempts: number;
  failureMode: StructuredFailureMode;
  /** True when response text came from similar-question cache, not the LLM. */
  fromQuestionCache?: boolean;
}

function staticTextStream(text: string): AsyncIterable<TextStreamChunk> {
  return {
    async *[Symbol.asyncIterator]() {
      yield { choices: [{ delta: { content: text } }] };
    },
  };
}

function chunkHasText(chunk: TextStreamChunk): boolean {
  const content = chunk.choices[0]?.delta?.content;
  return typeof content === 'string' && content.length > 0;
}

/**
 * Lazy stream with transport + empty-stream retries (retries only before yielding content).
 */
function createRetryingTextStream(
  options: CallTextStreamOptions,
  maxAttempts: number,
  onAttemptResolved: (attempts: number) => void,
): AsyncIterable<TextStreamChunk> {
  const { label, model, messages, temperature, maxTokens, topP, frequencyPenalty, presencePenalty } =
    options;

  return {
    async *[Symbol.asyncIterator]() {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (attempt > 1) {
          await new Promise((r) => setTimeout(r, jitteredDelayMs(attempt - 1)));
        }
        try {
          const inner = await createAIStream({
            model,
            messages,
            temperature,
            maxTokens,
            topP,
            frequencyPenalty,
            presencePenalty,
          });
          let hasContent = false;
          for await (const chunk of inner) {
            if (chunkHasText(chunk)) hasContent = true;
            yield chunk;
          }
          if (hasContent) {
            onAttemptResolved(attempt);
            return;
          }
          devLog.warn(
            `[${label}] attempt ${attempt} stream had no text deltas`,
            undefined,
            'aiStructuredOutput',
          );
        } catch (err: unknown) {
          const code =
            err && typeof err === 'object' && 'code' in err
              ? String((err as { code?: string }).code)
              : '';
          if (code === 'AI_CIRCUIT_OPEN') {
            throw err;
          }
          devLog.warn(`[${label}] attempt ${attempt} stream error`, err, 'aiStructuredOutput');
          if (attempt >= maxAttempts) {
            throw err instanceof Error ? err : new Error(String(err));
          }
        }
      }
      onAttemptResolved(maxAttempts);
      const emptyErr = new Error(
        `[${label}] stream completed with no content after ${maxAttempts} attempts`,
      ) as Error & { code: string };
      emptyErr.code = 'EMPTY_TEXT_STREAM';
      throw emptyErr;
    },
  };
}

/**
 * Streaming prose for Ask-the-Seer routes: input guard, circuit breaker (via aiGateway),
 * transport retries, and empty-stream retries before any token is yielded.
 */
export async function callTextStream(options: CallTextStreamOptions): Promise<TextStreamResult> {
  const started = Date.now();
  const maxAttempts = options.maxAttempts ?? 2;
  const effectiveCache = resolveToolSeerQuestionCache(options);
  const useCircuitCacheFallback =
    options.fallbackToQuestionCacheOnCircuitOpen ?? effectiveCache != null;

  if (effectiveCache && options.userId) {
    const cached = await resolveQuestionCacheHit(options);
    if (cached?.answer) {
      devLog.info(
        `[${options.label}] question cache hit`,
        undefined,
        'aiStructuredOutput',
      );
      return questionCacheStreamResult(
        options,
        cached.answer,
        started,
        'question_cache',
        'none',
      );
    }
  }

  if (useCircuitCacheFallback && (await isAiCircuitOpen())) {
    const cached = await resolveQuestionCacheHit(options);
    if (cached?.answer) {
      devLog.warn(
        `[${options.label}] circuit open — serving question cache`,
        undefined,
        'aiStructuredOutput',
      );
      return questionCacheStreamResult(
        options,
        cached.answer,
        started,
        'question_cache',
        'circuit_open',
      );
    }
  }

  if (options.guardUserText !== undefined) {
    const guard = validateSeerInput(options.guardUserText);
    if (guard.outcome === 'blocked') {
      devLog.warn(
        `[${options.label}] input guard blocked: ${guard.reason}`,
        undefined,
        'aiStructuredOutput',
      );
      const { score, reasons } = scoreInjectionRisk(
        normalizeForInjectionScan(options.guardUserText),
      );
      const blocked: TextStreamResult = {
        stream: staticTextStream(SEER_INPUT_BLOCKED_MESSAGE),
        attempts: 0,
        failureMode: 'prompt_injection',
      };
      auditControlLayerCall({
        label: options.label,
        kind: 'stream',
        userId: options.userId,
        attempts: 0,
        failureMode: 'prompt_injection',
        passed: false,
        latencyMs: Date.now() - started,
        injectionScore: guard.injectionScore ?? score,
        injectionReasons: guard.injectionReasons ?? reasons,
      });
      return blocked;
    }
  }

  let resolvedAttempts = 0;
  const stream = createRetryingTextStream(options, maxAttempts, (attempts) => {
    resolvedAttempts = attempts;
  });

  const result: TextStreamResult = {
    stream,
    attempts: resolvedAttempts || 1,
    failureMode: 'none',
  };
  auditControlLayerCall({
    label: options.label,
    kind: 'stream',
    userId: options.userId,
    attempts: result.attempts,
    failureMode: result.failureMode,
    passed: true,
    latencyMs: Date.now() - started,
  });
  return result;
}

/**
 * One-shot structured report call: retries + returns parsed JSON record when possible.
 */
export async function runStructuredReportAI(
  options: CallStructuredAIOptions,
): Promise<StructuredReportRunResult> {
  const structured = await callStructuredAI(options);
  if (structured.raw) {
    return {
      raw: structured.raw,
      attempts: structured.attempts,
      failureMode: structured.failureMode,
      lastRaw: structured.lastRaw,
    };
  }
  const recovered = structured.lastRaw ? parseLlmJsonRecord(structured.lastRaw) : null;
  return {
    raw: recovered,
    attempts: structured.attempts,
    failureMode: structured.failureMode,
    lastRaw: structured.lastRaw,
  };
}

/**
 * Prose/text LLM calls with empty-response retry (circuit breaker via aiGateway).
 */
export async function callTextAI(options: CallTextAIOptions): Promise<TextAIResult> {
  const started = Date.now();
  const maxAttempts = options.maxAttempts ?? 2;
  const { label, model, messages, temperature, maxTokens, topP, frequencyPenalty, presencePenalty } =
    options;

  const finish = (result: TextAIResult): TextAIResult => {
    auditControlLayerCall({
      label: options.label,
      kind: 'text',
      userId: options.userId,
      attempts: result.attempts,
      failureMode: result.failureMode,
      passed: result.failureMode === 'none' && result.content.length > 0,
      latencyMs: Date.now() - started,
      usage: result.usage,
    });
    return result;
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      await new Promise((r) => setTimeout(r, jitteredDelayMs(attempt - 1)));
    }
    try {
      const result = await createAICompletion({
        model,
        messages,
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
      });
      const content = (result.content ?? '').trim();
      if (content) {
        return finish({
          content,
          attempts: attempt,
          failureMode: 'none',
          usage: result.usage,
        });
      }
      devLog.warn(`[${label}] attempt ${attempt} empty prose response`, undefined, 'aiStructuredOutput');
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code?: string }).code)
          : '';
      if (code === 'AI_CIRCUIT_OPEN') {
        return finish({ content: '', attempts: attempt, failureMode: 'circuit_open' });
      }
      devLog.warn(`[${label}] attempt ${attempt} provider error`, err, 'aiStructuredOutput');
      if (attempt >= maxAttempts) {
        return finish({ content: '', attempts: attempt, failureMode: 'provider_error' });
      }
    }
  }

  return finish({ content: '', attempts: maxAttempts, failureMode: 'empty_response' });
}

/**
 * Calls the LLM up to maxAttempts times, validating JSON + schema after each response.
 */
export async function callStructuredAI<T = Record<string, unknown>>(
  options: CallStructuredAIOptions,
): Promise<StructuredAIResult<T>> {
  const started = Date.now();
  const maxAttempts = options.maxAttempts ?? 3;
  const { label, model, temperature, maxTokens, schema, responseFormat } = options;

  const finish = <R extends StructuredAIResult<T>>(result: R): R => {
    auditControlLayerCall({
      label: options.label,
      kind: 'structured',
      userId: options.userId,
      attempts: result.attempts,
      failureMode: result.failureMode,
      passed: result.ok,
      latencyMs: Date.now() - started,
    });
    return result;
  };

  if (options.guardUserText !== undefined) {
    const guard = validateSeerInput(options.guardUserText);
    if (guard.outcome === 'blocked') {
      devLog.warn(`[${label}] input guard blocked: ${guard.reason}`, undefined, 'aiStructuredOutput');
      return finish({
        ok: false,
        failureMode: 'prompt_injection',
        attempts: 0,
      });
    }
  }

  let messages = options.messages;
  let lastFailure: StructuredFailureMode = 'provider_error';
  let lastRaw: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      await new Promise((r) => setTimeout(r, jitteredDelayMs(attempt - 1)));
    }

    try {
      const result = await createAICompletion({
        model,
        messages,
        temperature,
        maxTokens,
        ...(options.jsonObjectMode === false
          ? {}
          : { responseFormat: responseFormat ?? { type: 'json_object' } }),
      });

      lastRaw = result.content ?? '';
      const parsed = parseStructuredJsonFromResponse(lastRaw);

      if (!parsed.ok || !parsed.data) {
        lastFailure = parsed.failureMode;
        const hint = mutationHintFor(parsed.failureMode);
        if (hint && shouldRetryStructured(parsed.failureMode, attempt, maxAttempts)) {
          messages = appendMutationHint(messages, hint);
          devLog.warn(
            `[${label}] attempt ${attempt} parse failed (${parsed.failureMode}), retrying`,
            undefined,
            'aiStructuredOutput',
          );
          continue;
        }
        return finish({
          ok: false,
          failureMode: parsed.failureMode,
          attempts: attempt,
          lastRaw,
        });
      }

      const validationMode = validateStructuredPayload(parsed.data, schema);
      if (validationMode !== 'none') {
        lastFailure = validationMode;
        const hint = mutationHintFor(validationMode);
        if (hint && shouldRetryStructured(validationMode, attempt, maxAttempts)) {
          messages = appendMutationHint(messages, hint);
          devLog.warn(
            `[${label}] attempt ${attempt} schema failed, retrying`,
            undefined,
            'aiStructuredOutput',
          );
          continue;
        }
        return finish({
          ok: false,
          raw: parsed.data,
          failureMode: validationMode,
          attempts: attempt,
          lastRaw,
        });
      }

      return finish({
        ok: true,
        data: parsed.data as T,
        raw: parsed.data,
        failureMode: 'none',
        attempts: attempt,
        lastRaw,
      });
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code?: string }).code)
          : '';
      if (code === 'AI_CIRCUIT_OPEN') {
        return finish({ ok: false, failureMode: 'circuit_open', attempts: attempt });
      }
      lastFailure = 'provider_error';
      devLog.warn(`[${label}] attempt ${attempt} provider error`, err, 'aiStructuredOutput');
      if (attempt >= maxAttempts) {
        return finish({ ok: false, failureMode: 'provider_error', attempts: attempt, lastRaw });
      }
    }
  }

  return finish({
    ok: false,
    failureMode: lastFailure,
    attempts: maxAttempts,
    lastRaw,
  });
}
