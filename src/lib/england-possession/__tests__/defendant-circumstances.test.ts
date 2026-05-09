import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  NO_KNOWN_DEFENDANT_CIRCUMSTANCES_TEXT,
  buildCompletePackDefendantCircumstancesParagraphs,
} from '@/lib/england-possession/defendant-circumstances';
import {
  buildEnglandPossessionDraftingModel,
  buildN119DefendantCircumstancesText,
} from '@/lib/england-possession/pack-drafting';
import { buildEnglandSection8CourtPackCalculation } from '@/lib/documents/england-section8-court-pack';
import {
  buildWitnessStatementSections,
  extractWitnessStatementSectionsInput,
} from '@/lib/documents/witness-statement-sections';

const BANNED_INSTRUCTIONAL_TEXT =
  /The landlord should provide|You should add|Please specify|This note should|claimant should|should exhibit|should keep/i;

function baseCompletePackFacts() {
  return {
    jurisdiction: 'england',
    claim_type: 'section_8',
    property_address: '16 Willow Mews, York, YO24 3HX',
    landlord_full_name: 'Alex Landlord',
    tenant_full_name: 'Tina Tenant',
    tenancy_start_date: '2024-02-01',
    notice_service_date: '2026-03-05',
    notice_served_date: '2026-03-05',
    notice_expiry_date: '2026-03-19',
    earliest_proceedings_date: '2026-03-19',
    notice_service_method: 'first_class_post',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    total_arrears: 3600,
    current_arrears: 3600,
    ground_codes: ['8', '10'],
    section8_grounds: ['ground_8', 'ground_10'],
  };
}

function expectCleanCourtText(text: string): void {
  expect(text).not.toMatch(BANNED_INSTRUCTIONAL_TEXT);
  expect(text).not.toContain('undefined');
  expect(text).not.toContain('null');
  expect(text).not.toContain('[object Object]');
}

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

describe('Complete Pack defendant circumstances drafting', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        'england-and-wales': {
          events: [],
        },
      }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('uses a neutral fallback when no defendant circumstances are known', () => {
    const paragraphs = buildCompletePackDefendantCircumstancesParagraphs(baseCompletePackFacts());
    const n119Text = buildN119DefendantCircumstancesText(baseCompletePackFacts());

    expect(paragraphs).toEqual([NO_KNOWN_DEFENDANT_CIRCUMSTANCES_TEXT]);
    expect(n119Text).toBe(NO_KNOWN_DEFENDANT_CIRCUMSTANCES_TEXT);
    expectCleanCourtText(n119Text);
  });

  it('renders benefit or Universal Credit delay details only when details are supplied', () => {
    const text = buildN119DefendantCircumstancesText({
      ...baseCompletePackFacts(),
      benefit_delays: true,
      benefit_type: 'universal_credit',
      tenant_benefits_details:
        'The defendant told the claimant that DWP suspended the housing element in March 2026.',
    });

    expect(text).toContain('benefit or Universal Credit payment issues are said to have affected the arrears');
    expect(text).toContain('DWP suspended the housing element in March 2026');
    expect(text).not.toContain('universal_credit');
    expectCleanCourtText(text);
  });

  it('uses neutral benefit wording when benefit delay is selected without details', () => {
    const text = buildN119DefendantCircumstancesText({
      ...baseCompletePackFacts(),
      benefit_delays: true,
      benefit_type: 'universal_credit',
    });

    expect(text).toBe(
      'The claimant understands that the defendant may say rent arrears were affected by benefit payment issues. The claimant will rely on the rent account and correspondence in the bundle.',
    );
    expectCleanCourtText(text);
  });

  it('renders payment plan offered with no response once in clean factual language', () => {
    const text = buildN119DefendantCircumstancesText({
      ...baseCompletePackFacts(),
      payment_plan_offered: true,
    });

    expect(text).toBe(
      'The claimant offered the defendant the opportunity to discuss payment by instalments, but no agreement was reached.',
    );
    expect(countOccurrences(text, 'payment by instalments')).toBe(1);
    expectCleanCourtText(text);
  });

  it('deduplicates multiple selected circumstances and sanitises old prompt-like wording', () => {
    const text = buildN119DefendantCircumstancesText({
      ...baseCompletePackFacts(),
      tenant_vulnerability_details: 'The defendant has told the claimant about health issues.',
      known_tenant_defences:
        'The defendant says DWP delayed Universal Credit. The landlord should provide a factual note.',
      benefit_delays: true,
      tenant_benefits_details:
        'The defendant says DWP delayed Universal Credit. The defendant says DWP delayed Universal Credit.',
      payment_plan_offered: true,
      payment_plan_response: 'The tenant didnt respond to the proposed installements.',
    });

    expect(text).toContain('health issues');
    expect(text).toContain('The defendant says DWP delayed Universal Credit');
    expect(countOccurrences(text, 'The defendant says DWP delayed Universal Credit')).toBe(1);
    expect(countOccurrences(text, 'The claimant offered the defendant the opportunity')).toBe(1);
    expect(text).toContain('did not respond to the proposed instalments');
    expectCleanCourtText(text);
  });

  it('feeds the same cleaned text to N119, the case summary model, witness statement, and court-pack Q7', async () => {
    const facts = {
      ...baseCompletePackFacts(),
      tenant_vulnerability_details: 'The defendant has disclosed financial difficulty.',
      benefit_delays: true,
      tenant_benefits_details: 'The defendant says DWP delayed Universal Credit.',
      payment_plan_offered: true,
      payment_plan_response: 'The defendant didnt accept installements.',
    };

    const n119Text = buildN119DefendantCircumstancesText(facts);
    const model = buildEnglandPossessionDraftingModel(facts);
    const witnessInput = extractWitnessStatementSectionsInput(facts);
    const witnessSections = buildWitnessStatementSections(witnessInput);
    const courtPack = await buildEnglandSection8CourtPackCalculation({ wizardFacts: facts });

    expect(model.caseSummary.defendantCircumstancesParagraphs.join(' ')).toBe(n119Text);
    expect(witnessSections.defendant_circumstances).toBe(n119Text);
    expect(courtPack.q7Text).toBe(n119Text);
    expect(n119Text).toContain('did not accept instalments');
    expectCleanCourtText(n119Text);
  });
});
