/**
 * Subscription Status API - Get Current Subscription Details
 *
 * GET /api/subscription/status - Get user's current subscription status
 */

import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';
import { HMO_PRO_DISABLED_RESPONSE, HMO_PRO_ENABLED } from '@/lib/feature-flags';

// Get current subscription status
export async function GET() {
  try {
    if (!HMO_PRO_ENABLED) {
      return NextResponse.json(HMO_PRO_DISABLED_RESPONSE, { status: 403 });
    }

    const user = await requireServerAuth();

    const supabase = await createClient();

    // Get user's subscription data
    const { data: profile, error } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch subscription status' },
        { status: 500 }
      );
    }

    // Check if subscription is active
    const isActive = profile.subscription_status === 'active';
    const isTrialing = profile.subscription_status === 'trialing';
    const isCanceled = profile.subscription_status === 'canceled';

    // Check if trial is still valid
    let trialDaysRemaining = null;
    if (isTrialing && profile.trial_ends_at) {
      const trialEnd = new Date(profile.trial_ends_at);
      const now = new Date();
      const diffTime = trialEnd.getTime() - now.getTime();
      trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (trialDaysRemaining < 0) {
        trialDaysRemaining = 0;
      }
    }

    // Get property count for tier limits
    const { count: propertyCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Determine property limit based on tier
    const tierLimits: Record<string, number> = {
      'hmo_pro_1_5': 5,
      'hmo_pro_6_10': 10,
      'hmo_pro_11_15': 15,
      'hmo_pro_16_20': 20,
    };

    const propertyLimit = profile.subscription_tier
      ? tierLimits[profile.subscription_tier] || 0
      : 0;

    return NextResponse.json({
      subscription: {
        tier: profile.subscription_tier,
        status: profile.subscription_status,
        isActive,
        isTrialing,
        isCanceled,
        trialEndsAt: profile.trial_ends_at,
        trialDaysRemaining,
        stripeCustomerId: profile.stripe_customer_id,
        stripeSubscriptionId: profile.stripe_subscription_id,
        propertyCount: propertyCount || 0,
        propertyLimit,
        canAddProperties: (propertyCount || 0) < propertyLimit,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
