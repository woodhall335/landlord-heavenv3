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
- notice_only - For eviction/serving notice questions (England, Wales, Scotland only - NOT Northern Ireland)
- complete_pack - For court/tribunal/possession proceedings (England ONLY)
- money_claim - For rent arrears/money claims/debt recovery (England ONLY)
- tenancy_agreement - For tenancy agreement/AST questions (ALL UK regions)

REGIONAL PRODUCT AVAILABILITY (CRITICAL):
- England: All products available
- Wales: Only notice_only and tenancy_agreement available. If user asks about complete_pack or money_claim, say "This product is only available in England. For Wales, consider using Notice Only (£49.99) for eviction notices."
- Scotland: Only notice_only and tenancy_agreement available. If user asks about complete_pack or money_claim, say "This product is only available in England. For Scotland, consider using Notice to Leave (£49.99) for eviction notices."
- Northern Ireland: Only tenancy_agreement available. If user asks about eviction or money claim products, say "Eviction notices and money claim packs are not currently available for Northern Ireland. You can create a Tenancy Agreement."

Only suggest ONE product per response if clearly relevant. Use null if the question is general or the relevant product is not available in the user's jurisdiction.

NEXT STEP RECOMMENDATIONS:
Analyse the user's intent and suggest the best next step:
- "wizard" - User has transactional intent (wants to serve notice, file claim, create agreement, etc.)
- "checklist" - User is asking informational compliance questions (deposit protection, EPC, gas safety, EICR, smoke alarms, right to rent)
- "guide" - User wants to understand a topic better (general education, not ready for action)
- "none" - General question or unclear intent

TOPIC DETECTION:
Identify the primary topic from: eviction, arrears, tenancy, deposit, epc, gas_safety, eicr, smoke_alarms, right_to_rent, compliance, general

COMPLIANCE-SPECIFIC RULES:
For compliance topics (deposit, EPC, gas safety, EICR, smoke alarms, right to rent):
- suggested_product should usually be null OR tenancy_agreement (for setup-related)
- suggested_next_step should usually be "checklist" unless strong transactional intent
- Do NOT push eviction products for pure compliance questions

Context:
${jurisdiction ? `- Jurisdiction: ${jurisdiction}` : '- Jurisdiction: Not specified (assume England unless user indicates otherwise)'}
${case_id ? '- You are chatting about a specific internal case. NEVER show the case_id or any internal IDs to the user.' : ''}

RESPONSE FORMATTING:
- Use markdown formatting in your reply: **bold** for emphasis, bullet points for lists
- When citing legislation in your reply, include the specific section (e.g. "Section 21 of the Housing Act 1988")

CRITICAL - JSON RESPONSE FORMAT:
You MUST respond with a JSON object containing exactly these fields:
{
  "reply": "Your helpful response with **markdown** formatting",
  "suggested_product": "notice_only" | "complete_pack" | "money_claim" | "tenancy_agreement" | null,
  "suggested_next_step": "wizard" | "checklist" | "guide" | "none",
  "suggested_topic": "eviction" | "arrears" | "tenancy" | "deposit" | "epc" | "gas_safety" | "eicr" | "smoke_alarms" | "right_to_rent" | "compliance" | "general",
  "follow_up_questions": ["Question 1?", "Question 2?"],
  "sources": ["Housing Act 1988 s.21", "Deregulation Act 2015"]
}

Field requirements:
- "reply" (REQUIRED): Your full response to the landlord with markdown formatting. DO NOT include "Follow-Up Questions:", "Sources:", "Suggested Product:", or "Suggested Topic:" sections in this text - use the structured fields below instead.
- "suggested_product": One of the product codes above, or null if no product is relevant
- "suggested_next_step" (REQUIRED): Best next action for the user
- "suggested_topic" (REQUIRED): Primary topic detected from the question
- "follow_up_questions": Array of 2-3 relevant follow-up questions the landlord might ask. These will be displayed as clickable buttons - do NOT include them in the reply text.
- "sources": Array of legislation/regulations cited in your answer (empty array if none). These will be displayed separately - do NOT include a "Sources:" section in the reply text.
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
          description: 'Helpful response with markdown formatting',
        },
        suggested_product: {
          type: 'string',
          enum: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement', null],
          description: 'Product code or null',
        },
        suggested_next_step: {
          type: 'string',
          enum: ['wizard', 'checklist', 'guide', 'none'],
          description: 'Best next action for the user',
        },
        suggested_topic: {
          type: 'string',
          enum: ['eviction', 'arrears', 'tenancy', 'deposit', 'epc', 'gas_safety', 'eicr', 'smoke_alarms', 'right_to_rent', 'compliance', 'general'],
          description: 'Primary topic detected from question',
        },
        follow_up_questions: {
          type: 'array',
          items: { type: 'string' },
          description: '2-3 relevant follow-up questions',
        },
        sources: {
          type: 'array',
          items: { type: 'string' },
          description: 'Legislation/regulations cited',
        },
      },
      required: ['reply', 'suggested_next_step', 'suggested_topic'],
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

    interface AskHeavenResponse {
      reply: string;
      suggested_product?: string | null;
      suggested_next_step?: 'wizard' | 'checklist' | 'guide' | 'none';
      suggested_topic?: string;
      follow_up_questions?: string[];
      sources?: string[];
    }

    const result = await jsonCompletion<AskHeavenResponse>(
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
    let suggestedProduct = result.json?.suggested_product ?? null;
    const suggestedNextStep = result.json?.suggested_next_step ?? 'none';
    const suggestedTopic = result.json?.suggested_topic ?? 'general';
    const followUpQuestions = result.json?.follow_up_questions ?? [];
    const sources = result.json?.sources ?? [];

    // Debug: Log if reply was missing
    if (!result.json?.reply) {
      logger.warn('Ask Heaven response missing reply field', {
        rawJson: JSON.stringify(result.json),
        content: result.content,
      });
    }

    // Jurisdiction-aware product filtering
    // Regional restrictions: complete_pack and money_claim are England-only
    // notice_only is not available in NI
    if (suggestedProduct) {
      const originalProduct = suggestedProduct;

      // Northern Ireland: only tenancy_agreement
      if (jurisdiction === 'northern-ireland') {
        const niUnsupportedProducts = ['notice_only', 'complete_pack', 'money_claim'];
        if (niUnsupportedProducts.includes(originalProduct)) {
          suggestedProduct = 'tenancy_agreement';
        }
      }

      // Wales: no complete_pack or money_claim
      if (jurisdiction === 'wales') {
        if (originalProduct === 'complete_pack') {
          suggestedProduct = 'notice_only';
        } else if (originalProduct === 'money_claim') {
          suggestedProduct = null;
        }
      }

      // Scotland: no complete_pack or money_claim
      if (jurisdiction === 'scotland') {
        if (originalProduct === 'complete_pack') {
          suggestedProduct = 'notice_only';
        } else if (originalProduct === 'money_claim') {
          suggestedProduct = null;
        }
      }

      if (originalProduct !== suggestedProduct) {
        logger.info('Filtered unsupported product for jurisdiction', {
          jurisdiction,
          originalProduct,
          filteredProduct: suggestedProduct,
        });
      }
    }

    return NextResponse.json({
      reply,
      suggested_product: suggestedProduct,
      suggested_next_step: suggestedNextStep,
      suggested_topic: suggestedTopic,
      follow_up_questions: followUpQuestions,
      sources,
    }, { status: 200 });
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
