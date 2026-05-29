/** @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Section8NoticeDateCalculator } from '../Section8NoticeDateCalculator';

describe('Section8NoticeDateCalculator', () => {
  it('renders the default Ground 8 result and notice-only upsell', () => {
    render(<Section8NoticeDateCalculator />);

    expect(screen.getByText('Calculate the date before you serve')).toBeInTheDocument();
    expect(screen.getAllByText('Ground 8: Rent arrears').length).toBeGreaterThan(0);
    expect(screen.getByText('Earliest court-paper date')).toBeInTheDocument();
    expect(screen.getByText('Create my Section 8 notice')).toBeInTheDocument();
  });

  it('switches the upsell to Complete Pack when the notice has expired', () => {
    render(<Section8NoticeDateCalculator />);

    fireEvent.click(screen.getByText('Expired, tenant still there'));

    expect(screen.getByText('Prepare my court papers')).toBeInTheDocument();
    expect(screen.getAllByText(/N5, N119, witness statement/).length).toBeGreaterThan(0);
  });

  it('changes selected grounds when the landlord problem changes', () => {
    render(<Section8NoticeDateCalculator />);

    fireEvent.click(screen.getByText('I need to sell the property'));

    expect(screen.getAllByText('Ground 1A: Sale of dwelling house').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4 months').length).toBeGreaterThan(0);
    expect(screen.queryByText('Ground 8: Rent arrears')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show all grounds' }));

    expect(screen.getAllByText('Ground 8: Rent arrears').length).toBeGreaterThan(0);
  });

  it('blocks the notice CTA when Ground 1A is not available on the calculated notice expiry date', () => {
    render(<Section8NoticeDateCalculator />);

    fireEvent.click(screen.getByText('I need to sell the property'));
    fireEvent.change(screen.getByLabelText(/Date posted, delivered, or planned/i), {
      target: { value: '2026-05-29' },
    });
    fireEvent.change(screen.getByLabelText(/Tenancy start date/i), {
      target: { value: '2026-01-01' },
    });

    expect(screen.getByText('SECTION_8_BLOCKED')).toBeInTheDocument();
    expect(screen.getByText(/Ground 1A status: Not currently available/i)).toBeInTheDocument();
    expect(screen.getAllByText('01 January 2027').length).toBeGreaterThan(0);
    expect(screen.getByText(/Current notice expiry/i)).toBeInTheDocument();
    expect(screen.getAllByText('02 October 2026').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Create my Section 8 notice' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fix blocking issues to continue/i })).toBeDisabled();
  });
});
