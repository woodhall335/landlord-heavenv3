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
  });
});
