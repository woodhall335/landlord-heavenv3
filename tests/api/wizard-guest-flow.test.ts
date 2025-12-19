/**
 * Tests for guest (anonymous) wizard flow and error handling
 *
 * Verifies:
 * 1. Guests can start and complete wizard without login
 * 2. Error handling properly distinguishes 404 vs 5xx errors
 * 3. RLS policies handle access control (no redundant app-level filtering)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as startWizard } from '@/app/api/wizard/start/route';
import { POST as answerQuestion } from '@/app/api/wizard/answer/route';
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

const mockGuestFacts = {
  landlord_name: 'Guest Landlord',
  __meta: { product: 'notice_only' },
};

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => supabaseClientMock),
  getServerUser: vi.fn(async () => null), // Guest user (not logged in)
}));

vi.mock('@/lib/case-facts/store', () => ({
  getOrCreateWizardFacts: vi.fn(async () => mockGuestFacts),
  updateWizardFacts: vi.fn(async (_supabase: any, _caseId: string, updater: Function) => {
    return updater(mockGuestFacts);
  }),
}));

describe('Guest Wizard Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.from.mockReturnValue(supabaseClientMock);
    supabaseClientMock.insert.mockReturnValue(supabaseClientMock);
    supabaseClientMock.select.mockReturnValue(supabaseClientMock);
    supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
    supabaseClientMock.is.mockReturnValue(supabaseClientMock);
    supabaseClientMock.update.mockReturnValue(supabaseClientMock);
  });

  it('allows guest to start wizard without login', async () => {
    supabaseClientMock.single.mockResolvedValueOnce({
      data: {
        id: 'guest-case-123',
        case_type: 'eviction',
        jurisdiction: 'england-wales',
        status: 'in_progress',
        collected_facts: {},
        user_id: null, // Guest case
      },
      error: null,
    });

    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({ product: 'notice_only', jurisdiction: 'england' }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.case_id).toBeDefined();
    expect(supabaseClientMock.insert).toHaveBeenCalled();
  });

  it('allows guest to answer questions in wizard', async () => {
    const guestCase = {
      id: 'guest-case-123',
      case_type: 'eviction',
      jurisdiction: 'england-wales',
      status: 'in_progress',
      collected_facts: mockGuestFacts,
      user_id: null, // Guest case
    };

    supabaseClientMock.single.mockResolvedValueOnce({ data: guestCase, error: null });

    const response = await answerQuestion(
      new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        body: JSON.stringify({
          case_id: 'guest-case-123',
          question_id: 'landlord_name',
          answer: 'Alice',
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.answer_saved).toBe(true);
  });

  it('allows guest to get next question', async () => {
    const guestCase = {
      id: 'guest-case-456',
      case_type: 'eviction',
      jurisdiction: 'england-wales',
      collected_facts: mockGuestFacts,
      user_id: null, // Guest case
      wizard_progress: 25,
    };

    supabaseClientMock.single.mockResolvedValueOnce({ data: guestCase, error: null });

    const response = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({ case_id: 'guest-case-456' }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.next_question).toBeDefined();
  });
});

describe('Error Handling - Upstream vs Not Found', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.from.mockReturnValue(supabaseClientMock);
    supabaseClientMock.select.mockReturnValue(supabaseClientMock);
    supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
  });

  it('returns 404 for genuinely missing case (PGRST116 error)', async () => {
    supabaseClientMock.single.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116', message: 'No rows returned' },
    });

    const response = await answerQuestion(
      new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        body: JSON.stringify({
          case_id: 'nonexistent-case',
          question_id: 'landlord_name',
          answer: 'Alice',
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body.code).toBe('NOT_FOUND');
    expect(body.retryable).toBe(false);
  });

  it('returns 503 for Cloudflare 500 HTML error (upstream failure)', async () => {
    supabaseClientMock.single.mockResolvedValueOnce({
      data: null,
      error: {
        message: '<html>500 Internal Server Error cloudflare</html>',
      },
    });

    const response = await answerQuestion(
      new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        body: JSON.stringify({
          case_id: 'case-with-upstream-error',
          question_id: 'landlord_name',
          answer: 'Alice',
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.code).toBe('UPSTREAM_ERROR');
    expect(body.retryable).toBe(true);
    expect(body.error).toContain('temporarily unavailable');
  });

  it('returns 503 for timeout error (retryable)', async () => {
    supabaseClientMock.single.mockResolvedValueOnce({
      data: null,
      error: {
        code: '57014', // query_canceled (statement timeout)
        message: 'Query timeout',
      },
    });

    const response = await nextQuestion(
      new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        body: JSON.stringify({ case_id: 'case-with-timeout' }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.code).toBe('UPSTREAM_ERROR');
    expect(body.retryable).toBe(true);
  });

  it('returns 503 for connection failure (retryable)', async () => {
    supabaseClientMock.single.mockResolvedValueOnce({
      data: null,
      error: {
        code: '08006', // connection_failure
        message: 'Connection failed',
      },
    });

    const response = await answerQuestion(
      new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        body: JSON.stringify({
          case_id: 'case-with-connection-error',
          question_id: 'landlord_name',
          answer: 'Alice',
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.code).toBe('UPSTREAM_ERROR');
    expect(body.retryable).toBe(true);
  });

  it('returns 403 for RLS policy violation (permission denied)', async () => {
    supabaseClientMock.single.mockResolvedValueOnce({
      data: null,
      error: {
        code: '42501', // insufficient_privilege
        message: 'permission denied for table cases',
      },
    });

    const response = await answerQuestion(
      new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        body: JSON.stringify({
          case_id: 'unauthorized-case',
          question_id: 'landlord_name',
          answer: 'Alice',
        }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.code).toBe('UNAUTHORIZED');
    expect(body.retryable).toBe(false);
  });
});
