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
import { getOrCreateWizardFacts, updateWizardFacts } from '@/lib/case-facts/store';
import {
  sendServerPurchaseEventWithRetry,
  generateClientId,
  isMeasurementProtocolConfigured,
} from '@/lib/analytics/measurement-protocol';

/**
 * Error codes that indicate a validation/business rule failure.
 * These should NOT trigger Stripe retries (return 200).
 */
const VALIDATION_ERROR_PATTERNS = [
  'NOTICE_ONLY_VALIDATION_FAILED',
  'EVICTION_PACK_VALIDATION_FAILED',
  'GROUND_REQUIRED_FACT_MISSING',
  'MISSING_REQUIRED_FIELDS',
  'VALIDATION_FAILED',
  'ELIGIBILITY_FAILED',
  'COMPLIANCE_TIMING_BLOCK', // Section 21 compliance timing violations
  'Case not found',
  'Unable to resolve user',
  'Unsupported product type',
];

/**
 * Check if an error is a validation/business error vs a transient/server error.
 * Validation errors should return 200 (don't retry).
 * Server errors should return 500 (Stripe will retry).
 */
function isValidationError(error: Error | unknown): boolean {
  const message = (error as Error)?.message || String(error);
  return VALIDATION_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

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

async function updateCaseEntitlements(
  supabase: ReturnType<typeof createAdminClient>,
  caseId: string,
  purchasedProduct: string,
) {
  try {
    const currentFacts = await getOrCreateWizardFacts(supabase as any, caseId);
    const currentMeta = currentFacts.__meta || {};
    const currentEntitlements = Array.isArray(currentMeta.entitlements)
      ? currentMeta.entitlements
      : [];
    const entitlements = Array.from(
      new Set([...currentEntitlements, purchasedProduct].filter(Boolean))
    );

    await updateWizardFacts(
      supabase as any,
      caseId,
      (current) => current,
      {
        meta: {
          ...currentMeta,
          purchased_product: purchasedProduct,
          entitlements,
        },
      },
    );
  } catch (error) {
    logger.warn('Failed to persist case entitlements', { caseId, error });
  }
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

          // Extract attribution from Stripe metadata (Migration 012)
          const stripeAttribution = {
            landing_path: session.metadata?.landing_path || null,
            utm_source: session.metadata?.utm_source || null,
            utm_medium: session.metadata?.utm_medium || null,
            utm_campaign: session.metadata?.utm_campaign || null,
            utm_term: session.metadata?.utm_term || null,
            utm_content: session.metadata?.utm_content || null,
            referrer: session.metadata?.referrer || null,
            first_touch_at: session.metadata?.first_touch_at || null,
            ga_client_id: session.metadata?.ga_client_id || null,
          };

          const order = await findOrderForCheckoutSession(supabase, session);

          if (!order) {
            throw new Error('Order not found for checkout session');
          }

          if ((order as any).payment_status !== 'paid') {
            // Build update object - FIRST-TOUCH: only set attribution if not already present
            const orderUpdate: Record<string, any> = {
              payment_status: 'paid',
              stripe_payment_intent_id: session.payment_intent as string,
              stripe_session_id: session.id,
              paid_at: new Date().toISOString(),
              fulfillment_status: 'ready_to_generate',
            };

            // Only backfill attribution if not already set (FIRST-TOUCH preservation)
            // This handles edge case where order was created before attribution was available
            if (!(order as any).landing_path && stripeAttribution.landing_path) {
              orderUpdate.landing_path = stripeAttribution.landing_path;
            }
            if (!(order as any).utm_source && stripeAttribution.utm_source) {
              orderUpdate.utm_source = stripeAttribution.utm_source;
            }
            if (!(order as any).utm_medium && stripeAttribution.utm_medium) {
              orderUpdate.utm_medium = stripeAttribution.utm_medium;
            }
            if (!(order as any).utm_campaign && stripeAttribution.utm_campaign) {
              orderUpdate.utm_campaign = stripeAttribution.utm_campaign;
            }
            if (!(order as any).utm_term && stripeAttribution.utm_term) {
              orderUpdate.utm_term = stripeAttribution.utm_term;
            }
            if (!(order as any).utm_content && stripeAttribution.utm_content) {
              orderUpdate.utm_content = stripeAttribution.utm_content;
            }
            if (!(order as any).referrer && stripeAttribution.referrer) {
              orderUpdate.referrer = stripeAttribution.referrer;
            }
            if (!(order as any).first_touch_at && stripeAttribution.first_touch_at) {
              orderUpdate.first_touch_at = stripeAttribution.first_touch_at;
            }
            if (!(order as any).ga_client_id && stripeAttribution.ga_client_id) {
              orderUpdate.ga_client_id = stripeAttribution.ga_client_id;
            }

            await supabase
              .from('orders')
              .update(orderUpdate)
              .eq('id', (order as any).id);
          }

          const resolvedCaseId = caseId || (order as any).case_id;
          const resolvedProductType = productType || (order as any).product_type;

          if (resolvedCaseId && resolvedProductType) {
            await updateCaseEntitlements(
              supabase,
              resolvedCaseId,
              resolvedProductType,
            );

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
              // Persist error message in order metadata for debugging and user display
              const errorMessage = fulfillmentError?.message || 'Document generation failed';
              const truncatedError = errorMessage.substring(0, 500);

              // Classify the error
              const isValidation = isValidationError(fulfillmentError);
              const errorType = isValidation ? 'validation' : 'server';

              // Check for compliance timing block specifically
              const isComplianceBlock = fulfillmentError?.code === 'COMPLIANCE_TIMING_BLOCK';
              const complianceIssues = isComplianceBlock ? fulfillmentError.issues : null;

              logger.error('Fulfillment error', {
                orderId: (order as any).id,
                caseId: resolvedCaseId,
                productType: resolvedProductType,
                errorType,
                error: truncatedError,
                ...(isComplianceBlock && {
                  complianceBlock: true,
                  issues: complianceIssues?.map((i: { field: string }) => i.field) || [],
                }),
              });

              // Build order update with failure details
              // Store compliance issues in fulfillment_error_details for user display
              const orderUpdate: Record<string, unknown> = {
                fulfillment_status: 'failed',
              };

              // If compliance timing block, persist the structured issues
              if (isComplianceBlock && complianceIssues) {
                orderUpdate.fulfillment_error_details = {
                  code: 'COMPLIANCE_TIMING_BLOCK',
                  message: fulfillmentError.message || 'Compliance timing violations detected',
                  issues: complianceIssues,
                  failed_at: new Date().toISOString(),
                };
              }

              // Mark order as failed with optional error details
              await supabase
                .from('orders')
                .update(orderUpdate)
                .eq('id', (order as any).id);

              // For validation errors, DON'T throw - return 200 so Stripe doesn't retry
              // The order is marked as failed, user can see it in dashboard
              if (isValidation || isComplianceBlock) {
                processingResult = isComplianceBlock
                  ? 'fulfillment_compliance_block'
                  : 'fulfillment_validation_failed';
                // Don't throw - continue to return 200
              } else {
                // For server/transient errors, throw to return 500 (Stripe will retry)
                throw fulfillmentError;
              }
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

          // Send server-side GA4 purchase event (bypasses ad blockers)
          // This is a fallback - client-side event may also fire
          // GA4 deduplicates by transaction_id
          if (isMeasurementProtocolConfigured()) {
            try {
              const { data: orderForGA } = await supabase
                .from('orders')
                .select('*')
                .eq('id', (order as any).id)
                .single();

              if (orderForGA) {
                await sendServerPurchaseEventWithRetry({
                  // Use stored GA client ID or generate a server-side one
                  clientId: (orderForGA as any).ga_client_id || generateClientId(),
                  transactionId: (orderForGA as any).id,
                  value: (orderForGA as any).total_amount || 0,
                  currency: (orderForGA as any).currency || 'GBP',
                  items: [
                    {
                      item_id: (orderForGA as any).product_type,
                      item_name: (orderForGA as any).product_name,
                      price: (orderForGA as any).total_amount,
                      quantity: 1,
                      item_category: 'legal_document',
                    },
                  ],
                  // Attribution from stored order data
                  utm_source: (orderForGA as any).utm_source || undefined,
                  utm_medium: (orderForGA as any).utm_medium || undefined,
                  utm_campaign: (orderForGA as any).utm_campaign || undefined,
                  utm_term: (orderForGA as any).utm_term || undefined,
                  utm_content: (orderForGA as any).utm_content || undefined,
                  landing_path: (orderForGA as any).landing_path || undefined,
                  product_type: (orderForGA as any).product_type || undefined,
                  userId: userId || undefined,
                });

                logger.info('Server-side GA4 purchase event sent', {
                  orderId: (order as any).id,
                  value: (orderForGA as any).total_amount,
                });
              }
            } catch (gaError: any) {
              // Non-critical - log but don't fail the webhook
              logger.warn('Failed to send server-side GA4 event', {
                orderId: (order as any).id,
                error: gaError.message,
              });
            }
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
    const errorMessage = error?.message || 'Webhook processing error';
    const isValidation = isValidationError(error);
    const errorType = isValidation ? 'validation' : 'server';

    logger.error('Stripe webhook error', {
      eventId,
      errorType,
      error: errorMessage,
    });

    try {
      const supabase = createAdminClient();
      if (eventId) {
        await supabase
          .from('webhook_logs')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            processing_result: isValidation ? 'validation_error' : 'error',
            error_message: errorMessage.substring(0, 500),
          })
          .eq('stripe_event_id', eventId);
      }
    } catch (logError) {
      logger.error('Failed to update webhook log', { error: (logError as Error)?.message });
    }

    // For validation errors, return 200 so Stripe doesn't retry
    // The error is logged and persisted for debugging
    if (isValidation) {
      return NextResponse.json(
        {
          received: true,
          status: 'failed',
          reason: 'validation',
          message: errorMessage.substring(0, 200),
        },
        { status: 200 }
      );
    }

    // For server/transient errors, return 500 so Stripe will retry
    return NextResponse.json(
      { error: 'Webhook handler failed', message: errorMessage },
      { status: 500 }
    );
  }
}
