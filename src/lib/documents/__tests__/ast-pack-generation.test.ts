import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGenerateDocument } = vi.hoisted(() => ({
  mockGenerateDocument: vi.fn(async ({ templatePath }: { templatePath: string }) => ({
    html: `<html data-template="${templatePath}"></html>`,
    pdf: Buffer.from(templatePath),
    metadata: {
      templateUsed: templatePath,
      generatedAt: new Date().toISOString(),
      documentId: `doc:${templatePath}`,
      isPreview: false,
    },
  })),
}));

vi.mock('../generator', async () => {
  const actual = await vi.importActual<typeof import('../generator')>('../generator');

  return {
    ...actual,
    generateDocument: mockGenerateDocument,
    htmlToPdf: vi.fn().mockResolvedValue(Buffer.from('pdf')),
  };
});

import type { ASTData, TenancyJurisdiction } from '../ast-generator';
import { generatePremiumASTDocuments, generateStandardASTDocuments } from '../ast-generator';

function createBaseASTData(jurisdiction: TenancyJurisdiction): ASTData {
  const data = {
    jurisdiction,
    agreement_date: '2026-06-01',
    landlord_full_name: 'Amelia Hart',
    landlord_address: '14 Kingsway, London, WC2B 6UN',
    landlord_email: 'amelia.hart@example.com',
    landlord_phone: '07000000010',
    tenants: [
      {
        full_name: 'Noah Bennett',
        dob: '1992-09-14',
        email: 'noah.bennett@example.com',
        phone: '07000000011',
      },
    ],
    property_address: 'Flat 4, 19 River Street, Manchester, M3 4EN',
    tenancy_start_date: '2026-06-15',
    is_fixed_term: false,
    rent_period: 'month',
    rent_amount: 1450,
    rent_due_day: '1st',
    payment_method: 'Standing Order',
    payment_details: 'Monthly standing order to the landlord account',
    deposit_amount: 1450,
    deposit_scheme_name: 'DPS',
    inventory_delivery_method: 'later',
  } as ASTData;

  if (jurisdiction === 'wales') {
    data.rent_smart_wales_registered = true;
    data.rent_smart_wales_registration_number = 'RSW-REG-TEST';
  } else if (jurisdiction === 'scotland') {
    data.deposit_payer = 'Noah Bennett';
    data.deposit_scheme_address = 'Example scheme address';
    data.deposit_scheme_contact_details = 'Example scheme contact';
  } else if (jurisdiction === 'northern-ireland') {
    data.ni_capital_value = '£100,000';
    data.ni_rates_payable = '£1,000 per year';
    data.ni_rates_liability = 'landlord_included';
    data.ni_rates_landlord_included = true;
    data.ni_rates_included_in_rent = 'Landlord pays the rates; they are included in the rent.';
    data.ni_other_required_payments = 'None';
    data.deposit_lifecycle = 'expected';
    data.deposit_is_expected = true;
    data.inventory_due_date = '2026-06-15';
    data.smoke_alarms_fitted = true;
    data.smoke_alarm_locations = 'Living room; ground-floor and first-floor halls';
    data.heat_alarm_locations = 'Kitchen';
    data.fixed_combustion_appliances = 'Gas boiler in utility room';
    data.carbon_monoxide_alarms = true;
    data.carbon_monoxide_alarm_locations = 'Utility room';
    data.carbon_monoxide_alarm_exclusions = 'Gas cooker excluded by the Regulations';
    data.alarms_tested = true;
    data.alarms_tested_date = '2026-06-14';
  }
  return data;
}

describe('AST document pack generation', () => {
  beforeEach(() => {
    mockGenerateDocument.mockClear();
  });

  it('keeps the England standard pack on the confirmed 5-document bundle', async () => {
    const pack = await generateStandardASTDocuments(createBaseASTData('england'), 'eng-std-pack');

    expect(pack.documents.map((document) => document.document_type)).toEqual([
      'ast_agreement',
      'inventory_schedule',
      'pre_tenancy_checklist_england',
      'deposit_protection_certificate',
      'tenancy_deposit_information',
    ]);
  });

  it('adds the 2026 information sheet for existing written England transition packs', async () => {
    const pack = await generateStandardASTDocuments({
      ...createBaseASTData('england'),
      england_tenancy_purpose: 'existing_written_tenancy',
    }, 'eng-std-transition-pack');

    expect(pack.documents.map((document) => document.document_type)).toEqual([
      'ast_agreement',
      'inventory_schedule',
      'pre_tenancy_checklist_england',
      'renters_rights_information_sheet_2026',
      'deposit_protection_certificate',
      'tenancy_deposit_information',
    ]);
  });

  it('does not add the 2026 information sheet for new England agreements', async () => {
    const pack = await generateStandardASTDocuments({
      ...createBaseASTData('england'),
      england_tenancy_purpose: 'new_agreement',
    }, 'eng-std-new-pack');

    expect(pack.documents.map((document) => document.document_type)).not.toContain(
      'renters_rights_information_sheet_2026'
    );
  });

  it('does not add the 2026 information sheet for existing verbal England tenancies', async () => {
    const pack = await generateStandardASTDocuments({
      ...createBaseASTData('england'),
      england_tenancy_purpose: 'existing_verbal_tenancy',
    }, 'eng-std-verbal-pack');

    expect(pack.documents.map((document) => document.document_type)).not.toContain(
      'renters_rights_information_sheet_2026'
    );
  });

  it('adds the premium support documents to every premium jurisdiction pack', async () => {
    const expectedCounts = {
      england: 8,
      wales: 6,
      scotland: 7,
      'northern-ireland': 10,
    } as const;

    for (const jurisdiction of Object.keys(expectedCounts) as Array<keyof typeof expectedCounts>) {
      const pack = await generatePremiumASTDocuments(createBaseASTData(jurisdiction), `${jurisdiction}-premium-pack`);
      const documentTypes = pack.documents.map((document) => document.document_type);

      expect(pack.documents).toHaveLength(expectedCounts[jurisdiction]);
      expect(documentTypes).toContain('key_schedule');
      expect(documentTypes).toContain('property_maintenance_guide');
      expect(documentTypes).toContain('checkout_procedure');

      if (jurisdiction === 'england') {
        expect(documentTypes).toContain('deposit_protection_certificate');
        expect(documentTypes).toContain('tenancy_deposit_information');
      }

      if (jurisdiction === 'scotland') {
        expect(documentTypes).toContain('easy_read_notes_scotland');
      }
    }
  });

  it('keeps Scotland easy read notes in both tiers', async () => {
    const standardPack = await generateStandardASTDocuments(createBaseASTData('scotland'), 'scotland-standard-pack');
    const premiumPack = await generatePremiumASTDocuments(createBaseASTData('scotland'), 'scotland-premium-pack');

    expect(standardPack.documents.map((document) => document.document_type)).toContain('easy_read_notes_scotland');
    expect(premiumPack.documents.map((document) => document.document_type)).toContain('easy_read_notes_scotland');
  });
});
