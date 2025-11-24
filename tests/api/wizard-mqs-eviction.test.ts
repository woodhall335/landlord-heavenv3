import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as nextQuestion } from '@/app/api/wizard/next-question/route';
import { POST as saveAnswer } from '@/app/api/wizard/answer/route';
import * as mqsLoader from '@/lib/wizard/mqs-loader';
import { enhanceAnswer } from '@/lib/ai/ask-heaven';
import * as aiModule from '@/lib/ai';

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

vi.mock('@/lib/wizard/mqs-loader', async () => {
  const actual = await vi.importActual<typeof import('@/lib/wizard/mqs-loader')>(
    '@/lib/wizard/mqs-loader'
  );
  return {
    ...actual,
    loadMQS: vi.fn(actual.loadMQS),
  };
});

vi.mock('@/lib/ai/ask-heaven', () => ({
  enhanceAnswer: vi.fn(),
}));

vi.mock('@/lib/ai', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai')>('@/lib/ai');
  return {
    ...actual,
    getNextQuestion: vi.fn(async () => ({
      next_question: { id: 'ai_q1', section: 'AI', question: 'AI Question', inputType: 'text' },
      is_complete: false,
      missing_critical_facts: [],
      usage: {
        prompt_tokens: 1,
        completion_tokens: 1,
        total_tokens: 2,
        cost_usd: 0,
      },
    })),
    trackTokenUsage: vi.fn(async () => undefined),
  };
});

describe('MQS eviction flow (England & Wales)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.from.mockReturnValue(supabaseClientMock);
    supabaseClientMock.insert.mockReturnValue(supabaseClientMock);
    supabaseClientMock.select.mockReturnValue(supabaseClientMock);
    supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
    supabaseClientMock.is.mockReturnValue(supabaseClientMock);
    supabaseClientMock.update.mockReturnValue(supabaseClientMock);
  });

  it('loads notice_only MQS and returns first question', async () => {
    const mockCase = {
      id: 'case-1',
      case_type: 'eviction',
      jurisdiction: 'england-wales',
      collected_facts: { __meta: { product: 'notice_only', mqs_version: null } },
      user_id: null,
      wizard_progress: 0,
    };

    supabaseClientMock.single.mockResolvedValue({ data: mockCase, error: null });

    const response = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({
          case_id: mockCase.id,
          case_type: mockCase.case_type,
          jurisdiction: mockCase.jurisdiction,
          collected_facts: mockCase.collected_facts,
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.next_question.id).toBe('landlord_details');
  });

  it('falls back to AI fact-finder when MQS is missing', async () => {
    const mockCase = {
      id: 'case-2',
      case_type: 'eviction',
      jurisdiction: 'england-wales',
      collected_facts: { __meta: { product: 'money_claim', mqs_version: null } },
      user_id: null,
      wizard_progress: 0,
    };

    supabaseClientMock.single.mockResolvedValue({ data: mockCase, error: null });

    const response = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({
          case_id: mockCase.id,
          case_type: mockCase.case_type,
          jurisdiction: mockCase.jurisdiction,
          collected_facts: mockCase.collected_facts,
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.next_question.id).toBe('ai_q1');
    expect((aiModule.getNextQuestion as unknown as vi.Mock)).toHaveBeenCalled();
  });

  it('enhanceAnswer is called for MQS questions with suggestion_prompt', async () => {
    const mockCase = {
      id: 'case-3',
      case_type: 'eviction',
      jurisdiction: 'england-wales',
      collected_facts: { __meta: { product: 'notice_only', mqs_version: null } },
      user_id: null,
      wizard_progress: 0,
    };

    (mqsLoader.loadMQS as unknown as vi.Mock).mockReturnValueOnce({
      id: 'custom',
      product: 'notice_only',
      jurisdiction: 'england-wales',
      version: '1.0.0',
      questions: [
        {
          id: 'custom_question',
          section: 'Test',
          question: 'Tell us more',
          inputType: 'text',
          suggestion_prompt: 'Improve the wording',
          validation: { required: true },
        },
      ],
    });

    (enhanceAnswer as unknown as vi.Mock).mockResolvedValue({
      suggested_wording: 'Better answer',
      missing_information: ['More detail'],
      evidence_suggestions: ['Tenancy agreement'],
    });

    supabaseClientMock.single
      .mockResolvedValueOnce({ data: mockCase, error: null })
      .mockResolvedValueOnce({ data: { ...mockCase, collected_facts: {} }, error: null });

    const response = await saveAnswer(
      new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        body: JSON.stringify({
          case_id: mockCase.id,
          question_id: 'custom_question',
          answer: 'original answer',
          progress: 10,
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect((enhanceAnswer as unknown as vi.Mock)).toHaveBeenCalled();
    expect(body.enhanced_answer).toEqual({
      raw: 'original answer',
      suggested: 'Better answer',
      missing_information: ['More detail'],
      evidence_suggestions: ['Tenancy agreement'],
    });
  });
});
