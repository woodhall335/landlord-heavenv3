import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST as nextQuestion } from '@/app/api/wizard/next-question/route';

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
  landlord_name: 'Alice',
  tenant_name: 'Bob',
  __meta: { product: 'notice_only' },
};

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => supabaseClientMock),
  getServerUser: vi.fn(async () => null),
}));

vi.mock('@/lib/case-facts/store', () => ({
  getOrCreateWizardFacts: vi.fn(async () => mockFacts),
  updateWizardFacts: vi.fn(),
}));

vi.mock('@/lib/wizard/mqs-loader', async () => {
  const actual = await vi.importActual<typeof import('@/lib/wizard/mqs-loader')>(
    '@/lib/wizard/mqs-loader',
  );

  const mockMQS: any = {
    product: 'notice_only',
    jurisdiction: 'england',
    questions: [
      { id: 'landlord_name', question: 'Landlord name', inputType: 'text', maps_to: ['landlord_name'] },
      { id: 'tenant_name', question: 'Tenant name', inputType: 'text', maps_to: ['tenant_name'] },
    ],
  };

  return {
    ...actual,
    loadMQS: vi.fn(() => mockMQS),
    questionIsApplicable: vi.fn(() => true),
  };
});

describe('Wizard next-question edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.from.mockReturnValue(supabaseClientMock);
    supabaseClientMock.select.mockReturnValue(supabaseClientMock);
    supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
    supabaseClientMock.is.mockReturnValue(supabaseClientMock);
    supabaseClientMock.update.mockReturnValue(supabaseClientMock);
  });

  it('returns answered questions in review order when include_answered is true', async () => {
    const caseRow = {
      id: 'case-edit-mode',
      case_type: 'eviction',
      jurisdiction: 'england',
      collected_facts: mockFacts,
      user_id: null,
      wizard_progress: 100,
    };

    supabaseClientMock.single.mockResolvedValueOnce({ data: caseRow, error: null });

    const response = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({
          case_id: caseRow.id,
          mode: 'edit',
          include_answered: true,
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.is_complete).toBe(false);
    expect(body.next_question.id).toBe('landlord_name');
  });
});
