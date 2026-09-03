export type RecoveryEmailKind = 'checkout' | 'preview' | 'wizard';
export type RecoveryClaimReason = 'claimed' | 'duplicate' | 'recipient_cooldown' | 'unsubscribed' | 'invalid_email';
export const RECOVERY_RECIPIENT_COOLDOWN_MINUTES = 20 * 60;

type RecoveryClaimClient = {
  rpc: (
    name: string,
    params: Record<string, unknown>
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>;
  from: (table: string) => {
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => PromiseLike<{ error: { message?: string } | null }>;
    };
  };
};

type ClaimRecoveryEmailParams = {
  supabase: RecoveryClaimClient;
  claimKey: string;
  email: string;
  recoveryKind: RecoveryEmailKind;
  subjectId: string;
  stage: string;
  source: string;
  cooldownMinutes?: number;
};

export type RecoveryEmailClaim = {
  claimed: boolean;
  reason: RecoveryClaimReason;
  claimId: string | null;
};

function firstRow(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) return (value[0] as Record<string, unknown> | undefined) || null;
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
}

export async function claimRecoveryEmail(params: ClaimRecoveryEmailParams): Promise<RecoveryEmailClaim> {
  const { data, error } = await params.supabase.rpc('claim_recovery_email', {
    p_claim_key: params.claimKey,
    p_email: params.email,
    p_recovery_kind: params.recoveryKind,
    p_subject_id: params.subjectId,
    p_stage: params.stage,
    p_source: params.source,
    p_cooldown_minutes: params.cooldownMinutes ?? RECOVERY_RECIPIENT_COOLDOWN_MINUTES,
  });

  if (error) {
    // Fail closed: if the atomic gate is unavailable, do not risk a duplicate send.
    throw new Error(`Failed to claim recovery email: ${error.message || 'unknown database error'}`);
  }

  const row = firstRow(data);
  return {
    claimed: row?.claimed === true,
    reason: (typeof row?.reason === 'string' ? row.reason : 'duplicate') as RecoveryClaimReason,
    claimId: typeof row?.claim_id === 'string' ? row.claim_id : null,
  };
}

export async function completeRecoveryEmailClaim(params: {
  supabase: RecoveryClaimClient;
  claimId: string;
  success: boolean;
  error?: string | null;
}): Promise<void> {
  const { error } = await params.supabase
    .from('recovery_email_claims')
    .update({
      status: params.success ? 'sent' : 'failed',
      sent_at: params.success ? new Date().toISOString() : null,
      error: params.success ? null : params.error || 'Unknown email error',
    })
    .eq('id', params.claimId);

  if (error) {
    throw new Error(`Failed to complete recovery email claim: ${error.message || 'unknown database error'}`);
  }
}
