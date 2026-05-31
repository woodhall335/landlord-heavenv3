import { NextResponse } from 'next/server';
import { z } from 'zod';

import { CLAIM_CONFIGS_BY_ID } from '@/lib/claims/config';
import type { ClaimTypeId, ClaimWizardAnswerValue } from '@/lib/claims/types';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const claimAnswerSchema: z.ZodType<ClaimWizardAnswerValue> = z.union([
  z.string(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.record(z.string())),
  z.record(z.string()),
]);

const upsertClaimsCaseSchema = z.object({
  case_id: z.string().uuid().optional(),
  claim_category: z.string(),
  answers: z.record(claimAnswerSchema),
});

function setNestedValue(target: Record<string, any>, path: string, value: unknown) {
  const parts = path.split('.');
  if (parts.length < 2) return;

  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    if (!cursor[part] || typeof cursor[part] !== 'object' || Array.isArray(cursor[part])) {
      cursor[part] = {};
    }
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
}

function buildCollectedFacts(claimCategory: ClaimTypeId, answers: Record<string, ClaimWizardAnswerValue>) {
  const config = CLAIM_CONFIGS_BY_ID[claimCategory];
  const facts: Record<string, any> = {
    ...answers,
    claim_category: claimCategory,
    claim_flow_mode: config.flowMode,
    property_country: 'england',
    jurisdiction: 'england',
    __meta: {
      product: 'money_claim',
      mqs_product: 'money_claim',
      claim_source: 'claims_app',
      claim_category: claimCategory,
      claim_flow_mode: config.flowMode,
      generic_claim_pack: config.flowMode === 'generic_small_claim',
    },
  };

  for (const [path, value] of Object.entries(answers)) {
    setNestedValue(facts, path, value);
  }

  facts.generic_claim = {
    ...(facts.generic_claim || {}),
    category: claimCategory,
    flow_mode: config.flowMode,
  };

  return facts;
}

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const body = await request.json();
    const parsed = upsertClaimsCaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const claimCategory = parsed.data.claim_category as ClaimTypeId;
    const config = CLAIM_CONFIGS_BY_ID[claimCategory];
    if (!config) {
      return NextResponse.json({ error: 'Unknown claim category' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const collectedFacts = buildCollectedFacts(claimCategory, parsed.data.answers);

    if (parsed.data.case_id) {
      const { data: existingCase, error: existingError } = await adminSupabase
        .from('cases')
        .select('id,user_id,case_type')
        .eq('id', parsed.data.case_id)
        .single();

      if (existingError || !existingCase || (existingCase as any).user_id !== user.id) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }

      const { error: updateError } = await adminSupabase
        .from('cases')
        .update({
          case_type: 'money_claim',
          jurisdiction: 'england',
          collected_facts: collectedFacts,
          wizard_progress: 100,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', parsed.data.case_id);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update claims case' }, { status: 500 });
      }

      return NextResponse.json({ case_id: parsed.data.case_id });
    }

    const { data, error } = await adminSupabase
      .from('cases')
      .insert({
        user_id: user.id,
        case_type: 'money_claim',
        jurisdiction: 'england',
        status: 'in_progress',
        wizard_progress: 100,
        collected_facts: collectedFacts,
      } as any)
      .select('id')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to create claims case' }, { status: 500 });
    }

    return NextResponse.json({ case_id: (data as any).id });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
