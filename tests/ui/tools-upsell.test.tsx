/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import FreeSection21Tool from '@/app/tools/free-section-21-notice-generator/page';
import FreeSection8Tool from '@/app/tools/free-section-8-notice-generator/page';
import RentDemandLetterGenerator from '@/app/tools/free-rent-demand-letter/page';
import RentArrearsCalculator from '@/app/tools/rent-arrears-calculator/page';
import HMOLicenseChecker from '@/app/tools/hmo-license-checker/page';
import Section21ValidatorPage from '@/app/tools/validators/section-21/page';
import Section8ValidatorPage from '@/app/tools/validators/section-8/page';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ case_id: 'case-1' }),
  }) as typeof fetch;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const expectUpsellBlock = () => {
  expect(screen.getAllByTestId('tool-upsell').length).toBeGreaterThan(0);
};

const renderAndCheck = (ui: React.ReactElement) => {
  render(ui);
  expectUpsellBlock();
  cleanup();
};

describe('tool upsell blocks', () => {
  it('renders upsell blocks on generators and calculators', () => {
    renderAndCheck(<FreeSection21Tool />);
    renderAndCheck(<FreeSection8Tool />);
    renderAndCheck(<RentDemandLetterGenerator />);
    renderAndCheck(<RentArrearsCalculator />);
    renderAndCheck(<HMOLicenseChecker />);
  });

  it('renders upsell blocks and England-only badges on validators', async () => {
    await act(async () => {
      render(<Section21ValidatorPage />);
    });
    expectUpsellBlock();
    expect(screen.getAllByText(/England only/i).length).toBeGreaterThan(0);
    cleanup();

    await act(async () => {
      render(<Section8ValidatorPage />);
    });
    expectUpsellBlock();
    expect(screen.getAllByText(/England only/i).length).toBeGreaterThan(0);
  });
});
