/**
 * Subscription Resume API - Resume Cancelled Subscription
 *
 * POST /api/subscription/resume - Resume a subscription that was set to cancel
 */

import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Resume a canceled subscription (before period end)
export async function POST() {
  try {
    const user = await requireServerAuth();

    const supabase = await createClient();

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
        { error: 'No subscription found' },
        { status: 400 }
      );
    }

    if (profile.subscription_status !== 'canceled') {
      return NextResponse.json(
        { error: 'Subscription is not set to cancel' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-12-15.clover',
    });

    // Resume subscription by removing cancel_at_period_end flag
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    );

    // Update user record to active status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user subscription status:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription resumed successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Subscription resume error:', error);

    return NextResponse.json(
      { error: 'Failed to resume subscription', details: error.message },
      { status: 500 }
    );
  }
}
