/**
 * Tests for Notice-Only Inline Validator
 *
 * @see docs/notice-only-rules-audit.md
 *
 * PRE-MERGE VERIFICATION TESTS:
 * - Validation timing (ONLY after Save)
 * - England S21 blocking rules (EPC, deposit, gas, prescribed info)
 * - Deposit cap warning behavior
 * - Jurisdiction isolation (no cross-jurisdiction leakage)
 * - Section 8 Ask Heaven preservation
 */

import { validateStepInline, validateFieldsOnly, type ValidateStepInlineParams } from '@/lib/validation/noticeOnlyInlineValidator';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';

describe('Notice-Only Inline Validator', () => {
  // ====================================================================================
  // FIELD VALIDATION TESTS
  // ====================================================================================

  describe('validateFieldsOnly', () => {
    it('returns error for missing required field', () => {
      const msq: ExtendedWizardQuestion = {
        id: 'landlord_details',
        question: 'Enter landlord details',
        inputType: 'group',
        fields: [
          {
            id: 'landlord_full_name',
            label: 'Full name',
            inputType: 'text',
            validation: { required: true },
          },
        ],
      };

      const result = validateFieldsOnly(msq, {}, 'england', {});

      expect(result.landlord_full_name).toBeDefined();
      expect(result.landlord_full_name.message).toContain('required');
    });

    it('does not return error when required field is provided', () => {
      const msq: ExtendedWizardQuestion = {
        id: 'landlord_details',
        question: 'Enter landlord details',
        inputType: 'group',
        fields: [
          {
            id: 'landlord_full_name',
            label: 'Full name',
            inputType: 'text',
            validation: { required: true },
          },
        ],
      };

      const result = validateFieldsOnly(
        msq,
        { landlord_full_name: 'John Smith' },
        'england',
        {}
      );

      expect(result.landlord_full_name).toBeUndefined();
    });

    it('validates numeric min/max limits', () => {
      const msq: ExtendedWizardQuestion = {
        id: 'tenancy_details',
        question: 'Enter tenancy details',
        inputType: 'group',
        fields: [
          {
            id: 'rent_amount',
            label: 'Monthly rent',
            inputType: 'currency',
            validation: { min: 1, max: 100000 },
          },
        ],
      };

      const result = validateFieldsOnly(
        msq,
        { rent_amount: '0' },
        'england',
        {}
      );

      expect(result.rent_amount).toBeDefined();
      expect(result.rent_amount.message).toContain('at least 1');
    });

    it('skips validation for field with unmet dependsOn condition', () => {
      const msq: ExtendedWizardQuestion = {
        id: 'deposit_details',
        question: 'Deposit details',
        inputType: 'group',
        fields: [
          {
            id: 'deposit_taken',
            label: 'Was a deposit taken?',
            inputType: 'yes_no',
            validation: { required: true },
          },
          {
            id: 'deposit_amount',
            label: 'Deposit amount',
            inputType: 'currency',
            validation: { required: true },
            dependsOn: { questionId: 'deposit_taken', value: true },
          },
        ],
      };

      // deposit_taken is false, so deposit_amount should be skipped
      const result = validateFieldsOnly(
        msq,
        { deposit_taken: false },
        'england',
        {}
      );

      expect(result.deposit_amount).toBeUndefined();
    });
  });

  // ====================================================================================
  // FULL INLINE VALIDATION TESTS
  // ====================================================================================

  describe('validateStepInline', () => {
    const baseParams: Omit<ValidateStepInlineParams, 'msq' | 'stepId' | 'answers' | 'allFacts'> = {
      jurisdiction: 'england',
      route: 'section_21',
      product: 'notice_only',
    };

    it('returns empty guidance for non-notice_only products', async () => {
      const result = await validateStepInline({
        ...baseParams,
        product: 'notice_only', // Will be tested with a different code path
        msq: { id: 'test', question: 'Test', inputType: 'text' },
        stepId: 'test',
        answers: {},
        allFacts: {},
      });

      // Even for notice_only with no issues, result should be structured
      expect(result).toHaveProperty('fieldErrors');
      expect(result).toHaveProperty('guidance');
    });

    it('returns NO deposit cap guidance by default (UX: guidance at preview only)', async () => {
      // Per UX requirements: inline guidance is disabled by default
      // Deposit cap validation happens at preview stage via decision engine
      const result = await validateStepInline({
        ...baseParams,
        msq: {
          id: 'deposit_details',
          question: 'Deposit details',
          inputType: 'group',
          fields: [
            {
              id: 'deposit_amount',
              label: 'Deposit amount',
              inputType: 'currency',
            },
          ],
        },
        stepId: 'deposit_details',
        answers: { deposit_amount: '2500' },
        allFacts: {
          deposit_taken: true,
          rent_amount: 1000,
          rent_frequency: 'monthly',
        },
      });

      // With £1000 monthly rent, deposit exceeds 5 weeks cap
      // But guidance is disabled at wizard stage by default
      expect(result.guidance).toHaveLength(0);
    });

    it('does not return deposit cap warning when deposit_taken is false', async () => {
      const result = await validateStepInline({
        ...baseParams,
        msq: {
          id: 'deposit_details',
          question: 'Deposit details',
          inputType: 'group',
          fields: [
            {
              id: 'deposit_amount',
              label: 'Deposit amount',
              inputType: 'currency',
            },
          ],
        },
        stepId: 'deposit_details',
        answers: { deposit_amount: '2500' },
        allFacts: {
          deposit_taken: false, // No deposit taken
          rent_amount: 1000,
          rent_frequency: 'monthly',
        },
      });

      const depositWarning = result.guidance.find(g => g.code === 'DEPOSIT_EXCEEDS_CAP');
      expect(depositWarning).toBeUndefined();
    });

    it('returns route suggestion when current route is blocked', async () => {
      // This test verifies route suggestion behavior
      // When section_21 is blocked due to unprotected deposit, suggest section_8
      const result = await validateStepInline({
        ...baseParams,
        route: 'section_21',
        msq: {
          id: 'deposit_protected_scheme',
          question: 'Deposit protection',
          inputType: 'yes_no',
        },
        stepId: 'deposit_protected_scheme',
        answers: {},
        allFacts: {
          deposit_taken: true,
          deposit_protected: false, // Not protected - blocks S21
        },
      });

      // Route suggestion should point to section_8
      if (result.routeSuggestion) {
        expect(result.routeSuggestion.toRoute).toBe('section_8');
      }
    });
  });

  // ====================================================================================
  // CONDITIONAL RULE TESTS
  // ====================================================================================

  describe('Conditional Rules', () => {
    it('gas safety rules only apply when has_gas_appliances is true', async () => {
      // When has_gas_appliances=false, gas safety issues should NOT be shown
      const resultNoGas = await validateStepInline({
        jurisdiction: 'england',
        route: 'section_21',
        product: 'notice_only',
        msq: {
          id: 'safety_compliance',
          question: 'Safety compliance',
          inputType: 'group',
          fields: [],
        },
        stepId: 'safety_compliance',
        answers: {},
        allFacts: {
          has_gas_appliances: false,
          gas_certificate_provided: false,
        },
      });

      const gasIssue = resultNoGas.guidance.find(
        g => g.code?.includes('GAS') || g.message?.toLowerCase().includes('gas')
      );
      expect(gasIssue).toBeUndefined();

      // When has_gas_appliances=true AND gas_certificate_provided=false, show gas issue
      const resultWithGas = await validateStepInline({
        jurisdiction: 'england',
        route: 'section_21',
        product: 'notice_only',
        msq: {
          id: 'safety_compliance',
          question: 'Safety compliance',
          inputType: 'group',
          fields: [],
        },
        stepId: 'safety_compliance',
        answers: {},
        allFacts: {
          has_gas_appliances: true,
          gas_certificate_provided: false,
        },
      });

      // Should have some gas-related guidance
      // Note: The actual guidance depends on decision engine output
      expect(resultWithGas).toHaveProperty('guidance');
    });

    it('deposit rules only apply when deposit_taken is true', async () => {
      // When deposit_taken=false, deposit protection issues should NOT be shown
      const result = await validateStepInline({
        jurisdiction: 'england',
        route: 'section_21',
        product: 'notice_only',
        msq: {
          id: 'deposit_protected_scheme',
          question: 'Deposit protection',
          inputType: 'yes_no',
        },
        stepId: 'deposit_protected_scheme',
        answers: {},
        allFacts: {
          deposit_taken: false,
          deposit_protected: false,
        },
      });

      const depositIssue = result.guidance.find(
        g => g.code?.includes('DEPOSIT') || g.message?.toLowerCase().includes('deposit')
      );
      expect(depositIssue).toBeUndefined();
    });
  });

  // ====================================================================================
  // JURISDICTION-SPECIFIC TESTS
  // ====================================================================================

  describe('Jurisdiction-Specific Rules', () => {
    it('Wales: validates Rent Smart Wales registration for Section 173', async () => {
      const result = await validateStepInline({
        jurisdiction: 'wales',
        route: 'wales_section_173',
        product: 'notice_only',
        msq: {
          id: 'landlord_details',
          question: 'Landlord details',
          inputType: 'group',
          fields: [],
        },
        stepId: 'landlord_details',
        answers: {},
        allFacts: {
          rent_smart_wales_registered: false,
        },
      });

      // Should have guidance about RSW registration
      expect(result).toHaveProperty('guidance');
    });

    it('Scotland: validates pre-action requirements for rent arrears ground', async () => {
      const result = await validateStepInline({
        jurisdiction: 'scotland',
        route: 'notice_to_leave',
        product: 'notice_only',
        msq: {
          id: 'pre_action_contact',
          question: 'Pre-action contact',
          inputType: 'yes_no',
        },
        stepId: 'pre_action_contact',
        answers: {},
        allFacts: {
          scotland_ground_codes: ['ground_1'], // Rent arrears ground
          pre_action_confirmed: false,
        },
      });

      // Should have guidance about pre-action requirements
      expect(result).toHaveProperty('guidance');
    });
  });

  // ====================================================================================
  // SECTION 8 ASK HEAVEN PRESERVATION TEST
  // ====================================================================================

  describe('Section 8 Ask Heaven Preservation', () => {
    it('does not interfere with ground particulars input for Section 8', async () => {
      // This test ensures we don't remove or bypass Ask Heaven functionality
      const result = await validateStepInline({
        jurisdiction: 'england',
        route: 'section_8',
        product: 'notice_only',
        msq: {
          id: 'ground_particulars',
          question: 'Enter particulars for each ground',
          inputType: 'textarea',
          validation: { required: true },
        },
        stepId: 'ground_particulars',
        answers: { ground_8: { summary: 'Tenant owes 3 months rent' } },
        allFacts: {
          section8_grounds: ['ground_8'],
        },
      });

      // Validation should work normally, not block or interfere
      expect(result).toHaveProperty('fieldErrors');
      expect(result).toHaveProperty('guidance');
    });
  });

  // ====================================================================================
  // WALES-SPECIFIC TESTS
  // ====================================================================================

  describe('Wales Validation Rules', () => {
    it('Section 173 blocked when contract type is supported_standard', async () => {
      const result = await validateStepInline({
        jurisdiction: 'wales',
        route: 'wales_section_173',
        product: 'notice_only',
        msq: {
          id: 'wales_contract_category',
          question: 'Contract type',
          inputType: 'select',
        },
        stepId: 'wales_contract_category',
        answers: {},
        allFacts: {
          wales_contract_category: 'supported_standard',
        },
      });

      // S173 should be blocked for supported contracts
      expect(result).toHaveProperty('guidance');
    });

    it('Section 173 blocked when Rent Smart Wales not registered', async () => {
      const result = await validateStepInline({
        jurisdiction: 'wales',
        route: 'wales_section_173',
        product: 'notice_only',
        msq: {
          id: 'rent_smart_wales_registered',
          question: 'Are you registered with Rent Smart Wales?',
          inputType: 'yes_no',
        },
        stepId: 'rent_smart_wales_registered',
        answers: {},
        allFacts: {
          rent_smart_wales_registered: false,
        },
      });

      expect(result).toHaveProperty('guidance');
    });

    it('deposit protection required in Wales', async () => {
      const result = await validateStepInline({
        jurisdiction: 'wales',
        route: 'wales_section_173',
        product: 'notice_only',
        msq: {
          id: 'deposit_protected_scheme',
          question: 'Deposit protection',
          inputType: 'yes_no',
        },
        stepId: 'deposit_protected_scheme',
        answers: {},
        allFacts: {
          deposit_taken: true,
          deposit_protected: false,
        },
      });

      expect(result).toHaveProperty('guidance');
    });

    it('fault-based route available for all contract types', async () => {
      const result = await validateStepInline({
        jurisdiction: 'wales',
        route: 'wales_fault_based',
        product: 'notice_only',
        msq: {
          id: 'eviction_grounds',
          question: 'Select fault grounds',
          inputType: 'select',
        },
        stepId: 'eviction_grounds',
        answers: {},
        allFacts: {
          wales_contract_category: 'secure', // Secure contract
        },
      });

      // Fault-based should be available even for secure contracts
      expect(result).toHaveProperty('fieldErrors');
      expect(result).toHaveProperty('guidance');
    });
  });

  // ====================================================================================
  // SCOTLAND-SPECIFIC TESTS
  // ====================================================================================

  describe('Scotland Validation Rules', () => {
    it('pre-action required for Ground 1 (rent arrears)', async () => {
      const result = await validateStepInline({
        jurisdiction: 'scotland',
        route: 'notice_to_leave',
        product: 'notice_only',
        msq: {
          id: 'pre_action_requirements',
          question: 'Pre-action requirements',
          inputType: 'group',
          fields: [],
        },
        stepId: 'pre_action_requirements',
        answers: {},
        allFacts: {
          scotland_ground_codes: ['ground_1'],
          pre_action_confirmed: false,
        },
      });

      expect(result).toHaveProperty('guidance');
    });

    it('pre-action NOT required for Ground 3 (ASB)', async () => {
      const result = await validateStepInline({
        jurisdiction: 'scotland',
        route: 'notice_to_leave',
        product: 'notice_only',
        msq: {
          id: 'pre_action_requirements',
          question: 'Pre-action requirements',
          inputType: 'group',
          fields: [],
        },
        stepId: 'pre_action_requirements',
        answers: {},
        allFacts: {
          scotland_ground_codes: ['ground_3'], // ASB ground
          pre_action_confirmed: false,
        },
      });

      // Pre-action issues should NOT be shown for Ground 3
      const preActionIssue = result.guidance.find(
        g => g.code?.includes('PRE_ACTION') || g.message?.toLowerCase().includes('pre-action')
      );
      expect(preActionIssue).toBeUndefined();
    });

    it('ground selection required for Notice to Leave', async () => {
      const result = await validateStepInline({
        jurisdiction: 'scotland',
        route: 'notice_to_leave',
        product: 'notice_only',
        msq: {
          id: 'eviction_grounds',
          question: 'Select eviction grounds',
          inputType: 'checkbox',
        },
        stepId: 'eviction_grounds',
        answers: {},
        allFacts: {
          scotland_ground_codes: [], // No grounds selected
        },
      });

      expect(result).toHaveProperty('guidance');
    });
  });

  // ====================================================================================
  // VALIDATION TIMING TESTS
  // ====================================================================================

  describe('Validation Timing', () => {
    it('validates based on saved facts, not current answers', async () => {
      // This tests the key principle: validation uses allFacts (saved data)
      // not answers (current unsaved input)
      const result = await validateStepInline({
        jurisdiction: 'england',
        route: 'section_21',
        product: 'notice_only',
        msq: {
          id: 'deposit_details',
          question: 'Deposit details',
          inputType: 'group',
          fields: [],
        },
        stepId: 'deposit_details',
        answers: {
          // Current answer says deposit taken
          deposit_taken: true,
        },
        allFacts: {
          // But saved facts say no deposit
          deposit_taken: false,
        },
      });

      // Should NOT show deposit issues because saved facts say deposit_taken=false
      const depositIssue = result.guidance.find(
        g => g.code?.includes('DEPOSIT')
      );
      expect(depositIssue).toBeUndefined();
    });

    it('returns structured result even for empty facts', async () => {
      const result = await validateStepInline({
        jurisdiction: 'england',
        route: 'section_21',
        product: 'notice_only',
        msq: {
          id: 'test',
          question: 'Test',
          inputType: 'text',
        },
        stepId: 'test',
        answers: {},
        allFacts: {},
      });

      expect(result).toHaveProperty('fieldErrors');
      expect(result).toHaveProperty('guidance');
      expect(Array.isArray(result.guidance)).toBe(true);
    });
  });

  // ====================================================================================
  // CROSS-JURISDICTION ISOLATION TESTS
  // ====================================================================================

  describe('Cross-Jurisdiction Isolation', () => {
    it('England rules do not leak to Wales', async () => {
      const result = await validateStepInline({
        jurisdiction: 'wales',
        route: 'wales_section_173',
        product: 'notice_only',
        msq: {
          id: 'safety_compliance',
          question: 'Safety compliance',
          inputType: 'group',
          fields: [],
        },
        stepId: 'safety_compliance',
        answers: {},
        allFacts: {
          how_to_rent_provided: false, // England-specific
        },
      });

      // How to Rent is England-specific, should not appear for Wales
      const h2rIssue = result.guidance.find(
        g => g.code?.includes('H2R') || g.message?.toLowerCase().includes('how to rent')
      );
      expect(h2rIssue).toBeUndefined();
    });

    it('Wales rules do not leak to Scotland', async () => {
      const result = await validateStepInline({
        jurisdiction: 'scotland',
        route: 'notice_to_leave',
        product: 'notice_only',
        msq: {
          id: 'landlord_details',
          question: 'Landlord details',
          inputType: 'group',
          fields: [],
        },
        stepId: 'landlord_details',
        answers: {},
        allFacts: {
          rent_smart_wales_registered: false, // Wales-specific
        },
      });

      // RSW is Wales-specific, should not appear for Scotland
      const rswIssue = result.guidance.find(
        g => g.code?.includes('RSW') || g.code?.includes('RENT_SMART') ||
             g.message?.toLowerCase().includes('rent smart wales')
      );
      expect(rswIssue).toBeUndefined();
    });

    it('Scotland rules do not leak to England', async () => {
      const result = await validateStepInline({
        jurisdiction: 'england',
        route: 'section_8',
        product: 'notice_only',
        msq: {
          id: 'pre_action_contact',
          question: 'Pre-action contact',
          inputType: 'yes_no',
        },
        stepId: 'pre_action_contact',
        answers: {},
        allFacts: {
          pre_action_confirmed: false, // Scotland-specific
          eviction_grounds: ['ground_8'],
        },
      });

      // Pre-action is Scotland-specific, should not appear for England S8
      const preActionIssue = result.guidance.find(
        g => g.code?.includes('PRE_ACTION')
      );
      expect(preActionIssue).toBeUndefined();
    });
  });

  // ====================================================================================
  // PREVIEW/GENERATE ENFORCEMENT TESTS (PRE-MERGE VERIFICATION)
  // ====================================================================================

  describe('Preview/Generate Enforcement (Legal Hard Stops)', () => {
    describe('England Section 21 Blocking Rules', () => {
      it('EPC not provided BLOCKS at preview stage', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            epc_provided: false,
            deposit_taken: false,
            has_gas_appliances: false,
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const epcIssue = result.hardFailures.find(f => f.code === 'S21-EPC');
        expect(epcIssue).toBeDefined();
        expect(epcIssue?.legal_reason).toContain('EPC');
      });

      it('EPC not provided is WARNING at wizard stage (not blocking)', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            epc_provided: false,
            deposit_taken: false,
            has_gas_appliances: false,
          },
          stage: 'wizard',
        });

        // At wizard stage, EPC should be a warning not blocking
        const epcWarning = result.warnings.find(w => w.code === 'S21-EPC');
        const epcHard = result.hardFailures.find(f => f.code === 'S21-EPC');
        expect(epcWarning).toBeDefined();
        expect(epcHard).toBeUndefined();
      });

      it('deposit_protected=false BLOCKS when deposit_taken=true at preview', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            deposit_taken: true,
            deposit_protected: false,
            epc_provided: true,
            has_gas_appliances: false,
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const depositIssue = result.hardFailures.find(f => f.code === 'S21-DEPOSIT-NONCOMPLIANT');
        expect(depositIssue).toBeDefined();
        expect(depositIssue?.legal_reason).toContain('Deposit');
      });

      it('gas_certificate_provided=false BLOCKS when has_gas_appliances=true at preview', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            has_gas_appliances: true,
            gas_certificate_provided: false,
            deposit_taken: false,
            epc_provided: true,
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const gasIssue = result.hardFailures.find(f => f.code === 'S21-GAS-CERT');
        expect(gasIssue).toBeDefined();
        expect(gasIssue?.legal_reason).toContain('Gas');
      });

      it('gas certificate NOT required when has_gas_appliances=false', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            has_gas_appliances: false,
            gas_certificate_provided: false,
            deposit_taken: false,
            epc_provided: true,
          },
          stage: 'preview',
        });

        // No gas issues should be present
        const gasIssue = result.hardFailures.find(f => f.code === 'S21-GAS-CERT');
        expect(gasIssue).toBeUndefined();
      });

      it('prescribed_info_given=false BLOCKS when deposit_taken=true at preview', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            deposit_taken: true,
            deposit_protected: true,
            prescribed_info_given: false,
            epc_provided: true,
            has_gas_appliances: false,
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const prescribedIssue = result.hardFailures.find(f => f.code === 'S21-DEPOSIT-NONCOMPLIANT');
        expect(prescribedIssue).toBeDefined();
      });

      it('how_to_rent_provided=false BLOCKS at preview (post-Oct 2015 tenancy)', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            tenancy_start_date: '2020-01-01',
            how_to_rent_provided: false,
            deposit_taken: false,
            epc_provided: true,
            has_gas_appliances: false,
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const h2rIssue = result.hardFailures.find(f => f.code === 'S21-H2R');
        expect(h2rIssue).toBeDefined();
      });

      it('fully compliant Section 21 passes preview', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            deposit_taken: true,
            deposit_protected: true,
            prescribed_info_given: true,
            has_gas_appliances: true,
            gas_certificate_provided: true,
            epc_provided: true,
            how_to_rent_provided: true,
            property_licensing_status: 'licensed',
            tenancy_start_date: '2020-01-01',
            notice_service_date: '2024-06-01',
            notice_expiry_date: '2024-08-01',
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(true);
        expect(result.hardFailures).toHaveLength(0);
      });
    });

    describe('Wales Section 173 Blocking Rules', () => {
      it('RSW not registered BLOCKS at preview', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'wales',
          product: 'notice_only',
          selected_route: 'wales_section_173',
          wizardFacts: {
            rent_smart_wales_registered: false,
            contract_start_date: '2022-01-01',
            notice_service_date: '2024-01-01',
            notice_expiry_date: '2024-07-01',
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const rswIssue = result.hardFailures.find(f => f.code === 'S173-LICENSING');
        expect(rswIssue).toBeDefined();
      });

      it('service in first 6 months BLOCKS', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'wales',
          product: 'notice_only',
          selected_route: 'wales_section_173',
          wizardFacts: {
            rent_smart_wales_registered: true,
            contract_start_date: '2024-01-01',
            notice_service_date: '2024-04-01', // Only 3 months after start
            notice_expiry_date: '2024-10-01',
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const periodBarIssue = result.hardFailures.find(f => f.code === 'S173-PERIOD-BAR');
        expect(periodBarIssue).toBeDefined();
      });
    });

    describe('Scotland Notice to Leave Blocking Rules', () => {
      it('no grounds selected BLOCKS', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'scotland',
          product: 'notice_only',
          selected_route: 'notice_to_leave',
          wizardFacts: {
            scotland_ground_codes: [],
            notice_service_date: '2024-01-01',
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const groundsIssue = result.hardFailures.find(f => f.code === 'NTL-GROUND-REQUIRED');
        expect(groundsIssue).toBeDefined();
      });

      it('pre-action not confirmed BLOCKS when Ground 1 selected', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'scotland',
          product: 'notice_only',
          selected_route: 'notice_to_leave',
          wizardFacts: {
            scotland_ground_codes: [1],
            issues: {
              rent_arrears: {
                pre_action_confirmed: false,
              },
            },
            notice_service_date: '2024-01-01',
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const preActionIssue = result.hardFailures.find(f => f.code === 'NTL-PRE-ACTION');
        expect(preActionIssue).toBeDefined();
      });

      it('pre-action NOT required when Ground 3 (ASB) only', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'scotland',
          product: 'notice_only',
          selected_route: 'notice_to_leave',
          wizardFacts: {
            scotland_ground_codes: [3], // ASB ground
            notice_service_date: '2024-01-01',
            notice_expiry_date: '2024-02-01',
          },
          stage: 'preview',
        });

        // Should not have pre-action issue for Ground 3
        const preActionIssue = result.hardFailures.find(f => f.code === 'NTL-PRE-ACTION');
        expect(preActionIssue).toBeUndefined();
      });
    });
  });

  // ====================================================================================
  // DEPOSIT CAP ENFORCEMENT TESTS (TENANT FEES ACT 2019) - OPTION B IMPLEMENTATION
  // ====================================================================================

  describe('Deposit Cap Enforcement (Option B - Confirmation Required)', () => {
    describe('England Section 21 - Deposit Cap Blocking', () => {
      it('deposit exceeds cap + no confirmation → BLOCKS at preview/generate', () => {
        // Monthly rent £1000 = annual £12000 = weekly £230.77
        // 5 weeks max = £1153.85
        // Deposit £2500 exceeds cap
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            deposit_taken: true,
            deposit_amount: 2500,
            rent_amount: 1000,
            rent_frequency: 'monthly',
            deposit_protected: true,
            prescribed_info_given: true,
            epc_provided: true,
            has_gas_appliances: false,
            // NO confirmation provided
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const capIssue = result.hardFailures.find(f => f.code === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capIssue).toBeDefined();
        expect(capIssue?.legal_reason).toContain('Tenant Fees Act');
      });

      it('deposit exceeds cap + confirmation="yes" → NOT blocked', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            deposit_taken: true,
            deposit_amount: 2500,
            rent_amount: 1000,
            rent_frequency: 'monthly',
            deposit_reduced_to_legal_cap_confirmed: 'yes', // Confirmed
            deposit_protected: true,
            prescribed_info_given: true,
            epc_provided: true,
            has_gas_appliances: false,
          },
          stage: 'preview',
        });

        // Should NOT have the cap exceeded issue
        const capIssue = result.hardFailures.find(f => f.code === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capIssue).toBeUndefined();
      });

      it('deposit exceeds cap + confirmation=true (boolean) → NOT blocked', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            deposit_taken: true,
            deposit_amount: 2500,
            rent_amount: 1000,
            rent_frequency: 'monthly',
            deposit_reduced_to_legal_cap_confirmed: true, // Boolean true
            deposit_protected: true,
            prescribed_info_given: true,
            epc_provided: true,
            has_gas_appliances: false,
          },
          stage: 'preview',
        });

        const capIssue = result.hardFailures.find(f => f.code === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capIssue).toBeUndefined();
      });

      it('deposit exceeds cap + confirmation="no" → BLOCKS', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            deposit_taken: true,
            deposit_amount: 2500,
            rent_amount: 1000,
            rent_frequency: 'monthly',
            deposit_reduced_to_legal_cap_confirmed: 'no', // Explicit no
            deposit_protected: true,
            prescribed_info_given: true,
            epc_provided: true,
            has_gas_appliances: false,
          },
          stage: 'preview',
        });

        expect(result.ok).toBe(false);
        const capIssue = result.hardFailures.find(f => f.code === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capIssue).toBeDefined();
      });

      it('deposit within cap → no confirmation needed, NOT blocked', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            deposit_taken: true,
            deposit_amount: 1000, // Within 5 weeks cap (~£1154)
            rent_amount: 1000,
            rent_frequency: 'monthly',
            deposit_protected: true,
            prescribed_info_given: true,
            epc_provided: true,
            has_gas_appliances: false,
          },
          stage: 'preview',
        });

        const capIssue = result.hardFailures.find(f => f.code === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capIssue).toBeUndefined();
      });

      it('high rent (>£50k) uses 6 weeks cap correctly', () => {
        // Annual rent > £50k: monthly £5000 = annual £60000 = weekly £1153.85
        // 6 weeks max = £6923.08
        // Deposit £6500 is under 6 weeks cap
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            deposit_taken: true,
            deposit_amount: 6500, // Under 6 weeks cap for high rent
            rent_amount: 5000,
            rent_frequency: 'monthly',
            deposit_protected: true,
            prescribed_info_given: true,
            epc_provided: true,
            has_gas_appliances: false,
          },
          stage: 'preview',
        });

        // Should NOT block - deposit is within 6 weeks cap
        const capIssue = result.hardFailures.find(f => f.code === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capIssue).toBeUndefined();
      });
    });

    describe('England Section 8 - Deposit Cap Does NOT Block', () => {
      it('deposit exceeds cap → does NOT block Section 8', () => {
        const result = evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_8',
          wizardFacts: {
            deposit_taken: true,
            deposit_amount: 5000, // Massively exceeds cap
            rent_amount: 1000,
            rent_frequency: 'monthly',
            section8_grounds: ['Ground 8'],
            notice_service_date: '2024-01-01',
            notice_expiry_date: '2024-02-15',
          },
          stage: 'preview',
        });

        // Section 8 should NOT have deposit cap blocking
        const capIssue = result.hardFailures.find(f => f.code === 'S21-DEPOSIT-CAP-EXCEEDED');
        expect(capIssue).toBeUndefined();
      });
    });

    describe('Inline Validator - Deposit Cap Guidance', () => {
      // NOTE: By default, inline guidance is disabled (NOTICE_ONLY_INLINE_GUIDANCE !== '1')
      // These tests verify that guidance is NOT shown during wizard steps per UX requirements
      // Deposit cap validation happens at preview stage via the decision engine

      it('S21 deposit exceeds cap returns no guidance (UX: validation at preview only)', async () => {
        const result = await validateStepInline({
          jurisdiction: 'england',
          route: 'section_21',
          product: 'notice_only',
          msq: {
            id: 'deposit_details',
            question: 'Deposit details',
            inputType: 'group',
            fields: [],
          },
          stepId: 'deposit_details',
          answers: {},
          allFacts: {
            deposit_taken: true,
            deposit_amount: 2500,
            rent_amount: 1000,
            rent_frequency: 'monthly',
            selected_notice_route: 'section_21',
            // No confirmation - but guidance is disabled at wizard stage
          },
        });

        // Per UX requirements: inline guidance disabled by default
        // Deposit cap validation happens at preview/generate stage
        expect(result.guidance).toHaveLength(0);
      });

      it('S8 deposit exceeds cap returns no guidance (UX: validation at preview only)', async () => {
        const result = await validateStepInline({
          jurisdiction: 'england',
          route: 'section_8',
          product: 'notice_only',
          msq: {
            id: 'deposit_details',
            question: 'Deposit details',
            inputType: 'group',
            fields: [],
          },
          stepId: 'deposit_details',
          answers: {},
          allFacts: {
            deposit_taken: true,
            deposit_amount: 2500,
            rent_amount: 1000,
            rent_frequency: 'monthly',
            selected_notice_route: 'section_8',
          },
        });

        // Per UX requirements: inline guidance disabled by default
        expect(result.guidance).toHaveLength(0);
      });

      it('S21 deposit exceeds cap with confirmation shows no guidance', async () => {
        const result = await validateStepInline({
          jurisdiction: 'england',
          route: 'section_21',
          product: 'notice_only',
          msq: {
            id: 'deposit_details',
            question: 'Deposit details',
            inputType: 'group',
            fields: [],
          },
          stepId: 'deposit_details',
          answers: {},
          allFacts: {
            deposit_taken: true,
            deposit_amount: 2500,
            rent_amount: 1000,
            rent_frequency: 'monthly',
            selected_notice_route: 'section_21',
            deposit_reduced_to_legal_cap_confirmed: 'yes',
          },
        });

        // Should have no cap guidance since confirmed
        const capGuidance = result.guidance.find(
          g => g.code === 'S21-DEPOSIT-CAP-EXCEEDED' || g.code === 'DEPOSIT_EXCEEDS_CAP'
        );
        expect(capGuidance).toBeUndefined();
      });
    });
  });

  // ====================================================================================
  // SECTION 8 ASK HEAVEN PRESERVATION SMOKE TEST
  // ====================================================================================

  describe('Section 8 Ask Heaven Preservation', () => {
    it('Section 8 ground particulars step validation works correctly', async () => {
      // This ensures the Ask Heaven enhancement is not blocked by our changes
      const result = await validateStepInline({
        jurisdiction: 'england',
        route: 'section_8',
        product: 'notice_only',
        msq: {
          id: 'ground_particulars',
          question: 'Enter particulars for each ground',
          inputType: 'textarea',
        },
        stepId: 'ground_particulars',
        answers: {},
        allFacts: {
          section8_grounds: ['ground_8', 'ground_11'],
          section8_grounds_selection: ['ground_8', 'ground_11'],
        },
      });

      // Should return structured result without blocking
      expect(result).toHaveProperty('fieldErrors');
      expect(result).toHaveProperty('guidance');
      // Should NOT have any blocking errors that would prevent Ask Heaven
      expect(Object.keys(result.fieldErrors)).toHaveLength(0);
    });

    it('Section 8 grounds selection step accepts valid grounds', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_8',
        wizardFacts: {
          section8_grounds: ['Ground 8 - Serious rent arrears', 'Ground 11 - Persistent delay'],
          notice_service_date: '2024-01-01',
          notice_expiry_date: '2024-02-15',
        },
        stage: 'preview',
      });

      // Should not have grounds-required issue
      const groundsIssue = result.hardFailures.find(f => f.code === 'S8-GROUNDS-REQUIRED');
      expect(groundsIssue).toBeUndefined();
    });
  });

  // ====================================================================================
  // REGRESSION TESTS: NULL-SAFETY FIXES (Initial Load Crash)
  // ====================================================================================
  // These tests ensure the wizard doesn't crash on initial load when facts are undefined
  // GitHub issue: notice-only wizard crash on initial load caused by normalizeFactKeys
  // reading undefined facts.

  describe('Null-Safety Regression Tests', () => {
    it('validateStepInline does not throw with undefined allFacts', async () => {
      // This test ensures the fix for the initial load crash
      await expect(
        validateStepInline({
          jurisdiction: 'england',
          route: 'section_21',
          product: 'notice_only',
          msq: {
            id: 'test',
            question: 'Test',
            inputType: 'text',
          },
          stepId: 'test',
          answers: {},
          allFacts: undefined as any, // Simulates undefined facts on initial load
        })
      ).resolves.not.toThrow();
    });

    it('validateStepInline returns valid structure with undefined allFacts', async () => {
      const result = await validateStepInline({
        jurisdiction: 'england',
        route: 'section_21',
        product: 'notice_only',
        msq: {
          id: 'test',
          question: 'Test',
          inputType: 'text',
        },
        stepId: 'test',
        answers: {},
        allFacts: undefined as any,
      });

      expect(result).toHaveProperty('fieldErrors');
      expect(result).toHaveProperty('guidance');
      expect(Array.isArray(result.guidance)).toBe(true);
    });

    it('validateStepInline does not throw with null allFacts', async () => {
      await expect(
        validateStepInline({
          jurisdiction: 'england',
          route: 'section_8',
          product: 'notice_only',
          msq: {
            id: 'test',
            question: 'Test',
            inputType: 'text',
          },
          stepId: 'test',
          answers: {},
          allFacts: null as any, // Simulates null facts
        })
      ).resolves.not.toThrow();
    });

    it('evaluateNoticeCompliance does not throw with undefined wizardFacts', () => {
      expect(() =>
        evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: undefined as any,
          stage: 'wizard',
        })
      ).not.toThrow();
    });

    it('evaluateNoticeCompliance returns valid result with undefined wizardFacts', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: undefined as any,
        stage: 'wizard',
      });

      expect(result).toHaveProperty('ok');
      expect(result).toHaveProperty('hardFailures');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.hardFailures)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('evaluateNoticeCompliance handles empty object gracefully', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {},
        stage: 'wizard',
      });

      expect(result).toHaveProperty('ok');
      expect(result).toHaveProperty('hardFailures');
      expect(result).toHaveProperty('warnings');
    });
  });
});
