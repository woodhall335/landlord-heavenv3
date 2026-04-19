// @vitest-environment jsdom
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import WizardFlowPage from '@/app/(app)/wizard/flow/page';

const hoisted = vi.hoisted(() => ({
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  currentParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: hoisted.pushMock,
    replace: hoisted.replaceMock,
  }),
  useSearchParams: () => hoisted.currentParams,
}));

vi.mock('@/components/layout/HeaderConfig', () => ({
  HeaderConfig: () => null,
}));

vi.mock('@/components/wizard/flows/EvictionSectionFlow', () => ({
  EvictionSectionFlow: () => <div>Eviction section flow</div>,
}));

vi.mock('@/components/wizard/flows/NoticeOnlySectionFlow', () => ({
  NoticeOnlySectionFlow: () => <div>Notice-only section flow</div>,
}));

vi.mock('@/components/wizard/flows/MoneyClaimSectionFlow', () => ({
  MoneyClaimSectionFlow: () => <div>Money claim flow</div>,
}));

vi.mock('@/components/wizard/flows/TenancySectionFlow', () => ({
  TenancySectionFlow: () => <div>Tenancy flow</div>,
}));

vi.mock('@/components/wizard/flows/ResidentialStandaloneSectionFlow', () => ({
  ResidentialStandaloneSectionFlow: () => <div>Residential standalone flow</div>,
}));

vi.mock('@/components/wizard/flows/Section13WizardFlow', () => ({
  Section13WizardFlow: () => <div>Section 13 flow</div>,
}));

vi.mock('@/components/wizard/StructuredWizard', () => ({
  StructuredWizard: () => <div>Structured wizard</div>,
}));

vi.mock('@/components/wizard/EnglandTenancyProductChooser', () => ({
  EnglandTenancyProductChooser: () => <div>Tenancy chooser</div>,
}));

vi.mock('@/lib/analytics', () => ({
  trackWizardStartWithAttribution: vi.fn(),
}));

vi.mock('@/lib/wizard/wizardAttribution', () => ({
  setWizardAttribution: () => ({
    src: 'product_page',
    topic: 'eviction',
  }),
  getOrCreateWizardFlowSession: () => ({ sessionId: 'flow-session-1' }),
  hasWizardStarted: () => false,
  markWizardStarted: vi.fn(),
  extractAttributionFromUrl: () => ({
    src: 'product_page',
    topic: 'eviction',
  }),
}));

vi.mock('@/lib/session-token', () => ({
  getSessionTokenHeaders: () => ({}),
}));

describe('England eviction wizard entry switcher', () => {
  beforeEach(() => {
    hoisted.pushMock.mockReset();
    hoisted.replaceMock.mockReset();
    hoisted.currentParams = new URLSearchParams(
      'type=eviction&product=notice_only&src=product_page&topic=eviction'
    );
    vi.stubGlobal('fetch', vi.fn());
  });

  it('shows a one-time chooser before the flow and does not start a case yet', async () => {
    render(<WizardFlowPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Choose the pack you want to start with/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Your questions start on Case Basics after you choose a product\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Eviction Notice Generator/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete Eviction Pack/i })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('starts the real wizard after the landlord confirms a product', async () => {
    hoisted.currentParams = new URLSearchParams(
      'type=eviction&product=notice_only&src=product_page&topic=eviction&entry=steps'
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          case_id: 'case-123',
        }),
      })
    );

    render(<WizardFlowPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/wizard/start',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Notice-only section flow')).toBeInTheDocument();
    });
  });

  it('moves from the chooser into the flow with an explicit steps entry param', async () => {
    render(<WizardFlowPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Choose the pack you want to start with/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Eviction Notice Generator/i }));

    expect(hoisted.pushMock).toHaveBeenCalledWith(
      '/wizard/flow?type=eviction&product=notice_only&src=product_page&topic=eviction&entry=steps'
    );
  });
});
