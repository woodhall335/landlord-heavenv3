/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TenancyJurisdictionSelector } from '@/components/tenancy/TenancyJurisdictionSelector';

const trackCtaClick = vi.fn();
const trackCtaImpression = vi.fn();

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/journey/events', () => ({
  trackCtaClick: (...args: unknown[]) => trackCtaClick(...args),
  trackCtaImpression: (...args: unknown[]) => trackCtaImpression(...args),
}));

describe('TenancyJurisdictionSelector', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('offers every released standard jurisdiction and keeps the Welsh choices distinct', () => {
    render(<TenancyJurisdictionSelector />);

    expect(screen.getByRole('heading', { name: 'England' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Wales' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Scotland' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Northern Ireland' })).toBeInTheDocument();

    const fixed = screen.getByRole('link', {
      name: /Wales Fixed-Term Standard Occupation Contract/,
    });
    const periodic = screen.getByRole('link', {
      name: /Wales Periodic Standard Occupation Contract/,
    });
    expect(fixed).toHaveAttribute(
      'href',
      expect.stringContaining('jurisdiction=wales&contract_type=fixed')
    );
    expect(periodic).toHaveAttribute(
      'href',
      expect.stringContaining('jurisdiction=wales&contract_type=periodic')
    );
    expect(fixed.getAttribute('href')).not.toBe(periodic.getAttribute('href'));
  });

  it('uses canonical released wizard identifiers and exposes no regional Premium option', () => {
    const { container } = render(<TenancyJurisdictionSelector />);

    expect(
      screen.getByRole('link', { name: /England Standard Assured Periodic Tenancy Agreement/ })
    ).toHaveAttribute('href', expect.stringContaining('england_standard_tenancy_agreement'));
    expect(
      screen.getByRole('link', { name: /Scotland Private Residential Tenancy/ })
    ).toHaveAttribute('href', expect.stringContaining('jurisdiction=scotland'));
    expect(
      screen.getByRole('link', { name: /Northern Ireland Private Tenancy Agreement/ })
    ).toHaveAttribute('href', expect.stringContaining('jurisdiction=northern-ireland'));
    expect(container.textContent).not.toMatch(/Premium/i);
  });

  it('records impressions and the selected route through existing CTA analytics', () => {
    render(<TenancyJurisdictionSelector />);

    expect(trackCtaImpression).toHaveBeenCalledTimes(5);
    const scotland = screen.getByRole('link', {
      name: /Scotland Private Residential Tenancy/,
    });
    scotland.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(scotland);
    expect(trackCtaClick).toHaveBeenCalledWith(
      expect.objectContaining({
        cta_id: 'tenancy-jurisdiction-scotland-private-residential-tenancy',
        location: 'standard-tenancy-jurisdiction-selector',
      })
    );
  });
});
