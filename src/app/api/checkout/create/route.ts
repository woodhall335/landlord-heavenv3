/**
 * Checkout API - Create Session
 *
 * POST /api/checkout/create
 * Creates a Stripe checkout session for one-time purchases
 *
 * IMPORTANT: Prices are controlled in Stripe Dashboard.
 * Product metadata comes from src/lib/pricing/products.ts (source of truth).
 * Stripe Price IDs come from environment variables via src/lib/stripe/index.ts.
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

/**
 * Map product types to Stripe Price IDs
 * Note: sc_money_claim uses the same Stripe price as money_claim (both £199.99)
 */
const PRODUCT_TO_PRICE_ID: Record<string, string> = {
  notice_only: PRICE_IDS.NOTICE_ONLY,
  complete_pack: PRICE_IDS.EVICTION_PACK,
  money_claim: PRICE_IDS.MONEY_CLAIM,
  sc_money_claim: PRICE_IDS.MONEY_CLAIM, // Same price as England/Wales money claim
  ast_standard: PRICE_IDS.STANDARD_AST,
  ast_premium: PRICE_IDS.PREMIUM_AST,
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
const createCheckoutSchema = z.object({
  product_type: z.enum(['notice_only', 'complete_pack', 'money_claim', 'sc_money_claim', 'ast_standard', 'ast_premium']),
  case_id: z.string().uuid().optional(),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
});

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

    const { product_type, case_id, success_url, cancel_url } = validationResult.data;

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

    // Get product details from source of truth (products.ts)
    // Map sc_money_claim to money_claim for product config lookup
    const productSku: ProductSku = product_type === 'sc_money_claim' ? 'sc_money_claim' : product_type as ProductSku;
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
      }
    }

    // Create order record using admin client to avoid RLS issues
    // Amount comes from products.ts (source of truth) - already in GBP (e.g., 39.99)
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert({
        user_id: user.id,
        case_id: case_id || null,
        product_type,
        product_name: product.label,
        amount: product.price,
        currency: 'GBP',
        total_amount: product.price,
        payment_status: 'pending',
        fulfillment_status: 'pending',
      })
      .select()
      .single();

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

    // Create Stripe checkout session using Stripe Price ID
    // Price is controlled in Stripe Dashboard - no hardcoded amounts
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://landlordheaven.co.uk'
        : 'http://localhost:5000');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        order_id: (order as any).id,
        product_type,
        case_id: case_id || '',
      },
      success_url: success_url || `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${baseUrl}/dashboard`,
      allow_promotion_codes: true,
    });

    // Update order with Stripe session ID (use admin client)
    await adminSupabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', (order as any).id);

    return NextResponse.json(
      {
        success: true,
        session_id: session.id,
        session_url: session.url,
        order_id: (order as any).id,
      },
      { status: 200 }
    );
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
