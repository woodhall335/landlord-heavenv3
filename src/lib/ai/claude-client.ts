/**
 * Claude (Anthropic) Client
 *
 * Wrapper for Anthropic API (Claude Sonnet 4)
 * Used for QA validation and advanced reasoning
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeCompletionOptions {
  model?: 'claude-sonnet-4-5-20250929' | 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022';
  temperature?: number;
  max_tokens?: number;
  system?: string;
}

export interface ClaudeCompletionResult {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  model: string;
  cost_usd: number;
  stop_reason: string;
}

// Pricing per 1M tokens (as of Jan 2025)
const PRICING = {
  'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0 },
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
  'claude-3-5-haiku-20241022': { input: 0.8, output: 4.0 },
} as const;

/**
 * Calculate cost in USD based on token usage
 */
function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING['claude-sonnet-4-5-20250929'];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Generate completion using Claude
 */
export async function claudeCompletion(
  messages: ClaudeMessage[],
  options: ClaudeCompletionOptions = {}
): Promise<ClaudeCompletionResult> {
  const {
    model = 'claude-sonnet-4-5-20250929',
    temperature = 1.0,
    max_tokens = 4096,
    system,
  } = options;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens,
      temperature,
      system,
      messages,
    });

    const content = response.content[0];
    const textContent = content.type === 'text' ? content.text : '';

    return {
      content: textContent,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
      cost_usd: calculateCost(response.model, response.usage.input_tokens, response.usage.output_tokens),
      stop_reason: response.stop_reason || 'end_turn',
    };
  } catch (error: any) {
    console.error('Claude API error:', error);
    throw new Error(`Claude API error: ${error.message}`);
  }
}

/**
 * Generate JSON response using Claude with structured output
 */
export async function claudeJsonCompletion<T = any>(
  messages: ClaudeMessage[],
  schema: Record<string, any>,
  options: ClaudeCompletionOptions = {}
): Promise<ClaudeCompletionResult & { json: T }> {
  const {
    model = 'claude-sonnet-4-5-20250929',
    temperature = 1.0,
    max_tokens = 4096,
    system,
  } = options;

  // Add JSON instruction to system prompt
  const jsonSystemPrompt = `${system || ''}\n\nYou must respond with valid JSON only. No other text or explanation.`;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens,
      temperature,
      system: jsonSystemPrompt,
      messages,
    });

    const content = response.content[0];
    const textContent = content.type === 'text' ? content.text : '{}';

    let json: T;
    try {
      json = JSON.parse(textContent);
    } catch (_parseError) {
      throw new Error('Failed to parse JSON response from Claude');
    }

    return {
      content: textContent,
      json,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
      cost_usd: calculateCost(response.model, response.usage.input_tokens, response.usage.output_tokens),
      stop_reason: response.stop_reason || 'end_turn',
    };
  } catch (error: any) {
    console.error('Claude JSON API error:', error);
    throw new Error(`Claude JSON API error: ${error.message}`);
  }
}

/**
 * Stream Claude completion (for real-time UI updates)
 */
export async function* streamClaudeCompletion(
  messages: ClaudeMessage[],
  options: ClaudeCompletionOptions = {}
): AsyncGenerator<string, void, unknown> {
  const {
    model = 'claude-sonnet-4-5-20250929',
    temperature = 1.0,
    max_tokens = 4096,
    system,
  } = options;

  try {
    const stream = await anthropic.messages.create({
      model,
      max_tokens,
      temperature,
      system,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  } catch (error: any) {
    console.error('Claude streaming error:', error);
    throw new Error(`Claude streaming error: ${error.message}`);
  }
}

export { anthropic };
