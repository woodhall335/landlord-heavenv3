import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as generateDocument } from '@/app/api/documents/generate/route';

const { db } = vi.hoisted(() => ({
  db: {
    cases: [] as Array<any>,
    orders: [] as Array<any>,
    documents: [] as Array<any>,
  },
}));

vi.mock('@/lib/validation/previewValidation', () => ({
  validateForGenerate: vi.fn(() => null),
}));

vi.mock('@/lib/case-facts/store', () => ({
  getOrCreateWizardFacts: vi.fn(async () => ({
    landlord_full_name: 'Landlord',
    tenant_full_name: 'Tenant',
    property_address: '1 High Street',
    eviction_route: 'section_21',
    __meta: { product: 'notice_only' },
  })),
}));

vi.mock('@/lib/documents/proof-of-service-generator', () => ({
  generateProofOfServicePDF: vi.fn(async () => new Uint8Array([1, 2, 3])),
}));

vi.mock('@/lib/supabase/server', () => {
  const createQueryBuilder = (tableName: keyof typeof db) => {
    let filters: Array<{ column: string; value: any }> = [];
    const builder = {
      select: () => builder,
      eq: (column: string, value: any) => {
        filters.push({ column, value });
        return builder;
      },
      maybeSingle: async () => {
        const match = db[tableName].find((row) =>
          filters.every((filter) => row[filter.column] === filter.value)
        );
        return { data: match ?? null, error: null };
      },
      single: async () => {
        const match = db[tableName].find((row) =>
          filters.every((filter) => row[filter.column] === filter.value)
        );
        return match
          ? { data: match, error: null }
          : { data: null, error: new Error('Not found') };
      },
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const row = { id: data.id ?? `doc-${db.documents.length + 1}`, ...data };
            db[tableName].push(row);
            return { data: row, error: null };
          },
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => {
          db[tableName]
            .filter((row) => row[column] === value)
            .forEach((row) => Object.assign(row, data));
          return { data: null, error: null };
        },
      }),
    };
    return builder;
  };

  return {
    createServerSupabaseClient: vi.fn(async () => ({
      from: (tableName: keyof typeof db) => createQueryBuilder(tableName),
    })),
    createAdminClient: vi.fn(() => ({
      from: (tableName: keyof typeof db) => createQueryBuilder(tableName),
      storage: {
        from: () => ({
          upload: vi.fn(async () => ({ error: null })),
          getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/doc.pdf' } })),
        }),
      },
    })),
    tryGetServerUser: vi.fn(async () => ({ id: 'user-1' })),
  };
});

describe('documents/generate entitlement enforcement', () => {
  const caseId = '0b9b250c-1c3a-4af2-81b8-7d2d6fe9a222';

  beforeEach(() => {
    db.cases.length = 0;
    db.orders.length = 0;
    db.documents.length = 0;

    db.cases.push({
      id: caseId,
      jurisdiction: 'england',
      user_id: 'user-1',
      collected_facts: {},
    });
  });

  it('blocks paid document generation without a paid order', async () => {
    const response = await generateDocument(
      new Request('http://localhost/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          document_type: 'proof_of_service',
          is_preview: false,
        }),
      })
    );

    expect(response.status).toBe(402);
    const payload = await response.json();
    expect(payload.code).toBe('PAYMENT_REQUIRED');
  });

  it('allows paid document generation when order is paid', async () => {
    db.orders.push({
      id: 'order-paid',
      case_id: caseId,
      product_type: 'notice_only',
      payment_status: 'paid',
    });

    const response = await generateDocument(
      new Request('http://localhost/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          document_type: 'proof_of_service',
          is_preview: false,
        }),
      })
    );

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.success).toBe(true);
    expect(db.documents.length).toBe(1);
  });
});
