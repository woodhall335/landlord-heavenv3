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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// HMO Pro subscription tiers
const HMO_PRO_TIERS = {
  starter: { price_id: process.env.STRIPE_HMO_STARTER_PRICE_ID!, amount: 1999, name: 'HMO Pro Starter', max_properties: 3 },
  growth: { price_id: process.env.STRIPE_HMO_GROWTH_PRICE_ID!, amount: 2499, name: 'HMO Pro Growth', max_properties: 10 },
  professional: { price_id: process.env.STRIPE_HMO_PROFESSIONAL_PRICE_ID!, amount: 2999, name: 'HMO Pro Professional', max_properties: 25 },
  enterprise: { price_id: process.env.STRIPE_HMO_ENTERPRISE_PRICE_ID!, amount: 3499, name: 'HMO Pro Enterprise', max_properties: 999 },
} as const;

// Validation schema
const createSubscriptionSchema = z.object({
  tier: z.enum(['starter', 'growth', 'professional', 'enterprise']),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
