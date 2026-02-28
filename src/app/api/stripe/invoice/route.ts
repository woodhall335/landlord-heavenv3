/**
 * Stripe Invoice/Receipt API
 *
 * GET /api/stripe/invoice?payment_intent_id=pi_xxx
 * Retrieves the receipt URL for a one-time payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing payment_intent_id parameter' },
        { status: 400 }
      );
    }

    // Validate payment intent ID format
    if (!paymentIntentId.startsWith('pi_')) {
      return NextResponse.json(
        { error: 'Invalid payment_intent_id format' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the payment intent belongs to this user via the orders table
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found or unauthorized' },
        { status: 404 }
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    });

    // Get the receipt URL from the latest charge
    const latestCharge = paymentIntent.latest_charge;

    if (!latestCharge || typeof latestCharge === 'string') {
      // If latest_charge is just a string ID, retrieve the full charge
      const chargeId = typeof latestCharge === 'string' ? latestCharge : null;

      if (chargeId) {
        const charge = await stripe.charges.retrieve(chargeId);
        return NextResponse.json({
          receipt_url: charge.receipt_url,
          order_id: order.id,
        });
      }

      return NextResponse.json(
        { error: 'No charge found for this payment' },
        { status: 404 }
      );
    }

    // latestCharge is the expanded Charge object
    return NextResponse.json({
      receipt_url: latestCharge.receipt_url,
      order_id: order.id,
    });
  } catch (error: any) {
    console.error('Error fetching invoice/receipt:', error);

    // Handle Stripe errors gracefully
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}
