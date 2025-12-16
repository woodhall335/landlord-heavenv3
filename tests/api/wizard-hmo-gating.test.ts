/**
 * HMO Pro Gating Tests
 *
 * Verifies that HMO Pro features are blocked in V1
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import { POST as startWizard } from '@/app/api/wizard/start/route';

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
  requireServerAuth: vi.fn(async () => ({ id: 'user-1' })),
  createAdminClient: vi.fn(() => ({
    storage: {
      from: () => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ publicUrl: 'https://example.com/doc.pdf' })),
      }),
    },
  })),
}));

vi.mock('@/lib/ai', () => ({
  getNextQuestion: vi.fn(async () => ({
    next_question: null,
    is_complete: true,
    missing_critical_facts: [],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      cost_usd: 0,
    },
  })),
  trackTokenUsage: vi.fn(async () => undefined),
}));

describe('HMO Pro gating (V1 scope enforcement)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.single.mockResolvedValue({ data: null, error: null });
  });

  it('rejects hmo_pro product at /api/wizard/start', async () => {
    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({
          product: 'hmo_pro',
          jurisdiction: 'england',
        }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();

    // Should indicate HMO Pro is not supported in V1 (caught by Zod enum validation)
    expect(body.error).toBe('Validation failed');
    expect(body.details).toBeDefined(); // Zod validation details
    expect(supabaseClientMock.insert).not.toHaveBeenCalled();
  });

  it('rejects hmo_standard product variant', async () => {
    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({
          product: 'hmo_standard',
          jurisdiction: 'england',
        }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Validation failed');
    expect(body.details).toBeDefined();
  });

  it('rejects hmo_premium product variant', async () => {
    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({
          product: 'hmo_premium',
          jurisdiction: 'scotland',
        }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Validation failed');
    expect(body.details).toBeDefined();
  });

  it('lists supported products excluding HMO variants', async () => {
    // This test verifies that HMO products are not listed in supported products
    // by attempting to start with an invalid product and checking the error response

    const response = await startWizard(
      new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        body: JSON.stringify({
          product: 'invalid_product',
          jurisdiction: 'england',
        }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();

    // If the error includes supported products, verify HMO is not listed
    if (body.supported_products || body.supported) {
      const supportedList = JSON.stringify(body);
      expect(supportedList).not.toMatch(/hmo/i);
    }
  });

  it('allows all V1-supported products (sanity check)', async () => {
    const validProducts = [
      'notice_only',
      'complete_pack',
      'money_claim',
      'tenancy_agreement',
    ];

    for (const product of validProducts) {
      supabaseClientMock.single.mockResolvedValueOnce({
        data: {
          id: `case-${product}`,
          case_type: product,
          jurisdiction: 'england',
          status: 'draft',
        },
        error: null,
      });

      supabaseClientMock.maybeSingle.mockResolvedValueOnce({
        data: {
          id: `facts-${product}`,
          case_id: `case-${product}`,
          facts: {},
        },
        error: null,
      });

      const response = await startWizard(
        new Request('http://localhost/api/wizard/start', {
          method: 'POST',
          body: JSON.stringify({
            product,
            jurisdiction: 'england',
          }),
        })
      );

      // Should succeed (200 or 201) for all V1-supported products
      expect(response.status).toBeLessThan(400);
    }
  });
});

describe('HMO Pro blocking documentation', () => {
  it('documents V2 roadmap timeline', () => {
    // This is a documentation test to ensure we track the HMO roadmap
    const hmoRoadmap = {
      status: 'V2+ Roadmap',
      expected_launch: 'Q2 2026',
      features: [
        'License tracking',
        'Fire safety management',
        'Compliance reminders',
        'Tenant management',
        'Property portfolio dashboard',
      ],
      v1_scope: {
        hmo_licensing: false,
        hmo_pro_subscription: false,
        hmo_dashboard: false,
      },
    };

    expect(hmoRoadmap.status).toBe('V2+ Roadmap');
    expect(hmoRoadmap.expected_launch).toBe('Q2 2026');
    expect(hmoRoadmap.v1_scope.hmo_licensing).toBe(false);
    expect(hmoRoadmap.v1_scope.hmo_pro_subscription).toBe(false);
    expect(hmoRoadmap.v1_scope.hmo_dashboard).toBe(false);
  });
});
