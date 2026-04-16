import fs from 'fs/promises';
import path from 'path';

import { __setTestJsonAIClient } from '../src/lib/ai/openai-client.ts';
import {
  generateCompleteEvictionPack,
  generateNoticeOnlyPack,
} from '../src/lib/documents/eviction-pack-generator.ts';
import {
  generateMoneyClaimPack,
  type MoneyClaimCase,
} from '../src/lib/documents/money-claim-pack-generator.ts';
import {
  generateResidentialLettingDocuments,
} from '../src/lib/documents/residential-letting-generator.ts';
import {
  generateSection13CoreDocuments,
  generateSection13Pack,
  generateSection13TribunalBundle,
} from '../src/lib/documents/section13-generator.ts';
import { PUBLIC_PRODUCT_DESCRIPTORS } from '../src/lib/public-products.ts';
import { computeSection13Preview } from '../src/lib/section13/rules.ts';
import { createEmptySection13State } from '../src/lib/section13/facts.ts';
import type { Section13Comparable } from '../src/lib/section13/types.ts';
import { buildEnglandSection8CompletePackFacts } from '../src/lib/testing/fixtures/complete-pack.ts';
import {
  saveGoldenPack,
  type GoldenPackDocumentInput,
  type GoldenPackRecord,
} from './helpers/save-golden-pack.ts';

process.env.TZ = 'Europe/London';
process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
process.env.DISABLE_COMPLIANCE_AUDIT_AI = 'true';
process.env.DISABLE_MONEY_CLAIM_AI = 'true';

const OUTPUT_ROOT = path.join(process.cwd(), 'artifacts', 'golden-packs');
const NON_PACK_PUBLIC_PRODUCTS = ['ast'] as const;

type LivePackProductKey =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'section13_standard'
  | 'section13_defensive'
  | 'england_standard_tenancy_agreement'
  | 'england_premium_tenancy_agreement'
  | 'england_student_tenancy_agreement'
  | 'england_hmo_shared_house_tenancy_agreement'
  | 'england_lodger_agreement';

const LIVE_PACK_PRODUCT_KEYS: LivePackProductKey[] = [
  'notice_only',
  'complete_pack',
  'money_claim',
  'section13_standard',
  'section13_defensive',
  'england_standard_tenancy_agreement',
  'england_premium_tenancy_agreement',
  'england_student_tenancy_agreement',
  'england_hmo_shared_house_tenancy_agreement',
  'england_lodger_agreement',
];

const jsonClientStub = {
  async jsonCompletion() {
    return {
      json: {} as any,
      content: '{}',
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      model: 'gpt-4o-mini',
      cost_usd: 0,
    };
  },
} as any;

type BaseFacts = Record<string, any>;

function buildComparable(index: number, monthlyEquivalent: number): Section13Comparable {
  return {
    source: 'scraped',
    sourceDateKind: 'published',
    sourceDateValue: '2026-03-15',
    addressSnippet: `Comparable ${index + 1}, Leeds`,
    postcodeNormalized: 'LS1 1AA',
    bedrooms: 2,
    rawRentValue: monthlyEquivalent,
    rawRentFrequency: 'pcm',
    monthlyEquivalent,
    weeklyEquivalent: Number(((monthlyEquivalent * 12) / 52).toFixed(2)),
    adjustedMonthlyEquivalent: monthlyEquivalent,
    isManual: false,
    sortOrder: index,
    adjustments: [],
    metadata: {},
  };
}

function buildSection13State(productType: 'section13_standard' | 'section13_defensive') {
  const state = createEmptySection13State(productType);
  state.selectedPlan = productType;
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
    'The proposed rent reflects recent local listings, condition, and current market positioning for similar two-bedroom homes.';

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

function createBaseEnglandAssuredFacts(overrides: Record<string, any> = {}): BaseFacts {
  const baseFacts = {
    current_date: '2026-04-16',
    case_id: 'golden-tenancy-case-001',
    property_address_line1: '12 Example Street',
    property_address_town: 'London',
    property_address_postcode: 'SW1A 1AA',
    landlord_full_name: 'Jane Landlord',
    landlord_address_line1: '3 Owner Road',
    landlord_address_town: 'London',
    landlord_address_postcode: 'SW1A 2BB',
    landlord_email: 'jane@example.com',
    landlord_phone: '07123 456789',
    tenancy_start_date: '2026-05-02',
    tenancy_end_date: '2027-05-01',
    rent_amount: 1500,
    deposit_amount: 1500,
    rent_due_day: '1st of each month',
    tenants: [
      {
        full_name: 'Alice Tenant',
        email: 'alice@example.com',
        phone: '07000 111111',
        address: '12 Example Street, London, SW1A 1AA',
      },
    ],
  };

  return {
    ...baseFacts,
    england_tenancy_purpose: 'new_agreement',
    rent_frequency: 'monthly',
    rent_due_day_of_month: '1st',
    rent_period: 'month',
    payment_method: 'bank_transfer',
    payment_account_name: 'Landlord Heaven Client Account',
    payment_sort_code: '12-34-56',
    payment_account_number: '12345678',
    bills_included_in_rent: 'yes',
    included_bills: ['gas', 'electricity', 'internet_broadband'],
    separate_bill_payments_taken: false,
    tenant_notice_period: '2 months',
    rent_increase_method: 'Section 13 rent increase process',
    england_rent_in_advance_compliant: true,
    england_no_bidding_confirmed: true,
    england_no_discrimination_confirmed: true,
    tenant_improvements_allowed_with_consent: false,
    supported_accommodation_tenancy: false,
    relevant_gas_fitting_present: true,
    gas_safety_certificate: true,
    electrical_safety_certificate: true,
    smoke_alarms_fitted: true,
    carbon_monoxide_alarms: true,
    epc_rating: 'C',
    right_to_rent_check_date: '2026-04-25',
    how_to_rent_provided: true,
    deposit_scheme_name: 'DPS',
    furnished_status: 'furnished',
    ...overrides,
  };
}

function buildGoldenMoneyClaimCase(): MoneyClaimCase {
  return {
    jurisdiction: 'england',
    case_id: 'golden-money-claim-001',
    landlord_full_name: 'Alice Landlord',
    landlord_address: '1 High Street\nLondon',
    landlord_postcode: 'E1 1AA',
    landlord_email: 'alice@example.com',
    landlord_phone: '02070000001',
    tenant_full_name: 'Tom Tenant',
    property_address: '2 High Street\nLondon',
    property_postcode: 'E1 2BB',
    rent_amount: 950,
    rent_frequency: 'monthly',
    payment_day: 1,
    tenancy_start_date: '2024-01-01',
    tenancy_end_date: '2026-02-01',
    arrears_schedule: [
      { period: 'December 2025', due_date: '2025-12-01', amount_due: 950, amount_paid: 0, arrears: 950 },
      { period: 'January 2026', due_date: '2026-01-01', amount_due: 950, amount_paid: 0, arrears: 950 },
      { period: 'February 2026', due_date: '2026-02-01', amount_due: 950, amount_paid: 420, arrears: 530 },
    ],
    damage_items: [
      { description: 'Broken internal door', amount: 200 },
      { description: 'Professional clean due to excessive staining', amount: 180 },
    ],
    other_charges: [{ description: 'Locksmith call-out', amount: 80 }],
    claim_interest: true,
    interest_rate: 8,
    interest_start_date: '2026-02-02',
    court_fee: 205,
    solicitor_costs: 0,
    lba_date: '2026-02-10',
    lba_response_deadline: '2026-03-12',
    pap_documents_sent: ['Letter Before Claim', 'Information Sheet', 'Reply Form', 'Financial Statement Form'],
    lba_method: ['email', 'first_class_post'],
    pap_documents_served: true,
    pap_service_method: ['email', 'first_class_post'],
    pap_service_proof: 'Email copy and certificate of posting retained.',
    tenant_responded: false,
    preferred_issue_route: 'county_court_n1',
    claim_value_band: 'up_to_5000',
    enforcement_preferences: ['attachment_of_earnings', 'third_party_debt_order'],
    evidence_types_available: ['tenancy_agreement', 'arrears_schedule', 'photos', 'checkout_report'],
    arrears_schedule_confirmed: true,
    particulars_of_claim:
      'The claimant seeks rent arrears, damage, and related charges arising from the tenancy, together with interest and court fees.',
    signatory_name: 'Alice Landlord',
    signature_date: '2026-04-16',
    notes: 'Golden sample pack with arrears, damage, other charges, PAP history, and interest enabled.',
  };
}

async function generateNoticeOnlyGolden(): Promise<GoldenPackDocumentInput[]> {
  const arrearsItems = [
    {
      period_start: '2026-01-01',
      period_end: '2026-01-31',
      rent_due: 1200,
      rent_paid: 0,
      amount_owed: 1200,
    },
    {
      period_start: '2026-02-01',
      period_end: '2026-02-28',
      rent_due: 1200,
      rent_paid: 0,
      amount_owed: 1200,
    },
    {
      period_start: '2026-03-01',
      period_end: '2026-03-31',
      rent_due: 1200,
      rent_paid: 0,
      amount_owed: 1200,
    },
  ];

  const facts = buildEnglandSection8CompletePackFacts({
    overrides: {
      __meta: { case_id: 'golden-notice-only-001', jurisdiction: 'england' },
      clean_output: true,
      landlord_name: 'Daniel Mercer',
      landlord_address_line1: '27 Rowan Avenue',
      landlord_city: 'Leeds',
      landlord_postcode: 'LS8 2PF',
      tenant1_name: 'Ivy Carleton',
      property_address_line1: '16 Willow Mews',
      property_city: 'York',
      property_postcode: 'YO24 3HX',
      total_arrears: 3600,
      rent_arrears_amount: 3600,
      arrears_items: arrearsItems,
    },
  });

  const pack = await generateNoticeOnlyPack(facts);
  return pack.documents;
}

async function generateCompletePackGolden(): Promise<GoldenPackDocumentInput[]> {
  const arrearsItems = [
    {
      period_start: '2026-01-01',
      period_end: '2026-01-31',
      rent_due: 1200,
      rent_paid: 0,
      amount_owed: 1200,
    },
    {
      period_start: '2026-02-01',
      period_end: '2026-02-28',
      rent_due: 1200,
      rent_paid: 0,
      amount_owed: 1200,
    },
    {
      period_start: '2026-03-01',
      period_end: '2026-03-31',
      rent_due: 1200,
      rent_paid: 0,
      amount_owed: 1200,
    },
  ];

  const pack = await generateCompleteEvictionPack({
    ...buildEnglandSection8CompletePackFacts({
      overrides: {
        __meta: { case_id: 'golden-complete-pack-001', jurisdiction: 'england' },
      },
    }),
    landlord_name: 'Daniel Mercer',
    landlord_address_line1: '27 Rowan Avenue',
    landlord_city: 'Leeds',
    landlord_postcode: 'LS8 2PF',
    tenant1_name: 'Ivy Carleton',
    property_address_line1: '16 Willow Mews',
    property_city: 'York',
    property_postcode: 'YO24 3HX',
    court_name: 'York County Court and Family Court',
    clean_output: true,
    court_mode: true,
    total_arrears: 3600,
    rent_arrears_amount: 3600,
    arrears_items: arrearsItems,
  });

  return pack.documents;
}

async function generateMoneyClaimGolden(): Promise<GoldenPackDocumentInput[]> {
  const pack = await generateMoneyClaimPack(buildGoldenMoneyClaimCase());
  return pack.documents;
}

async function generateSection13StandardGolden(): Promise<GoldenPackDocumentInput[]> {
  const { state, comparables } = buildSection13State('section13_standard');
  const pack = await generateSection13Pack({
    caseId: 'golden-section13-standard-001',
    productType: 'section13_standard',
    state,
    comparables,
    evidenceFiles: [],
  });

  return pack.documents;
}

async function generateSection13DefensiveGolden(): Promise<GoldenPackDocumentInput[]> {
  const { state, comparables } = buildSection13State('section13_defensive');
  const coreDocuments = await generateSection13CoreDocuments({
    caseId: 'golden-section13-defence-001',
    productType: 'section13_defensive',
    state,
    comparables,
    evidenceFiles: [],
  });

  const bundle = await generateSection13TribunalBundle({
    caseId: 'golden-section13-defence-001',
    state,
    evidenceFiles: [],
    sourceDocuments: coreDocuments.map((document) => ({
      title: document.title,
      description: document.description,
      document_type: document.document_type,
      file_name: document.file_name,
      pdf: document.pdf,
    })),
  });

  return [...coreDocuments, ...bundle.documents];
}

async function generateStandardTenancyGolden(): Promise<GoldenPackDocumentInput[]> {
  const pack = await generateResidentialLettingDocuments(
    'england_standard_tenancy_agreement',
    createBaseEnglandAssuredFacts({
      case_id: 'golden-standard-tenancy-001',
      furnished_status: 'furnished',
      tenant_improvements_allowed_with_consent: true,
    }),
  );

  return pack.documents;
}

async function generatePremiumTenancyGolden(): Promise<GoldenPackDocumentInput[]> {
  const pack = await generateResidentialLettingDocuments(
    'england_premium_tenancy_agreement',
    createBaseEnglandAssuredFacts({
      case_id: 'golden-premium-tenancy-001',
      bills_included_in_rent: 'no',
      included_bills: [],
      separate_bill_payments_taken: false,
      management_contact_channel: 'email',
      routine_inspection_window: 'quarterly_weekday_daytime',
      repair_reporting_contact: 'Landlord direct by email',
      repair_response_timeframe: 'within_24_hours',
      key_holders_summary: '2 front-door keys and 1 fob',
      check_in_documentation_expectation:
        'Tenant to review the signed inventory, meter readings, and key record at check-in.',
      utilities_transfer_expectation:
        'Tenant to open supplier accounts from the tenancy start date using the recorded opening readings.',
      contractor_access_procedure: 'Tenant to be notified before contractor attendance.',
      contractor_key_release_policy:
        'Keys released to contractors only against a signed key register and same-day return expectation.',
      handover_expectations: 'Return all keys and provide final meter readings.',
    }),
  );

  return pack.documents;
}

async function generateStudentTenancyGolden(): Promise<GoldenPackDocumentInput[]> {
  const pack = await generateResidentialLettingDocuments(
    'england_student_tenancy_agreement',
    createBaseEnglandAssuredFacts({
      case_id: 'golden-student-tenancy-001',
      bills_included_in_rent: 'no',
      included_bills: [],
      number_of_tenants: 3,
      tenants: [
        {
          full_name: 'Aisha Student',
          email: 'aisha@example.com',
          phone: '07000 200001',
          address: '12 Example Street, London, SW1A 1AA',
        },
        {
          full_name: 'Ben Student',
          email: 'ben@example.com',
          phone: '07000 200002',
          address: '12 Example Street, London, SW1A 1AA',
        },
        {
          full_name: 'Cara Student',
          email: 'cara@example.com',
          phone: '07000 200003',
          address: '12 Example Street, London, SW1A 1AA',
        },
      ],
      relevant_gas_fitting_present: false,
      guarantor_required: 'yes',
      guarantor_full_name: 'Greg Guarantor',
      guarantor_address: '77 Support Avenue, Bristol, BS1 4AB',
      guarantor_email: 'greg@example.com',
      guarantor_phone: '07000 222222',
      joint_tenancy: 'yes',
      all_tenants_full_time_students: 'yes',
      student_replacement_procedure: 'yes',
      student_guarantor_scope: 'rent_and_all_tenant_obligations',
      replacement_notice_window: '21_days',
      replacement_cost_responsibility: 'outgoing_tenant',
      student_end_of_term_expectations: 'Rooms to be returned clean and with all keys.',
      student_move_out_keys_process: 'Keys to be returned to the managing agent office.',
      student_cleaning_standard: 'Professional-clean standard for kitchen and bathrooms.',
    }),
  );

  return pack.documents;
}

async function generateHmoTenancyGolden(): Promise<GoldenPackDocumentInput[]> {
  const pack = await generateResidentialLettingDocuments(
    'england_hmo_shared_house_tenancy_agreement',
    createBaseEnglandAssuredFacts({
      case_id: 'golden-hmo-tenancy-001',
      bills_included_in_rent: 'yes',
      included_bills_notes: 'Utilities and broadband',
      number_of_tenants: 4,
      tenants: [
        {
          full_name: 'Nina Sharer',
          email: 'nina@example.com',
          phone: '07000 300001',
          address: '12 Example Street, London, SW1A 1AA',
        },
        {
          full_name: 'Owen Sharer',
          email: 'owen@example.com',
          phone: '07000 300002',
          address: '12 Example Street, London, SW1A 1AA',
        },
        {
          full_name: 'Priya Sharer',
          email: 'priya@example.com',
          phone: '07000 300003',
          address: '12 Example Street, London, SW1A 1AA',
        },
        {
          full_name: 'Reece Sharer',
          email: 'reece@example.com',
          phone: '07000 300004',
          address: '12 Example Street, London, SW1A 1AA',
        },
      ],
      is_hmo: 'yes',
      number_of_sharers: 5,
      communal_areas: 'Kitchen, lounge, bathroom, and garden',
      hmo_licence_status: 'currently_licensed',
      communal_cleaning: 'professional_cleaner',
      visitor_policy: 'Overnight guests only with prior written approval.',
      waste_collection_arrangements: 'Bins to be presented every Tuesday night.',
      fire_safety_notes: 'Do not tamper with detectors and keep escape routes clear.',
    }),
  );

  return pack.documents;
}

async function generateLodgerGolden(): Promise<GoldenPackDocumentInput[]> {
  const pack = await generateResidentialLettingDocuments(
    'england_lodger_agreement',
    createBaseEnglandAssuredFacts({
      case_id: 'golden-lodger-001',
      resident_landlord_confirmed: true,
      landlord_lives_at_property: true,
      shared_kitchen_or_bathroom: true,
      house_rules_notes: 'No overnight guests without prior agreement.',
      licence_notice_period: '28 days',
      smoke_alarms_fitted: true,
      carbon_monoxide_alarms: true,
      bills_included_in_rent: 'yes',
      included_bills_notes: 'Utilities and Wi-Fi',
    }),
  );

  return pack.documents;
}

function buildScorecardTemplate(manifest: {
  generatedAt: string;
  outputRoot: string;
  packs: GoldenPackRecord[];
}): string {
  const lines: string[] = [
    '# England Golden Pack Scorecard',
    '',
    `Generated: ${manifest.generatedAt}`,
    `Output root: ${manifest.outputRoot.replace(/\\/g, '/')}`,
    '',
    'Suggested scoring rubric (/10):',
    '- Legal accuracy: /3',
    '- Product specificity: /2',
    '- Completeness: /2',
    '- Landlord clarity and next steps: /2',
    '- Finish and polish: /1',
    '',
  ];

  for (const pack of manifest.packs) {
    lines.push(`## ${pack.displayName}`);
    lines.push(`Folder: ${pack.outputDir}`);
    lines.push(`Documents: ${pack.documentCount}`);
    lines.push('Score: ');
    lines.push('What works: ');
    lines.push('Issues found: ');
    lines.push('What would move this to 9/10: ');
    lines.push('');
    lines.push('Documents:');
    for (const document of pack.documents) {
      lines.push(
        `- ${document.title}${document.documentType ? ` [${document.documentType}]` : ''}`
      );
    }
    lines.push('');
  }

  lines.push('## England Tenancy Agreements Hub');
  lines.push('Product key: ast');
  lines.push('Note: this is a chooser / hub product rather than a generated pack, so rate it separately at the page / CTA / routing level.');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  __setTestJsonAIClient(jsonClientStub);

  await fs.rm(OUTPUT_ROOT, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_ROOT, { recursive: true });

  const packs: GoldenPackRecord[] = [];

  const generators: Record<LivePackProductKey, () => Promise<GoldenPackDocumentInput[]>> = {
    notice_only: generateNoticeOnlyGolden,
    complete_pack: generateCompletePackGolden,
    money_claim: generateMoneyClaimGolden,
    section13_standard: generateSection13StandardGolden,
    section13_defensive: generateSection13DefensiveGolden,
    england_standard_tenancy_agreement: generateStandardTenancyGolden,
    england_premium_tenancy_agreement: generatePremiumTenancyGolden,
    england_student_tenancy_agreement: generateStudentTenancyGolden,
    england_hmo_shared_house_tenancy_agreement: generateHmoTenancyGolden,
    england_lodger_agreement: generateLodgerGolden,
  };

  for (const key of LIVE_PACK_PRODUCT_KEYS) {
    const descriptor = PUBLIC_PRODUCT_DESCRIPTORS[key];
    console.log(`\nGenerating golden pack: ${descriptor.displayName}`);
    const documents = await generators[key]();
    const record = await saveGoldenPack({
      baseDir: OUTPUT_ROOT,
      key,
      displayName: descriptor.displayName,
      documents,
    });
    packs.push(record);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    outputRoot: OUTPUT_ROOT,
    packs,
    nonPackProducts: NON_PACK_PUBLIC_PRODUCTS.map((key) => ({
      key,
      displayName: PUBLIC_PRODUCT_DESCRIPTORS[key].displayName,
      reason: 'Public chooser / hub page, not a generated pack.',
    })),
  };

  await fs.writeFile(
    path.join(OUTPUT_ROOT, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  await fs.writeFile(
    path.join(OUTPUT_ROOT, 'scorecard-template.md'),
    buildScorecardTemplate(manifest),
    'utf8'
  );
  await fs.writeFile(
    path.join(OUTPUT_ROOT, 'README.md'),
    [
      '# England Golden Packs',
      '',
      'Generated golden sample packs for each live England public product.',
      '',
      `Generated at: ${manifest.generatedAt}`,
      '',
      'Command:',
      '`npx -p node@20 -p tsx tsx scripts/generate-england-golden-packs.ts`',
      '',
      'Top-level files:',
      '- `manifest.json`',
      '- `scorecard-template.md`',
      '',
      'Pack folders:',
      ...packs.map((pack) => `- \`${pack.outputDir}\` (${pack.documentCount} documents)`),
      '',
    ].join('\n'),
    'utf8'
  );

  console.log(`\nGolden packs written to: ${OUTPUT_ROOT}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    __setTestJsonAIClient(null);
  });
