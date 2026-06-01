/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ClaimsWizard } from '../ClaimsWizard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('ClaimsWizard', () => {
  it('renders the eight claim category cards on the first screen', () => {
    render(<ClaimsWizard />);

    expect(screen.getByRole('heading', { name: /what type of money claim do you need/i })).toBeInTheDocument();
    expect(screen.getByText(/unified money claim pack price of \u00A328\.99/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /landlord debt claim/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unpaid invoice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /loan or money owed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /faulty goods refund/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /poor service \/ contractor dispute/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /builder or tradesperson dispute/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deposit refund/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /vehicle repair \/ damage dispute/i })).toBeInTheDocument();
  });

  it('moves into a one-question interview for a selected generic claim', () => {
    render(<ClaimsWizard />);

    fireEvent.click(screen.getByRole('button', { name: /unpaid invoice/i }));

    expect(screen.getByText(/ask heaven is checking what we need next/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /who is making the claim/i })).toBeInTheDocument();
    expect(screen.getByText(/generic small-claim pack/i)).toBeInTheDocument();
  });

  it('keeps landlord debt claims inside the claims checkout flow', () => {
    render(<ClaimsWizard />);

    fireEvent.click(screen.getByRole('button', { name: /landlord debt claim/i }));

    for (const answer of [
      'John Smith',
      '1 Claimant Street',
      'SW1A 1AA',
      'Sarah Doe',
      '2 Defendant Road',
      'SW1A 2AA',
      '25 High Street',
      'SW1A 3AA',
      '2025-01-01',
    ]) {
      const field = screen.getByPlaceholderText(/type the answer here/i);
      fireEvent.change(field, { target: { value: answer } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    }

    for (const answer of [
      '1200',
      'monthly',
      '1st of each month',
      'January rent - 1200',
      'Cleaning - 100',
      'The tenant owes rent under the agreement and has not paid.',
      'Payment was chased twice by email.',
      true,
      '2025-02-01',
    ]) {
      if (typeof answer === 'boolean') {
        fireEvent.click(screen.getByRole('button', { name: /yes/i }));
      } else {
        const field = screen.getByPlaceholderText(/type the answer here|0\.00|example:/i);
        fireEvent.change(field, { target: { value: answer } });
      }
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    }

    const tenancyEvidenceButton = screen
      .getAllByText(/tenancy agreement/i)
      .map((element) => element.closest('button'))
      .find(Boolean);
    fireEvent.click(tenancyEvidenceButton!);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /yes/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByRole('button', { name: /continue to checkout/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /continue to landlord money claim pack/i })).not.toBeInTheDocument();
    expect(screen.getByText(/you do not need to restart in another wizard/i)).toBeInTheDocument();
    expect(screen.queryByText(/suggested based on your story/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/what does this evidence show/i)).not.toBeInTheDocument();
  });
});
