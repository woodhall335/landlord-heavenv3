import { beforeEach, describe, expect, it, vi } from 'vitest';

const singleSpy = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    from: vi.fn(),
  })),
  getServerUser: vi.fn(async () => null),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: singleSpy,
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(async () => ({ error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => ({ data: { id: '22222222-2222-2222-2222-222222222222' }, error: null })),
        })),
      })),
    })),
  })),
  logSupabaseAdminDiagnostics: vi.fn(),
}));

vi.mock('@/lib/case-facts/store', () => ({
  getOrCreateWizardFacts: vi.fn(async () => ({})),
}));

vi.mock('@/lib/wizard/document-intel', () => ({
  applyDocumentIntelligence: vi.fn((facts: Record<string, unknown>) => ({ facts })),
}));

vi.mock('@/lib/wizard/mqs-loader', () => ({
  loadMQS: vi.fn(() => ({ id: 'test-mqs' })),
  normalizeAskOnceFacts: vi.fn((facts: Record<string, unknown>) => facts),
  getNextMQSQuestion: vi.fn(() => null),
}));

import { POST } from '../route';

describe('POST /api/wizard/start anonymous resume', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    singleSpy.mockResolvedValue({
      data: {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: null,
        session_token: 'good-token',
        case_type: 'eviction',
        jurisdiction: 'england',
      },
      error: null,
    });
  });

  it('returns 404 without token', async () => {
    const request = new Request('http://localhost/api/wizard/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        product: 'notice_only',
        jurisdiction: 'england',
        case_id: '11111111-1111-1111-1111-111111111111',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it('returns 404 with wrong token', async () => {
    const request = new Request('http://localhost/api/wizard/start', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-session-token': 'wrong-token',
      },
      body: JSON.stringify({
        product: 'notice_only',
        jurisdiction: 'england',
        case_id: '11111111-1111-1111-1111-111111111111',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it('creates anonymous case with token', async () => {
    const request = new Request('http://localhost/api/wizard/start', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-session-token': 'good-token',
      },
      body: JSON.stringify({
        product: 'notice_only',
        jurisdiction: 'england',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('blocks anonymous case creation without token', async () => {
    const request = new Request('http://localhost/api/wizard/start', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        product: 'notice_only',
        jurisdiction: 'england',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it('returns 200 with correct token', async () => {
    const request = new Request('http://localhost/api/wizard/start', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-session-token': 'good-token',
      },
      body: JSON.stringify({
        product: 'notice_only',
        jurisdiction: 'england',
        case_id: '11111111-1111-1111-1111-111111111111',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
