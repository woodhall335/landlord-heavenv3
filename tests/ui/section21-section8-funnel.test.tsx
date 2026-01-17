/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Section21ValidatorPage from '@/app/tools/validators/section-21/page';
import Section8ValidatorPage from '@/app/tools/validators/section-8/page';
import Section21TemplatePage from '@/app/section-21-notice-template/page';
import Section8TemplatePage from '@/app/section-8-notice-template/page';
import FreeSection21Tool from '@/app/tools/free-section-21-notice-generator/page';
import FreeSection8Tool from '@/app/tools/free-section-8-notice-generator/page';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/validators/ValidatorPage', () => ({
  ValidatorPage: () => <div data-testid="validator-page" />,
}));

describe('section 21/8 funnel UI', () => {
  it('shows England-only badges on validators and generators', () => {
    render(<Section21ValidatorPage />);
    expect(screen.getAllByText(/England only/i).length).toBeGreaterThan(0);
    cleanup();

    render(<Section8ValidatorPage />);
    expect(screen.getAllByText(/England only/i).length).toBeGreaterThan(0);
    cleanup();

    render(<FreeSection21Tool />);
    expect(screen.getAllByText(/England only/i).length).toBeGreaterThan(0);
    cleanup();

    render(<FreeSection8Tool />);
    expect(screen.getAllByText(/England only/i).length).toBeGreaterThan(0);
  });

  it('routes template CTAs to the wizard', () => {
    render(<Section21TemplatePage />);
    const section21Cta = screen.getAllByRole('link', { name: /Get Court-Ready Notice/i })[0];
    expect(section21Cta.getAttribute('href')).toContain('/wizard?product=notice_only');
    expect(section21Cta.getAttribute('href')).toContain('jurisdiction=england');
    cleanup();

    render(<Section8TemplatePage />);
    const section8Cta = screen.getAllByRole('link', { name: /Get Complete Pack/i })[0];
    expect(section8Cta.getAttribute('href')).toContain('/wizard?product=complete_pack');
    expect(section8Cta.getAttribute('href')).toContain('jurisdiction=england');
  });

  it('routes generator upgrades to the notice-only pack', () => {
    render(<FreeSection21Tool />);
    const section21Upgrade = screen.getByRole('link', { name: /Get Court-Ready Pack/i });
    expect(section21Upgrade.getAttribute('href')).toBe('/products/notice-only?product=section21');
    cleanup();

    render(<FreeSection8Tool />);
    const section8Upgrade = screen.getByRole('link', { name: /Get Court-Ready Pack/i });
    expect(section8Upgrade.getAttribute('href')).toBe('/products/notice-only?product=section8');
  });
});
