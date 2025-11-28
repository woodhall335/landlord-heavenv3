/**
 * Wizard API - Start or resume a wizard flow
 *
 * POST /api/wizard/start
 * Creates or resumes a case and returns the first MQS question
 * ALLOWS ANONYMOUS ACCESS - Users can try wizard before signing up
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { createEmptyWizardFacts } from '@/lib/case-facts/schema';
import { getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { getNextMQSQuestion, loadMQS, type MasterQuestionSet, type ProductType } from '@/lib/wizard/mqs-loader';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const startWizardSchema = z.object({
  product: z.enum(['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement', 'ast_standard', 'ast_premium']),
  jurisdiction: z.enum(['england-wales', 'scotland', 'northern-ireland']),
  case_id: z.string().uuid().optional(),
});

const productToCaseType = (product: ProductType | 'ast_standard' | 'ast_premium') => {
  switch (product) {
    case 'notice_only':
    case 'complete_pack':
      return 'eviction';
    case 'money_claim':
      return 'money_claim';
    case 'tenancy_agreement':
    case 'ast_standard':
    case 'ast_premium':
      return 'tenancy_agreement';
    default:
      return null;
  }
};

// Map specific AST products to tier values
const productToTier = (product: string): string | null => {
  switch (product) {
    case 'ast_standard':
      return 'Standard AST';
    case 'ast_premium':
      return 'Premium AST';
    default:
      return null;
  }
};

// Normalize product to MQS product type
const normalizeProduct = (product: string): ProductType => {
  if (product === 'ast_standard' || product === 'ast_premium') {
    return 'tenancy_agreement';
  }
  return product as ProductType;
};

function loadMQSOrError(product: ProductType, jurisdiction: string): MasterQuestionSet | null {
  const mqs = loadMQS(product, jurisdiction);
  return mqs;
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser().catch(() => null);
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
    const normalizedProduct = normalizeProduct(product);
    const tier = productToTier(product);

    if (!resolvedCaseType) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    // Northern Ireland gating: only tenancy agreements are supported
    if (jurisdiction === 'northern-ireland' && resolvedCaseType !== 'tenancy_agreement') {
      return NextResponse.json(
        { error: 'Only tenancy agreements are available for Northern Ireland. Eviction and money claim workflows are not currently supported.' },
        { status: 400 }
      );
    }

    // Create properly typed Supabase client
    const supabase = await createServerSupabaseClient();

    let caseRecord: any = null;

    // ------------------------------------------------
    // 1. Resume existing case if case_id supplied
    // ------------------------------------------------
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

      // Type assertion: we know data exists after the null check
      const caseData = data as { id: string; case_type: string; jurisdiction: string };

      if (caseData.case_type !== resolvedCaseType || caseData.jurisdiction !== jurisdiction) {
        return NextResponse.json(
          { error: 'Case does not match requested product or jurisdiction' },
          { status: 400 }
        );
      }

      caseRecord = caseData;
    } else {
      // ------------------------------------------------
      // 2. Create new case
      // ------------------------------------------------
      const emptyFacts = createEmptyWizardFacts();

      // Pre-populate tier if specified
      const initialFacts = {
        ...emptyFacts,
        __meta: {
          product: normalizedProduct as string | null,
          original_product: product as string | null,
          ...(tier ? { product_tier: tier as string | null } : {})
        }
      };

      const { data, error } = await supabase
        .from('cases')
        .insert({
          user_id: user ? user.id : null,
          case_type: resolvedCaseType,
          jurisdiction,
          status: 'in_progress',
          wizard_progress: 0,
          collected_facts: initialFacts as any, // Supabase types collected_facts as Json
        } as any)
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to create case:', error);
        return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
      }

      caseRecord = data;
    }

    // ------------------------------------------------
    // 3. Ensure case_facts row exists and load facts
    // ------------------------------------------------
    // For new cases, initialize case_facts with the same initial facts from collected_facts
    let facts = await getOrCreateWizardFacts(supabase, caseRecord.id);

    // If this is a newly created case with pre-populated tier, ensure case_facts also has it
    if (!case_id && tier) {
      const updatedFacts = {
        ...facts,
        __meta: {
          product: facts.__meta?.product ?? null,
          original_product: facts.__meta?.original_product ?? null,
          product_tier: tier as string | null
        }
      };
      const { error: updateError } = await supabase
        .from('case_facts')
        // @ts-ignore - Supabase RLS types incorrectly infer never for update
        .update({ facts: updatedFacts as any } as any) // Supabase types facts as Json
        .eq('case_id', caseRecord.id);

      if (!updateError) {
        facts = updatedFacts;
      }
    }

    // ------------------------------------------------
    // 4. Load MQS for this product/jurisdiction
    // ------------------------------------------------
    const mqs = loadMQSOrError(normalizedProduct, jurisdiction);
    if (!mqs) {
      return NextResponse.json(
        { error: 'MQS not implemented for this jurisdiction yet' },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 5. Determine first question from MQS + facts
    // ------------------------------------------------
    const nextQuestion = getNextMQSQuestion(mqs, facts);
    const isComplete = !nextQuestion;

    return NextResponse.json({
      case_id: caseRecord.id,
      product,
      jurisdiction,
      next_question: nextQuestion || null,
      is_complete: isComplete,
    });
  } catch (error: any) {
    console.error('Start wizard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
