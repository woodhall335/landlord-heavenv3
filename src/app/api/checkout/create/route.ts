/**
 * Checkout API - Create Session
 *
 * POST /api/checkout/create
 * Creates a Stripe checkout session for one-time purchases
 */

import { createServerSupabaseClient, createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { ensureUserProfileExists } from '@/lib/supabase/ensure-user';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Product pricing configuration
const PRODUCT_PRICES = {
  notice_only: { amount: 2999, name: 'Notice Only Pack', description: 'Single eviction notice generation', jurisdiction: 'england' },
  complete_pack: { amount: 14999, name: 'Complete Eviction Pack', description: 'All eviction documents + N5 claim form', jurisdiction: 'england' },
  money_claim: { amount: 17999, name: 'Money Claim Pack (England & Wales)', description: 'Complete money claim documents for England & Wales', jurisdiction: 'england' },
  sc_money_claim: { amount: 17999, name: 'Simple Procedure Pack (Scotland)', description: 'Complete Simple Procedure money claim documents for Scotland', jurisdiction: 'scotland' },
  ast_standard: { amount: 999, name: 'Standard AST Agreement', description: 'Basic assured shorthold tenancy agreement', jurisdiction: 'england' },
  ast_premium: { amount: 1499, name: 'Premium AST Agreement', description: 'Comprehensive AST with all clauses', jurisdiction: 'england' },
} as const;

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

    // Get product details
    const product = PRODUCT_PRICES[product_type];

    // If case_id provided, validate jurisdiction match and ownership
    if (case_id) {
      // Use admin client for case lookup - case might have just been linked
      const { data: caseData, error: caseError } = await adminSupabase
        .from('cases')
        .select('jurisdiction, case_type, user_id')
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
      }
    }

    // Create order record using admin client to avoid RLS issues
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert({
        user_id: user.id,
        case_id: case_id || null,
        product_type,
        product_name: product.name,
        amount: product.amount / 100,
        currency: 'GBP',
        total_amount: product.amount / 100,
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

    // Create Stripe checkout session
    // Use NEXT_PUBLIC_APP_URL in production, fallback to localhost only in development
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
          price_data: {
            currency: 'gbp',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount,
          },
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
