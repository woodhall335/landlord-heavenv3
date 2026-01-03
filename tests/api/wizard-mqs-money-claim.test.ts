import { describe, expect, test, beforeAll } from 'vitest';
import { loadMQS, type MasterQuestionSet } from '@/lib/wizard/mqs-loader';

// Updated to match actual question IDs in config/mqs/money_claim/england.yaml
const englandCoreIds = [
  'basis_of_claim',
  'total_claim_amount',
  'rent_arrears_details',
  'property_damage_details',
  'property_address',
  'defendant_details',
  'claimant_details',
  'pre_action_compliance',
  'preferred_court',
  'evidence_uploads',
];

// Updated to match actual question IDs in config/mqs/money_claim/scotland.yaml
const scotlandCoreIds = [
  'basis_of_claim',
  'arrears_total',
  'property_address',
  'defender_full_name',
  'pursuer_full_name',
  'sheriff_court',
  'demand_letter_date',
  'arrears_schedule_confirm',
  'evidence_types_available',
  'enforcement_preferences',
];

describe('Money claim MQS - England & Wales coverage', () => {
  let mqs: MasterQuestionSet | null;

  beforeAll(() => {
    mqs = loadMQS('money_claim', 'england');
  });

  test('loads the money claim MQS for England & Wales', () => {
    expect(mqs).not.toBeNull();
    expect(mqs?.product).toBe('money_claim');
    expect(mqs?.jurisdiction).toBe('england');
  });

  test('includes core money claim questions', () => {
    const questionIds = new Set((mqs?.questions ?? []).map((q: { id: string }) => q.id));

    englandCoreIds.forEach((id) => {
      expect(questionIds.has(id)).toBe(true);
    });
  });
});

describe('Money claim MQS - Scotland coverage', () => {
  let mqs: MasterQuestionSet | null;

  beforeAll(() => {
    mqs = loadMQS('money_claim', 'scotland');
  });

  test('loads the money claim MQS for Scotland', () => {
    expect(mqs).not.toBeNull();
    expect(mqs?.product).toBe('money_claim');
    expect(mqs?.jurisdiction).toBe('scotland');
  });

  test('includes core money claim questions', () => {
    const questionIds = new Set((mqs?.questions ?? []).map((q: { id: string }) => q.id));

    scotlandCoreIds.forEach((id) => {
      expect(questionIds.has(id)).toBe(true);
    });
  });
});
