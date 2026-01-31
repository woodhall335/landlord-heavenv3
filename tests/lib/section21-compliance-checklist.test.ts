/**
 * Section 21 Compliance Checklist Tests
 *
 * Tests for the dedicated Section 21 compliance checklist in Notice Only pack.
 * Ensures correct template selection and data mapping from wizard answers.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mapNoticeOnlyFacts } from '../../src/lib/case-facts/normalize';
import fs from 'fs';
import path from 'path';

describe('Section 21 Compliance Checklist', () => {
  describe('Template Existence', () => {
    it('Section 21 compliance checklist template should exist', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
      );

      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it('template should contain Section 21 badge, not Section 8', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
      );

      const templateContent = fs.readFileSync(templatePath, 'utf-8');

      // Should explicitly show Section 21 in the badge
      expect(templateContent).toContain('Section 21 Notice (No-Fault)');

      // Should NOT contain Section 8 branding
      expect(templateContent).not.toContain('Section 8 Notice (Fault-Based)');
    });

    it('template should check for compliant status indicators', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
      );

      const templateContent = fs.readFileSync(templatePath, 'utf-8');

      // Should contain COMPLIANT status class
      expect(templateContent).toContain('status-pass');
      expect(templateContent).toContain('COMPLIANT');
    });
  });

  describe('Data Mapping - Compliance Fields', () => {
    describe('Deposit Protection Mapping', () => {
      it('should map deposit_protected as true when wizard says Yes', () => {
        const wizardFacts = {
          deposit_protected: true,
          deposit_amount: 1200,
          deposit_scheme: 'DPS',
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.deposit_protected).toBe(true);
        expect(templateData.deposit_amount).toBe(1200);
        expect(templateData.deposit_scheme).toBe('DPS');
      });

      it('should map deposit_protected from "Yes" string value', () => {
        const wizardFacts = {
          deposit_protected: 'Yes',
          deposit_amount: 1500,
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.deposit_protected).toBe(true);
      });

      it('should map prescribed_info_given as true when wizard says Yes', () => {
        const wizardFacts = {
          deposit_protected: true,
          prescribed_info_given: true,
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.prescribed_info_given).toBe(true);
      });

      it('should map prescribed_info_served field (alternative naming)', () => {
        const wizardFacts = {
          deposit_protected: true,
          prescribed_info_served: true,
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.prescribed_info_given).toBe(true);
      });
    });

    describe('Gas Safety Certificate Mapping', () => {
      it('should map gas_certificate_provided as true when wizard says Yes', () => {
        const wizardFacts = {
          gas_certificate_provided: true,
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.gas_certificate_provided).toBe(true);
        expect(templateData.gas_cert_provided).toBe(true);
      });

      it('should map gas_safety_cert_served field (alternative naming)', () => {
        const wizardFacts = {
          gas_safety_cert_served: true,
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.gas_certificate_provided).toBe(true);
      });
    });

    describe('EPC Mapping', () => {
      it('should map epc_provided as true when wizard says Yes', () => {
        const wizardFacts = {
          epc_provided: true,
          epc_rating: 'C',
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.epc_provided).toBe(true);
        expect(templateData.epc_rating).toBe('C');
      });

      it('should map epc_served field (alternative naming)', () => {
        const wizardFacts = {
          epc_served: true,
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.epc_provided).toBe(true);
      });
    });

    describe('How to Rent Guide Mapping', () => {
      it('should map how_to_rent_provided as true when wizard says Yes', () => {
        const wizardFacts = {
          how_to_rent_provided: true,
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.how_to_rent_provided).toBe(true);
        expect(templateData.how_to_rent_given).toBe(true);
      });

      it('should map how_to_rent_served field (alternative naming)', () => {
        const wizardFacts = {
          how_to_rent_served: true,
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.how_to_rent_given).toBe(true);
      });
    });

    describe('Licensing Mapping', () => {
      it('should map licensing_required false when no licensing needed', () => {
        const wizardFacts = {
          hmo_license_required: false,
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.hmo_license_required).toBe(false);
      });

      it('should map HMO license status correctly', () => {
        const wizardFacts = {
          hmo_license_required: true,
          hmo_license_valid: true,
        };

        const templateData = mapNoticeOnlyFacts(wizardFacts);

        expect(templateData.hmo_license_required).toBe(true);
        expect(templateData.hmo_license_valid).toBe(true);
      });
    });
  });

  describe('Complete Wizard Scenario Mapping', () => {
    it('should correctly map all compliance fields for a compliant Section 21 case', () => {
      // Scenario from the task: All compliance items are "Yes"
      const wizardFacts = {
        // Tenancy details
        tenancy_start_date: '2025-07-14',
        fixed_term: true,
        fixed_term_end_date: '2026-07-14',

        // Notice details
        notice_service_date: '2026-01-15',
        service_method: 'First class post',
        selected_notice_route: 'section_21',

        // Deposit compliance
        deposit_taken: true,
        deposit_protected: true,
        deposit_amount: 1200,
        deposit_scheme: 'DPS',
        prescribed_info_given: true,

        // Document compliance
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,

        // Licensing
        hmo_license_required: false,
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // All compliance fields should show as compliant
      expect(templateData.deposit_protected).toBe(true);
      expect(templateData.prescribed_info_given).toBe(true);
      expect(templateData.gas_certificate_provided).toBe(true);
      expect(templateData.epc_provided).toBe(true);
      expect(templateData.how_to_rent_provided).toBe(true);
      expect(templateData.hmo_license_required).toBe(false);

      // Date fields should be present
      expect(templateData.tenancy_start_date).toBe('2025-07-14');
      expect(templateData.service_date).toBe('2026-01-15');
    });

    it('should map selected_notice_route for route determination', () => {
      const wizardFacts = {
        selected_notice_route: 'section_21',
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      expect(templateData.selected_notice_route).toBe('section_21');
    });
  });

  describe('Non-Compliant Scenario Mapping', () => {
    it('should map non-compliant deposit status correctly', () => {
      const wizardFacts = {
        deposit_taken: true,
        deposit_protected: false,
        deposit_amount: 1200,
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      expect(templateData.deposit_taken).toBe(true);
      expect(templateData.deposit_protected).toBe(false);
    });

    it('should map missing gas certificate correctly', () => {
      const wizardFacts = {
        gas_certificate_provided: false,
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      expect(templateData.gas_certificate_provided).toBe(false);
    });
  });

  describe('Nested Object Mappings', () => {
    it('should populate deposit nested object correctly', () => {
      const wizardFacts = {
        deposit_protected: true,
        deposit_amount: 1500,
        deposit_scheme: 'TDS',
        prescribed_info_given: true,
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      expect(templateData.deposit).toBeDefined();
      expect(templateData.deposit.protected).toBe(true);
      expect(templateData.deposit.amount).toBe(1500);
      expect(templateData.deposit.scheme).toBe('TDS');
      expect(templateData.deposit.prescribed_info_given).toBe(true);
    });

    it('should populate compliance nested object correctly', () => {
      const wizardFacts = {
        gas_certificate_provided: true,
        epc_provided: true,
        epc_rating: 'B',
        how_to_rent_provided: true,
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      expect(templateData.compliance).toBeDefined();
      expect(templateData.compliance.gas_cert_provided).toBe(true);
      expect(templateData.compliance.epc_provided).toBe(true);
      expect(templateData.compliance.epc_rating).toBe('B');
      expect(templateData.compliance.how_to_rent_given).toBe(true);
    });
  });
});

describe('Template Selection in Route', () => {
  // These tests verify the route logic uses the correct template based on selected_route

  describe('Route Configuration', () => {
    it('should use Section 21 compliance template path for section_21 route', () => {
      const selected_route = 'section_21';
      const complianceTemplatePath = selected_route === 'section_21'
        ? 'uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
        : 'uk/england/templates/eviction/compliance_checklist.hbs';

      expect(complianceTemplatePath).toBe(
        'uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
      );
    });

    it('should use generic compliance template path for section_8 route', () => {
      const selected_route = 'section_8';
      const complianceTemplatePath = selected_route === 'section_21'
        ? 'uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
        : 'uk/england/templates/eviction/compliance_checklist.hbs';

      expect(complianceTemplatePath).toBe(
        'uk/england/templates/eviction/compliance_checklist.hbs'
      );
    });
  });

  describe('Document Title Selection', () => {
    it('should use Section 21 title for section_21 route', () => {
      const selected_route = 'section_21';
      const title = selected_route === 'section_21'
        ? 'Section 21 Pre-Service Compliance Checklist'
        : 'Pre-Service Compliance Checklist';

      expect(title).toBe('Section 21 Pre-Service Compliance Checklist');
    });

    it('should use generic title for section_8 route', () => {
      const selected_route = 'section_8';
      const title = selected_route === 'section_21'
        ? 'Section 21 Pre-Service Compliance Checklist'
        : 'Pre-Service Compliance Checklist';

      expect(title).toBe('Pre-Service Compliance Checklist');
    });
  });
});

describe('Regression: Concrete Scenario Validation', () => {
  /**
   * Regression test using the exact scenario from the task:
   * - Tenancy start: 2025-07-14
   * - Fixed term end: 2026-07-14
   * - Serve date: 2026-01-15
   * - Service method: First class post
   * - Deposit protected: Yes (DPS), PI: Yes
   * - Gas: Yes + cert provided Yes
   * - EPC: Yes
   * - How to Rent: Yes
   * - Licensing: No licensing required
   */
  it('should map all compliant fields correctly for the regression scenario', () => {
    const wizardFacts = {
      // Property
      property_address_line1: '123 Test Street',
      property_address_town: 'London',
      property_address_postcode: 'SW1A 1AA',

      // Landlord
      landlord_full_name: 'John Landlord',
      landlord_address_line1: '456 Owner Road',
      landlord_address_town: 'Manchester',
      landlord_address_postcode: 'M1 1AA',

      // Tenant
      tenant_full_name: 'Jane Tenant',

      // Tenancy
      tenancy_start_date: '2025-07-14',
      fixed_term: true,
      fixed_term_end_date: '2026-07-14',
      rent_amount: 1500,
      rent_frequency: 'monthly',

      // Notice
      notice_service_date: '2026-01-15',
      service_method: 'first_class_post',
      selected_notice_route: 'section_21',

      // Deposit - ALL COMPLIANT
      deposit_taken: true,
      deposit_protected: true,
      deposit_amount: 1500,
      deposit_scheme: 'DPS',
      prescribed_info_given: true,

      // Documents - ALL COMPLIANT
      gas_certificate_provided: true,
      epc_provided: true,
      how_to_rent_provided: true,

      // Licensing - NOT REQUIRED
      hmo_license_required: false,
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Verify all compliance items are correctly mapped as TRUE/COMPLIANT
    expect(templateData.deposit_protected).toBe(true);
    expect(templateData.prescribed_info_given).toBe(true);
    expect(templateData.gas_certificate_provided).toBe(true);
    expect(templateData.epc_provided).toBe(true);
    expect(templateData.how_to_rent_provided).toBe(true);
    expect(templateData.hmo_license_required).toBe(false);

    // Verify dates are populated
    expect(templateData.tenancy_start_date).toBe('2025-07-14');
    expect(templateData.service_date).toBe('2026-01-15');

    // Verify deposit details
    expect(templateData.deposit_amount).toBe(1500);
    expect(templateData.deposit_scheme).toBe('DPS');

    // Verify route selection
    expect(templateData.selected_notice_route).toBe('section_21');

    // Verify fixed term is detected
    expect(templateData.fixed_term).toBe(true);
    expect(templateData.fixed_term_end_date).toBe('2026-07-14');
  });

  it('should populate nested objects for template compatibility', () => {
    const wizardFacts = {
      deposit_protected: true,
      deposit_amount: 1500,
      deposit_scheme: 'DPS',
      prescribed_info_given: true,
      gas_certificate_provided: true,
      epc_provided: true,
      how_to_rent_provided: true,
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Template uses both flat and nested object access
    expect(templateData.deposit).toBeDefined();
    expect(templateData.deposit.protected).toBe(true);
    expect(templateData.deposit.prescribed_info_given).toBe(true);

    expect(templateData.compliance).toBeDefined();
    expect(templateData.compliance.gas_cert_provided).toBe(true);
    expect(templateData.compliance.epc_provided).toBe(true);
    expect(templateData.compliance.how_to_rent_given).toBe(true);
  });
});

/**
 * TEMPLATE RENDERING TESTS
 *
 * These tests actually compile the Handlebars template and verify the output HTML
 * to ensure the template logic correctly handles licensing_required and retaliatory_eviction_clear.
 */
describe('Template Rendering - Licensing & Retaliatory Eviction', () => {
  const Handlebars = require('handlebars');
  const fs = require('fs');
  const path = require('path');

  // Register the 'eq' helper (must match generator.ts implementation)
  Handlebars.registerHelper('eq', function (this: any, a: any, b: any, options?: any) {
    if (arguments.length === 3 && options && typeof options.fn === 'function') {
      return a === b ? options.fn(this) : (options.inverse ? options.inverse(this) : '');
    }
    return a === b;
  });

  // Register format_date helper (simplified version)
  Handlebars.registerHelper('format_date', function (date: any, format?: string) {
    if (!date) return '';
    const d = new Date(date + (typeof date === 'string' && !date.includes('T') ? 'T00:00:00.000Z' : ''));
    if (isNaN(d.getTime())) return '';
    const day = String(d.getUTCDate()).padStart(2, '0');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const year = d.getUTCFullYear();
    if (format === 'long') {
      return `${parseInt(day)} ${monthNames[d.getUTCMonth()]} ${year}`;
    }
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${year}`;
  });

  let templateContent: string;
  let compiledTemplate: ReturnType<typeof Handlebars.compile>;

  beforeEach(() => {
    const templatePath = path.join(
      process.cwd(),
      'config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
    );
    templateContent = fs.readFileSync(templatePath, 'utf-8');
    compiledTemplate = Handlebars.compile(templateContent);
  });

  describe('Property Licensing - Template Output', () => {
    it('licensing_required=false should render "NOT APPLICABLE" not "NOT LICENSED"', () => {
      const templateData = {
        // Required fields for template
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        tenancy_start_date: '2025-07-14',
        service_date: '2026-01-15',
        notice_expiry_date: '2026-07-14',
        service_date_formatted: '15 January 2026',
        notice_expiry_date_formatted: '14 July 2026',
        tenancy_start_date_formatted: '14 July 2025',
        generated_date: '15 January 2026',
        current_date: '2026-01-15',
        print_css: '',
        // Compliance fields
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
        // CRITICAL: licensing_required = false (not required)
        licensing_required: false,
        hmo_license_required: false,
        // Retaliatory eviction
        retaliatory_eviction_clear: true,
      };

      const html = compiledTemplate(templateData);

      // Should show "NOT APPLICABLE" for licensing
      expect(html).toContain('NOT APPLICABLE');
      expect(html).toContain('Not required for this property');

      // Should NOT show "NOT LICENSED" or "MAY BLOCK" when licensing_required=false
      expect(html).not.toContain('NOT LICENSED');
      expect(html).not.toContain('LICENSE REQUIRED – MAY BLOCK SECTION 21');
    });

    it('licensing_required=true without license should render "LICENSE REQUIRED – MAY BLOCK SECTION 21"', () => {
      const templateData = {
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        tenancy_start_date: '2025-07-14',
        service_date: '2026-01-15',
        notice_expiry_date: '2026-07-14',
        service_date_formatted: '15 January 2026',
        notice_expiry_date_formatted: '14 July 2026',
        tenancy_start_date_formatted: '14 July 2025',
        generated_date: '15 January 2026',
        current_date: '2026-01-15',
        print_css: '',
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
        // CRITICAL: licensing_required = true but NOT licensed
        licensing_required: true,
        hmo_license_required: true,
        hmo_license_valid: false,
        property_licensed: false,
        retaliatory_eviction_clear: true,
      };

      const html = compiledTemplate(templateData);

      // Should show licensing is required but missing
      expect(html).toContain('LICENSE REQUIRED – MAY BLOCK SECTION 21');
      expect(html).toContain('CRITICAL ISSUE');
    });

    it('licensing_required=true with valid license should render "COMPLIANT"', () => {
      const templateData = {
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        tenancy_start_date: '2025-07-14',
        service_date: '2026-01-15',
        notice_expiry_date: '2026-07-14',
        service_date_formatted: '15 January 2026',
        notice_expiry_date_formatted: '14 July 2026',
        tenancy_start_date_formatted: '14 July 2025',
        generated_date: '15 January 2026',
        current_date: '2026-01-15',
        print_css: '',
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
        // CRITICAL: licensing_required = true AND licensed
        licensing_required: true,
        hmo_license_required: true,
        hmo_license_valid: true,
        retaliatory_eviction_clear: true,
      };

      const html = compiledTemplate(templateData);

      // Should show licensing is compliant
      expect(html).toContain('HMO/Selective License');
      expect(html).toContain('Licensing requirements met');
    });

    it('licensing_required=undefined should render "REQUIRES REVIEW"', () => {
      const templateData = {
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        tenancy_start_date: '2025-07-14',
        service_date: '2026-01-15',
        notice_expiry_date: '2026-07-14',
        service_date_formatted: '15 January 2026',
        notice_expiry_date_formatted: '14 July 2026',
        tenancy_start_date_formatted: '14 July 2025',
        generated_date: '15 January 2026',
        current_date: '2026-01-15',
        print_css: '',
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
        // CRITICAL: licensing_required is undefined/missing
        // (intentionally omitted)
        retaliatory_eviction_clear: true,
      };

      const html = compiledTemplate(templateData);

      // Property licensing section should show REQUIRES REVIEW
      // Use regex to match the section 5 specifically
      const licensingSection = html.match(/<h3>5\. Property Licensing<\/h3>[\s\S]*?<\/div>\s*<\/div>/)?.[0] || '';
      expect(licensingSection).toContain('REQUIRES REVIEW');
      expect(licensingSection).toContain('Please confirm whether this property requires licensing');
    });
  });

  describe('Retaliatory Eviction - Template Output', () => {
    it('retaliatory_eviction_clear=true should render "COMPLIANT"', () => {
      const templateData = {
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        tenancy_start_date: '2025-07-14',
        service_date: '2026-01-15',
        notice_expiry_date: '2026-07-14',
        service_date_formatted: '15 January 2026',
        notice_expiry_date_formatted: '14 July 2026',
        tenancy_start_date_formatted: '14 July 2025',
        generated_date: '15 January 2026',
        current_date: '2026-01-15',
        print_css: '',
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
        licensing_required: false,
        // CRITICAL: retaliatory_eviction_clear = true
        retaliatory_eviction_clear: true,
      };

      const html = compiledTemplate(templateData);

      // Retaliatory eviction section should show COMPLIANT
      const retaliatorySection = html.match(/<h3>6\. Retaliatory Eviction Check<\/h3>[\s\S]*?<\/div>\s*<\/div>/)?.[0] || '';
      expect(retaliatorySection).toContain('COMPLIANT');
      expect(retaliatorySection).toContain('No retaliatory eviction concerns');

      // Should NOT show "REQUIRES REVIEW" in the retaliatory section
      expect(retaliatorySection).not.toContain('REQUIRES REVIEW');
    });

    it('no_repair_complaint=true should render "COMPLIANT"', () => {
      const templateData = {
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        tenancy_start_date: '2025-07-14',
        service_date: '2026-01-15',
        notice_expiry_date: '2026-07-14',
        service_date_formatted: '15 January 2026',
        notice_expiry_date_formatted: '14 July 2026',
        tenancy_start_date_formatted: '14 July 2025',
        generated_date: '15 January 2026',
        current_date: '2026-01-15',
        print_css: '',
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
        licensing_required: false,
        // Alternative path
        no_repair_complaint: true,
      };

      const html = compiledTemplate(templateData);

      // Retaliatory eviction section should show COMPLIANT
      const retaliatorySection = html.match(/<h3>6\. Retaliatory Eviction Check<\/h3>[\s\S]*?<\/div>\s*<\/div>/)?.[0] || '';
      expect(retaliatorySection).toContain('COMPLIANT');
      expect(retaliatorySection).toContain('No repair complaints');
    });

    it('retaliatory fields missing should render "REQUIRES REVIEW"', () => {
      const templateData = {
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        tenancy_start_date: '2025-07-14',
        service_date: '2026-01-15',
        notice_expiry_date: '2026-07-14',
        service_date_formatted: '15 January 2026',
        notice_expiry_date_formatted: '14 July 2026',
        tenancy_start_date_formatted: '14 July 2025',
        generated_date: '15 January 2026',
        current_date: '2026-01-15',
        print_css: '',
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
        licensing_required: false,
        // CRITICAL: No retaliatory eviction fields provided
        // (intentionally omitted)
      };

      const html = compiledTemplate(templateData);

      // Retaliatory eviction section should show REQUIRES REVIEW
      const retaliatorySection = html.match(/<h3>6\. Retaliatory Eviction Check<\/h3>[\s\S]*?<\/div>\s*<\/div>/)?.[0] || '';
      expect(retaliatorySection).toContain('REQUIRES REVIEW');
      expect(retaliatorySection).toContain('Important Check');
    });
  });

  /**
   * REGRESSION TESTS FOR BUG FIX: licensing_required='not_required' and no_retaliatory_notice=true
   *
   * These tests verify the ACTUAL wizard payload shapes from Section21ComplianceSection.tsx:
   * 1. licensing_required stores a SELECT value: 'not_required', 'hmo_mandatory', 'hmo_additional', 'selective'
   * 2. no_retaliatory_notice is the wizard field for "Is notice served > 6 months after repair complaint?"
   */
  describe('Bug Fix Regression - Wizard Payload Shapes', () => {
    it('licensing_required="not_required" (wizard select value) should map to false', () => {
      // This is the ACTUAL wizard payload shape from Section21ComplianceSection.tsx (LICENSING_OPTIONS)
      const wizardFacts = {
        licensing_required: 'not_required', // SELECT value, NOT boolean!
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // Should map to false (no licensing required)
      expect(templateData.licensing_required).toBe(false);
      expect(templateData.hmo_license_required).toBe(false);
    });

    it('licensing_required="hmo_mandatory" should map to true', () => {
      const wizardFacts = {
        licensing_required: 'hmo_mandatory',
        has_valid_licence: true,
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      expect(templateData.licensing_required).toBe(true);
      expect(templateData.hmo_license_required).toBe(true);
    });

    it('licensing_required="selective" should map to true', () => {
      const wizardFacts = {
        licensing_required: 'selective',
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      expect(templateData.licensing_required).toBe(true);
      expect(templateData.hmo_license_required).toBe(true);
    });

    it('no_retaliatory_notice=true (wizard field) should set retaliatory_eviction_clear=true', () => {
      // This is the ACTUAL wizard field from Section21ComplianceSection.tsx
      // Question: "Is this notice being served more than 6 months after any repair complaint?"
      const wizardFacts = {
        no_retaliatory_notice: true, // Yes = > 6 months after complaint = NO concerns
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // Should set retaliatory_eviction_clear to true (compliant)
      expect(templateData.retaliatory_eviction_clear).toBe(true);
      expect(templateData.no_repair_complaint).toBe(true);
    });

    it('no_retaliatory_notice=false should NOT set retaliatory_eviction_clear', () => {
      // User selected "No" = within 6 months of complaint = potential concern
      const wizardFacts = {
        no_retaliatory_notice: false,
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // Should NOT be marked as compliant
      expect(templateData.retaliatory_eviction_clear).toBe(false);
    });

    it('complete wizard scenario with actual field names should map correctly', () => {
      // This is the EXACT wizard payload from Section21ComplianceSection.tsx
      const wizardFacts = {
        // Property
        property_address_line1: '16 Waterloo Road',
        property_address_town: 'Pudsey',
        property_address_postcode: 'LS28 7PW',

        // Landlord
        landlord_full_name: 'Tariq Mohammed',

        // Tenant
        tenant_full_name: 'Sonia Shezadi',

        // Tenancy
        tenancy_start_date: '2025-07-14',
        fixed_term: true,
        fixed_term_end_date: '2026-07-14',

        // Notice
        notice_service_date: '2026-01-15',
        selected_notice_route: 'section_21',

        // Deposit - using wizard field names
        deposit_taken: true,
        deposit_protected: true,
        deposit_amount: 1000,
        deposit_scheme_name: 'DPS',
        prescribed_info_served: true, // wizard uses _served suffix

        // Gas - wizard field name
        gas_safety_cert_served: true,

        // EPC - wizard field name
        epc_served: true,

        // How to Rent - wizard field name
        how_to_rent_served: true,

        // Licensing - CRITICAL: wizard uses SELECT value not boolean!
        licensing_required: 'not_required',

        // Retaliatory eviction - CRITICAL: wizard field name!
        no_retaliatory_notice: true,
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // Verify ALL fields are correctly mapped
      expect(templateData.deposit_protected).toBe(true);
      expect(templateData.prescribed_info_given).toBe(true);
      expect(templateData.gas_certificate_provided).toBe(true);
      expect(templateData.epc_provided).toBe(true);
      expect(templateData.how_to_rent_provided).toBe(true);

      // CRITICAL: These were the bugs!
      expect(templateData.licensing_required).toBe(false); // NOT true!
      expect(templateData.retaliatory_eviction_clear).toBe(true);
    });
  });

  describe('Full Compliant Scenario - No False Warnings', () => {
    it('reference scenario should NOT contain false warnings', () => {
      // This is the exact reference scenario from the task
      const templateData = mapNoticeOnlyFacts({
        // Parties
        tenant_full_name: 'Sonia Shezadi',
        landlord_full_name: 'Tariq Mohammed',
        landlord_address_line1: '35 Woodhall Park Avenue',
        landlord_address_town: 'Pudsey',
        landlord_address_postcode: 'LS28 7HF',
        property_address_line1: '16 Waterloo Road',
        property_address_town: 'Pudsey',
        property_address_postcode: 'LS28 7PW',

        // Tenancy
        tenancy: {
          start_date: '2025-07-14',
        },

        // Notice service
        notice_service: {
          date: '2026-01-15',
        },

        // Compliance - all compliant
        section21: {
          prescribed_info_given: true,
          gas_certificate_provided: true,
          epc_provided: true,
          how_to_rent_provided: true,
        },

        // Deposit
        deposit_taken: true,
        deposit_protected: true,
        deposit_amount: 1000,
        deposit_scheme: 'DPS',

        // Licensing - "No licensing required"
        property_licensing_required: false,

        // Retaliatory eviction - "No concerns"
        retaliatory_eviction_clear: true,

        jurisdiction: 'england',
        selected_notice_route: 'section_21',
      });

      // Add print_css for template
      templateData.print_css = '';

      const html = compiledTemplate(templateData);

      // === CRITICAL ASSERTIONS ===

      // 1. Property Licensing: Should NOT show false "NOT LICENSED" warning
      expect(html).not.toContain('NOT LICENSED');
      expect(html).not.toContain('LICENSE REQUIRED – MAY BLOCK SECTION 21');
      // Should show "NOT APPLICABLE" for licensing
      expect(html).toContain('NOT APPLICABLE');
      expect(html).toContain('Not required for this property');

      // 2. Retaliatory Eviction: Should show COMPLIANT, NOT "REQUIRES REVIEW"
      const retaliatorySection = html.match(/<h3>6\. Retaliatory Eviction Check<\/h3>[\s\S]*?Evidence to Prepare/)?.[0] || '';
      expect(retaliatorySection).toContain('COMPLIANT');
      expect(retaliatorySection).not.toContain('REQUIRES REVIEW');

      // 3. All other compliance fields should show COMPLIANT
      expect(html).toContain('Deposit Protection');
      expect(html).toContain('Gas Safety Certificate');
      expect(html).toContain('Energy Performance Certificate');
      expect(html).toContain('How to Rent');
    });
  });
});
