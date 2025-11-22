/**
 * OpenAI Client
 *
 * Wrapper for OpenAI API (GPT-4, GPT-4-mini)
 * Used for fact-finding wizard and document generation assistance
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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

// Pricing per 1M tokens (as of Jan 2025)
const PRICING = {
  'gpt-4': { input: 30.0, output: 60.0 },
  'gpt-4-turbo': { input: 10.0, output: 30.0 },
  'gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
} as const;

/**
 * Calculate cost in USD based on token usage
 */
function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING['gpt-4o'];
  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Generate chat completion using OpenAI
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResult> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 2000,
    top_p = 1.0,
    frequency_penalty = 0.0,
    presence_penalty = 0.0,
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
    });

    const choice = response.choices[0];
    const usage = response.usage!;

    return {
      content: choice.message.content || '',
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      },
      model: response.model,
      cost_usd: calculateCost(response.model, usage.prompt_tokens, usage.completion_tokens),
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Generate JSON response using OpenAI with structured output
 */
export async function jsonCompletion<T = any>(
  messages: ChatMessage[],
  schema: Record<string, any>,
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResult & { json: T }> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 2000,
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      response_format: { type: 'json_object' },
    });

    const choice = response.choices[0];
    const usage = response.usage!;
    const content = choice.message.content || '{}';

    let json: T;
    try {
      json = JSON.parse(content);
    } catch (parseError) {
      throw new Error('Failed to parse JSON response from OpenAI');
    }

    return {
      content,
      json,
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      },
      model: response.model,
      cost_usd: calculateCost(response.model, usage.prompt_tokens, usage.completion_tokens),
    };
  } catch (error: any) {
    console.error('OpenAI JSON API error:', error);
    throw new Error(`OpenAI JSON API error: ${error.message}`);
  }
}

/**
 * Stream chat completion (for real-time UI updates)
 */
export async function* streamChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): AsyncGenerator<string, void, unknown> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 2000,
  } = options;

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    console.error('OpenAI streaming error:', error);
    throw new Error(`OpenAI streaming error: ${error.message}`);
  }
}

export { openai };
