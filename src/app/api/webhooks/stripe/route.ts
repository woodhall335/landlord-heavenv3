/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe
 * Handles all Stripe webhook events
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendPurchaseConfirmation } from '@/lib/email/resend';
import { logger } from '@/lib/logger';
import { fulfillOrder } from '@/lib/payments/fulfillment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function redactStripePayload(event: Stripe.Event) {
  const dataObject = event.data.object as any;
  return {
    id: event.id,
    type: event.type,
    created: event.created,
    data: {
      object: {
        id: dataObject?.id,
        metadata: dataObject?.metadata,
        payment_intent: dataObject?.payment_intent,
        customer: dataObject?.customer,
        subscription: dataObject?.subscription,
        mode: dataObject?.mode,
      },
    },
  };
}

async function findOrderForCheckoutSession(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session,
) {
  const orderId = session.metadata?.order_id;
  if (orderId) {
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    return order;
  }

  if (session.id) {
    const { data: orderBySession } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', session.id)
      .maybeSingle();
    if (orderBySession) return orderBySession;
  }

  if (session.payment_intent) {
    const { data: orderByIntent } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', session.payment_intent as string)
      .maybeSingle();
    if (orderByIntent) return orderByIntent;
  }

  return null;
}

async function findOrderForPaymentIntent(
  supabase: ReturnType<typeof createAdminClient>,
  paymentIntent: Stripe.PaymentIntent,
) {
  const orderId = paymentIntent.metadata?.order_id;
  if (orderId) {
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    return order;
  }

  const { data: orderByIntent } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .maybeSingle();

  return orderByIntent;
}

export async function POST(request: Request) {
  let eventId: string | null = null;
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logger.error('Missing stripe-signature header');
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
      logger.error('Webhook signature verification failed', { error: err.message });
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    eventId = event.id;
    logger.info('Stripe webhook received', { eventType: event.type });

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    const { data: existingLog } = await supabase
      .from('webhook_logs')
      .select('id, status')
      .eq('stripe_event_id', event.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingLog && ['processing', 'completed'].includes(existingLog.status)) {
      return NextResponse.json(
        { received: true, event: event.type, duplicate: true },
        { status: 200 }
      );
    }

    const receivedAt = new Date().toISOString();
    const { data: logRow } = await supabase
      .from('webhook_logs')
      .insert({
        event_type: event.type,
        stripe_event_id: event.id,
        payload: redactStripePayload(event),
        status: 'received',
        received_at: receivedAt,
      })
      .select('id')
      .single();

    const logId = logRow?.id;
    if (logId) {
      await supabase
        .from('webhook_logs')
        .update({ status: 'processing' })
        .eq('id', logId);
    }

    let processingResult = 'unhandled_event';

    // Handle the event
    switch (event.type) {
      // ========================================================================
      // ONE-TIME PAYMENT EVENTS
      // ========================================================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'payment') {
          const caseId = session.metadata?.case_id || null;
          const productType = session.metadata?.product_type || session.metadata?.product || null;
          const userId = session.metadata?.user_id || null;

          const order = await findOrderForCheckoutSession(supabase, session);

          if (!order) {
            throw new Error('Order not found for checkout session');
          }

          if ((order as any).payment_status !== 'paid') {
            await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                stripe_payment_intent_id: session.payment_intent as string,
                stripe_session_id: session.id,
                paid_at: new Date().toISOString(),
                fulfillment_status: 'ready_to_generate',
              })
              .eq('id', (order as any).id);
          }

          const resolvedCaseId = caseId || (order as any).case_id;
          const resolvedProductType = productType || (order as any).product_type;

          if (resolvedCaseId && resolvedProductType) {
            await supabase
              .from('orders')
              .update({ fulfillment_status: 'processing' })
              .eq('id', (order as any).id);

            try {
              const fulfillment = await fulfillOrder({
                orderId: (order as any).id,
                caseId: resolvedCaseId,
                productType: resolvedProductType,
                userId,
              });
              processingResult = fulfillment.status;
            } catch (fulfillmentError: any) {
              await supabase
                .from('orders')
                .update({ fulfillment_status: 'failed' })
                .eq('id', (order as any).id);
              throw fulfillmentError;
            }
          } else {
            processingResult = 'order_paid_without_fulfillment';
          }

          // Send purchase confirmation email
          try {
            const { data: orderRow } = await supabase
              .from('orders')
              .select('*, user_id')
              .eq('id', (order as any).id)
              .single();

            if (orderRow && userId) {
              const { data: user } = await supabase
                .from('users')
                .select('email, full_name')
                .eq('id', userId)
                .single();

              if (user?.email) {
                const dashboardUrl = resolvedCaseId
                  ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk'}/dashboard/cases/${resolvedCaseId}`
                  : `${process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk'}/dashboard`;

                await sendPurchaseConfirmation({
                  to: user.email,
                  customerName: user.full_name || 'there',
                  productName: (orderRow as any).product_name,
                  amount: Math.round((orderRow as any).total_amount * 100),
                  orderNumber: (orderRow as any).id.substring(0, 8).toUpperCase(),
                  downloadUrl: dashboardUrl,
                });
              }
            }
          } catch (emailError: any) {
            console.error('[Email] Failed to send purchase confirmation:', emailError);
          }
        } else if (session.mode === 'subscription') {
          const userId = session.metadata?.user_id;
          const tier = session.metadata?.tier;
          const subscriptionId = session.subscription as string;

          if (!userId) {
            throw new Error('Missing user_id in subscription session');
          }

          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + 7);

          await supabase
            .from('users')
            .update({
              hmo_pro_active: true,
              hmo_pro_tier: tier,
              hmo_pro_trial_ends_at: trialEndsAt.toISOString(),
              stripe_subscription_id: subscriptionId,
            })
            .eq('id', userId);

          processingResult = 'subscription_activated';
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const order = await findOrderForPaymentIntent(supabase, paymentIntent);

        if (order) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              stripe_payment_intent_id: paymentIntent.id,
              paid_at: new Date().toISOString(),
              fulfillment_status: 'ready_to_generate',
            })
            .eq('id', (order as any).id);

          processingResult = 'payment_intent_paid';
        } else {
          processingResult = 'payment_intent_no_order';
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            fulfillment_status: 'failed',
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        processingResult = 'payment_intent_failed';
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

        processingResult = 'subscription_created';
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) break;

        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        let subscriptionEndsAt = null;
        if ((subscription as any).current_period_end) {
          subscriptionEndsAt = new Date((subscription as any).current_period_end * 1000).toISOString();
        }

        await supabase
          .from('users')
          .update({
            hmo_pro_active: isActive,
            hmo_pro_subscription_ends_at: subscriptionEndsAt,
          })
          .eq('id', userId);

        processingResult = 'subscription_updated';
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) break;

        await supabase
          .from('users')
          .update({
            hmo_pro_active: false,
            stripe_subscription_id: null,
            hmo_pro_subscription_ends_at: new Date().toISOString(),
          })
          .eq('id', userId);

        processingResult = 'subscription_cancelled';
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.user_id;

          if (userId) {
            await supabase
              .from('users')
              .update({ hmo_pro_active: true })
              .eq('id', userId);
          }
        }

        processingResult = 'invoice_paid';
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.user_id;

          if (userId) {
            await supabase
              .from('users')
              .update({ hmo_pro_active: false })
              .eq('id', userId);
          }
        }

        processingResult = 'invoice_failed';
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

        processingResult = 'customer_created';
        break;
      }

      default:
        processingResult = 'ignored';
    }

    if (logId) {
      await supabase
        .from('webhook_logs')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          processing_result: processingResult,
        })
        .eq('id', logId);
    }

    return NextResponse.json(
      { received: true, event: event.type },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Stripe webhook error', { error: error?.message });
    try {
      const supabase = createAdminClient();
      if (eventId) {
        await supabase
          .from('webhook_logs')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            processing_result: 'error',
            error_message: error?.message || 'Webhook processing error',
          })
          .eq('stripe_event_id', eventId);
      }
    } catch (logError) {
      logger.error('Failed to update webhook log', { error: (logError as Error)?.message });
    }
    return NextResponse.json(
      { error: 'Webhook handler failed', message: error.message },
      { status: 500 }
    );
  }
}
