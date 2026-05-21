import { describe, expect, it, vi } from 'vitest';

import { createCaseRecoveryLink } from '@/lib/cases/recovery-server';

function createSupabaseInsertMock(results: Array<{ error: any }>) {
  const insert = vi.fn(() => results.shift() ?? { error: null });
  return {
    insert,
    supabase: {
      from: vi.fn(() => ({ insert })),
    },
  };
}

const caseRow = {
  id: '11111111-1111-4111-8111-111111111111',
  case_type: 'eviction',
  jurisdiction: 'england',
  collected_facts: { __meta: { product: 'notice_only' } },
};

describe('createCaseRecoveryLink', () => {
  it('stores the recovery token before returning an email URL', async () => {
    const { insert, supabase } = createSupabaseInsertMock([{ error: null }]);

    const result = await createCaseRecoveryLink({
      supabase: supabase as any,
      caseRow,
      email: 'alex@example.com',
      stage: 'day_1',
      source: 'test',
      kind: 'case_wizard_recovery',
    });

    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        case_id: caseRow.id,
        email: 'alex@example.com',
        metadata: expect.objectContaining({ kind: 'case_wizard_recovery' }),
      })
    );
    expect(result.resumeUrl).toContain('recovery_token=');
    expect(result.resumeUrl).toContain('product=notice_only');
  });

  it('falls back to the legacy token schema if metadata is not deployed', async () => {
    const { insert, supabase } = createSupabaseInsertMock([
      { error: { code: 'PGRST204', message: "Could not find the 'metadata' column" } },
      { error: null },
    ]);

    await createCaseRecoveryLink({
      supabase: supabase as any,
      caseRow,
      email: 'alex@example.com',
      stage: 'day_1',
      source: 'test',
      kind: 'case_wizard_recovery',
    });

    expect(insert).toHaveBeenCalledTimes(2);
    expect(insert.mock.calls[0][0]).toHaveProperty('metadata');
    expect(insert.mock.calls[1][0]).not.toHaveProperty('metadata');
  });

  it('throws if the recovery token cannot be stored', async () => {
    const { supabase } = createSupabaseInsertMock([
      { error: { code: '23505', message: 'duplicate key value violates unique constraint' } },
    ]);

    await expect(
      createCaseRecoveryLink({
        supabase: supabase as any,
        caseRow,
        email: 'alex@example.com',
        stage: 'day_1',
        source: 'test',
        kind: 'case_wizard_recovery',
      })
    ).rejects.toThrow('Failed to store recovery token');
  });
});
