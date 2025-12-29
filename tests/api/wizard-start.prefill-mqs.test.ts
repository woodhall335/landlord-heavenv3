import { describe, expect, it, vi } from 'vitest';
import { POST as startWizard } from '@/app/api/wizard/start/route';
import { loadMQS, normalizeAskOnceFacts, getNextMQSQuestion } from '@/lib/wizard/mqs-loader';
import { applyDocumentIntelligence } from '@/lib/wizard/document-intel';
import { createEmptyWizardFacts } from '@/lib/case-facts/schema';
import { setFactPath } from '@/lib/case-facts/mapping';

interface MockDatabase {
  cases: Map<string, any>;
  case_facts: Map<string, any>;
}

const { mockSupabase, mockDb } = vi.hoisted(() => {
  const db: MockDatabase = {
    cases: new Map(),
    case_facts: new Map(),
  };

  const createQueryBuilder = (tableName: keyof MockDatabase) => {
    let filters: Array<{ column: string; value: any; operator: string }> = [];
    const builder = {
      select: () => builder,
      eq: (column: string, value: any) => {
        filters.push({ column, value, operator: 'eq' });
        return builder;
      },
      single: async () => {
        const items = Array.from(db[tableName].values());
        const filtered = items.filter((item) =>
          filters.every((f) => item[f.column] === f.value),
        );
        return filtered.length === 0
          ? { data: null, error: new Error('Not found') }
          : { data: filtered[0], error: null };
      },
      maybeSingle: async () => {
        const items = Array.from(db[tableName].values());
        const filtered = items.filter((item) =>
          filters.every((f) => item[f.column] === f.value),
        );
        return filtered.length === 0
          ? { data: null, error: null }
          : { data: filtered[0], error: null };
      },
    };
    return builder;
  };

  const client = {
    from: (tableName: keyof MockDatabase) => ({
      select: () => createQueryBuilder(tableName),
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const id = data.id || crypto.randomUUID();
            const record = { ...data, id };
            const mapKey = tableName === 'case_facts' && data.case_id ? data.case_id : id;
            db[tableName].set(mapKey, record);
            return { data: record, error: null };
          },
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => {
          const items = Array.from(db[tableName].entries());
          items
            .filter(([, item]) => item[column] === value)
            .forEach(([id, item]) => db[tableName].set(id, { ...item, ...data }));
          return { data: null, error: null };
        },
      }),
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  };

  return { mockSupabase: client, mockDb: db };
});

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => mockSupabase,
  getServerUser: async () => null,
  createAdminClient: () => mockSupabase,
}));

describe('wizard/start prefill MQS behavior', () => {
  it('uses prefilled facts to move MQS forward', async () => {
    const caseId = '00000000-0000-4000-8000-000000000111';
    mockDb.cases.set(caseId, {
      id: caseId,
      case_type: 'eviction',
      jurisdiction: 'england',
    });

    const mqs = loadMQS('complete_pack', 'england');
    expect(mqs).toBeTruthy();

    const baseFacts = createEmptyWizardFacts();
    const baseline = getNextMQSQuestion(
      mqs!,
      normalizeAskOnceFacts(applyDocumentIntelligence(baseFacts).facts, mqs!),
    );
    expect(baseline).toBeTruthy();

    let prefilledFacts = { ...baseFacts };
    if (baseline?.maps_to?.length) {
      baseline.maps_to.forEach((path) => {
        prefilledFacts = setFactPath(prefilledFacts, path, 'yes');
      });
    } else if (baseline?.id) {
      prefilledFacts = { ...prefilledFacts, [baseline.id]: 'yes' };
    }

    mockDb.case_facts.set(caseId, {
      case_id: caseId,
      facts: prefilledFacts,
    });

    const expectedNext = getNextMQSQuestion(
      mqs!,
      normalizeAskOnceFacts(applyDocumentIntelligence(prefilledFacts).facts, mqs!),
    );

    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'complete_pack',
          jurisdiction: 'england',
          case_id: caseId,
        }),
      }),
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.next_question?.id).toBe(expectedNext?.id);
    expect(payload.next_question?.id).not.toBe(baseline?.id);
  });

  it('returns NI gating even with case_id', async () => {
    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'complete_pack',
          jurisdiction: 'northern-ireland',
          case_id: '00000000-0000-4000-8000-000000000222',
        }),
      }),
    );

    const payload = await response.json();
    expect(response.status).toBe(422);
    expect(payload.code).toBe('NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED');
  });
});
