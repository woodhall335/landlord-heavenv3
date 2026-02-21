/**
 * Checkout API - Subscription
 *
 * POST /api/checkout/subscription
 * Creates a Stripe checkout session for HMO Pro subscription
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { HMO_PRO_DISABLED_RESPONSE, HMO_PRO_ENABLED } from '@/lib/feature-flags';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-12-15.clover',
});

// HMO Pro subscription tiers (aligned with .env.example naming)
const HMO_PRO_TIERS = HMO_PRO_ENABLED
  ? {
      starter: { price_id: process.env.STRIPE_PRICE_ID_HMO_PRO_1_5!, amount: 1999, name: 'HMO Pro Starter (1-5 properties)', max_properties: 5 },
      growth: { price_id: process.env.STRIPE_PRICE_ID_HMO_PRO_6_10!, amount: 2499, name: 'HMO Pro Growth (6-10 properties)', max_properties: 10 },
      professional: { price_id: process.env.STRIPE_PRICE_ID_HMO_PRO_11_15!, amount: 2999, name: 'HMO Pro Professional (11-15 properties)', max_properties: 15 },
      enterprise: { price_id: process.env.STRIPE_PRICE_ID_HMO_PRO_16_20!, amount: 3499, name: 'HMO Pro Enterprise (16-20 properties)', max_properties: 20 },
    } as const
  : null;

// Validation schema
const createSubscriptionSchema = z.object({
  tier: z.enum(['starter', 'growth', 'professional', 'enterprise']),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    if (!HMO_PRO_ENABLED) {
      return NextResponse.json(HMO_PRO_DISABLED_RESPONSE, { status: 403 });
    }

    const user = await requireServerAuth();
    const body = await request.json();

    // Validate input
    const validationResult = createSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { tier, success_url, cancel_url } = validationResult.data;

    if (!HMO_PRO_TIERS) {
      return NextResponse.json(HMO_PRO_DISABLED_RESPONSE, { status: 403 });
    }
    const supabase = await createServerSupabaseClient();

    // Check if user already has active subscription
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, email, hmo_pro_active, stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (userData?.hmo_pro_active && userData?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

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

    // Get tier details
    const tierDetails = HMO_PRO_TIERS[tier];

    // Create Stripe checkout session for subscription
    // Use NEXT_PUBLIC_APP_URL in production, fallback to localhost only in development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://landlordheaven.co.uk'
        : 'http://localhost:5000');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierDetails.price_id,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: user.id,
          tier,
        },
      },
      metadata: {
        user_id: user.id,
        tier,
      },
      success_url: success_url || `${baseUrl}/dashboard/hmo?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${baseUrl}/dashboard/hmo`,
    });

    return NextResponse.json(
      {
        success: true,
        session_id: session.id,
        session_url: session.url,
        tier,
        trial_days: 7,
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

    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
