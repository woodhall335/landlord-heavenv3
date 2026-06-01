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

type ParsedClaimLineItem = {
  description: string;
  amount: number;
};

function parseMoneyAmount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseClaimLineItems(value: unknown): ParsedClaimLineItem[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const record = item as Record<string, unknown>;
        const description = String(record.description ?? record.label ?? '').trim();
        const amount = parseMoneyAmount(record.amount);
        return description ? { description, amount } : null;
      })
      .filter((item): item is ParsedClaimLineItem => Boolean(item));
  }

  const text = typeof value === 'string' ? value : '';
  return text
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const amountMatch = line.match(/(\p{Sc}?\s*\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*$/u);
      const amount = amountMatch ? parseMoneyAmount(amountMatch[1]) : 0;
      const description = amountMatch
        ? line.slice(0, amountMatch.index).replace(/[-:,/\s]+$/, '').trim()
        : line;
      return {
        description: description || line,
        amount,
      };
    });
}

function normaliseLandlordDebtFacts(facts: Record<string, any>) {
  const arrearsItems = parseClaimLineItems(facts.arrears_items);
  const damageItems = parseClaimLineItems(facts.money_claim?.damage_items);
  const evidenceItems = Array.isArray(facts.money_claim?.evidence_items)
    ? facts.money_claim.evidence_items
    : [];

  facts.claiming_rent_arrears = arrearsItems.length > 0;
  facts.claiming_damages = damageItems.length > 0;
  facts.claiming_other = damageItems.some((item) => /utility|council|bill|other|charge/i.test(item.description));
  facts.claim_types = [
    ...(facts.claiming_rent_arrears ? ['rent_arrears'] : []),
    ...(facts.claiming_damages ? ['property_damage'] : []),
    ...(facts.claiming_other ? ['other_tenant_debt'] : []),
  ];

  facts.landlord_address = facts.landlord_address_line1;
  facts.landlord_postcode = facts.landlord_address_postcode;
  facts.tenant_address = facts.defendant_address_line1;
  facts.tenant_postcode = facts.defendant_address_postcode;
  facts.property_address = facts.property_address_line1;
  facts.property_postcode = facts.property_address_postcode;
  facts.arrears_items = arrearsItems.map((item) => ({
    period: item.description,
    amount_due: item.amount,
    amount_paid: 0,
    arrears: item.amount,
    notes: item.description,
  }));
  facts.total_arrears = facts.arrears_items.reduce((total: number, item: any) => total + (item.arrears || 0), 0);

  facts.issues = {
    ...(facts.issues || {}),
    rent_arrears: {
      ...(facts.issues?.rent_arrears || {}),
      has_arrears: facts.claiming_rent_arrears,
      arrears_items: facts.arrears_items,
      total_arrears: facts.total_arrears,
    },
  };

  facts.money_claim = {
    ...(facts.money_claim || {}),
    damage_items: damageItems,
    damage_claim: damageItems.length > 0,
    attempts_to_resolve: facts.money_claim?.attempts_to_resolve,
    interest_rate: facts.money_claim?.charge_interest === true ? facts.money_claim?.interest_rate ?? 8 : facts.money_claim?.interest_rate,
    other_amounts_types: damageItems.map((item) => {
      if (/clean/i.test(item.description)) return 'cleaning';
      if (/utility|bill/i.test(item.description)) return 'unpaid_utilities';
      if (/council/i.test(item.description)) return 'unpaid_council_tax';
      if (/other|charge/i.test(item.description)) return 'other_charges';
      return 'property_damage';
    }),
  };
  facts.attempts_to_resolve = facts.money_claim.attempts_to_resolve;

  facts.evidence = {
    ...(facts.evidence || {}),
    tenancy_agreement_uploaded: evidenceItems.includes('tenancy_agreement'),
    rent_schedule_uploaded: evidenceItems.includes('rent_schedule'),
    correspondence_uploaded: evidenceItems.includes('chaser_correspondence'),
    other_evidence_uploaded: evidenceItems.includes('deposit_statement'),
    photos_uploaded: evidenceItems.includes('damage_photos'),
  };
}

export function buildCollectedFacts(claimCategory: ClaimTypeId, answers: Record<string, ClaimWizardAnswerValue>) {
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

  if (config.flowMode === 'landlord_money_claim') {
    normaliseLandlordDebtFacts(facts);
  }

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
