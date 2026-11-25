import fs from 'fs/promises';
import path from 'path';

import { generateDocument } from '../src/lib/documents/generator';

const OUTPUT_DIR = path.join(process.cwd(), 'tmp', 'pdfs', 'section8-support-premium');

const baseData = {
  jurisdiction: 'England',
  generation_date: '2026-11-24',
  current_date: '2026-11-24',
  case_id: 'S8-DESIGN-QA-001',
  case_reference: 'S8-DESIGN-QA-001',
  claim_reference: 'S8-DESIGN-QA-001',
  pack_title: 'Section 8 Notice & Service Pack',
  notice_name: 'Form 3A Section 8 notice',
  status_label: 'Ready for final review',
  pack_supporting_line: 'Keep the notice, service evidence and supporting records aligned throughout the case.',
  risk_line: 'Check every date and factual entry against the signed tenancy and current records.',
  property_address: '14 The Courtyard, 187 Long Residential Avenue, Leeds, West Yorkshire, LS12 4AB',
  property_full_address: '14 The Courtyard, 187 Long Residential Avenue, Leeds, West Yorkshire, LS12 4AB',
  tenant_full_name: 'Christopher James Richardson',
  tenant_2_name: 'Eleanor Margaret Richardson',
  landlord_full_name: 'Alexandra Catherine Montgomery',
  tenancy_start_date: '2025-11-01',
  tenancy_start_date_formatted: '1 November 2025',
  service_date: '2026-11-25',
  service_date_formatted: '25 November 2026',
  notice_expiry_date_formatted: '23 December 2026',
  earliest_proceedings_date_formatted: '24 December 2026',
  latest_proceedings_date_formatted: '24 November 2027',
  groundsReliedUpon: 'Ground 8, Ground 10 and Ground 11',
  ground_descriptions: 'Ground 8 - serious rent arrears; Ground 10 - rent arrears; Ground 11 - persistent delay',
  has_arrears_grounds: true,
  has_mandatory_ground: true,
  service_method: 'post',
  clean_output: false,
  generated_date: '24 November 2026',
  drafting_model: {
    serviceInstructions: { overviewParagraphs: [] },
    validityChecklist: {
      overviewParagraphs: [],
      serviceEvidenceItems: [],
      validityItems: [],
      afterServiceItems: [],
      riskParagraphs: [],
    },
  },
};

const documents = [
  {
    fileName: '08-money-claim-evidence-index.pdf',
    templatePath: 'uk/england/templates/money_claims/evidence_index.hbs',
    data: baseData,
  },
  {
    fileName: '01-service-instructions.pdf',
    templatePath: 'uk/england/templates/eviction/service_instructions_section_8.hbs',
    data: baseData,
  },
  {
    fileName: '02-validity-checklist.pdf',
    templatePath: 'uk/england/templates/eviction/checklist_section_8.hbs',
    data: baseData,
  },
  {
    fileName: '03-compliance-review.pdf',
    templatePath: 'uk/england/templates/eviction/compliance_checklist.hbs',
    data: {
      ...baseData,
      checklist_title: 'Pre-service compliance review',
      compliance_status_items: [
        { severity: 'ok', title: 'Tenancy record located', detail: 'The signed tenancy is recorded in the file.', action: 'Keep the complete signed copy with the case evidence.' },
        { severity: 'risk', title: 'Deposit evidence needs checking', detail: 'Protection evidence is present but the prescribed information record is not confirmed.', action: 'Check the deposit file and retain the evidence before service.' },
        { severity: 'ok', title: 'Electrical safety record located', detail: 'A satisfactory current EICR is recorded.', action: 'Keep the report with the property compliance documents.' },
      ],
      key_risk_titles: ['Deposit evidence needs checking'],
      primary_status_item: {
        title: 'Deposit evidence needs checking',
        detail: 'The record should be checked before the pack is relied upon.',
        action: 'Confirm the supporting evidence and retain it with the tenancy file.',
      },
      next_step_text: 'Complete the remaining evidence check, then sign and serve the notice using the service instructions.',
    },
  },
  {
    fileName: '04-rent-arrears-schedule.pdf',
    templatePath: 'uk/england/templates/money_claims/schedule_of_arrears.hbs',
    data: {
      ...baseData,
      pack_context_label: 'Stage 1: Section 8 Notice & Service Pack',
      claimant_reference: 'S8-DESIGN-QA-001',
      claimant_display_name: 'Alexandra Catherine Montgomery',
      defendant_display_name: 'Christopher James Richardson and Eleanor Margaret Richardson',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      payment_day: 1,
      arrears_total: 6800,
      arrears_schedule: [
        { period: 'August 2026', due_date: '01/08/2026', amount_due: 1200, amount_paid: 0, arrears: 1200, running_balance: 1200 },
        { period: 'September 2026', due_date: '01/09/2026', amount_due: 1200, amount_paid: 0, arrears: 1200, running_balance: 2400 },
        { period: 'October 2026', due_date: '01/10/2026', amount_due: 1200, amount_paid: 400, arrears: 800, running_balance: 3200 },
        { period: 'November 2026', due_date: '01/11/2026', amount_due: 1200, amount_paid: 0, arrears: 1200, running_balance: 4400 },
        { period: 'December 2026', due_date: '01/12/2026', amount_due: 1200, amount_paid: 0, arrears: 1200, running_balance: 5600 },
        { period: 'January 2027', due_date: '01/01/2027', amount_due: 1200, amount_paid: 0, arrears: 1200, running_balance: 6800 },
      ],
      schedule_calculation_notes: [],
    },
  },
  {
    fileName: '05-what-happens-next.pdf',
    templatePath: 'uk/england/templates/eviction/what_happens_next_section_8.hbs',
    data: {
      ...baseData,
      next_step_text: 'Serve the notice, preserve the service evidence and allow the full notice period to expire.',
      next_steps: [
        { step: 1, title: 'Sign and date the notice', detail: 'Check the final notice and sign it before any copy is served.' },
        { step: 2, title: 'Serve and record', detail: 'Use the selected method and create the service record immediately.' },
        { step: 3, title: 'Keep the case current', detail: 'Continue updating the rent account and retaining correspondence.' },
        { step: 4, title: 'Review at expiry', detail: 'If possession has not been returned, review the evidence before issuing a claim.' },
      ],
      pack_stage: 'stage1',
    },
  },
  {
    fileName: '06-service-continuity.pdf',
    templatePath: 'uk/england/templates/eviction/service_record_notes.hbs',
    data: baseData,
  },
  {
    fileName: '07-possession-hearing-checklist.pdf',
    templatePath: 'uk/england/templates/eviction/hearing_checklist.hbs',
    data: {
      ...baseData,
      court_name: 'Leeds Combined Court Centre',
      notice_service_date: '2026-11-25',
      notice_expiry_date: '2026-12-23',
      earliest_proceedings_date: '2026-12-24',
      latest_proceedings_date: '2027-11-24',
      ground8_threshold_label: 'At least two months of rent unpaid where rent is payable monthly.',
      drafting_model: {
        ...baseData.drafting_model,
        hearingChecklist: {
          overviewParagraphs: [],
          beforeItems: [],
          documentItems: [],
          atHearingItems: [],
          warningParagraphs: [],
          contingencyItems: [],
        },
      },
    },
  },
];

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const requestedFile = process.argv[2];
  const selectedDocuments = requestedFile
    ? documents.filter(document => document.fileName === requestedFile)
    : documents;

  if (requestedFile && selectedDocuments.length === 0) {
    throw new Error(`Unknown sample document: ${requestedFile}`);
  }

  for (const document of selectedDocuments) {
    const result = await generateDocument({
      templatePath: document.templatePath,
      data: document.data,
      isPreview: false,
      outputFormat: 'both',
    });

    if (!result.pdf) {
      throw new Error(`No PDF was generated for ${document.templatePath}`);
    }

    const outputPath = path.join(OUTPUT_DIR, document.fileName);
    await fs.writeFile(outputPath, result.pdf);
    console.log(`${document.fileName}: ${result.pdf.length} bytes`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
