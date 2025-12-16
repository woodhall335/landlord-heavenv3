import { beforeAll, afterAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { __setTestJsonAIClient } from '@/lib/ai/openai-client';

import { POST as nextQuestion } from '@/app/api/wizard/next-question/route';
import * as aiModule from '@/lib/ai';
import * as mqsLoader from '@/lib/wizard/mqs-loader';
import { createEmptyWizardFacts } from '@/lib/case-facts/schema';

const supabaseClientMock = {
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  update: vi.fn(),
};

supabaseClientMock.from.mockReturnValue(supabaseClientMock);
supabaseClientMock.insert.mockReturnValue(supabaseClientMock);
supabaseClientMock.select.mockReturnValue(supabaseClientMock);
supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
supabaseClientMock.is.mockReturnValue(supabaseClientMock);
supabaseClientMock.update.mockReturnValue(supabaseClientMock);

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => supabaseClientMock),
  getServerUser: vi.fn(async () => null),
}));

vi.mock('@/lib/ai', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai')>('@/lib/ai');
  return {
    ...actual,
    getNextQuestion: vi.fn(async () => ({
      next_question: { id: 'ai_follow_up', section: 'AI', question: 'AI follow up', inputType: 'text' },
      is_complete: false,
      missing_critical_facts: [],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2, cost_usd: 0 },
    })),
  };
});

vi.mock('@/lib/wizard/mqs-loader', async () => {
  const actual = await vi.importActual<typeof import('@/lib/wizard/mqs-loader')>('@/lib/wizard/mqs-loader');
  return {
    ...actual,
    getNextMQSQuestion: vi.fn(() => null),
  };
});

describe('Money claim completion gating', () => {
  beforeAll(() => {
    __setTestJsonAIClient({
      jsonCompletion: (async () => {
        const json = {
          suggested_wording: '',
          missing_information: [],
          evidence_suggestions: [],
          consistency_flags: [],
        };

        return {
          content: JSON.stringify(json),
          json,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          model: 'test-model',
          cost_usd: 0,
        };
      }) as any,
    } as any);
  });

  afterAll(() => {
    __setTestJsonAIClient(null);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.from.mockReturnValue(supabaseClientMock);
    supabaseClientMock.select.mockReturnValue(supabaseClientMock);
    supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
    supabaseClientMock.is.mockReturnValue(supabaseClientMock);
    supabaseClientMock.update.mockReturnValue(supabaseClientMock);
    (mqsLoader.getNextMQSQuestion as Mock).mockReturnValue(null);
  });

  it('falls back to AI when essential money-claim facts are missing', async () => {
    const caseRow = {
      id: 'case-mc-1',
      case_type: 'money_claim',
      jurisdiction: 'england',
      collected_facts: createEmptyWizardFacts(),
      user_id: null,
      wizard_progress: 0,
    };

    supabaseClientMock.single
      .mockResolvedValueOnce({ data: caseRow, error: null })
      .mockResolvedValueOnce({ data: { facts: caseRow.collected_facts }, error: null });

    const response = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({ case_id: caseRow.id }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.is_complete).toBe(false);
    expect(body.next_question.id).toBe('ai_follow_up');
    expect(body.missing_essentials).toContain('pre_action_letter_date');
    expect((aiModule.getNextQuestion as Mock)).toHaveBeenCalled();
  });

  it('marks money-claim complete when essentials are present', async () => {
    const facts = {
      landlord_name: 'Alice Landlord',
      property_address_line1: '1 High Street',
      property_postcode: 'E1 1AA',
      rent_amount: 900,
      basis_of_claim: 'rent_arrears',
      total_arrears: 900,
      lba_date: '2024-01-01',
      lba_response_deadline: '2024-01-31',
      lba_method: ['post'],
      pap_documents_sent: ['information_sheet'],
      pap_documents_served: true,
      arrears_schedule_confirmed: true,
      attempts_to_resolve: 'Sent reminders and offered payment plan.',
      charge_interest: true,
      enforcement_preferences: ['warrant_of_control'],
      tenants: [{ full_name: 'Tom Tenant' }],
    };

    const caseRow = {
      id: 'case-mc-2',
      case_type: 'money_claim',
      jurisdiction: 'england',
      collected_facts: facts,
      user_id: null,
      wizard_progress: 90,
    };

    supabaseClientMock.single
      .mockResolvedValueOnce({ data: caseRow, error: null })
      .mockResolvedValueOnce({ data: { facts }, error: null });

    const response = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({ case_id: caseRow.id }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.is_complete).toBe(true);
    expect(body.progress).toBe(100);
    expect(body.next_question).toBeNull();
    expect((aiModule.getNextQuestion as Mock)).not.toHaveBeenCalled();
  });
});
