/**
 * Checkout API - Create Session
 *
 * POST /api/checkout/create
 * Creates a Stripe checkout session for one-time purchases
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Product pricing configuration
const PRODUCT_PRICES = {
  notice_only: { amount: 2999, name: 'Notice Only Pack', description: 'Single eviction notice generation' },
  complete_pack: { amount: 14999, name: 'Complete Eviction Pack', description: 'All eviction documents + N5 claim form' },
  money_claim: { amount: 12999, name: 'Money Claim Pack', description: 'Complete money claim documents' },
  ast_standard: { amount: 3999, name: 'Standard AST Agreement', description: 'Basic assured shorthold tenancy agreement' },
  ast_premium: { amount: 5900, name: 'Premium AST Agreement', description: 'Comprehensive AST with all clauses' },
} as const;

// Validation schema
const createCheckoutSchema = z.object({
  product_type: z.enum(['notice_only', 'complete_pack', 'money_claim', 'ast_standard', 'ast_premium']),
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
    const supabase = await createServerSupabaseClient();

    // Get or create Stripe customer
    const { data: userData } = await supabase
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

      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Get product details
    const product = PRODUCT_PRICES[product_type];

    // Create order record
    const { data: order, error: orderError } = await supabase
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
      console.error('Failed to create order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
        order_id: order.id,
        product_type,
        case_id: case_id || '',
      },
      success_url: success_url || `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${baseUrl}/dashboard`,
    });

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    return NextResponse.json(
      {
        success: true,
        session_id: session.id,
        session_url: session.url,
        order_id: order.id,
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
