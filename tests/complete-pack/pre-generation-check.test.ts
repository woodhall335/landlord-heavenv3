/**
 * Pre-Generation Consistency Check Tests
 *
 * Tests rule-based and LLM-based consistency validation
 * for complete_pack document generation.
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  runRuleBasedChecks,
  runPreGenerationCheck,
  type WizardFactsFlat,
} from '../../src/lib/validation/pre-generation-check';

describe('Pre-Generation Consistency Check', () => {
  describe('runRuleBasedChecks', () => {
    describe('Common Checks', () => {
      it('returns blocker for missing landlord name', () => {
        const facts: WizardFactsFlat = {
          tenant_full_name: 'John Tenant',
          property_address_line1: '123 Test St',
          tenancy_start_date: '2024-01-01',
          notice_served_date: '2024-06-01',
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8'],
          section8_details: 'Rent arrears details',
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'MISSING_LANDLORD_NAME');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns blocker for missing tenant name', () => {
        const facts: WizardFactsFlat = {
          landlord_full_name: 'Jane Landlord',
          property_address_line1: '123 Test St',
          tenancy_start_date: '2024-01-01',
          notice_served_date: '2024-06-01',
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8'],
          section8_details: 'Rent arrears details',
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'MISSING_TENANT_NAME');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns blocker for missing property address', () => {
        const facts: WizardFactsFlat = {
          landlord_full_name: 'Jane Landlord',
          tenant_full_name: 'John Tenant',
          tenancy_start_date: '2024-01-01',
          notice_served_date: '2024-06-01',
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8'],
          section8_details: 'Rent arrears details',
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'MISSING_PROPERTY_ADDRESS');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns blocker for missing tenancy start date', () => {
        const facts: WizardFactsFlat = {
          landlord_full_name: 'Jane Landlord',
          tenant_full_name: 'John Tenant',
          property_address_line1: '123 Test St',
          notice_served_date: '2024-06-01',
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8'],
          section8_details: 'Rent arrears details',
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'MISSING_TENANCY_START_DATE');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns blocker for missing notice service date', () => {
        const facts: WizardFactsFlat = {
          landlord_full_name: 'Jane Landlord',
          tenant_full_name: 'John Tenant',
          property_address_line1: '123 Test St',
          tenancy_start_date: '2024-01-01',
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8'],
          section8_details: 'Rent arrears details',
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'MISSING_NOTICE_SERVICE_DATE');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });
    });

    describe('Timeline Consistency Checks', () => {
      it('returns blocker for future tenancy start date', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const futureDateStr = futureDate.toISOString().split('T')[0];

        const facts: WizardFactsFlat = {
          landlord_full_name: 'Jane Landlord',
          tenant_full_name: 'John Tenant',
          property_address_line1: '123 Test St',
          tenancy_start_date: futureDateStr,
          notice_served_date: '2024-06-01',
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8'],
          section8_details: 'Details',
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'FUTURE_TENANCY_START');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns blocker when notice served before tenancy started', () => {
        const facts: WizardFactsFlat = {
          landlord_full_name: 'Jane Landlord',
          tenant_full_name: 'John Tenant',
          property_address_line1: '123 Test St',
          tenancy_start_date: '2024-06-01',
          notice_served_date: '2024-01-01', // Before tenancy start
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8'],
          section8_details: 'Details',
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'NOTICE_BEFORE_TENANCY');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns blocker when expiry is before service date', () => {
        const facts: WizardFactsFlat = {
          landlord_full_name: 'Jane Landlord',
          tenant_full_name: 'John Tenant',
          property_address_line1: '123 Test St',
          tenancy_start_date: '2024-01-01',
          notice_served_date: '2024-06-01',
          notice_expiry_date: '2024-05-01', // Before service date
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8'],
          section8_details: 'Details',
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'EXPIRY_BEFORE_SERVICE');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });
    });

    describe('Section 8 Specific Checks', () => {
      const baseSection8Facts: WizardFactsFlat = {
        landlord_full_name: 'Jane Landlord',
        tenant_full_name: 'John Tenant',
        property_address_line1: '123 Test St',
        tenancy_start_date: '2024-01-01',
        notice_served_date: '2024-06-01',
        selected_notice_route: 'section_8',
      };

      it('returns blocker when no grounds selected', () => {
        const facts: WizardFactsFlat = {
          ...baseSection8Facts,
          section8_details: 'Some details',
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'S8_NO_GROUNDS');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns blocker when no particulars provided', () => {
        const facts: WizardFactsFlat = {
          ...baseSection8Facts,
          section8_grounds: ['Ground 8'],
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'S8_NO_PARTICULARS');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns blocker for Ground 8 without arrears data', () => {
        const facts: WizardFactsFlat = {
          ...baseSection8Facts,
          section8_grounds: ['Ground 8 - 8+ weeks rent arrears'],
          section8_details: 'Some details',
          has_rent_arrears: false,
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'S8_ARREARS_GROUND_NO_DATA');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns warning for Ground 14 without ASB details', () => {
        const facts: WizardFactsFlat = {
          ...baseSection8Facts,
          section8_grounds: ['Ground 14 - Nuisance or annoyance'],
          // NOTE: Deliberately NOT providing section8_details or has_asb=true
          // to trigger the warning. This also triggers S8_NO_PARTICULARS blocker.
          has_asb: false,
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const warning = issues.find(i => i.code === 'S8_ASB_GROUND_NO_DATA');

        expect(warning).toBeDefined();
        expect(warning?.severity).toBe('warning');
      });

      it('passes with valid Section 8 data including arrears', () => {
        const facts: WizardFactsFlat = {
          ...baseSection8Facts,
          section8_grounds: ['Ground 8'],
          section8_details: 'Rent arrears of £3200',
          has_rent_arrears: true,
          total_arrears: 3200,
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blockers = issues.filter(i => i.severity === 'blocker');

        expect(blockers.length).toBe(0);
      });
    });

    describe('Section 21 Specific Checks', () => {
      const baseSection21Facts: WizardFactsFlat = {
        landlord_full_name: 'Jane Landlord',
        tenant_full_name: 'John Tenant',
        property_address_line1: '123 Test St',
        tenancy_start_date: '2024-01-01',
        notice_served_date: '2024-06-01',
        selected_notice_route: 'section_21',
      };

      it('returns blocker when deposit taken but not protected', () => {
        const facts: WizardFactsFlat = {
          ...baseSection21Facts,
          deposit_taken: true,
          deposit_amount: 1500,
          deposit_protected: false,
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'S21_DEPOSIT_NOT_PROTECTED');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns blocker when prescribed info not served', () => {
        const facts: WizardFactsFlat = {
          ...baseSection21Facts,
          deposit_taken: true,
          deposit_amount: 1500,
          deposit_protected: true,
          prescribed_info_served: false,
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'S21_PRESCRIBED_INFO_MISSING');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns blocker for How to Rent missing on post-2015 tenancy', () => {
        const facts: WizardFactsFlat = {
          ...baseSection21Facts,
          tenancy_start_date: '2020-01-01', // Post Oct 2015
          how_to_rent_served: false,
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'S21_HOW_TO_RENT_MISSING');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('does not require How to Rent for pre-2015 tenancy', () => {
        const facts: WizardFactsFlat = {
          ...baseSection21Facts,
          tenancy_start_date: '2014-01-01', // Pre Oct 2015
          how_to_rent_served: false,
          // Need to satisfy deposit requirements to avoid other blockers
          deposit_taken: false,
          epc_provided: true,
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const howToRentBlocker = issues.find(i => i.code === 'S21_HOW_TO_RENT_MISSING');

        expect(howToRentBlocker).toBeUndefined();
      });

      it('returns blocker for retaliatory eviction risk', () => {
        const facts: WizardFactsFlat = {
          ...baseSection21Facts,
          recent_repair_complaints: true,
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blocker = issues.find(i => i.code === 'S21_RETALIATORY_EVICTION_RISK');

        expect(blocker).toBeDefined();
        expect(blocker?.severity).toBe('blocker');
      });

      it('returns warning for missing deposit details', () => {
        const facts: WizardFactsFlat = {
          ...baseSection21Facts,
          deposit_taken: true,
          deposit_protected: true,
          prescribed_info_served: true,
          // Missing deposit_amount, deposit_protection_date, deposit_scheme_name
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const warnings = issues.filter(i =>
          ['S21_MISSING_DEPOSIT_AMOUNT', 'S21_MISSING_DEPOSIT_DATE', 'S21_MISSING_DEPOSIT_SCHEME'].includes(i.code)
        );

        expect(warnings.length).toBe(3);
        warnings.forEach(w => expect(w.severity).toBe('warning'));
      });

      it('passes with valid Section 21 data', () => {
        const facts: WizardFactsFlat = {
          ...baseSection21Facts,
          tenancy_start_date: '2020-01-01',
          deposit_taken: true,
          deposit_amount: 1500,
          deposit_protected: true,
          deposit_protection_date: '2020-01-15',
          deposit_scheme_name: 'DPS',
          prescribed_info_served: true,
          how_to_rent_served: true,
          epc_provided: true,
          no_retaliatory_notice: true,
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const blockers = issues.filter(i => i.severity === 'blocker');

        expect(blockers.length).toBe(0);
      });
    });

    describe('Contradiction Checks', () => {
      it('returns warning when arrears amount provided but has_arrears is false', () => {
        const facts: WizardFactsFlat = {
          landlord_full_name: 'Jane Landlord',
          tenant_full_name: 'John Tenant',
          property_address_line1: '123 Test St',
          tenancy_start_date: '2024-01-01',
          notice_served_date: '2024-06-01',
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 12'],
          section8_details: 'Breach details',
          has_rent_arrears: false,
          total_arrears: 3000, // Contradiction
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const warning = issues.find(i => i.code === 'ARREARS_CONTRADICTION');

        expect(warning).toBeDefined();
        expect(warning?.severity).toBe('warning');
      });

      it('returns warning when has_arrears true but no amount', () => {
        const facts: WizardFactsFlat = {
          landlord_full_name: 'Jane Landlord',
          tenant_full_name: 'John Tenant',
          property_address_line1: '123 Test St',
          tenancy_start_date: '2024-01-01',
          notice_served_date: '2024-06-01',
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 12'],
          section8_details: 'Breach details',
          has_rent_arrears: true,
          // Missing total_arrears
        };

        const issues = runRuleBasedChecks(facts, 'complete_pack');
        const warning = issues.find(i => i.code === 'ARREARS_AMOUNT_MISSING');

        expect(warning).toBeDefined();
        expect(warning?.severity).toBe('warning');
      });
    });

    describe('Non-complete_pack Products', () => {
      it('returns no issues for notice_only product', () => {
        const facts: WizardFactsFlat = {
          // Missing everything that would trigger blockers for complete_pack
        };

        const issues = runRuleBasedChecks(facts, 'notice_only');

        expect(issues.length).toBe(0);
      });

      it('returns no issues for money_claim product', () => {
        const facts: WizardFactsFlat = {};

        const issues = runRuleBasedChecks(facts, 'money_claim');

        expect(issues.length).toBe(0);
      });
    });
  });

  describe('runPreGenerationCheck', () => {
    beforeEach(() => {
      // Ensure LLM check is disabled for tests
      vi.stubEnv('ENABLE_LLM_CONSISTENCY_CHECK', 'false');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('returns passed=true with no blockers for valid Section 8 data', async () => {
      const facts: WizardFactsFlat = {
        landlord_full_name: 'Jane Landlord',
        tenant_full_name: 'John Tenant',
        property_address_line1: '123 Test St',
        tenancy_start_date: '2024-01-01',
        notice_served_date: '2024-06-01',
        selected_notice_route: 'section_8',
        section8_grounds: ['Ground 8'],
        section8_details: 'Rent arrears details',
        has_rent_arrears: true,
        total_arrears: 3200,
      };

      const result = await runPreGenerationCheck(facts, 'complete_pack');

      expect(result.passed).toBe(true);
      expect(result.blockers.length).toBe(0);
      expect(result.llm_check_ran).toBe(false);
    });

    it('returns passed=false with blockers for invalid data', async () => {
      const facts: WizardFactsFlat = {
        // Missing required fields
        selected_notice_route: 'section_8',
      };

      const result = await runPreGenerationCheck(facts, 'complete_pack');

      expect(result.passed).toBe(false);
      expect(result.blockers.length).toBeGreaterThan(0);
    });

    it('separates blockers from warnings', async () => {
      const facts: WizardFactsFlat = {
        landlord_full_name: 'Jane Landlord',
        tenant_full_name: 'John Tenant',
        property_address_line1: '123 Test St',
        tenancy_start_date: '2024-01-01',
        notice_served_date: '2024-06-01',
        selected_notice_route: 'section_8',
        section8_grounds: ['Ground 12'], // Breach ground (not arrears)
        section8_details: 'Breach details provided',
        // Contradiction: has_rent_arrears is false but total_arrears has a value
        // This triggers ARREARS_CONTRADICTION warning but not a blocker
        has_rent_arrears: false,
        total_arrears: 500,
      };

      const result = await runPreGenerationCheck(facts, 'complete_pack');

      expect(result.passed).toBe(true); // Warnings don't block
      expect(result.warnings.some(w => w.code === 'ARREARS_CONTRADICTION')).toBe(true);
    });
  });
});
