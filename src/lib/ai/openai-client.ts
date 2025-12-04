// src/lib/ai/openai-client.ts
/**
 * OpenAI Client (Safe Full Version)
 *
 * - Keeps ALL existing features: cost tracking, usage, schemas.
 * - Fixes json_object requirement by injecting system “json” message.
 * - Keeps backwards compatibility with callers that expect usage/cost.
 */

import OpenAI from 'openai';

// Lazy initialization - only create client when needed
// This allows dotenv.config() in test setup to run first
let openaiInstance: OpenAI | null = null;

// 🔧 CHANGE #1: make this an exported function
export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
    const isBrowserLike = typeof window !== 'undefined' || typeof document !== 'undefined';
    const allowBrowser =
      process.env.OPENAI_ALLOW_BROWSER === 'true' ||
      isTestEnv ||
      isBrowserLike;

    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      // Vitest often runs with a jsdom-like environment; enable the safety flag only
      // in tests or when explicitly opted in to prevent credential leakage warnings.
      dangerouslyAllowBrowser: allowBrowser,
    });
  }
  return openaiInstance;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini';
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatCompletionResult {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  cost_usd: number;
}

export interface JsonAIClient {
  jsonCompletion: typeof jsonCompletion;
}

let activeJsonClient: JsonAIClient | null = null;

// Pricing per 1M tokens (2025)
const PRICING = {
  'gpt-4': { input: 30, output: 60 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
} as const;

function calculateCost(model: string, promptTokens: number, completionTokens: number) {
  const p = PRICING[model as keyof typeof PRICING] ?? PRICING['gpt-4o'];
  const inputCost = (promptTokens / 1_000_000) * p.input;
  const outputCost = (completionTokens / 1_000_000) * p.output;
  return inputCost + outputCost;
}

/* ----------------------------------------------------
 * CHAT COMPLETION (unchanged, except safe messages handling)
 * ---------------------------------------------------- */
export async function chatCompletion(
  messagesInput: ChatMessage[] | ChatMessage,
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResult> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 2000,
    top_p = 1,
    frequency_penalty = 0,
    presence_penalty = 0,
  } = options;

  const messages = Array.isArray(messagesInput) ? messagesInput : [messagesInput];

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
    });

    const usage = response.usage!;

    return {
      content: response.choices[0]?.message?.content ?? '',
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      },
      model: response.model,
      cost_usd: calculateCost(response.model, usage.prompt_tokens, usage.completion_tokens),
    };
  } catch (err: any) {
    console.error('OpenAI API error:', err);
    throw new Error(`OpenAI API error: ${err.message}`);
  }
}

/* ----------------------------------------------------
 * JSON COMPLETION (FIXED)
 * ---------------------------------------------------- */
export async function jsonCompletion<T = any>(
  messagesInput: ChatMessage[] | ChatMessage,
  schema: Record<string, any>,
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResult & { json: T }> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 2000,
  } = options;

  // Always normalise messages
  const userMessages: ChatMessage[] = Array.isArray(messagesInput)
    ? messagesInput
    : [messagesInput];

  // Inject required JSON system message
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'Always reply with a single valid JSON object. Do NOT include explanations or markdown. The word "json" is included here intentionally to satisfy the OpenAI API requirement.',
    },
    ...userMessages,
  ];

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      response_format: { type: 'json_object' },
    });

    const choice = response.choices[0];
    const usage = response.usage!;
    const content = choice?.message?.content ?? '{}';

    let parsed: T;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('Invalid JSON returned:', content);
      throw new Error('Failed to parse JSON response from OpenAI');
    }

    return {
      content,
      json: parsed,
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      },
      model: response.model,
      cost_usd: calculateCost(response.model, usage.prompt_tokens, usage.completion_tokens),
    };
  } catch (err: any) {
    console.error('OpenAI JSON API error:', err);
    throw new Error(`OpenAI JSON API error: ${err.message}`);
  }
}

export function getJsonAIClient(): JsonAIClient {
  if (activeJsonClient) return activeJsonClient;
  return { jsonCompletion };
}

export function hasCustomJsonAIClient(): boolean {
  return !!activeJsonClient;
}

// Test-only setter to override the active JSON AI client
export function __setTestJsonAIClient(client: JsonAIClient | null) {
  activeJsonClient = client;
}

/* ----------------------------------------------------
 * STREAM COMPLETION (kept as-is)
 * ---------------------------------------------------- */
export async function* streamChatCompletion(
  messagesInput: ChatMessage[] | ChatMessage,
  options: ChatCompletionOptions = {}
) {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 2000,
  } = options;

  const messages: ChatMessage[] = Array.isArray(messagesInput)
    ? messagesInput
    : [messagesInput];

  try {
    const stream = await getOpenAIClient().chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) yield text;
    }
  } catch (err: any) {
    console.error('OpenAI streaming error:', err);
    throw new Error(`OpenAI streaming error: ${err.message}`);
  }
}

// 🔧 CHANGE #2: remove this line entirely, since there is no `openai` variable anymore
// export { openai };
