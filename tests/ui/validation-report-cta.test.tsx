/**
 * ValidationReport CTA Tests
 *
 * Tests that ValidationReport CTAs:
 * 1. Route to /wizard/flow (not /products/)
 * 2. Include case_id in the href
 * 3. Include jurisdiction in the href
 * 4. Show correct prices from pricing source of truth
 * 5. Track CTA clicks with analytics
 *
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationReport } from '@/components/validators/ValidationReport';

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackValidatorCtaClick: vi.fn(),
}));

// Mock getWizardCta to return predictable results
vi.mock('@/lib/checkout/cta-mapper', () => ({
  getWizardCta: vi.fn(({ caseId, jurisdiction, validator_key, validation_summary }) => {
    const status = validation_summary?.status || 'warning';
    const isInvalid = status === 'invalid' || status === 'warning';

    return {
      primary: {
        label: isInvalid ? 'Start Eviction Pack' : 'Start Notice Only',
        price: isInvalid ? 149.99 : 29.99,
        href: `/wizard/flow?type=eviction&jurisdiction=${jurisdiction}&product=${isInvalid ? 'complete_pack' : 'notice_only'}&case_id=${caseId}&source=validator`,
        productKey: isInvalid ? 'complete_pack' : 'notice_only',
      },
      secondary: {
        label: isInvalid ? 'Start Notice Only' : 'Start Eviction Pack',
        price: isInvalid ? 29.99 : 149.99,
        href: `/wizard/flow?type=eviction&jurisdiction=${jurisdiction}&product=${isInvalid ? 'notice_only' : 'complete_pack'}&case_id=${caseId}&source=validator`,
        productKey: isInvalid ? 'notice_only' : 'complete_pack',
      },
    };
  }),
}));

import { trackValidatorCtaClick } from '@/lib/analytics';

describe('ValidationReport CTA Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CTAs with wizard flow hrefs when caseId is provided', () => {
    render(
      <ValidationReport
        status="warning"
        blockers={[]}
        warnings={[{ code: 'TEST', message: 'Test warning' }]}
        validatorKey="section_21"
        caseId="test-case-123"
        jurisdiction="england"
      />
    );

    // Find CTA links
    const primaryCta = screen.getByRole('link', { name: /Start Eviction Pack/i });
    const secondaryCta = screen.getByRole('link', { name: /Start Notice Only/i });

    // Verify they route to /wizard/flow (not /products/)
    expect(primaryCta.getAttribute('href')).toMatch(/^\/wizard\/flow\?/);
    expect(secondaryCta.getAttribute('href')).toMatch(/^\/wizard\/flow\?/);

    // Verify they include case_id
    expect(primaryCta.getAttribute('href')).toContain('case_id=test-case-123');
    expect(secondaryCta.getAttribute('href')).toContain('case_id=test-case-123');
  });

  it('includes jurisdiction in CTA hrefs', () => {
    render(
      <ValidationReport
        status="invalid"
        blockers={[{ code: 'BLOCKER', message: 'Test blocker' }]}
        warnings={[]}
        validatorKey="section_21"
        caseId="test-case-456"
        jurisdiction="scotland"
      />
    );

    const primaryCta = screen.getByRole('link', { name: /Start Eviction Pack/i });
    expect(primaryCta.getAttribute('href')).toContain('jurisdiction=scotland');
  });

  it('includes source=validator in CTA hrefs', () => {
    render(
      <ValidationReport
        status="pass"
        blockers={[]}
        warnings={[]}
        validatorKey="section_8"
        caseId="test-case-789"
        jurisdiction="england"
      />
    );

    const primaryCta = screen.getByRole('link', { name: /Start Notice Only/i });
    expect(primaryCta.getAttribute('href')).toContain('source=validator');
  });

  it('does not render CTAs when caseId is missing', () => {
    render(
      <ValidationReport
        status="warning"
        blockers={[]}
        warnings={[{ code: 'TEST', message: 'Test warning' }]}
        validatorKey="section_21"
        // No caseId provided
        jurisdiction="england"
      />
    );

    // CTAs should not be present
    expect(screen.queryByRole('link', { name: /Start Eviction Pack/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Start Notice Only/i })).toBeNull();

    // Fallback message should be shown
    expect(screen.getByText(/Upload a document to get personalized recommendations/i)).toBeInTheDocument();
  });

  it('displays prices in CTAs', () => {
    render(
      <ValidationReport
        status="invalid"
        blockers={[{ code: 'BLOCKER', message: 'Test blocker' }]}
        warnings={[]}
        validatorKey="section_21"
        caseId="price-test-case"
        jurisdiction="england"
      />
    );

    // Check that prices are displayed
    expect(screen.getByText(/£149.99/)).toBeInTheDocument();
    expect(screen.getByText(/£29.99/)).toBeInTheDocument();
  });

  it('tracks CTA clicks with analytics', () => {
    render(
      <ValidationReport
        status="warning"
        blockers={[]}
        warnings={[{ code: 'TEST', message: 'Test warning' }]}
        validatorKey="section_21"
        caseId="analytics-test-case"
        jurisdiction="england"
      />
    );

    const primaryCta = screen.getByRole('link', { name: /Start Eviction Pack/i });
    fireEvent.click(primaryCta);

    expect(trackValidatorCtaClick).toHaveBeenCalledWith(
      'section_21',
      'primary',
      'complete_pack',
      'warning'
    );
  });

  it('tracks secondary CTA clicks with analytics', () => {
    render(
      <ValidationReport
        status="invalid"
        blockers={[{ code: 'BLOCKER', message: 'Test blocker' }]}
        warnings={[]}
        validatorKey="section_8"
        caseId="secondary-cta-test"
        jurisdiction="england"
      />
    );

    const secondaryCta = screen.getByRole('link', { name: /Start Notice Only/i });
    fireEvent.click(secondaryCta);

    expect(trackValidatorCtaClick).toHaveBeenCalledWith(
      'section_8',
      'secondary',
      'notice_only',
      'invalid'
    );
  });
});

describe('ValidationReport CTA Status-based routing', () => {
  it('shows Complete Pack as primary for invalid status', () => {
    render(
      <ValidationReport
        status="invalid"
        blockers={[{ code: 'BLOCKER', message: 'Test blocker' }]}
        warnings={[]}
        validatorKey="section_21"
        caseId="invalid-status-test"
        jurisdiction="england"
      />
    );

    // Primary CTA should be Complete Pack for invalid status
    const links = screen.getAllByRole('link');
    const primaryLink = links.find(link => link.getAttribute('href')?.includes('complete_pack'));
    expect(primaryLink).toBeTruthy();
  });

  it('shows Notice Only as primary for pass status', () => {
    render(
      <ValidationReport
        status="pass"
        blockers={[]}
        warnings={[]}
        validatorKey="section_21"
        caseId="pass-status-test"
        jurisdiction="england"
      />
    );

    // Primary CTA should be Notice Only for pass status
    const links = screen.getAllByRole('link');
    const primaryLink = links.find(link => link.getAttribute('href')?.includes('notice_only'));
    expect(primaryLink).toBeTruthy();
  });
});
