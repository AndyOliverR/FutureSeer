/**
 * AI Gateway Client Utility
 * 
 * Centralized client for Vercel AI Gateway that provides:
 * - Unified API for streaming and non-streaming AI calls
 * - Automatic fallback to direct provider SDKs
 * - Model name mapping (provider/model format)
 * - Support for JSON response format
 */

import { streamText, generateText } from 'ai';
import {
  assertAiCircuitClosed,
  recordAiCircuitFailure,
  recordAiCircuitSuccess,
} from '@/lib/aiCircuitBreakerControl';
import { devLog } from '@/lib/devLogger';
import Groq from 'groq-sdk';
import OpenAI from 'openai';

// Check if AI Gateway is available
const isGatewayAvailable = () => {
  return !!process.env.AI_GATEWAY_API_KEY;
};

const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 3000];

function retryDelayMs(attemptIndex: number): number {
  const base = RETRY_DELAYS[attemptIndex] ?? 3000;
  return base + Math.floor(Math.random() * 200);
}

function makeRateLimitedError(): Error & { code: string; status: number } {
  const err = new Error('Our AI service is currently busy. Please wait a moment and try again.') as Error & {
    code: string;
    status: number;
  };
  err.code = 'AI_RATE_LIMITED';
  err.status = 429;
  return err;
}

/**
 * Retry wrapper for AI SDK calls. Retries on transient errors (429 rate
 * limit, 5xx server errors, network timeouts). Returns the result on
 * success, throws on permanent failures or after all retries exhausted.
 */
async function withRetry<T>(fn: () => Promise<T>, label = 'AI call'): Promise<T> {
  await assertAiCircuitClosed();
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await fn();
      await recordAiCircuitSuccess();
      return result;
    } catch (err: any) {
      lastError = err;
      if (err?.code === 'AI_CIRCUIT_OPEN') {
        throw err;
      }
      const status = err?.status ?? err?.statusCode ?? err?.error?.status;
      const isRetryable =
        status === 429 ||
        (status >= 500 && status < 600) ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'ETIMEDOUT' ||
        err?.message?.includes('timeout');

      if (!isRetryable || attempt === MAX_RETRIES) {
        await recordAiCircuitFailure();
        if (status === 429) {
          throw makeRateLimitedError();
        }
        throw err;
      }
      const delay = retryDelayMs(attempt);
      devLog.warn(`${label} attempt ${attempt + 1} failed (status=${status}), retrying in ${delay}ms`, 'aiGateway');
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// Map model names to AI Gateway format (provider/model)
const mapModelToGateway = (model: string): string => {
  // If already in provider/model format, return as-is
  if (model.includes('/')) {
    return `groq/${model}`;
  }
  
  // Map common models
  if (model === 'llama-3.3-70b-versatile') {
    return 'groq/llama-3.3-70b-versatile';
  }
  if (model === 'llama-3.1-8b-instant') {
    return 'groq/llama-3.1-8b-instant';
  }
  if (model === 'gpt-4' || model === 'gpt-4o' || model === 'gpt-4-turbo') {
    return `openai/${model}`;
  }
  if (model === 'gpt-4o-mini') {
    return 'openai/gpt-4o-mini';
  }
  
  // Default: assume Groq for unknown models
  return `groq/${model}`;
};

// Map model back to provider SDK format
const getProviderFromModel = (model: string): 'groq' | 'openai' => {
  if (model.startsWith('openai/') || model === 'gpt-4' || model === 'gpt-4o' || model === 'gpt-4-turbo' || model === 'gpt-4o-mini') {
    return 'openai';
  }
  return 'groq';
};

export interface AIStreamOptions {
  model: string;
  messages: Array<{ 
    role: 'system' | 'user' | 'assistant'; 
    content: string | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: { url: string };
    }>
  }>;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  responseFormat?: { type: 'json_object' };
  response_format?: { type: 'json_object' };
}

export interface AICompletionOptions extends AIStreamOptions {
  stream?: false;
}

async function recordProviderOutcome(success: boolean): Promise<void> {
  if (success) {
    await recordAiCircuitSuccess();
  } else {
    await recordAiCircuitFailure();
  }
}

/**
 * Create a streaming AI response using AI Gateway or direct SDK
 * Returns a Groq-compatible async iterable stream
 */
export async function createAIStream(options: AIStreamOptions): Promise<AsyncIterable<{
  choices: Array<{ delta: { content?: string } }>;
}>> {
  await assertAiCircuitClosed();
  if (isGatewayAvailable()) {
    try {
      const gatewayModel = mapModelToGateway(options.model);
      const result = await streamText({
        model: gatewayModel as unknown as Parameters<typeof streamText>[0]['model'],
        messages: options.messages as Parameters<typeof streamText>[0]['messages'],
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature,
        topP: options.topP,
        frequencyPenalty: options.frequencyPenalty,
        presencePenalty: options.presencePenalty,
      } as Parameters<typeof streamText>[0]);

      // Convert AI SDK stream to Groq-compatible format
      await recordAiCircuitSuccess();
      return {
        async *[Symbol.asyncIterator]() {
          for await (const chunk of result.textStream as AsyncIterable<string>) {
            yield {
              choices: [{
                delta: { content: chunk }
              }]
            };
          }
        }
      };
    } catch (error) {
      devLog.error('AI Gateway error, falling back to direct SDK:', error, 'aiGateway');
      await recordProviderOutcome(false);
      // Fall through to direct SDK
    }
  }

  // Fallback to direct SDK
  const provider = getProviderFromModel(options.model);
  
  // Extract model name: strip provider prefixes (groq/, openai/) but keep vendor prefixes (meta-llama/)
  let modelName = options.model;
  if (options.model.startsWith('groq/')) {
    modelName = options.model.substring(5); // Remove "groq/" prefix
  } else if (options.model.startsWith('openai/')) {
    modelName = options.model.substring(7); // Remove "openai/" prefix
  }
  // Keep meta-llama/ and other vendor prefixes intact

  if (provider === 'groq') {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const stream = await withRetry(() => groq.chat.completions.create({
      model: modelName,
      messages: options.messages as Parameters<typeof groq.chat.completions.create>[0]['messages'],
      stream: true,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      response_format: options.responseFormat || options.response_format,
    }), 'Groq streaming');

    return stream as AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>;
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const stream = await withRetry(() => openai.chat.completions.create({
      model: modelName,
      messages: options.messages as Parameters<typeof openai.chat.completions.create>[0]['messages'],
      stream: true,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      response_format: options.responseFormat || options.response_format,
    }), 'OpenAI streaming');

    // Convert OpenAI stream to Groq-compatible format
    return {
      async *[Symbol.asyncIterator]() {
        for await (const chunk of stream as AsyncIterable<{ choices: Array<{ delta?: { content?: string } }> }>) {
          yield {
            choices: [{
              delta: { content: chunk.choices[0]?.delta?.content || '' }
            }]
          };
        }
      }
    };
  }
}

/**
 * Create a non-streaming AI completion using AI Gateway or direct SDK.
 * Do not add Firestore / Firebase Admin or other server-only usage logging here — this module is imported from client code paths; log in API routes instead.
 */
export async function createAICompletion(options: AICompletionOptions): Promise<{
  content: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  finishReason?: string;
}> {
  await assertAiCircuitClosed();
  if (isGatewayAvailable()) {
    try {
      const gatewayModel = mapModelToGateway(options.model);
      const result = await generateText({
        model: gatewayModel as unknown as Parameters<typeof generateText>[0]['model'],
        messages: options.messages as Parameters<typeof generateText>[0]['messages'],
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature,
        topP: options.topP,
        frequencyPenalty: options.frequencyPenalty,
        presencePenalty: options.presencePenalty,
      } as Parameters<typeof generateText>[0]);

      // `LanguageModelUsage` shape varies by `ai` / provider typings (inputTokens vs promptTokens, etc.).
      const u = result.usage as unknown as {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
        promptTokens?: number;
        completionTokens?: number;
      } | undefined;
      const out = {
        content: result.text,
        usage: u
          ? {
              promptTokens: u.promptTokens ?? u.inputTokens ?? 0,
              completionTokens: u.completionTokens ?? u.outputTokens ?? 0,
              totalTokens:
                u.totalTokens ??
                (u.promptTokens ?? u.inputTokens ?? 0) +
                  (u.completionTokens ?? u.outputTokens ?? 0),
            }
          : undefined,
        finishReason: result.finishReason,
      };
      await recordAiCircuitSuccess();
      return out;
    } catch (error) {
      devLog.error('AI Gateway error, falling back to direct SDK:', error, 'aiGateway');
      await recordProviderOutcome(false);
      // Fall through to direct SDK
    }
  }

  // Fallback to direct SDK
  try {
  const provider = getProviderFromModel(options.model);
  
  // Extract model name: strip provider prefixes (groq/, openai/) but keep vendor prefixes (meta-llama/)
  let modelName = options.model;
  if (options.model.startsWith('groq/')) {
    modelName = options.model.substring(5); // Remove "groq/" prefix
  } else if (options.model.startsWith('openai/')) {
    modelName = options.model.substring(7); // Remove "openai/" prefix
  }
  // Keep meta-llama/ and other vendor prefixes intact

  if (provider === 'groq') {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await withRetry(() => groq.chat.completions.create({
      model: modelName,
      messages: options.messages as Parameters<typeof groq.chat.completions.create>[0]['messages'],
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      response_format: options.responseFormat || options.response_format,
    }), 'Groq completion');

    const content = completion.choices[0]?.message?.content || '';
    const out = {
      content,
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined,
      finishReason: completion.choices[0]?.finish_reason,
    };
    await recordAiCircuitSuccess();
    return out;
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('AI service is temporarily unavailable. Please try again later.');
  }
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openaiCompletion = await withRetry(
    () =>
      openai.chat.completions.create({
        model: modelName,
        messages: options.messages as Parameters<typeof openai.chat.completions.create>[0]['messages'],
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        response_format: options.responseFormat || options.response_format,
      }),
    'OpenAI completion'
  );

  const openaiContent = openaiCompletion.choices[0]?.message?.content || '';
  const openaiOut = {
    content: openaiContent,
    usage: openaiCompletion.usage
      ? {
          promptTokens: openaiCompletion.usage.prompt_tokens,
          completionTokens: openaiCompletion.usage.completion_tokens,
          totalTokens: openaiCompletion.usage.total_tokens,
        }
      : undefined,
    finishReason: openaiCompletion.choices[0]?.finish_reason,
  };
  await recordAiCircuitSuccess();
  return openaiOut;
  } catch (error) {
    await recordProviderOutcome(false);
    throw error;
  }
}


