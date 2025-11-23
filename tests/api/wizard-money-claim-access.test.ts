import { describe, expect, it, beforeEach, vi } from 'vitest';
import { POST as startWizard } from '@/app/api/wizard/start/route';
import { POST as nextQuestion } from '@/app/api/wizard/next-question/route';
import { POST as analyzeWizard } from '@/app/api/wizard/analyze/route';

const supabaseClientMock = {
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
};

supabaseClientMock.from.mockReturnValue(supabaseClientMock);
supabaseClientMock.insert.mockReturnValue(supabaseClientMock);
supabaseClientMock.select.mockReturnValue(supabaseClientMock);
supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
supabaseClientMock.is.mockReturnValue(supabaseClientMock);

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

describe('Money claim access controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.single.mockResolvedValue({ data: null, error: null });
  });

  it('blocks Scotland money claim cases at /api/wizard/start', async () => {
    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({ case_type: 'money_claim', jurisdiction: 'scotland' }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('England & Wales');
    expect(supabaseClientMock.insert).not.toHaveBeenCalled();
  });

  it('blocks Scotland money claim cases at /api/wizard/next-question', async () => {
    const response = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({
          case_id: 'case-123',
          case_type: 'money_claim',
          jurisdiction: 'scotland',
          collected_facts: {},
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('England & Wales');
    expect(supabaseClientMock.from).not.toHaveBeenCalledWith('cases');
  });

  it('blocks Scotland money claim analysis at /api/wizard/analyze', async () => {
    const scotCase = {
      id: 'case-123',
      case_type: 'money_claim',
      jurisdiction: 'scotland',
      collected_facts: {},
      user_id: null,
    };

    supabaseClientMock.single.mockResolvedValue({ data: scotCase, error: null });

    const response = await analyzeWizard(
      new Request('http://localhost/api/wizard/analyze', {
        method: 'POST',
        body: JSON.stringify({
          case_id: scotCase.id,
          collected_facts: {},
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('England & Wales');
  });
});
