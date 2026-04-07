import { describe, expect, it } from 'vitest';

import { getArrearsScheduleData } from '@/lib/documents/arrears-schedule-mapper';
import { generateDocument } from '@/lib/documents/generator';
import {
  buildWitnessStatementSections,
  extractWitnessStatementSectionsInput,
} from '@/lib/documents/witness-statement-sections';
import { enrichEnglandSection8SupportContext } from '@/lib/england-possession/support-document-context';
import { getSelectedGrounds } from '@/lib/grounds';
import { buildEnglandSection8CompletePackFacts } from '@/lib/testing/fixtures/complete-pack';

process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';

type WizardFacts = Record<string, any>;
type Product = 'notice_only' | 'complete_pack';

type ScenarioConfig = {
  slug: string;
  groundCodes: string[];
  noticeExpiryDate: string;
  description: string;
  signatureTerms: string[];
  noticeOnlyOverrides?: Record<string, any>;
  completeOverrides?: Record<string, any>;
};

const arrearsItems = [
  { period_start: '2026-02-01', period_end: '2026-02-28', rent_due: 1200, rent_paid: 0, amount_owed: 1200 },
  { period_start: '2026-03-01', period_end: '2026-03-31', rent_due: 1200, rent_paid: 0, amount_owed: 1200 },
  { period_start: '2026-04-01', period_end: '2026-04-30', rent_due: 1200, rent_paid: 0, amount_owed: 1200 },
];

const scenarios: ScenarioConfig[] = [
  {
    slug: 'antisocial-behaviour',
    groundCodes: ['14'],
    noticeExpiryDate: '2026-06-08',
    description: 'Ground 14: repeated late-night shouting, abusive behaviour towards neighbours, and banging on communal doors.',
    signatureTerms: ['late-night shouting'],
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
    slug: 'mortgagee-ground',
    groundCodes: ['2'],
    noticeExpiryDate: '2026-08-01',
    description: 'Ground 2: possession is said to be required so the dwelling can be recovered and sold following mortgage enforcement.',
    signatureTerms: ['mortgagee has appointed receivers'],
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
    slug: 'multi-ground-arrears-breach',
    groundCodes: ['8', '12'],
    noticeExpiryDate: '2026-06-29',
    description: 'Grounds 8 and 12: serious rent arrears are alleged together with unauthorised subletting contrary to the tenancy terms.',
    signatureTerms: ['unauthorised subletting'],
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
  {
    slug: 'redevelopment-ground',
    groundCodes: ['6'],
    noticeExpiryDate: '2026-10-01',
    description: 'Ground 6: the landlord says the property is required for substantial structural works.',
    signatureTerms: ['rear extension, rewiring, and replacement of the heating system'],
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
    slug: 'rent-arrears',
    groundCodes: ['8', '10', '11'],
    noticeExpiryDate: '2026-06-29',
    description: 'Grounds 8, 10 and 11: the tenant owes substantial rent arrears and has repeatedly fallen into arrears.',
    signatureTerms: ['rent arrears'],
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
    slug: 'right-to-rent-ground',
    groundCodes: ['7B'],
    noticeExpiryDate: '2026-06-29',
    description: 'Ground 7B: the tenancy is said to be affected by immigration status restrictions and a right-to-rent disqualification.',
    signatureTerms: ['Home Office disqualification notice'],
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
    slug: 'sale-ground',
    groundCodes: ['1A'],
    noticeExpiryDate: '2026-10-01',
    description: 'Ground 1A: the landlord intends to sell the dwelling with vacant possession.',
    signatureTerms: ['estate liability'],
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
    slug: 'student-occupation-ground',
    groundCodes: ['4A'],
    noticeExpiryDate: '2026-10-01',
    description: 'Ground 4A: the dwelling is needed for occupation by students for the next academic year.',
    signatureTerms: ['full-time students'],
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
    slug: 'supported-accommodation-ground',
    groundCodes: ['18'],
    noticeExpiryDate: '2026-08-01',
    description: 'Ground 18: the dwelling forms part of supported accommodation and the statutory basis for recovery is said to apply.',
    signatureTerms: ['supported accommodation pathway'],
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
    slug: 'tenancy-breach',
    groundCodes: ['12'],
    noticeExpiryDate: '2026-06-29',
    description: 'Ground 12: the tenant is said to have breached the tenancy by keeping a dog without consent and subletting part of the property.',
    signatureTerms: ['keeping a dog without consent'],
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
];

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
    landlord_profile: 'private_landlord',
    landlord_full_name: 'Daniel Mercer',
    landlord_address_line1: '27 Rowan Avenue',
    landlord_city: 'Leeds',
    landlord_county: 'West Yorkshire',
    landlord_postcode: 'LS8 2PF',
    landlord_phone: '01132225555',
    landlord_email: 'daniel.mercer@example.com',
    tenant_full_name: 'Ivy Carleton',
    property_address_line1: '16 Willow Mews',
    property_city: 'York',
    property_county: 'North Yorkshire',
    property_postcode: 'YO24 3HX',
    tenancy_type: 'assured',
    tenancy_start_date: '2024-02-01',
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
    court_name: 'York County Court and Family Court',
  };
}

function buildCompletePackBaseFacts(): WizardFacts {
  return buildEnglandSection8CompletePackFacts({
    overrides: {
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

function buildScenarioFacts(product: Product, scenario: ScenarioConfig): WizardFacts {
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

  Object.assign(base, deepClone(product === 'notice_only' ? scenario.noticeOnlyOverrides || {} : scenario.completeOverrides || {}));
  return base;
}

function buildGuidanceData(wizardFacts: WizardFacts) {
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

  return enrichEnglandSection8SupportContext({
    ...wizardFacts,
    jurisdiction: 'england',
    route: 'section_8',
    current_date: '07/04/2026',
    generated_date: '2026-04-07',
    property_address: propertyAddress,
    landlord_address: landlordAddress,
    case_type: 'England possession route',
    ground_codes: selectedGrounds,
    selected_grounds: selectedGrounds,
    notice_service_date: wizardFacts.notice_served_date,
    notice_expiry_date: wizardFacts.notice_expiry_date,
    earliest_proceedings_date: wizardFacts.earliest_proceedings_date || wizardFacts.notice_expiry_date,
  });
}

async function renderTemplate(templatePath: string, data: Record<string, any>): Promise<string> {
  const rendered = await generateDocument({
    templatePath,
    data,
    outputFormat: 'html',
  });

  return rendered.html || '';
}

async function renderScenarioPack(product: Product, scenario: ScenarioConfig) {
  const wizardFacts = buildScenarioFacts(product, scenario);
  const guidanceData = buildGuidanceData(wizardFacts);
  const docs = new Map<string, string>();

  docs.set(
    'service-instructions',
    await renderTemplate('uk/england/templates/eviction/service_instructions_section_8.hbs', guidanceData),
  );
  docs.set(
    'service-checklist',
    await renderTemplate('uk/england/templates/eviction/checklist_section_8.hbs', guidanceData),
  );
  docs.set(
    'evidence-checklist',
    await renderTemplate('shared/templates/evidence_collection_checklist.hbs', guidanceData),
  );
  docs.set('case-summary', await renderTemplate('shared/templates/case_summary.hbs', guidanceData));
  docs.set(
    'cover-letter',
    await renderTemplate('uk/england/templates/eviction/cover_letter_to_tenant.hbs', guidanceData),
  );
  docs.set(
    'roadmap',
    await renderTemplate('uk/england/templates/eviction/eviction_roadmap.hbs', guidanceData),
  );

  if (product === 'complete_pack') {
    docs.set(
      'proof-of-service',
      await renderTemplate('shared/templates/proof_of_service.hbs', guidanceData),
    );
    docs.set(
      'court-filing-guide',
      await renderTemplate('uk/england/templates/eviction/court_filing_guide.hbs', guidanceData),
    );
    docs.set(
      'hearing-checklist',
      await renderTemplate('uk/england/templates/eviction/hearing_checklist.hbs', guidanceData),
    );
    docs.set(
      'court-bundle-index',
      await renderTemplate('uk/england/templates/eviction/court_bundle_index.hbs', {
        ...guidanceData,
        bundle_exhibit_section8_notice: 'A1',
        bundle_exhibit_proof_of_service: 'A2',
        bundle_exhibit_schedule_of_arrears: wizardFacts.arrears_items?.length ? 'D1' : '',
      }),
    );

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
    docs.set(
      'witness-statement',
      await renderTemplate('uk/england/templates/eviction/witness-statement.hbs', {
        ...guidanceData,
        witness_statement: witnessSections,
      }),
    );
  }

  if (wizardFacts.arrears_items?.length) {
    const arrearsData = getArrearsScheduleData({
      arrears_items: wizardFacts.arrears_items,
      total_arrears: wizardFacts.total_arrears || wizardFacts.rent_arrears_amount || 0,
      rent_amount: wizardFacts.rent_amount || 0,
      rent_frequency: wizardFacts.rent_frequency || 'monthly',
      include_schedule: true,
    });

    docs.set(
      'arrears-schedule',
      await renderTemplate('uk/england/templates/money_claims/schedule_of_arrears.hbs', {
        claimant_reference: `matrix-${scenario.slug}-${product}`,
        generation_date: '2026-04-07',
        clean_output: product === 'complete_pack',
        property_address: guidanceData.property_address,
        tenant_full_name: wizardFacts.tenant_full_name || wizardFacts.tenant1_name,
        tenant_name: wizardFacts.tenant_full_name || wizardFacts.tenant1_name,
        tenant1_name: wizardFacts.tenant1_name,
        landlord_full_name: wizardFacts.landlord_full_name || wizardFacts.landlord_name,
        landlord_name: wizardFacts.landlord_full_name || wizardFacts.landlord_name,
        claimant_name: wizardFacts.landlord_full_name || wizardFacts.landlord_name,
        rent_amount: wizardFacts.rent_amount || 0,
        rent_frequency: wizardFacts.rent_frequency || 'monthly',
        payment_day: wizardFacts.rent_due_day,
        tenancy_start_date: wizardFacts.tenancy_start_date,
        arrears_schedule: arrearsData.arrears_schedule,
        arrears_total: arrearsData.arrears_total,
      }),
    );
  }

  return {
    docs,
    guidanceData,
  };
}

describe('England Section 8 catalog hardening', () => {
  it.each(scenarios.flatMap((scenario) => (['notice_only', 'complete_pack'] as Product[]).map((product) => [scenario, product] as const)))(
    '$0.slug [$1] keeps dates, notice naming, court data, and scenario-specific drafting coherent',
    async (scenario, product) => {
      const { docs, guidanceData } = await renderScenarioPack(product, scenario);
      const packText = Array.from(docs.values()).join('\n');
      const evidenceChecklist = docs.get('evidence-checklist') || '';
      const serviceInstructions = docs.get('service-instructions') || '';
      const serviceChecklist = docs.get('service-checklist') || '';
      const caseSummary = docs.get('case-summary') || '';

      expect(packText).toContain('Form 3A notice');
      expect(packText).not.toMatch(/\bForm 3 notice\b/i);
      expect(packText).not.toContain('Form 3A Notice Seeking Possession');
      expect(packText).not.toContain('LANDLORD HEAVEN - PRINT DESIGN SYSTEM');
      expect(packText).not.toContain('<dd></dd>');
      expect(packText).not.toContain('<div class="sender"></div>');
      expect(packText).not.toContain('<p></p>');
      expect(packText).not.toContain('{{');
      expect(packText).not.toContain('}}');

      expect(serviceInstructions).toContain(guidanceData.notice_expiry_date_formatted);
      expect(serviceInstructions).toContain(guidanceData.earliest_proceedings_date_formatted);
      expect(serviceChecklist).toContain(guidanceData.notice_expiry_date_formatted);
      expect(serviceChecklist).toContain(guidanceData.earliest_proceedings_date_formatted);

      for (const code of scenario.groundCodes) {
        expect(caseSummary).toContain(`Ground ${code}`);
        expect(evidenceChecklist).toContain(`Ground ${code}`);
      }

      for (const signatureTerm of scenario.signatureTerms) {
        expect(packText).toContain(signatureTerm);
      }

      if (!scenario.groundCodes.some((code) => ['8', '10', '11'].includes(code))) {
        expect(packText).not.toContain('Ground 8 arrears focus');
        expect(packText).not.toContain('serious rent arrears remained unpaid');
        expect(evidenceChecklist).not.toContain('Ground 8');
      }

      if (product === 'complete_pack') {
        const courtDocs = ['case-summary', 'court-filing-guide', 'court-bundle-index', 'hearing-checklist'];
        for (const docName of courtDocs) {
          expect(docs.get(docName) || '').toContain('York County Court and Family Court');
          expect(docs.get(docName) || '').not.toContain('Central London County Court');
        }

        expect(packText).not.toContain('Landlord Heaven</strong> |');
        expect(docs.get('proof-of-service') || '').toContain('Form 3A notice');
      }
    },
  );
});
