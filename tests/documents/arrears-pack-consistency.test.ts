import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateCompleteEvictionPack, generateNoticeOnlyPack } from '@/lib/documents/eviction-pack-generator';
import { computeEvictionArrears } from '@/lib/eviction/arrears/computeArrears';
import { buildEnglandSection8CompletePackFacts } from '@/lib/testing/fixtures/complete-pack';
import { __setTestJsonAIClient } from '@/lib/ai/openai-client';

vi.mock('@/lib/documents/generator', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents/generator')>(
    '@/lib/documents/generator'
  );
  return {
    ...actual,
    htmlToPdf: vi.fn(async (html: string) => Buffer.from(html)),
  };
});

beforeEach(() => {
  process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
  process.env.DISABLE_COMPLIANCE_AUDIT_AI = 'true';
  __setTestJsonAIClient({
    jsonCompletion: async () => ({
      json: {} as unknown as any,
      content: '{}',
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      model: 'gpt-4o-mini',
      cost_usd: 0,
    }),
  });
});

afterEach(() => {
  delete process.env.DISABLE_WITNESS_STATEMENT_AI;
  delete process.env.DISABLE_COMPLIANCE_AUDIT_AI;
  __setTestJsonAIClient(null);
  vi.restoreAllMocks();
});

describe('Complete eviction pack arrears consistency', () => {
  it('returns prorated arrears items that sum to the canonical total', () => {
    const canonical = computeEvictionArrears({
      arrears_items: [
        { period_start: '2026-02-01', period_end: '2026-02-28', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
        { period_start: '2026-03-01', period_end: '2026-03-31', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
        { period_start: '2026-04-01', period_end: '2026-04-30', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
        { period_start: '2026-05-01', period_end: '2026-05-01', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
      ],
      total_arrears: 8000,
      rent_amount: 2000,
      rent_frequency: 'monthly',
      rent_due_day: 1,
      schedule_end_date: '2026-05-01',
    });

    const itemTotal = canonical.items.reduce((sum, item) => sum + (item.amount_owed || 0), 0);

    expect(canonical.total).toBe(6064.52);
    expect(Number(itemTotal.toFixed(2))).toBe(canonical.total);
    expect(canonical.items[3].rent_due).toBe(64.52);
  });

  it('repairs DST-shifted monthly periods before calculating the notice-date arrears', () => {
    const canonical = computeEvictionArrears({
      arrears_items: [
        { period_start: '2026-01-09', period_end: '2026-02-08', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
        { period_start: '2026-02-09', period_end: '2026-03-08', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
        { period_start: '2026-03-09', period_end: '2026-04-07', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
        { period_start: '2026-04-08', period_end: '2026-05-07', rent_due: 2000, rent_paid: 2000, amount_owed: 0 },
        { period_start: '2026-05-08', period_end: '2026-05-09', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
      ],
      total_arrears: 6129.03,
      rent_amount: 2000,
      rent_frequency: 'monthly',
      rent_due_day: 9,
      schedule_end_date: '2026-05-09',
    });

    expect(canonical.total).toBe(6064.52);
    expect(canonical.items.map((item) => `${item.period_start}:${item.period_end}`)).toEqual([
      '2026-01-09:2026-02-08',
      '2026-02-09:2026-03-08',
      '2026-03-09:2026-04-08',
      '2026-04-09:2026-05-08',
      '2026-05-09:2026-05-09',
    ]);
    expect(canonical.items[4].rent_due).toBe(64.52);
    expect(canonical.schedule[4].notes).toContain('1 day');
  });

  it('keeps arrears totals aligned across schedule, notice, witness statement, and letter (prorated)', { timeout: 20000 }, async () => {
    const facts = buildEnglandSection8CompletePackFacts();
    const noticeDate = '2024-04-15';

    facts.notice_date = noticeDate;
    facts.notice_served_date = noticeDate;
    facts.arrears_breakdown = '';
    facts.rent_amount = 1000;
    facts.total_arrears = 4000;
    facts.arrears_items = [
      {
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        rent_due: 1000,
        rent_paid: 0,
        amount_owed: 1000,
      },
      {
        period_start: '2024-02-01',
        period_end: '2024-02-29',
        rent_due: 1000,
        rent_paid: 0,
        amount_owed: 1000,
      },
      {
        period_start: '2024-03-01',
        period_end: '2024-03-31',
        rent_due: 1000,
        rent_paid: 0,
        amount_owed: 1000,
      },
      {
        period_start: '2024-04-01',
        period_end: '2024-04-15',
        rent_due: 1000,
        rent_paid: 0,
        amount_owed: 1000,
      },
    ];

    const canonical = computeEvictionArrears({
      arrears_items: facts.arrears_items,
      total_arrears: facts.total_arrears,
      rent_amount: facts.rent_amount,
      rent_frequency: facts.rent_frequency,
      rent_due_day: facts.rent_due_day,
      schedule_end_date: noticeDate,
    });

    const pack = await generateCompleteEvictionPack(facts);
    const scheduleDoc = pack.documents.find((doc) => doc.document_type === 'arrears_schedule');
    const noticeDoc = pack.documents.find((doc) => doc.document_type === 'section8_notice');
    const witnessDoc = pack.documents.find((doc) => doc.document_type === 'witness_statement');
    const letterDoc = pack.documents.find((doc) => doc.document_type === 'arrears_engagement_letter');

    expect(scheduleDoc?.html).toContain(canonical.total.toFixed(2));
    expect(noticeDoc?.html).toContain(canonical.total.toFixed(2));
    expect(witnessDoc?.html).toContain(canonical.total.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }));
    expect(letterDoc?.html).toContain(canonical.total.toFixed(2));
  });

  it('uses the arrears schedule period day consistently as the monthly rent due day', { timeout: 20000 }, async () => {
    const facts = buildEnglandSection8CompletePackFacts();
    const noticeDate = '2026-05-09';

    facts.notice_date = noticeDate;
    facts.notice_served_date = noticeDate;
    facts.tenancy_start_date = '2026-01-09';
    facts.rent_amount = 2000;
    facts.rent_frequency = 'monthly';
    facts.rent_due_day = 1;
    facts.arrears_breakdown = '';
    facts.total_arrears = 6129.03;
    facts.arrears_items = [
      { period_start: '2026-01-09', period_end: '2026-02-08', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
      { period_start: '2026-02-09', period_end: '2026-03-08', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
      { period_start: '2026-03-09', period_end: '2026-04-08', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
      { period_start: '2026-04-09', period_end: '2026-05-08', rent_due: 2000, rent_paid: 2000, amount_owed: 0 },
      { period_start: '2026-05-09', period_end: '2026-05-09', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
    ];

    const pack = await generateCompleteEvictionPack(facts);
    const scheduleHtml = pack.documents.find((doc) => doc.document_type === 'arrears_schedule')?.html || '';
    const witnessHtml = pack.documents.find((doc) => doc.document_type === 'witness_statement')?.html || '';
    const caseSummaryHtml = pack.documents.find((doc) => doc.document_type === 'case_summary')?.html || '';

    expect(scheduleHtml).toContain('9th of each month');
    expect(witnessHtml).toContain('due on the 9th of each month');
    expect(caseSummaryHtml).toContain('on the 9th day of each rental period');
    expect(scheduleHtml).not.toContain('1st of each month');
    expect(witnessHtml).not.toContain('due on the 1st of each month');
    expect(caseSummaryHtml).not.toContain('on the 1st day of each rental period');
  });

  it('uses the arrears schedule period day consistently in notice-only Section 8 packs', { timeout: 20000 }, async () => {
    const facts = buildEnglandSection8CompletePackFacts();
    const noticeDate = '2026-05-09';

    facts.__meta = { case_id: 'notice-only-period-day', jurisdiction: 'england' };
    facts.notice_date = noticeDate;
    facts.notice_served_date = noticeDate;
    facts.tenancy_start_date = '2026-01-09';
    facts.rent_amount = 2000;
    facts.rent_frequency = 'monthly';
    facts.rent_due_day = 1;
    facts.payment_day = 1;
    facts.arrears_breakdown = '';
    facts.total_arrears = 6129.03;
    facts.rent_arrears_amount = 6129.03;
    facts.selected_notice_route = 'section_8';
    facts.recommended_route = 'section_8';
    facts.eviction_route = 'section_8';
    facts.section8_grounds = ['Ground 8', 'Ground 10'];
    facts.arrears_items = [
      { period_start: '2026-01-09', period_end: '2026-02-08', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
      { period_start: '2026-02-09', period_end: '2026-03-08', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
      { period_start: '2026-03-09', period_end: '2026-04-08', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
      { period_start: '2026-04-09', period_end: '2026-05-08', rent_due: 2000, rent_paid: 2000, amount_owed: 0 },
      { period_start: '2026-05-09', period_end: '2026-05-09', rent_due: 2000, rent_paid: 0, amount_owed: 2000 },
    ];

    const pack = await generateNoticeOnlyPack(facts);
    const scheduleHtml = pack.documents.find((doc) => doc.document_type === 'arrears_schedule')?.html || '';
    const caseSummaryHtml = pack.documents.find((doc) => doc.document_type === 'case_summary')?.html || '';

    expect(scheduleHtml).toContain('9th of each month');
    expect(caseSummaryHtml).toContain('9th day of each month');
    expect(caseSummaryHtml).toContain('on the 9th day of each rental period');
    expect(scheduleHtml).not.toContain('1st of each month');
    expect(caseSummaryHtml).not.toContain('on the 1st day of each month');
  });

  it('falls back to legacy total when no arrears items are provided', { timeout: 20000 }, async () => {
    const facts = buildEnglandSection8CompletePackFacts();
    facts.arrears_breakdown = '';
    facts.arrears_items = [];
    facts.total_arrears = 3600;

    await expect(generateCompleteEvictionPack(facts)).resolves.toBeDefined();
  });
});
