import { beforeEach, describe, expect, it, vi } from 'vitest';

const ADMIN_USER_ID = 'admin-user-id';
const CUSTOMER_USER_ID = 'customer-user-id';

const maybeSingleDocuments = vi.fn();
const maybeSingleCases = vi.fn();
const createSignedUrl = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  getServerUser: vi.fn(async () => ({ id: ADMIN_USER_ID, email: 'admin@example.com' })),
  createAdminClient: vi.fn(() => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          like: () => ({
            maybeSingle: maybeSingleDocuments,
          }),
          maybeSingle: maybeSingleCases,
        }),
      }),
    }),
    storage: {
      from: () => ({
        createSignedUrl,
      }),
    },
  })),
}));

vi.mock('@/lib/case-facts/store', () => ({
  getOrCreateWizardFacts: vi.fn(async () => ({ evidence: { files: [] } })),
}));

vi.mock('@/lib/session-token', () => ({
  getSessionTokenFromRequest: vi.fn(() => null),
}));

describe('GET /api/evidence/download', () => {
  beforeEach(() => {
    process.env.ADMIN_USER_IDS = ADMIN_USER_ID;
    maybeSingleDocuments.mockReset();
    maybeSingleCases.mockReset();
    createSignedUrl.mockReset();
  });

  it('allows an admin to download evidence attached to another user-owned case', async () => {
    maybeSingleDocuments.mockResolvedValueOnce({
      data: {
        id: 'evidence-doc-id',
        case_id: 'case-id',
        pdf_url: 'evidence/case-id/evidence-doc-id.pdf',
      },
      error: null,
    });
    maybeSingleCases.mockResolvedValueOnce({
      data: {
        id: 'case-id',
        user_id: CUSTOMER_USER_ID,
        session_token: null,
      },
      error: null,
    });
    createSignedUrl.mockResolvedValueOnce({
      data: { signedUrl: 'https://signed.example/evidence-doc-id' },
      error: null,
    });

    const { GET } = await import('../route');
    const response = await GET(
      new Request('https://landlordheaven.test/api/evidence/download?evidenceId=evidence-doc-id')
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.signedUrl).toBe('https://signed.example/evidence-doc-id');
    expect(createSignedUrl).toHaveBeenCalledWith('evidence/case-id/evidence-doc-id.pdf', 900);
  });
});
