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
import { devLog } from '@/lib/devLogger';
import Groq from 'groq-sdk';
import OpenAI from 'openai';

// Check if AI Gateway is available
const isGatewayAvailable = () => {
  return !!process.env.AI_GATEWAY_API_KEY;
};

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

interface AIStreamOptions {
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

interface AICompletionOptions extends AIStreamOptions {
  stream?: false;
}

/**
 * Create a streaming AI response using AI Gateway or direct SDK
 * Returns a Groq-compatible async iterable stream
 */
export async function createAIStream(options: AIStreamOptions): Promise<AsyncIterable<{
  choices: Array<{ delta: { content?: string } }>;
}>> {
  if (isGatewayAvailable()) {
    try {
      const gatewayModel = mapModelToGateway(options.model);
      const result = await streamText({
        model: gatewayModel as unknown as Parameters<typeof streamText>[0]['model'],
        messages: options.messages as Parameters<typeof streamText>[0]['messages'],
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        topP: options.topP,
        frequencyPenalty: options.frequencyPenalty,
        presencePenalty: options.presencePenalty,
      });

      // Convert AI SDK stream to Groq-compatible format
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

    const stream = await groq.chat.completions.create({
      model: modelName,
      messages: options.messages as Parameters<typeof groq.chat.completions.create>[0]['messages'],
      stream: true,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      response_format: options.responseFormat || options.response_format,
    });

    return stream as AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>;
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const stream = await openai.chat.completions.create({
      model: modelName,
      messages: options.messages as Parameters<typeof openai.chat.completions.create>[0]['messages'],
      stream: true,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      response_format: options.responseFormat || options.response_format,
    });

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
 * Create a non-streaming AI completion using AI Gateway or direct SDK
 */
export async function createAICompletion(options: AICompletionOptions): Promise<{
  content: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  finishReason?: string;
}> {
  if (isGatewayAvailable()) {
    try {
      const gatewayModel = mapModelToGateway(options.model);
      const result = await generateText({
        model: gatewayModel as unknown as Parameters<typeof generateText>[0]['model'],
        messages: options.messages as Parameters<typeof generateText>[0]['messages'],
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        topP: options.topP,
        frequencyPenalty: options.frequencyPenalty,
        presencePenalty: options.presencePenalty,
      });

      return {
        content: result.text,
        usage: result.usage ? {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
        } : undefined,
        finishReason: result.finishReason,
      };
    } catch (error) {
      devLog.error('AI Gateway error, falling back to direct SDK:', error, 'aiGateway');
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

    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: options.messages as Parameters<typeof groq.chat.completions.create>[0]['messages'],
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      response_format: options.responseFormat || options.response_format,
    });

    const content = completion.choices[0]?.message?.content || '';
    return {
      content,
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined,
      finishReason: completion.choices[0]?.finish_reason,
    };
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: options.messages as Parameters<typeof openai.chat.completions.create>[0]['messages'],
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      response_format: options.responseFormat || options.response_format,
    });

    const content = completion.choices[0]?.message?.content || '';
    return {
      content,
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined,
      finishReason: completion.choices[0]?.finish_reason,
    };
  }
}


