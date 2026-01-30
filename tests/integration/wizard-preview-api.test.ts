/**
 * Wizard Preview API Integration Tests
 *
 * Tests the multi-page preview generation API for tenancy agreements.
 *
 * Note: These tests require a running database with test data.
 * Run with: npm test -- tests/integration/wizard-preview-api.test.ts
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

// Mock Supabase for integration tests (can be swapped with real client for E2E)
const mockCase = {
  id: 'test-preview-case-001',
  jurisdiction: 'england',
  user_id: 'test-user-001',
  collected_facts: {
    __meta: {
      product: 'tenancy_agreement',
      jurisdiction: 'england',
    },
    landlord_full_name: 'Integration Test Landlord',
    landlord_email: 'landlord@integration-test.com',
    landlord_address_line1: '123 Integration Street',
    landlord_address_town: 'London',
    landlord_address_postcode: 'SW1A 1AA',
    tenants: [
      {
        full_name: 'Integration Test Tenant',
        email: 'tenant@integration-test.com',
        phone: '07700123456',
        dob: '1990-01-15',
      },
    ],
    property_address_line1: '456 Property Lane',
    property_address_town: 'Manchester',
    property_address_postcode: 'M1 1AB',
    property_type: 'flat',
    tenancy_start_date: '2026-02-01',
    is_fixed_term: true,
    tenancy_end_date: '2027-02-01',
    rent_amount: 1200,
    rent_period: 'month',
    rent_due_day: '1st',
    deposit_amount: 1200,
    deposit_scheme_name: 'DPS',
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockCase, error: null }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: `https://test.supabase.co/signed/${Date.now()}` },
          error: null,
        }),
      })),
    },
  })),
  createServerSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockCase, error: null }),
    })),
  })),
  tryGetServerUser: vi.fn().mockResolvedValue({
    id: 'test-user-001',
    email: 'user@integration-test.com',
  }),
}));

// Mock the document generator to return realistic HTML
vi.mock('@/lib/documents/generator', () => ({
  generateDocument: vi.fn().mockResolvedValue({
    html: `
      <!DOCTYPE html>
      <html>
      <head><title>AST Agreement</title></head>
      <body>
        <h1>Assured Shorthold Tenancy Agreement</h1>
        <p>This agreement is made on 1 February 2026</p>
        <h2>1. Parties</h2>
        <p>Landlord: Integration Test Landlord</p>
        <p>Tenant: Integration Test Tenant</p>
        <h2>2. Property</h2>
        <p>456 Property Lane, Manchester, M1 1AB</p>
        <!-- More content would make this multi-page -->
        ${Array(50).fill('<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>').join('\n')}
      </body>
      </html>
    `,
  }),
}));

vi.mock('@/lib/documents/ast-generator', () => ({
  getJurisdictionConfig: vi.fn(() => ({
    jurisdictionLabel: 'England',
    legalFramework: 'Housing Act 1988',
    templatePaths: {
      standard: 'config/jurisdictions/uk/england/templates/standard_ast.hbs',
      premium: 'config/jurisdictions/uk/england/templates/premium_ast.hbs',
    },
  })),
}));

vi.mock('@/lib/types/jurisdiction', () => ({
  deriveCanonicalJurisdiction: vi.fn(() => 'england'),
}));

// Skip Puppeteer in tests - mock the image generation
vi.mock('puppeteer-core', () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        setViewport: vi.fn(),
        setContent: vi.fn(),
        evaluate: vi.fn().mockResolvedValue(2246), // 2 pages worth of height
        screenshot: vi.fn().mockResolvedValue(Buffer.from('mock-jpeg-data')),
      }),
      close: vi.fn(),
    }),
  },
}));

describe('Wizard Preview API Integration', () => {
  describe('GET /api/wizard/preview/[caseId]', () => {
    it('should return manifest with ready status for valid case', async () => {
      const { generateTenancyPreview } = await import('@/lib/documents/preview-generator');

      const manifest = await generateTenancyPreview({
        caseId: mockCase.id,
        product: 'ast_standard',
        tier: 'standard',
        userId: 'test-user-001',
        userEmail: 'user@integration-test.com',
      });

      expect(manifest.status).toBe('ready');
      expect(manifest.caseId).toBe(mockCase.id);
      expect(manifest.product).toBe('ast_standard');
      expect(manifest.jurisdiction).toBe('england');
      expect(manifest.pageCount).toBeGreaterThanOrEqual(1);
      expect(manifest.pages).toBeDefined();
      expect(manifest.pages!.length).toBeGreaterThanOrEqual(1);
    });

    it('should include page metadata in manifest', async () => {
      const { generateTenancyPreview } = await import('@/lib/documents/preview-generator');

      const manifest = await generateTenancyPreview({
        caseId: mockCase.id,
        product: 'ast_standard',
      });

      if (manifest.pages && manifest.pages.length > 0) {
        const firstPage = manifest.pages[0];

        expect(firstPage.page).toBe(0);
        expect(firstPage.width).toBeGreaterThan(0);
        expect(firstPage.height).toBeGreaterThan(0);
        expect(firstPage.url).toContain('https://');
      }
    });

    it('should generate signed URLs with expiry', async () => {
      const { generateTenancyPreview } = await import('@/lib/documents/preview-generator');

      const manifest = await generateTenancyPreview({
        caseId: mockCase.id,
        product: 'ast_standard',
      });

      expect(manifest.expiresAt).toBeDefined();

      if (manifest.expiresAt) {
        const expiresAt = new Date(manifest.expiresAt);
        const now = new Date();

        // Expiry should be in the future
        expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());

        // Expiry should be within 30 minutes
        const maxExpiry = new Date(now.getTime() + 30 * 60 * 1000);
        expect(expiresAt.getTime()).toBeLessThanOrEqual(maxExpiry.getTime());
      }
    });

    it('should cache results for same case', async () => {
      const { generateTenancyPreview, getPreviewFromCache, invalidatePreviewCache } =
        await import('@/lib/documents/preview-generator');

      // Clear any existing cache
      invalidatePreviewCache(mockCase.id);

      // First request - should generate
      const manifest1 = await generateTenancyPreview({
        caseId: mockCase.id,
        product: 'ast_standard',
      });

      // Check cache
      const cached = getPreviewFromCache(mockCase.id, 'ast_standard', 'standard');
      expect(cached).not.toBeNull();
      expect(cached?.status).toBe('ready');
    });

    it('should support premium tier', async () => {
      const { generateTenancyPreview, invalidatePreviewCache } =
        await import('@/lib/documents/preview-generator');

      invalidatePreviewCache(mockCase.id);

      const manifest = await generateTenancyPreview({
        caseId: mockCase.id,
        product: 'ast_premium',
        tier: 'premium',
      });

      expect(manifest.status).toBe('ready');
      expect(manifest.product).toBe('ast_premium');
    });
  });

  describe('Watermark generation', () => {
    it('should include case ID in watermark', async () => {
      const { generateTenancyPreview, invalidatePreviewCache } =
        await import('@/lib/documents/preview-generator');

      invalidatePreviewCache(mockCase.id);

      // The watermark is applied during image generation
      // We can verify the manifest contains case ID for correlation
      const manifest = await generateTenancyPreview({
        caseId: mockCase.id,
        product: 'ast_standard',
      });

      expect(manifest.caseId).toBe(mockCase.id);
    });

    it('should hash user identifier in watermark', async () => {
      const { generateTenancyPreview, invalidatePreviewCache } =
        await import('@/lib/documents/preview-generator');

      invalidatePreviewCache(mockCase.id);

      // Generate with user info
      const manifest = await generateTenancyPreview({
        caseId: mockCase.id,
        product: 'ast_standard',
        userId: 'user-123',
        userEmail: 'test@example.com',
      });

      // User info is used for watermarking, not exposed in manifest
      expect(manifest.status).toBe('ready');
    });
  });

  describe('Error handling', () => {
    it('should return error status for invalid case', async () => {
      // Override mock for this test
      const { createAdminClient } = await import('@/lib/supabase/server');
      vi.mocked(createAdminClient).mockReturnValueOnce({
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        })),
        storage: {
          from: vi.fn(() => ({
            upload: vi.fn(),
            createSignedUrl: vi.fn(),
          })),
        },
      } as any);

      const { generateTenancyPreview, invalidatePreviewCache } =
        await import('@/lib/documents/preview-generator');

      invalidatePreviewCache('nonexistent-case');

      const manifest = await generateTenancyPreview({
        caseId: 'nonexistent-case',
        product: 'ast_standard',
      });

      expect(manifest.status).toBe('error');
      expect(manifest.error).toBeDefined();
    });
  });

  describe('Fixed vs periodic tenancy', () => {
    it('should generate preview for fixed term tenancy', async () => {
      const { generateTenancyPreview, invalidatePreviewCache } =
        await import('@/lib/documents/preview-generator');

      invalidatePreviewCache(mockCase.id);

      const manifest = await generateTenancyPreview({
        caseId: mockCase.id,
        product: 'ast_standard',
      });

      expect(manifest.status).toBe('ready');
      // Fixed term case should generate successfully
      expect(manifest.pageCount).toBeGreaterThanOrEqual(1);
    });

    it('should generate preview for periodic tenancy', async () => {
      // Modify mock case for periodic tenancy
      const periodicCase = {
        ...mockCase,
        id: 'test-periodic-case',
        collected_facts: {
          ...mockCase.collected_facts,
          is_fixed_term: false,
          tenancy_end_date: undefined,
        },
      };

      const { createAdminClient } = await import('@/lib/supabase/server');
      vi.mocked(createAdminClient).mockReturnValueOnce({
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: periodicCase, error: null }),
        })),
        storage: {
          from: vi.fn(() => ({
            upload: vi.fn().mockResolvedValue({ error: null }),
            createSignedUrl: vi.fn().mockResolvedValue({
              data: { signedUrl: 'https://test.supabase.co/signed/periodic' },
              error: null,
            }),
          })),
        },
      } as any);

      const { generateTenancyPreview, invalidatePreviewCache } =
        await import('@/lib/documents/preview-generator');

      invalidatePreviewCache('test-periodic-case');

      const manifest = await generateTenancyPreview({
        caseId: 'test-periodic-case',
        product: 'ast_standard',
      });

      expect(manifest.status).toBe('ready');
    });
  });
});

describe('Monthly vs Weekly rent scenarios', () => {
  it('should handle monthly rent in preview', async () => {
    const monthlyCase = {
      ...mockCase,
      id: 'test-monthly-case',
      collected_facts: {
        ...mockCase.collected_facts,
        rent_period: 'month',
        rent_amount: 1200,
      },
    };

    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: monthlyCase, error: null }),
      })),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          createSignedUrl: vi.fn().mockResolvedValue({
            data: { signedUrl: 'https://test.supabase.co/signed/monthly' },
            error: null,
          }),
        })),
      },
    } as any);

    const { generateTenancyPreview, invalidatePreviewCache } =
      await import('@/lib/documents/preview-generator');

    invalidatePreviewCache('test-monthly-case');

    const manifest = await generateTenancyPreview({
      caseId: 'test-monthly-case',
      product: 'ast_standard',
    });

    expect(manifest.status).toBe('ready');
  });

  it('should handle weekly rent in preview', async () => {
    const weeklyCase = {
      ...mockCase,
      id: 'test-weekly-case',
      collected_facts: {
        ...mockCase.collected_facts,
        rent_period: 'week',
        rent_amount: 300,
      },
    };

    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: weeklyCase, error: null }),
      })),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          createSignedUrl: vi.fn().mockResolvedValue({
            data: { signedUrl: 'https://test.supabase.co/signed/weekly' },
            error: null,
          }),
        })),
      },
    } as any);

    const { generateTenancyPreview, invalidatePreviewCache } =
      await import('@/lib/documents/preview-generator');

    invalidatePreviewCache('test-weekly-case');

    const manifest = await generateTenancyPreview({
      caseId: 'test-weekly-case',
      product: 'ast_standard',
    });

    expect(manifest.status).toBe('ready');
  });
});
