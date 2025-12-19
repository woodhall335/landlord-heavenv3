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
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import {
  mapCaseFactsToMoneyClaimCase,
  mapCaseFactsToScotlandMoneyClaimCase,
} from '@/lib/documents/money-claim-wizard-mapper';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
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
                const wizardFacts = (caseData as any).collected_facts;
                const caseFacts = wizardFactsToCaseFacts(wizardFacts as any);

                // Handle eviction packs (notice_only and complete_pack)
                if (productType === 'notice_only' || productType === 'complete_pack') {
                  const { generateNoticeOnlyPack, generateCompleteEvictionPack } = await import('@/lib/documents/eviction-pack-generator');

                  console.log(`[Fulfillment] Generating ${productType} for case ${caseId}...`);

                  let evictionPack: any;
                  if (productType === 'notice_only') {
                    evictionPack = await generateNoticeOnlyPack(wizardFacts);
                  } else {
                    evictionPack = await generateCompleteEvictionPack(wizardFacts);
                  }

                  console.log(`[Fulfillment] Generated ${evictionPack.documents.length} documents in eviction pack`);

                  // Upload all documents to storage and save to database
                  for (const doc of evictionPack.documents) {
                    if (doc.pdf) {
                      const fileName = `${userId}/${caseId}/${doc.file_name}`;
                      const { error: uploadError } = await supabase.storage
                        .from('documents')
                        .upload(fileName, doc.pdf, {
                          contentType: 'application/pdf',
                          upsert: false,
                        });

                      if (!uploadError) {
                        const { data: publicUrlData } = supabase.storage
                          .from('documents')
                          .getPublicUrl(fileName);

                        // Save document record
                        await supabase.from('documents').insert({
                          user_id: userId,
                          case_id: caseId,
                          document_type: doc.category,
                          document_title: doc.title,
                          jurisdiction: (caseData as any).jurisdiction,
                          html_content: doc.html || null,
                          pdf_url: publicUrlData.publicUrl,
                          is_preview: false,
                          qa_passed: true,
                          metadata: { description: doc.description, pack_type: productType },
                        });

                        console.log(`[Fulfillment] Uploaded document: ${doc.title}`);
                      } else {
                        console.error(`[Fulfillment] Failed to upload ${doc.title}:`, uploadError);
                      }
                    }
                  }

                  // Mark fulfillment as completed
                  await supabase
                    .from('orders')
                    .update({
                      fulfillment_status: 'completed',
                      fulfilled_at: new Date().toISOString(),
                      metadata: {
                        total_documents: evictionPack.documents.length,
                        pack_type: evictionPack.pack_type,
                        jurisdiction: evictionPack.jurisdiction,
                      },
                    })
                    .eq('id', orderId);

                  console.log(`[Fulfillment] Eviction pack fulfilled: ${orderId}`);

                } else if (productType === 'money_claim') {
                  const { generateMoneyClaimPack } = await import('@/lib/documents/money-claim-pack-generator');

                  console.log(`[Fulfillment] Generating money claim pack for case ${caseId}...`);
                  const pack = await generateMoneyClaimPack({
                    ...mapCaseFactsToMoneyClaimCase(caseFacts),
                    case_id: caseId,
                  });

                  for (const doc of pack.documents) {
                    if (!doc.pdf) continue;

                    const fileName = `${userId}/${caseId}/${doc.file_name}`;
                    const { error: uploadError } = await supabase.storage
                      .from('documents')
                      .upload(fileName, doc.pdf, {
                        contentType: 'application/pdf',
                        upsert: false,
                      });

                    if (uploadError) {
                      console.error(`[Fulfillment] Failed to upload ${doc.title}:`, uploadError);
                      continue;
                    }

                    const { data: publicUrlData } = supabase.storage
                      .from('documents')
                      .getPublicUrl(fileName);

                    await supabase.from('documents').insert({
                      user_id: userId,
                      case_id: caseId,
                      document_type: doc.category,
                      document_title: doc.title,
                      jurisdiction: (caseData as any).jurisdiction,
                      html_content: doc.html || null,
                      pdf_url: publicUrlData.publicUrl,
                      is_preview: false,
                      qa_passed: true,
                      metadata: { description: doc.description, pack_type: productType },
                    });
                  }

                  await supabase
                    .from('orders')
                    .update({
                      fulfillment_status: 'completed',
                      fulfilled_at: new Date().toISOString(),
                      metadata: {
                        total_documents: pack.documents.length,
                        pack_type: pack.pack_type,
                        jurisdiction: pack.jurisdiction,
                      },
                    })
                    .eq('id', orderId);

                  console.log(`[Fulfillment] Money claim pack fulfilled: ${orderId}`);

                } else if (productType === 'sc_money_claim') {
                  const { generateScotlandMoneyClaim } = await import('@/lib/documents/scotland-money-claim-pack-generator');

                  console.log(`[Fulfillment] Generating Scotland money claim pack for case ${caseId}...`);
                  const pack = await generateScotlandMoneyClaim({
                    ...mapCaseFactsToScotlandMoneyClaimCase(caseFacts),
                    case_id: caseId,
                  });

                  for (const doc of pack.documents) {
                    if (!doc.pdf) continue;

                    const fileName = `${userId}/${caseId}/${doc.file_name}`;
                    const { error: uploadError } = await supabase.storage
                      .from('documents')
                      .upload(fileName, doc.pdf, {
                        contentType: 'application/pdf',
                        upsert: false,
                      });

                    if (uploadError) {
                      console.error(`[Fulfillment] Failed to upload ${doc.title}:`, uploadError);
                      continue;
                    }

                    const { data: publicUrlData } = supabase.storage
                      .from('documents')
                      .getPublicUrl(fileName);

                    await supabase.from('documents').insert({
                      user_id: userId,
                      case_id: caseId,
                      document_type: doc.category,
                      document_title: doc.title,
                      jurisdiction: (caseData as any).jurisdiction,
                      html_content: doc.html || null,
                      pdf_url: publicUrlData.publicUrl,
                      is_preview: false,
                      qa_passed: true,
                      metadata: { description: doc.description, pack_type: productType },
                    });
                  }

                  await supabase
                    .from('orders')
                    .update({
                      fulfillment_status: 'completed',
                      fulfilled_at: new Date().toISOString(),
                      metadata: {
                        total_documents: pack.documents.length,
                        pack_type: pack.pack_type,
                        jurisdiction: pack.jurisdiction,
                      },
                    })
                    .eq('id', orderId);

                  console.log(`[Fulfillment] Scotland money claim pack fulfilled: ${orderId}`);

                } else {
                  // Handle AST and other single document types
                  const { generateStandardAST, generatePremiumAST } = await import('@/lib/documents/ast-generator');

                  let generatedDoc: any;
                  let documentTitle = '';
                  let documentType = '';

                  // Generate document based on type
                  switch (productType) {
                    case 'ast_standard':
                      generatedDoc = await generateStandardAST(wizardFacts);
                      documentTitle = 'Assured Shorthold Tenancy Agreement - Standard';
                      documentType = 'ast_standard';
                      break;
                    case 'ast_premium':
                      generatedDoc = await generatePremiumAST(wizardFacts);
                      documentTitle = 'Assured Shorthold Tenancy Agreement - Premium';
                      documentType = 'ast_premium';
                      break;
                    default:
                      console.error('[Fulfillment] Unsupported product type:', productType);
                  }

                  if (generatedDoc) {
                    // Upload PDF to storage
                    let pdfUrl: string | null = null;
                    if (generatedDoc.pdf) {
                      const fileName = `${userId}/${caseId}/${documentType}_final_${Date.now()}.pdf`;
                      const { error: uploadError } = await supabase.storage
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
                        jurisdiction: (caseData as any).jurisdiction,
                        html_content: generatedDoc.html,
                        pdf_url: pdfUrl,
                        is_preview: false,
                        qa_passed: false,
                        qa_score: null,
                        qa_issues: [],
                      })
                      .select()
                      .single();

                    if (docError) {
                      console.error('[Fulfillment] Failed to save final document:', docError);
                    } else {
                      console.log(`[Fulfillment] Final document generated: ${(finalDoc as any).id}`);

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
                productName: (order as any).product_name,
                amount: Math.round((order as any).total_amount * 100),
                orderNumber: (order as any).id.substring(0, 8).toUpperCase(),
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
        const subscriptionId = (invoice as any).subscription as string;

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
        const subscriptionId = (invoice as any).subscription as string;

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
