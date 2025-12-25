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
import {
  getNextMQSQuestion,
  loadMQS,
  normalizeAskOnceFacts,
  type MasterQuestionSet,
  type ProductType,
} from '@/lib/wizard/mqs-loader';
import { applyDocumentIntelligence } from '@/lib/wizard/document-intel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const startWizardSchema = z.object({
  product: z.enum([
    'notice_only',
    'complete_pack',
    'money_claim',
    'money_claim_england_wales',
    'money_claim_scotland',
    'tenancy_agreement',
    'ast_standard',
    'ast_premium',
  ]),
  jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']),
  case_id: z.string().uuid().optional(),
});

type StartProduct =
  | ProductType
  | 'ast_standard'
  | 'ast_premium'
  | 'money_claim_england_wales'
  | 'money_claim_scotland';

const productToCaseType = (product: StartProduct) => {
  switch (product) {
    case 'notice_only':
    case 'complete_pack':
      return 'eviction';
    case 'money_claim':
    case 'money_claim_england_wales':
    case 'money_claim_scotland':
      return 'money_claim';
    case 'tenancy_agreement':
    case 'ast_standard':
    case 'ast_premium':
      return 'tenancy_agreement';
    default:
      return null;
  }
};

/**
 * Resolve a human-readable product tier label based on product + jurisdiction.
 * This is what MQS "version" questions map to (product_tier).
 */
const resolveProductTier = (
  product: StartProduct,
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland',
): string | null => {
  switch (product) {
    case 'ast_standard':
      if (jurisdiction === 'scotland') return 'Standard Scottish Private Residential Tenancy';
      if (jurisdiction === 'northern-ireland') return 'Standard NI Private Tenancy';
      return 'Standard AST';

    case 'ast_premium':
      if (jurisdiction === 'scotland') return 'Premium Scottish Private Residential Tenancy';
      if (jurisdiction === 'northern-ireland') return 'Premium NI Private Tenancy';
      return 'Premium AST';

    default:
      // Generic tenancy_agreement product should still ask "which version?"
      return null;
  }
};

// Normalize product to MQS product type
const normalizeProduct = (product: StartProduct): ProductType => {
  if (product === 'ast_standard' || product === 'ast_premium') {
    return 'tenancy_agreement';
  }
  if (product === 'money_claim_england_wales' || product === 'money_claim_scotland') {
    return 'money_claim';
  }
  return product as ProductType;
};

function resolveJurisdiction(product: StartProduct, requested: string): string {
  // Legacy product routing: money_claim_england_wales defaults to England
  if (product === 'money_claim_england_wales') return 'england';
  if (product === 'money_claim_scotland') return 'scotland';
  return requested;
}

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
        { status: 400 },
      );
    }

    const { product, jurisdiction, case_id } = validationResult.data;
    const resolvedCaseType = productToCaseType(product as StartProduct);
    const normalizedProduct = normalizeProduct(product as StartProduct);
    const effectiveJurisdiction = resolveJurisdiction(product as StartProduct, jurisdiction);

    // Tier label here is *jurisdiction-aware* (AST vs PRT vs NI tenancy wording)
    const tierLabel = resolveProductTier(
      product as StartProduct,
      effectiveJurisdiction as 'england' | 'wales' | 'scotland' | 'northern-ireland',
    );

    if (!resolvedCaseType) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    // Northern Ireland gating: only tenancy agreements are supported
    // Evictions and money claims are blocked until legal review complete
    // See docs/NI_EVICTION_STATUS.md for full details
    if (effectiveJurisdiction === 'northern-ireland' && resolvedCaseType !== 'tenancy_agreement') {
      return NextResponse.json(
        {
          code: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          error: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          user_message:
            'Northern Ireland eviction and money claim workflows are not yet supported. ' +
            'We currently only support tenancy agreements for Northern Ireland. ' +
            'Full NI support is planned for V2 (Q2 2026).',
          supported: {
            'northern-ireland': ['tenancy_agreement'],
            england: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
            wales: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
            scotland: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
          },
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 },
      );
    }

    // Create properly typed Supabase client
    const supabase = await createServerSupabaseClient();

    let caseRecord: any = null;

    // ------------------------------------------------
    // 1. Resume existing case if case_id supplied
    //    RLS policies handle access control
    // ------------------------------------------------
    if (case_id) {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', case_id)
        .single();

      if (error || !data) {
        const { handleCaseFetchError } = await import('@/lib/api/error-handling');
        const errorResponse = handleCaseFetchError(error, data, 'wizard/start', case_id);
        if (errorResponse) {
          return errorResponse;
        }
      }

      // Type assertion: we know data exists after the null check
      const caseData = data as { id: string; case_type: string; jurisdiction: string };

      if (
        caseData.case_type !== resolvedCaseType ||
        caseData.jurisdiction !== effectiveJurisdiction
      ) {
        return NextResponse.json(
          { error: 'Case does not match requested product or jurisdiction' },
          { status: 400 },
        );
      }

      caseRecord = caseData;
    } else {
      // ------------------------------------------------
      // 2. Create new case
      // ------------------------------------------------
      const emptyFacts = createEmptyWizardFacts();

      // Pre-populate meta + country on the *flat* wizard facts
      const initialFacts: any = {
        ...emptyFacts,
        __meta: {
          product: normalizedProduct as string | null,
          original_product: product as string | null,
          ...(tierLabel ? { product_tier: tierLabel as string | null } : {}),
        },
        // IMPORTANT: root-level product_tier so MQS version questions see it as answered
        ...(tierLabel ? { product_tier: tierLabel } : {}),
        // These help downstream normalization / analysis before property questions are answered
        property_country: effectiveJurisdiction,
        jurisdiction: effectiveJurisdiction,
      };

      const { data, error } = await supabase
        .from('cases')
        .insert({
          user_id: user ? user.id : null,
          case_type: resolvedCaseType,
          jurisdiction: effectiveJurisdiction,
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
    let facts = await getOrCreateWizardFacts(supabase, caseRecord.id);

    // For newly created cases, mirror meta + country into case_facts.facts
    if (!case_id) {
      const mergedMeta = {
        ...(facts.__meta ?? {}),
        product: normalizedProduct as string | null,
        original_product: product as string | null,
        ...(tierLabel ? { product_tier: tierLabel as string | null } : {}),
      };

      const updatedFacts: any = {
        ...facts,
        __meta: mergedMeta,
        ...(tierLabel ? { product_tier: tierLabel } : {}),
        property_country: facts.property_country ?? effectiveJurisdiction,
        jurisdiction: facts.jurisdiction ?? effectiveJurisdiction,
      };

      const { error: updateError } = await supabase
        .from('case_facts')
        .update({ facts: updatedFacts as any })
        .eq('case_id', caseRecord.id);

      if (!updateError) {
        facts = updatedFacts;
      }
    }

    // ------------------------------------------------
    // 4. Load MQS for this product/jurisdiction
    // ------------------------------------------------
    const mqs = loadMQSOrError(normalizedProduct, effectiveJurisdiction);
    if (!mqs) {
      return NextResponse.json(
        { error: 'MQS not implemented for this jurisdiction yet' },
        { status: 400 },
      );
    }

    // ------------------------------------------------
    // 5. Determine first question from MQS + facts
    // ------------------------------------------------
    const docIntel = applyDocumentIntelligence(facts);
    const hydratedFacts = normalizeAskOnceFacts(docIntel.facts, mqs);

    const nextQuestion = getNextMQSQuestion(mqs, hydratedFacts);
    const isComplete = !nextQuestion;

    // ------------------------------------------------
    // 6. Include persisted Smart Review data for complete_pack/eviction_pack (England only)
    // ------------------------------------------------
    // Smart Review results survive refresh via __smart_review in case_facts
    let smart_review = null;
    if (
      (normalizedProduct === 'complete_pack' || normalizedProduct === 'eviction_pack') &&
      effectiveJurisdiction === 'england' &&
      facts.__smart_review
    ) {
      smart_review = {
        warnings: facts.__smart_review.warnings || [],
        summary: facts.__smart_review.summary || null,
        ranAt: facts.__smart_review.ranAt || null,
        limitsApplied: facts.__smart_review.limitsApplied || null,
      };
    }

    return NextResponse.json({
      case_id: caseRecord.id,
      product,
      jurisdiction: effectiveJurisdiction,
      next_question: nextQuestion || null,
      is_complete: isComplete,
      // Include persisted Smart Review data if available
      smart_review,
    });
  } catch (error: any) {
    console.error('Start wizard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
