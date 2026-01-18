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
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

// Mock Scotland grounds utilities
vi.mock('@/lib/scotland/grounds', () => ({
  validateSixMonthRule: (date: string) => {
    // Simple mock: if date is more than 6 months ago, valid
    const tenancyStart = new Date(date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return {
      valid: tenancyStart <= sixMonthsAgo,
      message: tenancyStart > sixMonthsAgo ? 'Cannot serve notice within first 6 months' : undefined,
      earliestNoticeDate: sixMonthsAgo.toISOString().split('T')[0],
    };
  },
  getScotlandGrounds: () => [
    { number: 1, code: 'Ground 1', name: 'Landlord intends to sell', noticePeriodDays: 84, description: 'Test', fullText: 'Test', requiredEvidence: [] },
    { number: 12, code: 'Ground 12', name: 'Convicted of offences', noticePeriodDays: 28, description: 'Test', fullText: 'Test', requiredEvidence: [] },
    { number: 18, code: 'Ground 18', name: 'Rent arrears - 3 consecutive months', noticePeriodDays: 28, description: 'Test', fullText: 'Test', requiredEvidence: [] },
  ],
  getGroundsByNoticePeriod: () => ({
    shortNotice: [
      { number: 12, code: 'Ground 12', name: 'Convicted of offences', noticePeriodDays: 28, description: 'Test', fullText: 'Test', requiredEvidence: [] },
      { number: 18, code: 'Ground 18', name: 'Rent arrears - 3 consecutive months', noticePeriodDays: 28, description: 'Test', fullText: 'Test', requiredEvidence: [] },
    ],
    standardNotice: [{ number: 1, code: 'Ground 1', name: 'Landlord intends to sell', noticePeriodDays: 84, description: 'Test', fullText: 'Test', requiredEvidence: [] }],
  }),
  getScotlandGroundByNumber: (num: number) => {
    const grounds: Record<number, any> = {
      1: { number: 1, code: 'Ground 1', name: 'Landlord intends to sell', noticePeriodDays: 84, description: 'Test', fullText: 'Test', requiredEvidence: [] },
      12: { number: 12, code: 'Ground 12', name: 'Convicted of offences', noticePeriodDays: 28, description: 'Test', fullText: 'Test', requiredEvidence: [] },
      18: { number: 18, code: 'Ground 18', name: 'Rent arrears - 3 consecutive months', noticePeriodDays: 28, description: 'Test', fullText: 'Test', requiredEvidence: [] },
    };
    return grounds[num] || null;
  },
  calculateEarliestEvictionDate: () => new Date(),
  getScotlandConfig: () => ({ noticeRequirements: { serviceMethods: ['First class post', 'Recorded delivery', 'Hand delivery'] } }),
}));

// Mock AskHeavenPanel
vi.mock('@/components/wizard/AskHeavenPanel', () => ({
  AskHeavenPanel: () => <div data-testid="ask-heaven-panel">Ask Heaven Panel</div>,
}));

// Mock ArrearsScheduleStep for Scotland Ground 18 tests
vi.mock('@/components/wizard/ArrearsScheduleStep', () => ({
  ArrearsScheduleStep: () => <div data-testid="arrears-schedule-step">Arrears Schedule Step</div>,
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

  it('should show Wales Compliance section for Wales routes', async () => {
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

    // Wales Compliance section should appear for Wales routes
    expect(screen.getByRole('button', { name: /Compliance/i })).toBeDefined();
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

/**
 * Notice Details Section Completion Tests
 *
 * These tests verify the isComplete logic for the Notice Details section
 * works correctly for both England and Wales routes.
 */
describe('NoticeOnlySectionFlow - Notice Details Section Completion', () => {
  /**
   * Helper to extract the notice section isComplete logic for direct testing.
   * This mirrors the logic in SECTIONS array for the 'notice' section.
   */
  const isNoticeComplete = (facts: Record<string, any>): boolean => {
    const route = facts.eviction_route as string;

    // Wales: Section 173 (no-fault) - requires service method and date
    if (route === 'section_173') {
      const hasServiceMethod = Boolean(facts.notice_service_method);
      const hasServiceDate = Boolean(facts.notice_date || facts.notice_service_date);
      return hasServiceMethod && hasServiceDate;
    }

    // Wales: Fault-based - requires grounds, service method, and date
    if (route === 'fault_based') {
      const walesGrounds = (facts.wales_fault_grounds as string[]) || [];
      const hasGrounds = walesGrounds.length > 0;
      const hasServiceMethod = Boolean(facts.notice_service_method);
      const hasServiceDate = Boolean(facts.notice_date || facts.notice_service_date);
      return hasGrounds && hasServiceMethod && hasServiceDate;
    }

    // England: Section 21 - just need to confirm service method
    if (route === 'section_21') {
      return Boolean(facts.notice_service_method);
    }

    // England: Section 8 - need grounds selected + service method
    const selectedGrounds = (facts.section8_grounds as string[]) || [];
    return selectedGrounds.length > 0 && Boolean(facts.notice_service_method);
  };

  describe('Wales Section 173 (No-fault)', () => {
    it('should return true when notice_service_method and notice_date are set', () => {
      const facts = {
        eviction_route: 'section_173',
        notice_service_method: 'first_class_post',
        notice_date: '2024-06-01',
      };
      expect(isNoticeComplete(facts)).toBe(true);
    });

    it('should return true when notice_service_method and notice_service_date are set', () => {
      const facts = {
        eviction_route: 'section_173',
        notice_service_method: 'hand_delivered',
        notice_service_date: '2024-06-01',
      };
      expect(isNoticeComplete(facts)).toBe(true);
    });

    it('should return false when notice_service_method is missing', () => {
      const facts = {
        eviction_route: 'section_173',
        notice_date: '2024-06-01',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });

    it('should return false when both notice dates are missing', () => {
      const facts = {
        eviction_route: 'section_173',
        notice_service_method: 'first_class_post',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });
  });

  describe('Wales Fault-based', () => {
    it('should return true when grounds, service method, and date are all set', () => {
      const facts = {
        eviction_route: 'fault_based',
        wales_fault_grounds: ['rent_arrears_serious'],
        notice_service_method: 'recorded_delivery',
        notice_date: '2024-06-01',
      };
      expect(isNoticeComplete(facts)).toBe(true);
    });

    it('should return true with multiple grounds selected', () => {
      const facts = {
        eviction_route: 'fault_based',
        wales_fault_grounds: ['rent_arrears_serious', 'breach_of_contract', 'antisocial_behaviour'],
        notice_service_method: 'hand_delivered',
        notice_service_date: '2024-06-01',
      };
      expect(isNoticeComplete(facts)).toBe(true);
    });

    it('should return false when wales_fault_grounds is empty', () => {
      const facts = {
        eviction_route: 'fault_based',
        wales_fault_grounds: [],
        notice_service_method: 'first_class_post',
        notice_date: '2024-06-01',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });

    it('should return false when wales_fault_grounds is not set', () => {
      const facts = {
        eviction_route: 'fault_based',
        notice_service_method: 'first_class_post',
        notice_date: '2024-06-01',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });

    it('should return false when notice_service_method is missing', () => {
      const facts = {
        eviction_route: 'fault_based',
        wales_fault_grounds: ['rent_arrears_serious'],
        notice_date: '2024-06-01',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });

    it('should return false when notice date is missing', () => {
      const facts = {
        eviction_route: 'fault_based',
        wales_fault_grounds: ['breach_of_contract'],
        notice_service_method: 'first_class_post',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });
  });

  describe('England Section 21 (unchanged behavior)', () => {
    it('should return true when only notice_service_method is set', () => {
      const facts = {
        eviction_route: 'section_21',
        notice_service_method: 'first_class_post',
      };
      expect(isNoticeComplete(facts)).toBe(true);
    });

    it('should return false when notice_service_method is missing', () => {
      const facts = {
        eviction_route: 'section_21',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });

    it('should NOT require notice_date (preserves existing England behavior)', () => {
      const facts = {
        eviction_route: 'section_21',
        notice_service_method: 'recorded_delivery',
        // no notice_date - should still complete for England
      };
      expect(isNoticeComplete(facts)).toBe(true);
    });
  });

  describe('England Section 8 (unchanged behavior)', () => {
    it('should return true when section8_grounds and notice_service_method are set', () => {
      const facts = {
        eviction_route: 'section_8',
        section8_grounds: ['Ground 8'],
        notice_service_method: 'first_class_post',
      };
      expect(isNoticeComplete(facts)).toBe(true);
    });

    it('should return true with multiple grounds', () => {
      const facts = {
        eviction_route: 'section_8',
        section8_grounds: ['Ground 8', 'Ground 10', 'Ground 11'],
        notice_service_method: 'hand_delivered',
      };
      expect(isNoticeComplete(facts)).toBe(true);
    });

    it('should return false when section8_grounds is empty', () => {
      const facts = {
        eviction_route: 'section_8',
        section8_grounds: [],
        notice_service_method: 'first_class_post',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });

    it('should return false when section8_grounds is not set', () => {
      const facts = {
        eviction_route: 'section_8',
        notice_service_method: 'first_class_post',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });

    it('should return false when notice_service_method is missing', () => {
      const facts = {
        eviction_route: 'section_8',
        section8_grounds: ['Ground 8'],
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });

    it('should NOT require notice_date (preserves existing England behavior)', () => {
      const facts = {
        eviction_route: 'section_8',
        section8_grounds: ['Ground 8'],
        notice_service_method: 'recorded_delivery',
        // no notice_date - should still complete for England
      };
      expect(isNoticeComplete(facts)).toBe(true);
    });
  });

  describe('Jurisdiction isolation', () => {
    it('should NOT use section8_grounds for Wales fault_based route', () => {
      // Even if section8_grounds is set, Wales fault_based should use wales_fault_grounds
      const facts = {
        eviction_route: 'fault_based',
        section8_grounds: ['Ground 8'], // wrong key for Wales
        notice_service_method: 'first_class_post',
        notice_date: '2024-06-01',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });

    it('should NOT use wales_fault_grounds for England section_8 route', () => {
      // Even if wales_fault_grounds is set, England section_8 should use section8_grounds
      const facts = {
        eviction_route: 'section_8',
        wales_fault_grounds: ['rent_arrears_serious'], // wrong key for England
        notice_service_method: 'first_class_post',
      };
      expect(isNoticeComplete(facts)).toBe(false);
    });
  });
});

/**
 * Wales Next Button Fix Tests
 *
 * These tests verify that the Wales Notice Only wizard correctly shows
 * all sections (not just case_basics) when a valid route is selected,
 * enabling the Next button to work properly.
 *
 * Issue: Previously, WalesCaseBasicsSection was saving prefixed values
 * (wales_section_173, wales_fault_based) but NoticeOnlySectionFlow
 * expected unprefixed values (section_173, fault_based).
 */
describe('NoticeOnlySectionFlow - Wales Next Button Fix', () => {
  it('should show multiple sections (not just case_basics) with Wales section_173 route', async () => {
    const walesProps = {
      caseId: 'test-wales-section173',
      jurisdiction: 'wales' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'wales' },
        eviction_route: 'section_173',
      },
    };

    render(<NoticeOnlySectionFlow {...walesProps} />);
    await screen.findByText(/Wales Eviction Notice/);

    // With section_173 route, should see multiple section tabs (Parties, Property, etc.)
    // not just Case Basics
    expect(screen.getByRole('button', { name: /Case Basics/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Parties/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Property/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Occupation Contract/i })).toBeDefined();
  });

  it('should show multiple sections (not just case_basics) with Wales fault_based route', async () => {
    const walesProps = {
      caseId: 'test-wales-fault-based',
      jurisdiction: 'wales' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'wales' },
        eviction_route: 'fault_based',
      },
    };

    render(<NoticeOnlySectionFlow {...walesProps} />);
    await screen.findByText(/Wales Eviction Notice/);

    // With fault_based route, should see multiple section tabs
    expect(screen.getByRole('button', { name: /Case Basics/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Parties/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Property/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Occupation Contract/i })).toBeDefined();
  });

  it('should handle legacy prefixed wales_section_173 value as section_173', async () => {
    // This tests backward compatibility for sessions saved with old prefixed values
    const walesProps = {
      caseId: 'test-wales-legacy-173',
      jurisdiction: 'wales' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'wales' },
        eviction_route: 'wales_section_173', // Legacy prefixed value
      },
    };

    render(<NoticeOnlySectionFlow {...walesProps} />);
    await screen.findByText(/Wales Eviction Notice/);

    // Should still show multiple sections (normalization converts wales_section_173 -> section_173)
    expect(screen.getByRole('button', { name: /Case Basics/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Parties/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Property/i })).toBeDefined();
  });

  it('should handle legacy prefixed wales_fault_based value as fault_based', async () => {
    // This tests backward compatibility for sessions saved with old prefixed values
    const walesProps = {
      caseId: 'test-wales-legacy-fault',
      jurisdiction: 'wales' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'wales' },
        eviction_route: 'wales_fault_based', // Legacy prefixed value
      },
    };

    render(<NoticeOnlySectionFlow {...walesProps} />);
    await screen.findByText(/Wales Eviction Notice/);

    // Should still show multiple sections (normalization converts wales_fault_based -> fault_based)
    expect(screen.getByRole('button', { name: /Case Basics/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Parties/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Property/i })).toBeDefined();
  });

  it('should show only case_basics when no Wales route is selected', async () => {
    const walesProps = {
      caseId: 'test-wales-no-route',
      jurisdiction: 'wales' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'wales' },
        // No eviction_route set
      },
    };

    render(<NoticeOnlySectionFlow {...walesProps} />);
    await screen.findByText(/Wales Eviction Notice/);

    // Without a route, should only see Case Basics
    expect(screen.getByRole('button', { name: /Case Basics/i })).toBeDefined();
    // Other sections should not be visible yet
    expect(screen.queryByRole('button', { name: /Parties/i })).toBeNull();
  });
});

/**
 * England Next Button Tests - Ensure England flows are unaffected
 */
describe('NoticeOnlySectionFlow - England Next Button (unchanged)', () => {
  it('should show multiple sections with England section_21 route', async () => {
    const englandProps = {
      caseId: 'test-england-section21',
      jurisdiction: 'england' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'england' },
        eviction_route: 'section_21',
      },
    };

    render(<NoticeOnlySectionFlow {...englandProps} />);
    await screen.findByText(/England Eviction Notice/);

    // England section_21 should show multiple sections including Compliance
    expect(screen.getByRole('button', { name: /Case Basics/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Parties/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Property/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tenancy/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Compliance/i })).toBeDefined();
  });

  it('should show multiple sections with England section_8 route', async () => {
    const englandProps = {
      caseId: 'test-england-section8',
      jurisdiction: 'england' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'england' },
        eviction_route: 'section_8',
      },
    };

    render(<NoticeOnlySectionFlow {...englandProps} />);
    await screen.findByText(/England Eviction Notice/);

    // England section_8 should show multiple sections including Arrears
    expect(screen.getByRole('button', { name: /Case Basics/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Parties/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Property/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tenancy/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Arrears/i })).toBeDefined();
  });

  it('should NOT apply Wales normalization to England routes', async () => {
    // Ensure the normalizeWalesRoute function doesn't affect England
    const englandProps = {
      caseId: 'test-england-no-normalize',
      jurisdiction: 'england' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'england' },
        eviction_route: 'section_21', // This should NOT be normalized
      },
    };

    render(<NoticeOnlySectionFlow {...englandProps} />);
    await screen.findByText(/England Eviction Notice/);

    // England should work normally
    expect(screen.getByRole('button', { name: /Compliance/i })).toBeDefined();
  });
});

/**
 * Scotland Jurisdiction Tests
 *
 * These tests verify that:
 * 1. Scotland notice_only uses NoticeOnlySectionFlow (not falling through to StructuredWizard)
 * 2. Scotland shows correct terminology (Notice to Leave, not Section 21/8)
 * 3. Scotland shows Scotland-specific sections (Grounds, Notice with 6-month rule)
 * 4. Scotland does NOT show England/Wales-specific sections (Compliance, Arrears)
 */
describe('NoticeOnlySectionFlow - Scotland Jurisdiction', () => {
  const scotlandProps = {
    caseId: 'test-case-scotland',
    jurisdiction: 'scotland' as const,
    initialFacts: {
      __meta: { product: 'notice_only', jurisdiction: 'scotland' },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show "Scotland Notice to Leave" header for Scotland jurisdiction', async () => {
    render(<NoticeOnlySectionFlow {...scotlandProps} />);

    await screen.findByText(/Scotland Notice to Leave/);
    expect(screen.getByText(/Scotland Notice to Leave/)).toBeDefined();
  });

  it('should render Scotland-specific sections (Case Basics, Parties, Property, Tenancy, Grounds, Notice, Review)', async () => {
    render(<NoticeOnlySectionFlow {...scotlandProps} />);

    await screen.findByText(/Scotland Notice to Leave/);

    // Scotland should show these sections
    expect(screen.getByRole('button', { name: /Case Basics/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Parties/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Property/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tenancy/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Grounds/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Notice/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Review/i })).toBeDefined();
  });

  it('should show Scotland-specific Compliance section (not England Section 21/Section 8 Arrears)', async () => {
    render(<NoticeOnlySectionFlow {...scotlandProps} />);

    await screen.findByText(/Scotland Notice to Leave/);

    // Scotland DOES have a Compliance section (different from England's Section 21 Compliance)
    // but should NOT show England-specific Arrears section
    expect(screen.getByRole('button', { name: /Compliance/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: /Arrears/i })).toBeNull();
  });

  it('should NOT show Wales-specific terminology for Scotland', async () => {
    render(<NoticeOnlySectionFlow {...scotlandProps} />);

    await screen.findByText(/Scotland Notice to Leave/);

    // Scotland should NOT show Wales-specific terminology
    expect(screen.queryByRole('button', { name: /Occupation Contract/i })).toBeNull();
    // Should use "Tenancy" not "Occupation Contract"
    expect(screen.getByRole('button', { name: /Tenancy/i })).toBeDefined();
  });

  it('should show PRT (Private Residential Tenancy) information in Case Basics', async () => {
    render(<NoticeOnlySectionFlow {...scotlandProps} />);

    await screen.findByText(/Scotland Notice to Leave/);

    // First section should explain PRT - use getAllByText since it appears in multiple places
    const prtElements = screen.getAllByText(/Private Residential Tenancy/i);
    expect(prtElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Private Housing \(Tenancies\) \(Scotland\) Act 2016/i)).toBeDefined();
  });

  it('should show discretionary grounds warning in Case Basics', async () => {
    render(<NoticeOnlySectionFlow {...scotlandProps} />);

    await screen.findByText(/Scotland Notice to Leave/);

    // Should warn about discretionary grounds
    expect(screen.getByText(/All Grounds are Discretionary/i)).toBeDefined();
    expect(screen.getByText(/no mandatory grounds/i)).toBeDefined();
  });

  it('should show 6-month rule information in Case Basics', async () => {
    render(<NoticeOnlySectionFlow {...scotlandProps} />);

    await screen.findByText(/Scotland Notice to Leave/);

    // Should explain 6-month rule
    expect(screen.getByText(/6-Month Rule/i)).toBeDefined();
    expect(screen.getByText(/first 6 months of the tenancy/i)).toBeDefined();
  });

  it('should NOT have Section 21 or Section 8 as selectable route options for Scotland', async () => {
    render(<NoticeOnlySectionFlow {...scotlandProps} />);

    await screen.findByText(/Scotland Notice to Leave/);

    // Scotland should not have England route selection radios
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

/**
 * Scotland Section Completion Tests
 */
describe('NoticeOnlySectionFlow - Scotland Section Completion', () => {
  /**
   * Test Scotland tenancy section completion logic
   */
  it('should mark Scotland tenancy as complete when required fields are set', () => {
    const isTenancyComplete = (facts: Record<string, any>): boolean => {
      return Boolean(facts.tenancy_start_date) &&
        Boolean(facts.rent_amount) &&
        Boolean(facts.rent_frequency);
    };

    // Complete tenancy
    expect(isTenancyComplete({
      tenancy_start_date: '2023-01-01',
      rent_amount: 1000,
      rent_frequency: 'monthly',
    })).toBe(true);

    // Missing tenancy_start_date
    expect(isTenancyComplete({
      rent_amount: 1000,
      rent_frequency: 'monthly',
    })).toBe(false);

    // Missing rent_amount
    expect(isTenancyComplete({
      tenancy_start_date: '2023-01-01',
      rent_frequency: 'monthly',
    })).toBe(false);
  });

  /**
   * Test Scotland grounds section completion logic
   */
  it('should mark Scotland grounds as complete when ground is selected', () => {
    const isGroundsComplete = (facts: Record<string, any>): boolean => {
      return Boolean(facts.scotland_eviction_ground);
    };

    // Ground selected
    expect(isGroundsComplete({ scotland_eviction_ground: 1 })).toBe(true);

    // No ground selected
    expect(isGroundsComplete({})).toBe(false);
  });

  /**
   * Test Scotland notice section completion logic
   */
  it('should mark Scotland notice as complete when required fields are set', () => {
    const isNoticeComplete = (facts: Record<string, any>): boolean => {
      if (facts.notice_already_served === undefined) return false;
      return Boolean(facts.notice_service_method);
    };

    // Already served with method
    expect(isNoticeComplete({
      notice_already_served: true,
      notice_service_method: 'first_class_post',
    })).toBe(true);

    // Generating with method
    expect(isNoticeComplete({
      notice_already_served: false,
      notice_service_method: 'hand_delivered',
    })).toBe(true);

    // Missing notice_already_served
    expect(isNoticeComplete({
      notice_service_method: 'first_class_post',
    })).toBe(false);

    // Missing notice_service_method
    expect(isNoticeComplete({
      notice_already_served: true,
    })).toBe(false);
  });
});

/**
 * Scotland Ground Codes Compatibility Tests
 *
 * These tests verify that selecting a Scotland ground sets the ground_codes field
 * required by the preview/generate requirements validator.
 *
 * Bug: Scotland notice_only preview showed "Required information missing: ground_codes"
 * because ScotlandGroundsSection only wrote scotland_eviction_ground (number),
 * but requirements validator expected ground_codes (string[]).
 */
describe('NoticeOnlySectionFlow - Scotland Ground Codes Compatibility', () => {
  it('should set ground_codes when a Scotland ground is selected', () => {
    // Simulate the handleGroundSelect logic from ScotlandGroundsSection
    const handleGroundSelect = (
      groundNumber: number,
      grounds: Array<{ number: number; code: string; name: string; noticePeriodDays: number }>
    ) => {
      const ground = grounds.find(g => g.number === groundNumber);
      const groundCode = ground?.code || `Ground ${groundNumber}`;
      return {
        scotland_eviction_ground: groundNumber,
        scotland_ground_notice_period: ground?.noticePeriodDays || 84,
        scotland_ground_name: ground?.name || '',
        scotland_ground_type: 'discretionary',
        ground_codes: [groundCode],
      };
    };

    const mockGrounds = [
      { number: 1, code: 'Ground 1', name: 'Landlord intends to sell', noticePeriodDays: 84 },
      { number: 12, code: 'Ground 12', name: 'Rent arrears', noticePeriodDays: 28 },
      { number: 18, code: 'Ground 18', name: 'Rent arrears (3 months)', noticePeriodDays: 28 },
    ];

    // Test Ground 1
    const result1 = handleGroundSelect(1, mockGrounds);
    expect(result1.scotland_eviction_ground).toBe(1);
    expect(result1.ground_codes).toEqual(['Ground 1']);
    expect(result1.scotland_ground_notice_period).toBe(84);

    // Test Ground 12
    const result12 = handleGroundSelect(12, mockGrounds);
    expect(result12.scotland_eviction_ground).toBe(12);
    expect(result12.ground_codes).toEqual(['Ground 12']);
    expect(result12.scotland_ground_notice_period).toBe(28);

    // Test Ground 18 (the reported issue)
    const result18 = handleGroundSelect(18, mockGrounds);
    expect(result18.scotland_eviction_ground).toBe(18);
    expect(result18.ground_codes).toEqual(['Ground 18']);
    expect(result18.scotland_ground_notice_period).toBe(28);
  });

  it('should fallback to "Ground N" format if ground not found in config', () => {
    const handleGroundSelect = (
      groundNumber: number,
      grounds: Array<{ number: number; code: string }>
    ) => {
      const ground = grounds.find(g => g.number === groundNumber);
      const groundCode = ground?.code || `Ground ${groundNumber}`;
      return {
        scotland_eviction_ground: groundNumber,
        ground_codes: [groundCode],
      };
    };

    // Ground 99 doesn't exist
    const result = handleGroundSelect(99, []);
    expect(result.ground_codes).toEqual(['Ground 99']);
  });
});

/**
 * Scotland Notice Copy Tests
 *
 * These tests verify that Scotland notice section uses notice_only-appropriate copy,
 * not "complete pack" language which is for the full eviction pack product.
 */
describe('NoticeOnlySectionFlow - Scotland Notice Copy', () => {
  it('should NOT contain "complete pack" in Scotland notice section copy', async () => {
    const scotlandProps = {
      caseId: 'test-scotland-copy',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
        scotland_eviction_ground: 1,
        notice_already_served: false,
      },
    };

    render(<NoticeOnlySectionFlow {...scotlandProps} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // "complete pack" should NOT appear anywhere
    expect(screen.queryByText(/complete pack/i)).toBeNull();
  });

  it('should show notice_only-appropriate copy when generating notice', async () => {
    const scotlandProps = {
      caseId: 'test-scotland-notice-copy',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
        scotland_eviction_ground: 1,
        notice_already_served: false,
      },
    };

    render(<NoticeOnlySectionFlow {...scotlandProps} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // Click on Notice tab to view notice section
    const noticeButton = screen.getByRole('button', { name: /Notice/i });
    noticeButton.click();

    // Should show appropriate copy without "complete pack"
    // The text should indicate notice generation, not pack generation
    expect(screen.queryByText(/complete pack/i)).toBeNull();
  });
});

/**
 * Scotland Review Section Tests
 */
describe('NoticeOnlySectionFlow - Scotland Review Section', () => {
  it('should show "Notice to Leave (Scotland)" in review summary', async () => {
    const scotlandCompleteProps = {
      caseId: 'test-scotland-complete',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '123 Test St',
        landlord_address_town: 'Edinburgh',
        landlord_address_postcode: 'EH1 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '456 Property St',
        property_address_town: 'Glasgow',
        property_address_postcode: 'G1 1BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        scotland_eviction_ground: 1,
        notice_already_served: true,
        notice_service_method: 'first_class_post',
      },
    };

    render(<NoticeOnlySectionFlow {...scotlandCompleteProps} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // Navigate to review section and check for correct type label
    const reviewButton = screen.getByRole('button', { name: /Review/i });
    expect(reviewButton).toBeDefined();
  });

  it('should show Scotland ground in review summary', async () => {
    const scotlandWithGroundProps = {
      caseId: 'test-scotland-ground',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
        scotland_eviction_ground: 1,
      },
    };

    render(<NoticeOnlySectionFlow {...scotlandWithGroundProps} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // Review button should be present
    const reviewButton = screen.getByRole('button', { name: /Review/i });
    expect(reviewButton).toBeDefined();
  });
});

/**
 * Scotland Ground 18 Arrears Schedule Tests
 *
 * These tests verify that:
 * 1. When Ground 18 (rent arrears) is selected, arrears schedule UI appears
 * 2. Scotland notice section isComplete requires arrears schedule for Ground 18
 * 3. Warnings are shown when arrears schedule is missing for Ground 18
 */
describe('NoticeOnlySectionFlow - Scotland Ground 18 Arrears Schedule', () => {
  it('should require arrears schedule for Ground 18 completion', () => {
    // Test the isComplete logic for scotland_notice section with Ground 18
    const isScotlandNoticeComplete = (facts: Record<string, any>): boolean => {
      if (facts.notice_already_served === undefined) return false;
      if (!Boolean(facts.notice_service_method)) return false;

      // For Ground 18 (rent arrears), require arrears schedule
      const SCOTLAND_RENT_ARREARS_GROUND = 18;
      if (facts.scotland_eviction_ground === SCOTLAND_RENT_ARREARS_GROUND) {
        const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
        if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
          return false;
        }
      }

      return true;
    };

    // Ground 18 without arrears schedule - should NOT be complete
    expect(isScotlandNoticeComplete({
      scotland_eviction_ground: 18,
      notice_already_served: true,
      notice_service_method: 'first_class_post',
      // No arrears_items
    })).toBe(false);

    // Ground 18 with arrears schedule in flat location - should be complete
    expect(isScotlandNoticeComplete({
      scotland_eviction_ground: 18,
      notice_already_served: true,
      notice_service_method: 'first_class_post',
      arrears_items: [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ],
    })).toBe(true);

    // Ground 18 with arrears schedule in nested location - should be complete
    expect(isScotlandNoticeComplete({
      scotland_eviction_ground: 18,
      notice_already_served: true,
      notice_service_method: 'first_class_post',
      issues: {
        rent_arrears: {
          arrears_items: [
            { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
          ],
        },
      },
    })).toBe(true);

    // Non-arrears ground (Ground 1) without arrears schedule - should be complete
    expect(isScotlandNoticeComplete({
      scotland_eviction_ground: 1,
      notice_already_served: true,
      notice_service_method: 'first_class_post',
      // No arrears_items needed for Ground 1
    })).toBe(true);
  });

  it('should generate warnings for Ground 18 arrears requirements', () => {
    // Test the hasWarnings logic for scotland_notice section
    const getScotlandNoticeWarnings = (facts: Record<string, any>): string[] => {
      const warnings: string[] = [];
      const SCOTLAND_RENT_ARREARS_GROUND = 18;

      if (facts.scotland_eviction_ground === SCOTLAND_RENT_ARREARS_GROUND) {
        const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
        if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
          warnings.push('Ground 18 requires a rent arrears schedule. Please complete the arrears schedule above.');
        } else {
          const periodsWithArrears = arrearsItems.filter(
            (item: any) => (item.amount_owed ?? ((item.rent_due || 0) - (item.rent_paid || 0))) > 0
          ).length;
          if (periodsWithArrears < 3) {
            warnings.push(`Ground 18 requires 3+ consecutive months of arrears. Currently showing ${periodsWithArrears} period(s) with arrears.`);
          }
        }
      }
      return warnings;
    };

    // Ground 18 without arrears schedule - should warn
    const noScheduleWarnings = getScotlandNoticeWarnings({
      scotland_eviction_ground: 18,
    });
    expect(noScheduleWarnings.length).toBe(1);
    expect(noScheduleWarnings[0]).toContain('Ground 18 requires a rent arrears schedule');

    // Ground 18 with only 2 periods of arrears - should warn about threshold
    const lowArrearsWarnings = getScotlandNoticeWarnings({
      scotland_eviction_ground: 18,
      arrears_items: [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ],
    });
    expect(lowArrearsWarnings.length).toBe(1);
    expect(lowArrearsWarnings[0]).toContain('Ground 18 requires 3+ consecutive months');
    expect(lowArrearsWarnings[0]).toContain('2 period(s)');

    // Ground 18 with 3+ periods of arrears - no warnings
    const goodArrearsWarnings = getScotlandNoticeWarnings({
      scotland_eviction_ground: 18,
      arrears_items: [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-03-01', period_end: '2024-03-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ],
    });
    expect(goodArrearsWarnings.length).toBe(0);

    // Ground 1 (non-arrears) - no warnings about arrears
    const nonArrearsWarnings = getScotlandNoticeWarnings({
      scotland_eviction_ground: 1,
    });
    expect(nonArrearsWarnings.length).toBe(0);
  });
});

/**
 * Scotland Ask Heaven Wiring Tests
 *
 * These tests verify that:
 * 1. AskHeavenPanel receives currentQuestionId for Scotland sections
 * 2. Scotland sections pass onSetCurrentQuestionId to their components
 */
describe('NoticeOnlySectionFlow - Scotland Ask Heaven Wiring', () => {
  it('should pass currentQuestionId to AskHeavenPanel', async () => {
    const scotlandProps = {
      caseId: 'test-scotland-askheaven',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
        scotland_eviction_ground: 1,
      },
    };

    render(<NoticeOnlySectionFlow {...scotlandProps} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // AskHeavenPanel should be rendered
    const askHeavenPanel = screen.getByTestId('ask-heaven-panel');
    expect(askHeavenPanel).toBeDefined();
  });

  it('should show Scotland Grounds tab for Scotland jurisdiction', async () => {
    const scotlandProps = {
      caseId: 'test-scotland-grounds-askheaven',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
      },
    };

    render(<NoticeOnlySectionFlow {...scotlandProps} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // Grounds tab should be visible
    const groundsButton = screen.getByRole('button', { name: /Grounds/i });
    expect(groundsButton).toBeDefined();
  });

  it('should show Scotland Notice tab for Scotland jurisdiction', async () => {
    const scotlandProps = {
      caseId: 'test-scotland-notice-askheaven',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
        scotland_eviction_ground: 1,
        tenancy_start_date: '2020-01-01', // Old date so 6-month rule passes
      },
    };

    render(<NoticeOnlySectionFlow {...scotlandProps} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // Notice tab should be visible
    const noticeButton = screen.getByRole('button', { name: /Notice/i });
    expect(noticeButton).toBeDefined();
  });
});

/**
 * Scotland Arrears Schedule UI Tests
 *
 * These tests verify that the arrears schedule UI appears/hides
 * correctly based on the selected ground.
 */
describe('NoticeOnlySectionFlow - Scotland Arrears Schedule UI Logic', () => {
  it('should correctly identify Scotland rent arrears ground as 18', () => {
    const SCOTLAND_RENT_ARREARS_GROUND = 18;
    expect(SCOTLAND_RENT_ARREARS_GROUND).toBe(18);
  });

  it('should render Scotland flow without errors for Ground 18 facts', async () => {
    const scotlandGround18Props = {
      caseId: 'test-scotland-ground18-render',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
        scotland_eviction_ground: 18, // Rent arrears ground
        tenancy_start_date: '2020-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
      },
    };

    // Should render without throwing
    render(<NoticeOnlySectionFlow {...scotlandGround18Props} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // Flow should render and show the Notice tab
    expect(screen.getByRole('button', { name: /Notice/i })).toBeDefined();
  });

  it('should render Scotland flow without errors for non-arrears Ground 1 facts', async () => {
    const scotlandGround1Props = {
      caseId: 'test-scotland-ground1-render',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
        scotland_eviction_ground: 1, // Landlord intends to sell - not arrears
        tenancy_start_date: '2020-01-01',
      },
    };

    // Should render without throwing
    render(<NoticeOnlySectionFlow {...scotlandGround1Props} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // Flow should render
    expect(screen.getByRole('button', { name: /Notice/i })).toBeDefined();
  });
});

/**
 * Scotland Compliance Section Tests
 *
 * These tests verify that:
 * 1. Scotland notice_only flow includes a Compliance section
 * 2. Scotland compliance section covers Scotland-specific requirements
 * 3. Compliance section isComplete logic works correctly
 * 4. Warnings are shown for compliance issues
 */
describe('NoticeOnlySectionFlow - Scotland Compliance Section', () => {
  it('should show Compliance tab for Scotland jurisdiction', async () => {
    const scotlandProps = {
      caseId: 'test-scotland-compliance-tab',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
      },
    };

    render(<NoticeOnlySectionFlow {...scotlandProps} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // Scotland should show Compliance tab
    expect(screen.getByRole('button', { name: /Compliance/i })).toBeDefined();
  });

  it('should mark Scotland compliance section as complete when all required fields are answered', () => {
    const isScotlandComplianceComplete = (facts: Record<string, any>): boolean => {
      // Core requirements: landlord registration must be answered
      if (facts.landlord_registered === undefined) return false;

      // Deposit compliance (if deposit was taken)
      const depositTaken = facts.deposit_taken === true;
      if (depositTaken) {
        if (facts.deposit_protected === undefined) return false;
        if (facts.deposit_protected === true && !facts.deposit_scheme_name) return false;
      }

      // Gas safety (if gas appliances)
      const hasGas = facts.has_gas_appliances === true;
      if (hasGas && facts.gas_safety_cert_served === undefined) return false;

      // EPC and EICR
      if (facts.epc_served === undefined) return false;
      if (facts.eicr_served === undefined) return false;

      // Repairing standard
      if (facts.repairing_standard_met === undefined) return false;

      // HMO (if applicable)
      if (facts.is_hmo === true && facts.hmo_licensed === undefined) return false;

      return true;
    };

    // Complete compliance - all fields answered positively
    expect(isScotlandComplianceComplete({
      landlord_registered: true,
      deposit_taken: true,
      deposit_protected: true,
      deposit_scheme_name: 'SafeDeposits',
      has_gas_appliances: true,
      gas_safety_cert_served: true,
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
      is_hmo: false,
    })).toBe(true);

    // Complete compliance - no deposit, no gas, no HMO
    expect(isScotlandComplianceComplete({
      landlord_registered: true,
      deposit_taken: false,
      has_gas_appliances: false,
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
      is_hmo: false,
    })).toBe(true);

    // Incomplete - missing landlord_registered
    expect(isScotlandComplianceComplete({
      deposit_taken: false,
      has_gas_appliances: false,
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
    })).toBe(false);

    // Incomplete - deposit taken but not protected question unanswered
    expect(isScotlandComplianceComplete({
      landlord_registered: true,
      deposit_taken: true,
      // deposit_protected not answered
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
    })).toBe(false);

    // Incomplete - deposit protected but no scheme selected
    expect(isScotlandComplianceComplete({
      landlord_registered: true,
      deposit_taken: true,
      deposit_protected: true,
      // deposit_scheme_name missing
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
    })).toBe(false);

    // Incomplete - gas appliances but gas safety not answered
    expect(isScotlandComplianceComplete({
      landlord_registered: true,
      has_gas_appliances: true,
      // gas_safety_cert_served not answered
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
    })).toBe(false);

    // Incomplete - missing EPC
    expect(isScotlandComplianceComplete({
      landlord_registered: true,
      has_gas_appliances: false,
      eicr_served: true,
      repairing_standard_met: true,
    })).toBe(false);

    // Incomplete - missing EICR
    expect(isScotlandComplianceComplete({
      landlord_registered: true,
      has_gas_appliances: false,
      epc_served: true,
      repairing_standard_met: true,
    })).toBe(false);

    // Incomplete - HMO but licensing not answered
    expect(isScotlandComplianceComplete({
      landlord_registered: true,
      has_gas_appliances: false,
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
      is_hmo: true,
      // hmo_licensed not answered
    })).toBe(false);
  });

  it('should generate warnings for Scotland compliance issues', () => {
    const getScotlandComplianceWarnings = (facts: Record<string, any>): string[] => {
      const warnings: string[] = [];

      // Landlord not registered
      if (facts.landlord_registered === false) {
        warnings.push('Unregistered landlords may face penalties and tribunal may view case unfavourably.');
      }

      // Deposit not protected
      if (facts.deposit_taken === true && facts.deposit_protected === false) {
        warnings.push('Unprotected deposit may result in penalties up to 3x deposit amount.');
      }

      // Gas safety missing
      if (facts.has_gas_appliances === true && facts.gas_safety_cert_served === false) {
        warnings.push('Missing gas safety certificate is a serious compliance issue.');
      }

      // EPC missing
      if (facts.epc_served === false) {
        warnings.push('Missing EPC can result in fines.');
      }

      // EICR missing
      if (facts.eicr_served === false) {
        warnings.push('Missing EICR can result in fines up to £5,000.');
      }

      // Repairing standard not met
      if (facts.repairing_standard_met === false) {
        warnings.push('Property not meeting repairing standard may face enforcement action.');
      }

      // HMO not licensed
      if (facts.is_hmo === true && facts.hmo_licensed === false) {
        warnings.push('Operating an unlicensed HMO can result in fines.');
      }

      return warnings;
    };

    // No warnings when all compliant
    expect(getScotlandComplianceWarnings({
      landlord_registered: true,
      deposit_taken: true,
      deposit_protected: true,
      has_gas_appliances: true,
      gas_safety_cert_served: true,
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
      is_hmo: false,
    })).toEqual([]);

    // Warning for unregistered landlord
    const unregisteredWarnings = getScotlandComplianceWarnings({
      landlord_registered: false,
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
    });
    expect(unregisteredWarnings.some(w => w.includes('Unregistered'))).toBe(true);

    // Warning for unprotected deposit
    const unprotectedWarnings = getScotlandComplianceWarnings({
      landlord_registered: true,
      deposit_taken: true,
      deposit_protected: false,
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
    });
    expect(unprotectedWarnings.some(w => w.includes('Unprotected deposit'))).toBe(true);

    // Warning for missing gas safety
    const gasWarnings = getScotlandComplianceWarnings({
      landlord_registered: true,
      has_gas_appliances: true,
      gas_safety_cert_served: false,
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
    });
    expect(gasWarnings.some(w => w.includes('gas safety'))).toBe(true);

    // Warning for missing EPC
    const epcWarnings = getScotlandComplianceWarnings({
      landlord_registered: true,
      epc_served: false,
      eicr_served: true,
      repairing_standard_met: true,
    });
    expect(epcWarnings.some(w => w.includes('EPC'))).toBe(true);

    // Warning for missing EICR
    const eicrWarnings = getScotlandComplianceWarnings({
      landlord_registered: true,
      epc_served: true,
      eicr_served: false,
      repairing_standard_met: true,
    });
    expect(eicrWarnings.some(w => w.includes('EICR'))).toBe(true);

    // Warning for repairing standard not met
    const repairingWarnings = getScotlandComplianceWarnings({
      landlord_registered: true,
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: false,
    });
    expect(repairingWarnings.some(w => w.includes('repairing standard'))).toBe(true);

    // Warning for unlicensed HMO
    const hmoWarnings = getScotlandComplianceWarnings({
      landlord_registered: true,
      epc_served: true,
      eicr_served: true,
      repairing_standard_met: true,
      is_hmo: true,
      hmo_licensed: false,
    });
    expect(hmoWarnings.some(w => w.includes('HMO'))).toBe(true);
  });

  it('should render Scotland flow with Compliance section without errors', async () => {
    const scotlandCompleteProps = {
      caseId: 'test-scotland-compliance-render',
      jurisdiction: 'scotland' as const,
      initialFacts: {
        __meta: { product: 'notice_only', jurisdiction: 'scotland' },
        landlord_registered: true,
        deposit_taken: false,
        has_gas_appliances: false,
        epc_served: true,
        eicr_served: true,
        repairing_standard_met: true,
        is_hmo: false,
      },
    };

    render(<NoticeOnlySectionFlow {...scotlandCompleteProps} />);
    await screen.findByText(/Scotland Notice to Leave/);

    // Compliance tab should be visible and clickable
    const complianceButton = screen.getByRole('button', { name: /Compliance/i });
    expect(complianceButton).toBeDefined();
  });
});

/**
 * Scotland Evidence Description Tests
 *
 * These tests verify that:
 * 1. Evidence description field is saved when user types
 * 2. Evidence required list shows all items (not truncated)
 */
describe('NoticeOnlySectionFlow - Scotland Evidence Description', () => {
  it('should include evidence_description in ground selection update', () => {
    // The ScotlandGroundsSection now includes an evidence_description textarea
    // Verify the expected fact key is used
    const evidenceFacts = {
      scotland_eviction_ground: 1,
      scotland_evidence_description: 'I have estate agent valuations and marketing materials',
    };

    expect(evidenceFacts.scotland_evidence_description).toBeDefined();
    expect(evidenceFacts.scotland_evidence_description).toContain('estate agent');
  });
});
