import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../[id]/route';

const mocks = vi.hoisted(() => ({
  currentUserId: 'admin-user',
  isAdminValue: true,
}));

const documents = [
  {
    id: 'doc-customer-owned',
    user_id: 'customer-user',
    case_id: 'case-customer',
    pdf_url: 'customer-user/case-customer/final.pdf',
    document_type: 'form_3a_notice',
    is_preview: false,
  },
  {
    id: 'doc-legacy-case-owned',
    user_id: null,
    case_id: 'case-owned-by-user',
    pdf_url: 'customer-user/case-owned-by-user/final.pdf',
    document_type: 'n119_particulars',
    is_preview: false,
  },
];

const cases = [
  {
    id: 'case-owned-by-user',
    user_id: 'customer-user',
  },
];

function createQuery(table: string) {
  const state: Record<string, unknown> = {};

  const builder: any = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      state[column] = value;
      return builder;
    },
    single: async () => {
      if (table === 'documents') {
        const document = documents.find((doc) => doc.id === state.id);
        return document ? { data: document, error: null } : { data: null, error: { message: 'not found' } };
      }
      return { data: null, error: { message: 'unsupported table' } };
    },
    maybeSingle: async () => {
      if (table === 'cases') {
        const linkedCase = cases.find((caseItem) => caseItem.id === state.id && caseItem.user_id === state.user_id);
        return { data: linkedCase || null, error: null };
      }
      return { data: null, error: null };
    },
  };

  return builder;
}

vi.mock('@/lib/supabase/server', () => ({
  requireServerAuth: vi.fn(async () => ({ id: mocks.currentUserId })),
  createAdminClient: vi.fn(() => ({
    from: (table: string) => createQuery(table),
    storage: {
      from: () => ({
        createSignedUrl: vi.fn(async (path: string) => ({
          data: { signedUrl: `https://signed.example/${path}` },
          error: null,
        })),
        remove: vi.fn(async () => ({ error: null })),
      }),
    },
  })),
}));

vi.mock('@/lib/auth', () => ({
  isAdmin: vi.fn(() => mocks.isAdminValue),
}));

describe('GET /api/documents/[id]', () => {
  beforeEach(() => {
    mocks.currentUserId = 'admin-user';
    mocks.isAdminValue = true;
    vi.clearAllMocks();
  });

  it('allows admins to fetch a customer-owned document download URL', async () => {
    const response = await GET(new Request('http://localhost/api/documents/doc-customer-owned'), {
      params: Promise.resolve({ id: 'doc-customer-owned' }),
    });

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.document.download_url).toBe('https://signed.example/customer-user/case-customer/final.pdf');
  });

  it('allows a customer to fetch a legacy document attached to their own case', async () => {
    mocks.currentUserId = 'customer-user';
    mocks.isAdminValue = false;

    const response = await GET(new Request('http://localhost/api/documents/doc-legacy-case-owned'), {
      params: Promise.resolve({ id: 'doc-legacy-case-owned' }),
    });

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.document.download_url).toBe('https://signed.example/customer-user/case-owned-by-user/final.pdf');
  });

  it('returns 404 when a non-admin user does not own the document or linked case', async () => {
    mocks.currentUserId = 'other-user';
    mocks.isAdminValue = false;

    const response = await GET(new Request('http://localhost/api/documents/doc-customer-owned'), {
      params: Promise.resolve({ id: 'doc-customer-owned' }),
    });

    expect(response.status).toBe(404);
  });
});
