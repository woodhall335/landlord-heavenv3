import { describe, expect, it, vi } from 'vitest';

import { claimRecoveryEmail, completeRecoveryEmailClaim } from '../send-claim';

describe('recovery email send claims', () => {
  it('claims a message through the atomic database function', async () => {
    const rpc = vi.fn(() => Promise.resolve({
      data: [{ claimed: true, reason: 'claimed', claim_id: 'claim-1' }],
      error: null,
    }));
    const client = { rpc, from: vi.fn() } as any;

    await expect(claimRecoveryEmail({
      supabase: client,
      claimKey: 'wizard:case-1:hour_1',
      email: 'Alex@Example.com',
      recoveryKind: 'wizard',
      subjectId: 'case-1',
      stage: 'hour_1',
      source: 'recovery:orchestrate',
    })).resolves.toEqual({ claimed: true, reason: 'claimed', claimId: 'claim-1' });

    expect(rpc).toHaveBeenCalledWith('claim_recovery_email', expect.objectContaining({
      p_claim_key: 'wizard:case-1:hour_1',
      p_cooldown_minutes: 1200,
    }));
  });

  it('fails closed when the atomic database gate is unavailable', async () => {
    const client = {
      rpc: vi.fn(() => Promise.resolve({ data: null, error: { message: 'missing function' } })),
      from: vi.fn(),
    } as any;

    await expect(claimRecoveryEmail({
      supabase: client,
      claimKey: 'checkout:order-1:initial',
      email: 'alex@example.com',
      recoveryKind: 'checkout',
      subjectId: 'order-1',
      stage: 'initial',
      source: 'recovery:orchestrate',
    })).rejects.toThrow('Failed to claim recovery email');
  });

  it('records the final send status against the claim', async () => {
    const eq = vi.fn(() => Promise.resolve({ error: null }));
    const update = vi.fn(() => ({ eq }));
    const client = { rpc: vi.fn(), from: vi.fn(() => ({ update })) } as any;

    await completeRecoveryEmailClaim({
      supabase: client,
      claimId: 'claim-1',
      success: true,
    });

    expect(client.from).toHaveBeenCalledWith('recovery_email_claims');
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'sent', error: null }));
    expect(eq).toHaveBeenCalledWith('id', 'claim-1');
  });
});
