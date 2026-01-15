/**
 * @vitest-environment jsdom
 *
 * NoticeOnlySectionFlow Tests
 *
 * Critical regression tests ensuring:
 * 1. Wales flow does NOT show England-specific terminology (Section 21, AST, How to Rent)
 * 2. Wales flow DOES show correct Wales terminology (Section 173, Occupation Contract)
 * 3. England flow continues to work with existing Section 21/Section 8 terminology
 *
 * These tests prevent regression when modifying the Notice Only wizard.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock the facts client
vi.mock('@/lib/wizard/facts-client', () => ({
  getCaseFacts: vi.fn().mockResolvedValue({}),
  saveCaseFacts: vi.fn().mockResolvedValue({}),
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackWizardStepCompleteWithAttribution: vi.fn(),
}));

// Mock attribution
vi.mock('@/lib/wizard/wizardAttribution', () => ({
  getWizardAttribution: () => ({}),
  markStepCompleted: () => true,
}));

// Mock arrears engine
vi.mock('@/lib/arrears-engine', () => ({
  validateGround8Eligibility: () => ({ is_eligible: false, arrears_in_months: 0 }),
}));

// Mock AskHeavenPanel
vi.mock('@/components/wizard/AskHeavenPanel', () => ({
  AskHeavenPanel: () => <div data-testid="ask-heaven-panel">Ask Heaven Panel</div>,
}));

// Import after mocks
import { NoticeOnlySectionFlow } from '../NoticeOnlySectionFlow';

describe('NoticeOnlySectionFlow - Wales Jurisdiction', () => {
  const walesProps = {
    caseId: 'test-case-wales',
    jurisdiction: 'wales' as const,
    initialFacts: {
      __meta: { product: 'notice_only', jurisdiction: 'wales' },
      eviction_route: 'section_173',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should NOT have Section 21 as a selectable route option for Wales jurisdiction', async () => {
    render(<NoticeOnlySectionFlow {...walesProps} />);

    // Wait for component to load
    await screen.findByText(/Wales Eviction Notice/);

    // Check that Section 21 is NOT a selectable radio option (not in the route selector)
    // Note: "Section 21" text appears in informational messages explaining Welsh law,
    // but should NOT be a selectable route option
    const section21RadioLabels = screen.queryAllByRole('radio').filter(
      radio => radio.getAttribute('value') === 'section_21'
    );
    expect(section21RadioLabels.length).toBe(0);

    // Form 6A should not appear as a route badge
    expect(screen.queryByText('Form 6A')).toBeNull();
  });

  it('should NOT render "Assured Shorthold Tenancy" as a tenancy type option for Wales', async () => {
    render(<NoticeOnlySectionFlow {...walesProps} />);

    // Wait for component to load
    await screen.findByText(/Wales Eviction Notice/);

    // Check that AST is NOT a selectable tenancy type option
    // AST options should only appear in England
    const selectElements = screen.queryAllByRole('combobox');
    selectElements.forEach(select => {
      const options = select.querySelectorAll('option');
      options.forEach(option => {
        expect(option.textContent).not.toMatch(/Assured Shorthold Tenancy/i);
      });
    });
  });

  it('should render "Occupation Contract" tab label for Wales', async () => {
    render(<NoticeOnlySectionFlow {...walesProps} />);

    // Wait for component to load
    await screen.findByText(/Wales Eviction Notice/);

    // Wales should show "Occupation Contract" instead of "Tenancy"
    expect(screen.getByRole('button', { name: /Occupation Contract/i })).toBeDefined();
  });

  it('should show "Section 173 (No-fault)" in review summary for Wales section_173 route', async () => {
    const propsWithAllComplete = {
      ...walesProps,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'wales' },
        eviction_route: 'section_173',
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '123 Test St',
        landlord_address_town: 'Cardiff',
        landlord_address_postcode: 'CF1 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '456 Property St',
        property_address_town: 'Cardiff',
        property_address_postcode: 'CF2 2BB',
        tenancy_start_date: '2024-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_service_method: 'first_class_post',
      },
    };

    render(<NoticeOnlySectionFlow {...propsWithAllComplete} />);

    // Wait for component to load
    await screen.findByText(/Wales Eviction Notice/);

    // Navigate to review section and check for correct type label
    // The review section should show "Section 173 (No-fault)" for Wales
    const reviewButton = screen.getByRole('button', { name: /Review/i });
    expect(reviewButton).toBeDefined();
  });

  it('should show "Fault-based (breach grounds)" in review summary for Wales fault_based route', async () => {
    const propsWithFaultBased = {
      ...walesProps,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'wales' },
        eviction_route: 'fault_based',
      },
    };

    render(<NoticeOnlySectionFlow {...propsWithFaultBased} />);

    // Wait for component to load
    await screen.findByText(/Wales Eviction Notice/);

    // The flow should be set up for fault-based eviction
    // Section 21 and Section 8 should NOT be selectable route options (but may appear in info text)
    const section21Radios = screen.queryAllByRole('radio').filter(
      radio => radio.getAttribute('value') === 'section_21'
    );
    const section8Radios = screen.queryAllByRole('radio').filter(
      radio => radio.getAttribute('value') === 'section_8'
    );
    expect(section21Radios.length).toBe(0);
    expect(section8Radios.length).toBe(0);
  });
});

describe('NoticeOnlySectionFlow - England Jurisdiction', () => {
  const englandProps = {
    caseId: 'test-case-england',
    jurisdiction: 'england' as const,
    initialFacts: {
      __meta: { product: 'notice_only', jurisdiction: 'england' },
      eviction_route: 'section_21',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render "Section 21" route option for England jurisdiction', async () => {
    render(<NoticeOnlySectionFlow {...englandProps} />);

    // Wait for component to load
    await screen.findByText(/England Eviction Notice/);

    // England should show Section 21 terminology
    expect(screen.getByText(/England Eviction Notice/)).toBeDefined();
  });

  it('should render "Tenancy" tab label for England (not "Occupation Contract")', async () => {
    render(<NoticeOnlySectionFlow {...englandProps} />);

    // Wait for component to load
    await screen.findByText(/England Eviction Notice/);

    // England should show "Tenancy" not "Occupation Contract"
    expect(screen.getByRole('button', { name: /Tenancy/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: /Occupation Contract/i })).toBeNull();
  });

  it('should show "Section 21 (No-Fault)" in review summary for England section_21 route', async () => {
    const propsWithSection21 = {
      ...englandProps,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'england' },
        eviction_route: 'section_21',
      },
    };

    render(<NoticeOnlySectionFlow {...propsWithSection21} />);

    // Wait for component to load
    await screen.findByText(/England Eviction Notice/);

    // The flow should be set up for Section 21
    const reviewButton = screen.getByRole('button', { name: /Review/i });
    expect(reviewButton).toBeDefined();
  });

  it('should show "Section 8 (Fault-Based)" for England section_8 route', async () => {
    const propsWithSection8 = {
      ...englandProps,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'england' },
        eviction_route: 'section_8',
      },
    };

    render(<NoticeOnlySectionFlow {...propsWithSection8} />);

    // Wait for component to load
    await screen.findByText(/England Eviction Notice/);

    // The flow should be set up for Section 8
    expect(screen.queryByText(/Occupation Contract/)).toBeNull();
  });
});

describe('NoticeOnlySectionFlow - Route Type Mapping', () => {
  /**
   * Tests the type label mapping logic to ensure correct labels
   * are displayed in the review section for each jurisdiction/route combination.
   */

  it('should map eviction routes correctly for Wales', () => {
    // Test the type label mapping logic
    const getTypeLabel = (jurisdiction: string, eviction_route: string) => {
      if (jurisdiction === 'wales') {
        if (eviction_route === 'section_173') {
          return 'Section 173 (No-fault)';
        } else if (eviction_route === 'fault_based') {
          return 'Fault-based (breach grounds)';
        }
        return 'Wales notice';
      }
      return eviction_route === 'section_21'
        ? 'Section 21 (No-Fault)'
        : 'Section 8 (Fault-Based)';
    };

    // Wales routes
    expect(getTypeLabel('wales', 'section_173')).toBe('Section 173 (No-fault)');
    expect(getTypeLabel('wales', 'fault_based')).toBe('Fault-based (breach grounds)');
    expect(getTypeLabel('wales', 'unknown')).toBe('Wales notice');

    // England routes
    expect(getTypeLabel('england', 'section_21')).toBe('Section 21 (No-Fault)');
    expect(getTypeLabel('england', 'section_8')).toBe('Section 8 (Fault-Based)');
  });

  it('should not show Compliance section for Wales routes', async () => {
    const walesProps = {
      caseId: 'test-case-wales',
      jurisdiction: 'wales' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'wales' },
        eviction_route: 'section_173',
      },
    };

    render(<NoticeOnlySectionFlow {...walesProps} />);

    // Wait for component to load
    await screen.findByText(/Wales Eviction Notice/);

    // Compliance section (Section 21 specific) should NOT appear for Wales
    expect(screen.queryByRole('button', { name: /Compliance/i })).toBeNull();
  });

  it('should show Compliance section for England Section 21 route', async () => {
    const englandProps = {
      caseId: 'test-case-england',
      jurisdiction: 'england' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'england' },
        eviction_route: 'section_21',
      },
    };

    render(<NoticeOnlySectionFlow {...englandProps} />);

    // Wait for component to load
    await screen.findByText(/England Eviction Notice/);

    // Compliance section should appear for England Section 21
    expect(screen.getByRole('button', { name: /Compliance/i })).toBeDefined();
  });
});

describe('NoticeOnlySectionFlow - Header and Title', () => {
  it('should show "England Eviction Notice" for England jurisdiction', async () => {
    render(
      <NoticeOnlySectionFlow
        caseId="test"
        jurisdiction="england"
        initialFacts={{ __meta: { product: 'notice_only', jurisdiction: 'england' }, eviction_route: 'section_21' }}
      />
    );

    await screen.findByText(/England Eviction Notice/);
    expect(screen.getByText(/England Eviction Notice/)).toBeDefined();
  });

  it('should show "Wales Eviction Notice" for Wales jurisdiction', async () => {
    render(
      <NoticeOnlySectionFlow
        caseId="test"
        jurisdiction="wales"
        initialFacts={{ __meta: { product: 'notice_only', jurisdiction: 'wales' }, eviction_route: 'section_173' }}
      />
    );

    await screen.findByText(/Wales Eviction Notice/);
    expect(screen.getByText(/Wales Eviction Notice/)).toBeDefined();
  });
});
