import {
  buildEnglandSection8CourtPackCalculation,
  computeEnglandSection8DeemedServiceDate,
} from '@/lib/documents/england-section8-court-pack';
import { vi } from 'vitest';

describe('England Section 8 court-pack calculation', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        'england-and-wales': {
          events: [],
        },
      }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('first class post uses the next business day before counting two business days', async () => {
    const deemedDate = await computeEnglandSection8DeemedServiceDate({
      serviceDate: '2026-05-02',
      serviceMethod: 'first_class_post',
    });

    expect(deemedDate).toBe('2026-05-06');
  });

  test('personal service after 16:30 rolls to the next business day', async () => {
    const deemedDate = await computeEnglandSection8DeemedServiceDate({
      serviceDate: '2026-05-01',
      serviceMethod: 'personal',
      serviceTime: '16:31',
    });

    expect(deemedDate).toBe('2026-05-04');
  });

  test('court-pack calculation uses the three-month Ground 8 threshold and shared narratives', async () => {
    const calculation = await buildEnglandSection8CourtPackCalculation({
      wizardFacts: {
        jurisdiction: 'england',
        claim_type: 'section_8',
        notice_service_date: '2026-05-01',
        notice_service_method: 'first_class_post',
        tenancy_start_date: '2024-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        total_arrears: 3000,
        first_unpaid_period_start: '2026-02-01',
        defendant_circumstances: '',
        ground_numbers: '8,10',
      },
      caseData: {
        jurisdiction: 'england',
        claim_type: 'section_8',
        arrears_items: [
          { period_start: '2026-02-01', amount_owed: 1500 },
          { period_start: '2026-03-01', amount_owed: 1500 },
        ],
      },
      evictionCase: {
        grounds: [{ code: 'Ground 8' }, { code: 'Ground 10' }],
      },
    });

    expect(calculation.ground8Threshold).toBe(3000);
    expect(calculation.ground8Status).toBe('AT');
    expect(calculation.dailyRentRate).toBeCloseTo(32.88, 2);
    expect(calculation.q4aText).toContain('Schedule of Arrears (Exhibit DM1)');
    expect(calculation.q5Text).toContain('Form 3A notice seeking possession was served');
    expect(calculation.validationSummary.deemed_service_date).toBe('2026-05-05');
    expect(calculation.validationSummary.notice_expiry_date).toBe('2026-05-19');
    expect(calculation.validationSummary.ground_8_status).toBe('AT');
  });
});
