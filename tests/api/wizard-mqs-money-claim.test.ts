import { describe, expect, test, beforeAll } from 'vitest';
import { loadMQS } from '@/lib/wizard/mqs-loader';
import type { MasterQuestionSet } from '@/lib/wizard/types';

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

describe('Money claim MQS - England & Wales PAP-DEBT coverage', () => {
  let mqs: MasterQuestionSet | null;

  beforeAll(() => {
    mqs = loadMQS('money_claim', 'england-wales');
  });

  test('loads the money claim MQS for England & Wales', () => {
    expect(mqs).not.toBeNull();
    expect(mqs?.product).toBe('money_claim');
    expect(mqs?.jurisdiction).toBe('england-wales');
  });

  test('includes PAP-DEBT, court route, evidence, and enforcement questions', () => {
    const questionIds = new Set(mqs?.questions.map((q) => q.id));

    englandWalesNewIds.forEach((id) => {
      expect(questionIds.has(id)).toBe(true);
    });
  });
});
