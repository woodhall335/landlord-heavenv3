/**
 * Mutation Audit Logging
 *
 * Logs mutations to paid cases for security and compliance.
 * Only logs when the case has a paid order.
 */

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCasePaymentStatus } from '@/lib/payments/entitlement';

export type MutationAction =
  | 'wizard_answer_update'
  | 'case_facts_update'
  | 'evidence_upload'
  | 'document_regenerate'
  | 'case_status_change'
  | 'case_archived';

export interface MutationLogEntry {
  id?: string;
  case_id: string;
  user_id: string | null;
  action: MutationAction;
  changed_keys: string[];
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface LogMutationInput {
  caseId: string;
  userId: string | null;
  action: MutationAction;
  changedKeys: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Log a mutation to a paid case.
 *
 * Only logs if the case has a paid order. This provides an audit trail
 * for changes made after payment, which is important for:
 * - Fraud detection
 * - Support investigations
 * - Compliance with payment terms
 *
 * @param input - Mutation details to log
 * @returns Whether the log was written (false if case not paid or error)
 */
export async function logMutation(input: LogMutationInput): Promise<boolean> {
  const { caseId, userId, action, changedKeys, metadata } = input;

  try {
    // Only log mutations to paid cases
    const paymentStatus = await getCasePaymentStatus(caseId);

    if (!paymentStatus.hasPaidOrder) {
      // Case not paid - no audit log needed
      return false;
    }

    const adminClient = createSupabaseAdminClient();

    // Insert into case_mutation_logs table
    // This table should be created via migration if it doesn't exist
    const { error } = await adminClient.from('case_mutation_logs').insert({
      case_id: caseId,
      user_id: userId,
      action,
      changed_keys: changedKeys,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    } as never);

    if (error) {
      // Log error but don't fail the mutation
      console.error('[AUDIT] Failed to log mutation:', error);
      return false;
    }

    console.log(`[AUDIT] Logged mutation: ${action} on case ${caseId}`, {
      changedKeys,
      userId,
    });

    return true;
  } catch (err) {
    // Log error but don't fail the mutation
    console.error('[AUDIT] Error in logMutation:', err);
    return false;
  }
}

/**
 * Get mutation logs for a case.
 * Useful for support investigations.
 */
export async function getMutationLogs(
  caseId: string,
  limit = 100
): Promise<MutationLogEntry[]> {
  const adminClient = createSupabaseAdminClient();

  const { data, error } = await adminClient
    .from('case_mutation_logs')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[AUDIT] Failed to get mutation logs:', error);
    return [];
  }

  return (data || []) as unknown as MutationLogEntry[];
}

/**
 * Helper to extract changed keys from a before/after diff.
 */
export function getChangedKeys(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): string[] {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changedKeys: string[] = [];

  for (const key of allKeys) {
    const beforeVal = JSON.stringify(before[key]);
    const afterVal = JSON.stringify(after[key]);

    if (beforeVal !== afterVal) {
      changedKeys.push(key);
    }
  }

  return changedKeys;
}
