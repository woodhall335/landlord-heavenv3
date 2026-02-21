import { NextResponse } from 'next/server';
import { z } from 'zod';
import { e2eEnabled, seedCase } from '@/lib/e2eStore';

const seedSchema = z.object({
  product: z.enum(['money_claim', 'notice_only', 'complete_pack', 'tenancy_agreement']),
  jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern_ireland']),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!e2eEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = seedSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
  }

  const case_id = seedCase(parsed.data);

  return NextResponse.json({
    case_id,
    product: parsed.data.product,
    jurisdiction: parsed.data.jurisdiction,
  });
}
