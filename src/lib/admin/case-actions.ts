import type { SupabaseClient } from '@supabase/supabase-js';
import { logMutation, type MutationAction } from '@/lib/auth/audit-log';
import { safeSelectOrder, extractOrderMetadata } from '@/lib/payments/safe-order-metadata';

export interface AdminCasePaidOrder {
  id: string;
  case_id: string;
  user_id: string | null;
  product_type: string | null;
  payment_status: string;
  fulfillment_status: string | null;
  paid_at: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function getLatestPaidOrderForCase(
  supabase: SupabaseClient,
  caseId: string
): Promise<AdminCasePaidOrder | null> {
  const result = await safeSelectOrder<AdminCasePaidOrder>(supabase, {
    caseId,
    paymentStatus: 'paid',
  }, {
    orderBy: { column: 'paid_at', ascending: false },
    limit: 1,
    single: true,
  });

  if (result.error || !result.data) {
    return null;
  }

  return result.data;
}

export async function logAdminCaseAction(params: {
  caseId: string;
  adminUserId: string;
  action: MutationAction;
  changedKeys: string[];
  metadata?: Record<string, unknown>;
}) {
  const { caseId, adminUserId, action, changedKeys, metadata } = params;

  await logMutation({
    caseId,
    userId: adminUserId,
    action,
    changedKeys,
    metadata: {
      source: 'admin-case-manager',
      admin_user_id: adminUserId,
      ...metadata,
    },
  });
}

export function getOrderMetadata(order: AdminCasePaidOrder | null) {
  return order ? extractOrderMetadata(order) : null;
}
