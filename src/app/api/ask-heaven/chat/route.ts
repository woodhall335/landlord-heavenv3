// src/app/api/ask-heaven/chat/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonCompletion } from '@/lib/ai';
import type { ChatMessage, ChatCompletionOptions } from '@/lib/ai';
import { ASK_HEAVEN_BASE_SYSTEM_PROMPT } from '@/lib/ai/ask-heaven';

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
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request): Promise<Response> {
  try {
    const json = await req.json();
    const parsed = chatSchema.parse(json);

    const { case_id, case_type, jurisdiction, product, messages } = parsed;

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

Context (if provided):
${jurisdiction ? `- Jurisdiction: ${jurisdiction}` : ''}
${case_type ? `- Case type: ${case_type}` : ''}
${product ? `- Product stage: ${product}` : ''}
${case_id ? '- You are chatting about a specific internal case. NEVER show the case_id or any internal IDs to the user.' : ''}
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
      },
      required: ['reply'],
      additionalProperties: false,
    };

    const options: ChatCompletionOptions = {
      model: 'gpt-4o-mini',
      temperature: 0.2,
    };

    const result = await jsonCompletion<{ reply: string }>(
      fullMessages,
      schema as Record<string, unknown>,
      options,
    );

    const reply = result.json?.reply ?? 'Sorry, Ask Heaven could not generate a reply this time.';

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: err.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Ask Heaven chat is currently unavailable.' },
      { status: 500 },
    );
  }
}
