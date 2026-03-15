// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import WizardPage from '@/app/wizard/page';

const pushMock = vi.fn();
const searchParamsState: Record<string, string | null> = {};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (key: string) => searchParamsState[key] ?? null,
  }),
}));

describe('Wizard selection UI England-only standalone gating', () => {
  beforeEach(() => {
    pushMock.mockReset();
    Object.keys(searchParamsState).forEach((key) => {
      delete searchParamsState[key];
    });
  });

  it('shows only England for England-only standalone residential products', () => {
    searchParamsState.product = 'rental_inspection_report';

    render(<WizardPage />);

    expect(screen.getByText(/england properties only/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /England/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Wales/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Scotland/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Northern Ireland/i })).toBeNull();
  });

  it('restores broader jurisdiction choices when the user switches document families', () => {
    searchParamsState.product = 'rental_inspection_report';

    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Back to document selection/i }));
    fireEvent.click(screen.getByRole('button', { name: /Eviction Notices/i }));

    expect(screen.getByRole('button', { name: /England/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Wales/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Scotland/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Northern Ireland/i })).toBeNull();
  });
});
