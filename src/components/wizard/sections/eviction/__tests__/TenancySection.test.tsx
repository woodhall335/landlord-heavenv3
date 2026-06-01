/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WizardFacts } from '@/lib/case-facts/schema';
import { TenancySection } from '../TenancySection';

describe('TenancySection', () => {
  it('shows a fixed periodic tenancy type for England Form 3A routes', async () => {
    const onUpdate = vi.fn();

    render(
      <TenancySection
        facts={{
          eviction_route: 'section_8',
          tenancy_start_date: '2026-05-01',
          tenancy_type: 'ast_fixed',
          rent_amount: 950,
          rent_frequency: 'monthly',
          rent_due_day: 1,
        } as WizardFacts}
        jurisdiction="england"
        onUpdate={onUpdate}
      />,
    );

    expect(screen.getByDisplayValue('Periodic Tenancy Agreement')).toBeInTheDocument();
    expect(screen.queryByText(/Assured Shorthold Tenancy \(Fixed term\)/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Fixed term end date/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Section 8 Rent Details/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/2-month threshold/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({ tenancy_type: 'ast_periodic' });
    });
  });

  it('keeps the selectable tenancy type for Scotland routes', () => {
    render(
      <TenancySection
        facts={{
          eviction_route: 'eviction',
          tenancy_type: 'prt',
          rent_amount: 950,
          rent_frequency: 'monthly',
          rent_due_day: 1,
        } as WizardFacts}
        jurisdiction="scotland"
        onUpdate={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/Tenancy type/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Private Residential Tenancy/i).length).toBeGreaterThan(0);
  });
});
