import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { __setTestJsonAIClient } from '@/lib/ai/openai-client';
import { POST as nextQuestion } from '@/app/api/wizard/next-question/route';
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

vi.mock('@/lib/ai/ask-heaven', () => ({
  enhanceAnswer: vi.fn(),
}));

describe('Wizard info-type question handling', () => {
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
    supabaseClientMock.insert.mockReturnValue(supabaseClientMock);
    supabaseClientMock.select.mockReturnValue(supabaseClientMock);
    supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
    supabaseClientMock.is.mockReturnValue(supabaseClientMock);
    supabaseClientMock.update.mockReturnValue(supabaseClientMock);
  });

  it('returns info-type question (section21_intro) once and marks it as viewed', async () => {
    // Start with facts that would lead to section21_intro being the next question
    const facts = createEmptyWizardFacts();
    facts.__meta = { product: 'notice_only', mqs_version: null } as any;

    // Fill in answers up to (but not including) section21_intro
    // Based on england.yaml MQS, these are the questions before section21_intro:
    facts.landlord_name = 'Test Landlord';
    facts.tenant_name = 'Test Tenant';
    facts.property_address_line1 = '123 Test St';
    facts.property_postcode = 'AB1 2CD';
    facts.tenancy_start_date = '2023-01-01';
    facts.rent_amount = 1000;
    facts.rent_frequency = 'monthly';
    facts.payment_date = 1;

    const mockCase = {
      id: 'case-info-test',
      case_type: 'eviction',
      jurisdiction: 'england',
      collected_facts: facts,
      user_id: null,
      wizard_progress: 30,
    };

    supabaseClientMock.single.mockResolvedValue({ data: mockCase, error: null });

    // First call: should return section21_intro (info question)
    const response1 = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({
          case_id: mockCase.id,
        }),
      }),
    );

    const body1 = await response1.json();
    expect(response1.status).toBe(200);
    expect(body1.next_question.id).toBe('section21_intro');
    expect(body1.next_question.inputType).toBe('info');

    // Verify that update was called to mark the info question as viewed
    expect(supabaseClientMock.update).toHaveBeenCalled();

    // Second call: should skip section21_intro and return the next question
    // Update the mock to include the viewed marker
    const factsWithViewed = { ...facts, section21_intro: '_info_viewed' };
    const mockCaseAfterView = { ...mockCase, collected_facts: factsWithViewed };

    supabaseClientMock.single.mockResolvedValue({ data: mockCaseAfterView, error: null });
    vi.clearAllMocks(); // Clear the update call from first request

    const response2 = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({
          case_id: mockCase.id,
        }),
      }),
    );

    const body2 = await response2.json();
    expect(response2.status).toBe(200);
    // Should return deposit_taken (the question after section21_intro)
    expect(body2.next_question.id).toBe('deposit_taken');
    expect(body2.next_question.id).not.toBe('section21_intro');
  });

  it('does not get stuck in a loop on info questions', async () => {
    const facts = createEmptyWizardFacts();
    facts.__meta = { product: 'notice_only', mqs_version: null } as any;

    // Set up to reach section21_intro
    facts.landlord_name = 'Test Landlord';
    facts.tenant_name = 'Test Tenant';
    facts.property_address_line1 = '123 Test St';
    facts.property_postcode = 'AB1 2CD';
    facts.tenancy_start_date = '2023-01-01';
    facts.rent_amount = 1000;
    facts.rent_frequency = 'monthly';
    facts.payment_date = 1;

    const mockCase = {
      id: 'case-no-loop',
      case_type: 'eviction',
      jurisdiction: 'england',
      collected_facts: facts,
      user_id: null,
      wizard_progress: 30,
    };

    supabaseClientMock.single.mockResolvedValue({ data: mockCase, error: null });

    // Call next-question multiple times
    const responses: string[] = [];

    for (let i = 0; i < 3; i++) {
      vi.clearAllMocks();

      const response = await nextQuestion(
        new Request('http://localhost/api/wizard/next-question', {
          method: 'POST',
          body: JSON.stringify({
            case_id: mockCase.id,
          }),
        }),
      );

      const body = await response.json();
      responses.push(body.next_question.id);

      // After first call, update facts to include the viewed marker
      if (i === 0 && body.next_question.inputType === 'info') {
        mockCase.collected_facts = {
          ...mockCase.collected_facts,
          [body.next_question.id]: '_info_viewed',
        };
        supabaseClientMock.single.mockResolvedValue({ data: mockCase, error: null });
      }
    }

    // Verify we don't get stuck on the same question
    expect(responses[0]).toBe('section21_intro');
    expect(responses[1]).not.toBe('section21_intro');
    expect(responses[2]).not.toBe('section21_intro');
  });
});
