import { describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/leads/capture/route';

const mockUpsert = vi.fn(async () => ({ error: null }));
const mockInsert = vi.fn(async () => ({ error: null }));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'email_subscribers') {
        return { upsert: mockUpsert };
      }
      if (table === 'email_events') {
        return { insert: mockInsert };
      }
      return {};
    },
  }),
}));

describe('leads capture', () => {
  it('stores subscriber and event', async () => {
    const request = new Request('http://localhost/api/leads/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        source: 'validator',
        jurisdiction: 'england',
        caseId: '00000000-0000-0000-0000-000000000000',
        tags: ['report'],
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(mockUpsert).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
  });
});
