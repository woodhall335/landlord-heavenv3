import { describe, expect, it } from 'vitest';
import { buildWizardStartTrend } from '../wizard-start-trend';

describe('durable wizard starts', () => {
  const now = new Date('2026-11-27T10:00:00Z');
  const rows = [
    { day: '2026-11-13', case_type: 'eviction', product_type: 'notice_only', starts: '22' },
    { day: '2026-11-12', case_type: 'eviction', product_type: 'notice_only', starts: 4 },
    { day: '2026-10-30', case_type: 'eviction', product_type: 'complete_pack', starts: 6 },
    { day: '2026-11-27', case_type: 'eviction', product_type: 'notice_only', starts: 100 },
    { day: '2026-10-29', case_type: 'eviction', product_type: 'notice_only', starts: 100 },
  ];
  it('compares complete fortnights, excludes today and keeps products separate', () => {
    const result = buildWizardStartTrend(rows, '2026-09-01T12:00:00Z', now);
    expect(result.latestStart).toBe('2026-11-13');
    expect(result.previousStart).toBe('2026-10-30');
    expect(result.products).toContainEqual({ product: 'notice_only', caseType: 'eviction', latest: 22, previous: 4 });
    expect(result.products).toContainEqual({ product: 'complete_pack', caseType: 'eviction', latest: 0, previous: 6 });
    expect(result.latestComplete && result.previousComplete).toBe(true);
  });
  it('marks backfilled surviving data incomplete rather than claiming zero historical starts', () => {
    const result = buildWizardStartTrend(rows, '2026-11-27T09:00:00Z', now);
    expect(result.latestComplete).toBe(false);
    expect(result.previousComplete).toBe(false);
  });
  it('requires coverage before the start of each entire period', () => {
    const result = buildWizardStartTrend([], '2026-11-13T12:00:00Z', now);
    expect(result.latestComplete).toBe(false);
  });
});
