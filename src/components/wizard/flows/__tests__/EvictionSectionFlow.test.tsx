/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/lib/wizard/facts-client', () => ({
  getCaseFacts: vi.fn().mockResolvedValue({}),
  saveCaseFacts: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/analytics', () => ({
  trackWizardStepCompleteWithAttribution: vi.fn(),
}));

vi.mock('@/lib/wizard/wizardAttribution', () => ({
  getWizardAttribution: () => ({}),
  markStepCompleted: () => true,
}));

vi.mock('@/lib/arrears-engine', () => ({
  validateGround8Eligibility: () => ({ is_eligible: true, arrears_in_months: 3, threshold_label: '3 months' }),
}));

vi.mock('@/components/wizard/AskHeavenPanel', () => ({
  AskHeavenPanel: () => <div data-testid="ask-heaven-panel">Ask Heaven Panel</div>,
}));

import { EvictionSectionFlow } from '../EvictionSectionFlow';

function escapeStepLabel(label: string): string {
  return label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stepButtonName(label: string): RegExp {
  return new RegExp(`^(?:\\d+\\s+)?${escapeStepLabel(label)}$`, 'i');
}

function getStepButton(label: string) {
  return screen.getByRole('button', { name: stepButtonName(label) });
}

const englandCompletePackProps = {
  caseId: 'test-complete-pack-england',
  jurisdiction: 'england' as const,
  initialFacts: {
    __meta: { product: 'complete_pack', jurisdiction: 'england' },
    eviction_route: 'section_8',
    landlord_full_name: 'Jane Landlord',
    landlord_address_line1: '1 Owner Road',
    landlord_address_town: 'London',
    landlord_address_postcode: 'SW1A 1AA',
    tenant_full_name: 'Tom Tenant',
    property_address_line1: '2 Example Street',
    property_address_town: 'London',
    property_address_postcode: 'E1 1AA',
    tenancy_start_date: '2024-01-01',
    rent_amount: 950,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    section8_grounds: ['Ground 8 - Serious rent arrears', 'Ground 10 - Some rent arrears'],
    section8_details: 'The tenant has failed to pay rent falling due from January 2026 onwards.',
    notice_already_served: false,
    notice_served_date: '2026-04-20',
    notice_service_method: 'first_class_post',
    notice_service_location: 'usual_residence',
    notice_service_recipient_capacity: 'defendant',
    section_16e_duties_checked: true,
    breathing_space_checked: true,
    tenant_in_breathing_space: false,
    deposit_taken: false,
    epc_served: true,
    how_to_rent_served: true,
    has_gas_appliances: false,
    evidence_bundle_ready: true,
    communication_timeline: {
      total_attempts: 3,
      tenant_responsiveness: 'limited',
      log: '10 January 2026: reminder sent. 24 January 2026: chase call. 7 February 2026: final warning sent.',
    },
    tenant_disputes_claim: false,
    disrepair_complaints: false,
    previous_court_proceedings: false,
    tenant_vulnerability: false,
    tenant_counterclaim_likely: false,
    payment_plan_offered: false,
    benefit_type: 'none',
    arrears_items: [
      {
        period_start: '2026-01-01',
        period_end: '2026-01-31',
        rent_due: 950,
        rent_paid: 0,
        amount_owed: 950,
      },
      {
        period_start: '2026-02-01',
        period_end: '2026-02-28',
        rent_due: 950,
        rent_paid: 0,
        amount_owed: 950,
      },
      {
        period_start: '2026-03-01',
        period_end: '2026-03-31',
        rent_due: 950,
        rent_paid: 0,
        amount_owed: 950,
      },
    ],
    total_arrears: 2850,
    arrears_at_notice_date: 2850,
    court_name: 'Central London County Court',
    signatory_name: 'Jane Landlord',
    signature_date: '2026-04-26',
  },
};

describe('EvictionSectionFlow - England complete pack', () => {
  it('shows the complete-pack shell title and key court-ready steps', async () => {
    render(<EvictionSectionFlow {...englandCompletePackProps} />);

    await screen.findByText(/Complete Eviction Pack/i);
    expect(screen.getByText(/Tenant is not paying rent/i)).toBeDefined();
    expect(getStepButton("What's going on?")).toBeDefined();
    expect(getStepButton('Who and where?')).toBeDefined();
    expect(getStepButton('Tenancy details')).toBeDefined();
    expect(getStepButton('When will you serve?')).toBeDefined();
    expect(getStepButton('About the arrears')).toBeDefined();
    expect(getStepButton('Evidence summary')).toBeDefined();
    expect(getStepButton('Prepare your court claim')).toBeDefined();
    expect(getStepButton('Review your court-ready pack')).toBeDefined();
  });

  it('surfaces the court-pack evidence and claim assembly checkpoints', async () => {
    render(<EvictionSectionFlow {...englandCompletePackProps} />);

    await screen.findByText(/Complete Eviction Pack/i);

    expect(screen.getAllByText(/Step 1 of 9/i).length).toBeGreaterThan(0);
    expect(getStepButton('Prepare your court claim')).toBeDefined();
    expect(getStepButton('Review your court-ready pack')).toBeDefined();
    expect(screen.getAllByTestId('ask-heaven-panel').length).toBeGreaterThan(0);
  });

  it('skips ground details for arrears-only complete-pack cases', async () => {
    render(<EvictionSectionFlow {...englandCompletePackProps} />);

    await screen.findByText(/Complete Eviction Pack/i);

    expect(screen.queryByRole('button', { name: stepButtonName('Ground details') })).toBeNull();
    expect(getStepButton('About the arrears')).toBeDefined();
  });

  it('shows ground details and skips arrears for specialist-only complete-pack cases', async () => {
    render(
      <EvictionSectionFlow
        {...englandCompletePackProps}
        initialFacts={{
          ...englandCompletePackProps.initialFacts,
          section8_grounds: ['Ground 1A - Sale of dwelling house'],
          section8_details: 'The landlord intends to sell the dwelling-house and has instructed agents.',
          arrears_items: [],
          total_arrears: 0,
          arrears_at_notice_date: 0,
        }}
      />
    );

    await screen.findByText(/Complete Eviction Pack/i);

    expect(getStepButton('Ground details')).toBeDefined();
    expect(screen.queryByRole('button', { name: stepButtonName('About the arrears') })).toBeNull();
  });

  it('shows both ground details and arrears for mixed complete-pack cases', async () => {
    render(
      <EvictionSectionFlow
        {...englandCompletePackProps}
        initialFacts={{
          ...englandCompletePackProps.initialFacts,
          section8_grounds: ['Ground 8 - Serious rent arrears', 'Ground 1A - Sale of dwelling house'],
        }}
      />
    );

    await screen.findByText(/Complete Eviction Pack/i);

    expect(getStepButton('Ground details')).toBeDefined();
    expect(getStepButton('About the arrears')).toBeDefined();
  });

  it('review step shows the full England court-pack document checkpoints', async () => {
    const user = userEvent.setup();

    render(<EvictionSectionFlow {...englandCompletePackProps} />);

    await screen.findByText(/Complete Eviction Pack/i);
    await user.click(getStepButton('Review your court-ready pack'));

    await screen.findByText(/Core document checkpoints/i);

    expect(screen.getAllByText(/Form N5 - Claim for Possession/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Form N119 - Particulars of Claim/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Certificate of Service \(Form N215\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Witness Statement/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Court Bundle Index/i).length).toBeGreaterThan(0);
  });
});

