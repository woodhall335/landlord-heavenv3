import { describe, expect, it } from 'vitest';
import { generateCompleteEvictionPack } from '../../src/lib/documents/eviction-pack-generator';
import { buildEnglandSection8CompletePackFacts } from '../../src/lib/testing/fixtures/complete-pack';

const NOTICE_DATE = '2025-01-15';
const NOTICE_EXPIRY_DATE = '2025-01-29';

const buildArrearsItems = (entries: Array<{ owed: number; paid?: number }>) =>
  entries.map((entry, index) => {
    const month = (9 + index).toString().padStart(2, '0');
    const periodStart = `2024-${month}-01`;
    const periodEnd = `2024-${month}-28`;
    const rentDue = 1200;
    const rentPaid = entry.paid ?? 0;
    return {
      period_start: periodStart,
      period_end: periodEnd,
      rent_due: rentDue,
      rent_paid: rentPaid,
      amount_owed: entry.owed,
    };
  });

const expectGroundPresence = (html: string | undefined, shouldInclude: boolean) => {
  expect(html).toBeTruthy();
  if (shouldInclude) {
    expect(html).toContain('Ground 8');
  } else {
    expect(html).not.toContain('Ground 8');
  }
};

const getDocHtml = (pack: Awaited<ReturnType<typeof generateCompleteEvictionPack>>, docType: string) =>
  pack.documents.find((doc) => doc.document_type === docType)?.html;

describe('Section 8 grounds consistency across pack documents', () => {
  it(
    'keeps grounds aligned for admin test-artifacts fixtures (below/above threshold)',
    async () => {
      const belowThresholdFixture = buildEnglandSection8CompletePackFacts();
      belowThresholdFixture.notice_served_date = NOTICE_DATE;
      belowThresholdFixture.notice_expiry_date = NOTICE_EXPIRY_DATE;
      belowThresholdFixture.signature_date = NOTICE_EXPIRY_DATE;
      belowThresholdFixture.section8_grounds = ['Ground 10 - Rent arrears'];
      belowThresholdFixture.total_arrears = 2167.74;
      belowThresholdFixture.rent_arrears_amount = 2167.74;
      belowThresholdFixture.arrears_items = buildArrearsItems([
        { owed: 1200 },
        { owed: 967.74, paid: 232.26 },
      ]);

      const aboveThresholdFixture = buildEnglandSection8CompletePackFacts();
      aboveThresholdFixture.notice_served_date = NOTICE_DATE;
      aboveThresholdFixture.notice_expiry_date = NOTICE_EXPIRY_DATE;
      aboveThresholdFixture.signature_date = NOTICE_EXPIRY_DATE;
      aboveThresholdFixture.section8_grounds = ['Ground 8 - 8+ weeks rent arrears', 'Ground 10 - Rent arrears'];
      aboveThresholdFixture.total_arrears = 2500;
      aboveThresholdFixture.rent_arrears_amount = 2500;
      aboveThresholdFixture.arrears_items = buildArrearsItems([
        { owed: 1200 },
        { owed: 1200 },
        { owed: 100, paid: 1100 },
      ]);

      const belowPack = await generateCompleteEvictionPack(belowThresholdFixture);
      const abovePack = await generateCompleteEvictionPack(aboveThresholdFixture);

      expectGroundPresence(getDocHtml(belowPack, 'section8_notice'), false);
      expectGroundPresence(getDocHtml(belowPack, 'witness_statement'), false);
      expectGroundPresence(getDocHtml(belowPack, 'hearing_checklist'), false);

      expectGroundPresence(getDocHtml(abovePack, 'section8_notice'), true);
      expectGroundPresence(getDocHtml(abovePack, 'witness_statement'), true);
      expectGroundPresence(getDocHtml(abovePack, 'hearing_checklist'), true);
    },
    { timeout: 120000 }
  );

  it(
    'keeps grounds aligned for production-like wizard facts (below/above threshold)',
    async () => {
      const baseWizardFacts = {
        jurisdiction: 'england',
        eviction_route: 'section_8',
        selected_notice_route: 'section_8',
        notice_served_date: NOTICE_DATE,
        notice_expiry_date: NOTICE_EXPIRY_DATE,
        notice_service_method: 'first_class_post',
        signature_date: NOTICE_EXPIRY_DATE,
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        tenancy_start_date: '2024-01-01',
        court_name: 'Central London County Court',
        landlord_full_name: 'Alex Landlord',
        landlord_address_line1: '1 High Street',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        tenant_full_name: 'Tina Tenant',
        property_address_line1: '2 Low Road',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',
      };

      const belowThresholdWizardFacts = {
        ...baseWizardFacts,
        section8_grounds: ['Ground 10 - Rent arrears'],
        total_arrears: 2167.74,
        arrears_items: buildArrearsItems([
          { owed: 1200 },
          { owed: 967.74, paid: 232.26 },
        ]),
      };

      const aboveThresholdWizardFacts = {
        ...baseWizardFacts,
        section8_grounds: ['Ground 8 - 8+ weeks rent arrears', 'Ground 10 - Rent arrears'],
        total_arrears: 2500,
        arrears_items: buildArrearsItems([
          { owed: 1200 },
          { owed: 1200 },
          { owed: 100, paid: 1100 },
        ]),
      };

      const belowPack = await generateCompleteEvictionPack(belowThresholdWizardFacts);
      const abovePack = await generateCompleteEvictionPack(aboveThresholdWizardFacts);

      expectGroundPresence(getDocHtml(belowPack, 'section8_notice'), false);
      expectGroundPresence(getDocHtml(belowPack, 'witness_statement'), false);
      expectGroundPresence(getDocHtml(belowPack, 'hearing_checklist'), false);

      expectGroundPresence(getDocHtml(abovePack, 'section8_notice'), true);
      expectGroundPresence(getDocHtml(abovePack, 'witness_statement'), true);
      expectGroundPresence(getDocHtml(abovePack, 'hearing_checklist'), true);
    },
    { timeout: 120000 }
  );
});
