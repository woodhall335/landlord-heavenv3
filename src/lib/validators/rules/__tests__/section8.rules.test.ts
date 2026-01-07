import { describe, it, expect } from 'vitest';
import { runRules } from '../runRules';
import { SECTION8_RULES } from '../section8.rules';
import type { RuleContext, FactValue } from '../types';

describe('Section 8 Rules', () => {
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
    validatorKey: 'section_8',
    facts,
  });

  describe('S8-JURISDICTION', () => {
    it('should pass for England jurisdiction', () => {
      const result = runRules(SECTION8_RULES, createContext({}, 'england'));
      const jurisdictionRule = result.results.find((r) => r.id === 'S8-JURISDICTION');
      expect(jurisdictionRule?.outcome).toBe('pass');
    });

    it('should fail for non-England jurisdiction', () => {
      const result = runRules(SECTION8_RULES, createContext({}, 'scotland'));
      const jurisdictionRule = result.results.find((r) => r.id === 'S8-JURISDICTION');
      expect(jurisdictionRule?.outcome).toBe('fail');
      expect(result.status).toBe('invalid');
    });
  });

  describe('S8-FORM-3', () => {
    it('should pass when Form 3 is present', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          form_3_present: createFact(true),
          grounds_cited: createFact([8]),
        })
      );
      const formRule = result.results.find((r) => r.id === 'S8-FORM-3');
      expect(formRule?.outcome).toBe('pass');
    });

    it('should fail when Form 3 is not present', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          form_3_present: createFact(false),
        })
      );
      const formRule = result.results.find((r) => r.id === 'S8-FORM-3');
      expect(formRule?.outcome).toBe('fail');
      expect(result.status).toBe('invalid');
    });

    it('should return needs_info when Form 3 status is unknown', () => {
      const result = runRules(SECTION8_RULES, createContext({}));
      const formRule = result.results.find((r) => r.id === 'S8-FORM-3');
      expect(formRule?.outcome).toBe('needs_info');
    });
  });

  describe('S8-GROUNDS-CITED', () => {
    it('should pass when at least one ground is cited', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          grounds_cited: createFact([8, 10]),
        })
      );
      const groundsRule = result.results.find((r) => r.id === 'S8-GROUNDS-CITED');
      expect(groundsRule?.outcome).toBe('pass');
    });

    it('should return needs_info when no grounds are cited', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          grounds_cited: createFact([]),
        })
      );
      const groundsRule = result.results.find((r) => r.id === 'S8-GROUNDS-CITED');
      expect(groundsRule?.outcome).toBe('needs_info');
    });
  });

  describe('S8-GROUND-8-THRESHOLD', () => {
    it('should pass when Ground 8 threshold is met (monthly rent)', () => {
      // Monthly rent of £1000, arrears of £2000+ (2 months threshold)
      const result = runRules(
        SECTION8_RULES,
        createContext({
          form_3_present: createFact(true),
          grounds_cited: createFact([8]),
          rent_amount: createFact(1000),
          rent_frequency: createFact('monthly'),
          arrears_amount: createFact(2500),
          service_date: createFact('2025-01-01'),
        })
      );
      const g8Rule = result.results.find((r) => r.id === 'S8-GROUND-8-THRESHOLD');
      expect(g8Rule?.outcome).toBe('pass');
      expect(g8Rule?.message).toContain('threshold IS met');
    });

    it('should fail when Ground 8 threshold is not met', () => {
      // Monthly rent of £1000, arrears of £1500 (less than 2 months threshold)
      const result = runRules(
        SECTION8_RULES,
        createContext({
          form_3_present: createFact(true),
          grounds_cited: createFact([8]),
          rent_amount: createFact(1000),
          rent_frequency: createFact('monthly'),
          arrears_amount: createFact(1500),
          service_date: createFact('2025-01-01'),
        })
      );
      const g8Rule = result.results.find((r) => r.id === 'S8-GROUND-8-THRESHOLD');
      expect(g8Rule?.outcome).toBe('fail');
      expect(g8Rule?.message).toContain('threshold NOT met');
    });

    it('should pass when Ground 8 threshold is met (weekly rent)', () => {
      // Weekly rent of £200, arrears of £1600+ (8 weeks threshold)
      const result = runRules(
        SECTION8_RULES,
        createContext({
          form_3_present: createFact(true),
          grounds_cited: createFact([8]),
          rent_amount: createFact(200),
          rent_frequency: createFact('weekly'),
          arrears_amount: createFact(1800),
          service_date: createFact('2025-01-01'),
        })
      );
      const g8Rule = result.results.find((r) => r.id === 'S8-GROUND-8-THRESHOLD');
      expect(g8Rule?.outcome).toBe('pass');
    });

    it('should return needs_info when rent details are missing', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          form_3_present: createFact(true),
          grounds_cited: createFact([8]),
          service_date: createFact('2025-01-01'),
        })
      );
      const g8Rule = result.results.find((r) => r.id === 'S8-GROUND-8-THRESHOLD');
      expect(g8Rule?.outcome).toBe('needs_info');
      expect(g8Rule?.missingFacts).toBeDefined();
    });

    it('should not apply when Ground 8 is not cited', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          form_3_present: createFact(true),
          grounds_cited: createFact([10, 11]), // Discretionary grounds only
          service_date: createFact('2025-01-01'),
        })
      );
      const g8Rule = result.results.find((r) => r.id === 'S8-GROUND-8-THRESHOLD');
      // Rule should not be in results since it doesn't apply
      expect(g8Rule).toBeUndefined();
    });
  });

  describe('S8-BENEFIT-DELAYS (warning)', () => {
    it('should fail (warning) when benefit delays exist', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          benefit_delays: createFact(true),
        })
      );
      const benefitRule = result.results.find((r) => r.id === 'S8-BENEFIT-DELAYS');
      expect(benefitRule?.outcome).toBe('fail');
      expect(benefitRule?.severity).toBe('warning');
    });

    it('should pass when no benefit delays', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          benefit_delays: createFact(false),
        })
      );
      const benefitRule = result.results.find((r) => r.id === 'S8-BENEFIT-DELAYS');
      expect(benefitRule?.outcome).toBe('pass');
    });
  });

  describe('S8-DISREPAIR (warning)', () => {
    it('should fail (warning) when disrepair counterclaims exist', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          disrepair_counterclaims: createFact(true),
        })
      );
      const disrepairRule = result.results.find((r) => r.id === 'S8-DISREPAIR');
      expect(disrepairRule?.outcome).toBe('fail');
      expect(disrepairRule?.severity).toBe('warning');
    });
  });

  describe('S8-PAYMENTS-SINCE (warning, only when Ground 8 cited)', () => {
    it('should fail (warning) when payments made since notice for Ground 8', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          grounds_cited: createFact([8]),
          payment_since_notice: createFact(true),
        })
      );
      const paymentRule = result.results.find((r) => r.id === 'S8-PAYMENTS-SINCE');
      expect(paymentRule?.outcome).toBe('fail');
      expect(paymentRule?.severity).toBe('warning');
    });

    it('should not apply when Ground 8 is not cited', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          grounds_cited: createFact([10]),
          payment_since_notice: createFact(true),
        })
      );
      const paymentRule = result.results.find((r) => r.id === 'S8-PAYMENTS-SINCE');
      expect(paymentRule).toBeUndefined();
    });
  });

  describe('S8-GROUND-TYPE (info)', () => {
    it('should identify mandatory grounds', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          grounds_cited: createFact([8]),
        })
      );
      const typeRule = result.results.find((r) => r.id === 'S8-GROUND-TYPE');
      expect(typeRule?.outcome).toBe('pass');
      expect(typeRule?.message).toContain('MANDATORY');
    });

    it('should identify discretionary grounds', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          grounds_cited: createFact([10, 11]),
        })
      );
      const typeRule = result.results.find((r) => r.id === 'S8-GROUND-TYPE');
      expect(typeRule?.outcome).toBe('pass');
      expect(typeRule?.message).toContain('DISCRETIONARY');
    });

    it('should identify mixed grounds', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          grounds_cited: createFact([8, 10]),
        })
      );
      const typeRule = result.results.find((r) => r.id === 'S8-GROUND-TYPE');
      expect(typeRule?.outcome).toBe('pass');
      expect(typeRule?.message).toContain('Mix');
    });
  });

  describe('Full validation scenario', () => {
    it('should return pass status when all requirements met and Ground 8 satisfied', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          form_3_present: createFact(true),
          grounds_cited: createFact([8]),
          service_date: createFact('2025-01-01'),
          rent_amount: createFact(1000),
          rent_frequency: createFact('monthly'),
          arrears_amount: createFact(2500),
          benefit_delays: createFact(false),
          disrepair_counterclaims: createFact(false),
          payment_since_notice: createFact(false),
          property_address_present: createFact(true),
          tenant_names_present: createFact(true),
        })
      );
      expect(result.status).toBe('pass');
      expect(result.blockers.filter((b) => b.outcome === 'fail')).toHaveLength(0);
    });

    it('should return warning status when Ground 8 not satisfied but form is valid', () => {
      const result = runRules(
        SECTION8_RULES,
        createContext({
          form_3_present: createFact(true),
          grounds_cited: createFact([8]),
          service_date: createFact('2025-01-01'),
          rent_amount: createFact(1000),
          rent_frequency: createFact('monthly'),
          arrears_amount: createFact(1500), // Below threshold
          benefit_delays: createFact(false),
          disrepair_counterclaims: createFact(false),
          payment_since_notice: createFact(false),
        })
      );
      // Form is valid but Ground 8 fails - this is a blocker
      expect(result.status).toBe('invalid');
    });
  });
});
