import { describe, it, expect } from 'vitest';
import { getRequirements, ValidationContext } from '../../src/lib/jurisdictions/requirements';
import { validateRequirements } from '../../src/lib/jurisdictions/requirementsValidator';
import { getCapabilityMatrix } from '../../src/lib/jurisdictions/capabilities/matrix';

describe('Requirements Engine', () => {
  const matrix = getCapabilityMatrix();

  describe('Fail-closed behavior', () => {
    it('should fail-closed for unsupported jurisdiction/product', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'northern-ireland',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: {},
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('unsupported');
      expect(result.statusReason).toContain('not supported');
    });

    it('should fail-closed for unsupported route', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'invalid_route',
        stage: 'preview',
        facts: {},
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('unsupported');
      expect(result.statusReason).toContain('not available');
    });
  });

  describe('England notice_only section_21 requirements', () => {
    it('should require deposit facts only when deposit_taken=true at generate stage', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          deposit_taken: true,
          landlord_full_name: 'Test Landlord',
          tenant_full_name: 'Test Tenant',
        },
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.has('deposit_amount')).toBe(true);
      expect(result.requiredNow.has('deposit_protected')).toBe(true);
      expect(result.requiredNow.has('prescribed_info_given')).toBe(true);
    });

    it('should NOT require deposit facts when deposit_taken=false', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          deposit_taken: false,
          landlord_full_name: 'Test Landlord',
          tenant_full_name: 'Test Tenant',
        },
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.has('deposit_amount')).toBe(false);
      expect(result.requiredNow.has('deposit_protected')).toBe(false);
      expect(result.derived.has('deposit_amount')).toBe(true);
      expect(result.derived.has('deposit_protected')).toBe(true);
    });

    it('should warn about deposit facts at preview stage when deposit_taken=true', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: {
          deposit_taken: true,
        },
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      // Preview should warn, not block
      expect(result.warnNow.has('deposit_protected') || result.warnNow.has('deposit_amount')).toBe(true);
    });

    it('should require gas safety facts only when has_gas_appliances=true', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          has_gas_appliances: true,
          deposit_taken: false,
        },
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.has('gas_safety_cert_date')).toBe(true);
    });

    it('should NOT require gas safety when has_gas_appliances=false', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          has_gas_appliances: false,
          deposit_taken: false,
        },
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.has('gas_safety_cert_date')).toBe(false);
      expect(result.derived.has('gas_safety_cert_date')).toBe(true);
    });
  });

  describe('England notice_only section_8 requirements', () => {
    it('should require grounds at generate stage', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        stage: 'generate',
        facts: {},
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.has('ground_codes')).toBe(true);
    });

    it('should NOT block on deposit for section_8', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        stage: 'generate',
        facts: {
          deposit_taken: true,
        },
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      // Deposit is warned but not required for S8
      expect(result.requiredNow.has('deposit_protected')).toBe(false);
      expect(result.warnNow.has('deposit_protected')).toBe(true);
    });
  });

  describe('Scotland notice_to_leave requirements', () => {
    it('should require grounds and notice_expiry_date at generate', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'scotland',
        product: 'notice_only',
        route: 'notice_to_leave',
        stage: 'generate',
        facts: {},
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.has('ground_codes')).toBe(true);
      expect(result.requiredNow.has('notice_expiry_date')).toBe(true);
    });
  });

  describe('Money claim requirements', () => {
    it('should require claim details at generate stage', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'money_claim',
        route: 'money_claim',
        stage: 'generate',
        facts: {},
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.has('claim_type')).toBe(true);
      expect(result.requiredNow.has('total_claim_amount')).toBe(true);
    });
  });

  describe('Tenancy agreement requirements', () => {
    it('should require core facts at generate stage', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'tenancy_agreement',
        route: 'tenancy_agreement',
        stage: 'generate',
        facts: {},
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.has('landlord_full_name')).toBe(true);
      expect(result.requiredNow.has('tenant_full_name')).toBe(true);
      expect(result.requiredNow.has('tenancy_type')).toBe(true);
    });

    it('should require deposit_amount when deposit_taken=true', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'tenancy_agreement',
        route: 'tenancy_agreement',
        stage: 'generate',
        facts: {
          deposit_taken: true,
        },
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.has('deposit_amount')).toBe(true);
    });
  });

  describe('Stage-aware behavior', () => {
    it('should warn at wizard stage, not block', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'wizard',
        facts: {},
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      // At wizard stage, facts are warnings not requirements
      expect(result.requiredNow.size).toBe(0);
      expect(result.warnNow.size).toBeGreaterThan(0);
    });

    it('should require at checkpoint stage', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'checkpoint',
        facts: {},
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.size).toBeGreaterThan(0);
    });

    it('should strictly require at generate stage', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {},
      };

      const result = getRequirements(ctx);
      expect(result.status).toBe('ok');
      expect(result.requiredNow.size).toBeGreaterThan(0);
    });
  });

  describe('Requirements Validator', () => {
    it('should generate blocking issues for missing required facts at generate stage', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          deposit_taken: false, // Don't require deposit facts
        },
      };

      const validation = validateRequirements(ctx);
      expect(validation.status).toBe('invalid'); // Missing required core facts
      expect(validation.blocking_issues.length).toBeGreaterThan(0);
    });

    it('should not block when all required facts are provided', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          deposit_taken: false,
          has_gas_appliances: false,
          is_fixed_term: false,
          landlord_full_name: 'Test Landlord',
          landlord_address_line1: '123 Test St',
          landlord_city: 'London',
          landlord_postcode: 'SW1A 1AA',
          tenant_full_name: 'Test Tenant',
          property_address_line1: '456 Property St',
          property_city: 'London',
          property_postcode: 'SW1A 2BB',
          tenancy_start_date: '2023-01-01',
          rent_amount: 1000,
          rent_frequency: 'monthly',
          notice_expiry_date: '2024-03-01',
        },
      };

      const validation = validateRequirements(ctx);
      expect(validation.status).toBe('ok');
      expect(validation.blocking_issues.length).toBe(0);
    });

    it('should return 422 payload for unsupported flows', () => {
      const ctx: ValidationContext = {
        jurisdiction: 'northern-ireland',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {},
      };

      const validation = validateRequirements(ctx);
      expect(validation.status).toBe('unsupported');
      expect(validation.blocking_issues[0]?.code).toBe('FLOW_NOT_SUPPORTED');
    });
  });
});
