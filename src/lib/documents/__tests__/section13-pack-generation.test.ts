import fs from 'fs/promises';
import path from 'path';

import { describe, expect, it } from 'vitest';
import { PDFCheckBox, PDFDocument, PDFTextField } from 'pdf-lib';

import {
  FORM_4A_OFFICIAL_FIELD_NAMES,
  generateSection13CoreDocuments,
  generateSection13Pack,
  generateSection13TribunalBundle,
  SECTION13_BUNDLE_DOCUMENT_TYPES,
  SECTION13_DEFENSIVE_DOCUMENT_TYPES,
} from '@/lib/documents/section13-generator';
import { extractPdfText } from '@/lib/evidence/extract-pdf-text';
import { createEmptySection13State } from '@/lib/section13/facts';
import { computeSection13Preview } from '@/lib/section13/rules';
import type { Section13Comparable } from '@/lib/section13/types';

function buildComparable(index: number, monthlyEquivalent: number): Section13Comparable {
  const localComparables = [
    { address: 'Flat 2, The Calls, Leeds LS1', postcode: 'LS1 7BR', distance: 0.2 },
    { address: 'Apartment 14, Sovereign Street, Leeds LS1', postcode: 'LS1 4BA', distance: 0.3 },
    { address: 'Flat 5, Brewery Wharf, Leeds LS10', postcode: 'LS10 1NE', distance: 0.4 },
    { address: 'Apartment 8, Park Row, Leeds LS1', postcode: 'LS1 5HD', distance: 0.4 },
    { address: 'Flat 11, Riverside Court, Leeds LS1', postcode: 'LS1 4AW', distance: 0.5 },
    { address: 'Apartment 6, Wellington Street, Leeds LS1', postcode: 'LS1 2DE', distance: 0.5 },
    { address: 'Flat 3, Dock Street, Leeds LS10', postcode: 'LS10 1JF', distance: 0.5 },
    { address: 'Apartment 21, East Parade, Leeds LS1', postcode: 'LS1 2BH', distance: 0.5 },
  ];
  const comparable = localComparables[index] ?? localComparables[0];

  return {
    source: 'scraped',
    sourceUrl: `https://example.com/leeds-rent-comparable-${index + 1}`,
    sourceDateKind: 'published',
    sourceDateValue: '2026-03-15',
    addressSnippet: comparable.address,
    postcodeNormalized: comparable.postcode,
    distanceMiles: comparable.distance,
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

function listFieldNames(pdfDoc: PDFDocument): string[] {
  return pdfDoc
    .getForm()
    .getFields()
    .map((field) => field.getName())
    .sort();
}

function expectFieldMatchesSource(
  sourcePdf: PDFDocument,
  fieldName: string,
  renderedPdf: PDFDocument
) {
  expect(getFieldRectangle(renderedPdf, fieldName)).toEqual(getFieldRectangle(sourcePdf, fieldName));
}

function getNormalizedTextFieldValue(pdfDoc: PDFDocument, fieldName: string): string {
  return pdfDoc.getForm().getTextField(fieldName).getText() ?? '';
}

const MAY_OFFICIAL_FORM_4A_FIELD_NAMES = [
  ...Object.values(FORM_4A_OFFICIAL_FIELD_NAMES.text),
  ...Object.values(FORM_4A_OFFICIAL_FIELD_NAMES.checkboxes),
  ...FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows.flatMap(({ current, proposed }) => [current, proposed]),
].sort();

describe('Section 13 document generation hardening', () => {
  it('pins the May official Form 4A field inventory for the live asset', async () => {
    const sourcePath = path.join(process.cwd(), 'public', 'official-forms', 'Form_4A.pdf');
    const sourceBytes = await fs.readFile(sourcePath);
    const sourcePdf = await PDFDocument.load(sourceBytes);

    expect(sourcePdf.getPageCount()).toBe(9);
    expect(listFieldNames(sourcePdf)).toEqual(MAY_OFFICIAL_FORM_4A_FIELD_NAMES);
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
    expect(listFieldNames(renderedPdf)).toEqual(MAY_OFFICIAL_FORM_4A_FIELD_NAMES);

    const form = renderedPdf.getForm();
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.tenantNames).getText()).toContain('Alex Tenant');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.tenantNames).getText()).toContain('Jordan Tenant');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.propertyAddressLine1).getText()).toBe('10 Sample Road');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.propertyPostcode).getText()).toBe('LS11AA');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.landlordName).getText()).toBe('Taylor Landlord');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.currentRentAmount).getText()).toBe('1200.00');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.currentRentFrequency).getText()).toBe('Monthly');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.firstIncreaseDate).getText()).toBe('01042025');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.proposedRentAmount).getText()).toBe('1285.00');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.proposedRentFrequency).getText()).toBe('Monthly');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.printName).getText()).toBe('Taylor Landlord');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.signatureDate).getText()).toBe('25032026');
    expect(form.getCheckBox(FORM_4A_OFFICIAL_FIELD_NAMES.checkboxes.signAsLandlord).isChecked()).toBe(true);
    expect(form.getCheckBox(FORM_4A_OFFICIAL_FIELD_NAMES.checkboxes.signAsAgent).isChecked()).toBe(false);
    expect(form.getFieldMaybe('form4a_service_method')).toBeUndefined();
    expect(form.getFieldMaybe('form4a_supporting_reference')).toBeUndefined();
    expect(form.getFieldMaybe('form4a_final_signature')).toBeUndefined();

  }, 120000);

  it('maps every native Form 4A field from the Section 13 state into the official May PDF', async () => {
    const { state, comparables } = buildState();
    state.tenancy.propertyAddressLine2 = 'Flat 2';
    state.landlord.landlordAddressLine2 = 'Suite 4';
    state.landlord.agentName = 'Priya Agent';
    state.landlord.agentAddressLine1 = '99 Agency Parade';
    state.landlord.agentAddressLine2 = 'Floor 3';
    state.landlord.agentTownCity = 'Leeds';
    state.landlord.agentPostcodeRaw = 'LS3 3CC';
    state.landlord.agentPostcodeNormalized = 'LS3 3CC';
    state.landlord.agentPhone = '01135550999';
    state.landlord.agentEmail = 'agent@example.com';
    state.includedCharges = [
      { key: 'council_tax', label: 'Council tax', included: true, currentAmount: 150, proposedAmount: 165 },
      { key: 'water', label: 'Water', included: false, currentAmount: null, proposedAmount: null },
      { key: 'electricity_gas_fuel', label: 'Electricity / gas / fuel', included: true, currentAmount: 95.5, proposedAmount: 98.25 },
      { key: 'communication_services', label: 'Communication services', included: false, currentAmount: null, proposedAmount: null },
      { key: 'fixed_service_charges', label: 'Fixed service charges', included: true, currentAmount: 45, proposedAmount: 45 },
    ];

    const docs = await generateSection13CoreDocuments({
      caseId: 'case-section13-full-field-audit',
      productType: 'section13_standard',
      state,
      comparables,
      evidenceFiles: [],
    });

    const form4A = docs.find((doc) => doc.document_type === 'section13_form_4a');
    expect(form4A).toBeDefined();

    const pdfDoc = await PDFDocument.load(form4A!.pdf);
    const form = pdfDoc.getForm();

    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.tenantNames).getText()).toBe('Alex Tenant\nJordan Tenant');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.propertyAddressLine1).getText()).toBe('10 Sample Road');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.propertyAddressLine2).getText()).toBe('Flat 2');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.propertyTownCity).getText()).toBe('Leeds');
    expect(getNormalizedTextFieldValue(pdfDoc, FORM_4A_OFFICIAL_FIELD_NAMES.text.propertyCounty)).toBe('');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.propertyPostcode).getText()).toBe('LS11AA');

    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.landlordName).getText()).toBe('Taylor Landlord');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.landlordAddressLine1).getText()).toBe('1 Landlord Terrace');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.landlordAddressLine2).getText()).toBe('Suite 4');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.landlordTownCity).getText()).toBe('Leeds');
    expect(getNormalizedTextFieldValue(pdfDoc, FORM_4A_OFFICIAL_FIELD_NAMES.text.landlordCounty)).toBe('');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.landlordPostcode).getText()).toBe('LS22BB');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.landlordPhone).getText()).toBe('01130000000');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.landlordEmail).getText()).toBe('landlord@example.com');

    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.agentName).getText()).toBe('Priya Agent');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.agentAddressLine1).getText()).toBe('99 Agency Parade');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.agentAddressLine2).getText()).toBe('Floor 3');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.agentTownCity).getText()).toBe('Leeds');
    expect(getNormalizedTextFieldValue(pdfDoc, FORM_4A_OFFICIAL_FIELD_NAMES.text.agentCounty)).toBe('');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.agentPostcode).getText()).toBe('LS33CC');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.agentPhone).getText()).toBe('01135550999');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.agentEmail).getText()).toBe('agent@example.com');

    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.currentRentAmount).getText()).toBe('1200.00');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.currentRentFrequency).getText()).toBe('Monthly');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.tenancyStartDate).getText()).toBe('01032025');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.lastIncreaseDate).getText()).toBe('01042025');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.firstIncreaseDate).getText()).toBe('01042025');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.proposedRentAmount).getText()).toBe('1285.00');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.proposedRentFrequency).getText()).toBe('Monthly');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.proposedStartDate).getText()).toBe('01062026');

    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows[0].current).getText()).toBe('150.00');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows[0].proposed).getText()).toBe('165.00');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows[1].current).getText()).toBe('nil');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows[1].proposed).getText()).toBe('nil');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows[2].current).getText()).toBe('95.50');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows[2].proposed).getText()).toBe('98.25');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows[3].current).getText()).toBe('nil');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows[3].proposed).getText()).toBe('nil');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows[4].current).getText()).toBe('45.00');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows[4].proposed).getText()).toBe('45.00');

    expect(form.getCheckBox(FORM_4A_OFFICIAL_FIELD_NAMES.checkboxes.signAsLandlord).isChecked()).toBe(false);
    expect(form.getCheckBox(FORM_4A_OFFICIAL_FIELD_NAMES.checkboxes.signAsAgent).isChecked()).toBe(true);
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.signature).getText()).toBe('Priya Agent');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.printName).getText()).toBe('Priya Agent');
    expect(form.getTextField(FORM_4A_OFFICIAL_FIELD_NAMES.text.signatureDate).getText()).toBe('25032026');

    expect(getNormalizedTextFieldValue(pdfDoc, FORM_4A_OFFICIAL_FIELD_NAMES.text.jointSignatory1)).toBe('');
    expect(getNormalizedTextFieldValue(pdfDoc, FORM_4A_OFFICIAL_FIELD_NAMES.text.jointSignatory2)).toBe('');
    expect(getNormalizedTextFieldValue(pdfDoc, FORM_4A_OFFICIAL_FIELD_NAMES.text.jointSignatory3)).toBe('');
    expect(getNormalizedTextFieldValue(pdfDoc, FORM_4A_OFFICIAL_FIELD_NAMES.text.continuationText)).toBe('');
    expect(getNormalizedTextFieldValue(pdfDoc, FORM_4A_OFFICIAL_FIELD_NAMES.text.continuationSignature)).toBe('');
    expect(getNormalizedTextFieldValue(pdfDoc, FORM_4A_OFFICIAL_FIELD_NAMES.text.continuationDate)).toBe('');
  }, 120000);

  it('keeps native May Form 4A widgets aligned with the source official PDF', async () => {
    const { state, comparables } = buildState();
    const sourcePath = path.join(process.cwd(), 'public', 'official-forms', 'Form_4A.pdf');
    const sourceBytes = await fs.readFile(sourcePath);
    const sourcePdf = await PDFDocument.load(sourceBytes);

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

    [
      FORM_4A_OFFICIAL_FIELD_NAMES.text.currentRentAmount,
      FORM_4A_OFFICIAL_FIELD_NAMES.text.currentRentFrequency,
      FORM_4A_OFFICIAL_FIELD_NAMES.text.tenancyStartDate,
      FORM_4A_OFFICIAL_FIELD_NAMES.text.lastIncreaseDate,
      FORM_4A_OFFICIAL_FIELD_NAMES.text.firstIncreaseDate,
      FORM_4A_OFFICIAL_FIELD_NAMES.text.proposedRentAmount,
      FORM_4A_OFFICIAL_FIELD_NAMES.text.proposedRentFrequency,
      FORM_4A_OFFICIAL_FIELD_NAMES.text.proposedStartDate,
      ...FORM_4A_OFFICIAL_FIELD_NAMES.includedChargeRows.flatMap(({ current, proposed }) => [current, proposed]),
    ].forEach((fieldName) => {
      expectFieldMatchesSource(sourcePdf, fieldName, renderedPdf);
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

    const proofOfService = docs.find((doc) => doc.document_type === 'section13_proof_of_service_record');

    expect(docs.some((doc) => doc.document_type === 'section13_evidence_checklist')).toBe(false);
    expect(docs.some((doc) => doc.document_type === 'section13_negotiation_email_template')).toBe(false);
    expect(proofOfService).toBeDefined();

    const proofText = (await extractPdfText(proofOfService!.pdf)).text.replace(/\s+/g, ' ').trim();
    expect(proofText).toContain('Generated by Landlord Heaven');
    expect(proofText).not.toContain('Generated by Landlord Heaven Court Pack');

    const proofPdf = await PDFDocument.load(proofOfService!.pdf);
    const proofForm = proofPdf.getForm();
    expect(proofForm.getTextField('landlord_name').getText()).toBe('Taylor Landlord');
    expect(proofForm.getTextField('tenant_name').getText()).toBe('Alex Tenant, Jordan Tenant');
    expect(proofForm.getTextField('property_address').getText()).toBe('10 Sample Road, Leeds, LS1 1AA');
    expect(proofForm.getTextField('document_served').getText()).toBe(
      "Form 4A - Landlord's notice proposing a new rent"
    );
    expect(proofForm.getTextField('service_date').getText()).toBe('25/03/2026');
    expect(proofForm.getTextField('service_address').getText()).toBe('10 Sample Road, Leeds, LS1 1AA');
    expect(proofForm.getCheckBox('method_post').isChecked()).toBe(true);
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
    expect(justificationText).toContain('Flat 2, The Calls, Leeds LS1');

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
