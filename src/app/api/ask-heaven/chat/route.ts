// src/app/api/ask-heaven/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonCompletion } from '@/lib/ai';
import type { ChatMessage, ChatCompletionOptions } from '@/lib/ai';
import { ASK_HEAVEN_BASE_SYSTEM_PROMPT } from '@/lib/ai/ask-heaven';
import { rateLimiters } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const chatSchema = z.object({
  case_id: z.string().optional(),
  case_type: z.enum(['eviction', 'money_claim', 'tenancy_agreement']).optional(),
  jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']).optional(),
  product: z
    .enum(['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'])
    .optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
      }),
    )
    .min(1),
  // Email gate parameters (optional for backward compatibility)
  messageCount: z.number().optional(),
  emailCaptured: z.boolean().optional(),
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Apply rate limiting for AI endpoints
    const rateLimitResult = await rateLimiters.wizard(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          },
        }
      );
    }

    const json = await req.json();
    const parsed = chatSchema.parse(json);

    const { case_id, case_type, jurisdiction, product, messages, messageCount, emailCaptured } = parsed;

    // Email gate enforcement: require email after 3 messages (unless case_id present or already captured)
    const EMAIL_GATE_THRESHOLD = 3;
    if (
      !case_id &&
      messageCount !== undefined &&
      messageCount >= EMAIL_GATE_THRESHOLD &&
      emailCaptured === false
    ) {
      return NextResponse.json(
        {
          requires_email: true,
          message: 'Enter your email to continue your conversation.',
          suggestedCTAs: [],
        },
        { status: 200 }
      );
    }

    const systemContent = `
${ASK_HEAVEN_BASE_SYSTEM_PROMPT}

Additional instructions for CHAT MODE:
- You are answering free-form questions from landlords.
- Stay STRICTLY within UK residential landlord/tenant/property law.
- If the user asks about anything outside that scope
  (e.g. politics, health, "price of milk", general life advice),
  politely explain that Ask Heaven is limited to landlord issues and decline.
- You may refer to common processes:
  - England & Wales: Section 8, Section 21, PAP-DEBT, County Court money claims.
  - Scotland: Notice to Leave, First-tier Tribunal, Simple Procedure.
  - Northern Ireland: Notice to Quit style processes (high-level only).
- You MUST NOT contradict the platform decision engine or invent new legal rules.
- Focus on explaining options, risks, timelines, and evidence, not telling the user exactly what to do.
- Use short sections and bullet points where helpful.

PRODUCT RECOMMENDATIONS:
When the landlord's question indicates they need a specific document or service, suggest the appropriate product code:
- notice_only - For eviction/serving notice questions
- complete_pack - For court/tribunal/possession proceedings
- money_claim - For rent arrears/money claims/debt recovery
- tenancy_agreement - For tenancy agreement/AST questions

Only suggest ONE product per response if clearly relevant. Use null if the question is general.

Context:
${jurisdiction ? `- Jurisdiction: ${jurisdiction}` : '- Jurisdiction: Not specified (assume England unless user indicates otherwise)'}
${case_id ? '- You are chatting about a specific internal case. NEVER show the case_id or any internal IDs to the user.' : ''}

CRITICAL - JSON RESPONSE FORMAT:
You MUST respond with a JSON object containing exactly these fields:
{
  "reply": "Your helpful response text here",
  "suggested_product": "notice_only" | "complete_pack" | "money_claim" | "tenancy_agreement" | null
}

The "reply" field is REQUIRED and must contain your full response to the landlord.
The "suggested_product" field should be one of the product codes above, or null if no product is relevant.
`.trim();

    const systemMessage: ChatMessage = {
      role: 'system',
      content: systemContent,
    };

    const fullMessages: ChatMessage[] = [systemMessage, ...messages];

    const schema = {
      type: 'object',
      properties: {
        reply: {
          type: 'string',
          description:
            'Helpful, grounded reply to the landlord. Use clear structure and plain language, like a cautious senior housing solicitor, without giving personalised legal advice.',
        },
        suggested_product: {
          type: 'string',
          enum: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement', null],
          description: 'If the question clearly relates to a product, suggest one. null if general question.',
        },
      },
      required: ['reply'],
      additionalProperties: false,
    };

    const options: ChatCompletionOptions = {
      model: 'gpt-4o-mini',
      temperature: 0.2,
    };

    // Debug: Check if OPENAI_API_KEY is set
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please check server configuration.' },
        { status: 500 }
      );
    }

    const result = await jsonCompletion<{ reply: string; suggested_product?: string | null }>(
      fullMessages,
      schema as Record<string, unknown>,
      options,
    );

    // Debug: Log the raw response
    logger.info('Ask Heaven raw response', {
      hasJson: !!result.json,
      jsonKeys: result.json ? Object.keys(result.json) : [],
      contentPreview: result.content?.substring(0, 200),
    });

    const reply = result.json?.reply ?? 'Sorry, Ask Heaven could not generate a reply this time.';
    const suggestedProduct = result.json?.suggested_product ?? null;

    // Debug: Log if reply was missing
    if (!result.json?.reply) {
      logger.warn('Ask Heaven response missing reply field', {
        rawJson: JSON.stringify(result.json),
        content: result.content,
      });
    }

    return NextResponse.json({ reply, suggested_product: suggestedProduct }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: err.flatten() },
        { status: 400 },
      );
    }

    logger.error('Ask Heaven chat error', { error: (err as Error)?.message });
    return NextResponse.json(
      { error: 'Ask Heaven chat is currently unavailable.' },
      { status: 500 },
    );
  }
}
