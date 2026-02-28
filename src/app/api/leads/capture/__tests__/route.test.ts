import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../route';

const upsertSpy = vi.fn(async () => ({ error: null }));
const insertSpy = vi.fn(async () => ({ error: null }));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'email_subscribers') {
        return { upsert: upsertSpy };
      }

      if (table === 'email_events') {
        return { insert: insertSpy };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  })),
}));

describe('POST /api/leads/capture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not append marketing_consent:false when marketing_consent is omitted for non-S21 funnels', async () => {
    const request = new Request('http://localhost/api/leads/capture', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        source: 'general_capture',
        tags: ['newsletter'],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(upsertSpy).toHaveBeenCalledOnce();
    expect(upsertSpy.mock.calls[0]?.[0]).toMatchObject({
      email: 'test@example.com',
      tags: ['newsletter'],
    });
  });

  it('de-duplicates tags before upsert, including consent tags', async () => {
    const request = new Request('http://localhost/api/leads/capture', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        source: 'general_capture',
        tags: ['newsletter', 'newsletter', 'marketing_consent:true'],
        marketing_consent: true,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(upsertSpy).toHaveBeenCalledOnce();
    expect(upsertSpy.mock.calls[0]?.[0]).toMatchObject({
      email: 'test@example.com',
      tags: ['newsletter', 'marketing_consent:true'],
    });
  });

  it('keeps S21 consent enforcement', async () => {
    const request = new Request('http://localhost/api/leads/capture', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        source: 's21_precheck_results_gate',
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: 'Marketing consent required' });
    expect(upsertSpy).not.toHaveBeenCalled();
  });
});
