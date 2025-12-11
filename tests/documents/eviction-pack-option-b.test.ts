import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { generateCompleteEvictionPack } from '@/lib/documents/eviction-pack-generator';
import { __setTestJsonAIClient } from '@/lib/ai/openai-client';
import * as officialForms from '@/lib/documents/official-forms-filler';
import * as scotlandForms from '@/lib/documents/scotland-forms-filler';

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
  return {
    __meta: { case_id: 'EVICT-TEST-01', jurisdiction: 'england-wales' },
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
    section8_grounds: ['Ground 8', 'Ground 10'],
    arrears_breakdown: 'Total arrears £2400',
    total_arrears: 2400,
    deposit_amount: 1200,
    deposit_protected: true,
    deposit_protection_date: '2024-01-15',
    deposit_scheme_name: 'TDS',
    deposit_reference: 'TDS-REF-001',
    rent_arrears_amount: 2400,
    case_facts: {
      eviction: {
        notice_served_date: '2024-06-01',
        rent_arrears_amount: 2400,
      },
    },
  } as any;
}

function buildSection21Facts() {
  const base = buildEnglandWalesFacts();
  return {
    ...base,
    notice_type: 'Section 21',
    eviction_route: 'Section 21',
    section_21_notice_date: '2024-06-10',
    notice_expiry_date: '2024-08-10',
    case_type: 'no_fault',
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
    deposit_scheme_name: 'SafeDeposits Scotland',
    deposit_reference: 'SDS-12345',
  } as any;
}

beforeEach(() => {
  process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
  process.env.DISABLE_COMPLIANCE_AUDIT_AI = 'true';
  // Provide a harmless test AI client for risk report generation paths
  __setTestJsonAIClient({
    jsonCompletion: async () => ({
      json: {},
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
    const n5Calls: any[] = [];
    const n119Calls: any[] = [];

    vi.spyOn(officialForms, 'fillN5Form').mockImplementation(async (data) => {
      n5Calls.push(data);
      return Buffer.from('n5');
    });

    vi.spyOn(officialForms, 'fillN119Form').mockImplementation(async (data) => {
      n119Calls.push(data);
      return Buffer.from('n119');
    });

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

    expect(n5Calls[0].ground_numbers).toContain('8');
    expect(n5Calls[0].total_arrears).toBe(2400);
    expect(n5Calls[0].notice_served_date || n5Calls[0].section_8_notice_date).toBe('2024-06-01');
    expect(n5Calls[0].court_name).toBeDefined();
    expect(n5Calls[0].service_address_line1).toContain('1 High Street');

    expect(n119Calls[0].total_arrears).toBe(2400);
    expect(n119Calls[0].section_8_notice_date).toBe('2024-06-01');
  }, 30000);

  it('adds N5B for Section 21 cases with mapped dates and deposit info', async () => {
    const n5bCalls: any[] = [];

    vi.spyOn(officialForms, 'fillN5BForm').mockImplementation(async (data) => {
      n5bCalls.push(data);
      return Buffer.from('n5b');
    });

    const pack = await generateCompleteEvictionPack(buildSection21Facts());

    const fileNames = pack.documents.map((doc) => doc.file_name);

    expect(fileNames).toContain('section21_form6a.pdf');
    expect(fileNames).toContain('n5b_accelerated_possession.pdf');
    expect(n5bCalls[0].section_21_notice_date).toBe('2024-06-10');
    expect(n5bCalls[0].notice_expiry_date).toBe('2024-08-10');
    expect(n5bCalls[0].deposit_reference).toBeDefined();
  }, 30000);

  it('produces Scotland tribunal forms plus premium AI documents', async () => {
    const scotlandCalls: any[] = [];

    vi.spyOn(scotlandForms, 'fillScotlandOfficialForm').mockImplementation(async (formType, data) => {
      scotlandCalls.push({ formType, data });
      return Buffer.from(formType);
    });

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

    const noticeCall = scotlandCalls.find((c) => c.formType === 'notice_to_leave');
    const formECall = scotlandCalls.find((c) => c.formType === 'form_e');
    expect(noticeCall?.data?.grounds?.length).toBeGreaterThan(0);
    expect(formECall?.data?.deposit_scheme_name || formECall?.data?.deposit_scheme).toBeDefined();
  }, 30000);
});
