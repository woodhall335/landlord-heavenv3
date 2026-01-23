// @vitest-environment jsdom
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

  it('disables Northern Ireland and Scotland/Wales for eviction flows (England only)', () => {
    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Eviction Pack/i }));

    const niOption = screen.getByRole('button', { name: /Northern Ireland/i });
    const scotlandOption = screen.getByRole('button', { name: /Scotland/i });
    const walesOption = screen.getByRole('button', { name: /Wales/i });

    // All non-England jurisdictions should be disabled for eviction packs
    expect((niOption as HTMLButtonElement).disabled).toBe(true);
    expect((scotlandOption as HTMLButtonElement).disabled).toBe(true);
    expect((walesOption as HTMLButtonElement).disabled).toBe(true);

    // UI shows multiple messages for Wales and Scotland:
    // "Complete Eviction Pack is only available for England. Use Notice Only (£39.99) for Wales/Scotland."
    // And for NI: "Eviction and money claim flows are not yet available for Northern Ireland. Tenancy agreements only."
    const evictionMessages = screen.getAllByText(/Complete Eviction Pack is only available for England/i);
    expect(evictionMessages.length).toBeGreaterThanOrEqual(1);
  });

  it('disables Northern Ireland and Scotland/Wales for money claim flows (England only)', () => {
    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Money Claim/i }));

    const niOption = screen.getByRole('button', { name: /Northern Ireland/i });
    const scotlandOption = screen.getByRole('button', { name: /Scotland/i });
    const walesOption = screen.getByRole('button', { name: /Wales/i });

    // All non-England jurisdictions should be disabled for money claims
    expect((niOption as HTMLButtonElement).disabled).toBe(true);
    expect((scotlandOption as HTMLButtonElement).disabled).toBe(true);
    expect((walesOption as HTMLButtonElement).disabled).toBe(true);

    // Check for messaging about England-only availability
    // UI shows: "Money Claim is only available for England. Use Notice Only (£39.99) for Scotland/Wales."
    // Note: Multiple messages exist (one for Wales, one for Scotland)
    const moneyClaimMessages = screen.getAllByText(/Money Claim is only available for England/i);
    expect(moneyClaimMessages.length).toBeGreaterThanOrEqual(1);
  });

  it('allows Northern Ireland tenancy agreements and routes to the flow', () => {
    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Tenancy Agreement/i }));
    fireEvent.click(screen.getByRole('button', { name: /Northern Ireland/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Wizard/i }));

    expect(pushMock).toHaveBeenCalledWith(
      '/wizard/flow?type=tenancy_agreement&jurisdiction=northern-ireland&product=tenancy_agreement'
    );
  });
});
