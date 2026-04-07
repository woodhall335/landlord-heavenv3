import { describe, expect, it } from 'vitest';

import {
  ENGLAND_GROUND_DRAFT_REGISTRY,
  buildEnglandPossessionDraftingModel,
} from '@/lib/england-possession/pack-drafting';
import { listEnglandGroundDefinitions } from '@/lib/england-possession/ground-catalog';

function baseData() {
  return {
    property_address: '16 Willow Mews, York, YO24 3HX',
    tenancy_start_date: '2024-02-01',
    notice_service_date: '2026-03-05',
    notice_expiry_date: '2026-03-19',
    earliest_proceedings_date: '2026-03-19',
    rent_amount: 1200,
    rent_frequency: 'monthly',
  };
}

describe('England ground-aware drafting model', () => {
  it('provides a draft builder for every supported England ground', () => {
    const supportedCodes = listEnglandGroundDefinitions().map((definition) => definition.code);

    expect(Object.keys(ENGLAND_GROUND_DRAFT_REGISTRY).sort()).toEqual(supportedCodes.sort());
  });

  it('produces premium arrears drafting for Ground 8 claims', () => {
    const model = buildEnglandPossessionDraftingModel({
      ...baseData(),
      ground_codes: ['8', '10', '11'],
      total_arrears: 3600,
      arrears_items: [
        { period_start: '2026-01-01', period_end: '2026-01-31', rent_paid: 0, amount_owed: 1200 },
        { period_start: '2026-02-01', period_end: '2026-02-28', rent_paid: 0, amount_owed: 1200 },
        { period_start: '2026-03-01', period_end: '2026-03-31', rent_paid: 0, amount_owed: 1200 },
      ],
    });

    const noticeText = model.noticeExplanationParagraphs.join(' ');
    expect(noticeText).toContain('Ground 8 is relied on as the serious rent arrears ground.');
    expect(noticeText).toContain('statutory Ground 8 threshold');
    expect(model.hearingChecklist.warningParagraphs.join(' ')).toContain('Ground 8 should only be advanced');
    expect(noticeText).not.toContain('evidence gathered for that ground at the hearing');
  });

  it('produces clause-specific breach drafting for Ground 12', () => {
    const model = buildEnglandPossessionDraftingModel({
      ...baseData(),
      ground_codes: ['12'],
      ground_12: {
        tenancy_clause: '3.2',
        breach_type: ['keeping a dog without consent', 'subletting part of the property'],
        breach_dates: 'January and February 2026',
        breach_evidence: 'inspection photographs and neighbour correspondence',
        warnings_issued: 'warning letters dated 14 January 2026 and 4 February 2026',
      },
    });

    const text = model.n119OtherBreachParagraphs.join(' ');
    expect(text).toContain('Ground 12 is relied on');
    expect(text).toContain('clause or term 3.2');
    expect(text).toContain('keeping a dog without consent, subletting part of the property');
    expect(text).toContain('warning letters dated 14 January 2026 and 4 February 2026');
  });

  it('produces sober conduct drafting for Ground 14', () => {
    const model = buildEnglandPossessionDraftingModel({
      ...baseData(),
      ground_codes: ['14'],
      ground_14: {
        incidents_description: 'late-night shouting, abusive behaviour towards neighbours, and repeated banging on communal doors',
        incident_count: 4,
        affected_parties: 'two neighbouring households',
        warnings_issued: 'written warning from the managing agent on 12 February 2026',
        police_reference: 'YRK/2241/26',
      },
    });

    const text = model.noticeExplanationParagraphs.join(' ');
    expect(text).toContain('nuisance, annoyance, unlawful use');
    expect(text).toContain('late-night shouting');
    expect(text).toContain('two neighbouring households');
    expect(text).toContain('YRK/2241/26');
  });

  it('produces fact-aware sale drafting for Ground 1A and redevelopment drafting for Ground 6', () => {
    const saleModel = buildEnglandPossessionDraftingModel({
      ...baseData(),
      ground_codes: ['1A'],
      ground_1a: {
        sale_reason: 'the landlord is restructuring their portfolio to clear an estate liability',
        sale_steps_taken: 'two valuations obtained and draft particulars prepared for the estate agent',
        decision_date: '2026-02-14',
        intended_sale_timing: 'marketing is intended within 14 days of possession',
        supporting_evidence: 'valuation letters and email instructions to the estate agent',
      },
    });
    const redevelopmentModel = buildEnglandPossessionDraftingModel({
      ...baseData(),
      ground_codes: ['6'],
      ground_6: {
        works_description: 'rear extension, rewiring, and replacement of the heating system',
        possession_requirement_reason: 'the contractor requires vacant possession for structural works and scaffold access',
        intended_start_date: '2026-04-22',
        planning_or_contractor_status: 'building control approval obtained and contractor booked',
        supporting_evidence: 'approved plans and contractor quote',
      },
    });

    expect(saleModel.noticeExplanationParagraphs.join(' ')).toContain('dwelling-house is to be sold with vacant possession');
    expect(saleModel.noticeExplanationParagraphs.join(' ')).toContain('restructuring their portfolio');
    expect(saleModel.noticeExplanationParagraphs.join(' ')).toContain('valuation letters');
    expect(saleModel.bundleIndex.groundRows[0]?.title).toContain('Sale of dwelling house evidence');
    expect(redevelopmentModel.noticeExplanationParagraphs.join(' ')).toContain('rear extension, rewiring, and replacement of the heating system');
    expect(redevelopmentModel.noticeExplanationParagraphs.join(' ')).toContain('building control approval obtained');
    expect(redevelopmentModel.bundleIndex.sectionTitle).toBe('D. Redevelopment evidence');
  });

  it('produces fact-aware specialist occupation drafting for Grounds 2ZA, 7B, and 9', () => {
    const model = buildEnglandPossessionDraftingModel({
      ...baseData(),
      ground_codes: ['2ZA', '7B', '9'],
      ground_2za: {
        factual_basis: 'the superior lease requires the claimant to provide vacant possession at the end of the term',
        qualifying_occupier: 'superior landlord',
        occupier_relationship: 'headlease possession obligation',
        trigger_date: '2026-07-01',
        notice_or_status_details: 'notice to quit served by the superior landlord on 1 March 2026',
        supporting_evidence: 'copy headlease and superior landlord notice',
      },
      ground_7b: {
        affected_occupiers: 'the tenant and her adult son',
        status_basis: 'a Home Office disqualification notice states that neither occupier has a right to rent',
        notice_source: 'Home Office notice dated 12 March 2026',
        status_check_date: '2026-03-12',
        decision_or_reference: 'HMO-RTR-44219',
        supporting_evidence: 'Home Office notice and right-to-rent check record',
      },
      ground_9: {
        alternative_address: 'Flat 4, 22 Riverside Road, York YO1 7AA',
        availability_date: '2026-04-20',
        suitability_summary: 'two-bedroom flat close to the tenant’s work and the children’s school',
        affordability_summary: 'rent is within the local housing allowance and the tenancy can start immediately',
        supporting_evidence: 'draft tenancy offer and landlord confirmation',
      },
    });

    const text = model.noticeExplanationParagraphs.join(' ');
    expect(text).toContain('superior lease requires the claimant to provide vacant possession');
    expect(text).toContain('the tenant and her adult son');
    expect(text).toContain('HMO-RTR-44219');
    expect(text).toContain('22 Riverside Road');
    expect(text).toContain('local housing allowance');
    expect(text).not.toContain('statutory factual basis for possession when superior lease ends is met');
  });

  it('adds a bridge paragraph for mixed multi-ground claims', () => {
    const model = buildEnglandPossessionDraftingModel({
      ...baseData(),
      ground_codes: ['8', '12'],
      total_arrears: 3600,
      ground_12: {
        tenancy_clause: '4.1',
        breach_type: ['unauthorised subletting'],
      },
    });

    expect(model.groundsBridgeParagraphs.length).toBeGreaterThan(0);
    expect(model.n119ReasonParagraphs.join(' ')).toContain('Ground 8');
    expect(model.n119ReasonParagraphs.join(' ')).toContain('Ground 12');
  });

  it('builds premium support-document drafting sections from the same central model', () => {
    const model = buildEnglandPossessionDraftingModel({
      ...baseData(),
      court_name: 'York County Court and Family Court',
      ground_codes: ['1A', '6'],
      ground_1a: {
        sale_reason: 'the landlord intends to sell the dwelling to settle an estate liability',
        sale_steps_taken: 'valuation obtained and sales particulars drafted',
        supporting_evidence: 'valuation letter and draft agency instruction',
      },
      ground_6: {
        works_description: 'structural repairs and rewiring',
        possession_requirement_reason: 'the contractor requires vacant possession',
        supporting_evidence: 'schedule of works and contractor quotation',
      },
    });

    expect(model.coverLetter.introParagraphs.join(' ')).toContain('Please find enclosed the Form 3A notice');
    expect(model.evidenceChecklist.groundSections).toHaveLength(2);
    expect(model.courtFilingGuide.filingItems.join(' ')).toContain('Form N5');
    expect(model.roadmap.issueStageItems.join(' ')).toContain('specialist ground remains in issue');
    expect(model.previewSummary.narrativeParagraphs.join(' ')).toContain('Ground 1A');
  });
});
