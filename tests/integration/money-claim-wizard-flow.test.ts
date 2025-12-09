import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

// Create a simple in-memory database for mocking
interface MockDatabase {
  cases: Map<string, any>;
  case_facts: Map<string, any>;
  documents: Map<string, any>;
  conversations: Map<string, any>;
}

const { mockSupabase, mockDb } = vi.hoisted(() => {
  const db: MockDatabase = {
    cases: new Map(),
    case_facts: new Map(),
    documents: new Map(),
    conversations: new Map(),
  };

  const createQueryBuilder = (tableName: keyof MockDatabase) => {
    let filters: Array<{ column: string; operator: string; value: any }> = [];

    const builder = {
      select: () => builder,
      eq: (column: string, value: any) => {
        filters.push({ column, operator: 'eq', value });
        return builder;
      },
      is: (column: string, value: any) => {
        filters.push({ column, operator: 'is', value });
        return builder;
      },
      single: async () => {
        const items = Array.from(db[tableName].values());
        const filtered = items.filter((item) =>
          filters.every((f) => item[f.column] === f.value || (f.operator === 'is' && item[f.column] === f.value))
        );
        return filtered.length === 0
          ? { data: null, error: new Error('Not found') }
          : { data: filtered[0], error: null };
      },
      maybeSingle: async () => {
        const items = Array.from(db[tableName].values());
        const filtered = items.filter((item) =>
          filters.every((f) => item[f.column] === f.value || (f.operator === 'is' && item[f.column] === f.value))
        );
        return filtered.length === 0
          ? { data: null, error: null }
          : { data: filtered[0], error: null };
      },
    } as any;
    return builder;
  };

    const client = {
      from: (tableName: keyof MockDatabase) => ({
        select: () => createQueryBuilder(tableName),
        insert: (data: any) => {
          const id = data.id || crypto.randomUUID();
          const record = { ...data, id, created_at: new Date().toISOString() };
          const mapKey = tableName === 'case_facts' && data.case_id ? data.case_id : id;
          db[tableName].set(mapKey, record);
          const result = { data: record, error: null };
          return {
            ...result,
            select: () => ({
              single: async () => result,
            }),
          };
        },
      update: (data: any) => {
        let updateFilters: Array<{ column: string; value: any }> = [];
        return {
          eq: (column: string, value: any) => {
            updateFilters.push({ column, value });
            return {
              eq: () => {},
              then: async (resolve: any) => {
                const items = Array.from(db[tableName].entries());
                items
                  .filter(([, item]) => updateFilters.every((f) => item[f.column] === f.value))
                  .forEach(([id, item]) => db[tableName].set(id, { ...item, ...data, updated_at: new Date().toISOString() }));
                const result = { data: null, error: null };
                if (resolve) resolve(result);
                return result;
              },
            } as any;
          },
        };
      },
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://mock.example.com/doc.pdf' } }),
      }),
    },
  } as unknown as SupabaseClient<Database>;

  return { mockSupabase: client, mockDb: db };
});

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => mockSupabase,
  getServerUser: async () => null,
  requireServerAuth: async () => ({ id: 'user-1' }),
  createAdminClient: () => mockSupabase,
}));

vi.mock('@/lib/documents/generator', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents/generator')>(
    '@/lib/documents/generator'
  );
  return {
    ...actual,
    htmlToPdf: vi.fn(async (html: string) => Buffer.from(html)),
  };
});

vi.mock('@/lib/ai/ask-heaven', () => ({
  enhanceAnswer: vi.fn(async () => null),
}));

import { POST as wizardStart } from '@/app/api/wizard/start/route';
import { POST as wizardAnswer } from '@/app/api/wizard/answer/route';
import { POST as wizardAnalyze } from '@/app/api/wizard/analyze/route';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { mapCaseFactsToMoneyClaimCase, mapCaseFactsToScotlandMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';
import { generateMoneyClaimPack } from '@/lib/documents/money-claim-pack-generator';
import { generateScotlandMoneyClaim } from '@/lib/documents/scotland-money-claim-pack-generator';

async function answerQuestion(caseId: string, question_id: string, answer: any) {
  const req = new Request('http://localhost/api/wizard/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ case_id: caseId, question_id, answer }),
  });
  const res = await wizardAnswer(req);
  if (res.status !== 200) {
    const body = await res.json();
    console.error('Answer error', question_id, body);
  }
  expect(res.status).toBe(200);
}

describe('Money claim wizard integration', () => {
  beforeEach(() => {
    mockDb.cases.clear();
    mockDb.case_facts.clear();
    mockDb.documents.clear();
    mockDb.conversations.clear();
  });

  test('England & Wales money claim pack generation flow', async () => {
    const startResponse = await wizardStart(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'money_claim', jurisdiction: 'england-wales' }),
      })
    );

    expect(startResponse.status).toBe(200);
    const startData = await startResponse.json();
    const caseId = startData.case_id as string;
    expect(caseId).toBeDefined();

    await answerQuestion(caseId, 'claimant_full_name', 'Alice Landlord');
    await answerQuestion(caseId, 'claimant_email', 'alice@example.com');
    await answerQuestion(caseId, 'claimant_phone', '01234567890');
    await answerQuestion(caseId, 'claimant_address', {
      address_line1: '1 High Street',
      address_line2: '',
      city: 'London',
      postcode: 'N1 1AA',
    });
    await answerQuestion(caseId, 'defendant_full_name', 'Tom Tenant');
    await answerQuestion(caseId, 'property_address', {
      address_line1: '2 Rental Road',
      address_line2: '',
      city: 'London',
      postcode: 'N2 2BB',
      country: 'england-wales',
    });
    await answerQuestion(caseId, 'tenancy_start_date', '2024-01-01');
    await answerQuestion(caseId, 'rent_amount', 750);
    await answerQuestion(caseId, 'rent_frequency', 'monthly');
    await answerQuestion(caseId, 'claim_type', ['rent_arrears']);
    await answerQuestion(caseId, 'arrears_total', 1200);
    await answerQuestion(caseId, 'arrears_schedule_upload', {
      rent_schedule_uploaded: true,
      arrears_items: [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 600, rent_paid: 0 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 600, rent_paid: 0 },
      ],
    });
    await answerQuestion(caseId, 'charge_interest', 'yes');
    await answerQuestion(caseId, 'interest_start_date', '2024-01-01');
    await answerQuestion(caseId, 'interest_rate', '8');
    await answerQuestion(caseId, 'preferred_court', 'London County Court');
    await answerQuestion(caseId, 'particulars_of_claim', 'Rent arrears for January and February 2024.');
    await answerQuestion(caseId, 'payment_attempts', 'Chased via email and SMS.');
    await answerQuestion(caseId, 'lba_sent', 'yes');
    await answerQuestion(caseId, 'lba_date', '2024-03-01');
    await answerQuestion(caseId, 'lba_method', ['email']);
    await answerQuestion(caseId, 'signatory_name', 'Alice Landlord');

    const analyzeResponse = await wizardAnalyze(
      new Request('http://localhost/api/wizard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
      })
    );
    expect(analyzeResponse.status).toBe(200);

    const wizardFactsRecord = mockDb.case_facts.get(caseId);
    console.log('caseFacts keys', Array.from(mockDb.case_facts.keys()));
    const wizardFacts = (wizardFactsRecord as any)?.facts || wizardFactsRecord;
    const caseFacts = wizardFactsToCaseFacts(wizardFacts as any);

    expect(caseFacts.parties.landlord.name).toBe('Alice Landlord');
    expect(caseFacts.parties.tenants[0]?.name).toBe('Tom Tenant');
    expect(caseFacts.issues.rent_arrears.total_arrears).toBe(1200);
    expect(caseFacts.court.claim_amount_rent).toBe(1200);
    expect(caseFacts.money_claim.attempts_to_resolve).toBe('Chased via email and SMS.');
    expect(caseFacts.money_claim.lba_sent).toBe(true);
    expect(caseFacts.money_claim.lba_method).toEqual(['email']);

    const claimInput = mapCaseFactsToMoneyClaimCase(caseFacts);
    claimInput.case_id = caseId;

    const pack = await generateMoneyClaimPack(claimInput as any, caseFacts);
    const fileNames = pack.documents.map((d) => d.file_name);
    expect(fileNames).toContain('n1-claim-form.pdf');
    expect(fileNames).toContain('letter-before-claim.pdf');
    expect(fileNames).toContain('schedule-of-arrears.pdf');

    // Verify pack documents contain actual data, not blanks
    const lbaDoc = pack.documents.find((d) =>
      d.title.toLowerCase().includes('letter before')
    );
    const lbaHtml = lbaDoc?.html?.toString() || '';
    expect(lbaHtml).toContain('Alice Landlord');
    expect(lbaHtml).toContain('Tom Tenant');

    const pocDoc = pack.documents.find((d) =>
      d.title.toLowerCase().includes('particulars')
    );
    const pocHtml = pocDoc?.html?.toString() || '';
    expect(pocHtml).toContain('Alice Landlord');
    expect(pocHtml).toContain('Tom Tenant');
    expect(pocHtml).toContain('750');
    expect(pocHtml).toContain('1200');
  });

  test('Scotland money claim flow produces Simple Procedure pack', async () => {
    const startResponse = await wizardStart(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'money_claim', jurisdiction: 'scotland' }),
      })
    );

    expect(startResponse.status).toBe(200);
    const startData = await startResponse.json();
    const caseId = startData.case_id as string;

    await answerQuestion(caseId, 'pursuer_full_name', 'Sarah Landlord');
    await answerQuestion(caseId, 'pursuer_email', 'sarah@example.com');
    await answerQuestion(caseId, 'pursuer_phone', '07000000000');
    await answerQuestion(caseId, 'pursuer_address', {
      address_line1: '10 High Street',
      address_line2: '',
      city: 'Edinburgh',
      postcode: 'EH1 1AA',
    });
    await answerQuestion(caseId, 'defender_full_name', 'Rob Renter');
    await answerQuestion(caseId, 'property_address', {
      address_line1: '20 Tenancy Terrace',
      address_line2: '',
      city: 'Edinburgh',
      postcode: 'EH2 2BB',
      country: 'scotland',
    });
    await answerQuestion(caseId, 'tenancy_start_date', '2024-02-01');
    await answerQuestion(caseId, 'rent_amount', 650);
    await answerQuestion(caseId, 'rent_frequency', 'monthly');
    await answerQuestion(caseId, 'basis_of_claim', ['rent_arrears']);
    await answerQuestion(caseId, 'arrears_total', 1300);
    await answerQuestion(caseId, 'arrears_schedule_upload', {
      rent_schedule_uploaded: true,
      arrears_items: [{ period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 650, rent_paid: 0 }],
    });
    await answerQuestion(caseId, 'sheriffdom', 'Lothian and Borders at Edinburgh');
    await answerQuestion(caseId, 'charge_interest', 'yes');
    await answerQuestion(caseId, 'interest_start_date', '2024-02-01');
    await answerQuestion(caseId, 'interest_rate', '8');
    await answerQuestion(caseId, 'attempts_to_resolve', 'Two reminder letters sent.');
    await answerQuestion(caseId, 'demand_letter_date', '2024-03-01');
    await answerQuestion(caseId, 'second_demand_date', '2024-03-15');
    await answerQuestion(caseId, 'particulars_of_claim', 'Simple Procedure arrears claim.');
    await answerQuestion(caseId, 'signatory_name', 'Sarah Landlord');

    const analyzeResponse = await wizardAnalyze(
      new Request('http://localhost/api/wizard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
      })
    );
    expect(analyzeResponse.status).toBe(200);

    const wizardFactsRecord = mockDb.case_facts.get(caseId);
    const wizardFacts = (wizardFactsRecord as any)?.facts || wizardFactsRecord;
    const caseFacts = wizardFactsToCaseFacts(wizardFacts as any);

    expect(caseFacts.parties.landlord.name).toBe('Sarah Landlord');
    expect(caseFacts.parties.tenants[0]?.name).toBe('Rob Renter');
    expect(caseFacts.money_claim.basis_of_claim).toBe('rent_arrears');
    expect(caseFacts.money_claim.interest_rate).toBe(8);
    expect(caseFacts.money_claim.attempts_to_resolve).toBe('Two reminder letters sent.');
    expect(caseFacts.money_claim.demand_letter_date).toBe('2024-03-01');
    expect(caseFacts.money_claim.second_demand_date).toBe('2024-03-15');
    expect(caseFacts.money_claim.sheriffdom).toBe('Lothian and Borders at Edinburgh');

    const claimInput = mapCaseFactsToScotlandMoneyClaimCase(caseFacts);
    claimInput.case_id = caseId;

    const pack = await generateScotlandMoneyClaim(claimInput as any, caseFacts);
    const fileNames = pack.documents.map((d) => d.file_name);
    expect(fileNames).toContain('simple-procedure-claim-form.pdf');
    expect(fileNames).toContain('pre-action-letter.pdf');
    expect(fileNames).toContain('schedule-of-arrears.pdf');

    // Verify pack documents contain actual data, not blanks
    const preActionDoc = pack.documents.find((d) =>
      d.title.toLowerCase().includes('pre-action') || d.title.toLowerCase().includes('letter')
    );
    const preActionHtml = preActionDoc?.html?.toString() || '';
    expect(preActionHtml).toContain('Sarah Landlord');
    expect(preActionHtml).toContain('Rob Renter');
    expect(preActionHtml).toContain('650');
    expect(preActionHtml).toContain('1300');
  });
});
