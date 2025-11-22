/**
 * Subscription Cancel API - Cancel Subscription at Period End
 *
 * POST /api/subscription/cancel - Cancel user's subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';

// Cancel subscription at period end
export async function POST(request: NextRequest) {
  try {
    const user = await requireServerAuth();

    const supabase = createClient();

    // Get user's subscription data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('stripe_subscription_id, subscription_status')
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

    if (profile.subscription_status === 'canceled') {
      return NextResponse.json(
        { error: 'Subscription is already canceled' },
        { status: 400 }
      );
    }

    // Import Stripe dynamically to avoid bundling it
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Cancel subscription at period end (not immediately)
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user subscription status:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Subscription cancellation error:', error);

    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}
