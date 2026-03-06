import { describe, expect, it } from 'vitest';
import { deriveOverviewCounts } from '@/app/api/cases/stats/route';

describe('cases stats overview counts', () => {
  it('counts paid + fulfilled notice-only case as completed', () => {
    const cases = [
      { id: 'case-1', status: 'in_progress', wizard_progress: 100, wizard_completed_at: '2026-01-01T00:00:00Z' },
    ];

    const orders = [
      { case_id: 'case-1', payment_status: 'paid', fulfillment_status: 'fulfilled', created_at: '2026-01-02T00:00:00Z' },
    ];

    const counts = deriveOverviewCounts(cases, orders);
    expect(counts.completed).toBe(1);
    expect(counts.inProgress).toBe(0);
  });
});
