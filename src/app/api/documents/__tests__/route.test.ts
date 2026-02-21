import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET } from '../route';

type Doc = {
  id: string;
  user_id: string | null;
  case_id: string;
  document_type: string;
  is_preview: boolean;
  created_at: string;
};

const allDocs: Doc[] = [
  {
    id: 'doc-1',
    user_id: null,
    case_id: 'case-1',
    document_type: 'ast_agreement_hmo',
    is_preview: false,
    created_at: '2026-01-01T10:00:00.000Z',
  },
  {
    id: 'doc-2',
    user_id: null,
    case_id: 'case-1',
    document_type: 'inventory_schedule',
    is_preview: false,
    created_at: '2026-01-01T09:00:00.000Z',
  },
  {
    id: 'doc-3',
    user_id: null,
    case_id: 'case-1',
    document_type: 'pre_tenancy_checklist_england',
    is_preview: false,
    created_at: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'doc-preview',
    user_id: null,
    case_id: 'case-1',
    document_type: 'ast_agreement_hmo',
    is_preview: true,
    created_at: '2026-01-01T11:00:00.000Z',
  },
];

function createQuery(table: string) {
  const state: {
    eq: Record<string, unknown>;
    order?: { column: string; ascending: boolean };
    or?: string;
  } = { eq: {} };

  const builder: any = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      state.eq[column] = value;
      return builder;
    },
    order: (column: string, opts: { ascending: boolean }) => {
      state.order = { column, ascending: opts.ascending };
      return builder;
    },
    or: (value: string) => {
      state.or = value;
      return builder;
    },
    then: (resolve: (value: any) => void) => {
      if (table === 'cases') {
        const userId = state.eq.user_id;
        const data = userId === 'user-1' ? [{ id: 'case-1' }] : [];
        resolve({ data, error: null });
        return;
      }

      let docs = [...allDocs];
      if (state.eq.case_id) docs = docs.filter((d) => d.case_id === state.eq.case_id);
      if (state.eq.user_id) docs = docs.filter((d) => d.user_id === state.eq.user_id);
      if (typeof state.eq.is_preview === 'boolean') {
        docs = docs.filter((d) => d.is_preview === state.eq.is_preview);
      }

      if (state.or?.includes('case_id.in.(case-1)')) {
        docs = docs.filter((d) => d.user_id === 'user-1' || d.case_id === 'case-1');
      }

      if (state.order?.column === 'created_at') {
        docs.sort((a, b) =>
          state.order?.ascending
            ? a.created_at.localeCompare(b.created_at)
            : b.created_at.localeCompare(a.created_at)
        );
      }

      resolve({ data: docs, error: null });
    },
  };

  return builder;
}

vi.mock('@/lib/supabase/server', () => ({
  requireServerAuth: vi.fn(async () => ({ id: 'user-1' })),
  createServerSupabaseClient: vi.fn(async () => ({
    from: (table: string) => createQuery(table),
  })),
}));

describe('GET /api/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns case documents for owned case_id with is_preview=false default', async () => {
    const request = new Request('http://localhost/api/documents?case_id=case-1');
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.documents).toHaveLength(3);
    expect(payload.documents.map((d: Doc) => d.document_type)).toEqual([
      'ast_agreement_hmo',
      'inventory_schedule',
      'pre_tenancy_checklist_england',
    ]);
  });
});
