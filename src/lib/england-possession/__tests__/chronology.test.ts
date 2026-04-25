import { describe, expect, it } from 'vitest';

import { buildEnglandEvictionChronology } from '@/lib/england-possession/chronology';

describe('England eviction chronology', () => {
  it('builds an arrears-backed chronology from the rent schedule and contact facts', () => {
    const chronology = buildEnglandEvictionChronology({
      arrears_items: [
        { period_start: '2026-01-01', period_end: '2026-01-31', rent_due: 1200, rent_paid: 0 },
        { period_start: '2026-02-01', period_end: '2026-02-28', rent_due: 1200, rent_paid: 600 },
      ],
      total_arrears: 1800,
      notice_service_date: '2026-03-03',
      earliest_possession_date: '2026-03-31',
      communication_timeline: {
        total_attempts: 4,
        tenant_responsiveness: 'engaging_but_not_paying',
      },
      evidence_bundle_ready: true,
    });

    expect(chronology.hasArrearsSummary).toBe(true);
    expect(chronology.previewText).toContain('£1,800.00');
    expect(chronology.previewText).toContain('4 payment-chase or contact attempts');
    expect(chronology.previewText).toContain('3 March 2026');
    expect(chronology.timelineItems).toContain('Current arrears: £1,800.00');
  });

  it('falls back to notice and breach chronology without forcing arrears wording', () => {
    const chronology = buildEnglandEvictionChronology({
      notice_service_date: '2026-06-01',
      earliest_possession_date: '2026-06-29',
      communication_timeline: {
        total_attempts: 2,
        tenant_responsiveness: 'disputing',
        log: 'The tenant disputes the allegations and refused a follow-up inspection.',
      },
    });

    expect(chronology.hasArrearsSummary).toBe(false);
    expect(chronology.previewText).not.toContain('Current arrears');
    expect(chronology.previewText).toContain('The tenant is disputing');
    expect(chronology.previewText).toContain('refused a follow-up inspection');
    expect(chronology.timelineItems).toContain('Recorded payment-chase or contact attempts: 2');
  });
});
