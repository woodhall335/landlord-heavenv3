/**
 * Wizard API - Start or resume a wizard flow
 *
 * POST /api/wizard/start
 * Creates or resumes a case and returns the first MQS question
 * ALLOWS ANONYMOUS ACCESS - Users can try wizard before signing up
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerUser } from '@/lib/supabase/server';
import {
  createSupabaseAdminClient,
  logSupabaseAdminDiagnostics,
} from '@/lib/supabase/admin';
import {
  assertCaseReadAccess,
  getSessionTokenFromRequest,
} from '@/lib/auth/case-access';
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
import { createEmptySection13State } from '@/lib/section13';
import {
  RESIDENTIAL_LETTING_PRODUCT_SKUS,
  RESIDENTIAL_LETTING_PRODUCTS,
} from '@/lib/residential-letting/products';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  getRetiredPublicSkuRedirectDestination,
  isRetiredPublicSku,
} from '@/lib/public-retirements';
import {
  ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
  ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
} from '@/lib/tenancy/england-agreement-constants';
import { getEnglandCanonicalTenancyProduct } from '@/lib/tenancy/england-product-model';
import {
  getPublicProductOwnerHref,
  isPubliclyStartableProduct,
} from '@/lib/public-products';

const RESIDENTIAL_PRODUCTS = [...RESIDENTIAL_LETTING_PRODUCT_SKUS] as const;
type ResidentialProduct = (typeof RESIDENTIAL_PRODUCTS)[number];

function isResidentialStandaloneProduct(product: string): product is ResidentialProduct {
  return (RESIDENTIAL_PRODUCTS as readonly string[]).includes(product);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const startWizardSchema = z.object({
  product: z.enum([
    'notice_only',
    'complete_pack',
    'money_claim',
    'section13_standard',
    'section13_defensive',
    'money_claim_england_wales',
    'money_claim_scotland',
    'tenancy_agreement',
    'ast_standard',
    'ast_premium',
    ...RESIDENTIAL_PRODUCTS,
  ]),
  jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']),
  case_id: z.string().uuid().optional(),
  // Used by standalone validators (e.g., /eviction-notice) to set the notice route
  // so runLegalValidator knows which validator to apply
  validator_key: z.string().optional(),
  // Additional metadata from validator pages
  case_type: z.enum(['eviction', 'money_claim', 'tenancy_agreement', 'rent_increase']).optional(),
  product_variant: z.string().optional(),
  requested_product: z.string().optional(),
});

type StartProduct =
  | ProductType
  | 'ast_standard'
  | 'ast_premium'
  | 'section13_standard'
  | 'section13_defensive'
  | 'money_claim_england_wales'
  | 'money_claim_scotland'
  | ResidentialProduct;

const productToCaseType = (product: StartProduct) => {
  if (isResidentialStandaloneProduct(product)) {
    return 'tenancy_agreement';
  }

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
    case 'section13_standard':
    case 'section13_defensive':
      return 'rent_increase';
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
  if (isResidentialStandaloneProduct(product)) {
    return RESIDENTIAL_LETTING_PRODUCTS[product].label;
  }

  switch (product) {
    case 'ast_standard':
      if (jurisdiction === 'scotland')
        return 'Standard Scottish Private Residential Tenancy';
      if (jurisdiction === 'northern-ireland') return 'Standard NI Private Tenancy';
      return ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL;

    case 'ast_premium':
      if (jurisdiction === 'scotland')
        return 'Premium Scottish Private Residential Tenancy';
      if (jurisdiction === 'northern-ireland') return 'Premium NI Private Tenancy';
      return ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL;
    default:
      // Generic tenancy_agreement product should still ask "which version?"
      return null;
  }
};

// Normalize product to MQS product type
const normalizeProduct = (product: StartProduct): ProductType | 'rent_increase' => {
  if (product === 'section13_standard' || product === 'section13_defensive') {
    return 'rent_increase';
  }
  if (product === 'ast_standard' || product === 'ast_premium') {
    return 'tenancy_agreement';
  }
  if ((RESIDENTIAL_PRODUCTS as readonly string[]).includes(product)) {
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
  return loadMQS(product, jurisdiction);
}

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/wizard/start', writesUsingAdmin: true });

    const user = await getServerUser().catch(() => null);
    const body = await request.json();
    const validationResult = startWizardSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 },
      );
    }

    const {
      product,
      jurisdiction,
      case_id,
      validator_key,
      product_variant,
      requested_product,
    } =
      validationResult.data;

    if (!case_id && isRetiredPublicSku(product)) {
      const redirectTo = getRetiredPublicSkuRedirectDestination(product) ?? '/tenancy-agreement-template';
      return NextResponse.json(
        {
          error: 'This product has been retired from the public site.',
          reason: 'retired_public_product',
          redirect_to: redirectTo,
        },
        { status: 409 }
      );
    }

    const resolvedCaseType = productToCaseType(product as StartProduct);
    const normalizedProduct = normalizeProduct(product as StartProduct);
    const effectiveJurisdiction = resolveJurisdiction(product as StartProduct, jurisdiction);
    const englandPost2026EvictionRoute =
      effectiveJurisdiction === 'england' && resolvedCaseType === 'eviction'
        ? 'section_8'
        : null;
    const canonicalProduct =
      effectiveJurisdiction === 'england'
        ? getEnglandCanonicalTenancyProduct(product)
        : null;
    const storedProduct = canonicalProduct ?? product;
    const originalRequestedProduct = requested_product ?? product;
    const legacyRequestedProduct =
      originalRequestedProduct !== storedProduct ? originalRequestedProduct : null;

    if (!case_id && effectiveJurisdiction !== 'england') {
      return NextResponse.json(
        {
          error: 'Public wizard starts are available for England only.',
          reason: 'public_england_only',
          redirect_to: getPublicProductOwnerHref(product, resolvedCaseType),
        },
        { status: 409 }
      );
    }

    if (!case_id && !isPubliclyStartableProduct(storedProduct)) {
      return NextResponse.json(
        {
          error: 'This product is not publicly startable.',
          reason: 'legacy_only_product',
          redirect_to: getPublicProductOwnerHref(storedProduct, resolvedCaseType),
        },
        { status: 409 }
      );
    }

    if (
      isResidentialStandaloneProduct(product) &&
      effectiveJurisdiction !== 'england'
    ) {
      return NextResponse.json(
        {
          code: 'PRODUCT_NOT_AVAILABLE_IN_REGION',
          error: 'PRODUCT_NOT_AVAILABLE_IN_REGION',
          user_message:
            'This standalone tenancy document is currently available for England only. Please use the England flow or choose the main tenancy agreement product for your jurisdiction.',
          supported: {
            [product]: ['england'],
            tenancy_agreement: ['england', 'wales', 'scotland', 'northern-ireland'],
          },
          redirect_to: '/products/ast',
          blocking_issues: [],
          warnings: [],
        },
        { status: 400 },
      );
    }

    // Tier label here is *jurisdiction-aware* (AST vs PRT vs NI tenancy wording)
    const tierLabel = resolveProductTier(
      storedProduct as StartProduct,
      effectiveJurisdiction as 'england' | 'wales' | 'scotland' | 'northern-ireland',
    );

    if (!resolvedCaseType) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    if (
      resolvedCaseType === 'rent_increase' &&
      effectiveJurisdiction !== 'england'
    ) {
      return NextResponse.json(
        {
          code: 'PRODUCT_NOT_AVAILABLE_IN_REGION',
          error: 'PRODUCT_NOT_AVAILABLE_IN_REGION',
          user_message: 'The Section 13 rent increase wizard is currently available for England only.',
          supported: {
            section13_standard: ['england'],
            section13_defensive: ['england'],
          },
          redirect_to: '/wizard?product=section13_standard&jurisdiction=england',
          blocking_issues: [],
          warnings: [],
        },
        { status: 400 }
      );
    }

    // Northern Ireland gating: only tenancy agreements are supported
    if (effectiveJurisdiction === 'northern-ireland' && resolvedCaseType !== 'tenancy_agreement') {
      return NextResponse.json(
        {
          code: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          error: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          user_message: 'Northern Ireland: tenancy agreements only (eviction notices planned).',
          supported: {
            'northern-ireland': ['tenancy_agreement'],
            england: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
            wales: ['notice_only', 'tenancy_agreement'],
            scotland: ['notice_only', 'tenancy_agreement'],
          },
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 },
      );
    }

    // Wales and Scotland gating: complete_pack and money_claim not available
    if (
      (effectiveJurisdiction === 'wales' || effectiveJurisdiction === 'scotland') &&
      (normalizedProduct === 'complete_pack' || normalizedProduct === 'money_claim')
    ) {
      return NextResponse.json(
        {
          code: 'PRODUCT_NOT_AVAILABLE_IN_REGION',
          error: 'PRODUCT_NOT_AVAILABLE_IN_REGION',
          user_message:
            'Product not available in your region; use Notice Only instead. ' +
            `The ${
              normalizedProduct === 'complete_pack' ? 'Eviction Pack' : 'Money Claim'
            } is only available for England. ` +
            `For ${effectiveJurisdiction === 'wales' ? 'Wales' : 'Scotland'}, we offer the Notice Only pack (${PRODUCTS.notice_only.displayPrice}) ` +
            'and Tenancy Agreements.',
          supported: {
            'northern-ireland': ['tenancy_agreement'],
            england: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
            wales: ['notice_only', 'tenancy_agreement'],
            scotland: ['notice_only', 'tenancy_agreement'],
          },
          redirect_to: `/wizard?product=notice_only&jurisdiction=${effectiveJurisdiction}`,
          blocking_issues: [],
          warnings: [],
        },
        { status: 400 },
      );
    }

    // Admin client bypasses RLS - used for creating/resuming cases for anonymous users
    const adminSupabase = createSupabaseAdminClient();

    let caseRecord: { id: string } | null = null;
    const requestSessionToken = getSessionTokenFromRequest(request);

    // ------------------------------------------------
    // 1. Resume existing case if case_id supplied
    // ------------------------------------------------
    if (case_id) {
      const { data, error } = await adminSupabase
        .from('cases')
        .select('id,user_id,session_token,case_type,jurisdiction')
        .eq('id', case_id)
        .single();

      if (error || !data) {
        const { handleCaseFetchError } = await import('@/lib/api/error-handling');
        const errorResponse = handleCaseFetchError(error, data, 'wizard/start', case_id);
        if (errorResponse) return errorResponse;
      }

      const caseData = data as {
        id: string;
        user_id: string | null;
        session_token: string | null;
        case_type: string;
        jurisdiction: string;
      };

      const accessError = assertCaseReadAccess({ request, user, caseRow: caseData });
      if (accessError) return accessError;

      if (caseData.case_type !== resolvedCaseType || caseData.jurisdiction !== effectiveJurisdiction) {
        return NextResponse.json(
          { error: 'Case does not match requested product or jurisdiction' },
          { status: 400 },
        );
      }

      caseRecord = { id: caseData.id };
    } else {
      // ------------------------------------------------
      // 2. Create new case
      // ------------------------------------------------
      if (!user && !requestSessionToken) {
        // Anti-enumeration: behave like "not found" for anonymous without capability token
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }

      const emptyFacts = createEmptyWizardFacts();

      // Pre-populate meta + country on the *flat* wizard facts
      const initialFacts: any = {
        ...emptyFacts,
        __meta: {
          product: storedProduct as string | null,
          original_product: originalRequestedProduct as string | null,
          canonical_product: (canonicalProduct ?? storedProduct) as string | null,
          ...(legacyRequestedProduct
            ? { legacy_requested_product: legacyRequestedProduct as string | null }
            : {}),
          mqs_product: normalizedProduct as string | null,
          ...(tierLabel ? { product_tier: tierLabel as string | null } : {}),
          ...(validator_key ? { validator_key: validator_key as string | null } : {}),
          ...(product_variant ? { product_variant: product_variant as string | null } : {}),
          ...(resolvedCaseType === 'rent_increase'
            ? { rules_version: 'england_assured_section13_2026-05-01' }
            : {}),
        },
        // IMPORTANT: root-level product_tier so MQS version questions see it as answered
        ...(tierLabel ? { product_tier: tierLabel } : {}),
        property_country: effectiveJurisdiction,
        jurisdiction: effectiveJurisdiction,
        ...(resolvedCaseType === 'rent_increase'
          ? {
              section13: createEmptySection13State(
                storedProduct as 'section13_standard' | 'section13_defensive'
              ),
            }
          : {}),
        ...(englandPost2026EvictionRoute
          ? {
              selected_notice_route: englandPost2026EvictionRoute,
              eviction_route: englandPost2026EvictionRoute,
            }
          : validator_key
          ? { selected_notice_route: validator_key }
          : {}),
      };

      const { data, error } = await adminSupabase
        .from('cases')
        .insert({
          user_id: user ? user.id : null,
          ...(user ? {} : { session_token: requestSessionToken }),
          case_type: resolvedCaseType,
          jurisdiction: effectiveJurisdiction,
          status: 'in_progress',
          workflow_status: resolvedCaseType === 'rent_increase' ? 'draft' : null,
          workflow_status_updated_at:
            resolvedCaseType === 'rent_increase' ? new Date().toISOString() : null,
          wizard_progress: 0,
          collected_facts: initialFacts as any,
        } as any)
        .select('id')
        .single();

      if (error || !data) {
        console.error('Failed to create case:', error);
        return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
      }

      caseRecord = data as { id: string };
    }

    // ------------------------------------------------
    // 3. Ensure case_facts row exists and load facts
    // ------------------------------------------------
    // Use admin client for case_facts operations to support anonymous users
    let facts = await getOrCreateWizardFacts(adminSupabase, caseRecord.id);

    // For newly created cases, mirror meta + country into case_facts.facts
    if (!case_id) {
      const mergedMeta = {
        ...(facts.__meta ?? {}),
        product: storedProduct as string | null,
        original_product: originalRequestedProduct as string | null,
        canonical_product: (canonicalProduct ?? storedProduct) as string | null,
        ...(legacyRequestedProduct
          ? { legacy_requested_product: legacyRequestedProduct as string | null }
          : {}),
        mqs_product: normalizedProduct as string | null,
        ...(tierLabel ? { product_tier: tierLabel as string | null } : {}),
        ...(validator_key ? { validator_key: validator_key as string | null } : {}),
        ...(product_variant ? { product_variant: product_variant as string | null } : {}),
        ...(resolvedCaseType === 'rent_increase'
          ? { rules_version: 'england_assured_section13_2026-05-01' }
          : {}),
      };

      const updatedFacts: any = {
        ...facts,
        __meta: mergedMeta,
        ...(tierLabel ? { product_tier: tierLabel } : {}),
        property_country: facts.property_country ?? effectiveJurisdiction,
        jurisdiction: facts.jurisdiction ?? effectiveJurisdiction,
        ...(resolvedCaseType === 'rent_increase'
          ? {
              section13:
                facts.section13 ||
                createEmptySection13State(
                  storedProduct as 'section13_standard' | 'section13_defensive'
                ),
            }
          : {}),
        ...(englandPost2026EvictionRoute
          ? {
              selected_notice_route: englandPost2026EvictionRoute,
              eviction_route: englandPost2026EvictionRoute,
            }
          : validator_key && !facts.selected_notice_route
          ? { selected_notice_route: validator_key }
          : {}),
      };

      const { error: updateError } = await adminSupabase
        .from('case_facts')
        .update({ facts: updatedFacts as any })
        .eq('case_id', caseRecord.id);

      if (!updateError) {
        facts = updatedFacts;
      }
    }

    if (resolvedCaseType === 'rent_increase') {
      return NextResponse.json({
        case_id: caseRecord.id,
        product: storedProduct,
        jurisdiction: effectiveJurisdiction,
        next_question: null,
        is_complete: false,
        smart_review: null,
      });
    }

    // ------------------------------------------------
    // 4. Load MQS for this product/jurisdiction
    // ------------------------------------------------
    const mqs = loadMQSOrError(normalizedProduct as ProductType, effectiveJurisdiction);
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
    let smart_review = null;
    if (
      (normalizedProduct === 'complete_pack' || (normalizedProduct as string) === 'eviction_pack') &&
      effectiveJurisdiction === 'england' &&
      (facts as any).__smart_review
    ) {
      smart_review = {
        warnings: (facts as any).__smart_review.warnings || [],
        summary: (facts as any).__smart_review.summary || null,
        ranAt: (facts as any).__smart_review.ranAt || null,
        limitsApplied: (facts as any).__smart_review.limitsApplied || null,
      };
    }

    return NextResponse.json({
      case_id: caseRecord.id,
      product: storedProduct,
      jurisdiction: effectiveJurisdiction,
      next_question: nextQuestion || null,
      is_complete: isComplete,
      smart_review,
    });
  } catch (error: any) {
    console.error('Start wizard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
