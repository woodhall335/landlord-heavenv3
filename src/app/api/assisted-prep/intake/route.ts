import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import {
  getAssistedPrepConfig,
  normalizeAssistedPrepService,
} from '@/lib/assisted-prep';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const intakeSchema = z.object({
  service: z.enum(['section8', 'money_claim', 'possession']),
  source_case_id: z.string().uuid().nullable().optional(),
  src: z.string().max(120).nullable().optional(),
  product: z.string().max(120).nullable().optional(),
  step: z.string().max(120).nullable().optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(6).max(40),
  property_address: z.string().trim().min(5).max(500),
  tenant_names: z.string().trim().max(400).optional().default(''),
  urgency: z.string().trim().max(80).optional().default(''),
  overview: z.string().trim().max(700).optional().default(''),
  authority_confirmed: z.boolean(),
  responsibility_confirmed: z.boolean(),
  section8_reason: z.string().trim().max(400).optional().default(''),
  section8_notice_already_served: z.enum(['yes', 'no', 'not_sure']).optional(),
  money_claim_amount: z.string().trim().max(80).optional().default(''),
  money_claim_lba_sent: z.enum(['yes', 'no', 'not_sure']).optional(),
  possession_notice_served: z.enum(['yes', 'no', 'not_sure']).optional(),
  possession_notice_date: z.string().trim().max(40).optional().default(''),
});

function buildServiceFacts(input: z.infer<typeof intakeSchema>) {
  if (input.service === 'section8') {
    return {
      reason_for_notice: input.section8_reason,
      notice_already_served: input.section8_notice_already_served || 'not_sure',
    };
  }

  if (input.service === 'money_claim') {
    return {
      amount_claimed: input.money_claim_amount,
      letter_before_claim_sent: input.money_claim_lba_sent || 'not_sure',
    };
  }

  return {
    notice_served: input.possession_notice_served || 'not_sure',
    notice_date: input.possession_notice_date,
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const payload = await request.json();
    const parsed = intakeSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please check the assisted prep form and try again.', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    if (!input.authority_confirmed || !input.responsibility_confirmed) {
      return NextResponse.json(
        { error: 'Please confirm authority and responsibility before continuing.' },
        { status: 400 }
      );
    }

    const service = normalizeAssistedPrepService(input.service);
    const config = getAssistedPrepConfig(service);
    const supabase = createAdminClient();

    let sourceFacts: Record<string, unknown> | null = null;
    if (input.source_case_id) {
      const { data: sourceCase } = await supabase
        .from('cases')
        .select('id, user_id, case_type, jurisdiction, collected_facts')
        .eq('id', input.source_case_id)
        .maybeSingle();

      if (sourceCase && (sourceCase as any).user_id === user.id) {
        sourceFacts = ((sourceCase as any).collected_facts || {}) as Record<string, unknown>;
      }
    }

    const assistedIntake = {
      service,
      sku: config.sku,
      label: config.label,
      source_case_id: input.source_case_id || null,
      source_product: input.product || null,
      source_step: input.step || null,
      source: input.src || 'assisted_prep_intake',
      contact: {
        name: input.name,
        email: input.email,
        phone: input.phone,
      },
      case_overview: {
        property_address: input.property_address,
        tenant_names: input.tenant_names,
        urgency: input.urgency,
        summary: input.overview,
      },
      service_facts: buildServiceFacts(input),
      confirmations: {
        authority_confirmed: input.authority_confirmed,
        responsibility_confirmed: input.responsibility_confirmed,
      },
      imported_from_case: Boolean(sourceFacts),
      created_at: new Date().toISOString(),
    };

    const collectedFacts = {
      ...(sourceFacts || {}),
      assisted_intake: assistedIntake,
      selected_assisted_service: service,
      selected_product: config.sku,
      property_address: input.property_address,
      tenant_full_name: input.tenant_names,
      landlord_full_name: input.name,
      contact_email: input.email,
      contact_phone: input.phone,
    };

    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .insert({
        user_id: user.id,
        case_type: config.caseType,
        jurisdiction: 'england',
        status: 'in_progress',
        collected_facts: collectedFacts,
        wizard_progress: 5,
        workflow_status: 'assisted_intake',
        workflow_status_updated_at: new Date().toISOString(),
        recommended_route:
          service === 'money_claim'
            ? 'money_claim_assisted_prep'
            : service === 'possession'
              ? 'possession_claim_assisted_prep'
              : 'section8_assisted_prep',
      })
      .select('id')
      .single();

    if (caseError || !caseRow) {
      logger.error('Failed to create assisted prep intake case', {
        userId: user.id,
        service,
        error: caseError?.message,
      });
      return NextResponse.json(
        { error: 'Unable to save your assisted prep request. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      case_id: (caseRow as any).id,
      product_type: config.sku,
      service: config.service,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Please log in to continue.' }, { status: 401 });
    }

    logger.error('Assisted prep intake failed', { error: error?.message });
    return NextResponse.json(
      { error: error?.message || 'Unable to save your assisted prep request.' },
      { status: 500 }
    );
  }
}
