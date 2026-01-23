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

  it('hides Northern Ireland and Scotland/Wales for eviction flows (England only)', () => {
    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Eviction Pack/i }));

    // England should be the only jurisdiction shown for Complete Eviction Pack
    expect(screen.getByRole('button', { name: /England/i })).toBeTruthy();

    // Non-England jurisdictions should be hidden, not shown
    expect(screen.queryByRole('button', { name: /Northern Ireland/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Scotland/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Wales/i })).toBeNull();
  });

  it('hides Northern Ireland and Scotland/Wales for money claim flows (England only)', () => {
    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Money Claim/i }));

    // England should be the only jurisdiction shown for Money Claims
    expect(screen.getByRole('button', { name: /England/i })).toBeTruthy();

    // Non-England jurisdictions should be hidden, not shown
    expect(screen.queryByRole('button', { name: /Northern Ireland/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Scotland/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Wales/i })).toBeNull();
  });

  it('shows England, Wales, and Scotland for notice_only (hides Northern Ireland)', () => {
    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Eviction Notices/i }));

    // England, Wales, and Scotland should be shown
    expect(screen.getByRole('button', { name: /England/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Wales/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Scotland/i })).toBeTruthy();

    // Northern Ireland should be hidden for notice_only
    expect(screen.queryByRole('button', { name: /Northern Ireland/i })).toBeNull();
  });

  it('shows all jurisdictions for tenancy agreements', () => {
    render(<WizardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Tenancy Agreement/i }));

    // All jurisdictions should be shown for tenancy agreements
    expect(screen.getByRole('button', { name: /England/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Wales/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Scotland/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Northern Ireland/i })).toBeTruthy();
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
