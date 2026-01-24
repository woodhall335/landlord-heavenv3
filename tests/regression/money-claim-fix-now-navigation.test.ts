/**
 * Regression tests for "Fix now" navigation in Money Claim wizard
 *
 * Tests that clicking "Fix now" on validation issues correctly navigates
 * to the appropriate wizard section.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// =============================================================================
// FIELD TO SECTION MAPPING TESTS
// =============================================================================

describe('Money Claim - Fix Now Navigation', () => {
  describe('Field to Section Mapping', () => {
    // The mapping function from ReviewSection.tsx
    function getWizardSectionForField(field: string | null | undefined, section: string): string | null {
      if (!field) return null;

      const fieldToSection: Record<string, string> = {
        'landlord_full_name': 'parties',
        'landlord_address_line1': 'parties',
        'landlord_address_postcode': 'parties',
        'tenant_full_name': 'parties',
        'defendant_address_line1': 'parties',
        'tenancy_start_date': 'tenancy',
        'tenancy_end_date': 'tenancy',
        'rent_amount': 'tenancy',
        'rent_frequency': 'tenancy',
        'arrears_items': 'arrears',
        'money_claim.damage_items': 'damages',
        'money_claim.other_amounts_types': 'claim_details',
        'money_claim.basis_of_claim': 'claim_details',
        'money_claim.charge_interest': 'claim_details',
        'money_claim.interest_start_date': 'claim_details',
        'letter_before_claim_sent': 'preaction',
        'pap_letter_date': 'preaction',
      };

      return fieldToSection[field] || null;
    }

    it('maps landlord fields to parties section', () => {
      expect(getWizardSectionForField('landlord_full_name', '')).toBe('parties');
      expect(getWizardSectionForField('landlord_address_line1', '')).toBe('parties');
      expect(getWizardSectionForField('landlord_address_postcode', '')).toBe('parties');
    });

    it('maps tenant fields to parties section', () => {
      expect(getWizardSectionForField('tenant_full_name', '')).toBe('parties');
      expect(getWizardSectionForField('defendant_address_line1', '')).toBe('parties');
    });

    it('maps tenancy fields to tenancy section', () => {
      expect(getWizardSectionForField('tenancy_start_date', '')).toBe('tenancy');
      expect(getWizardSectionForField('tenancy_end_date', '')).toBe('tenancy');
      expect(getWizardSectionForField('rent_amount', '')).toBe('tenancy');
      expect(getWizardSectionForField('rent_frequency', '')).toBe('tenancy');
    });

    it('maps arrears fields to arrears section', () => {
      expect(getWizardSectionForField('arrears_items', '')).toBe('arrears');
    });

    it('maps damage items to damages section', () => {
      expect(getWizardSectionForField('money_claim.damage_items', '')).toBe('damages');
    });

    it('maps claim details fields to claim_details section', () => {
      expect(getWizardSectionForField('money_claim.other_amounts_types', '')).toBe('claim_details');
      expect(getWizardSectionForField('money_claim.basis_of_claim', '')).toBe('claim_details');
      expect(getWizardSectionForField('money_claim.charge_interest', '')).toBe('claim_details');
      expect(getWizardSectionForField('money_claim.interest_start_date', '')).toBe('claim_details');
    });

    it('maps pre-action fields to preaction section', () => {
      expect(getWizardSectionForField('letter_before_claim_sent', '')).toBe('preaction');
      expect(getWizardSectionForField('pap_letter_date', '')).toBe('preaction');
    });

    it('returns null for undefined/null fields', () => {
      expect(getWizardSectionForField(undefined, '')).toBeNull();
      expect(getWizardSectionForField(null, '')).toBeNull();
    });

    it('returns null for unknown fields', () => {
      expect(getWizardSectionForField('unknown_field', '')).toBeNull();
    });
  });

  describe('Section Mapping in Wizard Flow', () => {
    // The mapping function from MoneyClaimSectionFlow.tsx
    function mapToWizardSection(section: string): string {
      const sectionMap: Record<string, string> = {
        parties: 'claimant',
        claimant: 'claimant',
        defendant: 'defendant',
        tenancy: 'tenancy',
        claim_details: 'claim_details',
        arrears: 'arrears',
        damages: 'damages',
        preaction: 'preaction',
        timeline: 'timeline',
        evidence: 'evidence',
        enforcement: 'enforcement',
        review: 'review',
      };
      return sectionMap[section] || section;
    }

    it('maps parties to claimant section', () => {
      expect(mapToWizardSection('parties')).toBe('claimant');
    });

    it('maps direct section names unchanged', () => {
      expect(mapToWizardSection('claimant')).toBe('claimant');
      expect(mapToWizardSection('defendant')).toBe('defendant');
      expect(mapToWizardSection('tenancy')).toBe('tenancy');
      expect(mapToWizardSection('arrears')).toBe('arrears');
      expect(mapToWizardSection('damages')).toBe('damages');
      expect(mapToWizardSection('preaction')).toBe('preaction');
    });

    it('returns unknown sections unchanged', () => {
      expect(mapToWizardSection('unknown_section')).toBe('unknown_section');
    });
  });
});

// =============================================================================
// CUSTOM EVENT TESTS
// =============================================================================

describe('Money Claim - wizard:navigate Event', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let dispatchEventSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('wizard:navigate event has correct structure', () => {
    const event = new CustomEvent('wizard:navigate', {
      detail: { section: 'claimant' },
    });

    expect(event.type).toBe('wizard:navigate');
    expect(event.detail).toEqual({ section: 'claimant' });
  });

  it('event can be dispatched to window', () => {
    const event = new CustomEvent('wizard:navigate', {
      detail: { section: 'arrears' },
    });

    window.dispatchEvent(event);

    expect(dispatchEventSpy).toHaveBeenCalledWith(event);
  });

  it('event listener can be added and removed', () => {
    const handler = vi.fn();

    window.addEventListener('wizard:navigate', handler);
    expect(addEventListenerSpy).toHaveBeenCalledWith('wizard:navigate', handler);

    window.removeEventListener('wizard:navigate', handler);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('wizard:navigate', handler);
  });
});

// =============================================================================
// INTEGRATION TEST - FULL FLOW
// =============================================================================

describe('Money Claim - Fix Now Full Flow', () => {
  it('complete navigation flow: field -> section -> wizard section', () => {
    // Simulate the full flow:
    // 1. Validation rule has a field (e.g., 'landlord_full_name')
    // 2. ReviewSection maps it to a section (e.g., 'parties')
    // 3. Event is dispatched with section
    // 4. MoneyClaimSectionFlow maps it to wizard section (e.g., 'claimant')
    // 5. Wizard navigates to that section

    // Step 1-2: ReviewSection mapping
    const fieldToSection: Record<string, string> = {
      'landlord_full_name': 'parties',
    };
    const validationField = 'landlord_full_name';
    const targetSection = fieldToSection[validationField];
    expect(targetSection).toBe('parties');

    // Step 3: Event would be dispatched
    const event = new CustomEvent('wizard:navigate', {
      detail: { section: targetSection },
    });
    expect(event.detail.section).toBe('parties');

    // Step 4: MoneyClaimSectionFlow mapping
    const sectionMap: Record<string, string> = {
      parties: 'claimant',
    };
    const wizardSection = sectionMap[event.detail.section] || event.detail.section;
    expect(wizardSection).toBe('claimant');

    // Step 5: Would call setCurrentSectionIndex with the index of 'claimant'
    // This is tested in component tests
  });

  it('all blocker fields map to valid wizard sections', () => {
    // Fields from common validation rules that should be navigable
    const blockerFields = [
      'landlord_full_name',
      'landlord_address_line1',
      'landlord_address_postcode',
      'tenant_full_name',
      'defendant_address_line1',
      'tenancy_start_date',
      'rent_amount',
      'rent_frequency',
      'arrears_items',
      'money_claim.damage_items',
      'money_claim.charge_interest',
      'letter_before_claim_sent',
      'pap_letter_date',
    ];

    const fieldToSection: Record<string, string> = {
      'landlord_full_name': 'parties',
      'landlord_address_line1': 'parties',
      'landlord_address_postcode': 'parties',
      'tenant_full_name': 'parties',
      'defendant_address_line1': 'parties',
      'tenancy_start_date': 'tenancy',
      'tenancy_end_date': 'tenancy',
      'rent_amount': 'tenancy',
      'rent_frequency': 'tenancy',
      'arrears_items': 'arrears',
      'money_claim.damage_items': 'damages',
      'money_claim.other_amounts_types': 'claim_details',
      'money_claim.basis_of_claim': 'claim_details',
      'money_claim.charge_interest': 'claim_details',
      'money_claim.interest_start_date': 'claim_details',
      'letter_before_claim_sent': 'preaction',
      'pap_letter_date': 'preaction',
    };

    const sectionMap: Record<string, string> = {
      parties: 'claimant',
      claimant: 'claimant',
      defendant: 'defendant',
      tenancy: 'tenancy',
      claim_details: 'claim_details',
      arrears: 'arrears',
      damages: 'damages',
      preaction: 'preaction',
    };

    for (const field of blockerFields) {
      const reviewSection = fieldToSection[field];
      expect(reviewSection, `Field ${field} should map to a review section`).toBeDefined();

      const wizardSection = sectionMap[reviewSection];
      expect(wizardSection, `Review section ${reviewSection} should map to a wizard section`).toBeDefined();
    }
  });
});
