import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateCompleteEvictionPack } from '@/lib/documents/eviction-pack-generator';
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
  it('keeps arrears totals aligned across schedule, notice, witness statement, and letter (prorated)', { timeout: 20000 }, async () => {
    const facts = buildEnglandSection8CompletePackFacts();
    const noticeDate = '2024-03-15';

    facts.notice_date = noticeDate;
    facts.notice_served_date = noticeDate;
    facts.arrears_breakdown = '';
    facts.total_arrears = 2400;
    facts.arrears_items = [
      {
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        rent_due: 1200,
        rent_paid: 0,
        amount_owed: 1200,
      },
      {
        period_start: '2024-02-01',
        period_end: '2024-02-15',
        rent_due: 1200,
        rent_paid: 0,
        amount_owed: 1200,
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
    const plainTotal = `£${canonical.total.toFixed(2)}`;
    const witnessTotal = `£${canonical.total.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const scheduleDoc = pack.documents.find((doc) => doc.document_type === 'arrears_schedule');
    const noticeDoc = pack.documents.find((doc) => doc.document_type === 'section8_notice');
    const witnessDoc = pack.documents.find((doc) => doc.document_type === 'witness_statement');
    const letterDoc = pack.documents.find((doc) => doc.document_type === 'arrears_engagement_letter');

    expect(scheduleDoc?.html).toContain(plainTotal);
    expect(noticeDoc?.html).toContain(plainTotal);
    expect(witnessDoc?.html).toContain(witnessTotal);
    expect(letterDoc?.html).toContain(plainTotal);
  });

  it('falls back to legacy total when no arrears items are provided', { timeout: 20000 }, async () => {
    const facts = buildEnglandSection8CompletePackFacts();
    facts.arrears_breakdown = '';
    facts.arrears_items = [];
    facts.total_arrears = 2400;

    await expect(generateCompleteEvictionPack(facts)).resolves.toBeDefined();
  });
});
