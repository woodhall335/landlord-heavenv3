/**
 * Section 21 England - End-to-End Fixture Tests
 *
 * These tests verify that:
 * 1. Valid fixtures generate Form 6A successfully via Notice Only generator
 * 2. Invalid fixtures are blocked with correct S21_* error codes
 * 3. complete_pack and notice_only use the same Form 6A generator
 *
 * Part of the Jan 2026 Section 21 Audit
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

// Generators
import {
  generateSection21Notice,
  mapWizardToSection21Data,
  generateSection21Form6A,
  FORM_6A_TEMPLATE_PATH,
  isCanonicalForm6APath,
} from '@/lib/documents/section21-generator';

// Validators
import {
  validateSection21Preconditions,
  assertSection21Preconditions,
} from '@/lib/validators/section21-preconditions';

// Types
import type { Section21PreconditionInput } from '@/lib/validators/section21-preconditions';

// =============================================================================
// FIXTURE LOADING
// =============================================================================

const FIXTURES_DIR = path.join(process.cwd(), 'tests/fixtures/section21');
const OUTPUT_DIR = path.join(process.cwd(), 'tests/output/section21');

interface Section21Fixture {
  case_id: string;
  jurisdiction: string;
  product: string;
  eviction_route: string;
  flat_facts: Record<string, any>;
  expected_error_code?: string;
  expected_blocker?: {
    code: string;
    message: string;
    legalBasis?: string;
  };
}

async function loadFixture(filename: string): Promise<Section21Fixture> {
  const filePath = path.join(FIXTURES_DIR, filename);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

// =============================================================================
// FIXTURE TESTS
// =============================================================================

describe('Section 21 Fixture E2E Tests', () => {
  beforeAll(async () => {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  });

  describe('Valid Case Fixtures', () => {
    it('england.section21.valid.case.json generates Form 6A successfully', async () => {
      const fixture = await loadFixture('england.section21.valid.case.json');
      const facts = fixture.flat_facts;

      // Build precondition input
      const input: Section21PreconditionInput = {
        deposit_taken: facts.deposit_taken,
        deposit_amount: facts.deposit_amount,
        deposit_protected: facts.deposit_protected,
        prescribed_info_served: facts.prescribed_info_served,
        has_gas_appliances: facts.has_gas_appliances,
        gas_safety_cert_served: facts.gas_safety_cert_served,
        epc_served: facts.epc_served,
        epc_rating: facts.epc_rating,
        how_to_rent_served: facts.how_to_rent_served,
        licensing_required: facts.licensing_required,
        has_valid_licence: facts.has_valid_licence,
        no_retaliatory_notice: facts.no_retaliatory_notice,
        tenancy_start_date: facts.tenancy_start_date,
        service_date: facts.notice_served_date,
      };

      // Validate preconditions
      const validation = validateSection21Preconditions(input);
      expect(validation.blockers).toHaveLength(0);
      expect(validation.canProceed).toBe(true);

      // Generate Form 6A via canonical entry point
      const result = await generateSection21Form6A({
        caseFacts: facts,
        jurisdiction: fixture.jurisdiction,
        isPreview: true,
      });

      expect(result).toBeDefined();
      expect(result.html).toContain('FORM NO. 6A');
      expect(result.html).toContain(facts.landlord_full_name);
      expect(result.html).toContain(facts.tenant_full_name);
      expect(result.pdf).toBeDefined();

      // Save output for manual inspection
      if (result.pdf) {
        await fs.writeFile(
          path.join(OUTPUT_DIR, 'fixture_valid_form6a.pdf'),
          result.pdf
        );
      }
    }, 60000);

    it('valid case passes assertSection21Preconditions without throwing', async () => {
      const fixture = await loadFixture('england.section21.valid.case.json');
      const facts = fixture.flat_facts;

      const input: Section21PreconditionInput = {
        deposit_taken: facts.deposit_taken,
        deposit_protected: facts.deposit_protected,
        prescribed_info_served: facts.prescribed_info_served,
        has_gas_appliances: facts.has_gas_appliances,
        gas_safety_cert_served: facts.gas_safety_cert_served,
        epc_served: facts.epc_served,
        how_to_rent_served: facts.how_to_rent_served,
        licensing_required: facts.licensing_required,
        no_retaliatory_notice: facts.no_retaliatory_notice,
        tenancy_start_date: facts.tenancy_start_date,
        service_date: facts.notice_served_date,
      };

      // Should not throw
      expect(() => assertSection21Preconditions(input)).not.toThrow();
    });
  });

  describe('Invalid Deposit Case', () => {
    it('blocks generation with S21_DEPOSIT_NOT_PROTECTED', async () => {
      const fixture = await loadFixture('england.section21.invalid-deposit.case.json');
      const facts = fixture.flat_facts;

      const input: Section21PreconditionInput = {
        deposit_taken: facts.deposit_taken,
        deposit_protected: facts.deposit_protected,
        has_gas_appliances: facts.has_gas_appliances,
        gas_safety_cert_served: facts.gas_safety_cert_served,
        epc_served: facts.epc_served,
        how_to_rent_served: facts.how_to_rent_served,
        licensing_required: facts.licensing_required,
        no_retaliatory_notice: facts.no_retaliatory_notice,
        tenancy_start_date: facts.tenancy_start_date,
        service_date: facts.notice_served_date,
      };

      const validation = validateSection21Preconditions(input);

      expect(validation.canProceed).toBe(false);
      expect(validation.blockers.length).toBeGreaterThan(0);

      // Check for expected error code
      const depositBlocker = validation.blockers.find(
        b => b.code === fixture.expected_error_code
      );
      expect(depositBlocker).toBeDefined();
    });

    it('assertSection21Preconditions throws for invalid deposit', async () => {
      const fixture = await loadFixture('england.section21.invalid-deposit.case.json');
      const facts = fixture.flat_facts;

      const input: Section21PreconditionInput = {
        deposit_taken: facts.deposit_taken,
        deposit_protected: facts.deposit_protected,
        has_gas_appliances: facts.has_gas_appliances,
        gas_safety_cert_served: facts.gas_safety_cert_served,
        epc_served: facts.epc_served,
        how_to_rent_served: facts.how_to_rent_served,
        licensing_required: facts.licensing_required,
        no_retaliatory_notice: facts.no_retaliatory_notice,
        tenancy_start_date: facts.tenancy_start_date,
        service_date: facts.notice_served_date,
      };

      expect(() => assertSection21Preconditions(input)).toThrow();
    });
  });

  describe('Invalid Gas Safety Case', () => {
    it('blocks generation with S21_GAS_SAFETY_NOT_SERVED', async () => {
      const fixture = await loadFixture('england.section21.invalid-gas.case.json');
      const facts = fixture.flat_facts;

      const input: Section21PreconditionInput = {
        deposit_taken: facts.deposit_taken,
        deposit_protected: facts.deposit_protected,
        prescribed_info_served: facts.prescribed_info_served,
        has_gas_appliances: facts.has_gas_appliances,
        gas_safety_cert_served: facts.gas_safety_cert_served,
        epc_served: facts.epc_served,
        how_to_rent_served: facts.how_to_rent_served,
        licensing_required: facts.licensing_required,
        no_retaliatory_notice: facts.no_retaliatory_notice,
        tenancy_start_date: facts.tenancy_start_date,
        service_date: facts.notice_served_date,
      };

      const validation = validateSection21Preconditions(input);

      expect(validation.canProceed).toBe(false);
      expect(validation.blockers.length).toBeGreaterThan(0);

      // Check for expected error code
      const gasBlocker = validation.blockers.find(
        b => b.code === fixture.expected_error_code
      );
      expect(gasBlocker).toBeDefined();
    });

    it('assertSection21Preconditions throws for missing gas cert', async () => {
      const fixture = await loadFixture('england.section21.invalid-gas.case.json');
      const facts = fixture.flat_facts;

      const input: Section21PreconditionInput = {
        deposit_taken: facts.deposit_taken,
        deposit_protected: facts.deposit_protected,
        prescribed_info_served: facts.prescribed_info_served,
        has_gas_appliances: facts.has_gas_appliances,
        gas_safety_cert_served: facts.gas_safety_cert_served,
        epc_served: facts.epc_served,
        how_to_rent_served: facts.how_to_rent_served,
        licensing_required: facts.licensing_required,
        no_retaliatory_notice: facts.no_retaliatory_notice,
        tenancy_start_date: facts.tenancy_start_date,
        service_date: facts.notice_served_date,
      };

      expect(() => assertSection21Preconditions(input)).toThrow();
    });
  });

  describe('Invalid Licence Case', () => {
    it('blocks generation with S21_LICENCE_MISSING', async () => {
      const fixture = await loadFixture('england.section21.invalid-licence.case.json');
      const facts = fixture.flat_facts;

      const input: Section21PreconditionInput = {
        deposit_taken: facts.deposit_taken,
        deposit_protected: facts.deposit_protected,
        prescribed_info_served: facts.prescribed_info_served,
        has_gas_appliances: facts.has_gas_appliances,
        gas_safety_cert_served: facts.gas_safety_cert_served,
        epc_served: facts.epc_served,
        how_to_rent_served: facts.how_to_rent_served,
        licensing_required: facts.licensing_required,
        has_valid_licence: facts.has_valid_licence,
        no_retaliatory_notice: facts.no_retaliatory_notice,
        tenancy_start_date: facts.tenancy_start_date,
        service_date: facts.notice_served_date,
      };

      const validation = validateSection21Preconditions(input);

      expect(validation.canProceed).toBe(false);
      expect(validation.blockers.length).toBeGreaterThan(0);

      // Check for expected error code
      const licenceBlocker = validation.blockers.find(
        b => b.code === fixture.expected_error_code
      );
      expect(licenceBlocker).toBeDefined();
    });
  });

  describe('Retaliatory Eviction Case', () => {
    it('blocks generation with S21_RETALIATORY_EVICTION_BAR', async () => {
      const fixture = await loadFixture('england.section21.retaliatory.case.json');
      const facts = fixture.flat_facts;

      const input: Section21PreconditionInput = {
        deposit_taken: facts.deposit_taken,
        deposit_protected: facts.deposit_protected,
        prescribed_info_served: facts.prescribed_info_served,
        has_gas_appliances: facts.has_gas_appliances,
        gas_safety_cert_served: facts.gas_safety_cert_served,
        epc_served: facts.epc_served,
        how_to_rent_served: facts.how_to_rent_served,
        licensing_required: facts.licensing_required,
        no_retaliatory_notice: facts.no_retaliatory_notice,
        improvement_notice_served: facts.improvement_notice_served,
        tenancy_start_date: facts.tenancy_start_date,
        service_date: facts.notice_served_date,
      };

      const validation = validateSection21Preconditions(input);

      expect(validation.canProceed).toBe(false);
      expect(validation.blockers.length).toBeGreaterThan(0);

      // Check for expected error code
      const retaliatoryBlocker = validation.blockers.find(
        b => b.code === fixture.expected_error_code
      );
      expect(retaliatoryBlocker).toBeDefined();
    });
  });

  describe('Cross-Flow Consistency', () => {
    /**
     * CRITICAL: Verifies that complete_pack and notice_only use the same
     * Form 6A template path. If these diverge, the audit fails.
     */
    it('FORM_6A_TEMPLATE_PATH is in notice_only directory', () => {
      expect(FORM_6A_TEMPLATE_PATH).toContain('notice_only');
    });

    it('isCanonicalForm6APath validates correctly', () => {
      // The canonical path
      expect(isCanonicalForm6APath(FORM_6A_TEMPLATE_PATH)).toBe(true);

      // Paths that would indicate a duplicate (should fail)
      expect(
        isCanonicalForm6APath('uk/england/templates/complete_pack/form_6a.hbs')
      ).toBe(false);
      expect(
        isCanonicalForm6APath('uk/england/templates/eviction/form_6a.hbs')
      ).toBe(false);
    });

    it('generateSection21Notice and generateSection21Form6A use same template', async () => {
      const fixture = await loadFixture('england.section21.valid.case.json');
      const facts = fixture.flat_facts;

      // Via canonical entry point
      const form6aResult = await generateSection21Form6A({
        caseFacts: facts,
        jurisdiction: 'england',
        isPreview: true,
      });

      // Via direct function
      const s21Data = mapWizardToSection21Data(facts);
      const directResult = await generateSection21Notice(s21Data, true);

      // Both should produce the same Form 6A markers
      expect(form6aResult.html).toContain('FORM NO. 6A');
      expect(directResult.html).toContain('FORM NO. 6A');
      expect(form6aResult.html).toContain('Housing Act 1988');
      expect(directResult.html).toContain('Housing Act 1988');

      // Both should contain the same landlord/tenant info
      expect(form6aResult.html).toContain(facts.landlord_full_name);
      expect(directResult.html).toContain(facts.landlord_full_name);
    }, 60000);
  });

  describe('Error Code Coverage', () => {
    /**
     * Verify that all expected S21_* error codes are properly defined
     * in the preconditions validator.
     */
    it('produces S21_ prefixed error codes for all blockers', async () => {
      const fixtures = [
        'england.section21.invalid-deposit.case.json',
        'england.section21.invalid-gas.case.json',
        'england.section21.invalid-licence.case.json',
        'england.section21.retaliatory.case.json',
      ];

      for (const filename of fixtures) {
        const fixture = await loadFixture(filename);
        const facts = fixture.flat_facts;

        const input: Section21PreconditionInput = {
          deposit_taken: facts.deposit_taken,
          deposit_protected: facts.deposit_protected,
          prescribed_info_served: facts.prescribed_info_served,
          has_gas_appliances: facts.has_gas_appliances,
          gas_safety_cert_served: facts.gas_safety_cert_served,
          epc_served: facts.epc_served,
          how_to_rent_served: facts.how_to_rent_served,
          licensing_required: facts.licensing_required,
          has_valid_licence: facts.has_valid_licence,
          no_retaliatory_notice: facts.no_retaliatory_notice,
          improvement_notice_served: facts.improvement_notice_served,
          tenancy_start_date: facts.tenancy_start_date,
          service_date: facts.notice_served_date,
        };

        const validation = validateSection21Preconditions(input);

        // All error codes should start with S21_
        for (const blocker of validation.blockers) {
          expect(blocker.code).toMatch(/^S21_/);
        }
      }
    });
  });
});
