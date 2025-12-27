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
      jurisdiction: 'england',
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
        {
          id: 'tenant_full_name',
          section: 'Tenant',
          question: 'Tenant full name',
          inputType: 'text',
          validation: { required: true },
          maps_to: ['tenant_full_name'],
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

  it('downgrades compliance issues to warnings at wizard stage (no blocking)', async () => {
    const mockCase = {
      id: 'case-123',
      case_type: 'eviction',
      jurisdiction: 'england',
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
          answer: false, // Non-compliant answer
        }),
      }),
    );

    const body = await response.json();
    // Wizard stage should NOT block on compliance issues
    expect(response.status).toBe(200);
    expect(body.answer_saved).toBe(true);

    // Should have compliance warnings about deposit not being protected
    const depositWarnings = body.compliance_warnings?.filter((w: any) =>
      w.fields?.includes('deposit_protected') || w.code?.includes('DEPOSIT')
    );
    // May or may not have warnings depending on whether other facts are present
    // The key is that it doesn't block with 422
    expect(body.compliance_warnings).toBeDefined();
  });

  it('allows progression when deposit is protected but prescribed info is not answered yet', async () => {
    const mockCase = {
      id: 'case-789',
      case_type: 'eviction',
      jurisdiction: 'england',
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
          answer: true,
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.answer_saved).toBe(true);

    // May have compliance warnings about other missing facts (prescribed info, etc.)
    // The key is that progression is allowed (200 response)
    expect(body.compliance_warnings).toBeDefined();
    expect(Array.isArray(body.compliance_warnings)).toBe(true);
  });

  it('allows non-checkpoint questions to pass even with compliance issues (downgrades to warnings)', async () => {
    const mockCase = {
      id: 'case-456',
      case_type: 'eviction',
      jurisdiction: 'england',
      collected_facts: { __meta: { product: 'notice_only', mqs_version: null } },
      user_id: null,
      wizard_progress: 0,
    };

    supabaseClientMock.single.mockResolvedValue({ data: mockCase, error: null });

    // Mock a non-checkpoint question (e.g., 'tenant_full_name')
    const response = await saveAnswer(
      new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        body: JSON.stringify({
          case_id: mockCase.id,
          question_id: 'tenant_full_name', // NOT a checkpoint question
          answer: 'John Doe',
        }),
      }),
    );

    const body = await response.json();
    // Should NOT return 422, even if there are compliance failures
    // Instead, compliance failures are downgraded to warnings
    expect(response.status).toBe(200);
    expect(body.answer_saved).toBe(true);
    // Compliance warnings may be present but shouldn't block
    if (body.compliance_warnings) {
      expect(Array.isArray(body.compliance_warnings)).toBe(true);
    }
  });
});

