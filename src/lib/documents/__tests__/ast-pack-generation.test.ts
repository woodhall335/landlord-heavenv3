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
  return {
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
  } as ASTData;
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

  it('adds the premium support documents to every premium jurisdiction pack', async () => {
    const expectedCounts = {
      england: 8,
      wales: 6,
      scotland: 7,
      'northern-ireland': 6,
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
