import { describe, expect, test, beforeAll } from 'vitest';
import { loadMQS, type MasterQuestionSet } from '@/lib/wizard/mqs-loader';

const englandWalesNewIds = [
  'lba_documents_sent',
  'lba_second_sent',
  'lba_second_date',
  'lba_second_method',
  'lba_second_response_deadline',
  'defendant_response_details',
  'arrears_schedule_confirm',
  'evidence_types_available',
  'pap_documents_served',
  'pap_service_method',
  'pap_service_proof',
  'court_issue_route',
  'claim_value_band',
  'help_with_fees_needed',
  'enforcement_preferences',
  'enforcement_notes',
];

const scotlandNewIds = [
  'pre_action_first_method',
  'pre_action_response_deadline',
  'pre_action_docs_sent',
  'pre_action_second_method',
  'pre_action_reply_received',
  'pre_action_reply_details',
  'pre_action_letter_14day',
  'sheriff_court',
  'court_jurisdiction_confirmed',
  'lodging_method',
  'help_with_fees_needed',
  'enforcement_preferences',
  'enforcement_notes',
  'arrears_schedule_confirm',
  'evidence_types_available',
  'pre_action_letter_served',
  'pre_action_service_method',
  'pre_action_service_proof',
];

describe('Money claim MQS - England & Wales PAP-DEBT coverage', () => {
  let mqs: MasterQuestionSet | null;

  beforeAll(() => {
    mqs = loadMQS('money_claim', 'england');
  });

  test('loads the money claim MQS for England & Wales', () => {
    expect(mqs).not.toBeNull();
    expect(mqs?.product).toBe('money_claim');
    expect(mqs?.jurisdiction).toBe('england');
  });

  test('includes PAP-DEBT, court route, evidence, and enforcement questions', () => {
    const questionIds = new Set((mqs?.questions ?? []).map((q: { id: string }) => q.id));

    englandWalesNewIds.forEach((id) => {
      expect(questionIds.has(id)).toBe(true);
    });
  });
});

describe('Money claim MQS - Scotland Rule 3.1 coverage', () => {
  let mqs: MasterQuestionSet | null;

  beforeAll(() => {
    mqs = loadMQS('money_claim', 'scotland');
  });

  test('loads the money claim MQS for Scotland', () => {
    expect(mqs).not.toBeNull();
    expect(mqs?.product).toBe('money_claim');
    expect(mqs?.jurisdiction).toBe('scotland');
  });

  test('includes Rule 3.1, evidence, enforcement, and lodging questions', () => {
    const questionIds = new Set((mqs?.questions ?? []).map((q: { id: string }) => q.id));

    scotlandNewIds.forEach((id) => {
      expect(questionIds.has(id)).toBe(true);
    });
  });
});
