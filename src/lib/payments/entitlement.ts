/**
 * Payment Entitlements
 *
 * Guards for verifying payment status before document generation.
 * Single source of truth for entitlement checks.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { selectActiveCaseOrder } from '@/lib/payments/active-order';

export interface PaidEntitlementInput {
  caseId: string;
  product: string;
  userId?: string;
}

export interface PreviewAllowedInput {
  caseId: string;
  product: string;
  userId?: string;
}

export interface EntitlementResult {
  id: string;
  payment_status: string;
  fulfillment_status: string | null;
  product_type: string;
  case_id: string;
  paid_at?: string | null;
  created_at?: string | null;
}

function getEntitledProductTypes(product: string): string[] {
  if (product === 'notice_only') {
    return ['notice_only', 'complete_pack'];
  }

  return [product];
}

/**
 * Assert that a paid order exists for the given case and product.
 * Throws 402 if no paid order found.
 *
 * Use this for endpoints that return final/court-ready documents.
 */
export async function assertPaidEntitlement({
  caseId,
  product,
}: PaidEntitlementInput): Promise<EntitlementResult> {
  const supabase = createAdminClient();
  const entitledProductTypes = getEntitledProductTypes(product);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, payment_status, fulfillment_status, product_type, case_id, paid_at, created_at')
    .eq('case_id', caseId)
    .in('product_type', entitledProductTypes)
    .eq('payment_status', 'paid')
    .order('paid_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  const order = selectActiveCaseOrder(orders as EntitlementResult[] | null | undefined);

  if (error || !order) {
    throw NextResponse.json(
      {
        error: 'PAYMENT_REQUIRED',
        code: 'PAYMENT_REQUIRED',
        message: 'A paid order is required to generate court-ready documents.',
        case_id: caseId,
        product,
      },
      { status: 402 }
    );
  }

  return order as EntitlementResult;
}

/**
 * Check if a case has a paid order (without throwing).
 * Use for conditional logic based on payment status.
 */
export async function checkPaidEntitlement({
  caseId,
  product,
}: PaidEntitlementInput): Promise<{
  isPaid: boolean;
  order: EntitlementResult | null;
}> {
  const supabase = createAdminClient();
  const entitledProductTypes = getEntitledProductTypes(product);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, payment_status, fulfillment_status, product_type, case_id, paid_at, created_at')
    .eq('case_id', caseId)
    .in('product_type', entitledProductTypes)
    .eq('payment_status', 'paid')
    .order('paid_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  const order = selectActiveCaseOrder(orders as EntitlementResult[] | null | undefined);

  if (error || !order) {
    return { isPaid: false, order: null };
  }

  return { isPaid: true, order: order as EntitlementResult };
}

/**
 * Assert that preview access is allowed for the given case.
 *
 * Preview rules:
 * - Always allowed for authenticated case owners (pre-payment)
 * - Preview content MUST be watermarked/limited (not final quality)
 * - Returns a flag indicating whether to apply watermarks
 *
 * Use this for endpoints that return preview documents.
 */
export async function assertPreviewAllowed({
  caseId,
  product,
  userId,
}: PreviewAllowedInput): Promise<{
  allowed: boolean;
  isPaid: boolean;
  applyWatermark: boolean;
  order: EntitlementResult | null;
}> {
  const supabase = createAdminClient();
  const entitledProductTypes = getEntitledProductTypes(product);

  // Check if there's a paid order
  const { data: orders } = await supabase
    .from('orders')
    .select('id, payment_status, fulfillment_status, product_type, case_id, paid_at, created_at')
    .eq('case_id', caseId)
    .in('product_type', entitledProductTypes)
    .eq('payment_status', 'paid')
    .order('paid_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  const order = selectActiveCaseOrder(orders as EntitlementResult[] | null | undefined);

  const isPaid = !!order;

  // Preview is always allowed, but watermarking depends on payment status
  return {
    allowed: true,
    isPaid,
    applyWatermark: !isPaid, // Watermark if NOT paid
    order: order as EntitlementResult | null,
  };
}

/**
 * Get the payment status for a case (any product).
 * Useful for checking if any payment exists for the case.
 */
export async function getCasePaymentStatus(
  caseId: string
): Promise<{
  hasPaidOrder: boolean;
  paidProducts: string[];
  latestOrder: EntitlementResult | null;
}> {
  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, payment_status, fulfillment_status, product_type, case_id, paid_at, created_at')
    .eq('case_id', caseId)
    .eq('payment_status', 'paid')
    .order('paid_at', { ascending: false });

  if (error || !orders || orders.length === 0) {
    return {
      hasPaidOrder: false,
      paidProducts: [],
      latestOrder: null,
    };
  }

  return {
    hasPaidOrder: true,
    paidProducts: orders.map((o) => o.product_type).filter(Boolean) as string[],
    latestOrder: selectActiveCaseOrder(orders as EntitlementResult[] | null | undefined) as EntitlementResult | null,
  };
}
