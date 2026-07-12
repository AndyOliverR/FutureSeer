import 'server-only';

import Groq from 'groq-sdk';
import { assertAiCircuitClosed, recordAiCircuitFailure, recordAiCircuitSuccess } from '@/lib/aiCircuitBreakerControl';
import { devLog } from '@/lib/devLogger';
import {
  executeMainSeerTool,
  isMainSeerToolName,
  MAIN_SEER_TOOL_DEFINITIONS,
} from '@/lib/mainSeerTools';

const MAX_TOOL_ROUNDS = 2;

type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
};

export type SeerChatWithToolsOptions = {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  userId: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
};

export type SeerChatWithToolsResult = {
  content: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  toolCallsExecuted: number;
};

function parseToolArguments(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through
  }
  return {};
}

export async function callSeerChatWithTools(
  options: SeerChatWithToolsOptions,
): Promise<SeerChatWithToolsResult> {
  if (!process.env.GROQ_API_KEY?.trim()) {
    throw new Error('GROQ_API_KEY is required for Seer tool calling');
  }

  await assertAiCircuitClosed();

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const messages: ChatMessage[] = options.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let toolCallsExecuted = 0;
  let lastUsage: SeerChatWithToolsResult['usage'];

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round += 1) {
    const completion = await groq.chat.completions.create({
      model: options.model,
      messages: messages as Parameters<typeof groq.chat.completions.create>[0]['messages'],
      tools: MAIN_SEER_TOOL_DEFINITIONS,
      tool_choice: round < MAX_TOOL_ROUNDS ? 'auto' : 'none',
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
    });

    if (completion.usage) {
      lastUsage = {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      };
    }

    const choice = completion.choices[0];
    const assistantMessage = choice?.message;
    if (!assistantMessage) {
      break;
    }

    const toolCalls = assistantMessage.tool_calls ?? [];
    if (toolCalls.length === 0) {
      await recordAiCircuitSuccess();
      return {
        content: (assistantMessage.content ?? '').trim(),
        usage: lastUsage,
        toolCallsExecuted,
      };
    }

    messages.push({
      role: 'assistant',
      content: assistantMessage.content,
      tool_calls: toolCalls.map((tc) => ({
        id: tc.id,
        type: 'function',
        function: {
          name: tc.function.name,
          arguments: tc.function.arguments ?? '{}',
        },
      })),
    });

    for (const toolCall of toolCalls) {
      const name = toolCall.function.name;
      let result: Record<string, unknown>;
      if (isMainSeerToolName(name)) {
        try {
          result = await executeMainSeerTool(
            name,
            parseToolArguments(toolCall.function.arguments ?? '{}'),
            options.userId,
          );
        } catch (err) {
          devLog.warn('[seerChatWithTools] tool execution failed', { name, err }, 'seerChatWithTools');
          result = { error: 'Tool execution failed' };
        }
      } else {
        result = { error: `Unsupported tool: ${name}` };
      }
      toolCallsExecuted += 1;
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  await recordAiCircuitFailure();
  return {
    content: '',
    usage: lastUsage,
    toolCallsExecuted,
  };
}
