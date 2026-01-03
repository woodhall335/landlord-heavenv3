import { describe, expect, it, beforeEach, vi } from 'vitest';
import { POST as startWizard } from '@/app/api/wizard/start/route';
import { POST as nextQuestion } from '@/app/api/wizard/next-question/route';
import { POST as analyzeWizard } from '@/app/api/wizard/analyze/route';
import * as decisionEngine from '@/lib/decision-engine/engine';

const supabaseClientMock = {
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
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
supabaseClientMock.maybeSingle.mockResolvedValue({ data: null, error: null });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => supabaseClientMock),
  getServerUser: vi.fn(async () => null),
  requireServerAuth: vi.fn(async () => ({ id: 'user-1' })),
  createAdminClient: vi.fn(() => ({
    storage: {
      from: () => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ publicUrl: 'https://example.com/doc.pdf' })),
      }),
    },
  })),
}));

vi.mock('@/lib/ai', () => ({
  getNextQuestion: vi.fn(async () => ({
    next_question: null,
    is_complete: true,
    missing_critical_facts: [],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      cost_usd: 0,
    },
  })),
  trackTokenUsage: vi.fn(async () => undefined),
}));

vi.mock('@/lib/decision-engine/engine', async () => {
  const actual = await vi.importActual<typeof import('@/lib/decision-engine/engine')>(
    '@/lib/decision-engine/engine'
  );
  return {
    ...actual,
    analyzeCase: vi.fn(),
  };
});

describe('Wizard API Northern Ireland gating', () => {
  const NI_DISABLED = 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED';

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.single.mockResolvedValue({ data: null, error: null });
  });

  it('rejects NI eviction (notice_only) at /api/wizard/start', async () => {
    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({
          product: 'notice_only',
          jurisdiction: 'northern-ireland',
        }),
      })
    );

    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error).toBe(NI_DISABLED);
    expect(body.blocking_issues).toEqual([]);
    expect(body.warnings).toEqual([]);
    expect(supabaseClientMock.insert).not.toHaveBeenCalled();
  });

  it('rejects NI eviction (complete_pack) at /api/wizard/start', async () => {
    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({
          product: 'complete_pack',
          jurisdiction: 'northern-ireland',
        }),
      })
    );

    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error).toBe(NI_DISABLED);
    expect(body.blocking_issues).toEqual([]);
    expect(body.warnings).toEqual([]);
    expect(supabaseClientMock.insert).not.toHaveBeenCalled();
  });

  it('rejects NI money claim at /api/wizard/start', async () => {
    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({
          product: 'money_claim',
          jurisdiction: 'northern-ireland',
        }),
      })
    );

    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error).toBe(NI_DISABLED);
    expect(body.blocking_issues).toEqual([]);
    expect(body.warnings).toEqual([]);
    expect(supabaseClientMock.insert).not.toHaveBeenCalled();
  });

  it('allows NI tenancy agreements at /api/wizard/start', async () => {
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: 'case-123',
        user_id: null,
        case_type: 'tenancy_agreement',
        jurisdiction: 'northern-ireland',
        status: 'in_progress',
        collected_facts: {},
      },
      error: null,
    });

    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({
          product: 'tenancy_agreement',
          jurisdiction: 'northern-ireland',
        }),
      })
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.case_id).toBeDefined();
    expect(supabaseClientMock.insert).toHaveBeenCalled();
  });

  it('rejects NI money claim cases at /api/wizard/next-question', async () => {
    const niCase = {
      id: 'case-123',
      case_type: 'money_claim',
      jurisdiction: 'northern-ireland',
      collected_facts: {},
      user_id: null,
    };

    supabaseClientMock.single.mockResolvedValue({ data: niCase, error: null });

    const response = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({
          case_id: 'case-123',
        }),
      })
    );

    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error).toBe(NI_DISABLED);
    expect(body.blocking_issues).toEqual([]);
    expect(body.warnings).toEqual([]);
  });

  it('rejects NI eviction analysis at /api/wizard/analyze', async () => {
    const niCase = {
      id: 'case-123',
      case_type: 'eviction',
      jurisdiction: 'northern-ireland',
      collected_facts: {},
      user_id: null,
    };

    supabaseClientMock.single.mockResolvedValue({ data: niCase, error: null });

    const response = await analyzeWizard(
      new Request('http://localhost/api/wizard/analyze', {
        method: 'POST',
        body: JSON.stringify({
          case_id: niCase.id,
        }),
      })
    );

    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error).toBe(NI_DISABLED);
    expect(body.blocking_issues).toEqual([]);
    expect(body.warnings).toEqual([]);
    // Just cast to any for the matcher – no vi.Mock type needed
    expect(decisionEngine.analyzeCase as any).not.toHaveBeenCalled();
  });
});
