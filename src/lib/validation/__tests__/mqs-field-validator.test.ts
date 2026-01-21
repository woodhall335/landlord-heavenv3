/**
 * Tests for MQS Field Validator
 *
 * Tests the field-level validation logic used for live validation
 * in the eviction wizard.
 */

import { describe, it, expect } from 'vitest';
import {
  isEmpty,
  isDependencyMet,
  validateField,
  validateGroupFields,
  validateQuestion,
  validateDepositCap,
  calculateDepositCap,
  validateSection21Compliance,
  UK_PATTERNS,
} from '../mqs-field-validator';

describe('isEmpty', () => {
  it('returns true for null', () => {
    expect(isEmpty(null)).toBe(true);
  });

  it('returns true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isEmpty('')).toBe(true);
  });

  it('returns true for empty array', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('returns false for boolean false (CRITICAL: false is a valid answer)', () => {
    expect(isEmpty(false)).toBe(false);
  });

  it('returns false for boolean true', () => {
    expect(isEmpty(true)).toBe(false);
  });

  it('returns false for number 0', () => {
    expect(isEmpty(0)).toBe(false);
  });

  it('returns false for non-empty string', () => {
    expect(isEmpty('hello')).toBe(false);
  });

  it('returns false for non-empty array', () => {
    expect(isEmpty(['item'])).toBe(false);
  });
});

describe('isDependencyMet', () => {
  const facts = {
    has_gas_appliances: true,
    deposit_taken: false,
    eviction_route: 'section_21',
    selected_grounds: ['Ground 8', 'Ground 10'],
  };

  it('returns true when no condition specified', () => {
    expect(isDependencyMet(undefined, facts)).toBe(true);
    expect(isDependencyMet({}, facts)).toBe(true);
  });

  it('checks exact value match', () => {
    expect(isDependencyMet(
      { questionId: 'has_gas_appliances', value: true },
      facts
    )).toBe(true);

    expect(isDependencyMet(
      { questionId: 'has_gas_appliances', value: false },
      facts
    )).toBe(false);
  });

  it('checks valueNotEqual condition', () => {
    expect(isDependencyMet(
      { questionId: 'eviction_route', valueNotEqual: 'section_8' },
      facts
    )).toBe(true);

    expect(isDependencyMet(
      { questionId: 'eviction_route', valueNotEqual: 'section_21' },
      facts
    )).toBe(false);
  });

  it('checks contains condition for arrays', () => {
    expect(isDependencyMet(
      { questionId: 'selected_grounds', contains: 'Ground 8' },
      facts
    )).toBe(true);

    expect(isDependencyMet(
      { questionId: 'selected_grounds', contains: 'Ground 14' },
      facts
    )).toBe(false);
  });

  it('checks array expected value against single actual', () => {
    expect(isDependencyMet(
      { questionId: 'eviction_route', value: ['section_8', 'section_21'] },
      facts
    )).toBe(true);

    expect(isDependencyMet(
      { questionId: 'eviction_route', value: ['section_8', 'section_173'] },
      facts
    )).toBe(false);
  });
});

describe('validateField', () => {
  describe('required validation', () => {
    const validation = { required: true };

    it('returns error when value is empty', () => {
      const errors = validateField('name', '', validation, 'Name', 'text');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Name is required');
    });

    it('returns error when value is undefined', () => {
      const errors = validateField('name', undefined, validation, 'Name', 'text');
      expect(errors).toHaveLength(1);
    });

    it('returns error when value is null', () => {
      const errors = validateField('name', null, validation, 'Name', 'text');
      expect(errors).toHaveLength(1);
    });

    it('does NOT return error for boolean false', () => {
      const errors = validateField('deposit_protected', false, validation, 'Deposit Protected', 'boolean');
      expect(errors).toHaveLength(0);
    });

    it('does NOT return error for number 0', () => {
      const errors = validateField('deposit_amount', 0, validation, 'Deposit Amount', 'number');
      expect(errors).toHaveLength(0);
    });

    it('passes when value is present', () => {
      const errors = validateField('name', 'John', validation, 'Name', 'text');
      expect(errors).toHaveLength(0);
    });
  });

  describe('pattern validation', () => {
    it('validates against custom pattern', () => {
      const validation = { pattern: '^[A-Z]+$' };
      expect(validateField('code', 'ABC', validation)).toHaveLength(0);
      expect(validateField('code', 'abc', validation)).toHaveLength(1);
    });
  });

  describe('postcode validation', () => {
    it('validates UK postcodes', () => {
      // Valid postcodes
      expect(validateField('property_postcode', 'LS28 7PW', {})).toHaveLength(0);
      expect(validateField('property_postcode', 'SW1A 1AA', {})).toHaveLength(0);
      expect(validateField('property_postcode', 'M1 1AA', {})).toHaveLength(0);
      expect(validateField('property_postcode', 'EH1 1BB', {})).toHaveLength(0);

      // Invalid postcodes
      expect(validateField('property_postcode', 'INVALID', {})).toHaveLength(1);
      expect(validateField('property_postcode', '12345', {})).toHaveLength(1);
    });
  });

  describe('email validation', () => {
    it('validates email format', () => {
      expect(validateField('email', 'test@example.com', {}, 'Email', 'email')).toHaveLength(0);
      expect(validateField('email', 'invalid', {}, 'Email', 'email')).toHaveLength(1);
      expect(validateField('email', 'test@', {}, 'Email', 'email')).toHaveLength(1);
    });
  });

  describe('date validation', () => {
    it('validates date format', () => {
      // ISO format (from date inputs)
      expect(validateField('date', '2024-01-15', {}, 'Date', 'date')).toHaveLength(0);

      // UK format
      expect(validateField('date', '15/01/2024', {}, 'Date', 'date')).toHaveLength(0);

      // Invalid dates
      expect(validateField('date', '32/01/2024', {}, 'Date', 'date')).toHaveLength(1);
      expect(validateField('date', 'invalid', {}, 'Date', 'date')).toHaveLength(1);
    });
  });

  describe('number validation', () => {
    it('validates min bound', () => {
      const validation = { min: 100 };
      expect(validateField('rent', 150, validation, 'Rent', 'number')).toHaveLength(0);
      expect(validateField('rent', 100, validation, 'Rent', 'number')).toHaveLength(0);
      expect(validateField('rent', 50, validation, 'Rent', 'number')).toHaveLength(1);
    });

    it('validates max bound', () => {
      const validation = { max: 1000 };
      expect(validateField('rent', 500, validation, 'Rent', 'number')).toHaveLength(0);
      expect(validateField('rent', 1000, validation, 'Rent', 'number')).toHaveLength(0);
      expect(validateField('rent', 1500, validation, 'Rent', 'number')).toHaveLength(1);
    });

    it('validates currency fields', () => {
      const validation = { min: 0 };
      expect(validateField('deposit', 500, validation, 'Deposit', 'currency')).toHaveLength(0);
      expect(validateField('deposit', -50, validation, 'Deposit', 'currency')).toHaveLength(1);
    });
  });

  describe('assertValue validation', () => {
    it('validates exact boolean assertion', () => {
      const validation = {
        assertValue: true,
        assertMessage: 'Section 21 cannot be used if deposit is not protected.'
      };

      expect(validateField('deposit_protected', true, validation)).toHaveLength(0);
      expect(validateField('deposit_protected', false, validation)).toHaveLength(1);
      expect(validateField('deposit_protected', false, validation)[0].message).toBe(
        'Section 21 cannot be used if deposit is not protected.'
      );
    });

    it('handles string "true"/"false" in assertValue', () => {
      const validation = { assertValue: 'true' };
      expect(validateField('field', true, validation)).toHaveLength(0);
      expect(validateField('field', false, validation)).toHaveLength(1);
    });
  });
});

describe('validateGroupFields', () => {
  const fields = [
    { id: 'landlord_name', label: 'Landlord Name', validation: { required: true } },
    { id: 'landlord_email', label: 'Email', inputType: 'email' },
    {
      id: 'gas_safety_cert',
      label: 'Gas Safety Certificate',
      dependsOn: { questionId: 'has_gas', value: true },
      validation: { required: true }
    },
  ];

  it('validates required fields', () => {
    const errors = validateGroupFields(fields, { landlord_name: '' }, { has_gas: false });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('landlord_name');
  });

  it('skips conditional fields when dependency not met', () => {
    const errors = validateGroupFields(
      fields,
      { landlord_name: 'John', gas_safety_cert: '' },
      { has_gas: false }
    );
    // No error for gas_safety_cert because has_gas is false
    expect(errors).toHaveLength(0);
  });

  it('validates conditional fields when dependency is met', () => {
    const errors = validateGroupFields(
      fields,
      { landlord_name: 'John', gas_safety_cert: '' },
      { has_gas: true }
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('gas_safety_cert');
  });
});

describe('calculateDepositCap', () => {
  it('calculates 5 weeks cap for rent under £50k/year', () => {
    // £1000/month = £12000/year → 5 weeks
    const result = calculateDepositCap(1000, 'monthly', 1200);
    expect(result).not.toBeNull();
    expect(result!.maxWeeks).toBe(5);
    expect(result!.weeklyRent).toBeCloseTo(12000 / 52, 2);
    expect(result!.maxDeposit).toBeCloseTo((12000 / 52) * 5, 2);
    expect(result!.exceeds).toBe(false);
  });

  it('calculates 6 weeks cap for rent at or above £50k/year', () => {
    // £4500/month = £54000/year → 6 weeks
    const result = calculateDepositCap(4500, 'monthly', 5000);
    expect(result).not.toBeNull();
    expect(result!.maxWeeks).toBe(6);
    expect(result!.exceeds).toBe(false);
  });

  it('detects when deposit exceeds cap', () => {
    // £1000/month, 5 week cap is ~£1153.85
    const result = calculateDepositCap(1000, 'monthly', 2000);
    expect(result).not.toBeNull();
    expect(result!.exceeds).toBe(true);
    expect(result!.excessAmount).toBeGreaterThan(0);
  });

  it('handles weekly rent correctly', () => {
    const result = calculateDepositCap(250, 'weekly', 1200);
    expect(result).not.toBeNull();
    expect(result!.weeklyRent).toBe(250);
    expect(result!.maxWeeks).toBe(5);
    expect(result!.maxDeposit).toBe(1250);
  });

  it('returns null when rent or deposit is missing', () => {
    expect(calculateDepositCap(undefined, 'monthly', 1000)).toBeNull();
    expect(calculateDepositCap(1000, 'monthly', undefined)).toBeNull();
  });
});

describe('validateDepositCap', () => {
  it('returns null when deposit is within cap', () => {
    const error = validateDepositCap(1000, 1000, 'monthly');
    expect(error).toBeNull();
  });

  it('returns error when deposit exceeds cap', () => {
    const error = validateDepositCap(2000, 1000, 'monthly');
    expect(error).not.toBeNull();
    expect(error!.message).toContain('exceeds the legal cap');
    expect(error!.message).toContain('5 weeks rent');
  });
});

describe('validateSection21Compliance', () => {
  it('returns no errors when all compliance requirements met', () => {
    const facts = {
      deposit_taken: true,
      deposit_protected: true,
      prescribed_info_served: true,
      deposit_amount: 1000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      epc_served: true,
      how_to_rent_served: true,
      has_gas_appliances: true,
      gas_safety_cert_served: true,
      licensing_required: 'not_required',
    };

    const errors = validateSection21Compliance(facts);
    expect(errors).toHaveLength(0);
  });

  it('returns error when deposit not protected', () => {
    const facts = {
      deposit_taken: true,
      deposit_protected: false,
      epc_served: true,
      how_to_rent_served: true,
    };

    const errors = validateSection21Compliance(facts);
    expect(errors.some(e => e.field === 'deposit_protected')).toBe(true);
  });

  it('returns error when EPC not served', () => {
    const facts = {
      epc_served: false,
      how_to_rent_served: true,
    };

    const errors = validateSection21Compliance(facts);
    expect(errors.some(e => e.field === 'epc_served')).toBe(true);
  });

  it('returns error when How to Rent not served', () => {
    const facts = {
      epc_served: true,
      how_to_rent_served: false,
    };

    const errors = validateSection21Compliance(facts);
    expect(errors.some(e => e.field === 'how_to_rent_served')).toBe(true);
  });

  it('only checks gas cert if property has gas appliances', () => {
    const factsWithoutGas = {
      has_gas_appliances: false,
      gas_safety_cert_served: false,
      epc_served: true,
      how_to_rent_served: true,
    };

    const errors = validateSection21Compliance(factsWithoutGas);
    expect(errors.some(e => e.field === 'gas_safety_cert_served')).toBe(false);

    const factsWithGas = {
      has_gas_appliances: true,
      gas_safety_cert_served: false,
      epc_served: true,
      how_to_rent_served: true,
    };

    const errorsWithGas = validateSection21Compliance(factsWithGas);
    expect(errorsWithGas.some(e => e.field === 'gas_safety_cert_served')).toBe(true);
  });

  it('checks licensing when required', () => {
    const facts = {
      licensing_required: 'hmo_mandatory',
      has_valid_licence: false,
      epc_served: true,
      how_to_rent_served: true,
    };

    const errors = validateSection21Compliance(facts);
    expect(errors.some(e => e.field === 'has_valid_licence')).toBe(true);
  });
});

describe('UK_PATTERNS', () => {
  describe('POSTCODE', () => {
    const valid = ['SW1A 1AA', 'M1 1AA', 'LS28 7PW', 'EH1 1BB', 'B1 1AA', 'W1A 0AX'];
    const invalid = ['12345', 'INVALID', 'A1', 'ABC 123'];

    valid.forEach(postcode => {
      it(`accepts valid postcode: ${postcode}`, () => {
        expect(UK_PATTERNS.POSTCODE.test(postcode)).toBe(true);
      });
    });

    invalid.forEach(postcode => {
      it(`rejects invalid postcode: ${postcode}`, () => {
        expect(UK_PATTERNS.POSTCODE.test(postcode)).toBe(false);
      });
    });
  });

  describe('EMAIL', () => {
    const valid = ['test@example.com', 'user.name@domain.co.uk', 'a@b.co'];
    const invalid = ['invalid', 'test@', '@domain.com', 'test@.com'];

    valid.forEach(email => {
      it(`accepts valid email: ${email}`, () => {
        expect(UK_PATTERNS.EMAIL.test(email)).toBe(true);
      });
    });

    invalid.forEach(email => {
      it(`rejects invalid email: ${email}`, () => {
        expect(UK_PATTERNS.EMAIL.test(email)).toBe(false);
      });
    });
  });
});
