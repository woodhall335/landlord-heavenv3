/**
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SocialProofCounter } from './SocialProofCounter';

describe('SocialProofCounter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts at zero and rises with the time of day', () => {
    vi.setSystemTime(new Date(2026, 8, 9, 12, 0, 0));
    render(<SocialProofCounter variant="today" />);

    expect(screen.getByTestId('usage-today-counter')).toHaveTextContent(
      '0 landlords have used Landlord Heaven today'
    );

    act(() => vi.runAllTimers());
    expect(screen.getByTestId('usage-today-counter')).toHaveTextContent(
      '250 landlords have used Landlord Heaven today'
    );
  });

  it('never decreases the stored value during the same day', () => {
    const now = new Date(2026, 8, 9, 10, 0, 0);
    vi.setSystemTime(now);
    localStorage.setItem(
      'social_proof_today',
      JSON.stringify({ date: now.toDateString(), count: 400, variance: 0 })
    );
    sessionStorage.setItem(`social_proof_today_animated_${now.toDateString()}`, 'true');

    render(<SocialProofCounter variant="today" />);
    act(() => vi.runOnlyPendingTimers());
    expect(screen.getByTestId('usage-today-counter')).toHaveTextContent(
      '400 landlords have used Landlord Heaven today'
    );
  });

  it('caps the daily count at 500', () => {
    vi.setSystemTime(new Date(2026, 8, 9, 23, 59, 0));
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    render(<SocialProofCounter variant="today" />);

    act(() => vi.runAllTimers());
    expect(screen.getByTestId('usage-today-counter')).toHaveTextContent(
      '500 landlords have used Landlord Heaven today'
    );
  });
});
