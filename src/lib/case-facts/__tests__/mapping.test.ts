/**
 * Tests for Case Facts Mapping Functions
 *
 * TASK B: Tests to verify applyMappedAnswers does NOT write objects into flat facts.
 * This prevents object pollution which causes normalization flattening loops.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { applyMappedAnswers, setFactPath } from '../mapping';
import type { WizardFacts } from '../schema';

describe('setFactPath', () => {
  it('should set a simple path value', () => {
    const facts: WizardFacts = {};
    const result = setFactPath(facts, 'landlord_full_name', 'John Smith');
    expect(result.landlord_full_name).toBe('John Smith');
  });

  it('should set a nested path as flat key', () => {
    const facts: WizardFacts = {};
    const result = setFactPath(facts, 'notice_service.notice_date', '2024-01-15');
    expect((result as any)['notice_service.notice_date']).toBe('2024-01-15');
  });

  it('should not mutate the original facts object', () => {
    const facts: WizardFacts = { landlord_full_name: 'Original' };
    const result = setFactPath(facts, 'landlord_full_name', 'New');
    expect(facts.landlord_full_name).toBe('Original');
    expect(result.landlord_full_name).toBe('New');
  });
});

describe('applyMappedAnswers', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('basic functionality', () => {
    it('should return facts unchanged when mapsTo is empty', () => {
      const facts: WizardFacts = { existing: 'value' };
      const result = applyMappedAnswers(facts, [], 'test');
      expect(result).toEqual(facts);
    });

    it('should return facts unchanged when mapsTo is undefined', () => {
      const facts: WizardFacts = { existing: 'value' };
      const result = applyMappedAnswers(facts, undefined, 'test');
      expect(result).toEqual(facts);
    });

    it('should set primitive values directly', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['landlord_full_name'], 'John Smith');
      expect(result.landlord_full_name).toBe('John Smith');
    });

    it('should extract values from object by key', () => {
      const facts: WizardFacts = {};
      const answer = {
        landlord_full_name: 'John Smith',
        landlord_phone: '020 1234 5678',
      };
      const result = applyMappedAnswers(
        facts,
        ['landlord_full_name', 'landlord_phone'],
        answer
      );
      expect(result.landlord_full_name).toBe('John Smith');
      expect(result.landlord_phone).toBe('020 1234 5678');
    });
  });

  describe('TASK B: object pollution prevention', () => {
    it('should NOT write whole object when key not found in value', () => {
      const facts: WizardFacts = {};
      const answer = {
        some_other_field: 'value',
      };
      // maps_to has 'landlord_full_name' but answer object doesn't have it
      const result = applyMappedAnswers(facts, ['landlord_full_name'], answer);

      // Should NOT have set the whole object
      expect(result.landlord_full_name).toBeUndefined();
      expect(typeof result.landlord_full_name).not.toBe('object');
    });

    it('should NOT write nested objects to flat paths', () => {
      const facts: WizardFacts = {};
      const answer = {
        notice: {
          notice_date: '2024-01-15',
          expiry_date: '2024-03-15',
        },
      };
      // If someone accidentally passes a nested object
      const result = applyMappedAnswers(facts, ['notice'], answer);

      // Should NOT have written the nested object
      expect((result as any).notice).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should NOT write object values even when extracted from answer', () => {
      const facts: WizardFacts = {};
      const answer = {
        landlord_details: {
          name: 'John',
          address: '123 Street',
        },
      };
      const result = applyMappedAnswers(facts, ['landlord_details'], answer);

      // Should NOT have written the nested object
      expect((result as any).landlord_details).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should skip missing keys without writing object fallback', () => {
      const facts: WizardFacts = {};
      const answer = {
        landlord_full_name: 'John Smith',
        // landlord_address_line2 is missing (optional field)
      };
      const result = applyMappedAnswers(
        facts,
        ['landlord_full_name', 'landlord_address_line2'],
        answer
      );

      // landlord_full_name should be set
      expect(result.landlord_full_name).toBe('John Smith');
      // landlord_address_line2 should NOT be set to the whole object
      expect(result.landlord_address_line2).toBeUndefined();
    });

    it('should log warning when skipping object write', () => {
      const facts: WizardFacts = {};
      const answer = {
        nested_object: { key: 'value' },
      };
      applyMappedAnswers(facts, ['nested_object'], answer);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[applyMappedAnswers] Skipping object write')
      );
    });
  });

  describe('address key fallback', () => {
    it('should handle address_line1 fallback', () => {
      const facts: WizardFacts = {};
      const answer = {
        address_line1: '123 High Street',
      };
      const result = applyMappedAnswers(
        facts,
        ['property_address_line1'],
        answer
      );
      expect(result.property_address_line1).toBe('123 High Street');
    });

    it('should handle address_line2 fallback', () => {
      const facts: WizardFacts = {};
      const answer = {
        address_line2: 'Flat 4B',
      };
      const result = applyMappedAnswers(
        facts,
        ['landlord_address_line2'],
        answer
      );
      expect(result.landlord_address_line2).toBe('Flat 4B');
    });

    it('should handle city fallback', () => {
      const facts: WizardFacts = {};
      const answer = {
        city: 'London',
      };
      const result = applyMappedAnswers(facts, ['property_city'], answer);
      expect(result.property_city).toBe('London');
    });

    it('should handle postcode fallback', () => {
      const facts: WizardFacts = {};
      const answer = {
        postcode: 'SW1A 1AA',
      };
      const result = applyMappedAnswers(facts, ['landlord_postcode'], answer);
      expect(result.landlord_postcode).toBe('SW1A 1AA');
    });
  });

  describe('array handling', () => {
    it('should allow arrays as values', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(
        facts,
        ['section8_grounds'],
        ['ground_8', 'ground_10']
      );
      expect(result.section8_grounds).toEqual(['ground_8', 'ground_10']);
    });

    it('should extract array values from object', () => {
      const facts: WizardFacts = {};
      const answer = {
        section8_grounds: ['ground_8', 'ground_10'],
      };
      const result = applyMappedAnswers(facts, ['section8_grounds'], answer);
      expect(result.section8_grounds).toEqual(['ground_8', 'ground_10']);
    });
  });

  describe('null and undefined handling', () => {
    it('should allow null values', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['some_field'], null);
      expect(result.some_field).toBeNull();
    });

    it('should allow undefined values', () => {
      const facts: WizardFacts = {};
      const result = applyMappedAnswers(facts, ['some_field'], undefined);
      expect(result.some_field).toBeUndefined();
    });
  });
});
