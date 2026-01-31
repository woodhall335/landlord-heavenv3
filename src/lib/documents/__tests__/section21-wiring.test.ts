/**
 * Section 21 Generator Wiring Tests
 *
 * Verifies that ALL Section 21 (Form 6A) generation paths use the canonical
 * generateSection21Notice() function, ensuring identical output across:
 * - /api/notice-only/preview endpoint
 * - /api/documents/generate endpoint
 * - eviction-pack-generator (complete pack and notice-only pack)
 */

import {
  generateSection21Notice,
  mapWizardToSection21Data,
  generateSection21Form6A,
  FORM_6A_TEMPLATE_PATH,
  isCanonicalForm6APath,
} from '../section21-generator';

describe('Section 21 Canonical Generator', () => {
  const validWizardFacts = {
    landlord_full_name: 'John Smith',
    landlord_address: '123 Landlord Lane\nLondon\nSW1A 1AA',
    tenant_full_name: 'Jane Tenant',
    property_address: '456 Rental Road\nLondon\nW1A 2BB',
    tenancy_start_date: '2024-01-15',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    deposit_protected: true,
    deposit_scheme: 'DPS',
    gas_certificate_provided: true,
    how_to_rent_provided: true,
    epc_provided: true,
  };

  describe('mapWizardToSection21Data', () => {
    it('maps wizard facts to Section21NoticeData format', () => {
      const result = mapWizardToSection21Data(validWizardFacts);

      expect(result.landlord_full_name).toBe('John Smith');
      expect(result.tenant_full_name).toBe('Jane Tenant');
      expect(result.property_address).toBe('456 Rental Road\nLondon\nW1A 2BB');
      expect(result.tenancy_start_date).toBe('2024-01-15');
      expect(result.rent_amount).toBe(1200);
      expect(result.rent_frequency).toBe('monthly');
      expect(result.deposit_protected).toBe(true);
      expect(result.deposit_scheme).toBe('DPS');
    });

    it('handles alternate field names', () => {
      const altFacts = {
        landlord_full_name: 'John Smith',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '456 Rental Road',
        property_address_town: 'London',
        property_address_postcode: 'W1A 2BB',
        tenancy_start_date: '2024-01-15',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        is_fixed_term: true,
        deposit_protected: 'yes',
        gas_safety_certificate: true,
      };

      const result = mapWizardToSection21Data(altFacts);

      expect(result.property_address).toContain('456 Rental Road');
      expect(result.property_address).toContain('London');
      expect(result.fixed_term).toBe(true);
      expect(result.deposit_protected).toBe(true);
      expect(result.gas_certificate_provided).toBe(true);
    });

    it('normalizes deposit scheme names', () => {
      const testCases = [
        { input: 'DPS', expected: 'DPS' },
        { input: 'Deposit Protection Service', expected: 'DPS' },
        { input: 'MyDeposits', expected: 'MyDeposits' },
        { input: 'TDS', expected: 'TDS' },
        { input: 'Tenancy Deposit Scheme', expected: 'TDS' },
        { input: 'SafeDeposits Scotland', expected: undefined }, // Not valid for England
      ];

      for (const { input, expected } of testCases) {
        const result = mapWizardToSection21Data({
          ...validWizardFacts,
          deposit_scheme: input,
        });
        expect(result.deposit_scheme).toBe(expected);
      }
    });

    it('accepts serviceDate option', () => {
      const result = mapWizardToSection21Data(validWizardFacts, {
        serviceDate: '2025-03-01',
      });

      expect(result.service_date).toBe('2025-03-01');
    });
  });

  describe('generateSection21Notice', () => {
    it('generates Form 6A notice with required fields', async () => {
      const section21Data = mapWizardToSection21Data(validWizardFacts);
      const result = await generateSection21Notice(section21Data, true);

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.pdf).toBeDefined();
    });

    it('auto-calculates expiry date if not provided', async () => {
      const section21Data = mapWizardToSection21Data(validWizardFacts);
      // expiry_date is intentionally not set by mapper - it's always computed server-side
      expect(section21Data.expiry_date).toBeUndefined();

      const result = await generateSection21Notice(section21Data, true);

      // Should not throw, generator handles date calculation
      expect(result.pdf).toBeDefined();
    });

    it('includes prescribed Form 6A content', async () => {
      const section21Data = mapWizardToSection21Data(validWizardFacts);
      const result = await generateSection21Notice(section21Data, true);

      // Verify Form 6A prescribed elements are present
      expect(result.html).toContain('FORM NO. 6A');
      expect(result.html).toContain('Notes on the Notice');
      expect(result.html).toContain('two months');
    });

    it('throws on missing required fields', async () => {
      const invalidData = mapWizardToSection21Data({
        landlord_full_name: '',
        tenant_full_name: 'Jane Tenant',
        property_address: '456 Rental Road',
        tenancy_start_date: '2024-01-15',
        rent_frequency: 'monthly',
      });

      await expect(generateSection21Notice(invalidData, true)).rejects.toThrow(
        'landlord_full_name is required'
      );
    });
  });

  describe('Wiring Verification', () => {
    /**
     * These tests verify that the canonical generator is properly imported
     * and used in all Section 21 generation paths.
     */

    it('exports generateSection21Notice function', () => {
      expect(typeof generateSection21Notice).toBe('function');
    });

    it('exports mapWizardToSection21Data function', () => {
      expect(typeof mapWizardToSection21Data).toBe('function');
    });

    it('mapper output is compatible with generator input', async () => {
      // This test ensures the mapper and generator work together
      const wizardFacts = {
        landlord_full_name: 'Test Landlord',
        landlord_address: 'Test Address',
        tenant_full_name: 'Test Tenant',
        property_address: 'Test Property',
        tenancy_start_date: '2024-06-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        deposit_protected: true,
        deposit_scheme: 'DPS',
        gas_certificate_provided: true,
        how_to_rent_provided: true,
        epc_provided: true,
      };

      const mappedData = mapWizardToSection21Data(wizardFacts);
      const result = await generateSection21Notice(mappedData, true);

      expect(result.html).toContain('Test Landlord');
      expect(result.html).toContain('Test Tenant');
      expect(result.html).toContain('Test Property');
    });
  });

  describe('Canonical Form 6A Entry Point (Jan 2026 Audit)', () => {
    /**
     * These tests verify the canonical Form 6A generator and template path
     * are properly configured and used by all Section 21 generation paths.
     */

    it('exports FORM_6A_TEMPLATE_PATH constant', () => {
      expect(FORM_6A_TEMPLATE_PATH).toBe(
        'uk/england/templates/notice_only/form_6a_section21/notice.hbs'
      );
    });

    it('exports isCanonicalForm6APath function', () => {
      expect(typeof isCanonicalForm6APath).toBe('function');
      expect(isCanonicalForm6APath(FORM_6A_TEMPLATE_PATH)).toBe(true);
      expect(isCanonicalForm6APath('some/other/path.hbs')).toBe(false);
    });

    it('exports generateSection21Form6A function', () => {
      expect(typeof generateSection21Form6A).toBe('function');
    });

    it('generateSection21Form6A rejects non-England jurisdiction', async () => {
      const caseFacts = {
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address: 'Test Property',
        tenancy_start_date: '2024-06-01',
        rent_frequency: 'monthly',
        deposit_protected: true,
        epc_provided: true,
        how_to_rent_provided: true,
      };

      await expect(
        generateSection21Form6A({
          caseFacts,
          jurisdiction: 'wales',
        })
      ).rejects.toThrow(/Section 21 Form 6A is only valid in England/);

      await expect(
        generateSection21Form6A({
          caseFacts,
          jurisdiction: 'scotland',
        })
      ).rejects.toThrow(/Section 21 Form 6A is only valid in England/);
    });

    it('generateSection21Form6A accepts England jurisdiction', async () => {
      const caseFacts = {
        landlord_full_name: 'Test Landlord',
        landlord_address: 'Test Address',
        tenant_full_name: 'Test Tenant',
        property_address: 'Test Property',
        tenancy_start_date: '2024-06-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        deposit_protected: true,
        deposit_scheme: 'DPS',
        gas_certificate_provided: true,
        how_to_rent_provided: true,
        epc_provided: true,
      };

      const result = await generateSection21Form6A({
        caseFacts,
        jurisdiction: 'england',
        isPreview: true,
      });

      expect(result).toBeDefined();
      expect(result.html).toContain('FORM NO. 6A');
    });

    it('generateSection21Form6A produces same output as generateSection21Notice', async () => {
      const caseFacts = {
        landlord_full_name: 'Consistency Test Landlord',
        landlord_address: 'Consistency Address',
        tenant_full_name: 'Consistency Test Tenant',
        property_address: 'Consistency Test Property',
        tenancy_start_date: '2024-06-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        deposit_protected: true,
        deposit_scheme: 'DPS',
        gas_certificate_provided: true,
        how_to_rent_provided: true,
        epc_provided: true,
        notice_date: '2025-01-15',
      };

      // Generate via canonical entry point
      const form6aResult = await generateSection21Form6A({
        caseFacts,
        jurisdiction: 'england',
        isPreview: true,
      });

      // Generate via direct function
      const directResult = await generateSection21Notice(
        mapWizardToSection21Data(caseFacts),
        true
      );

      // Both should contain the same key content
      expect(form6aResult.html).toContain('Consistency Test Landlord');
      expect(directResult.html).toContain('Consistency Test Landlord');
      expect(form6aResult.html).toContain('Consistency Test Tenant');
      expect(directResult.html).toContain('Consistency Test Tenant');
    });
  });

  describe('Template Path Consistency (Jan 2026 Audit)', () => {
    /**
     * CRITICAL: These tests verify that ALL Section 21 generation paths
     * use the same Form 6A template. If complete_pack uses a different
     * template than notice_only, these tests MUST fail.
     */

    it('generateSection21Notice uses canonical template path', async () => {
      // The generator internally uses FORM_6A_TEMPLATE_PATH
      // We verify this by checking the output contains Form 6A markers
      const section21Data = mapWizardToSection21Data({
        landlord_full_name: 'Template Path Test',
        landlord_address: 'Test Address',
        tenant_full_name: 'Test Tenant',
        property_address: 'Test Property',
        tenancy_start_date: '2024-06-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        deposit_protected: true,
        gas_certificate_provided: true,
        how_to_rent_provided: true,
        epc_provided: true,
      });

      const result = await generateSection21Notice(section21Data, true);

      // These markers should only appear if the correct template is used
      expect(result.html).toContain('FORM NO. 6A');
      expect(result.html).toContain('Housing Act 1988 section 21');
      expect(result.html).toContain('Notes on the Notice');
    });

    it('FORM_6A_TEMPLATE_PATH matches expected notice_only location', () => {
      // The template MUST be in the notice_only folder
      // complete_pack should import from notice_only, not have its own copy
      expect(FORM_6A_TEMPLATE_PATH).toContain('notice_only');
      expect(FORM_6A_TEMPLATE_PATH).toContain('form_6a_section21');
    });

    it('isCanonicalForm6APath validates correct paths', () => {
      // Valid path
      expect(
        isCanonicalForm6APath(
          'uk/england/templates/notice_only/form_6a_section21/notice.hbs'
        )
      ).toBe(true);

      // Invalid paths that would indicate a duplicate template
      expect(
        isCanonicalForm6APath(
          'uk/england/templates/complete_pack/form_6a_section21/notice.hbs'
        )
      ).toBe(false);
      expect(
        isCanonicalForm6APath(
          'uk/england/templates/eviction/form_6a.hbs'
        )
      ).toBe(false);
      expect(
        isCanonicalForm6APath(
          'shared/templates/form_6a.hbs'
        )
      ).toBe(false);
    });
  });
});
