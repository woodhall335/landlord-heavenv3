import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  generateStandardASTDocuments,
  generatePremiumASTDocuments,
  type ASTDocumentPack,
} from '@/lib/documents/ast-generator';
import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';
import {
  ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
  ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
} from '@/lib/tenancy/england-agreement-constants';

// Mock the generator module to avoid actual PDF generation in tests
vi.mock('@/lib/documents/generator', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents/generator')>(
    '@/lib/documents/generator'
  );
  return {
    ...actual,
    htmlToPdf: vi.fn(async (html: string) => Buffer.from(html)),
    generateDocument: vi.fn(async ({ templatePath, data }) => ({
      html: `<html><body>Template: ${templatePath} - Data: ${JSON.stringify(data).slice(0, 100)}</body></html>`,
      pdf: Buffer.from(`PDF for ${templatePath}`),
    })),
  };
});

describe('AST Pack - Unbundled Document Generation', () => {
  const baseWizardFacts = {
    product_tier: 'Standard AST',
    landlord_full_name: 'Test Landlord',
    landlord_address: '1 High Street, London, E1 1AA',
    landlord_email: 'landlord@example.com',
    landlord_phone: '07000000001',
    property_address: '2 High Street, London, E1 2BB',
    property_type: 'flat',
    number_of_bedrooms: '2',
    furnished_status: 'unfurnished',
    tenancy_start_date: '2025-01-01',
    is_fixed_term: true,
    term_length: '12 months',
    tenancy_end_date: '2026-01-01',
    rent_amount: 1200,
    rent_period: 'month',
    rent_due_day: '1st',
    payment_method: 'Bank Transfer',
    payment_details: 'Sort code 00-00-00 / Account 12345678',
    deposit_amount: 1200,
    deposit_scheme_name: 'DPS',
    tenants: {
      0: {
        full_name: 'Test Tenant',
        dob: '1990-01-01',
        email: 'tenant@example.com',
        phone: '07000000002',
      },
    },
  } as any;

  describe('generateStandardASTDocuments', () => {
    it('generates 5 separate documents for England Standard pack', async () => {
      const astData = {
        ...mapWizardToASTData(baseWizardFacts),
        jurisdiction_england: true,
        jurisdiction_wales: false,
      };

      const pack = await generateStandardASTDocuments(astData, 'test-case-id');

      expect(pack.tier).toBe('standard');
      expect(pack.case_id).toBe('test-case-id');
      expect(pack.documents).toHaveLength(5);

      // Document 1: Main Agreement
      const agreement = pack.documents.find((d) => d.category === 'agreement');
      expect(agreement).toBeDefined();
      expect(agreement?.document_type).toBe('ast_agreement');
      expect(agreement?.title).toBe(ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL);
      expect(agreement?.file_name).toBe('tenancy_agreement.pdf');

      // Document 2: Inventory Schedule
      const inventory = pack.documents.find((d) => d.document_type === 'inventory_schedule');
      expect(inventory).toBeDefined();
      expect(inventory?.title).toBe('Inventory & Schedule of Condition');
      expect(inventory?.category).toBe('schedule');
      expect(inventory?.file_name).toBe('inventory_schedule.pdf');

      // Document 3: Compliance Checklist
      const checklist = pack.documents.find((d) => d.category === 'checklist');
      expect(checklist).toBeDefined();
      expect(checklist?.document_type).toBe('pre_tenancy_checklist_england');
      expect(checklist?.title).toContain('Compliance Checklist');

      const depositCertificate = pack.documents.find(
        (d) => d.document_type === 'deposit_protection_certificate'
      );
      expect(depositCertificate?.file_name).toBe('deposit_protection_certificate.pdf');

      const prescribedInformation = pack.documents.find(
        (d) => d.document_type === 'tenancy_deposit_information'
      );
      expect(prescribedInformation?.file_name).toBe('prescribed_information_pack.pdf');
    }, 20000);

    it('includes the official 2026 information sheet for existing written England standard transition packs', async () => {
      const astData = {
        ...mapWizardToASTData({
          ...baseWizardFacts,
          england_tenancy_purpose: 'existing_written_tenancy',
        }),
        jurisdiction_england: true,
        jurisdiction_wales: false,
      };

      const pack = await generateStandardASTDocuments(astData, 'test-case-id');

      expect(pack.documents).toHaveLength(6);
      const informationSheet = pack.documents.find(
        (d) => d.document_type === 'renters_rights_information_sheet_2026'
      );
      expect(informationSheet?.title).toBe('Renters\' Rights Act Information Sheet 2026');
      expect(informationSheet?.file_name).toBe('renters_rights_information_sheet_2026.pdf');
      expect(informationSheet?.pdf).toBeInstanceOf(Buffer);
    }, 20000);

    it('generates 3 separate documents for Wales Standard pack', async () => {
      const astData = {
        ...mapWizardToASTData(baseWizardFacts),
        jurisdiction_wales: true,
        jurisdiction_england: false,
      };

      const pack = await generateStandardASTDocuments(astData, 'test-case-id');

      expect(pack.documents).toHaveLength(3);

      const agreement = pack.documents.find((d) => d.category === 'agreement');
      expect(agreement?.document_type).toBe('soc_agreement');
      expect(agreement?.title).toBe('Standard Occupation Contract');

      const checklist = pack.documents.find((d) => d.category === 'checklist');
      expect(checklist?.document_type).toBe('pre_tenancy_checklist_wales');
    }, 20000);

    it('generates 4 separate documents for Scotland Standard pack', async () => {
      const astData = {
        ...mapWizardToASTData(baseWizardFacts),
        jurisdiction_england: false,
        jurisdiction_wales: false,
        // Scotland uses explicit jurisdiction field
      } as any;
      astData.jurisdiction = 'scotland';

      const pack = await generateStandardASTDocuments(astData, 'test-case-id');

      expect(pack.documents).toHaveLength(4);

      const agreement = pack.documents.find((d) => d.category === 'agreement');
      expect(agreement?.document_type).toBe('prt_agreement');
      expect(agreement?.title).toBe('Private Residential Tenancy Agreement');

      const checklist = pack.documents.find((d) => d.category === 'checklist');
      expect(checklist?.document_type).toBe('pre_tenancy_checklist_scotland');
    }, 20000);

    it('generates 3 separate documents for Northern Ireland Standard pack', async () => {
      const astData = {
        ...mapWizardToASTData(baseWizardFacts),
        jurisdiction_england: false,
        jurisdiction_wales: false,
      } as any;
      astData.jurisdiction = 'northern-ireland';

      const pack = await generateStandardASTDocuments(astData, 'test-case-id');

      expect(pack.documents).toHaveLength(3);

      const agreement = pack.documents.find((d) => d.category === 'agreement');
      expect(agreement?.document_type).toBe('private_tenancy_agreement');
      expect(agreement?.title).toBe('Private Tenancy Agreement');

      const checklist = pack.documents.find((d) => d.category === 'checklist');
      expect(checklist?.document_type).toBe('pre_tenancy_checklist_northern_ireland');
    }, 20000);

    it('includes PDF buffer for all documents', async () => {
      const astData = {
        ...mapWizardToASTData(baseWizardFacts),
        jurisdiction_england: true,
        jurisdiction_wales: false,
      };

      const pack = await generateStandardASTDocuments(astData, 'test-case-id');

      for (const doc of pack.documents) {
        expect(doc.pdf).toBeInstanceOf(Buffer);
        expect(doc.html).toBeTruthy();
      }
    }, 20000);
  });

  describe('generatePremiumASTDocuments', () => {
    const premiumWizardFacts = {
      ...baseWizardFacts,
      product_tier: 'Premium AST',
      is_hmo: true,
      number_of_sharers: 4,
      communal_areas: 'Kitchen, lounge',
      hmo_licence_status: 'Currently licensed',
      guarantor_required: true,
      guarantor_name: 'Test Guarantor',
      guarantor_address: '3 High Street, London, E1 3CC',
      guarantor_email: 'guarantor@example.com',
      guarantor_phone: '07000000003',
    };

    it('generates 8 separate documents for England Premium pack', async () => {
      const astData = {
        ...mapWizardToASTData(premiumWizardFacts),
        jurisdiction_england: true,
        jurisdiction_wales: false,
      };

      const pack = await generatePremiumASTDocuments(astData, 'test-case-id');

      expect(pack.tier).toBe('premium');
      expect(pack.case_id).toBe('test-case-id');
      expect(pack.documents).toHaveLength(8);

      // Document 1: HMO Agreement
      const agreement = pack.documents.find((d) => d.category === 'agreement');
      expect(agreement).toBeDefined();
      expect(agreement?.document_type).toBe('ast_agreement_hmo');
      expect(agreement?.title).toBe(ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL);
      expect(agreement?.file_name).toBe('tenancy_agreement_hmo.pdf');

      // Document 2: Inventory Schedule
      const inventory = pack.documents.find((d) => d.document_type === 'inventory_schedule');
      expect(inventory).toBeDefined();
      expect(inventory?.title).toBe('Inventory & Schedule of Condition');
      expect(inventory?.category).toBe('schedule');

      // Document 3: Compliance Checklist
      const checklist = pack.documents.find((d) => d.category === 'checklist');
      expect(checklist).toBeDefined();
      expect(checklist?.document_type).toBe('pre_tenancy_checklist_england');

      expect(
        pack.documents.some((d) => d.document_type === 'deposit_protection_certificate')
      ).toBe(true);
      expect(
        pack.documents.some((d) => d.document_type === 'tenancy_deposit_information')
      ).toBe(true);
    }, 20000);

    it('includes the official 2026 information sheet for existing written England premium transition packs', async () => {
      const astData = {
        ...mapWizardToASTData({
          ...premiumWizardFacts,
          england_tenancy_purpose: 'existing_written_tenancy',
        }),
        jurisdiction_england: true,
        jurisdiction_wales: false,
      };

      const pack = await generatePremiumASTDocuments(astData, 'test-case-id');

      expect(pack.documents).toHaveLength(9);
      expect(
        pack.documents.some((d) => d.document_type === 'renters_rights_information_sheet_2026')
      ).toBe(true);
    }, 20000);

    it('generates 6 separate documents for Wales Premium pack', async () => {
      const astData = {
        ...mapWizardToASTData(premiumWizardFacts),
        jurisdiction_wales: true,
        jurisdiction_england: false,
      };

      const pack = await generatePremiumASTDocuments(astData, 'test-case-id');

      expect(pack.documents).toHaveLength(6);

      const agreement = pack.documents.find((d) => d.category === 'agreement');
      expect(agreement?.document_type).toBe('soc_agreement_hmo');
      expect(agreement?.title).toContain('HMO');
    }, 20000);

    it('generates 7 separate documents for Scotland Premium pack', async () => {
      const astData = {
        ...mapWizardToASTData(premiumWizardFacts),
        jurisdiction_england: false,
        jurisdiction_wales: false,
      } as any;
      astData.jurisdiction = 'scotland';

      const pack = await generatePremiumASTDocuments(astData, 'test-case-id');

      expect(pack.documents).toHaveLength(7);

      const agreement = pack.documents.find((d) => d.category === 'agreement');
      expect(agreement?.document_type).toBe('prt_agreement_hmo');
    }, 20000);

    it('generates 6 separate documents for Northern Ireland Premium pack', async () => {
      const astData = {
        ...mapWizardToASTData(premiumWizardFacts),
        jurisdiction_england: false,
        jurisdiction_wales: false,
      } as any;
      astData.jurisdiction = 'northern-ireland';

      const pack = await generatePremiumASTDocuments(astData, 'test-case-id');

      expect(pack.documents).toHaveLength(6);

      const agreement = pack.documents.find((d) => d.category === 'agreement');
      expect(agreement?.document_type).toBe('private_tenancy_agreement_hmo');
    }, 20000);

    it('includes PDF buffer for all documents', async () => {
      const astData = {
        ...mapWizardToASTData(premiumWizardFacts),
        jurisdiction_england: true,
        jurisdiction_wales: false,
      };

      const pack = await generatePremiumASTDocuments(astData, 'test-case-id');

      for (const doc of pack.documents) {
        expect(doc.pdf).toBeInstanceOf(Buffer);
        expect(doc.html).toBeTruthy();
      }
    }, 20000);

    it('sets correct inventory description based on hasInventoryData', async () => {
      // With inventory data
      const astDataWithInventory = {
        ...mapWizardToASTData({
          ...premiumWizardFacts,
          inventory_attached: true,
        }),
        inventory_attached: true,
        jurisdiction_england: true,
        jurisdiction_wales: false,
      };

      const packWithInventory = await generatePremiumASTDocuments(astDataWithInventory, 'test-case-id');
      const inventoryWithData = packWithInventory.documents.find(
        (d) => d.document_type === 'inventory_schedule'
      );
      expect(inventoryWithData?.description).toContain('Wizard-completed');

      // Without inventory data
      const astDataWithoutInventory = {
        ...mapWizardToASTData({
          ...premiumWizardFacts,
          inventory_attached: false,
          inventory_provided: false,
        }),
        inventory_attached: false,
        inventory_provided: false,
        jurisdiction_england: true,
        jurisdiction_wales: false,
      };

      const packWithoutInventory = await generatePremiumASTDocuments(astDataWithoutInventory, 'test-case-id');
      const inventoryWithoutData = packWithoutInventory.documents.find(
        (d) => d.document_type === 'inventory_schedule'
      );
      expect(inventoryWithoutData?.description).toContain('Blank');
    }, 20000);
  });

  describe('Document type keys match pack-contents', () => {
    it('Standard England document types match pack-contents keys', async () => {
      const astData = {
        ...mapWizardToASTData(baseWizardFacts),
        jurisdiction_england: true,
        jurisdiction_wales: false,
      };

      const pack = await generateStandardASTDocuments(astData, 'test-case-id');
      const documentTypes = pack.documents.map((d) => d.document_type);

      // These must match the keys in pack-contents.ts getEnglandASTContents
      expect(documentTypes).toContain('ast_agreement');
      expect(documentTypes).toContain('inventory_schedule');
      expect(documentTypes).toContain('pre_tenancy_checklist_england');
      expect(documentTypes).toContain('deposit_protection_certificate');
      expect(documentTypes).toContain('tenancy_deposit_information');
    }, 20000);

    it('Premium England document types match pack-contents keys', async () => {
      const astData = {
        ...mapWizardToASTData({
          ...baseWizardFacts,
          is_hmo: true,
        }),
        jurisdiction_england: true,
        jurisdiction_wales: false,
      };

      const pack = await generatePremiumASTDocuments(astData, 'test-case-id');
      const documentTypes = pack.documents.map((d) => d.document_type);

      // These must match the keys in pack-contents.ts getEnglandASTContents for premium
      expect(documentTypes).toContain('ast_agreement_hmo');
      expect(documentTypes).toContain('inventory_schedule');
      expect(documentTypes).toContain('pre_tenancy_checklist_england');
      expect(documentTypes).toContain('deposit_protection_certificate');
      expect(documentTypes).toContain('tenancy_deposit_information');
    }, 20000);
  });
});
