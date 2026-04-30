import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ArrearsScheduleStep } from '@/components/wizard/ArrearsScheduleStep';

describe('ArrearsScheduleStep', () => {
  it('does not render a notes column in the shared arrears table', async () => {
    const onUpdate = vi.fn();

    render(
      <ArrearsScheduleStep
        facts={{
          tenancy_start_date: '2025-01-01',
          rent_amount: 1200,
          rent_frequency: 'monthly',
          notice_served_date: '2025-02-15',
          tenancy: {
            start_date: '2025-01-01',
            rent_amount: 1200,
            rent_frequency: 'monthly',
          },
          issues: {
            rent_arrears: {
              arrears_items: [],
            },
          },
        }}
        onUpdate={onUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: /payment status/i })).toBeInTheDocument();
    });

    expect(screen.queryByRole('columnheader', { name: /^notes$/i })).not.toBeInTheDocument();
  });
});
