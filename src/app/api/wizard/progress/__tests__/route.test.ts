import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
const mocks = vi.hoisted(() => ({ row: { wizard_progress: 0, user_id: null, session_token: 'token' }, denied: null as any, mutation: null as any, update: vi.fn(), from: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }) }));
vi.mock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: () => ({ from: mocks.from }) }));
vi.mock('@/lib/auth/case-access', () => ({ assertCaseWriteAccess: () => mocks.denied }));
vi.mock('@/lib/payments/edit-window-enforcement', () => ({ checkMutationAllowed: async () => mocks.mutation || { allowed: true } }));
import { POST } from '../route';
const request = (progress: unknown) => new NextRequest('https://example.com/api/wizard/progress', { method: 'POST', body: JSON.stringify({ case_id: '11111111-1111-4111-8111-111111111111', progress }) });
beforeEach(() => {
  vi.clearAllMocks(); mocks.row.wizard_progress = 0; mocks.denied = null; mocks.mutation = null;
  mocks.update.mockReturnValue({ eq: async () => ({ error: null }) });
  const chain: any = { select: () => chain, eq: () => chain, single: async () => ({ data: mocks.row, error: null }), update: mocks.update };
  mocks.from.mockReturnValue(chain);
});
describe('wizard progress persistence', () => {
  it.each([-1, 101, 25.5, '50', null])('rejects invalid progress %s', async progress => {
    expect((await POST(request(progress))).status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it('updates only the percentage, without marking a case completed or modifying facts', async () => {
    expect((await POST(request(42))).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({ wizard_progress: 42 });
  });
  it('does not write for another session or an expired paid edit window', async () => {
    mocks.denied = NextResponse.json({ error: 'Case not found' }, { status: 404 });
    expect((await POST(request(42))).status).toBe(404);
    mocks.denied = null;
    mocks.mutation = { allowed: false, errorResponse: NextResponse.json({ error: 'Locked' }, { status: 403 }) };
    expect((await POST(request(42))).status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it('does not refresh case activity for an unchanged percentage', async () => {
    mocks.row.wizard_progress = 42;
    expect((await POST(request(42))).status).toBe(200);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
