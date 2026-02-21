/**
 * Checkout API - Create Session
 *
 * POST /api/checkout/create
 * Creates a Stripe checkout session for one-time purchases
 *
 * IMPORTANT: Prices are controlled in Stripe Dashboard.
 * Product metadata comes from src/lib/pricing/products.ts (source of truth).
 * Stripe Price IDs come from environment variables via src/lib/stripe/index.ts.
 *
 * IDEMPOTENCY:
 * - If case_id is provided, checkout is idempotent per (case_id, product_type)
 * - Returns "already_paid" if a paid order exists
 * - Reuses existing pending session if still valid
 * - Uses Stripe idempotency keys to prevent duplicate charges
 */

import { createServerSupabaseClient, createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { ensureUserProfileExists } from '@/lib/supabase/ensure-user';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe, PRICE_IDS, assertValidPriceId, StripePriceIdError } from '@/lib/stripe';
import { PRODUCTS, type ProductSku } from '@/lib/pricing/products';
import { logger } from '@/lib/logger';
import {
  validateNoticeOnlyCase,
  NoticeOnlyCaseValidationError,
} from '@/lib/validation/notice-only-case-validator';
import { validateSection21ForCheckout } from '@/lib/validation/section21-checkout-validator';
import { validateComplianceTiming } from '@/lib/documents/court-ready-validator';
import { buildComplianceTimingDataFromFacts } from '@/lib/documents/compliance-timing-facts';
import {
  sanitizeComplianceIssues,
  type ComplianceTimingBlockResponse,
} from '@/lib/documents/compliance-timing-types';
import crypto from 'crypto';
import { validateTenancyRequiredFacts } from '@/lib/validation/tenancy-details-validator';

/**
 * Normalize display SKUs to payment SKUs for order storage
 * Display SKUs (prt_*, occupation_*, ni_*) are converted to payment SKUs (ast_*)
 */
function normalizeToPaymentSku(productType: string): string {
  const displayToPayment: Record<string, string> = {
    // Generic tenancy_agreement defaults to standard tier
    tenancy_agreement: 'ast_standard',
    // Jurisdiction-specific display SKUs
    prt_standard: 'ast_standard',
    prt_premium: 'ast_premium',
    occupation_standard: 'ast_standard',
    occupation_premium: 'ast_premium',
    ni_standard: 'ast_standard',
    ni_premium: 'ast_premium',
  };
  return displayToPayment[productType] || productType;
}

/**
 * Map product types to Stripe Price IDs
 * Note: money_claim is £99.99, sc_money_claim (discontinued) shares the same Stripe price ID
 * Jurisdiction-specific display SKUs (prt_*, occupation_*, ni_*) map to the same prices as ast_*
 */
const PRODUCT_TO_PRICE_ID: Record<string, string> = {
  notice_only: PRICE_IDS.NOTICE_ONLY,
  complete_pack: PRICE_IDS.EVICTION_PACK,
  money_claim: PRICE_IDS.MONEY_CLAIM,
  sc_money_claim: PRICE_IDS.MONEY_CLAIM, // Same price as England/Wales money claim
  ast_standard: PRICE_IDS.STANDARD_AST,
  ast_premium: PRICE_IDS.PREMIUM_AST,
  tenancy_agreement: PRICE_IDS.STANDARD_AST, // Generic tenancy agreement defaults to standard
  // Jurisdiction-specific display SKUs - map to same prices as AST
  prt_standard: PRICE_IDS.STANDARD_AST,      // Scotland
  prt_premium: PRICE_IDS.PREMIUM_AST,        // Scotland
  occupation_standard: PRICE_IDS.STANDARD_AST, // Wales
  occupation_premium: PRICE_IDS.PREMIUM_AST,   // Wales
  ni_standard: PRICE_IDS.STANDARD_AST,       // Northern Ireland
  ni_premium: PRICE_IDS.PREMIUM_AST,         // Northern Ireland
};

/**
 * Validate required Stripe price environment variables on startup (dev-only)
 */
function validateStripePriceIds(): void {
  if (process.env.NODE_ENV === 'production') return;

  const requiredPriceIds = [
    { key: 'STRIPE_PRICE_ID_NOTICE_ONLY', value: PRICE_IDS.NOTICE_ONLY },
    { key: 'STRIPE_PRICE_ID_EVICTION_PACK', value: PRICE_IDS.EVICTION_PACK },
    { key: 'STRIPE_PRICE_ID_MONEY_CLAIM', value: PRICE_IDS.MONEY_CLAIM },
    { key: 'STRIPE_PRICE_ID_STANDARD_AST', value: PRICE_IDS.STANDARD_AST },
    { key: 'STRIPE_PRICE_ID_PREMIUM_AST', value: PRICE_IDS.PREMIUM_AST },
  ];

  const missingIds = requiredPriceIds.filter(({ value }) => !value || value === 'undefined');

  if (missingIds.length > 0) {
    logger.warn('[Stripe] Missing required price ID environment variables', {
      missing: missingIds.map(({ key }) => key),
    });
    console.warn(
      `[Stripe Checkout] WARNING: Missing Stripe price IDs: ${missingIds.map(({ key }) => key).join(', ')}. ` +
      'Checkout will fail until these are configured in .env.local'
    );
  }
}

// Run validation on module load (dev-only)
validateStripePriceIds();

// Validation schema
// Accepts both payment SKUs (ast_*) and display SKUs (prt_*, occupation_*, ni_*)
const createCheckoutSchema = z.object({
  product_type: z.enum([
    'notice_only', 'complete_pack', 'money_claim', 'sc_money_claim',
    'ast_standard', 'ast_premium',
    'tenancy_agreement', // Generic tenancy agreement (defaults to standard tier)
    // Jurisdiction-specific display SKUs
    'prt_standard', 'prt_premium',           // Scotland
    'occupation_standard', 'occupation_premium', // Wales
    'ni_standard', 'ni_premium',             // Northern Ireland
  ]),
  case_id: z.string().uuid().optional(),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
  // Attribution fields (Migration 012)
  landing_path: z.string().max(500).nullable().optional(),
  utm_source: z.string().max(200).nullable().optional(),
  utm_medium: z.string().max(200).nullable().optional(),
  utm_campaign: z.string().max(200).nullable().optional(),
  utm_term: z.string().max(200).nullable().optional(),
  utm_content: z.string().max(200).nullable().optional(),
  referrer: z.string().max(500).nullable().optional(),
  first_touch_at: z.string().nullable().optional(),
  ga_client_id: z.string().max(50).nullable().optional(),
});

// =============================================================================
// IDEMPOTENCY HELPERS
// =============================================================================

/**
 * Generate a deterministic idempotency key for Stripe API calls.
 * This ensures the same checkout request produces the same Stripe session.
 */
function generateIdempotencyKey(caseId: string, productType: string, userId: string): string {
  const input = `checkout:${caseId}:${productType}:${userId}`;
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 64);
}

/**
 * Check if a Stripe checkout session is still valid (not expired or completed).
 * Stripe sessions expire after 24 hours by default.
 */
async function isStripeSessionValid(sessionId: string): Promise<{ valid: boolean; url: string | null }> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Session is valid if it's still open (not completed, expired, or cancelled)
    if (session.status === 'open' && session.url) {
      return { valid: true, url: session.url };
    }

    return { valid: false, url: null };
  } catch (error: any) {
    // Session not found or other error - treat as invalid
    logger.warn('Failed to retrieve Stripe session', { sessionId, error: error.message });
    return { valid: false, url: null };
  }
}

/**
 * Response types for checkout idempotency
 */
interface CheckoutAlreadyPaidResponse {
  status: 'already_paid';
  redirect_url: string;
  order_id: string;
  message: string;
}

interface CheckoutPendingResponse {
  status: 'pending';
  checkout_url: string;
  session_id: string;
  order_id: string;
  message: string;
}

interface CheckoutNewResponse {
  status: 'new';
  success: true;
  session_id: string;
  session_url: string;
  order_id: string;
}

type CheckoutResponse = CheckoutAlreadyPaidResponse | CheckoutPendingResponse | CheckoutNewResponse;

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const body = await request.json();

    // Validate input
    const validationResult = createCheckoutSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      product_type,
      case_id,
      success_url,
      cancel_url,
      // Attribution fields
      landing_path,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      referrer,
      first_touch_at,
      ga_client_id,
    } = validationResult.data;

    // CRITICAL: Ensure user profile exists before creating order
    // This prevents foreign key constraint violations on orders table
    const profileResult = await ensureUserProfileExists({
      userId: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name || null,
      phone: user.user_metadata?.phone || null,
    });

    if (!profileResult.success) {
      logger.error('Failed to ensure user profile exists during checkout', {
        userId: user.id,
        error: profileResult.error,
      });
      return NextResponse.json(
        { error: 'Unable to prepare your account for checkout. Please refresh and try again.' },
        { status: 500 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const adminSupabase = createAdminClient();

    // Get or create Stripe customer (use admin client to ensure we can read user data)
    const { data: userData } = await adminSupabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userData?.email || user.email,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID (use admin client to bypass RLS)
      await adminSupabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Get Stripe price ID for this product
    const priceId = PRODUCT_TO_PRICE_ID[product_type];
    if (!priceId) {
      logger.error('Missing Stripe price ID for product', { productType: product_type });
      return NextResponse.json(
        { error: 'Product configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // GUARDRAIL: Validate price ID format (reject prod_ IDs in price slot)
    try {
      assertValidPriceId(priceId, `${product_type} product`);
    } catch (priceError) {
      if (priceError instanceof StripePriceIdError) {
        logger.error('Invalid Stripe price ID configuration', {
          productType: product_type,
          invalidId: priceError.invalidId,
          expectedPrefix: priceError.expectedPrefix,
          context: priceError.context,
        });
        return NextResponse.json(
          { error: 'Payment configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      throw priceError;
    }

    // Normalize display SKUs (prt_*, occupation_*, ni_*) to payment SKUs (ast_*)
    // This ensures orders are stored with consistent payment SKUs
    const normalizedProductType = normalizeToPaymentSku(product_type);

    // Get product details from source of truth (products.ts)
    // Map sc_money_claim to money_claim for product config lookup
    const productSku: ProductSku = normalizedProductType === 'sc_money_claim' ? 'sc_money_claim' : normalizedProductType as ProductSku;
    const product = PRODUCTS[productSku];

    // If case_id provided, validate jurisdiction match and ownership
    if (case_id) {
      // Use admin client for case lookup - case might have just been linked
      const { data: caseData, error: caseError } = await adminSupabase
        .from('cases')
        .select('jurisdiction, case_type, user_id, collected_facts')
        .eq('id', case_id)
        .single();

      if (caseError || !caseData) {
        logger.warn('Case not found for checkout', { caseId: case_id, userId: user.id });
        return NextResponse.json(
          { error: 'Case not found. Please ensure the case is linked to your account.' },
          { status: 404 }
        );
      }

      // Verify ownership - case must be linked to this user
      if (caseData.user_id !== user.id) {
        logger.warn('User attempted checkout for unowned case', {
          caseId: case_id,
          userId: user.id,
          caseOwnerId: caseData.user_id,
        });
        return NextResponse.json(
          { error: 'Case not found. Please ensure the case is linked to your account.' },
          { status: 404 }
        );
      }


      if (caseData) {
        const isTenancyAgreementCheckout = normalizedProductType === 'ast_standard' || normalizedProductType === 'ast_premium';
        const isTenancyAgreementCase =
          caseData.case_type === 'tenancy_agreement' ||
          (typeof caseData.case_type === 'string' && caseData.case_type.includes('tenancy_agreement'));

        // HARD GATE: Block tenancy checkout unless all critical tenancy facts are complete
        // Applies to all tenancy agreement variants (ast_standard, ast_premium, and future tenancy_agreement case types)
        if (isTenancyAgreementCheckout && isTenancyAgreementCase) {
          const collectedFacts = (caseData as any).collected_facts || {};
          const tenancyValidation = validateTenancyRequiredFacts(collectedFacts, {
            jurisdiction: (caseData as any).jurisdiction,
          });
          const missingTenancyFields = [
            ...tenancyValidation.missing_fields,
            ...tenancyValidation.invalid_fields,
          ];

          if (missingTenancyFields.length > 0) {
            logger.warn('Tenancy checkout blocked due to incomplete tenancy details', {
              caseId: case_id,
              userId: user.id,
              productType: product_type,
              normalizedProductType,
              missingFields: missingTenancyFields,
            });

            return NextResponse.json(
              {
                error: 'Incomplete tenancy details',
                missing_fields: missingTenancyFields,
                invalid_fields: tenancyValidation.invalid_fields,
              },
              { status: 400 }
            );
          }
        }
        // Check money claim jurisdiction restrictions
        if (product_type === 'money_claim' && !['england', 'wales'].includes(caseData.jurisdiction)) {
          return NextResponse.json(
            { error: 'England & Wales Money Claim Pack can only be purchased for England & Wales cases' },
            { status: 400 }
          );
        }

        if (product_type === 'sc_money_claim' && caseData.jurisdiction !== 'scotland') {
          return NextResponse.json(
            { error: 'Scotland Simple Procedure Pack can only be purchased for Scotland cases' },
            { status: 400 }
          );
        }

        if ((product_type === 'money_claim' || product_type === 'sc_money_claim') && caseData.jurisdiction === 'northern-ireland') {
          return NextResponse.json(
            { error: 'Money claim packs are not available for Northern Ireland' },
            { status: 400 }
          );
        }

        // Notice-only case validation: ensure rent schedule data is complete for arrears grounds
        if (product_type === 'notice_only') {
          const collectedFacts = (caseData as any).collected_facts || {};
          const noticeRoute = collectedFacts.selected_notice_route || collectedFacts.eviction_route || 'section_8';

          // Only validate Section 8 notices (which use grounds)
          if (noticeRoute === 'section_8') {
            const validation = validateNoticeOnlyCase(collectedFacts);

            if (!validation.valid) {
              logger.warn('Notice-only checkout blocked due to validation errors', {
                caseId: case_id,
                userId: user.id,
                errors: validation.errors,
                includedGrounds: validation.includedGrounds,
              });

              const primaryError = validation.errors[0];
              return NextResponse.json(
                {
                  error: primaryError.message,
                  code: primaryError.code,
                  details: {
                    includedGrounds: validation.includedGrounds,
                    includesArrearsGrounds: validation.includesArrearsGrounds,
                    arrearsScheduleComplete: validation.arrearsScheduleComplete,
                    errors: validation.errors,
                  },
                },
                { status: 422 }
              );
            }
          }
        }

        // =========================================================================
        // SECTION 21 PRECONDITION VALIDATION (HARD GATE)
        // For Section 21 complete_pack or notice_only, validate all statutory
        // preconditions are confirmed BEFORE allowing payment.
        // This prevents the "paid dead end" where users pay but can't get documents.
        // =========================================================================
        if (product_type === 'complete_pack' || product_type === 'notice_only') {
          const collectedFacts = (caseData as any).collected_facts || {};
          const section21Validation = validateSection21ForCheckout(
            collectedFacts,
            caseData.jurisdiction,
            product_type
          );

          if (!section21Validation.canCheckout && section21Validation.isSection21Case) {
            logger.warn('Section 21 checkout blocked due to missing preconditions', {
              caseId: case_id,
              userId: user.id,
              productType: product_type,
              missingConfirmations: section21Validation.missingConfirmations.map(c => c.errorCode),
              message: section21Validation.message,
            });

            return NextResponse.json(
              {
                error: section21Validation.message,
                code: 'SECTION21_PRECONDITIONS_MISSING',
                details: {
                  isSection21Case: section21Validation.isSection21Case,
                  section21Validation: section21Validation.section21Validation,
                  missingConfirmations: section21Validation.missingConfirmations,
                },
              },
              { status: 422 }
            );
          }

          // =========================================================================
          // COMPLIANCE TIMING VALIDATION (PRE-PAYMENT GATE)
          // For Section 21 cases, validate compliance timing BEFORE payment.
          // This prevents the scenario where user pays but documents can't be
          // generated due to timing violations (e.g., gas safety > 12 months old).
          //
          // Uses the SAME validation as document generation (fulfillment) to ensure
          // consistency. If this check passes, fulfillment should also pass.
          // =========================================================================
          if (section21Validation.isSection21Case) {
            const wizardFacts = collectedFacts as Record<string, unknown>;
            const timingData = buildComplianceTimingDataFromFacts(wizardFacts);
            const timingResult = validateComplianceTiming(timingData);

            if (!timingResult.isValid) {
              const blockingIssues = timingResult.issues.filter(i => i.severity === 'error');
              const sanitizedIssues = sanitizeComplianceIssues(blockingIssues);

              logger.warn('Checkout blocked - compliance timing violations detected', {
                caseId: case_id,
                userId: user.id,
                productType: product_type,
                issues: blockingIssues.map(i => i.field),
                tenancy_start_date: timingData.tenancy_start_date,
              });

              const response: ComplianceTimingBlockResponse = {
                ok: false,
                error: 'compliance_timing_block',
                code: 'COMPLIANCE_TIMING_BLOCK',
                issues: sanitizedIssues,
                tenancy_start_date: timingData.tenancy_start_date,
                message: "We can't process your order yet because some compliance requirements haven't been met. Please update the relevant dates in the wizard.",
              };

              return NextResponse.json(response, { status: 422 });
            }
          }
        }
      }
    }

    // =========================================================================
    // IDEMPOTENCY CHECK: Prevent double payment for same (case_id, product_type)
    // =========================================================================
    if (case_id) {
      // Check for existing orders for this case and product
      // Use normalizedProductType to match stored orders (which use payment SKUs)
      const { data: existingOrders, error: orderQueryError } = await adminSupabase
        .from('orders')
        .select('id, payment_status, stripe_session_id, stripe_checkout_url')
        .eq('case_id', case_id)
        .eq('product_type', normalizedProductType)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (orderQueryError) {
        logger.error('Failed to check existing orders', {
          caseId: case_id,
          productType: product_type,
          error: orderQueryError.message,
        });
        // Continue with checkout - don't block on query error
      } else if (existingOrders && existingOrders.length > 0) {
        // Check for PAID order first (highest priority)
        const paidOrder = existingOrders.find(o => o.payment_status === 'paid');
        if (paidOrder) {
          logger.info('Checkout blocked: already paid', {
            caseId: case_id,
            productType: product_type,
            orderId: paidOrder.id,
            userId: user.id,
          });

          const response: CheckoutAlreadyPaidResponse = {
            status: 'already_paid',
            redirect_url: `/dashboard/cases/${case_id}`,
            order_id: paidOrder.id,
            message: 'You have already purchased this product for this case.',
          };

          return NextResponse.json(response, { status: 200 });
        }

        // Check for PENDING order with valid Stripe session
        const pendingOrder = existingOrders.find(o =>
          o.payment_status === 'pending' && o.stripe_session_id
        );

        if (pendingOrder && pendingOrder.stripe_session_id) {
          // Check if the Stripe session is still valid
          const sessionCheck = await isStripeSessionValid(pendingOrder.stripe_session_id);

          if (sessionCheck.valid && sessionCheck.url) {
            logger.info('Reusing existing pending checkout session', {
              caseId: case_id,
              productType: product_type,
              orderId: pendingOrder.id,
              sessionId: pendingOrder.stripe_session_id,
              userId: user.id,
            });

            // Update the checkout URL in case it changed
            if (sessionCheck.url !== pendingOrder.stripe_checkout_url) {
              await adminSupabase
                .from('orders')
                .update({ stripe_checkout_url: sessionCheck.url })
                .eq('id', pendingOrder.id);
            }

            const response: CheckoutPendingResponse = {
              status: 'pending',
              checkout_url: sessionCheck.url,
              session_id: pendingOrder.stripe_session_id,
              order_id: pendingOrder.id,
              message: 'Resuming your previous checkout session.',
            };

            return NextResponse.json(response, { status: 200 });
          }

          // Session expired or invalid - mark order as failed and continue to create new one
          logger.info('Previous checkout session expired, creating new one', {
            caseId: case_id,
            productType: product_type,
            oldOrderId: pendingOrder.id,
            oldSessionId: pendingOrder.stripe_session_id,
            userId: user.id,
          });

          await adminSupabase
            .from('orders')
            .update({
              payment_status: 'failed',
              fulfillment_status: 'failed',
            })
            .eq('id', pendingOrder.id);
        }
      }
    }

    // =========================================================================
    // CREATE NEW ORDER AND STRIPE SESSION
    // =========================================================================

    // Generate idempotency key for Stripe API call (if case_id provided)
    // Use normalizedProductType for consistent idempotency keys
    const idempotencyKey = case_id
      ? generateIdempotencyKey(case_id, normalizedProductType, user.id)
      : undefined;

    // Create order record using admin client to avoid RLS issues
    // Amount comes from products.ts (source of truth) - already in GBP (e.g., 49.99)
    // Attribution fields are stored for revenue reporting (Migration 012)
    const orderPayload = {
        user_id: user.id,
        case_id: case_id || null,
        product_type: normalizedProductType, // Use normalized payment SKU for order storage
        product_name: product.label,
        amount: product.price,
        currency: 'GBP',
        total_amount: product.price,
        payment_status: 'pending',
        fulfillment_status: 'pending',
        // Attribution fields for revenue tracking (FIRST-TOUCH)
        landing_path: landing_path || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_term: utm_term || null,
        utm_content: utm_content || null,
        referrer: referrer || null,
        first_touch_at: first_touch_at || null,
        ga_client_id: ga_client_id || null,
      };

    let { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError?.code === 'PGRST204') {
      // Schema cache issue with attribution columns - retry without them
      logger.warn('Orders schema cache issue, retrying insert without attribution fields', {
        userId: user.id,
        caseId: case_id,
        productType: product_type,
        errorMessage: orderError.message,
      });

      // Remove all attribution fields that might be missing from schema cache
      const {
        first_touch_at: _ignoredFirstTouch,
        ga_client_id: _ignoredGaClientId,
        landing_path: _ignoredLandingPath,
        utm_source: _ignoredUtmSource,
        utm_medium: _ignoredUtmMedium,
        utm_campaign: _ignoredUtmCampaign,
        utm_term: _ignoredUtmTerm,
        utm_content: _ignoredUtmContent,
        referrer: _ignoredReferrer,
        ...fallbackPayload
      } = orderPayload;

      const retryResult = await adminSupabase
        .from('orders')
        .insert(fallbackPayload)
        .select()
        .single();

      order = retryResult.data;
      orderError = retryResult.error ?? null;
    }

    if (orderError) {
      logger.error('Failed to create order', {
        userId: user.id,
        caseId: case_id,
        productType: product_type,
        error: orderError.message,
        code: orderError.code,
        details: orderError.details,
      });

      // Provide actionable error message
      let errorMessage = 'Failed to create order. Please try again.';
      if (orderError.code === '23503') {
        // Foreign key violation
        errorMessage = 'Your account is not fully set up. Please refresh the page and try again.';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Create Stripe checkout session using price_data from products.ts (source of truth)
    // This ensures UI price and Stripe charge match exactly
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://landlordheaven.co.uk'
        : 'http://localhost:5000');

    // Use idempotency key if we have a case_id (prevents duplicate Stripe sessions)
    const stripeOptions = idempotencyKey ? { idempotencyKey } : undefined;

    // Convert price from GBP (e.g., 99.99) to pence (9999) for Stripe
    const unitAmountPence = Math.round(product.price * 100);

    const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: product.label,
                description: product.description,
              },
              unit_amount: unitAmountPence,
            },
            quantity: 1,
          },
        ],
        metadata: {
          user_id: user.id,
          order_id: (order as any).id,
          product_type,
          case_id: case_id || '',
          // Attribution for webhook processing (Stripe metadata max 500 chars per value)
          landing_path: (landing_path || '').substring(0, 500),
          utm_source: (utm_source || '').substring(0, 200),
          utm_medium: (utm_medium || '').substring(0, 200),
          utm_campaign: (utm_campaign || '').substring(0, 200),
          utm_term: (utm_term || '').substring(0, 200),
          utm_content: (utm_content || '').substring(0, 200),
          referrer: (referrer || '').substring(0, 500),
          first_touch_at: first_touch_at || '',
          ga_client_id: ga_client_id || '',
        },
        success_url: success_url || `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancel_url || `${baseUrl}/dashboard`,
        allow_promotion_codes: true,
      },
      stripeOptions
    );

    // Update order with Stripe session ID and checkout URL (use admin client)
    await adminSupabase
      .from('orders')
      .update({
        stripe_session_id: session.id,
        stripe_checkout_url: session.url,
      })
      .eq('id', (order as any).id);

    logger.info('Created new checkout session', {
      caseId: case_id,
      productType: product_type,
      orderId: (order as any).id,
      sessionId: session.id,
      userId: user.id,
      idempotencyKey: idempotencyKey ? 'used' : 'not-applicable',
    });

    const response: CheckoutNewResponse = {
      status: 'new',
      success: true,
      session_id: session.id,
      session_url: session.url!,
      order_id: (order as any).id,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
