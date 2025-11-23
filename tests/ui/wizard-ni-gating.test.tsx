import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import WizardPage from '@/app/wizard/page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

describe('Wizard selection UI Northern Ireland gating', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it('disables Northern Ireland selection for eviction flows and shows messaging', () => {
    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Eviction Pack/i }));

    const niOption = screen.getByRole('button', { name: /Northern Ireland/i });
    expect((niOption as HTMLButtonElement).disabled).toBe(true);
    expect(
      screen.getByText(
        'Eviction and money claim flows are unavailable here. Tenancy agreements only.'
      )
    ).toBeTruthy();
  });

  it('disables Northern Ireland selection for money claim flows (Scotland is now enabled)', () => {
    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Money Claim/i }));

    const niOption = screen.getByRole('button', { name: /Northern Ireland/i });
    const scotlandOption = screen.getByRole('button', { name: /Scotland/i });

    // Only Northern Ireland should be disabled - Scotland is now enabled for money claims
    expect((niOption as HTMLButtonElement).disabled).toBe(true);
    expect((scotlandOption as HTMLButtonElement).disabled).toBe(false);

    // Check for Northern Ireland specific message
    expect(
      screen.getByText(/Eviction and money claim flows are unavailable here/i)
    ).toBeTruthy();
  });

  it('allows Northern Ireland tenancy agreements and routes to the flow', () => {
    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Tenancy Agreement/i }));
    fireEvent.click(screen.getByRole('button', { name: /Northern Ireland/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Wizard/i }));

    expect(pushMock).toHaveBeenCalledWith(
      '/wizard/flow?type=tenancy_agreement&jurisdiction=northern-ireland'
    );
  });
});
