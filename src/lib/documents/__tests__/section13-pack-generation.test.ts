import fs from 'fs/promises';
import path from 'path';

import { describe, expect, it } from 'vitest';
import { PDFCheckBox, PDFDocument, PDFTextField } from 'pdf-lib';

import {
  FORM_4A_OVERLAY_MAP,
  generateSection13CoreDocuments,
  generateSection13Pack,
  generateSection13TribunalBundle,
  SECTION13_BUNDLE_DOCUMENT_TYPES,
  SECTION13_DEFENSIVE_DOCUMENT_TYPES,
  SECTION13_FORM_4A_VERSION,
} from '@/lib/documents/section13-generator';
import { extractPdfText } from '@/lib/evidence/extract-pdf-text';
import { createEmptySection13State } from '@/lib/section13/facts';
import { computeSection13Preview } from '@/lib/section13/rules';
import type { Section13Comparable } from '@/lib/section13/types';

function buildComparable(index: number, monthlyEquivalent: number): Section13Comparable {
  return {
    source: 'scraped',
    sourceDateKind: 'published',
    sourceDateValue: '2026-03-15',
    addressSnippet: `Comparable ${index + 1}`,
    postcodeNormalized: 'LS1 1AA',
    bedrooms: 2,
    rawRentValue: monthlyEquivalent,
    rawRentFrequency: 'pcm',
    monthlyEquivalent,
    weeklyEquivalent: Number((monthlyEquivalent * 12 / 52).toFixed(2)),
    adjustedMonthlyEquivalent: monthlyEquivalent,
    isManual: false,
    sortOrder: index,
    adjustments: [],
    metadata: {},
  };
}

function buildState() {
  const state = createEmptySection13State();
  state.selectedPlan = 'section13_defensive';
  state.tenancy.tenantNames = ['Alex Tenant', 'Jordan Tenant'];
  state.tenancy.propertyAddressLine1 = '10 Sample Road';
  state.tenancy.propertyTownCity = 'Leeds';
  state.tenancy.postcodeRaw = 'LS1 1AA';
  state.tenancy.postcodeNormalized = 'LS1 1AA';
  state.tenancy.bedrooms = 2;
  state.tenancy.tenancyStartDate = '2025-03-01';
  state.tenancy.currentRentAmount = 1200;
  state.tenancy.currentRentFrequency = 'monthly';
  state.tenancy.lastRentIncreaseDate = '2025-04-01';
  state.tenancy.firstIncreaseAfter2003Date = '2025-04-01';
  state.landlord.landlordName = 'Taylor Landlord';
  state.landlord.landlordAddressLine1 = '1 Landlord Terrace';
  state.landlord.landlordTownCity = 'Leeds';
  state.landlord.landlordPostcodeRaw = 'LS2 2BB';
  state.landlord.landlordPostcodeNormalized = 'LS2 2BB';
  state.landlord.landlordPhone = '01130000000';
  state.landlord.landlordEmail = 'landlord@example.com';
  state.proposal.proposedRentAmount = 1285;
  state.proposal.proposedStartDate = '2026-06-01';
  state.proposal.serviceDate = '2026-03-25';
  state.proposal.serviceMethod = 'post';
  state.comparablesMeta.postcodeRaw = 'LS1 1AA';
  state.comparablesMeta.postcodeNormalized = 'LS1 1AA';
  state.comparablesMeta.bedrooms = 2;
  state.adjustments.manualJustification =
    'The proposed rent reflects recent local listings and the improved condition of the property.';

  const comparables = [
    buildComparable(0, 1240),
    buildComparable(1, 1265),
    buildComparable(2, 1275),
    buildComparable(3, 1290),
    buildComparable(4, 1305),
    buildComparable(5, 1315),
    buildComparable(6, 1330),
    buildComparable(7, 1345),
  ];

  state.preview = computeSection13Preview(state, comparables, new Date('2026-04-08T00:00:00.000Z'));
  return { state, comparables };
}

function getFieldRectangle(pdfDoc: PDFDocument, fieldName: string) {
  const form = pdfDoc.getForm();
  const field = form.getField(fieldName) as PDFTextField | PDFCheckBox;
  const widget = field.acroField.getWidgets()[0];
  return widget.getRectangle();
}

function expectFieldWithin(
  pdfDoc: PDFDocument,
  fieldName: string,
  region: { x: number; y: number; width: number; height: number }
) {
  const rect = getFieldRectangle(pdfDoc, fieldName);
  expect(rect.x).toBeGreaterThanOrEqual(region.x);
  expect(rect.x).toBeLessThanOrEqual(region.x + region.width);
  expect(rect.y).toBeGreaterThanOrEqual(region.y);
  expect(rect.y).toBeLessThanOrEqual(region.y + region.height);
}

describe('Section 13 document generation hardening', () => {
  it('pins the page 4 overlay coordinates for page 4 rent fields and charges cells', () => {
    const overlay =
      FORM_4A_OVERLAY_MAP['england_assured_section13_2026-05-01'][SECTION13_FORM_4A_VERSION];

    expect({
      currentRentAmount: overlay.currentRentAmount,
      currentRentFrequency: overlay.currentRentFrequency,
      tenancyStartDay: overlay.tenancyStartDay,
      tenancyStartMonth: overlay.tenancyStartMonth,
      tenancyStartYear: overlay.tenancyStartYear,
      lastIncreaseDay: overlay.lastIncreaseDay,
      lastIncreaseMonth: overlay.lastIncreaseMonth,
      lastIncreaseYear: overlay.lastIncreaseYear,
      firstIncreaseDay: overlay.firstIncreaseDay,
      firstIncreaseMonth: overlay.firstIncreaseMonth,
      firstIncreaseYear: overlay.firstIncreaseYear,
      proposedRentAmount: overlay.proposedRentAmount,
      proposedRentFrequency: overlay.proposedRentFrequency,
      proposedStartDay: overlay.proposedStartDay,
      proposedStartMonth: overlay.proposedStartMonth,
      proposedStartYear: overlay.proposedStartYear,
      includedChargeRows: overlay.includedChargeRows,
    }).toMatchInlineSnapshot(`
      {
        "currentRentAmount": {
          "fontSize": 10,
          "height": 16,
          "pageIndex": 3,
          "width": 124,
          "x": 74,
          "y": 742,
        },
        "currentRentFrequency": {
          "fontSize": 10,
          "height": 16,
          "pageIndex": 3,
          "width": 128,
          "x": 286,
          "y": 742,
        },
        "firstIncreaseDay": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 20,
          "x": 70,
          "y": 510,
        },
        "firstIncreaseMonth": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 20,
          "x": 111,
          "y": 510,
        },
        "firstIncreaseYear": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 44,
          "x": 152,
          "y": 510,
        },
        "includedChargeRows": [
          {
            "current": {
              "align": "center",
              "fontSize": 9,
              "height": 14,
              "pageIndex": 3,
              "width": 74,
              "x": 173,
              "y": 221,
            },
            "proposed": {
              "align": "center",
              "fontSize": 9,
              "height": 14,
              "pageIndex": 3,
              "width": 74,
              "x": 277,
              "y": 221,
            },
          },
          {
            "current": {
              "align": "center",
              "fontSize": 9,
              "height": 14,
              "pageIndex": 3,
              "width": 74,
              "x": 173,
              "y": 190,
            },
            "proposed": {
              "align": "center",
              "fontSize": 9,
              "height": 14,
              "pageIndex": 3,
              "width": 74,
              "x": 277,
              "y": 190,
            },
          },
          {
            "current": {
              "align": "center",
              "fontSize": 9,
              "height": 14,
              "pageIndex": 3,
              "width": 74,
              "x": 173,
              "y": 159,
            },
            "proposed": {
              "align": "center",
              "fontSize": 9,
              "height": 14,
              "pageIndex": 3,
              "width": 74,
              "x": 277,
              "y": 159,
            },
          },
          {
            "current": {
              "align": "center",
              "fontSize": 9,
              "height": 14,
              "pageIndex": 3,
              "width": 74,
              "x": 173,
              "y": 128,
            },
            "proposed": {
              "align": "center",
              "fontSize": 9,
              "height": 14,
              "pageIndex": 3,
              "width": 74,
              "x": 277,
              "y": 128,
            },
          },
          {
            "current": {
              "align": "center",
              "fontSize": 9,
              "height": 14,
              "pageIndex": 3,
              "width": 74,
              "x": 173,
              "y": 97,
            },
            "proposed": {
              "align": "center",
              "fontSize": 9,
              "height": 14,
              "pageIndex": 3,
              "width": 74,
              "x": 277,
              "y": 97,
            },
          },
        ],
        "lastIncreaseDay": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 20,
          "x": 70,
          "y": 587,
        },
        "lastIncreaseMonth": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 20,
          "x": 111,
          "y": 587,
        },
        "lastIncreaseYear": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 44,
          "x": 152,
          "y": 587,
        },
        "proposedRentAmount": {
          "fontSize": 10,
          "height": 16,
          "pageIndex": 3,
          "width": 124,
          "x": 74,
          "y": 408,
        },
        "proposedRentFrequency": {
          "fontSize": 10,
          "height": 16,
          "pageIndex": 3,
          "width": 128,
          "x": 286,
          "y": 408,
        },
        "proposedStartDay": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 20,
          "x": 70,
          "y": 353,
        },
        "proposedStartMonth": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 20,
          "x": 111,
          "y": 353,
        },
        "proposedStartYear": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 44,
          "x": 152,
          "y": 353,
        },
        "tenancyStartDay": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 20,
          "x": 70,
          "y": 663,
        },
        "tenancyStartMonth": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 20,
          "x": 111,
          "y": 663,
        },
        "tenancyStartYear": {
          "align": "center",
          "fontSize": 10,
          "height": 14,
          "pageIndex": 3,
          "width": 44,
          "x": 152,
          "y": 663,
        },
      }
    `);
  });

  it('keeps Defensive pack generation to core documents only', async () => {
    const { state, comparables } = buildState();

    const pack = await generateSection13Pack({
      caseId: 'case-section13-test',
      productType: 'section13_defensive',
      state,
      comparables,
      evidenceFiles: [],
    });

    const documentTypes = pack.documents.map((doc) => doc.document_type);

    expect(documentTypes).toEqual(expect.arrayContaining([...SECTION13_DEFENSIVE_DOCUMENT_TYPES]));
    expect(documentTypes).not.toEqual(expect.arrayContaining([...SECTION13_BUNDLE_DOCUMENT_TYPES]));
    expect(pack.workflowStatus).toBe('fulfilled');
  });

  it('renders Form 4A with the expected page count, editable fields, and injected case text', async () => {
    const { state, comparables } = buildState();
    const sourcePath = path.join(process.cwd(), 'public', 'official-forms', 'Form_4A.pdf');
    const sourceBytes = await fs.readFile(sourcePath);
    const sourcePdf = await PDFDocument.load(sourceBytes);

    const docs = await generateSection13CoreDocuments({
      caseId: 'case-section13-test',
      productType: 'section13_standard',
      state,
      comparables,
      evidenceFiles: [],
    });

    const form4A = docs.find((doc) => doc.document_type === 'section13_form_4a');
    expect(form4A).toBeDefined();

      const renderedPdf = await PDFDocument.load(form4A!.pdf);
      expect(renderedPdf.getPageCount()).toBe(sourcePdf.getPageCount());
      expect(renderedPdf.getForm().getFields().length).toBeGreaterThan(40);

      const form = renderedPdf.getForm();
      expect(form.getTextField('form4a_tenant_names').getText()).toContain('Alex Tenant');
      expect(form.getTextField('form4a_tenant_names').getText()).toContain('Jordan Tenant');
      expect(form.getTextField('form4a_property_address_line1').getText()).toBe('10 Sample Road');
      expect(form.getTextField('form4a_property_postcode').getText()).toBe('LS1 1AA');
      expect(form.getTextField('form4a_landlord_name').getText()).toBe('Taylor Landlord');
      expect(form.getTextField('form4a_current_rent_amount').getText()).toBe('1200.00');
      expect(form.getTextField('form4a_first_increase_day').getText()).toBe('01');
      expect(form.getTextField('form4a_first_increase_month').getText()).toBe('04');
      expect(form.getTextField('form4a_first_increase_year').getText()).toBe('2025');
      expect(form.getTextField('form4a_proposed_rent_amount').getText()).toBe('1285.00');
      expect(form.getTextField('form4a_print_name').getText()).toBe('Taylor Landlord');
      expect(form.getFieldMaybe('form4a_service_method')).toBeUndefined();
      expect(form.getFieldMaybe('form4a_supporting_reference')).toBeUndefined();
      expect(form.getFieldMaybe('form4a_final_signature')).toBeUndefined();

  }, 120000);

  it('keeps editable Form 4A field widgets inside the intended amount, date, and charges cells', async () => {
      const { state, comparables } = buildState();
      const overlay =
        FORM_4A_OVERLAY_MAP['england_assured_section13_2026-05-01'][SECTION13_FORM_4A_VERSION];

    const docs = await generateSection13CoreDocuments({
      caseId: 'case-section13-page4-validation',
      productType: 'section13_standard',
      state,
      comparables,
      evidenceFiles: [],
    });

      const form4A = docs.find((doc) => doc.document_type === 'section13_form_4a');
      expect(form4A).toBeDefined();

      const renderedPdf = await PDFDocument.load(form4A!.pdf);

      expectFieldWithin(renderedPdf, 'form4a_current_rent_amount', overlay.currentRentAmount);
      expectFieldWithin(renderedPdf, 'form4a_current_rent_frequency', overlay.currentRentFrequency);
      expectFieldWithin(renderedPdf, 'form4a_tenancy_start_day', overlay.tenancyStartDay);
      expectFieldWithin(renderedPdf, 'form4a_tenancy_start_month', overlay.tenancyStartMonth);
      expectFieldWithin(renderedPdf, 'form4a_tenancy_start_year', overlay.tenancyStartYear);
      expectFieldWithin(renderedPdf, 'form4a_last_increase_day', overlay.lastIncreaseDay);
      expectFieldWithin(renderedPdf, 'form4a_last_increase_month', overlay.lastIncreaseMonth);
      expectFieldWithin(renderedPdf, 'form4a_last_increase_year', overlay.lastIncreaseYear);
      expectFieldWithin(renderedPdf, 'form4a_proposed_rent_amount', overlay.proposedRentAmount);
      expectFieldWithin(renderedPdf, 'form4a_proposed_rent_frequency', overlay.proposedRentFrequency);
      expectFieldWithin(renderedPdf, 'form4a_proposed_start_day', overlay.proposedStartDay);
      expectFieldWithin(renderedPdf, 'form4a_proposed_start_month', overlay.proposedStartMonth);
      expectFieldWithin(renderedPdf, 'form4a_proposed_start_year', overlay.proposedStartYear);

      overlay.includedChargeRows.forEach((fields, index) => {
        expectFieldWithin(renderedPdf, `form4a_included_charge_${index + 1}_current`, fields.current);
        expectFieldWithin(renderedPdf, `form4a_included_charge_${index + 1}_proposed`, fields.proposed);
      });
    }, 120000);

  it('uses tribunal-ready empty-evidence wording and Section 13 proof-of-service branding', async () => {
    const { state, comparables } = buildState();

    const docs = await generateSection13CoreDocuments({
      caseId: 'case-section13-defensive-test',
      productType: 'section13_defensive',
      state,
      comparables,
      evidenceFiles: [],
    });

    const evidenceChecklist = docs.find((doc) => doc.document_type === 'section13_evidence_checklist');
    const proofOfService = docs.find((doc) => doc.document_type === 'section13_proof_of_service_record');

    expect(evidenceChecklist).toBeDefined();
    expect(proofOfService).toBeDefined();

    const evidenceText = (await extractPdfText(evidenceChecklist!.pdf)).text.replace(/\s+/g, ' ').trim();
    expect(evidenceText).toContain(
      'No additional external evidence has been uploaded. This bundle currently relies on the comparable analysis and generated core documents.'
    );
    expect(evidenceText).not.toContain('No external evidence uploaded yet');

    const proofText = (await extractPdfText(proofOfService!.pdf)).text.replace(/\s+/g, ' ').trim();
    expect(proofText).toContain('Generated by Landlord Heaven');
    expect(proofText).not.toContain('Generated by Landlord Heaven Court Pack');
  }, 120000);

  it('elevates the Standard cover letter with clearer next steps', async () => {
    const { state, comparables } = buildState();

    const docs = await generateSection13CoreDocuments({
      caseId: 'case-section13-standard-cover-letter',
      productType: 'section13_standard',
      state,
      comparables,
      evidenceFiles: [],
    });

    const coverLetter = docs.find((doc) => doc.document_type === 'section13_cover_letter');
    expect(coverLetter).toBeDefined();

    const coverText = (await extractPdfText(coverLetter!.pdf)).text.replace(/\s+/g, ' ').trim();
    expect(coverText).toContain('This cover letter explains the proposed rent increase and points the tenant to the notice and supporting evidence.');
    expect(coverText).toContain('This proposed rent is supported by 8 comparable two-bedroom properties within 0.5 miles');
    expect(coverText).toContain('What to do now');
    expect(coverText).toContain('Serve Form 4A correctly');
    expect(coverText).toContain('Keep the proof of service record');
    expect(coverText).toContain('Retain the justification report');
  }, 120000);

  it('adds the Tribunal Argument Summary and places it directly after the justification report in the bundle', async () => {
    const { state, comparables } = buildState();

    const docs = await generateSection13CoreDocuments({
      caseId: 'case-section13-defensive-bundle',
      productType: 'section13_defensive',
      state,
      comparables,
      evidenceFiles: [],
    });

    const argumentSummary = docs.find((doc) => doc.document_type === 'section13_tribunal_argument_summary');
    expect(argumentSummary).toBeDefined();

    const argumentText = (await extractPdfText(argumentSummary!.pdf)).text.replace(/\s+/g, ' ').trim();
    expect(argumentText).toContain('Tribunal Argument Summary');
    expect(argumentText).toContain("This is the landlord's concise argument brief for the hearing file.");
    expect(argumentText).toContain('The proposed rent of £1285.00 per month is supported by current comparable evidence');
    expect(argumentText).toContain('If challenged, say this');
    expect(argumentText).toContain('1. Anchor to evidence');
    expect(argumentText).toContain('2. Position in the range');
    expect(argumentText).toContain('3. Strength of evidence');
    expect(argumentText).toContain('4. Bundle integrity');

    const bundle = await generateSection13TribunalBundle({
      caseId: 'case-section13-defensive-bundle',
      state,
      evidenceFiles: [],
      sourceDocuments: docs.map((doc) => ({
        title: doc.title,
        description: doc.description,
        document_type: doc.document_type,
        file_name: doc.file_name,
        pdf: doc.pdf,
      })),
    });

    const mergedTitles = bundle.bundleAssets
      .filter((asset) => asset.includeInMerged)
      .map((asset) => asset.title);

    expect(mergedTitles.indexOf('Rent increase justification report')).toBeGreaterThan(-1);
    expect(mergedTitles.indexOf('Tribunal Argument Summary')).toBe(
      mergedTitles.indexOf('Rent increase justification report') + 1
    );
  }, 120000);

  it('adds premium key summary blocks and distinct case-position phrasing across narrative documents', async () => {
    const { state, comparables } = buildState();

    const docs = await generateSection13CoreDocuments({
      caseId: 'case-section13-premium-phrasing',
      productType: 'section13_defensive',
      state,
      comparables,
      evidenceFiles: [],
    });

    const coverLetter = docs.find((doc) => doc.document_type === 'section13_cover_letter');
    const justificationReport = docs.find((doc) => doc.document_type === 'section13_justification_report');
    const argumentSummary = docs.find((doc) => doc.document_type === 'section13_tribunal_argument_summary');
    const defenceGuide = docs.find((doc) => doc.document_type === 'section13_tribunal_defence_guide');

    expect(coverLetter).toBeDefined();
    expect(justificationReport).toBeDefined();
    expect(argumentSummary).toBeDefined();
    expect(defenceGuide).toBeDefined();

    const coverText = (await extractPdfText(coverLetter!.pdf)).text.replace(/\s+/g, ' ').trim();
    const justificationText = (await extractPdfText(justificationReport!.pdf)).text.replace(/\s+/g, ' ').trim();
    const argumentText = (await extractPdfText(argumentSummary!.pdf)).text.replace(/\s+/g, ' ').trim();
    const defenceText = (await extractPdfText(defenceGuide!.pdf)).text.replace(/\s+/g, ' ').trim();

    expect(justificationText).toContain('Key points');
    expect(justificationText).toContain('Comparable overview');
    expect(justificationText).toContain('Comparable base: 8 comparable two-bedroom properties within 0.5 miles');

    expect(coverText).toContain(
      'This proposed rent is supported by 8 comparable two-bedroom properties within 0.5 miles'
    );
    expect(justificationText).toContain(
      'The recorded comparables support the proposed rent and place it below the adjusted median'
    );
    expect(argumentText).toContain(
      "The landlord relies on the comparable evidence in this file and says the proposed rent of £1285.00 per month should be judged against that market evidence, not against the size of the increase alone."
    );
    expect(defenceText).toContain(
      "The landlord relies on the comparable evidence in this file and says the proposed rent of £1285.00 per month should be judged against that market evidence, not against the size of the increase alone."
    );
    expect(coverText).not.toContain('The recorded comparables support the proposed rent and place it below the adjusted median');
    expect(justificationText).not.toContain('This proposed rent is supported by 8 comparable two-bedroom properties within 0.5 miles');
  }, 120000);
});
