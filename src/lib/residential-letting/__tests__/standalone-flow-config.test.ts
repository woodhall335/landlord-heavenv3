import { describe, expect, it } from 'vitest';

import {
  calculateArrearsScheduleTotal,
  getResidentialStandaloneCompletionErrors,
  getResidentialStandaloneFlowConfig,
  validateArrearsScheduleRows,
} from '@/lib/residential-letting/standalone-flow-config';
import { RESIDENTIAL_LETTING_PRODUCT_SKUS } from '@/lib/residential-letting/products';

describe('residential standalone flow config', () => {
  it('defines a detailed standalone flow for all residential products', () => {
    RESIDENTIAL_LETTING_PRODUCT_SKUS.forEach((sku) => {
      const config = getResidentialStandaloneFlowConfig(sku);
      expect(config.product).toBe(sku);
      expect(config.steps.length).toBeGreaterThanOrEqual(5);
      expect(config.requiredFacts.length).toBeGreaterThan(0);
      expect(config.reviewSummaryFields.length).toBeGreaterThan(0);
      expect(config.completionRules.length).toBeGreaterThan(0);
    });
  });

  it('validates detailed arrears schedules and computes totals', () => {
    const rows = [
      {
        due_date: '2026-01-05',
        period_covered: 'January 2026',
        amount_due: 1200,
        amount_paid: 200,
        amount_outstanding: 1000,
      },
      {
        due_date: '2026-02-05',
        period_covered: 'February 2026',
        amount_due: 1200,
        amount_paid: 0,
        amount_outstanding: 1200,
      },
    ];

    expect(validateArrearsScheduleRows(rows)).toEqual([]);
    expect(calculateArrearsScheduleTotal(rows)).toBe(2200);
  });

  it('reports completion errors for missing required standalone facts', () => {
    const errors = getResidentialStandaloneCompletionErrors('rent_arrears_letter', {
      jurisdiction: 'england',
      arrears_mode: 'detailed_schedule',
      arrears_schedule_rows: [],
    });

    expect(errors.some((error) => error.includes('Missing required fact: sender_name'))).toBe(true);
    expect(errors.some((error) => error.includes('Add at least one arrears schedule row'))).toBe(true);
  });
});
