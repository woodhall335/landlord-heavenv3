import fs from 'fs/promises';
import path from 'path';

import { __setTestJsonAIClient } from '@/lib/ai/openai-client';
import { fillOfficialForm, type CaseData } from '@/lib/documents/official-forms-filler';
import { generateDocument } from '@/lib/documents/generator';
import { generateProofOfServicePDF } from '@/lib/documents/proof-of-service-generator';
import { getArrearsScheduleData } from '@/lib/documents/arrears-schedule-mapper';
import {
  buildWitnessStatementSections,
  extractWitnessStatementSectionsInput,
} from '@/lib/documents/witness-statement-sections';
import { enrichEnglandSection8SupportContext } from '@/lib/england-possession/support-document-context';
import { getSelectedGrounds } from '@/lib/grounds';
import { buildEnglandSection8CompletePackFacts } from '@/lib/testing/fixtures/complete-pack';

type WizardFacts = Record<string, any>;

type ScenarioConfig = {
  slug: string;
  title: string;
  groundCodes: string[];
  noticeExpiryDate: string;
  description: string;
  noticeOnlyOverrides?: Record<string, any>;
  completeOverrides?: Record<string, any>;
};

type SavedDoc = {
  title: string;
  path: string;
};

type PackManifest = {
  generatedAt: string;
  scenario: string;
  grounds: string[];
  product: 'notice_only' | 'complete_pack';
  documents: Array<{ title: string; file: string }>;
};

function timestampSlug(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function buildAddress(...parts: Array<string | null | undefined>): string {
  return parts
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part.trim())
    .join('\n');
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toGroundLabels(codes: string[]): string[] {
  return codes.map((code) => `Ground ${String(code).replace(/^Ground\s+/i, '').trim().toUpperCase()}`);
}

function buildNoticeOnlyBaseFacts(): WizardFacts {
  return {
    jurisdiction: 'england',
    selected_notice_route: 'section_8',
    eviction_route: 'section_8',
    product: 'notice_only',
    __meta: {
      product: 'notice_only',
      jurisdiction: 'england',
    },
    landlord_profile: 'private_landlord',
    landlord_full_name: 'Daniel Mercer',
    landlord_address_line1: '27 Rowan Avenue',
    landlord_city: 'Leeds',
    landlord_county: 'West Yorkshire',
    landlord_postcode: 'LS8 2PF',
    landlord_phone: '01132225555',
    landlord_email: 'daniel.mercer@example.com',
    tenant_full_name: 'Ivy Carleton',
    tenant_2_name: '',
    property_address_line1: '16 Willow Mews',
    property_city: 'York',
    property_county: 'North Yorkshire',
    property_postcode: 'YO24 3HX',
    tenancy_type: 'assured',
    tenancy_start_date: '2024-02-01',
    is_fixed_term: false,
    rent_amount: 1200,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    deposit_taken: true,
    deposit_amount: 1200,
    deposit_protected: true,
    deposit_scheme_name: 'DPS',
    deposit_protection_date: '2024-02-05',
    notice_served_date: '2026-06-01',
    notice_service_method: 'first_class_post',
    signatory_name: 'Daniel Mercer',
    signatory_capacity: 'landlord',
    signature_date: '2026-06-01',
    section_16e_duties_checked: true,
    breathing_space_checked: true,
    tenant_in_breathing_space: false,
    evidence_bundle_ready: true,
    ground_1a_reletting_acknowledged: true,
    court_name: 'York County Court and Family Court',
    court_address: 'Piccadilly House, 55 Piccadilly, York YO1 9WL',
  };
}

function buildCompletePackBaseFacts(): WizardFacts {
  return buildEnglandSection8CompletePackFacts({
    overrides: {
      __meta: {
        product: 'complete_pack',
        jurisdiction: 'england',
      },
      landlord_name: 'Daniel Mercer',
      landlord_full_name: 'Daniel Mercer',
      landlord_address_line1: '27 Rowan Avenue',
      landlord_city: 'Leeds',
      landlord_county: 'West Yorkshire',
      landlord_postcode: 'LS8 2PF',
      landlord_email: 'daniel.mercer@example.com',
      landlord_phone: '01132225555',
      tenant1_name: 'Ivy Carleton',
      tenant_full_name: 'Ivy Carleton',
      property_address_line1: '16 Willow Mews',
      property_city: 'York',
      property_county: 'North Yorkshire',
      property_postcode: 'YO24 3HX',
      tenancy_start_date: '2024-02-01',
      notice_date: '2026-06-01',
      notice_served_date: '2026-06-01',
      notice_service_method: 'first_class_post',
      court_name: 'York County Court and Family Court',
      clean_output: true,
      court_mode: true,
    },
  });
}

function buildScenarioFacts(product: 'notice_only' | 'complete_pack', scenario: ScenarioConfig): WizardFacts {
  const base = product === 'notice_only' ? buildNoticeOnlyBaseFacts() : buildCompletePackBaseFacts();
  const groundLabels = toGroundLabels(scenario.groundCodes);

  base.selected_grounds = groundLabels;
  base.section8_grounds = groundLabels;
  base.ground_codes = groundLabels;
  base.notice_expiry_date = scenario.noticeExpiryDate;
  base.earliest_possession_date = scenario.noticeExpiryDate;
  base.earliest_proceedings_date = scenario.noticeExpiryDate;
  base.section8_details = scenario.description;
  base.ground_particulars = scenario.description;
  base.section_8_particulars = scenario.description;
  base.particulars_of_claim = scenario.description;

  if (!scenario.groundCodes.some((code) => ['8', '10', '11'].includes(code))) {
    base.total_arrears = 0;
    base.rent_arrears_amount = 0;
    base.arrears_at_notice_date = 0;
    base.arrears_breakdown = '';
    base.arrears_items = [];
  }

  Object.assign(base, deepClone(product === 'notice_only' ? (scenario.noticeOnlyOverrides || {}) : (scenario.completeOverrides || {})));
  return base;
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeBytes(outputPath: string, bytes: Buffer | Uint8Array): Promise<void> {
  await fs.writeFile(outputPath, Buffer.from(bytes));
}

async function writeText(outputPath: string, text: string): Promise<void> {
  await fs.writeFile(outputPath, text, 'utf8');
}

async function writeManifest(
  outputDir: string,
  scenario: ScenarioConfig,
  product: 'notice_only' | 'complete_pack',
  docs: SavedDoc[],
): Promise<void> {
  const manifest: PackManifest = {
    generatedAt: new Date().toISOString(),
    scenario: scenario.slug,
    grounds: [...scenario.groundCodes],
    product,
    documents: docs.map((doc) => ({
      title: doc.title,
      file: path.basename(doc.path),
    })),
  };

  await writeText(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

function stripGroundPrefix(value: string): string {
  return String(value).replace(/^Ground\s+/i, '').trim();
}

function buildOfficialFormData(wizardFacts: WizardFacts): CaseData {
  const selectedGrounds = getSelectedGrounds(wizardFacts);
  const propertyAddress = buildAddress(
    wizardFacts.property_address_line1,
    wizardFacts.property_address_line2,
    wizardFacts.property_city,
    wizardFacts.property_county,
    wizardFacts.property_postcode,
  );
  const landlordAddress = buildAddress(
    wizardFacts.landlord_address_line1,
    wizardFacts.landlord_address_line2,
    wizardFacts.landlord_city,
    wizardFacts.landlord_county,
    wizardFacts.landlord_postcode,
  );
  const landlordName = wizardFacts.landlord_full_name || wizardFacts.landlord_name;
  const tenantName = wizardFacts.tenant_full_name || wizardFacts.tenant1_name;

  return {
    landlord_full_name: landlordName,
    landlord_name: landlordName,
    claimant_name: landlordName,
    tenant_full_name: tenantName,
    tenant_name: tenantName,
    defendant_name: tenantName,
    tenant1_name: tenantName,
    landlord_address: landlordAddress,
    property_address: propertyAddress,
    property_address_line1: wizardFacts.property_address_line1,
    property_address_line2: wizardFacts.property_address_line2,
    property_city: wizardFacts.property_city,
    property_county: wizardFacts.property_county,
    property_postcode: wizardFacts.property_postcode,
    landlord_address_line1: wizardFacts.landlord_address_line1,
    landlord_address_line2: wizardFacts.landlord_address_line2,
    landlord_city: wizardFacts.landlord_city,
    landlord_county: wizardFacts.landlord_county,
    landlord_postcode: wizardFacts.landlord_postcode,
    service_address_line1: wizardFacts.landlord_address_line1,
    service_address_town: wizardFacts.landlord_city,
    service_address_county: wizardFacts.landlord_county,
    service_postcode: wizardFacts.landlord_postcode,
    rent_amount: wizardFacts.rent_amount,
    rent_frequency: wizardFacts.rent_frequency,
    tenancy_start_date: wizardFacts.tenancy_start_date,
    notice_date: wizardFacts.notice_served_date,
    notice_served_date: wizardFacts.notice_served_date,
    notice_expiry_date: wizardFacts.notice_expiry_date,
    earliest_proceedings_date: wizardFacts.earliest_proceedings_date || wizardFacts.notice_expiry_date,
    court_name: wizardFacts.court_name,
    ground_codes: selectedGrounds.map(stripGroundPrefix),
    selected_grounds: selectedGrounds,
    ground_particulars:
      wizardFacts.ground_particulars ||
      wizardFacts.section_8_particulars ||
      wizardFacts.section8_details ||
      wizardFacts.particulars_of_claim ||
      '',
    form3a_explanation:
      wizardFacts.ground_particulars ||
      wizardFacts.section_8_particulars ||
      wizardFacts.section8_details ||
      wizardFacts.particulars_of_claim ||
      '',
    total_arrears: wizardFacts.total_arrears,
    rent_arrears_amount: wizardFacts.rent_arrears_amount,
    arrears_at_notice_date: wizardFacts.arrears_at_notice_date,
    arrears_items: wizardFacts.arrears_items,
    signatory_capacity: wizardFacts.signatory_capacity || 'landlord',
    signatory_name: wizardFacts.signatory_name || landlordName,
    signature_date: wizardFacts.signature_date || wizardFacts.notice_served_date,
  } as CaseData;
}

function buildNoticeOnlyGuidanceData(wizardFacts: WizardFacts) {
  const selectedGrounds = getSelectedGrounds(wizardFacts);
  const propertyAddress = buildAddress(
    wizardFacts.property_address_line1,
    wizardFacts.property_address_line2,
    wizardFacts.property_city,
    wizardFacts.property_county,
    wizardFacts.property_postcode,
  );
  const landlordAddress = buildAddress(
    wizardFacts.landlord_address_line1,
    wizardFacts.landlord_address_line2,
    wizardFacts.landlord_city,
    wizardFacts.landlord_county,
    wizardFacts.landlord_postcode,
  );
  const tenantName = wizardFacts.tenant_full_name || wizardFacts.tenant1_name;
  const landlordName = wizardFacts.landlord_full_name || wizardFacts.landlord_name;

  return enrichEnglandSection8SupportContext({
    ...wizardFacts,
    jurisdiction: 'england',
    route: 'section_8',
    current_date: '07/04/2026',
    generated_date: '07/04/2026',
    property_address: propertyAddress,
    landlord_address: landlordAddress,
    tenant_name: tenantName,
    landlord_name: landlordName,
    tenant_full_name: tenantName,
    landlord_full_name: landlordName,
    case_type: 'England possession route',
    ground_codes: selectedGrounds,
    selected_grounds: selectedGrounds,
    notice_service_date: wizardFacts.notice_served_date,
    notice_expiry_date: wizardFacts.notice_expiry_date,
    earliest_proceedings_date: wizardFacts.earliest_proceedings_date || wizardFacts.notice_expiry_date,
  });
}

async function generateNoticeOnlyPack(rootDir: string, wizardFacts: WizardFacts): Promise<SavedDoc[]> {
  await ensureDir(rootDir);
  const saved: SavedDoc[] = [];
  const guidanceData = buildNoticeOnlyGuidanceData(wizardFacts);
  const form3AData = buildOfficialFormData(wizardFacts);

  const form3ABytes = await fillOfficialForm('form3a', form3AData);
  const form3APath = path.join(rootDir, 'notice.pdf');
  await writeBytes(form3APath, form3ABytes);
  saved.push({ title: 'Form 3A notice', path: form3APath });

  const supportTemplates: Array<{ key: string; templatePath: string }> = [
    { key: 'service-instructions.html', templatePath: 'uk/england/templates/eviction/service_instructions_section_8.hbs' },
    { key: 'cover-letter.html', templatePath: 'uk/england/templates/eviction/cover_letter_to_tenant.hbs' },
    { key: 'service-checklist.html', templatePath: 'uk/england/templates/eviction/checklist_section_8.hbs' },
    { key: 'evidence-checklist.html', templatePath: 'shared/templates/evidence_collection_checklist.hbs' },
    { key: 'case-summary.html', templatePath: 'shared/templates/case_summary.hbs' },
    { key: 'roadmap.html', templatePath: 'uk/england/templates/eviction/eviction_roadmap.hbs' },
  ];

  for (const template of supportTemplates) {
    const rendered = await generateDocument({
      templatePath: template.templatePath,
      data: guidanceData,
      outputFormat: 'html',
    });

    const outputPath = path.join(rootDir, template.key);
    await writeText(outputPath, rendered.html || '');
    saved.push({ title: template.key, path: outputPath });
  }

  const proofOfServiceBytes = await generateProofOfServicePDF({
    landlord_name: wizardFacts.landlord_full_name || wizardFacts.landlord_name,
    tenant_name: wizardFacts.tenant_full_name || wizardFacts.tenant1_name,
    property_address: guidanceData.property_address,
    document_served: guidanceData.notice_name,
    served_date: wizardFacts.notice_served_date,
    expiry_date: wizardFacts.notice_expiry_date,
    service_method: wizardFacts.notice_service_method,
  });
  const proofPath = path.join(rootDir, 'proof-of-service.pdf');
  await writeBytes(proofPath, proofOfServiceBytes);
  saved.push({ title: 'Proof of service', path: proofPath });

  if (wizardFacts.arrears_items?.length) {
    const arrearsData = getArrearsScheduleData({
      arrears_items: wizardFacts.arrears_items,
      total_arrears: wizardFacts.total_arrears || wizardFacts.rent_arrears_amount || 0,
      rent_amount: wizardFacts.rent_amount || 0,
      rent_frequency: wizardFacts.rent_frequency || 'monthly',
      include_schedule: true,
    });

    if (arrearsData.arrears_schedule.length > 0) {
      const schedule = await generateDocument({
        templatePath: 'uk/england/templates/money_claims/schedule_of_arrears.hbs',
        data: {
          claimant_reference: 'sample-notice-only',
          generation_date: new Date().toISOString().slice(0, 10),
          clean_output: wizardFacts.clean_output ?? false,
          property_address: guidanceData.property_address,
          tenant_full_name: wizardFacts.tenant_full_name || wizardFacts.tenant1_name,
          tenant_name: wizardFacts.tenant_full_name || wizardFacts.tenant1_name,
          tenant1_name: wizardFacts.tenant1_name,
          tenant_2_name: wizardFacts.tenant_2_name,
          landlord_full_name: wizardFacts.landlord_full_name || wizardFacts.landlord_name,
          landlord_name: wizardFacts.landlord_full_name || wizardFacts.landlord_name,
          claimant_name: wizardFacts.landlord_full_name || wizardFacts.landlord_name,
          landlord_2_name: wizardFacts.landlord_2_name,
          rent_amount: wizardFacts.rent_amount || 0,
          rent_frequency: wizardFacts.rent_frequency || 'monthly',
          payment_day: wizardFacts.rent_due_day,
          tenancy_start_date: wizardFacts.tenancy_start_date,
          arrears_schedule: arrearsData.arrears_schedule,
          arrears_total: arrearsData.arrears_total,
        },
        outputFormat: 'html',
      });
      const schedulePath = path.join(rootDir, 'arrears-schedule.html');
      await writeText(schedulePath, schedule.html || '');
      saved.push({ title: 'Arrears schedule', path: schedulePath });
    }
  }

  return saved;
}

async function generateCompletePack(rootDir: string, wizardFacts: WizardFacts): Promise<SavedDoc[]> {
  const saved = await generateNoticeOnlyPack(rootDir, wizardFacts);
  const guidanceData = {
    ...buildNoticeOnlyGuidanceData(wizardFacts),
    court_name: wizardFacts.court_name || 'County Court',
    bundle_exhibit_section8_notice: 'A1',
    bundle_exhibit_proof_of_service: 'A2',
    bundle_exhibit_tenancy_agreement: 'B1',
    bundle_exhibit_witness_statement: 'C1',
    bundle_exhibit_case_summary: 'C2',
    bundle_exhibit_schedule_of_arrears: wizardFacts.arrears_items?.length ? 'D1' : '',
  };
  const caseData = buildOfficialFormData(wizardFacts);

  const n5Bytes = await fillOfficialForm('n5', caseData as CaseData);
  const n5Path = path.join(rootDir, 'n5-claim.pdf');
  await writeBytes(n5Path, n5Bytes);
  saved.push({ title: 'Form N5', path: n5Path });

  const n119Bytes = await fillOfficialForm('n119', caseData as CaseData);
  const n119Path = path.join(rootDir, 'n119-particulars.pdf');
  await writeBytes(n119Path, n119Bytes);
  saved.push({ title: 'Form N119', path: n119Path });

  const templateList: Array<{ fileName: string; templatePath: string }> = [
    { fileName: 'court-filing-guide.html', templatePath: 'uk/england/templates/eviction/court_filing_guide.hbs' },
    { fileName: 'hearing-checklist.html', templatePath: 'uk/england/templates/eviction/hearing_checklist.hbs' },
    { fileName: 'court-bundle-index.html', templatePath: 'uk/england/templates/eviction/court_bundle_index.hbs' },
  ];

  for (const template of templateList) {
    const rendered = await generateDocument({
      templatePath: template.templatePath,
      data: guidanceData,
      outputFormat: 'html',
    });
    const outputPath = path.join(rootDir, template.fileName);
    await writeText(outputPath, rendered.html || '');
    saved.push({ title: template.fileName, path: outputPath });
  }

  const witnessInput = extractWitnessStatementSectionsInput({
    landlord_name: wizardFacts.landlord_full_name || wizardFacts.landlord_name,
    tenant_name: wizardFacts.tenant_full_name || wizardFacts.tenant1_name,
    property_address: guidanceData.property_address,
    tenancy_start_date: wizardFacts.tenancy_start_date,
    rent_amount: wizardFacts.rent_amount,
    rent_frequency: wizardFacts.rent_frequency,
    notice_service_date: wizardFacts.notice_served_date,
    notice_expiry_date: wizardFacts.notice_expiry_date,
    earliest_proceedings_date: wizardFacts.earliest_proceedings_date || wizardFacts.notice_expiry_date,
    source_data: {
      ...wizardFacts,
      ground_codes: getSelectedGrounds(wizardFacts).map((ground) =>
        String(ground).replace(/^Ground\s+/i, '').trim(),
      ),
      selected_grounds: getSelectedGrounds(wizardFacts),
    },
    section8: {
      grounds: getSelectedGrounds(wizardFacts),
    },
    notice: {
      served_date: wizardFacts.notice_served_date,
      expiry_date: wizardFacts.notice_expiry_date,
    },
    tenancy: {
      start_date: wizardFacts.tenancy_start_date,
      rent_amount: wizardFacts.rent_amount,
      rent_frequency: wizardFacts.rent_frequency,
    },
    arrears: {
      total_arrears: wizardFacts.total_arrears || wizardFacts.rent_arrears_amount || 0,
      arrears_items: wizardFacts.arrears_items || [],
    },
    arrearsAtNoticeDate: wizardFacts.arrears_at_notice_date || wizardFacts.total_arrears || 0,
    evidenceFiles: [],
  });
  const witnessSections = buildWitnessStatementSections(witnessInput);
  const witnessRendered = await generateDocument({
    templatePath: 'uk/england/templates/eviction/witness-statement.hbs',
    data: {
      ...guidanceData,
      witness_statement: witnessSections,
    },
    outputFormat: 'html',
  });
  const witnessPath = path.join(rootDir, 'witness-statement.html');
  await writeText(witnessPath, witnessRendered.html || '');
  saved.push({ title: 'Witness statement', path: witnessPath });

  return saved;
}

const arrearsItems = [
  { period_start: '2026-02-01', period_end: '2026-02-28', rent_due: 1200, rent_paid: 0, amount_owed: 1200 },
  { period_start: '2026-03-01', period_end: '2026-03-31', rent_due: 1200, rent_paid: 0, amount_owed: 1200 },
  { period_start: '2026-04-01', period_end: '2026-04-30', rent_due: 1200, rent_paid: 0, amount_owed: 1200 },
];

const scenarios: ScenarioConfig[] = [
  {
    slug: 'rent-arrears',
    title: 'Rent arrears',
    groundCodes: ['8', '10', '11'],
    noticeExpiryDate: '2026-06-29',
    description: 'Grounds 8, 10 and 11: the tenant owes substantial rent arrears and has repeatedly fallen into arrears.',
    noticeOnlyOverrides: {
      total_arrears: 3600,
      rent_arrears_amount: 3600,
      arrears_at_notice_date: 3600,
      arrears_items: arrearsItems,
    },
    completeOverrides: {
      total_arrears: 3600,
      rent_arrears_amount: 3600,
      arrears_at_notice_date: 3600,
      arrears_items: arrearsItems,
    },
  },
  {
    slug: 'tenancy-breach',
    title: 'Tenancy breach',
    groundCodes: ['12'],
    noticeExpiryDate: '2026-06-29',
    description: 'Ground 12: the tenant is said to have breached the tenancy by keeping a dog without consent and subletting part of the property.',
    noticeOnlyOverrides: {
      ground_12: {
        tenancy_clause: '3.2',
        breach_type: ['keeping a dog without consent', 'subletting part of the property'],
        breach_dates: 'January and February 2026',
        breach_evidence: 'inspection photographs and neighbour correspondence',
        warnings_issued: 'warning letters dated 14 January 2026 and 4 February 2026',
      },
    },
    completeOverrides: {
      ground_12: {
        tenancy_clause: '3.2',
        breach_type: ['keeping a dog without consent', 'subletting part of the property'],
        breach_dates: 'January and February 2026',
        breach_evidence: 'inspection photographs and neighbour correspondence',
        warnings_issued: 'warning letters dated 14 January 2026 and 4 February 2026',
      },
    },
  },
  {
    slug: 'antisocial-behaviour',
    title: 'Antisocial behaviour',
    groundCodes: ['14'],
    noticeExpiryDate: '2026-06-08',
    description: 'Ground 14: repeated late-night shouting, abusive behaviour towards neighbours, and banging on communal doors.',
    noticeOnlyOverrides: {
      ground_14: {
        incidents_description: 'late-night shouting, abusive behaviour towards neighbours, and repeated banging on communal doors',
        incident_count: 4,
        affected_parties: 'two neighbouring households',
        warnings_issued: 'written warning from the managing agent on 12 February 2026',
        police_reference: 'YRK/2241/26',
      },
    },
    completeOverrides: {
      ground_14: {
        incidents_description: 'late-night shouting, abusive behaviour towards neighbours, and repeated banging on communal doors',
        incident_count: 4,
        affected_parties: 'two neighbouring households',
        warnings_issued: 'written warning from the managing agent on 12 February 2026',
        police_reference: 'YRK/2241/26',
      },
    },
  },
  {
    slug: 'sale-ground',
    title: 'Sale / use',
    groundCodes: ['1A'],
    noticeExpiryDate: '2026-10-01',
    description: 'Ground 1A: the landlord intends to sell the dwelling with vacant possession.',
    noticeOnlyOverrides: {
      ground_1a: {
        sale_reason: 'the landlord is restructuring their portfolio to settle an estate liability',
        sale_steps_taken: 'two valuations obtained and draft particulars prepared for the estate agent',
        decision_date: '2026-02-14',
        intended_sale_timing: 'marketing is intended within 14 days of possession',
        supporting_evidence: 'valuation letters and email instructions to the estate agent',
      },
    },
    completeOverrides: {
      ground_1a: {
        sale_reason: 'the landlord is restructuring their portfolio to settle an estate liability',
        sale_steps_taken: 'two valuations obtained and draft particulars prepared for the estate agent',
        decision_date: '2026-02-14',
        intended_sale_timing: 'marketing is intended within 14 days of possession',
        supporting_evidence: 'valuation letters and email instructions to the estate agent',
      },
    },
  },
  {
    slug: 'redevelopment-ground',
    title: 'Redevelopment',
    groundCodes: ['6'],
    noticeExpiryDate: '2026-10-01',
    description: 'Ground 6: the landlord says the property is required for substantial structural works.',
    noticeOnlyOverrides: {
      ground_6: {
        works_description: 'rear extension, rewiring, and replacement of the heating system',
        possession_requirement_reason: 'the contractor requires vacant possession for structural works and scaffold access',
        intended_start_date: '2026-10-15',
        planning_or_contractor_status: 'building control approval obtained and contractor booked',
        supporting_evidence: 'approved plans and contractor quote',
      },
    },
    completeOverrides: {
      ground_6: {
        works_description: 'rear extension, rewiring, and replacement of the heating system',
        possession_requirement_reason: 'the contractor requires vacant possession for structural works and scaffold access',
        intended_start_date: '2026-10-15',
        planning_or_contractor_status: 'building control approval obtained and contractor booked',
        supporting_evidence: 'approved plans and contractor quote',
      },
    },
  },
  {
    slug: 'mortgagee-ground',
    title: 'Mortgagee / repossessor',
    groundCodes: ['2'],
    noticeExpiryDate: '2026-08-01',
    description: 'Ground 2: possession is said to be required so the dwelling can be recovered and sold following mortgage enforcement.',
    noticeOnlyOverrides: {
      ground_2: {
        factual_basis: 'the mortgagee has appointed receivers and intends to sell with vacant possession',
        qualifying_occupier: 'mortgagee in possession',
        occupier_relationship: 'secured lender',
        trigger_date: '2026-07-15',
        notice_or_status_details: 'receiver appointment notice dated 15 July 2026',
        supporting_evidence: 'mortgage statement, receiver appointment, and sale instructions',
      },
    },
    completeOverrides: {
      ground_2: {
        factual_basis: 'the mortgagee has appointed receivers and intends to sell with vacant possession',
        qualifying_occupier: 'mortgagee in possession',
        occupier_relationship: 'secured lender',
        trigger_date: '2026-07-15',
        notice_or_status_details: 'receiver appointment notice dated 15 July 2026',
        supporting_evidence: 'mortgage statement, receiver appointment, and sale instructions',
      },
    },
  },
  {
    slug: 'student-occupation-ground',
    title: 'Student / worker occupancy',
    groundCodes: ['4A'],
    noticeExpiryDate: '2026-10-01',
    description: 'Ground 4A: the dwelling is needed for occupation by students for the next academic year.',
    noticeOnlyOverrides: {
      ground_4a: {
        factual_basis: 'the dwelling is part of the landlord’s student accommodation stock and is needed for the 2026/27 academic year',
        qualifying_occupier: 'incoming cohort of full-time students',
        occupier_relationship: 'student allocation policy',
        trigger_date: '2026-09-01',
        notice_or_status_details: 'prior notice in the tenancy documents that student possession might be required',
        supporting_evidence: 'term dates, allocation policy, and prior notice wording',
      },
    },
    completeOverrides: {
      ground_4a: {
        factual_basis: 'the dwelling is part of the landlord’s student accommodation stock and is needed for the 2026/27 academic year',
        qualifying_occupier: 'incoming cohort of full-time students',
        occupier_relationship: 'student allocation policy',
        trigger_date: '2026-09-01',
        notice_or_status_details: 'prior notice in the tenancy documents that student possession might be required',
        supporting_evidence: 'term dates, allocation policy, and prior notice wording',
      },
    },
  },
  {
    slug: 'right-to-rent-ground',
    title: 'Right to rent',
    groundCodes: ['7B'],
    noticeExpiryDate: '2026-06-29',
    description: 'Ground 7B: the tenancy is said to be affected by immigration status restrictions and a right-to-rent disqualification.',
    noticeOnlyOverrides: {
      ground_7b: {
        affected_occupiers: 'the tenant and her adult son',
        status_basis: 'a Home Office disqualification notice states that neither occupier has a right to rent',
        notice_source: 'Home Office notice dated 12 March 2026',
        status_check_date: '2026-03-12',
        decision_or_reference: 'HMO-RTR-44219',
        supporting_evidence: 'Home Office notice and right-to-rent check record',
      },
    },
    completeOverrides: {
      ground_7b: {
        affected_occupiers: 'the tenant and her adult son',
        status_basis: 'a Home Office disqualification notice states that neither occupier has a right to rent',
        notice_source: 'Home Office notice dated 12 March 2026',
        status_check_date: '2026-03-12',
        decision_or_reference: 'HMO-RTR-44219',
        supporting_evidence: 'Home Office notice and right-to-rent check record',
      },
    },
  },
  {
    slug: 'supported-accommodation-ground',
    title: 'Supported accommodation',
    groundCodes: ['18'],
    noticeExpiryDate: '2026-08-01',
    description: 'Ground 18: the dwelling forms part of supported accommodation and the statutory basis for recovery is said to apply.',
    noticeOnlyOverrides: {
      ground_18: {
        factual_basis: 'the dwelling forms part of a supported accommodation pathway and the current placement has ended',
        qualifying_occupier: 'referral-based supported resident',
        occupier_relationship: 'support placement ending',
        trigger_date: '2026-07-01',
        notice_or_status_details: 'support provider decision confirming that the placement has concluded',
        supporting_evidence: 'support agreement, placement decision, and move-on note',
      },
    },
    completeOverrides: {
      ground_18: {
        factual_basis: 'the dwelling forms part of a supported accommodation pathway and the current placement has ended',
        qualifying_occupier: 'referral-based supported resident',
        occupier_relationship: 'support placement ending',
        trigger_date: '2026-07-01',
        notice_or_status_details: 'support provider decision confirming that the placement has concluded',
        supporting_evidence: 'support agreement, placement decision, and move-on note',
      },
    },
  },
  {
    slug: 'multi-ground-arrears-breach',
    title: 'Multi-ground claim',
    groundCodes: ['8', '12'],
    noticeExpiryDate: '2026-06-29',
    description: 'Grounds 8 and 12: serious rent arrears are alleged together with unauthorised subletting contrary to the tenancy terms.',
    noticeOnlyOverrides: {
      total_arrears: 3600,
      rent_arrears_amount: 3600,
      arrears_at_notice_date: 3600,
      arrears_items: arrearsItems,
      ground_12: {
        tenancy_clause: '4.1',
        breach_type: ['unauthorised subletting'],
        breach_dates: 'March 2026',
        breach_evidence: 'advertisement screenshots and inspection notes',
      },
    },
    completeOverrides: {
      total_arrears: 3600,
      rent_arrears_amount: 3600,
      arrears_at_notice_date: 3600,
      arrears_items: arrearsItems,
      ground_12: {
        tenancy_clause: '4.1',
        breach_type: ['unauthorised subletting'],
        breach_dates: 'March 2026',
        breach_evidence: 'advertisement screenshots and inspection notes',
      },
    },
  },
];

async function main() {
  process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
  process.env.DISABLE_COMPLIANCE_AUDIT_AI = 'true';
  __setTestJsonAIClient({
    async jsonCompletion() {
      return {
        json: {} as any,
        content: '{}',
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        model: 'gpt-4o-mini',
        cost_usd: 0,
      };
    },
  } as any);

  const stamp = timestampSlug();
  const root = path.join(
    process.cwd(),
    'artifacts',
    'test',
    'complete-pack',
    'england',
    'premium-drafting-audit',
    stamp,
  );

  const summaryLines: string[] = [`Generated at ${new Date().toISOString()}`, ''];

  for (const scenario of scenarios) {
    const noticeFacts = buildScenarioFacts('notice_only', scenario);
    const completeFacts = buildScenarioFacts('complete_pack', scenario);
    const noticeDir = path.join(root, scenario.slug, 'notice-only');
    const completeDir = path.join(root, scenario.slug, 'complete-pack');

    const noticeDocs = await generateNoticeOnlyPack(noticeDir, noticeFacts);
    const completeDocs = await generateCompletePack(completeDir, completeFacts);
    await writeManifest(noticeDir, scenario, 'notice_only', noticeDocs);
    await writeManifest(completeDir, scenario, 'complete_pack', completeDocs);

    summaryLines.push(`# ${scenario.title}`);
    summaryLines.push(`- slug: ${scenario.slug}`);
    summaryLines.push(`- grounds: ${scenario.groundCodes.join(', ')}`);
    summaryLines.push(`- notice-only docs: ${noticeDocs.length}`);
    summaryLines.push(`- complete-pack docs: ${completeDocs.length}`);
    summaryLines.push(`- notice-only path: ${noticeDir}`);
    summaryLines.push(`- complete-pack path: ${completeDir}`);
    summaryLines.push('');
  }

  await ensureDir(root);
  await writeText(path.join(root, 'README.md'), summaryLines.join('\n'));

  const standardScenario = scenarios[0];
  const standardArtifactsRoot = path.join(
    process.cwd(),
    'artifacts',
    'test',
    'complete-pack',
    'england',
  );
  const standardNoticeDir = path.join(
    standardArtifactsRoot,
    'england-section8-notice-only-random',
    stamp,
  );
  const standardCompleteDir = path.join(
    standardArtifactsRoot,
    'england-section8-complete-pack-random',
    stamp,
  );
  const standardNoticeDocs = await generateNoticeOnlyPack(
    standardNoticeDir,
    buildScenarioFacts('notice_only', standardScenario),
  );
  const standardCompleteDocs = await generateCompletePack(
    standardCompleteDir,
    buildScenarioFacts('complete_pack', standardScenario),
  );
  await writeManifest(standardNoticeDir, standardScenario, 'notice_only', standardNoticeDocs);
  await writeManifest(standardCompleteDir, standardScenario, 'complete_pack', standardCompleteDocs);

  console.log(`Representative England drafting samples written to ${root}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
