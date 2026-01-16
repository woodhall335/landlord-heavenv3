/**
 * Section 21 Notice Only Pack - End-to-End Audit Tests
 *
 * AUDIT OBJECTIVES:
 * A) Confirm Notice Only pack for Section 21 produces 4 documents with correct templates
 * B) Confirm all critical fields map correctly from wizard answers into each PDF
 * C) Confirm no contradictions in compliance status
 *
 * Reference Scenario: Fixed-term AST, all compliance YES, Section 21 route
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { mapNoticeOnlyFacts } from '../../src/lib/case-facts/normalize';
import { calculateSection21ExpiryDate } from '../../src/lib/documents/notice-date-calculator';
import { mapWizardToSection21Data } from '../../src/lib/documents/section21-generator';
import fs from 'fs';
import path from 'path';

/**
 * REFERENCE SCENARIO (from audit requirements)
 * Use this exact data for all tests
 */
const REFERENCE_WIZARD_FACTS = {
  // Parties
  tenant_full_name: 'Sonia Shezadi',
  landlord_full_name: 'Tariq Mohammed',
  landlord_address_line1: '35 Woodhall Park Avenue',
  landlord_address_town: 'Pudsey',
  landlord_address_postcode: 'LS28 7HF',

  // Property
  property_address_line1: '16 Waterloo Road',
  property_address_town: 'Pudsey',
  property_address_postcode: 'LS28 7PW',

  // Tenancy
  tenancy_start_date: '2025-07-14',
  tenancy_type: 'Assured Shorthold Tenancy (Fixed term)',
  fixed_term: true,
  is_fixed_term: true,
  fixed_term_end_date: '2026-07-14',
  has_break_clause: false,
  rent_amount: 1000,
  rent_frequency: 'monthly',
  rent_due_day: 1,

  // Deposit & Compliance
  deposit_taken: true,
  deposit_protected: true,
  deposit_amount: 1000,
  deposit_scheme: 'DPS',
  deposit_protection_date: '2025-07-16',
  prescribed_info_given: true,

  // Document compliance (all YES)
  gas_certificate_provided: true,
  epc_provided: true,
  how_to_rent_provided: true,

  // Licensing
  hmo_license_required: false,

  // Retaliatory eviction
  no_repair_complaint: true, // served > 6 months after any repair complaint

  // Notice service
  notice_service_date: '2026-01-15',
  service_method: 'first_class_post',
  selected_notice_route: 'section_21',

  // Jurisdiction
  jurisdiction: 'england',
};

describe('Section 21 Notice Only Pack - Audit Tests', () => {
  describe('AUDIT A: Template Selection and Document List', () => {
    it('Section 21 Notice Only pack uses 4 correct templates for England', () => {
      // Template paths expected for Section 21 Notice Only pack
      const expectedTemplates = {
        notice: 'uk/england/templates/notice_only/form_6a_section21/notice.hbs',
        serviceInstructions: 'uk/england/templates/eviction/service_instructions_section_21.hbs',
        validityChecklist: 'uk/england/templates/eviction/checklist_section_21.hbs',
        complianceChecklist: 'uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs',
      };

      // Verify all expected templates exist
      for (const [name, templatePath] of Object.entries(expectedTemplates)) {
        const fullPath = path.join(process.cwd(), 'config/jurisdictions', templatePath);
        expect(fs.existsSync(fullPath), `Template ${name} should exist at ${templatePath}`).toBe(true);
      }
    });

    it('Section 21 uses dedicated compliance checklist, NOT Section 8 shared template', () => {
      // Section 21 compliance checklist path
      const section21ComplianceTemplate = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
      );

      // Section 8 shared compliance checklist path (should NOT be used for Section 21)
      const section8ComplianceTemplate = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/compliance_checklist.hbs'
      );

      // Both should exist
      expect(fs.existsSync(section21ComplianceTemplate)).toBe(true);
      expect(fs.existsSync(section8ComplianceTemplate)).toBe(true);

      // Read Section 21 template and verify it has Section 21 branding
      const section21Content = fs.readFileSync(section21ComplianceTemplate, 'utf-8');
      expect(section21Content).toContain('Section 21 Notice (No-Fault)');
      expect(section21Content).not.toContain('Section 8 Notice (Fault-Based)');
    });

    it('Section 8 compliance checklist is different from Section 21', () => {
      const section21Template = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
      );
      const section8Template = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/compliance_checklist.hbs'
      );

      // Templates should have different content
      const section21Content = fs.readFileSync(section21Template, 'utf-8');
      const section8Content = fs.readFileSync(section8Template, 'utf-8');

      // Different badge text
      expect(section21Content).toContain('Section 21 Notice (No-Fault)');
      expect(section8Content).not.toContain('Section 21 Notice (No-Fault)');
    });
  });

  describe('AUDIT B: Critical Field Mapping from Wizard Answers', () => {
    let templateData: Record<string, any>;

    beforeAll(() => {
      templateData = mapNoticeOnlyFacts(REFERENCE_WIZARD_FACTS);
    });

    it('maps property address correctly', () => {
      expect(templateData.property_address_line1).toBe('16 Waterloo Road');
      expect(templateData.property_address_town).toBe('Pudsey');
      expect(templateData.property_postcode).toBe('LS28 7PW');
      expect(templateData.property_address).toContain('16 Waterloo Road');
      expect(templateData.property_address).toContain('Pudsey');
      expect(templateData.property_address).toContain('LS28 7PW');
    });

    it('maps tenant name correctly', () => {
      expect(templateData.tenant_full_name).toBe('Sonia Shezadi');
    });

    it('maps landlord name and address correctly', () => {
      expect(templateData.landlord_full_name).toBe('Tariq Mohammed');
      expect(templateData.landlord_address).toContain('35 Woodhall Park Avenue');
      expect(templateData.landlord_address).toContain('Pudsey');
      expect(templateData.landlord_address).toContain('LS28 7HF');
    });

    it('maps tenancy start date correctly', () => {
      expect(templateData.tenancy_start_date).toBe('2025-07-14');
      expect(templateData.tenancy_start_date_formatted).toBe('14 July 2025');
    });

    it('maps notice service date correctly', () => {
      expect(templateData.service_date).toBe('2026-01-15');
      expect(templateData.service_date_formatted).toBe('15 January 2026');
    });

    it('maps fixed term end date correctly', () => {
      expect(templateData.fixed_term).toBe(true);
      expect(templateData.fixed_term_end_date).toBe('2026-07-14');
    });

    it('maps service method correctly', () => {
      expect(templateData.service_method).toBe('first_class_post');
    });

    it('maps deposit protection details correctly', () => {
      expect(templateData.deposit_taken).toBe(true);
      expect(templateData.deposit_protected).toBe(true);
      expect(templateData.deposit_amount).toBe(1000);
      expect(templateData.deposit_scheme).toBe('DPS');
      expect(templateData.deposit_protection_date).toBe('2025-07-16');
    });

    it('maps prescribed information given correctly (YES)', () => {
      expect(templateData.prescribed_info_given).toBe(true);
    });

    it('maps gas safety certificate provided correctly (YES)', () => {
      expect(templateData.gas_certificate_provided).toBe(true);
      expect(templateData.gas_cert_provided).toBe(true);
    });

    it('maps EPC provided correctly (YES)', () => {
      expect(templateData.epc_provided).toBe(true);
    });

    it('maps How to Rent provided correctly (YES)', () => {
      expect(templateData.how_to_rent_provided).toBe(true);
      expect(templateData.how_to_rent_given).toBe(true);
    });

    it('maps licensing requirement correctly (NOT REQUIRED)', () => {
      expect(templateData.hmo_license_required).toBe(false);
    });
  });

  describe('AUDIT B.2: Section 21 Expiry Date Calculation', () => {
    it('calculates Section 21 expiry date as fixed-term end date (2026-07-14)', () => {
      /**
       * Expected behavior for reference scenario:
       * - Tenancy start: 2025-07-14
       * - Fixed term end: 2026-07-14
       * - Service date: 2026-01-15
       * - No break clause
       *
       * Section 21 rules:
       * - 2 months minimum from service date = 2026-03-15
       * - But cannot expire before fixed term end (no break clause)
       * - So expiry = max(service + 2 months, fixed_term_end) = 2026-07-14
       */
      const result = calculateSection21ExpiryDate({
        service_date: '2026-01-15',
        tenancy_start_date: '2025-07-14',
        fixed_term: true,
        fixed_term_end_date: '2026-07-14',
        has_break_clause: false,
        rent_period: 'monthly',
      });

      expect(result.earliest_valid_date).toBe('2026-07-14');
      expect(result.explanation).toContain('fixed term');
    });

    it('mapNoticeOnlyFacts auto-calculates Section 21 expiry date', () => {
      const templateData = mapNoticeOnlyFacts(REFERENCE_WIZARD_FACTS);

      // Section 21 expiry should be calculated
      expect(templateData.expiry_date).toBe('2026-07-14');
      expect(templateData.earliest_possession_date).toBe('2026-07-14');
    });
  });

  describe('AUDIT B.3: Formatted Date Fields for Templates', () => {
    let templateData: Record<string, any>;

    beforeAll(() => {
      templateData = mapNoticeOnlyFacts(REFERENCE_WIZARD_FACTS);
    });

    it('service_date_formatted is in UK legal format', () => {
      expect(templateData.service_date_formatted).toBe('15 January 2026');
    });

    it('tenancy_start_date_formatted is in UK legal format', () => {
      expect(templateData.tenancy_start_date_formatted).toBe('14 July 2025');
    });

    it('display_possession_date_formatted is set for templates', () => {
      expect(templateData.display_possession_date_formatted).toBe('14 July 2026');
    });

    it('notice_expiry_date_formatted matches expected possession date', () => {
      expect(templateData.notice_expiry_date_formatted).toBe('14 July 2026');
    });

    it('all three key dates are populated (not blank)', () => {
      // Service Instructions and Validity Checklist need these dates
      expect(templateData.tenancy_start_date_formatted).toBeTruthy();
      expect(templateData.service_date_formatted).toBeTruthy();
      expect(templateData.display_possession_date_formatted).toBeTruthy();
    });
  });

  describe('AUDIT C: No Contradictions in Compliance Status', () => {
    let templateData: Record<string, any>;

    beforeAll(() => {
      templateData = mapNoticeOnlyFacts(REFERENCE_WIZARD_FACTS);
    });

    it('Prescribed Info = Yes in wizard means prescribed_info_given = true', () => {
      // Input: prescribed_info_given: true
      // Output: templateData.prescribed_info_given must be true
      expect(templateData.prescribed_info_given).toBe(true);
    });

    it('Gas Safety = Yes in wizard means gas_certificate_provided = true', () => {
      // Input: gas_certificate_provided: true
      // Output: templateData.gas_certificate_provided must be true
      expect(templateData.gas_certificate_provided).toBe(true);
      expect(templateData.compliance.gas_cert_provided).toBe(true);
    });

    it('EPC = Yes in wizard means epc_provided = true', () => {
      // Input: epc_provided: true
      // Output: templateData.epc_provided must be true
      expect(templateData.epc_provided).toBe(true);
      expect(templateData.compliance.epc_provided).toBe(true);
    });

    it('How to Rent = Yes in wizard means how_to_rent_provided = true', () => {
      // Input: how_to_rent_provided: true
      // Output: templateData.how_to_rent_provided must be true
      expect(templateData.how_to_rent_provided).toBe(true);
      expect(templateData.compliance.how_to_rent_given).toBe(true);
    });

    it('nested deposit object reflects wizard answers correctly', () => {
      expect(templateData.deposit.protected).toBe(true);
      expect(templateData.deposit.amount).toBe(1000);
      expect(templateData.deposit.scheme).toBe('DPS');
      expect(templateData.deposit.prescribed_info_given).toBe(true);
    });

    it('nested compliance object reflects wizard answers correctly', () => {
      expect(templateData.compliance.gas_cert_provided).toBe(true);
      expect(templateData.compliance.epc_provided).toBe(true);
      expect(templateData.compliance.how_to_rent_given).toBe(true);
      expect(templateData.compliance.hmo_license_required).toBe(false);
    });
  });

  describe('AUDIT: Template Content Verification', () => {
    it('Section 21 compliance checklist template has COMPLIANT status indicators', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
      );
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Should have conditional COMPLIANT rendering
      expect(content).toContain('status-pass');
      expect(content).toContain('COMPLIANT');
    });

    it('Section 21 compliance checklist uses prescribed_info_given field', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
      );
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Template should reference prescribed_info_given
      expect(content).toContain('prescribed_info_given');
    });

    it('Service Instructions template uses service_date_formatted', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/service_instructions_section_21.hbs'
      );
      const content = fs.readFileSync(templatePath, 'utf-8');

      expect(content).toContain('service_date_formatted');
    });

    it('Validity Checklist template uses all three date fields', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_21.hbs'
      );
      const content = fs.readFileSync(templatePath, 'utf-8');

      expect(content).toContain('tenancy_start_date_formatted');
      expect(content).toContain('service_date_formatted');
      expect(content).toContain('display_possession_date_formatted');
    });
  });

  describe('AUDIT: Form 6A Notice Data Mapping', () => {
    it('mapWizardToSection21Data produces correct notice data', () => {
      const section21Data = mapWizardToSection21Data(REFERENCE_WIZARD_FACTS, {
        serviceDate: '2026-01-15',
      });

      expect(section21Data.landlord_full_name).toBe('Tariq Mohammed');
      expect(section21Data.tenant_full_name).toBe('Sonia Shezadi');
      expect(section21Data.property_address).toContain('16 Waterloo Road');
      expect(section21Data.tenancy_start_date).toBe('2025-07-14');
      expect(section21Data.fixed_term).toBe(true);
      expect(section21Data.fixed_term_end_date).toBe('2026-07-14');
      expect(section21Data.deposit_protected).toBe(true);
      expect(section21Data.deposit_scheme).toBe('DPS');
    });
  });

  describe('AUDIT: Expected Outputs Verification', () => {
    let templateData: Record<string, any>;

    beforeAll(() => {
      templateData = mapNoticeOnlyFacts(REFERENCE_WIZARD_FACTS);
    });

    it('Form 6A possession date should be 14 July 2026', () => {
      // "You are required to leave … after: 14 July 2026"
      expect(templateData.notice_expiry_date).toBe('2026-07-14');
      expect(templateData.notice_expiry_date_formatted).toBe('14 July 2026');
    });

    it('Service Instructions should have Service Date = 15 January 2026', () => {
      expect(templateData.service_date_formatted).toBe('15 January 2026');
    });

    it('Service Instructions should have Possession Date = 14 July 2026', () => {
      expect(templateData.display_possession_date_formatted).toBe('14 July 2026');
    });

    it('Validity Checklist should have Tenancy Start Date = 14 July 2025', () => {
      expect(templateData.tenancy_start_date_formatted).toBe('14 July 2025');
    });

    it('Validity Checklist should have Notice Service Date = 15 January 2026', () => {
      expect(templateData.service_date_formatted).toBe('15 January 2026');
    });

    it('Validity Checklist should have Possession Date = 14 July 2026', () => {
      expect(templateData.display_possession_date_formatted).toBe('14 July 2026');
    });

    it('Compliance Checklist Prescribed Info Given = Yes (true)', () => {
      expect(templateData.prescribed_info_given).toBe(true);
    });

    it('Compliance Checklist Gas Safety = COMPLIANT (gas_certificate_provided = true)', () => {
      expect(templateData.gas_certificate_provided).toBe(true);
    });

    it('Compliance Checklist EPC = COMPLIANT (epc_provided = true)', () => {
      expect(templateData.epc_provided).toBe(true);
    });

    it('Compliance Checklist How to Rent = COMPLIANT (how_to_rent_provided = true)', () => {
      expect(templateData.how_to_rent_provided).toBe(true);
    });

    it('Compliance Checklist Deposit = COMPLIANT with correct scheme/date', () => {
      expect(templateData.deposit_protected).toBe(true);
      expect(templateData.deposit_scheme).toBe('DPS');
      expect(templateData.deposit_protection_date).toBe('2025-07-16');
    });
  });
});
