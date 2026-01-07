import { describe, it, expect } from 'vitest';
import { runRules } from '../runRules';
import { SECTION21_RULES } from '../section21.rules';
import type { RuleContext, FactValue } from '../types';

describe('Section 21 Rules', () => {
  const createFact = (
    value: unknown,
    provenance: FactValue['provenance'] = 'user_confirmed'
  ): FactValue => ({
    value,
    provenance,
    confidence: provenance === 'extracted' ? 0.8 : 1.0,
  });

  const createContext = (
    facts: Record<string, FactValue | undefined> = {},
    jurisdiction = 'england'
  ): RuleContext => ({
    jurisdiction,
    validatorKey: 'section_21',
    facts,
  });

  describe('S21-JURISDICTION', () => {
    it('should pass for England jurisdiction', () => {
      const result = runRules(SECTION21_RULES, createContext({}, 'england'));
      const jurisdictionRule = result.results.find((r) => r.id === 'S21-JURISDICTION');
      expect(jurisdictionRule?.outcome).toBe('pass');
    });

    it('should fail for non-England jurisdiction', () => {
      const result = runRules(SECTION21_RULES, createContext({}, 'wales'));
      const jurisdictionRule = result.results.find((r) => r.id === 'S21-JURISDICTION');
      expect(jurisdictionRule?.outcome).toBe('fail');
      expect(result.status).toBe('invalid');
    });
  });

  describe('S21-FORM-6A', () => {
    it('should pass when Form 6A is present', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          form_6a_present: createFact(true),
          service_date: createFact('2025-01-01'),
          expiry_date: createFact('2025-03-02'),
          signature_present: createFact(true),
          deposit_taken: createFact(false),
          gas_appliances_present: createFact(false),
          epc_provided: createFact(true),
          how_to_rent_provided: createFact(true),
          licence_required: createFact(false),
        })
      );
      const formRule = result.results.find((r) => r.id === 'S21-FORM-6A');
      expect(formRule?.outcome).toBe('pass');
    });

    it('should fail when Form 6A is not present', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          form_6a_present: createFact(false),
        })
      );
      const formRule = result.results.find((r) => r.id === 'S21-FORM-6A');
      expect(formRule?.outcome).toBe('fail');
      expect(result.status).toBe('invalid');
    });

    it('should return needs_info when Form 6A status is unknown', () => {
      const result = runRules(SECTION21_RULES, createContext({}));
      const formRule = result.results.find((r) => r.id === 'S21-FORM-6A');
      expect(formRule?.outcome).toBe('needs_info');
      expect(formRule?.missingFacts).toContain('form_6a_present');
    });
  });

  describe('S21-NOTICE-PERIOD', () => {
    it('should pass when notice period is at least 2 months', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          form_6a_present: createFact(true),
          service_date: createFact('2025-01-15'),
          expiry_date: createFact('2025-03-15'),
          signature_present: createFact(true),
          deposit_taken: createFact(false),
          gas_appliances_present: createFact(false),
          epc_provided: createFact(true),
          how_to_rent_provided: createFact(true),
          licence_required: createFact(false),
        })
      );
      const periodRule = result.results.find((r) => r.id === 'S21-NOTICE-PERIOD');
      expect(periodRule?.outcome).toBe('pass');
    });

    it('should fail when notice period is less than 2 months', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          form_6a_present: createFact(true),
          service_date: createFact('2025-01-15'),
          expiry_date: createFact('2025-02-15'), // Only 1 month
          signature_present: createFact(true),
          deposit_taken: createFact(false),
        })
      );
      const periodRule = result.results.find((r) => r.id === 'S21-NOTICE-PERIOD');
      expect(periodRule?.outcome).toBe('fail');
      expect(result.status).toBe('invalid');
    });

    it('should return needs_info when dates are missing', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          form_6a_present: createFact(true),
        })
      );
      const periodRule = result.results.find((r) => r.id === 'S21-NOTICE-PERIOD');
      expect(periodRule?.outcome).toBe('needs_info');
    });
  });

  describe('S21-SIGNATURE', () => {
    it('should pass when signature is present', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          signature_present: createFact(true),
        })
      );
      const sigRule = result.results.find((r) => r.id === 'S21-SIGNATURE');
      expect(sigRule?.outcome).toBe('pass');
    });

    it('should fail when signature is not present', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          signature_present: createFact(false),
        })
      );
      const sigRule = result.results.find((r) => r.id === 'S21-SIGNATURE');
      expect(sigRule?.outcome).toBe('fail');
    });
  });

  describe('S21-DEPOSIT-PROTECTED', () => {
    it('should pass when no deposit was taken', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          deposit_taken: createFact(false),
        })
      );
      const depositRule = result.results.find((r) => r.id === 'S21-DEPOSIT-PROTECTED');
      expect(depositRule?.outcome).toBe('pass');
    });

    it('should pass when deposit is protected', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          deposit_taken: createFact(true),
          deposit_protected: createFact(true),
        })
      );
      const depositRule = result.results.find((r) => r.id === 'S21-DEPOSIT-PROTECTED');
      expect(depositRule?.outcome).toBe('pass');
    });

    it('should fail when deposit is not protected', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          deposit_taken: createFact(true),
          deposit_protected: createFact(false),
        })
      );
      const depositRule = result.results.find((r) => r.id === 'S21-DEPOSIT-PROTECTED');
      expect(depositRule?.outcome).toBe('fail');
      expect(result.status).toBe('invalid');
    });

    it('should return needs_info when deposit status is unknown', () => {
      const result = runRules(SECTION21_RULES, createContext({}));
      const depositRule = result.results.find((r) => r.id === 'S21-DEPOSIT-PROTECTED');
      expect(depositRule?.outcome).toBe('needs_info');
    });
  });

  describe('S21-GAS-SAFETY', () => {
    it('should pass when no gas appliances', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          gas_appliances_present: createFact(false),
        })
      );
      const gasRule = result.results.find((r) => r.id === 'S21-GAS-SAFETY');
      expect(gasRule?.outcome).toBe('pass');
    });

    it('should pass when gas safety was provided', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          gas_appliances_present: createFact(true),
          gas_safety_pre_move_in: createFact(true),
        })
      );
      const gasRule = result.results.find((r) => r.id === 'S21-GAS-SAFETY');
      expect(gasRule?.outcome).toBe('pass');
    });

    it('should fail when gas safety was not provided', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          gas_appliances_present: createFact(true),
          gas_safety_pre_move_in: createFact(false),
        })
      );
      const gasRule = result.results.find((r) => r.id === 'S21-GAS-SAFETY');
      expect(gasRule?.outcome).toBe('fail');
      expect(result.status).toBe('invalid');
    });
  });

  describe('S21-EPC', () => {
    it('should pass when EPC was provided', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          epc_provided: createFact(true),
        })
      );
      const epcRule = result.results.find((r) => r.id === 'S21-EPC');
      expect(epcRule?.outcome).toBe('pass');
    });

    it('should fail when EPC was not provided', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          epc_provided: createFact(false),
        })
      );
      const epcRule = result.results.find((r) => r.id === 'S21-EPC');
      expect(epcRule?.outcome).toBe('fail');
    });
  });

  describe('S21-HOW-TO-RENT', () => {
    it('should pass when How to Rent guide was provided', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          how_to_rent_provided: createFact(true),
        })
      );
      const htrRule = result.results.find((r) => r.id === 'S21-HOW-TO-RENT');
      expect(htrRule?.outcome).toBe('pass');
    });

    it('should fail when How to Rent guide was not provided', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          how_to_rent_provided: createFact(false),
        })
      );
      const htrRule = result.results.find((r) => r.id === 'S21-HOW-TO-RENT');
      expect(htrRule?.outcome).toBe('fail');
    });
  });

  describe('S21-LICENSING', () => {
    it('should pass when licence is not required', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          licence_required: createFact(false),
        })
      );
      const licenceRule = result.results.find((r) => r.id === 'S21-LICENSING');
      expect(licenceRule?.outcome).toBe('pass');
    });

    it('should pass when licence is required and held', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          licence_required: createFact(true),
          licence_held: createFact(true),
        })
      );
      const licenceRule = result.results.find((r) => r.id === 'S21-LICENSING');
      expect(licenceRule?.outcome).toBe('pass');
    });

    it('should fail when licence is required but not held', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          licence_required: createFact(true),
          licence_held: createFact(false),
        })
      );
      const licenceRule = result.results.find((r) => r.id === 'S21-LICENSING');
      expect(licenceRule?.outcome).toBe('fail');
    });
  });

  describe('S21-RETALIATORY-EVICTION (warning)', () => {
    it('should fail (warning) when retaliatory eviction risk exists', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          retaliatory_eviction_risk: createFact(true),
        })
      );
      const retalRule = result.results.find((r) => r.id === 'S21-RETALIATORY-EVICTION');
      expect(retalRule?.outcome).toBe('fail');
      expect(retalRule?.severity).toBe('warning');
    });
  });

  describe('Full validation pass scenario', () => {
    it('should return pass status when all requirements are met', () => {
      const result = runRules(
        SECTION21_RULES,
        createContext({
          form_6a_present: createFact(true),
          service_date: createFact('2025-01-01'),
          expiry_date: createFact('2025-03-02'),
          signature_present: createFact(true),
          deposit_taken: createFact(true),
          deposit_protected: createFact(true),
          prescribed_info_served: createFact(true),
          gas_appliances_present: createFact(true),
          gas_safety_pre_move_in: createFact(true),
          epc_provided: createFact(true),
          how_to_rent_provided: createFact(true),
          licence_required: createFact(false),
          retaliatory_eviction_risk: createFact(false),
          rent_arrears_exist: createFact(false),
          property_address_present: createFact(true),
          tenant_names_present: createFact(true),
          landlord_name_present: createFact(true),
        })
      );
      expect(result.status).toBe('pass');
      expect(result.blockers.filter((b) => b.outcome === 'fail')).toHaveLength(0);
    });
  });
});
