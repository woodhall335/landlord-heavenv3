import { describe, expect, it, beforeEach, vi } from 'vitest';
import { POST as startWizard } from '@/app/api/wizard/start/route';

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
    supabaseClientMock.from.mockReturnValue(supabaseClientMock);
    supabaseClientMock.insert.mockReturnValue(supabaseClientMock);
    supabaseClientMock.select.mockReturnValue(supabaseClientMock);
    supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
    supabaseClientMock.is.mockReturnValue(supabaseClientMock);
    supabaseClientMock.single.mockResolvedValue({ data: null, error: null });
  });

  it('allows Scotland money claim cases at /api/wizard/start', async () => {
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: 'case-123',
        case_type: 'money_claim',
        jurisdiction: 'scotland',
        status: 'in_progress',
        collected_facts: {},
        user_id: null,
      },
      error: null,
    });

    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({ product: 'money_claim', jurisdiction: 'scotland' }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.case_id).toBeDefined();
    expect(body.next_question?.id).toBe('pursuer_full_name');
    expect(supabaseClientMock.insert).toHaveBeenCalled();
  });

  it('allows England & Wales money claim cases at /api/wizard/start', async () => {
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: 'case-456',
        case_type: 'money_claim',
        jurisdiction: 'england-wales',
        status: 'in_progress',
        collected_facts: {},
        user_id: null,
      },
      error: null,
    });

    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({ product: 'money_claim', jurisdiction: 'england-wales' }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.case_id).toBeDefined();
    expect(body.next_question?.id).toBe('claimant_full_name');
    expect(supabaseClientMock.insert).toHaveBeenCalled();
  });

  it('blocks Northern Ireland money claim cases at /api/wizard/start', async () => {
    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({ product: 'money_claim', jurisdiction: 'northern-ireland' }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('Northern Ireland');
    expect(supabaseClientMock.insert).not.toHaveBeenCalled();
  });
});
