/**
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssistedPrepIntakeForm } from '../AssistedPrepIntakeForm';

vi.mock('next/navigation', () => ({
  usePathname: () => '/assisted-prep/start',
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams('service=section8'),
}));

vi.mock('@/lib/session-token', () => ({
  getSessionTokenHeaders: () => ({}),
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('AssistedPrepIntakeForm', () => {
  it('requires a clear description of the landlord\'s current issue', () => {
    render(<AssistedPrepIntakeForm />);

    const overview = screen.getByLabelText('Briefly describe what is happening');
    expect(overview).toBeRequired();
    expect(overview).toHaveAttribute('minlength', '15');
    expect(screen.queryByText('Add a short note')).not.toBeInTheDocument();
  });

  it('asks the landlord to confirm the assistance they need', () => {
    render(<AssistedPrepIntakeForm />);

    expect(screen.getByLabelText('What type of assistance do you need?')).toHaveValue('section8');
    expect(
      screen.getByRole('option', {
        name: /Full eviction case, including notice and court forms/,
      })
    ).toBeInTheDocument();
  });
});
