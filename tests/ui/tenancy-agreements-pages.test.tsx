/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import EnglandPage from '@/app/tenancy-agreements/england/page';
import WalesPage from '@/app/tenancy-agreements/wales/page';
import ScotlandPage from '@/app/tenancy-agreements/scotland/page';
import NorthernIrelandPage from '@/app/tenancy-agreements/northern-ireland/page';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const getSchemaPayloads = () =>
  Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
    (node) => node.textContent ?? '',
  );

const expectSchemaTypes = (types: string[]) => {
  const payloads = getSchemaPayloads();
  types.forEach((type) => {
    expect(payloads.some((payload) => payload.includes(`"@type":"${type}"`))).toBe(true);
  });
};

describe('tenancy agreement pages', () => {
  it('uses jurisdiction-correct terminology', () => {
    const { container: englandContainer } = render(<EnglandPage />);
    expect(englandContainer.textContent).toContain('Assured Shorthold Tenancy Agreement');
    cleanup();

    const { container: walesContainer } = render(<WalesPage />);
    expect(walesContainer.textContent).toContain('Occupation Contract');
    cleanup();

    const { container: scotlandContainer } = render(<ScotlandPage />);
    expect(scotlandContainer.textContent).not.toContain('Assured Shorthold');
    cleanup();

    const { container: northernIrelandContainer } = render(<NorthernIrelandPage />);
    expect(northernIrelandContainer.textContent).toContain('Private Tenancy Agreement');
    expect(northernIrelandContainer.textContent).toContain('Northern Ireland');
  });

  it('includes FAQ, Product, and Breadcrumb schema on each page', () => {
    render(<EnglandPage />);
    expectSchemaTypes(['FAQPage', 'Product', 'BreadcrumbList']);
    cleanup();

    render(<WalesPage />);
    expectSchemaTypes(['FAQPage', 'Product', 'BreadcrumbList']);
    cleanup();

    render(<ScotlandPage />);
    expectSchemaTypes(['FAQPage', 'Product', 'BreadcrumbList']);
    cleanup();

    render(<NorthernIrelandPage />);
    expectSchemaTypes(['FAQPage', 'Product', 'BreadcrumbList']);
  });

  it('routes tenancy agreement CTAs with jurisdiction parameters', () => {
    render(<EnglandPage />);
    const englandCta = screen.getByRole('link', { name: /Create Standard AST - £9.99/i });
    expect(englandCta.getAttribute('href')).toContain('jurisdiction=england');
    cleanup();

    render(<WalesPage />);
    const walesCta = screen.getByRole('link', { name: /Create Standard Contract - £9.99/i });
    expect(walesCta.getAttribute('href')).toContain('jurisdiction=wales');
    cleanup();

    render(<ScotlandPage />);
    const scotlandCtas = screen.getAllByRole('link', { name: /Create Standard PRT/i });
    scotlandCtas.forEach((cta) => {
      expect(cta.getAttribute('href')).toContain('jurisdiction=scotland');
    });
    cleanup();

    render(<NorthernIrelandPage />);
    const niCta = screen.getByRole('link', { name: /Create Standard - £9.99/i });
    expect(niCta.getAttribute('href')).toContain('jurisdiction=northern-ireland');
  });
});
