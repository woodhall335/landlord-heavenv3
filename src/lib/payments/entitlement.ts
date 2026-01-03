import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

interface PaidEntitlementInput {
  caseId: string;
  product: string;
}

export async function assertPaidEntitlement({ caseId, product }: PaidEntitlementInput) {
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, payment_status, fulfillment_status, product_type, case_id')
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
      { status: 402 },
    );
  }

  return order;
}
