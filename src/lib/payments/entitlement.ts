/**
 * Payment Entitlements
 *
 * Guards for verifying payment status before document generation.
 * Single source of truth for entitlement checks.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, payment_status, fulfillment_status, product_type, case_id, paid_at')
    .eq('case_id', caseId)
    .eq('product_type', product)
    .eq('payment_status', 'paid')
    .maybeSingle();

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

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, payment_status, fulfillment_status, product_type, case_id, paid_at')
    .eq('case_id', caseId)
    .eq('product_type', product)
    .eq('payment_status', 'paid')
    .maybeSingle();

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

  // Check if there's a paid order
  const { data: order } = await supabase
    .from('orders')
    .select('id, payment_status, fulfillment_status, product_type, case_id, paid_at')
    .eq('case_id', caseId)
    .eq('product_type', product)
    .eq('payment_status', 'paid')
    .maybeSingle();

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
    .select('id, payment_status, fulfillment_status, product_type, case_id, paid_at')
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
    latestOrder: orders[0] as unknown as EntitlementResult,
  };
}
