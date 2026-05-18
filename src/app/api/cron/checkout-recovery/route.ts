/**
 * Abandoned checkout recovery cron.
 *
 * Sends one recovery email for pending checkout orders where the customer has a
 * saved Stripe checkout URL and a known user email/name. Dedupe is recorded in
 * email_events so we do not need an orders schema migration for the first pass.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendAbandonedCheckoutRecoveryEmail } from '@/lib/email/resend';
import { PRODUCTS, isValidProductSku, type ProductSku } from '@/lib/pricing/products';
import { createAdminClient } from '@/lib/supabase/server';
import {
  completeCronRun,
  startCronRun,
} from '@/lib/validation/cron-run-tracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const JOB_NAME = 'checkout:recover-abandoned' as const;
const DEFAULT_MIN_AGE_MINUTES = 45;
const DEFAULT_MAX_AGE_HOURS = 23;
const DEFAULT_BATCH_LIMIT = 50;
const RECOVERY_EVENT_TYPE = 'checkout_recovery_sent';
const RECOVERY_FAILED_EVENT_TYPE = 'checkout_recovery_failed';

interface PendingCheckoutOrder {
  id: string;
  user_id: string | null;
  case_id: string | null;
  product_type: string;
  product_name: string | null;
  total_amount: number | string | null;
  payment_status: string;
  stripe_checkout_url: string | null;
  stripe_session_id: string | null;
  created_at: string;
}

interface UserContact {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface EmailEventRow {
  email: string;
  event_data: Record<string, unknown> | null;
}

function verifyCronAuth(request: NextRequest): { authorized: boolean; source: string } {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return { authorized: false, source: 'no_secret_configured' };
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true, source: 'bearer' };
  }

  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader === '1') {
    const keyParam = request.nextUrl.searchParams.get('key');
    if (keyParam && keyParam.length === cronSecret.length) {
      let match = true;
      for (let i = 0; i < cronSecret.length; i += 1) {
        if (keyParam[i] !== cronSecret[i]) {
          match = false;
        }
      }
      if (match) {
        return { authorized: true, source: 'vercel_cron' };
      }
    }

    return { authorized: false, source: 'vercel_cron_missing_key' };
  }

  return { authorized: false, source: 'invalid_credentials' };
}

function getPositiveInteger(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getBooleanParam(value: string | null): boolean {
  return value === '1' || value === 'true' || value === 'yes';
}

function minutesAgoIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function getCustomerName(user: UserContact): string {
  const fullName = user.full_name?.trim();
  if (fullName) return fullName;

  const emailPrefix = user.email?.split('@')[0]?.trim();
  return emailPrefix || 'there';
}

function getProductName(order: PendingCheckoutOrder): string {
  if (isValidProductSku(order.product_type)) {
    return PRODUCTS[order.product_type as ProductSku].label;
  }

  return order.product_name || 'Landlord Heaven document pack';
}

function normalizeGbpAmount(value: number | string | null): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;

  // Current orders store GBP decimals. Older rows may have pence-like values.
  return amount > 999 ? Number((amount / 100).toFixed(2)) : amount;
}

function eventHasOrderId(event: EmailEventRow, orderId: string): boolean {
  return event.event_data?.order_id === orderId;
}

async function executeCheckoutRecovery(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const minAgeMinutes = getPositiveInteger(
    request.nextUrl.searchParams.get('min_age_minutes'),
    DEFAULT_MIN_AGE_MINUTES
  );
  const maxAgeHours = getPositiveInteger(
    request.nextUrl.searchParams.get('max_age_hours'),
    DEFAULT_MAX_AGE_HOURS
  );
  const batchLimit = getPositiveInteger(
    request.nextUrl.searchParams.get('limit'),
    DEFAULT_BATCH_LIMIT
  );
  const dryRun = getBooleanParam(request.nextUrl.searchParams.get('dry_run'));
  const olderThanIso = minutesAgoIso(minAgeMinutes);
  const newerThanIso = hoursAgoIso(maxAgeHours);
  const supabase = createAdminClient();
  const run = await startCronRun(JOB_NAME, 'cron');

  try {
    const { data: orderRows, error: ordersError } = await supabase
      .from('orders')
      .select(
        'id, user_id, case_id, product_type, product_name, total_amount, payment_status, stripe_checkout_url, stripe_session_id, created_at'
      )
      .eq('payment_status', 'pending')
      .not('user_id', 'is', null)
      .not('stripe_checkout_url', 'is', null)
      .lte('created_at', olderThanIso)
      .gte('created_at', newerThanIso)
      .order('created_at', { ascending: true })
      .limit(batchLimit);

    if (ordersError) {
      throw new Error(`Failed to fetch pending checkout orders: ${ordersError.message}`);
    }

    const orders = ((orderRows || []) as PendingCheckoutOrder[]).filter(
      (order) => order.user_id && order.stripe_checkout_url
    );

    if (orders.length === 0) {
      const summary = `No pending checkout orders between ${minAgeMinutes} minutes and ${maxAgeHours} hours old.`;
      await completeCronRun(run.id, 'success', summary, {
        sourcesChecked: 0,
        eventsUpdated: 0,
      });
      return NextResponse.json({
        success: true,
        dry_run: dryRun,
        candidates_checked: 0,
        emails_sent: 0,
        skipped: 0,
        failed: 0,
      });
    }

    const userIds = Array.from(new Set(orders.map((order) => order.user_id).filter(Boolean))) as string[];
    const { data: userRows, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .in('id', userIds);

    if (usersError) {
      throw new Error(`Failed to fetch checkout users: ${usersError.message}`);
    }

    const userMap = new Map(
      ((userRows || []) as UserContact[]).map((user) => [user.id, user])
    );
    const emails = Array.from(
      new Set(
        Array.from(userMap.values())
          .map((user) => user.email)
          .filter((email): email is string => Boolean(email))
      )
    );

    const { data: recoveryEventRows, error: recoveryEventsError } = emails.length
      ? await supabase
          .from('email_events')
          .select('email, event_data')
          .eq('event_type', RECOVERY_EVENT_TYPE)
          .in('email', emails)
          .gte('created_at', hoursAgoIso(24 * 45))
      : { data: [], error: null };

    if (recoveryEventsError) {
      throw new Error(`Failed to fetch recovery email events: ${recoveryEventsError.message}`);
    }

    const recoveryEvents = (recoveryEventRows || []) as EmailEventRow[];
    const alreadyRecoveredOrderIds = new Set(
      orders
        .filter((order) => recoveryEvents.some((event) => eventHasOrderId(event, order.id)))
        .map((order) => order.id)
    );

    let emailsSent = 0;
    let skipped = 0;
    let failed = 0;
    const sentOrderIds: string[] = [];
    const skippedOrderIds: string[] = [];
    const failedOrderIds: string[] = [];

    for (const order of orders) {
      const user = order.user_id ? userMap.get(order.user_id) : null;
      const email = user?.email;

      if (!user || !email || alreadyRecoveredOrderIds.has(order.id) || !order.stripe_checkout_url) {
        skipped += 1;
        skippedOrderIds.push(order.id);
        continue;
      }

      if (dryRun) {
        skipped += 1;
        skippedOrderIds.push(order.id);
        continue;
      }

      const emailResult = await sendAbandonedCheckoutRecoveryEmail({
        to: email,
        customerName: getCustomerName(user),
        productName: getProductName(order),
        amount: normalizeGbpAmount(order.total_amount),
        checkoutUrl: order.stripe_checkout_url,
      });

      const eventType = emailResult.success ? RECOVERY_EVENT_TYPE : RECOVERY_FAILED_EVENT_TYPE;
      await supabase.from('email_events').insert({
        email,
        event_type: eventType,
        event_data: {
          order_id: order.id,
          case_id: order.case_id,
          product_type: order.product_type,
          checkout_url: order.stripe_checkout_url,
          stripe_session_id: order.stripe_session_id,
          error: emailResult.success ? null : emailResult.error || 'Unknown email error',
          sent_at: new Date().toISOString(),
          source: JOB_NAME,
        },
      });

      if (emailResult.success) {
        emailsSent += 1;
        sentOrderIds.push(order.id);
      } else {
        failed += 1;
        failedOrderIds.push(order.id);
      }
    }

    const status = failed > 0 ? 'partial' : 'success';
    const summary = dryRun
      ? `Dry run found ${orders.length} pending checkout recovery candidates.`
      : `Sent ${emailsSent} abandoned checkout recovery emails; skipped ${skipped}; failed ${failed}.`;

    await completeCronRun(run.id, status, summary, {
      sourcesChecked: orders.length,
      eventsCreated: emailsSent,
      eventsUpdated: skipped,
    });

    return NextResponse.json({
      success: failed === 0,
      dry_run: dryRun,
      candidates_checked: orders.length,
      emails_sent: emailsSent,
      skipped,
      failed,
      sent_order_ids: sentOrderIds,
      skipped_order_ids: skippedOrderIds,
      failed_order_ids: failedOrderIds,
      min_age_minutes: minAgeMinutes,
      max_age_hours: maxAgeHours,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown checkout recovery error';
    await completeCronRun(run.id, 'failed', message, {
      sourcesChecked: 0,
      eventsUpdated: 0,
    });
    console.error('[CheckoutRecoveryCron] Failed:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');

  if (!authHeader && !vercelCronHeader) {
    return NextResponse.json({
      status: 'ok',
      job: JOB_NAME,
      min_age_minutes: DEFAULT_MIN_AGE_MINUTES,
      max_age_hours: DEFAULT_MAX_AGE_HOURS,
      batch_limit: DEFAULT_BATCH_LIMIT,
      description:
        'Sends one recovery email for pending checkout orders with a saved checkout URL and known customer email.',
    });
  }

  return executeCheckoutRecovery(request);
}

export async function POST(request: NextRequest) {
  return executeCheckoutRecovery(request);
}
