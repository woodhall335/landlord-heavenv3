import { describe, expect, it } from 'vitest';
import { analyzeCase } from '@/lib/decision-engine/engine';

describe('Decision engine Northern Ireland gating', () => {
  it('rejects Northern Ireland eviction analysis', async () => {
    await expect(
      analyzeCase({
        jurisdiction: 'northern-ireland',
        case_type: 'eviction',
      } as any)
    ).rejects.toThrow(
      'Decision engine does not support Northern Ireland eviction or money claim analysis'
    );
  });

  it('rejects Northern Ireland money claim analysis', async () => {
    await expect(
      analyzeCase({
        jurisdiction: 'northern-ireland',
        case_type: 'money_claim',
      } as any)
    ).rejects.toThrow(
      'Decision engine does not support Northern Ireland eviction or money claim analysis'
    );
  });
});
