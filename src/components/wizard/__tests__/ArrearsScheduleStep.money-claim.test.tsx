/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ArrearsScheduleStep } from '../ArrearsScheduleStep';

describe('ArrearsScheduleStep money claim mode', () => {
  it('does not show possession Ground 8 threshold guidance for money claims', () => {
    render(
      <ArrearsScheduleStep
        jurisdiction="england"
        showThresholdGuidance
        onUpdate={vi.fn()}
        facts={{
          product: 'money_claim',
          tenancy: {
            start_date: '2024-05-13',
            rent_amount: 1950,
            rent_frequency: 'monthly',
            rent_due_day: 13,
          },
          issues: {
            rent_arrears: {
              arrears_items: [
                {
                  period_start: '2026-04-13',
                  period_end: '2026-05-12',
                  rent_due: 1950,
                  rent_paid: 0,
                  amount_owed: 1950,
                  is_pro_rated: false,
                },
                {
                  period_start: '2026-05-13',
                  period_end: '2026-06-12',
                  rent_due: 1950,
                  rent_paid: 0,
                  amount_owed: 1950,
                  is_pro_rated: false,
                },
              ],
            },
          },
        }}
      />,
    );

    expect(screen.getByText('Total Arrears:')).toBeInTheDocument();
    expect(screen.getByText('£3900.00')).toBeInTheDocument();
    expect(screen.queryByText(/Ground 8 Threshold/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Grounds 10 or 11/i)).not.toBeInTheDocument();
  });
});
