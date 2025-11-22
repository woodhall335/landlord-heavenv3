/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe
 * Handles all Stripe webhook events
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Handle the event
    switch (event.type) {
      // ========================================================================
      // ONE-TIME PAYMENT EVENTS
      // ========================================================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'payment') {
          // Handle one-time payment
          const userId = session.metadata?.user_id;
          const orderId = session.metadata?.order_id;

          if (!userId || !orderId) {
            console.error('Missing metadata in checkout session');
            break;
          }

          // Update order status
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              stripe_payment_intent_id: session.payment_intent as string,
              paid_at: new Date().toISOString(),
              fulfillment_status: 'processing',
            })
            .eq('id', orderId);

          console.log(`[Stripe] Payment successful for order: ${orderId}`);
        } else if (session.mode === 'subscription') {
          // Handle subscription checkout
          const userId = session.metadata?.user_id;
          const tier = session.metadata?.tier;
          const subscriptionId = session.subscription as string;

          if (!userId) {
            console.error('Missing user_id in subscription session');
            break;
          }

          // Calculate trial end date (7 days from now)
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + 7);

          // Update user with subscription details
          await supabase
            .from('users')
            .update({
              hmo_pro_active: true,
              hmo_pro_tier: tier,
              hmo_pro_trial_ends_at: trialEndsAt.toISOString(),
              stripe_subscription_id: subscriptionId,
            })
            .eq('id', userId);

          console.log(`[Stripe] Subscription activated for user: ${userId}`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Stripe] PaymentIntent succeeded: ${paymentIntent.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Find order by payment intent
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (orders && orders.length > 0) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              fulfillment_status: 'failed',
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);
        }

        console.log(`[Stripe] PaymentIntent failed: ${paymentIntent.id}`);
        break;
      }

      // ========================================================================
      // SUBSCRIPTION EVENTS
      // ========================================================================
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabase
            .from('users')
            .update({
              stripe_subscription_id: subscription.id,
            })
            .eq('id', userId);
        }

        console.log(`[Stripe] Subscription created: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) break;

        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        // Calculate subscription end date
        let subscriptionEndsAt = null;
        if (subscription.current_period_end) {
          subscriptionEndsAt = new Date(subscription.current_period_end * 1000).toISOString();
        }

        await supabase
          .from('users')
          .update({
            hmo_pro_active: isActive,
            hmo_pro_subscription_ends_at: subscriptionEndsAt,
          })
          .eq('id', userId);

        console.log(`[Stripe] Subscription updated: ${subscription.id}, Active: ${isActive}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) break;

        // Deactivate HMO Pro
        await supabase
          .from('users')
          .update({
            hmo_pro_active: false,
            stripe_subscription_id: null,
            hmo_pro_subscription_ends_at: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log(`[Stripe] Subscription cancelled: ${subscription.id}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Retrieve subscription to get user_id
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.user_id;

          if (userId) {
            await supabase
              .from('users')
              .update({
                hmo_pro_active: true,
              })
              .eq('id', userId);
          }
        }

        console.log(`[Stripe] Invoice paid: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Retrieve subscription to get user_id
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.user_id;

          if (userId) {
            // Deactivate on payment failure
            await supabase
              .from('users')
              .update({
                hmo_pro_active: false,
              })
              .eq('id', userId);
          }
        }

        console.log(`[Stripe] Invoice payment failed: ${invoice.id}`);
        break;
      }

      // ========================================================================
      // CUSTOMER EVENTS
      // ========================================================================
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        const userId = customer.metadata?.user_id;

        if (userId) {
          await supabase
            .from('users')
            .update({
              stripe_customer_id: customer.id,
            })
            .eq('id', userId);
        }

        console.log(`[Stripe] Customer created: ${customer.id}`);
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json(
      { received: true, event: event.type },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', message: error.message },
      { status: 500 }
    );
  }
}
