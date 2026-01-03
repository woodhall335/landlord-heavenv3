import { describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/evidence/download/route';
import { getServerUser } from '@/lib/supabase/server';

vi.mock('@/lib/case-facts/store', () => ({
  getOrCreateWizardFacts: async () => ({
    evidence: {
      files: [
        { id: 'evidence-1', storage_path: 'path/to/file.pdf', file_name: 'file.pdf' },
      ],
    },
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'cases') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: 'case-1', user_id: 'user-1' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'documents') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
              }),
            }),
          }),
        };
      }
      return {};
    },
    storage: {
      from: () => ({
        createSignedUrl: async () => ({ data: { signedUrl: 'https://signed.example/file' }, error: null }),
      }),
    },
  }),
  getServerUser: vi.fn(async () => ({ id: 'user-1' })),
}));

describe('evidence download endpoint', () => {
  it('rejects unauthorized download when case owned', async () => {
    vi.mocked(getServerUser).mockResolvedValueOnce(null as any);

    const url = new URL('http://localhost/api/evidence/download');
    url.searchParams.set('caseId', 'case-1');
    url.searchParams.set('evidenceId', 'evidence-1');

    const response = await GET(new Request(url.toString()));

    expect(response.status).toBe(403);
  });

  it('returns signed URL for authorized user', async () => {
    const url = new URL('http://localhost/api/evidence/download');
    url.searchParams.set('caseId', 'case-1');
    url.searchParams.set('evidenceId', 'evidence-1');

    const response = await GET(new Request(url.toString()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.signedUrl).toContain('signed.example');
  });
});
