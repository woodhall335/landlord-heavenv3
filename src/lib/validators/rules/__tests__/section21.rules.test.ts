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

  describe('S21-DEPOSIT-CAP-EXCEEDED', () => {
    describe('when no deposit taken', () => {
      it('should pass when deposit_taken is false', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(false),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
        expect(capRule?.message).toContain('No deposit taken');
      });
    });

    describe('when deposit is zero', () => {
      it('should pass when deposit amount is zero', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(0),
            rent_amount: createFact(1000),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
        expect(capRule?.message).toContain('zero');
      });
    });

    describe('5-week cap (annual rent < £50,000)', () => {
      it('should pass when deposit equals 5-week cap exactly (monthly rent £1,000)', () => {
        // Monthly rent £1,000 → weekly = £1000 * 12 / 52 = £230.769...
        // 5-week cap = £1153.846...
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1153.85), // At cap (within penny tolerance)
            rent_amount: createFact(1000),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
        expect(capRule?.message).toContain('within the legal limit');
      });

      it('should fail when deposit exceeds 5-week cap (monthly rent £1,000)', () => {
        // Monthly rent £1,000 → 5-week cap = £1153.846...
        // Deposit £1200 exceeds cap
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1200),
            rent_amount: createFact(1000),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('fail');
        expect(capRule?.message).toContain('exceeds the legal maximum');
        expect(capRule?.message).toContain('5 weeks');
        expect(capRule?.legalBasis).toContain('Tenant Fees Act 2019');
        // Note: Deposit cap is now a warning, not a blocker (doesn't automatically invalidate S21)
        expect(capRule?.severity).toBe('warning');
      });

      it('should pass when deposit is under 5-week cap (weekly rent £300)', () => {
        // Weekly rent £300 → annual = £15,600 (under £50k)
        // 5-week cap = £1500
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1500),
            rent_amount: createFact(300),
            rent_frequency: createFact('weekly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
      });

      it('should fail when deposit is 1 penny over 5-week cap (weekly rent £300)', () => {
        // Weekly rent £300 → 5-week cap = £1500
        // Deposit £1500.02 is over by 2p (>1p tolerance)
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1500.02),
            rent_amount: createFact(300),
            rent_frequency: createFact('weekly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('fail');
      });
    });

    describe('6-week cap (annual rent >= £50,000)', () => {
      it('should use 6-week cap when annual rent is exactly £50,000', () => {
        // Monthly rent = £50,000 / 12 = £4166.67
        // Weekly rent = £4166.67 * 12 / 52 = £961.538...
        // 6-week cap = £5769.23...
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(5769.23),
            rent_amount: createFact(4166.67),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
        expect(capRule?.message).toContain('6 weeks');
      });

      it('should fail when deposit exceeds 6-week cap (monthly rent £4,500)', () => {
        // Monthly rent £4,500 → annual = £54,000 (>= £50k)
        // Weekly rent = £4500 * 12 / 52 = £1038.461...
        // 6-week cap = £6230.77...
        // Deposit £7000 exceeds cap
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(7000),
            rent_amount: createFact(4500),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('fail');
        expect(capRule?.message).toContain('6 weeks');
        expect(capRule?.evidence).toContain('Annual rent: £54000.00');
      });

      it('should pass when deposit is under 6-week cap (monthly rent £4,500)', () => {
        // 6-week cap = £6230.77...
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(6000),
            rent_amount: createFact(4500),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
      });
    });

    describe('different rent frequencies', () => {
      it('should handle weekly rent correctly', () => {
        // Weekly £200 → annual = £10,400 → 5-week cap = £1000
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1000),
            rent_amount: createFact(200),
            rent_frequency: createFact('weekly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
      });

      it('should handle fortnightly rent correctly', () => {
        // Fortnightly £400 → weekly = £200 → 5-week cap = £1000
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1000),
            rent_amount: createFact(400),
            rent_frequency: createFact('fortnightly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
      });

      it('should handle quarterly rent correctly', () => {
        // Quarterly £3000 → weekly = £3000 * 4 / 52 = £230.77 → 5-week cap = £1153.85
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1153),
            rent_amount: createFact(3000),
            rent_frequency: createFact('quarterly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
      });

      it('should handle yearly rent correctly', () => {
        // Yearly £12,000 → weekly = £230.77 → 5-week cap = £1153.85
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1153),
            rent_amount: createFact(12000),
            rent_frequency: createFact('yearly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
      });
    });

    describe('missing facts triggers needs_info', () => {
      it('should return needs_info when deposit_taken is unknown', () => {
        const result = runRules(SECTION21_RULES, createContext({}));
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('needs_info');
        expect(capRule?.missingFacts).toContain('deposit_taken');
      });

      it('should return needs_info when deposit amount is missing', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            rent_amount: createFact(1000),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('needs_info');
        expect(capRule?.missingFacts).toContain('deposit_amount');
      });

      it('should return needs_info when rent amount is missing', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1000),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('needs_info');
        expect(capRule?.missingFacts).toContain('rent_amount');
      });

      it('should return needs_info when rent frequency is missing', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1000),
            rent_amount: createFact(1000),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('needs_info');
        expect(capRule?.missingFacts).toContain('rent_frequency');
      });

      it('should list all missing facts when multiple are missing', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('needs_info');
        expect(capRule?.missingFacts).toContain('deposit_amount');
        expect(capRule?.missingFacts).toContain('rent_amount');
        expect(capRule?.missingFacts).toContain('rent_frequency');
      });
    });

    describe('float precision tolerance', () => {
      it('should pass when deposit is exactly at cap', () => {
        // Weekly £300 → 5-week cap = £1500.00
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1500.00),
            rent_amount: createFact(300),
            rent_frequency: createFact('weekly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
      });

      it('should pass when deposit is 1 penny under cap', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1499.99),
            rent_amount: createFact(300),
            rent_frequency: createFact('weekly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
      });

      it('should pass when deposit is within 1 penny tolerance over cap', () => {
        // 1 penny tolerance means deposit at cap + 0.01 should still pass
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1500.01),
            rent_amount: createFact(300),
            rent_frequency: createFact('weekly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('pass');
      });

      it('should fail when deposit is 2 pennies over cap (exceeds tolerance)', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1500.02),
            rent_amount: createFact(300),
            rent_frequency: createFact('weekly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('fail');
      });
    });

    describe('evidence and calculations in output', () => {
      it('should include detailed evidence when deposit exceeds cap', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(2000),
            rent_amount: createFact(1000),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.evidence).toBeDefined();
        expect(capRule?.evidence).toContain('Deposit: £2000.00');
        expect(capRule?.evidence?.some((e) => e.startsWith('Weekly rent:'))).toBe(true);
        expect(capRule?.evidence?.some((e) => e.startsWith('Annual rent:'))).toBe(true);
        expect(capRule?.evidence?.some((e) => e.startsWith('Maximum allowed:'))).toBe(true);
        expect(capRule?.evidence?.some((e) => e.startsWith('Excess amount:'))).toBe(true);
      });

      it('should include evidence when deposit is within cap', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1000),
            rent_amount: createFact(1000),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.evidence).toBeDefined();
        expect(capRule?.evidence?.length).toBeGreaterThanOrEqual(4);
      });
    });

    describe('invalid rent amount', () => {
      it('should return needs_info when rent amount is zero', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1000),
            rent_amount: createFact(0),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('needs_info');
        expect(capRule?.message).toContain('greater than zero');
      });

      it('should return needs_info when rent amount is negative', () => {
        const result = runRules(
          SECTION21_RULES,
          createContext({
            deposit_taken: createFact(true),
            deposit_amount: createFact(1000),
            rent_amount: createFact(-500),
            rent_frequency: createFact('monthly'),
          })
        );
        const capRule = result.results.find((r) => r.id === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capRule?.outcome).toBe('needs_info');
      });
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
          deposit_amount: createFact(1000),
          rent_amount: createFact(1000),
          rent_frequency: createFact('monthly'),
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
          tenancy_status_known: createFact(true),
        })
      );
      expect(result.status).toBe('pass');
      expect(result.blockers.filter((b) => b.outcome === 'fail')).toHaveLength(0);
    });
  });
});
