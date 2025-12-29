import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/leads/email-report/route';

const mockInsert = vi.fn(async () => ({ error: null }));

vi.mock('@/lib/case-facts/store', () => ({
  getOrCreateWizardFacts: async () => ({
    validation_summary: { status: 'warning', blockers: [], warnings: [] },
    recommendations: [{ code: 'REC', message: 'Do the thing' }],
    next_questions: [{ question: 'Confirm something' }],
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}));

describe('email report', () => {
  beforeEach(() => {
    mockInsert.mockClear();
  });

  it('records stubbed report when provider missing', async () => {
    const request = new Request('http://localhost/api/leads/email-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        source: 'validator',
        jurisdiction: 'england',
        caseId: '00000000-0000-0000-0000-000000000000',
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.stubbed).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });
});
