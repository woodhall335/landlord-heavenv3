import { beforeAll, describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';

import {
  generateCompleteEvictionPack,
  generateNoticeOnlyPack,
} from '../../src/lib/documents/eviction-pack-generator';
import { generateDocument } from '../../src/lib/documents/generator';
import {
  buildN119FinancialInfoText,
  buildN119ReasonForPossessionText,
  buildN119StepsTakenText,
} from '../../src/lib/england-possession/pack-drafting';
import { buildEnglandSection8CompletePackFacts } from '../../src/lib/testing/fixtures/complete-pack';

function buildArrearsItems(periods: number) {
  return Array.from({ length: periods }, (_, index) => {
    const month = String(index + 1).padStart(2, '0');
    return {
      period_start: `2026-${month}-01`,
      period_end: `2026-${month}-28`,
      rent_due: 1200,
      rent_paid: 0,
      amount_owed: 1200,
    };
  });
}

function getHtml(pack: Awaited<ReturnType<typeof generateCompleteEvictionPack>> | Awaited<ReturnType<typeof generateNoticeOnlyPack>>, documentType: string): string {
  return pack.documents.find((doc) => doc.document_type === documentType)?.html || '';
}

function toPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractLabeledDate(text: string, label: string): string {
  const match = text.match(new RegExp(`${label}\\s+([0-9]{1,2} [A-Za-z]+ [0-9]{4})`, 'i'));
  expect(match, `Expected "${label}" to be populated in: ${text}`).not.toBeNull();
  return match![1];
}

function expectNoDebugLeakage(html: string) {
  expect(html).not.toContain('SHA:');
  expect(html).not.toContain('Gen:');
  expect(html).not.toContain('Templates:');
  expect(html).not.toContain('eviction-pack-generator.ts');
}

function extractCourtReferences(html: string): string[] {
  const refs = new Set<string>();
  const patterns = [
    /<dt>\s*Court\s*<\/dt>\s*<dd>([\s\S]*?)<\/dd>/gi,
    /<strong>\s*Court:\s*<\/strong>\s*([\s\S]*?)<\/p>/gi,
    /<p[^>]*class=["'][^"']*court-name[^"']*["'][^>]*>\s*In the\s+([\s\S]*?)<\/p>/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      const value = match[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/\s+/g, ' ')
        .trim();
      if (value) {
        refs.add(value);
      }
    }
  }

  return Array.from(refs);
}

beforeAll(() => {
  process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
  process.env.DISABLE_COMPLIANCE_AUDIT_AI = 'true';
  delete process.env.PDF_DEBUG_STAMP;
  delete process.env.DEBUG_PDF;
});

describe('Section 8 document hardening', () => {
  it(
    'populates canonical expiry and proceedings dates in notice-only support docs and omits empty optional notice blocks',
    async () => {
      const noticeFacts = {
        __meta: {
          case_id: 'test-section8-notice-hardening',
          jurisdiction: 'england',
        },
        jurisdiction: 'england',
        selected_notice_route: 'section_8',
        eviction_route: 'section_8',
        landlord_full_name: 'John Smith',
        landlord_address: '123 Main St, London, E1 1AA',
        landlord_email: 'john@example.com',
        tenant_full_name: 'Jane Doe',
        property_address: '456 Rental Ave, London, E1 2BB',
        tenancy_start_date: '2024-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        section8_grounds: ['Ground 8'],
        arrears_items: buildArrearsItems(3),
        total_arrears: 3600,
        notice_served_date: '2026-04-01',
        notice_service_method: 'first_class_post',
        deposit_protected: true,
        prescribed_info_given: false,
        clean_output: true,
        court_mode: true,
      };

      const pack = await generateNoticeOnlyPack(noticeFacts);
      const noticeHtml = getHtml(pack, 'section8_notice');
      const serviceInstructions = getHtml(pack, 'service_instructions');
      const validityChecklist = getHtml(pack, 'validity_checklist');
      const complianceDeclaration = getHtml(pack, 'compliance_declaration');
      const serviceText = toPlainText(serviceInstructions);
      const checklistText = toPlainText(validityChecklist);
      const expiryDate = extractLabeledDate(serviceText, 'Notice expiry date');
      const earliestProceedingsDate = extractLabeledDate(serviceText, 'Earliest proceedings date');

      expect(serviceText).not.toContain('Invalid Date');
      expect(checklistText).not.toContain('Invalid Date');
      expect(serviceText).toContain('Notice expiry date');
      expect(serviceText).toContain('Earliest proceedings date');

      expect(checklistText).toContain(expiryDate);
      expect(checklistText).toContain(earliestProceedingsDate);
      expect(checklistText).toContain('Notice expiry date');
      expect(checklistText).toContain('Earliest proceedings date');

      expect(complianceDeclaration).toContain('Form 3A notice');
      expect(complianceDeclaration).toContain('Significant risk');
      expect(complianceDeclaration).toContain('This does not automatically invalidate a Section 8 notice');

      expect(noticeHtml).not.toContain('<label>Telephone</label>');
      expect((noticeHtml.match(/class="signatory-block/g) || []).length).toBe(1);
      expect(noticeHtml).not.toContain('Generated by landlordheaven.co.uk');

      const noticePdf = pack.documents.find((doc) => doc.document_type === 'section8_notice')?.pdf;
      expect(noticePdf).toBeDefined();

      const officialPdf = await PDFDocument.load(noticePdf!);
      const officialForm = officialPdf.getForm();

      expect(officialForm.getFields().length).toBeGreaterThan(0);
      expect(officialForm.getTextField('form3a_tenant_names').getText()).toContain('Jane Doe');
    },
    { timeout: 120000 }
  );

  it(
    'keeps court-facing complete-pack docs on one canonical court and one canonical Form 3A timeline without debug leakage',
    async () => {
      const completePackFacts = buildEnglandSection8CompletePackFacts({
        overrides: {
          __meta: { case_id: 'test-section8-complete-hardening', jurisdiction: 'england' },
          selected_notice_route: 'section_8',
          eviction_route: 'section_8',
          notice_served_date: '2026-04-01',
          notice_service_method: 'first_class_post',
          signature_date: '2026-04-20',
          total_arrears: 3600,
          rent_arrears_amount: 3600,
          arrears_items: buildArrearsItems(3),
          property_address_line1: '16 Willow Mews',
          property_city: 'York',
          property_postcode: 'YO24 3HX',
          court_name: 'York County Court and Family Court',
          clean_output: true,
          court_mode: true,
        },
      });

      const expectedCourt = 'York County Court and Family Court';

      const pack = await generateCompleteEvictionPack(completePackFacts);
      const proofHtml = getHtml(pack, 'proof_of_service');
      const witnessHtml = getHtml(pack, 'witness_statement');
      const bundleHtml = getHtml(pack, 'court_bundle_index');
      const checklistHtml = getHtml(pack, 'hearing_checklist');
      const caseSummaryHtml = getHtml(pack, 'case_summary');
      const letterHtml = getHtml(pack, 'arrears_engagement_letter');
      const proofText = toPlainText(proofHtml);
      const witnessText = toPlainText(witnessHtml);
      const bundleText = toPlainText(bundleHtml);
      const checklistText = toPlainText(checklistHtml);
      const caseSummaryText = toPlainText(caseSummaryHtml);
      const expectedExpiry = extractLabeledDate(caseSummaryText, 'Notice expiry date');
      const expectedProceedingsDate = extractLabeledDate(caseSummaryText, 'Earliest proceedings date');

      for (const html of [proofHtml, witnessHtml, bundleHtml, checklistHtml, caseSummaryHtml]) {
        expect(html).not.toContain('Invalid Date');
        expectNoDebugLeakage(html);
      }

      for (const text of [proofText, witnessText, bundleText, checklistText, caseSummaryText]) {
        expect(text).toContain(expectedExpiry);
      }

      for (const text of [proofText, bundleText, checklistText, caseSummaryText]) {
        expect(text).toContain(expectedProceedingsDate);
      }

      for (const html of [witnessHtml, bundleHtml, checklistHtml, caseSummaryHtml]) {
        expect(html).toContain(expectedCourt);
        expect(html).not.toContain('Central London County Court');
        expect(extractCourtReferences(html)).toEqual([expectedCourt]);
      }

      expect(bundleHtml).toContain('Form 3A notice');
      expect(proofHtml).toContain('Form 3A notice');
      expect(proofText).toContain('Notice expiry date');
      expect(proofText).toContain('Earliest proceedings date');
      expect(bundleText).toContain('Notice expiry date');
      expect(bundleText).toContain('Earliest proceedings date');
      expect(checklistHtml).not.toContain('[Enter court name]');
      expect(checklistText).toContain('Notice expiry date');
      expect(checklistText).toContain('Earliest proceedings date');
      expect(caseSummaryText).toContain('Notice expiry date');
      expect(caseSummaryText).toContain('Earliest proceedings date');

      expectNoDebugLeakage(letterHtml);
    },
    { timeout: 120000 }
  );

  it('uses Form 3A terminology consistently in N119 narrative drafting helpers', () => {
    const draftingFacts = {
      rent_amount: 1200,
      rent_frequency: 'monthly',
      total_arrears: 3600,
      notice_served_date: '2026-04-01',
      section_8_notice_date: '2026-04-01',
      arrears_items: buildArrearsItems(3),
      preActionSteps: [
        { date: '2026-03-20', description: 'Reminder letter sent to tenant' },
      ],
    };

    const reasonText = buildN119ReasonForPossessionText(draftingFacts as any);
    const stepsText = buildN119StepsTakenText(draftingFacts as any);
    const financialText = buildN119FinancialInfoText(draftingFacts as any);

    for (const text of [reasonText, stepsText, financialText]) {
      expect(text).toContain('Form 3A notice');
    }
  });

  it('omits empty optional rows and sections in rendered court-facing templates', async () => {
    const caseSummary = await generateDocument({
      templatePath: 'shared/templates/eviction_case_summary.hbs',
      data: {
        case_id: 'section8-template-guards',
        jurisdiction: 'england',
        landlord_full_name: 'Alex Landlord',
        tenant_full_name: 'Tina Tenant',
        property_address: '16 Willow Mews, York, YO24 3HX',
        is_section_21: false,
        groundsReliedUpon: ['Ground 8'],
        current_arrears_total: 3600,
        case_narrative_text: 'Test narrative.',
        steps_taken_text: 'Test steps.',
        financial_info_text: 'Test financial position.',
        compliance_status_items: [],
        rent_frequency_label: 'monthly',
        clean_output: true,
      },
      isPreview: false,
      outputFormat: 'html',
    });
    const caseSummaryText = toPlainText(caseSummary.html);

    expect(caseSummaryText).not.toContain('Notice expiry date');
    expect(caseSummaryText).not.toContain('Earliest proceedings date');
    expect(caseSummaryText).not.toContain('Defendant Circumstances');

    const proofOfService = await generateDocument({
      templatePath: 'shared/templates/proof_of_service.hbs',
      data: {
        case_id: 'section8-proof-guards',
        landlord_full_name: 'Alex Landlord',
        tenant_full_name: 'Tina Tenant',
        property_address: '16 Willow Mews, York, YO24 3HX',
        notice_type: 'Form 3A notice',
        service_method: 'post',
        clean_output: true,
        current_date: '6 April 2026',
        current_date_short: '20260406',
      },
      isPreview: false,
      outputFormat: 'html',
    });
    const proofText = toPlainText(proofOfService.html);

    expect(proofText).not.toContain('Other method');

    const hearingChecklist = await generateDocument({
      templatePath: 'uk/england/templates/eviction/hearing_checklist.hbs',
      data: {
        landlord_full_name: 'Alex Landlord',
        tenant_full_name: 'Tina Tenant',
        property_address: '16 Willow Mews, York, YO24 3HX',
        groundsReliedUpon: ['Ground 8'],
        notice_name: 'Form 3A notice',
        generated_date: '2026-04-06',
        clean_output: true,
      },
      isPreview: false,
      outputFormat: 'html',
    });
    const hearingText = toPlainText(hearingChecklist.html);

    expect(hearingText).not.toContain('Notice timeline');
    expect(hearingText).not.toContain('Notice expiry date');
    expect(hearingText).not.toContain('Earliest proceedings date');
  });

  it('distinguishes unknown compliance data from confirmed Section 8 failures', async () => {
    const complianceChecklist = await generateDocument({
      templatePath: 'uk/england/templates/eviction/compliance_checklist.hbs',
      data: {
        selected_notice_route: 'section_8',
        notice_name: 'Form 3A notice',
        property_address: '16 Willow Mews, York, YO24 3HX',
        tenancy_start_date: '2024-01-01',
        current_date: '2026-04-06',
        clean_output: true,
      },
      isPreview: false,
      outputFormat: 'html',
    });
    const complianceText = toPlainText(complianceChecklist.html);

    expect(complianceText).toContain('Deposit protection status is not confirmed in the current pack data');
    expect(complianceText).toContain('How to Rent service is not confirmed in the current pack data');
    expect(complianceText).not.toContain('The deposit is not recorded as protected in an approved scheme');
  });

  it(
    'renders non-arrears England packs without arrears-centric bundle or hearing language',
    async () => {
      const pack = await generateCompleteEvictionPack(
        buildEnglandSection8CompletePackFacts({
          overrides: {
            section8_grounds: ['Ground 1A'],
            total_arrears: 0,
            rent_arrears_amount: 0,
            arrears_breakdown: '',
            arrears_items: [],
            court_name: 'York County Court and Family Court',
          },
        }),
      );

      const bundleText = toPlainText(getHtml(pack, 'court_bundle_index'));
      const hearingText = toPlainText(getHtml(pack, 'hearing_checklist'));

      expect(bundleText).toContain('Ground-specific use or sale evidence');
      expect(bundleText).toContain('Sale of dwelling house evidence');
      expect(bundleText).not.toContain('Schedule of arrears');
      expect(hearingText).not.toContain('Update the schedule of arrears');
      expect(hearingText).toContain('Explain why the statutory ground is made out on the facts');
    },
    120000,
  );
});
