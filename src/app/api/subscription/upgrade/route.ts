/**
 * Subscription Upgrade API - Change Subscription Tier
 *
 * POST /api/subscription/upgrade - Upgrade/downgrade subscription tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpgradeSchema = z.object({
  newTier: z.enum(['hmo_pro_1_5', 'hmo_pro_6_10', 'hmo_pro_11_15', 'hmo_pro_16_20']),
});

// Upgrade or downgrade subscription tier
export async function POST(request: NextRequest) {
  try {
    const user = await requireServerAuth();

    const body = await request.json();
    const validationResult = UpgradeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error },
        { status: 400 }
      );
    }

    const { newTier } = validationResult.data;

    const supabase = createClient();

    // Get user's current subscription data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('stripe_subscription_id, subscription_tier, subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if (!profile.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    if (profile.subscription_tier === newTier) {
      return NextResponse.json(
        { error: 'Already on this tier' },
        { status: 400 }
      );
    }

    // Map tier to Stripe price ID
    const tierToPriceId: Record<string, string> = {
      'hmo_pro_1_5': process.env.STRIPE_PRICE_ID_HMO_PRO_1_5!,
      'hmo_pro_6_10': process.env.STRIPE_PRICE_ID_HMO_PRO_6_10!,
      'hmo_pro_11_15': process.env.STRIPE_PRICE_ID_HMO_PRO_11_15!,
      'hmo_pro_16_20': process.env.STRIPE_PRICE_ID_HMO_PRO_16_20!,
    };

    const newPriceId = tierToPriceId[newTier];

    if (!newPriceId) {
      return NextResponse.json(
        { error: 'Invalid tier configuration' },
        { status: 500 }
      );
    }

    // Import Stripe dynamically
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(
      profile.stripe_subscription_id
    );

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations', // Prorate the cost difference
      }
    );

    // Update user record with new tier
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user subscription tier:', updateError);
    }

    // Map tier to property limits for response
    const tierLimits: Record<string, { min: number; max: number; price: string }> = {
      'hmo_pro_1_5': { min: 1, max: 5, price: '£19.99' },
      'hmo_pro_6_10': { min: 6, max: 10, price: '£24.99' },
      'hmo_pro_11_15': { min: 11, max: 15, price: '£29.99' },
      'hmo_pro_16_20': { min: 16, max: 20, price: '£34.99' },
    };

    const tierInfo = tierLimits[newTier];

    return NextResponse.json({
      success: true,
      message: 'Subscription tier updated successfully',
      subscription: {
        tier: newTier,
        propertyLimit: tierInfo.max,
        price: tierInfo.price,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Subscription upgrade error:', error);

    return NextResponse.json(
      { error: 'Failed to update subscription', details: error.message },
      { status: 500 }
    );
  }
}
