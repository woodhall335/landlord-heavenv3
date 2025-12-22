import { describe, test, expect, vi } from 'vitest';
import { applyMappedAnswers, setFactPath } from './mapping';
import type { WizardFacts } from './schema';

describe('setFactPath', () => {
  test('should set single-segment path correctly', () => {
    const facts: WizardFacts = {};
    const result = setFactPath(facts, 'landlord_name', 'John Smith');
    expect(result.landlord_name).toBe('John Smith');
  });

  test('should set dot-notation path as flat key', () => {
    const facts: WizardFacts = {};
    const result = setFactPath(facts, 'notice_service.notice_date', '2024-01-15');
    expect(result['notice_service.notice_date']).toBe('2024-01-15');
  });

  test('should not mutate original facts', () => {
    const facts: WizardFacts = { existing: 'value' };
    const result = setFactPath(facts, 'new_field', 'new value');
    expect(facts.new_field).toBeUndefined();
    expect(result.new_field).toBe('new value');
    expect(result.existing).toBe('value');
  });
});

describe('applyMappedAnswers', () => {
  // =============================================================================
  // BASIC FUNCTIONALITY TESTS
  // =============================================================================

  describe('Basic Functionality', () => {
    test('should return facts unchanged when mapsTo is undefined', () => {
      const facts: WizardFacts = { existing: 'value' };
      const result = applyMappedAnswers(facts, undefined, 'test');
      expect(result).toEqual(facts);
    });

    test('should return facts unchanged when mapsTo is empty array', () => {
      const facts: WizardFacts = { existing: 'value' };
      const result = applyMappedAnswers(facts, [], 'test');
      expect(result).toEqual(facts);
    });

    test('should map scalar string value correctly', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['landlord_name'], 'John Smith');
      expect(result.landlord_name).toBe('John Smith');
    });

    test('should map scalar number value correctly', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['rent_amount'], 1500);
      expect(result.rent_amount).toBe(1500);
    });

    test('should map scalar boolean value correctly', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['deposit_protected'], true);
      expect(result.deposit_protected).toBe(true);
    });

    test('should map null value correctly', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['optional_field'], null);
      expect(result.optional_field).toBeNull();
    });

    test('should handle array values correctly', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['selected_grounds'], ['ground1', 'ground2']);
      expect(result.selected_grounds).toEqual(['ground1', 'ground2']);
    });
  });

  // =============================================================================
  // OBJECT VALUE EXTRACTION TESTS
  // =============================================================================

  describe('Object Value Extraction', () => {
    test('should extract specific field from object value', () => {
      const facts: WizardFacts = {};
      const answerObject = {
        landlord_name: 'John Smith',
        landlord_email: 'john@example.com',
        landlord_phone: '020 1234 5678',
      };
      const result = applyMappedAnswers(
        facts,
        ['landlord_name', 'landlord_email', 'landlord_phone'],
        answerObject
      );
      expect(result.landlord_name).toBe('John Smith');
      expect(result.landlord_email).toBe('john@example.com');
      expect(result.landlord_phone).toBe('020 1234 5678');
    });

    test('should extract field using dot-notation path last segment', () => {
      const facts: WizardFacts = {};
      const answerObject = {
        service_method: 'Post',
        served_by: 'Landlord',
      };
      const result = applyMappedAnswers(
        facts,
        ['notice_service.service_method', 'notice_service.served_by'],
        answerObject
      );
      expect(result['notice_service.service_method']).toBe('Post');
      expect(result['notice_service.served_by']).toBe('Landlord');
    });

    test('should use address key fallback for landlord fields', () => {
      const facts: WizardFacts = {};
      const answerObject = {
        address_line1: '123 High Street',
        address_line2: 'Flat 4B',
        city: 'London',
        postcode: 'SW1A 1AA',
      };
      const result = applyMappedAnswers(
        facts,
        ['landlord_address_line1', 'landlord_address_line2', 'landlord_city', 'landlord_postcode'],
        answerObject
      );
      expect(result.landlord_address_line1).toBe('123 High Street');
      expect(result.landlord_address_line2).toBe('Flat 4B');
      expect(result.landlord_city).toBe('London');
      expect(result.landlord_postcode).toBe('SW1A 1AA');
    });
  });

  // =============================================================================
  // REGRESSION TESTS - OBJECT CORRUPTION BUG
  // =============================================================================

  describe('Regression: Object Corruption Prevention', () => {
    test('CRITICAL: should NOT save entire object when mapped field is missing', () => {
      const facts: WizardFacts = {};
      const answerObject = {
        landlord_full_name: 'Tariq mohammed',
        landlord_address_line1: '16 Waterloo Road',
        landlord_city: 'Pudsey',
        landlord_postcode: 'LS28 7PW',
        landlord_phone: '01132 123123',
        // NOTE: landlord_address_line2 is NOT present (optional, user didn't fill it)
      };

      const result = applyMappedAnswers(
        facts,
        [
          'landlord_full_name',
          'landlord_address_line1',
          'landlord_address_line2', // This field is missing from answerObject
          'landlord_city',
          'landlord_postcode',
          'landlord_phone',
        ],
        answerObject
      );

      // landlord_address_line2 should be undefined, NOT the entire answerObject
      expect(result.landlord_address_line2).toBeUndefined();
      expect(typeof result.landlord_address_line2).not.toBe('object');

      // Other fields should still be mapped correctly
      expect(result.landlord_full_name).toBe('Tariq mohammed');
      expect(result.landlord_address_line1).toBe('16 Waterloo Road');
      expect(result.landlord_city).toBe('Pudsey');
    });

    test('CRITICAL: should NOT save entire object when field name mismatches maps_to path', () => {
      const facts: WizardFacts = {};
      const answerObject = {
        notice_service_date: '2025-12-28', // Field ID is notice_service_date
        notice_expiry_date: '2026-07-14',
        service_method: 'Post',
        served_by: 'Tariq',
      };

      const result = applyMappedAnswers(
        facts,
        [
          'notice_service.notice_date', // Expected key: notice_date, but value has: notice_service_date
          'notice_service.notice_expiry_date',
          'notice_service.service_method',
          'notice_service.served_by',
        ],
        answerObject
      );

      // notice_service.notice_date should be undefined because key mismatch
      // It should NOT contain the entire answerObject
      expect(result['notice_service.notice_date']).toBeUndefined();
      expect(typeof result['notice_service.notice_date']).not.toBe('object');

      // Fields with matching keys should still work
      expect(result['notice_service.notice_expiry_date']).toBe('2026-07-14');
      expect(result['notice_service.service_method']).toBe('Post');
      expect(result['notice_service.served_by']).toBe('Tariq');
    });

    test('CRITICAL: should NOT save entire object for property_address_line2 when missing', () => {
      const facts: WizardFacts = {};
      const answerObject = {
        property_address_line1: '35 woodhall park avenue',
        property_city: 'Pudsey',
        property_postcode: 'ls28 7hf',
        // property_address_line2 is missing
      };

      const result = applyMappedAnswers(
        facts,
        ['property_address_line1', 'property_address_line2', 'property_city', 'property_postcode'],
        answerObject
      );

      // property_address_line2 should be undefined, NOT the entire object
      expect(result.property_address_line2).toBeUndefined();
      expect(typeof result.property_address_line2).not.toBe('object');

      // Other fields should work
      expect(result.property_address_line1).toBe('35 woodhall park avenue');
      expect(result.property_city).toBe('Pudsey');
    });

    test('CRITICAL: should refuse to save nested object even if somehow extracted', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const facts: WizardFacts = {};
      const answerObject = {
        nested_field: { some: 'nested', object: 'here' },
      };

      const result = applyMappedAnswers(facts, ['nested_field'], answerObject);

      // Should refuse to save the nested object
      expect(result.nested_field).toBeUndefined();

      // Should log a warning
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MAPPING] Refusing to save object to fact path')
      );

      consoleSpy.mockRestore();
    });

    test('should handle the exact bug scenario from production logs', () => {
      // This is the exact scenario that was causing [Normalize] Found unexpected object...
      const facts: WizardFacts = {};
      const landlordAnswer = {
        landlord_full_name: 'Tariq mohammed',
        landlord_address_line1: '16 Waterloo Road',
        // landlord_address_line2 intentionally missing
        landlord_city: 'Pudsey',
        landlord_postcode: 'LS28 7PW',
        landlord_phone: '01132 123123',
      };

      const result = applyMappedAnswers(
        facts,
        [
          'landlord_full_name',
          'landlord_address_line1',
          'landlord_address_line2',
          'landlord_city',
          'landlord_postcode',
          'landlord_phone',
        ],
        landlordAnswer
      );

      // Verify no nested objects were saved
      for (const [key, value] of Object.entries(result)) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          throw new Error(
            `Found unexpected object at key "${key}": ${JSON.stringify(value)}. ` +
              `This would cause [Normalize] Found unexpected object warnings.`
          );
        }
      }

      // All scalar values should be preserved
      expect(result.landlord_full_name).toBe('Tariq mohammed');
      expect(result.landlord_address_line1).toBe('16 Waterloo Road');
      expect(result.landlord_city).toBe('Pudsey');
      expect(result.landlord_postcode).toBe('LS28 7PW');
      expect(result.landlord_phone).toBe('01132 123123');
    });
  });

  // =============================================================================
  // EDGE CASES
  // =============================================================================

  describe('Edge Cases', () => {
    test('should handle empty string values correctly', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['optional_field'], '');
      expect(result.optional_field).toBe('');
    });

    test('should handle zero values correctly', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['deposit_amount'], 0);
      expect(result.deposit_amount).toBe(0);
    });

    test('should handle false boolean values correctly', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['deposit_protected'], false);
      expect(result.deposit_protected).toBe(false);
    });

    test('should preserve existing facts when adding new ones', () => {
      const facts: WizardFacts = { existing_field: 'existing_value' };
      const result = applyMappedAnswers(facts, ['new_field'], 'new_value');
      expect(result.existing_field).toBe('existing_value');
      expect(result.new_field).toBe('new_value');
    });

    test('should handle deeply nested path correctly', () => {
      const facts: WizardFacts = {};
      const answerObject = { value: 'test' };
      const result = applyMappedAnswers(facts, ['a.b.c.d.value'], answerObject);
      expect(result['a.b.c.d.value']).toBe('test');
    });

    test('should not modify facts when all mapped keys are missing', () => {
      const facts: WizardFacts = { existing: 'value' };
      const answerObject = { different_key: 'different_value' };
      const result = applyMappedAnswers(facts, ['missing_key1', 'missing_key2'], answerObject);

      // Should only have the original fact
      expect(Object.keys(result)).toEqual(['existing']);
      expect(result.existing).toBe('value');
    });
  });
});
