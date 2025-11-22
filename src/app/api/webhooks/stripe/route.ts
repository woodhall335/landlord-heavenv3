/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe
 * Handles all Stripe webhook events
 */

import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendPurchaseConfirmation, sendTrialReminderEmail } from '@/lib/email/resend';

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
          const caseId = session.metadata?.case_id;
          const productType = session.metadata?.product_type;

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

          // Generate final documents (without watermark) if case_id exists
          if (caseId && productType) {
            try {
              // Fetch case data
              const { data: caseData, error: caseError } = await supabase
                .from('cases')
                .select('*')
                .eq('id', caseId)
                .single();

              if (caseError || !caseData) {
                console.error('[Fulfillment] Case not found:', caseError);
              } else {
                // Determine document type from product type
                const documentTypeMap: Record<string, string> = {
                  'notice_only': 'section8_notice',
                  'complete_pack': 'section8_notice',
                  'money_claim': 'money_claim',
                  'ast_standard': 'ast_standard',
                  'ast_premium': 'ast_premium',
                };

                const documentType = documentTypeMap[productType];

                if (documentType) {
                  // Generate final document by calling the generation API internally
                  const { generateSection8Notice } = await import('@/lib/documents/section8-generator');
                  const { generateStandardAST, generatePremiumAST } = await import('@/lib/documents/ast-generator');

                  const facts = caseData.collected_facts as any;
                  let generatedDoc: any;
                  let documentTitle = '';

                  // Generate document based on type
                  switch (documentType) {
                    case 'section8_notice':
                      generatedDoc = await generateSection8Notice(facts);
                      documentTitle = 'Section 8 Notice - Notice Seeking Possession';
                      break;
                    case 'ast_standard':
                      generatedDoc = await generateStandardAST(facts);
                      documentTitle = 'Assured Shorthold Tenancy Agreement - Standard';
                      break;
                    case 'ast_premium':
                      generatedDoc = await generatePremiumAST(facts);
                      documentTitle = 'Assured Shorthold Tenancy Agreement - Premium';
                      break;
                    default:
                      console.error('[Fulfillment] Unsupported document type:', documentType);
                  }

                  if (generatedDoc) {
                    // Upload PDF to storage
                    let pdfUrl: string | null = null;
                    if (generatedDoc.pdf) {
                      const fileName = `${userId}/${caseId}/${documentType}_final_${Date.now()}.pdf`;
                      const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('documents')
                        .upload(fileName, generatedDoc.pdf, {
                          contentType: 'application/pdf',
                          upsert: false,
                        });

                      if (!uploadError) {
                        const { data: publicUrlData } = supabase.storage
                          .from('documents')
                          .getPublicUrl(fileName);
                        pdfUrl = publicUrlData.publicUrl;
                      } else {
                        console.error('[Fulfillment] Failed to upload PDF:', uploadError);
                      }
                    }

                    // Save final document to database
                    const { data: finalDoc, error: docError } = await supabase
                      .from('documents')
                      .insert({
                        user_id: userId,
                        case_id: caseId,
                        document_type: documentType,
                        document_title: documentTitle,
                        jurisdiction: caseData.jurisdiction,
                        html_content: generatedDoc.html,
                        pdf_url: pdfUrl,
                        is_preview: false, // FINAL DOCUMENT
                        qa_passed: false,
                        qa_score: null,
                        qa_issues: [],
                      })
                      .select()
                      .single();

                    if (docError) {
                      console.error('[Fulfillment] Failed to save final document:', docError);
                    } else {
                      console.log(`[Fulfillment] Final document generated: ${finalDoc.id}`);

                      // Mark fulfillment as completed
                      await supabase
                        .from('orders')
                        .update({
                          fulfillment_status: 'completed',
                          fulfilled_at: new Date().toISOString(),
                        })
                        .eq('id', orderId);

                      console.log(`[Fulfillment] Order fulfilled: ${orderId}`);
                    }
                  }
                }
              }
            } catch (fulfillmentError: any) {
              console.error('[Fulfillment] Error generating documents:', fulfillmentError);
              // Don't fail the webhook - mark as failed fulfillment
              await supabase
                .from('orders')
                .update({
                  fulfillment_status: 'failed',
                })
                .eq('id', orderId);
            }
          }

          // Send purchase confirmation email
          try {
            // Fetch order and user details
            const { data: order } = await supabase
              .from('orders')
              .select('*, user_id')
              .eq('id', orderId)
              .single();

            const { data: user } = await supabase
              .from('users')
              .select('email, full_name')
              .eq('id', userId)
              .single();

            if (order && user?.email) {
              const dashboardUrl = caseId
                ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk'}/dashboard/cases/${caseId}`
                : `${process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk'}/dashboard`;

              await sendPurchaseConfirmation({
                to: user.email,
                customerName: user.full_name || 'there',
                productName: order.product_name,
                amount: Math.round(order.total_amount * 100),
                orderNumber: order.id.substring(0, 8).toUpperCase(),
                downloadUrl: dashboardUrl,
              });

              console.log(`[Email] Purchase confirmation sent to ${user.email}`);
            }
          } catch (emailError: any) {
            console.error('[Email] Failed to send purchase confirmation:', emailError);
            // Don't fail the webhook if email fails
          }
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
