/**
 * Friendly Labels Tests
 *
 * Tests for the user-friendly label mapping system that ensures:
 * 1. Raw fact keys are transformed to friendly action phrases
 * 2. Decision engine issues get correct legal reasons
 * 3. Pattern matching works for standard hint formats
 */

import { describe, test, expect } from 'vitest';
import {
  getFriendlyAction,
  getQuestionLabel,
  getFactCategory,
  transformUserFixHint,
  getDecisionIssueAction,
  getDecisionIssueLegalReason,
} from '../friendlyLabels';

describe('Friendly Labels', () => {
  describe('getFriendlyAction', () => {
    test('returns friendly action for known fact keys', () => {
      expect(getFriendlyAction('tenant_full_name')).toBe("Add the tenant's full name");
      expect(getFriendlyAction('deposit_protected')).toBe('Confirm the deposit is protected in a government scheme');
      expect(getFriendlyAction('landlord_full_name')).toBe('Add your full name');
      expect(getFriendlyAction('property_address_line1')).toBe('Add the property address');
    });

    test('returns fallback for unknown fact keys', () => {
      expect(getFriendlyAction('unknown_fact_key')).toBe('Provide unknown fact key');
      expect(getFriendlyAction('some_other_field')).toBe('Provide some other field');
    });
  });

  describe('getQuestionLabel', () => {
    test('returns friendly question label for known fact keys', () => {
      expect(getQuestionLabel('tenant_full_name')).toBe("Tenant's full name");
      expect(getQuestionLabel('deposit_protected')).toBe('Deposit protection');
      expect(getQuestionLabel('landlord_full_name')).toBe('Your name');
    });

    test('returns title case fallback for unknown fact keys', () => {
      expect(getQuestionLabel('some_unknown_field')).toBe('Some Unknown Field');
    });
  });

  describe('getFactCategory', () => {
    test('returns correct categories for known fact keys', () => {
      expect(getFactCategory('tenant_full_name')).toBe('tenant');
      expect(getFactCategory('landlord_full_name')).toBe('landlord');
      expect(getFactCategory('property_address_line1')).toBe('property');
      expect(getFactCategory('tenancy_start_date')).toBe('tenancy');
      expect(getFactCategory('deposit_protected')).toBe('deposit');
      expect(getFactCategory('gas_safety_cert_provided')).toBe('compliance');
    });

    test('returns "other" for unknown fact keys', () => {
      expect(getFactCategory('unknown_key')).toBe('other');
    });
  });

  describe('transformUserFixHint', () => {
    test('transforms standard pattern: "Please answer the question X to provide Y"', () => {
      const hint = 'Please answer the question "tenant_details" to provide tenant_full_name';
      expect(transformUserFixHint(hint, ['tenant_full_name'])).toBe("Add the tenant's full name");
    });

    test('transforms "Required information missing: X" pattern', () => {
      const hint = 'Required information missing: deposit_protected';
      expect(transformUserFixHint(hint, ['deposit_protected'])).toBe(
        'Confirm the deposit is protected in a government scheme'
      );
    });

    test('transforms "Missing required fact: X" pattern', () => {
      const hint = 'Missing required fact: property_address_line1 at stage preview';
      expect(transformUserFixHint(hint, ['property_address_line1'])).toBe('Add the property address');
    });

    test('returns original hint if no pattern matches', () => {
      const hint = 'Some custom error message with no known fact keys';
      expect(transformUserFixHint(hint, ['custom_field'])).toBe(hint);
    });

    test('generates hint from fields if hint is empty', () => {
      expect(transformUserFixHint(undefined, ['tenant_full_name'])).toBe("Add the tenant's full name");
      expect(transformUserFixHint(undefined, [])).toBe('Complete the required information');
    });

    test('finds known fact keys mentioned in hint', () => {
      const hint = 'The tenant_full_name field is required for this notice';
      expect(transformUserFixHint(hint, [])).toBe("Add the tenant's full name");
    });
  });

  describe('Decision Engine Issue Labels', () => {
    test('getDecisionIssueAction returns correct actions', () => {
      expect(getDecisionIssueAction('DEPOSIT_NOT_PROTECTED')).toBe(
        'Confirm the deposit is protected in a government scheme'
      );
      expect(getDecisionIssueAction('GAS_SAFETY_NOT_PROVIDED')).toBe(
        'Confirm the gas safety certificate was provided'
      );
      expect(getDecisionIssueAction('RENT_SMART_NOT_REGISTERED')).toBe(
        'Confirm you are registered with Rent Smart Wales'
      );
    });

    test('getDecisionIssueAction returns readable fallback for unknown codes', () => {
      expect(getDecisionIssueAction('SOME_UNKNOWN_CODE')).toBe('Some Unknown Code');
    });

    test('getDecisionIssueLegalReason returns correct legal reasons', () => {
      expect(getDecisionIssueLegalReason('DEPOSIT_NOT_PROTECTED')).toContain(
        'Section 21 notices are invalid'
      );
      expect(getDecisionIssueLegalReason('HOW_TO_RENT_NOT_PROVIDED')).toContain(
        'How to Rent'
      );
    });

    test('getDecisionIssueLegalReason returns undefined for unknown codes', () => {
      expect(getDecisionIssueLegalReason('UNKNOWN_CODE')).toBeUndefined();
    });
  });

  describe('Coverage for all notice-only routes', () => {
    // These are the key fact keys used across all routes
    const commonFactKeys = [
      'landlord_full_name',
      'landlord_address_line1',
      'landlord_city',
      'landlord_postcode',
      'tenant_full_name',
      'property_address_line1',
      'property_city',
      'property_postcode',
      'tenancy_start_date',
      'rent_amount',
      'rent_frequency',
    ];

    const section21SpecificKeys = [
      'deposit_protected',
      'prescribed_info_given',
      'gas_safety_cert_provided',
      'how_to_rent_given',
      'epc_provided',
    ];

    const walesSpecificKeys = [
      'rent_smart_wales_registered',
      'wales_contract_category',
    ];

    test('all common fact keys have friendly labels', () => {
      for (const key of commonFactKeys) {
        const action = getFriendlyAction(key);
        expect(action).not.toBe(`Provide ${key.replace(/_/g, ' ')}`);
      }
    });

    test('Section 21 specific keys have friendly labels', () => {
      for (const key of section21SpecificKeys) {
        const action = getFriendlyAction(key);
        expect(action).not.toBe(`Provide ${key.replace(/_/g, ' ')}`);
      }
    });

    test('Wales specific keys have friendly labels', () => {
      for (const key of walesSpecificKeys) {
        const action = getFriendlyAction(key);
        expect(action).not.toBe(`Provide ${key.replace(/_/g, ' ')}`);
      }
    });
  });
});
