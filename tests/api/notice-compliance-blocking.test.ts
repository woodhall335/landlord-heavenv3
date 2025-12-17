import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST as saveAnswer } from '@/app/api/wizard/answer/route';

const supabaseClientMock: any = {
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  update: vi.fn(),
  auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
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
    '@/lib/wizard/mqs-loader',
  );
  return {
    ...actual,
    loadMQS: vi.fn(() => ({
      id: 'notice_only',
      product: 'notice_only',
      jurisdiction: 'england-wales',
      version: '1.0.0',
      questions: [
        {
          id: 'deposit_protected_scheme',
          section: 'Compliance',
          question: 'Is the deposit protected?',
          inputType: 'yes_no',
          validation: { required: true },
          maps_to: ['deposit_protected'],
        },
      ],
    })),
  };
});

vi.mock('@/lib/ai/ask-heaven', () => ({
  enhanceAnswer: vi.fn(async () => null),
}));

vi.mock('@/lib/case-facts/store', () => ({
  getOrCreateWizardFacts: vi.fn(async () => ({
    __meta: { product: 'notice_only' },
    selected_notice_route: 'section_21',
    deposit_taken: true,
  })),
  updateWizardFacts: vi.fn(async (_supabase, _caseId, updater) => updater({} as any)),
}));

vi.mock('@/lib/notices/evaluate-notice-compliance', () => ({
  evaluateNoticeCompliance: vi.fn(() => ({
    ok: false,
    hardFailures: [
      {
        code: 'S21-DEPOSIT-NONCOMPLIANT',
        affected_question_id: 'deposit_protected_scheme',
        legal_reason: 'Deposit not protected',
        user_fix_hint: 'Protect the deposit',
      },
    ],
    warnings: [],
  })),
}));

describe('wizard answer compliance blocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.from.mockReturnValue(supabaseClientMock);
    supabaseClientMock.insert.mockReturnValue(supabaseClientMock);
    supabaseClientMock.select.mockReturnValue(supabaseClientMock);
    supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
    supabaseClientMock.is.mockReturnValue(supabaseClientMock);
    supabaseClientMock.update.mockReturnValue(supabaseClientMock);
  });

  it('returns 422 with failures and no next_question when noncompliant', async () => {
    const mockCase = {
      id: 'case-123',
      case_type: 'eviction',
      jurisdiction: 'england-wales',
      collected_facts: { __meta: { product: 'notice_only', mqs_version: null } },
      user_id: null,
      wizard_progress: 0,
    };

    supabaseClientMock.single.mockResolvedValue({ data: mockCase, error: null });

    const response = await saveAnswer(
      new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        body: JSON.stringify({
          case_id: mockCase.id,
          question_id: 'deposit_protected_scheme',
          answer: false,
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.failures?.[0]?.affected_question_id).toBe('deposit_protected_scheme');
    expect(body.next_question).toBeUndefined();
  });
});

