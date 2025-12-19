import { describe, expect, it, beforeEach, vi } from 'vitest';
import { POST as checkpointWizard } from '@/app/api/wizard/checkpoint/route';
import type { NextRequest } from 'next/server';

const supabaseClientMock = {
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  update: vi.fn(),
};

supabaseClientMock.from.mockReturnValue(supabaseClientMock);
supabaseClientMock.insert.mockReturnValue(supabaseClientMock);
supabaseClientMock.select.mockReturnValue(supabaseClientMock);
supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
supabaseClientMock.is.mockReturnValue(supabaseClientMock);
supabaseClientMock.update.mockReturnValue(supabaseClientMock);
supabaseClientMock.maybeSingle.mockResolvedValue({ data: null, error: null });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => supabaseClientMock),
  getServerUser: vi.fn(async () => null),
}));

vi.mock('@/lib/case-facts/store', () => ({
  getOrCreateWizardFacts: vi.fn(async () => ({
    __meta: { product: 'notice_only' },
    landlord_full_name: 'Test Landlord',
    tenant_full_name: 'Test Tenant',
    property_address_line1: '123 Test Street',
    tenancy_start_date: '2024-01-01',
    rent_amount: 1000,
    deposit_protected: true,
    deposit_amount: 1000,
    total_arrears: 2000,
  })),
}));

vi.mock('@/lib/case-facts/normalize', () => ({
  wizardFactsToCaseFacts: vi.fn((facts) => ({
    meta: { product: 'notice_only' },
    parties: {
      landlord: { name: facts.landlord_full_name || '' },
      tenants: [{ name: facts.tenant_full_name || '' }],
    },
    property: {
      address_line1: facts.property_address_line1 || '',
      country: 'england',
    },
    tenancy: {
      start_date: facts.tenancy_start_date || null,
      rent_amount: facts.rent_amount || 0,
      deposit_protected: facts.deposit_protected || false,
      deposit_amount: facts.deposit_amount || 0,
      tenancy_type: 'ast',
    },
    issues: {
      rent_arrears: {
        has_arrears: true,
        total_arrears: facts.total_arrears || 0,
        arrears_items: [],
        pre_action_confirmed: false,
      },
      other_breaches: { has_breach: false, description: null },
      asb: { has_asb: false, description: null, authority_involvement: false },
      property_damage: { has_damage: false, description: null },
    },
    notice: {
      notice_type: null,
      notice_date: null,
      notice_expiry: null,
      service_method: null,
    },
    court: {
      route: null,
      preferred_court: null,
    },
    evidence: {
      tenancy_agreement_uploaded: false,
      rent_schedule_uploaded: false,
      bank_statements_uploaded: false,
      other_evidence_uploaded: false,
    },
    money_claim: {
      basis_of_claim: null,
      damage_items: [],
      other_charges: [],
      interest_rate: 8,
      interest_start_date: null,
      charge_interest: false,
      lba_sent: false,
      lba_date: null,
      lba_response_deadline: null,
      lba_method: [],
      pap_documents_sent: [],
      pap_documents_served: false,
      pre_action_deadline_confirmation: false,
      demand_letter_date: null,
      attempts_to_resolve: null,
      arrears_schedule_confirmed: false,
      evidence_types_available: [],
      enforcement_preferences: [],
      sheriffdom: null,
    },
  })),
}));

vi.mock('@/lib/decision-engine', () => ({
  runDecisionEngine: vi.fn(() => ({
    recommended_routes: ['section_8'],
    recommended_grounds: [
      {
        code: '8',
        title: 'Serious rent arrears',
        type: 'mandatory',
        weight: 10,
        success_probability: 0.9,
      },
    ],
    blocking_issues: [],
    warnings: [],
    pre_action_requirements: [],
    analysis_summary: 'Test summary',
  })),
}));

vi.mock('@/lib/law-profile', () => ({
  getLawProfile: vi.fn(() => ({
    jurisdiction: 'england',
    case_type: 'eviction',
    version: '1.0.0',
  })),
}));

describe('Wizard API Checkpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: 'case-123',
        jurisdiction: 'england',
        case_type: 'eviction',
        user_id: null,
        wizard_progress: 50,
      },
      error: null,
    });
    supabaseClientMock.update.mockResolvedValue({ data: null, error: null });
  });

  it('accepts case_id and returns structured response', async () => {
    const request = new Request('http://localhost/api/wizard/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: 'case-123' }),
    }) as NextRequest;

    const response = await checkpointWizard(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.status).toBe('ok');
    expect(body.case_id).toBe('case-123');
    expect(body.recommended_route).toBe('section_8');
    expect(body.recommended_routes).toEqual(['section_8']);
  });

  it('persists recommended_route to cases table', async () => {
    const request = new Request('http://localhost/api/wizard/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: 'case-123' }),
    }) as NextRequest;

    await checkpointWizard(request);

    expect(supabaseClientMock.update).toHaveBeenCalledWith({
      recommended_route: 'section_8',
    });
    expect(supabaseClientMock.eq).toHaveBeenCalledWith('id', 'case-123');
  });

  it('returns structured error for missing case_id', async () => {
    const request = new Request('http://localhost/api/wizard/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }) as NextRequest;

    const response = await checkpointWizard(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Invalid request');
    expect(body.missingFields).toContain('case_id');
  });

  it('returns structured error for case not found', async () => {
    supabaseClientMock.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });

    const request = new Request('http://localhost/api/wizard/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: 'invalid-id' }),
    }) as NextRequest;

    const response = await checkpointWizard(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Case not found');
  });

  it('returns early for money_claim case_type', async () => {
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: 'case-123',
        jurisdiction: 'england',
        case_type: 'money_claim',
        user_id: null,
        wizard_progress: 50,
      },
      error: null,
    });

    const request = new Request('http://localhost/api/wizard/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: 'case-123' }),
    }) as NextRequest;

    const response = await checkpointWizard(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.summary).toContain('Money claim workflow');
  });

  it('blocks NI eviction cases with structured error', async () => {
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: 'case-123',
        jurisdiction: 'northern-ireland',
        case_type: 'eviction',
        user_id: null,
        wizard_progress: 50,
      },
      error: null,
    });

    const request = new Request('http://localhost/api/wizard/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: 'case-123' }),
    }) as NextRequest;

    const response = await checkpointWizard(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED');
  });

  it('accepts canonical jurisdiction "england" and normalizes for decision engine', async () => {
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: 'case-123',
        jurisdiction: 'england',
        case_type: 'eviction',
        user_id: null,
        wizard_progress: 50,
      },
      error: null,
    });

    const request = new Request('http://localhost/api/wizard/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: 'case-123' }),
    }) as NextRequest;

    const response = await checkpointWizard(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.status).toBe('ok');
  });

  it('accepts canonical jurisdiction "wales" and normalizes for decision engine', async () => {
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: 'case-123',
        jurisdiction: 'wales',
        case_type: 'eviction',
        user_id: null,
        wizard_progress: 50,
      },
      error: null,
    });

    const request = new Request('http://localhost/api/wizard/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: 'case-123' }),
    }) as NextRequest;

    const response = await checkpointWizard(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.status).toBe('ok');
  });

  it('still accepts legacy jurisdiction "england-wales" for backwards compatibility', async () => {
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: 'case-123',
        jurisdiction: 'england-wales',
        case_type: 'eviction',
        user_id: null,
        wizard_progress: 50,
      },
      error: null,
    });

    const request = new Request('http://localhost/api/wizard/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: 'case-123' }),
    }) as NextRequest;

    const response = await checkpointWizard(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.status).toBe('ok');
  });

  it('rejects invalid jurisdiction values', async () => {
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: 'case-123',
        jurisdiction: 'invalid',
        case_type: 'eviction',
        user_id: null,
        wizard_progress: 50,
      },
      error: null,
    });

    const request = new Request('http://localhost/api/wizard/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: 'case-123' }),
    }) as NextRequest;

    const response = await checkpointWizard(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Invalid jurisdiction');
    expect(body.reason).toContain('invalid');
  });
});
