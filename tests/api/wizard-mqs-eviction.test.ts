import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock AI clients BEFORE importing any modules that use them
vi.mock('@/lib/ai/openai-client', () => ({
  chatCompletion: vi.fn(),
  jsonCompletion: vi.fn(),
  streamChatCompletion: vi.fn(),
  openai: {},
}));

vi.mock('@/lib/ai/claude-client', () => ({
  claudeCompletion: vi.fn(),
  claudeJsonCompletion: vi.fn(),
  streamClaudeCompletion: vi.fn(),
  anthropic: {},
}));

import { POST as nextQuestion } from '@/app/api/wizard/next-question/route';
import { POST as saveAnswer } from '@/app/api/wizard/answer/route';
import { POST as startWizard } from '@/app/api/wizard/start/route';
import * as mqsLoader from '@/lib/wizard/mqs-loader';
import { enhanceAnswer } from '@/lib/ai/ask-heaven';
import * as aiModule from '@/lib/ai';
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

  it('loads Scotland complete-pack MQS and returns first question', async () => {
    const mockCase = {
      id: 'case-scot',
      case_type: 'eviction',
      jurisdiction: 'scotland',
      collected_facts: { __meta: { product: 'complete_pack', mqs_version: null } },
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
      })
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.next_question.id).toBe('case_overview');
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

  it('starts Scotland complete-pack cases with MQS first question', async () => {
    const existingFacts = createEmptyWizardFacts();
    existingFacts.__meta = { product: 'complete_pack', mqs_version: null } as any;

    supabaseClientMock.single
      .mockResolvedValueOnce({
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          case_type: 'eviction',
          jurisdiction: 'scotland',
          status: 'in_progress',
          collected_facts: existingFacts,
          user_id: null,
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: { facts: existingFacts }, error: null });

    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({
          product: 'complete_pack',
          jurisdiction: 'scotland',
          case_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      })
    );

    const body = await response.json();
    if (response.status !== 200) {
      throw new Error(`Start wizard error: ${JSON.stringify(body)}`);
    }
    expect(response.status).toBe(200);
    expect(body.product).toBe('complete_pack');
    expect(body.jurisdiction).toBe('scotland');
    expect(body.next_question?.id).toBe('case_overview');
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
