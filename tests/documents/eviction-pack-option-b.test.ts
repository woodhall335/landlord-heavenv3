import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { generateCompleteEvictionPack } from '@/lib/documents/eviction-pack-generator';
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

function buildEnglandWalesFacts() {
  // Use only Ground 8 (mandatory, 14 days notice) to avoid the 60-day requirement of Ground 10
  // Ground 8 requires authoritative arrears_items schedule for court validation
  return {
    __meta: { case_id: 'EVICT-TEST-01', jurisdiction: 'england' },
    landlord_name: 'Alex Landlord',
    landlord_address_line1: '1 High Street',
    landlord_city: 'London',
    landlord_postcode: 'SW1A1A1',
    landlord_email: 'alex@example.com',
    landlord_phone: '07123456789',
    tenant1_name: 'Tina Tenant',
    tenant1_email: 'tina@example.com',
    tenant1_phone: '07000000000',
    property_address_line1: '2 Low Road',
    property_city: 'London',
    property_postcode: 'SW1A2BB',
    tenancy_start_date: '2024-01-01',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    notice_type: 'Section 8',
    notice_date: '2024-06-01',
    eviction_route: 'Section 8',
    section8_grounds: ['Ground 8'], // Ground 8 only (mandatory, 14 days notice)
    arrears_breakdown: 'Total arrears £2400',
    total_arrears: 2400,
    arrears_total: 2400, // Required by gating validation
    arrears_amount: 2400, // Required by complete pack validation
    // =========================================================================
    // AUTHORITATIVE ARREARS SCHEDULE (Required for Ground 8)
    // Ground 8 validation requires period-by-period breakdown, not just totals.
    // The arrears engine enforces this for court form generation.
    // =========================================================================
    arrears_items: [
      {
        period_start: '2024-04-01',
        period_end: '2024-04-30',
        rent_due: 1200,
        rent_paid: 0,
        amount_owed: 1200,
      },
      {
        period_start: '2024-05-01',
        period_end: '2024-05-31',
        rent_due: 1200,
        rent_paid: 0,
        amount_owed: 1200,
      },
    ],
    deposit_amount: 1200,
    deposit_protected: true,
    deposit_protection_date: '2024-01-15',
    deposit_scheme_name: 'TDS',
    rent_arrears_amount: 2400,
    // Ground particulars required for Section 8
    ground_particulars: {
      ground_8: {
        summary: 'Tenant has rent arrears of £2400 over 2 months',
      },
    },
    case_facts: {
      eviction: {
        notice_served_date: '2024-06-01',
        rent_arrears_amount: 2400,
      },
    },
  } as any;
}

function buildScotlandFacts() {
  return {
    __meta: { case_id: 'EVICT-TEST-SCOT', jurisdiction: 'scotland' },
    landlord_name: 'Fiona Landlord',
    landlord_address_line1: '10 Royal Mile',
    landlord_city: 'Edinburgh',
    landlord_postcode: 'EH1 1AA',
    landlord_email: 'fiona@example.com',
    landlord_phone: '07111111111',
    tenant1_name: 'Sean Tenant',
    tenant1_email: 'sean@example.com',
    tenant1_phone: '07000000001',
    property_address_line1: '50 Princes Street',
    property_city: 'Edinburgh',
    property_postcode: 'EH2 2BB',
    tenancy_start_date: '2023-05-01',
    rent_amount: 900,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    notice_type: 'Notice to Leave',
    notice_date: '2024-07-01',
    notice_expiry_date: '2024-10-01',
    scotland_ground_codes: ['Ground 12'],
    scotland_ground_explanation: 'Serious rent arrears',
    total_arrears: 1800,
    rent_arrears_amount: 1800,
  } as any;
}

beforeEach(() => {
  process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
  process.env.DISABLE_COMPLIANCE_AUDIT_AI = 'true';
  // Provide a harmless test AI client for risk report generation paths
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
  delete process.env.OPENAI_API_KEY;
  __setTestJsonAIClient(null);
  vi.restoreAllMocks();
});

describe('Complete eviction pack - Option B coverage', () => {
  it('produces England & Wales court forms and premium AI documents', async () => {
    const pack = await generateCompleteEvictionPack(buildEnglandWalesFacts());

    const fileNames = pack.documents.map((doc) => doc.file_name);

    expect(fileNames).toContain('section8_notice.pdf');
    expect(fileNames).toContain('n5_claim_for_possession.pdf');
    expect(fileNames).toContain('n119_particulars_of_claim.pdf');
    expect(fileNames).toContain('witness_statement.pdf');
    expect(fileNames).toContain('compliance_audit.pdf');
    expect(fileNames).toContain('risk_assessment.pdf');
    expect(pack.metadata.includes_court_forms).toBe(true);
    expect(pack.metadata.includes_expert_guidance).toBe(true);
    expect(pack.metadata.includes_evidence_tools).toBe(true);
  }, 30000);

  it('produces Scotland tribunal forms plus premium AI documents', async () => {
    const pack = await generateCompleteEvictionPack(buildScotlandFacts());

    const fileNames = pack.documents.map((doc) => doc.file_name);

    expect(fileNames).toContain('notice_to_leave.pdf');
    expect(fileNames).toContain('tribunal_form_e_application.pdf');
    expect(fileNames).toContain('witness_statement.pdf');
    expect(fileNames).toContain('compliance_audit.pdf');
    expect(fileNames).toContain('risk_assessment.pdf');
    expect(pack.metadata.includes_court_forms).toBe(true);
    expect(pack.metadata.includes_expert_guidance).toBe(true);
    expect(pack.metadata.includes_evidence_tools).toBe(true);
  }, 30000);
});
