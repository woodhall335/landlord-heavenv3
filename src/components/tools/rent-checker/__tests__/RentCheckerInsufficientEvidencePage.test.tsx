/** @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RentCheckerInsufficientEvidencePage } from '../RentCheckerResultPage';

describe('RentCheckerInsufficientEvidencePage', () => {
  it('renders source statuses and retry actions for insufficient live evidence', () => {
    const onRetry = vi.fn();
    const onEditDetails = vi.fn();

    render(
      <RentCheckerInsufficientEvidencePage
        failure={{
          code: 'insufficient_live_comparables',
          message:
            'We could only gather 2 live comparable listings across Rightmove and OpenRent for LS1.',
          sourceStatuses: [
            {
              source: 'rightmove',
              route: 'rightmove_direct',
              ok: true,
              count: 2,
              detail: 'Imported 2 comparable listings from Rightmove.',
            },
            {
              source: 'openrent',
              route: null,
              ok: false,
              count: 0,
              detail: 'OpenRent did not return usable live comparables for LS1.',
            },
          ],
        }}
        onRetry={onRetry}
        onEditDetails={onEditDetails}
      />
    );

    expect(
      screen.getByText('We could not gather enough live comparables for a grounded result')
    ).toBeInTheDocument();
    expect(screen.getByText('Rightmove')).toBeInTheDocument();
    expect(screen.getByText('OpenRent')).toBeInTheDocument();
    expect(screen.getByText('2 live listings')).toBeInTheDocument();
    expect(screen.getByText('0 live listings')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry live search/i }));
    fireEvent.click(screen.getByRole('button', { name: /edit property details/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onEditDetails).toHaveBeenCalledTimes(1);
  });
});
