/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Section21PrecheckPanel, { getStatusCtaConfig } from './Section21PrecheckPanel';

const mockCaptureLeadWithReport = vi.fn();
const mockIsLeadCaptured = vi.fn();

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: any }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/leads/useLeadCapture', () => ({
  captureLeadWithReport: (...args: unknown[]) => mockCaptureLeadWithReport(...args),
}));

vi.mock('@/lib/leads/local', () => ({
  isLeadCaptured: () => mockIsLeadCaptured(),
}));

vi.mock('@/lib/section21Precheck', () => ({
  SECTION21_PRECHECK_DEFAULT_INPUT: {
    tenancy_start_date: '',
    is_replacement_tenancy: 'unsure',
    original_tenancy_start_date: null,
    tenancy_type: 'unsure',
    fixed_term_end_date: null,
    has_break_clause: 'unsure',
    break_clause_earliest_end_date: null,
    rent_period: 'unsure',
    planned_service_date: '',
    service_method: 'unsure',
    service_before_430pm: 'unsure',
    tenant_consented_email_service: null,
    deposit_taken: 'unsure',
    deposit_received_date: null,
    deposit_protected_date: null,
    deposit_prescribed_info_served_tenant_date: null,
    deposit_paid_by_relevant_person: null,
    deposit_prescribed_info_served_relevant_person_date: null,
    deposit_returned_in_full_or_agreed: null,
    deposit_returned_date: null,
    deposit_claim_resolved_by_court: null,
    epc_required: 'unsure',
    epc_served_date: null,
    gas_installed: 'unsure',
    gas_safety_record_issue_date: null,
    gas_safety_record_served_date: null,
    landlord_type: 'unsure',
    how_to_rent_served_date: null,
    how_to_rent_served_method: null,
    how_to_rent_was_current_version_at_tenancy_start: 'unsure',
    property_requires_hmo_licence: 'unsure',
    hmo_licence_in_place: null,
    property_requires_selective_licence: 'unsure',
    selective_licence_in_place: null,
    improvement_notice_served: 'unsure',
    improvement_notice_date: null,
    emergency_remedial_action_served: 'unsure',
    emergency_remedial_action_date: null,
    prohibited_payment_outstanding: 'unsure',
    has_proof_of_service_plan: 'unsure',
  },
  evaluateSection21Precheck: vi.fn(async () => ({
    status: 'valid',
    display: { headline: 'Section 21 looks valid' },
    blockers: [{ code: 'none', message: 'No blockers found' }],
    warnings: [{ code: 'w1', message: 'Service evidence still recommended' }],
    deemed_service_date: '2025-01-10',
    earliest_after_date: '2025-03-10',
    latest_court_start_date: '2025-09-10',
    missing_labels: [],
  })),
  getSection21PrecheckCompleteness: vi.fn(() => ({ missing_keys: [], missing_labels: [] })),
  formatDateUK: vi.fn((date: string) => date),
}));

describe('getStatusCtaConfig', () => {
  it('incomplete disables CTA and does not use valid label', () => {
    const config = getStatusCtaConfig('incomplete');
    expect(config.enabled).toBe(false);
    expect(config.label).toBe('Complete the check to continue');
    expect(config.label).not.toContain('Valid');
  });

  it('risky shows risky CTA label', () => {
    const config = getStatusCtaConfig('risky');
    expect(config.label).toBe('Use Section 8 Instead – Start Workflow');
    expect(config.enabled).toBe(true);
  });

  it('valid shows valid CTA label', () => {
    const config = getStatusCtaConfig('valid');
    expect(config.label).toBe('Section 21 is Valid – Continue');
    expect(config.enabled).toBe(true);
  });
});

describe('Section21PrecheckPanel wizard flow', () => {
  beforeEach(() => {
    localStorage.clear();
    mockIsLeadCaptured.mockReturnValue(false);
    mockCaptureLeadWithReport.mockResolvedValue({ success: true });
  });

  const renderPanel = () => render(<Section21PrecheckPanel ctaHref="/start" />);

  const goToStep4 = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  };

  it('step 4 does not render any results preview content', () => {
    renderPanel();
    goToStep4();

    expect(screen.getByText('Step 4 of 5 — Licensing & restrictions')).toBeInTheDocument();
    expect(screen.queryByText('Result preview')).not.toBeInTheDocument();
    expect(screen.queryByText(/Deemed service date/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Section 21 looks valid')).not.toBeInTheDocument();
  });

  it('step 4 next button label is Continue → Email', () => {
    renderPanel();
    goToStep4();

    expect(screen.getByRole('button', { name: 'Continue → Email' })).toBeInTheDocument();
  });

  it('step 5 hides results until lead capture succeeds with consent checked', async () => {
    renderPanel();
    goToStep4();
    fireEvent.click(screen.getByRole('button', { name: 'Continue → Email' }));

    expect(screen.getByText('Step 5 of 5 — Email + results')).toBeInTheDocument();
    expect(screen.queryByText('Section 21 looks valid')).not.toBeInTheDocument();

    const revealButton = screen.getByRole('button', { name: 'Reveal results' });
    expect(revealButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'landlord@example.com' } });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('button', { name: 'Reveal results' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Reveal results' }));

    await waitFor(() => {
      expect(screen.getByText('Section 21 looks valid')).toBeInTheDocument();
      expect(screen.getByText(/Deemed service date/i)).toBeInTheDocument();
    });
  });
});
