import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST as answerQuestion } from '@/app/api/wizard/answer/route';

const storeMocks = vi.hoisted(() => ({
  updateWizardFacts: vi.fn(),
}));

const askHeavenMocks = vi.hoisted(() => ({
  enhanceAnswer: vi.fn(),
}));

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

const mockFacts = {
  grounds: ['ground_8'],
  __meta: { product: 'notice_only' },
};

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => supabaseClientMock),
  getServerUser: vi.fn(async () => null),
}));

vi.mock('@/lib/case-facts/store', () => ({
  getOrCreateWizardFacts: vi.fn(async () => mockFacts),
  updateWizardFacts: storeMocks.updateWizardFacts,
}));

vi.mock('@/lib/wizard/mqs-loader', async () => {
  const actual = await vi.importActual<typeof import('@/lib/wizard/mqs-loader')>(
    '@/lib/wizard/mqs-loader',
  );

  const mockMQS: any = {
    product: 'notice_only',
    jurisdiction: 'england',
    questions: [
      {
        id: 'grounds_particulars',
        question: 'Provide specific details for each ground selected',
        inputType: 'group',
        maps_to: ['grounds_particulars'],
        fields: [
          { id: 'ground_8', label: 'Ground 8 particulars', validation: { required: true } },
          { id: 'ground_10', label: 'Ground 10 particulars' },
        ],
      },
    ],
  };

  return {
    ...actual,
    loadMQS: vi.fn(() => mockMQS),
    questionIsApplicable: vi.fn(() => true),
  };
});

vi.mock('@/lib/ai/ask-heaven', () => ({
  enhanceAnswer: askHeavenMocks.enhanceAnswer,
}));

describe('wizard answer route - enhance_only mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.from.mockReturnValue(supabaseClientMock);
    supabaseClientMock.insert.mockReturnValue(supabaseClientMock);
    supabaseClientMock.select.mockReturnValue(supabaseClientMock);
    supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
    supabaseClientMock.is.mockReturnValue(supabaseClientMock);
    supabaseClientMock.update.mockReturnValue(supabaseClientMock);
  });

  it('returns Ask Heaven suggestions without mutating wizard state', async () => {
    const caseRow = {
      id: 'case-enhance-only',
      case_type: 'eviction',
      jurisdiction: 'england',
      collected_facts: mockFacts,
      user_id: null,
      wizard_progress: 45,
    };

    supabaseClientMock.single.mockResolvedValueOnce({ data: caseRow, error: null });

    askHeavenMocks.enhanceAnswer.mockResolvedValueOnce({
      suggested_wording: 'Improved particulars for ground 8.',
      missing_information: ['Add payment dates'],
      evidence_suggestions: ['Rent schedule'],
      consistency_flags: [],
    });

    const response = await answerQuestion(
      new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        body: JSON.stringify({
          case_id: caseRow.id,
          question_id: 'grounds_particulars',
          answer: {
            ground_8: 'Tenant has not paid rent for over two months.',
          },
          mode: 'enhance_only',
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.answer_saved).toBe(false);
    expect(body.suggested_wording).toBe('Improved particulars for ground 8.');
    expect(body.ask_heaven.suggested_wording).toBe('Improved particulars for ground 8.');
    expect(body.enhanced_answer.raw).toContain('ground_8');

    expect(storeMocks.updateWizardFacts).not.toHaveBeenCalled();
    expect(supabaseClientMock.update).not.toHaveBeenCalled();
    expect(supabaseClientMock.insert).not.toHaveBeenCalled();
  });
});
