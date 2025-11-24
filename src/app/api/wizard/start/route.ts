/**
 * Wizard API - Start or resume a wizard flow
 *
 * POST /api/wizard/start
 * Creates or resumes a case and returns the first MQS question
 * ALLOWS ANONYMOUS ACCESS - Users can try wizard before signing up
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { createEmptyCaseFacts } from '@/lib/case-facts/schema';
import { getOrCreateCaseFacts } from '@/lib/case-facts/store';
import { getNextMQSQuestion, loadMQS, type MasterQuestionSet, type ProductType } from '@/lib/wizard/mqs-loader';

const startWizardSchema = z.object({
  product: z.enum(['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement']),
  jurisdiction: z.enum(['england-wales', 'scotland', 'northern-ireland']),
  case_id: z.string().uuid().optional(),
});

const productToCaseType = (product: ProductType) => {
  switch (product) {
    case 'notice_only':
    case 'complete_pack':
      return 'eviction';
    case 'money_claim':
      return 'money_claim';
    case 'tenancy_agreement':
      return 'tenancy_agreement';
    default:
      return null;
  }
};

function loadMQSOrError(product: ProductType, jurisdiction: string): MasterQuestionSet | null {
  const mqs = loadMQS(product, jurisdiction);
  return mqs;
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    const body = await request.json();
    const validationResult = startWizardSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { product, jurisdiction, case_id } = validationResult.data;
    const resolvedCaseType = productToCaseType(product);

    if (!resolvedCaseType) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const supabaseClient = supabase as unknown as SupabaseClient;

    let caseRecord: any = null;

    if (case_id) {
      let query = supabase.from('cases').select('*').eq('id', case_id);
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query.single();
      if (error || !data) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }

      if (data.case_type !== resolvedCaseType || data.jurisdiction !== jurisdiction) {
        return NextResponse.json(
          { error: 'Case does not match requested product or jurisdiction' },
          { status: 400 }
        );
      }

      caseRecord = data;
    } else {
      const emptyFacts = createEmptyCaseFacts();
      const { data, error } = await supabase
        .from('cases')
        .insert({
          user_id: user?.id ?? null,
          case_type: resolvedCaseType,
          jurisdiction,
          status: 'in_progress',
          wizard_progress: 0,
          collected_facts: { ...emptyFacts, __meta: { product } } as any,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to create case:', error);
        return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
      }

      caseRecord = data;
    }

    const facts = await getOrCreateCaseFacts(supabaseClient, caseRecord.id);
    const mqs = loadMQSOrError(product, jurisdiction);

    if (!mqs) {
      return NextResponse.json(
        { error: 'MQS not implemented for this jurisdiction yet' },
        { status: 400 }
      );
    }

    const nextQuestion = getNextMQSQuestion(mqs, facts);
    const isComplete = !nextQuestion;

    return NextResponse.json({
      case_id: caseRecord.id,
      product,
      jurisdiction,
      next_question: nextQuestion,
      is_complete: isComplete,
    });
  } catch (error: any) {
    console.error('Start wizard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
