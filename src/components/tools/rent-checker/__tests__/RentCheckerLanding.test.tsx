/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RentCheckerLanding } from '../RentCheckerLanding';

describe('RentCheckerLanding', () => {
  it('routes the direct Section 13 notice CTA into the standard rent increase wizard', () => {
    render(<RentCheckerLanding onStart={vi.fn()} />);

    const cta = screen.getByRole('button', { name: /Generate Section 13 Notice Pack Now/i });
    const link = cta.closest('a');

    expect(link).toHaveAttribute(
      'href',
      '/wizard/flow?type=rent_increase&product=section13_standard&src=product_page&topic=general'
    );
    expect(screen.queryByText(/Already increasing rent\? Create my Section 13 notice/i)).not.toBeInTheDocument();
  });
});
