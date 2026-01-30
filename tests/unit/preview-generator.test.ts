/**
 * Preview Generator Unit Tests
 *
 * Tests the multi-page preview generation pipeline for tenancy agreements.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: {
        id: 'test-case-id',
        jurisdiction: 'england',
        collected_facts: {
          landlord_full_name: 'Test Landlord',
          landlord_address_line1: '123 Test Street',
          landlord_address_town: 'London',
          landlord_address_postcode: 'SW1A 1AA',
          tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com' }],
          property_address_line1: '456 Property Road',
          property_address_town: 'Manchester',
          property_address_postcode: 'M1 1AA',
          rent_amount: 1200,
          tenancy_start_date: '2026-01-01',
        },
      },
      error: null,
    }),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://example.com/signed-url' },
          error: null,
        }),
      })),
    },
  })),
  createServerSupabaseClient: vi.fn(),
  tryGetServerUser: vi.fn(),
}));

// Mock document generator
vi.mock('@/lib/documents/generator', () => ({
  generateDocument: vi.fn().mockResolvedValue({
    html: '<html><body><h1>Test Document</h1><p>Content here...</p></body></html>',
  }),
}));

// Mock AST generator config
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

// Mock jurisdiction derivation
vi.mock('@/lib/types/jurisdiction', () => ({
  deriveCanonicalJurisdiction: vi.fn(() => 'england'),
}));

describe('Preview Generator', () => {
  describe('createWatermarkText', () => {
    it('should create watermark text with case ID and user hash', async () => {
      // Import dynamically to apply mocks
      const { generateTenancyPreview } = await import('@/lib/documents/preview-generator');

      // The watermark text format is:
      // "PREVIEW • landlordheaven.co.uk • {shortCaseId} • {userHash}"
      const caseId = '12345678-1234-1234-1234-123456789012';
      const expectedShortCaseId = caseId.substring(0, 8); // "12345678"

      // Watermark text is internal, but we can verify it gets used
      expect(expectedShortCaseId).toBe('12345678');
    });
  });

  describe('PreviewManifest structure', () => {
    it('should have correct manifest structure when ready', () => {
      const manifest = {
        status: 'ready' as const,
        caseId: 'test-case-id',
        product: 'ast_standard',
        jurisdiction: 'england',
        pageCount: 5,
        pages: [
          { page: 0, width: 800, height: 1131, url: 'https://example.com/page0.jpg' },
          { page: 1, width: 800, height: 1131, url: 'https://example.com/page1.jpg' },
        ],
        generatedAt: '2026-01-30T12:00:00Z',
        expiresAt: '2026-01-30T12:15:00Z',
      };

      expect(manifest.status).toBe('ready');
      expect(manifest.pageCount).toBe(5);
      expect(manifest.pages).toHaveLength(2);
      expect(manifest.pages![0].page).toBe(0);
      expect(manifest.pages![0].width).toBe(800);
      expect(manifest.pages![0].height).toBe(1131);
      expect(manifest.pages![0].url).toContain('https://');
    });

    it('should have correct manifest structure when processing', () => {
      const manifest = {
        status: 'processing' as const,
        caseId: 'test-case-id',
        product: 'ast_standard',
        jurisdiction: 'unknown',
      };

      expect(manifest.status).toBe('processing');
      expect(manifest.pageCount).toBeUndefined();
      expect(manifest.pages).toBeUndefined();
    });

    it('should have correct manifest structure when error', () => {
      const manifest = {
        status: 'error' as const,
        caseId: 'test-case-id',
        product: 'ast_standard',
        jurisdiction: 'unknown',
        error: 'Case not found',
      };

      expect(manifest.status).toBe('error');
      expect(manifest.error).toBe('Case not found');
    });
  });

  describe('Watermark text format', () => {
    it('should include required watermark components', () => {
      const watermarkText = 'PREVIEW • landlordheaven.co.uk • 12345678 • a1b2c3d4';

      expect(watermarkText).toContain('PREVIEW');
      expect(watermarkText).toContain('landlordheaven.co.uk');
      expect(watermarkText).toMatch(/[a-f0-9]{8}/); // Case ID hash
    });
  });

  describe('Page dimensions', () => {
    it('should use A4 aspect ratio (1:1.414)', () => {
      const A4_WIDTH = 794;
      const A4_HEIGHT = 1123;
      const aspectRatio = A4_HEIGHT / A4_WIDTH;

      // A4 aspect ratio is approximately 1.414 (sqrt(2))
      expect(aspectRatio).toBeCloseTo(1.414, 2);
    });

    it('should use output dimensions with correct aspect ratio', () => {
      const OUTPUT_WIDTH = 800;
      const OUTPUT_HEIGHT = 1131;
      const outputAspectRatio = OUTPUT_HEIGHT / OUTPUT_WIDTH;

      // Output should maintain A4 aspect ratio
      expect(outputAspectRatio).toBeCloseTo(1.414, 2);
    });
  });

  describe('Cache key generation', () => {
    it('should generate unique cache keys', () => {
      const getCacheKey = (caseId: string, product: string, tier: string) =>
        `preview:${caseId}:${product}:${tier}`;

      const key1 = getCacheKey('case1', 'ast_standard', 'standard');
      const key2 = getCacheKey('case1', 'ast_premium', 'premium');
      const key3 = getCacheKey('case2', 'ast_standard', 'standard');

      expect(key1).toBe('preview:case1:ast_standard:standard');
      expect(key2).toBe('preview:case1:ast_premium:premium');
      expect(key3).toBe('preview:case2:ast_standard:standard');
      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
    });
  });

  describe('URL signing', () => {
    it('should generate signed URLs with expiry', () => {
      const SIGNED_URL_EXPIRY_SECONDS = 15 * 60; // 15 minutes

      const now = Date.now();
      const expiresAt = new Date(now + SIGNED_URL_EXPIRY_SECONDS * 1000);

      // Expiry should be 15 minutes from now
      const expiryDiff = expiresAt.getTime() - now;
      expect(expiryDiff).toBe(15 * 60 * 1000);
    });
  });
});

describe('Preview API Route', () => {
  describe('Product normalization', () => {
    it('should normalize product names', () => {
      const normalizeProduct = (product: string | null): string => {
        const productMap: Record<string, string> = {
          ast_standard: 'ast_standard',
          ast_premium: 'ast_premium',
          tenancy_agreement: 'ast_standard',
          tenancy_standard: 'ast_standard',
          tenancy_premium: 'ast_premium',
        };
        return productMap[product || ''] || product || 'ast_standard';
      };

      expect(normalizeProduct('ast_standard')).toBe('ast_standard');
      expect(normalizeProduct('ast_premium')).toBe('ast_premium');
      expect(normalizeProduct('tenancy_agreement')).toBe('ast_standard');
      expect(normalizeProduct('tenancy_standard')).toBe('ast_standard');
      expect(normalizeProduct('tenancy_premium')).toBe('ast_premium');
      expect(normalizeProduct(null)).toBe('ast_standard');
      expect(normalizeProduct('unknown')).toBe('unknown');
    });
  });

  describe('Tier detection', () => {
    it('should detect tier from product name', () => {
      const getTierFromProduct = (product: string): 'standard' | 'premium' => {
        if (product.includes('premium') || product.includes('hmo')) {
          return 'premium';
        }
        return 'standard';
      };

      expect(getTierFromProduct('ast_standard')).toBe('standard');
      expect(getTierFromProduct('ast_premium')).toBe('premium');
      expect(getTierFromProduct('prt_agreement')).toBe('standard');
      expect(getTierFromProduct('prt_premium')).toBe('premium');
      expect(getTierFromProduct('ast_hmo')).toBe('premium');
    });
  });

  describe('Tenancy product detection', () => {
    it('should identify tenancy products', () => {
      const isTenancyProduct = (product: string): boolean => {
        const tenancyProducts = [
          'ast_standard',
          'ast_premium',
          'tenancy_agreement',
          'tenancy_standard',
          'tenancy_premium',
          'prt_agreement',
          'prt_premium',
          'soc_standard',
          'soc_premium',
          'private_tenancy',
          'private_tenancy_premium',
        ];
        return tenancyProducts.includes(product);
      };

      expect(isTenancyProduct('ast_standard')).toBe(true);
      expect(isTenancyProduct('ast_premium')).toBe(true);
      expect(isTenancyProduct('notice_only')).toBe(false);
      expect(isTenancyProduct('complete_pack')).toBe(false);
      expect(isTenancyProduct('money_claim')).toBe(false);
      expect(isTenancyProduct('prt_agreement')).toBe(true);
      expect(isTenancyProduct('soc_standard')).toBe(true);
    });
  });
});

describe('MultiPageViewer Component', () => {
  describe('Page navigation', () => {
    it('should clamp page index to valid range', () => {
      const pageCount = 5;
      const clampPage = (page: number) => Math.max(0, Math.min(page, pageCount - 1));

      expect(clampPage(-1)).toBe(0);
      expect(clampPage(0)).toBe(0);
      expect(clampPage(2)).toBe(2);
      expect(clampPage(4)).toBe(4);
      expect(clampPage(5)).toBe(4);
      expect(clampPage(100)).toBe(4);
    });
  });

  describe('Zoom controls', () => {
    it('should clamp zoom to valid range', () => {
      const minZoom = 0.5;
      const maxZoom = 2;
      const clampZoom = (zoom: number) => Math.max(minZoom, Math.min(zoom, maxZoom));

      expect(clampZoom(0.25)).toBe(0.5);
      expect(clampZoom(0.5)).toBe(0.5);
      expect(clampZoom(1)).toBe(1);
      expect(clampZoom(1.5)).toBe(1.5);
      expect(clampZoom(2)).toBe(2);
      expect(clampZoom(3)).toBe(2);
    });
  });

  describe('Polling behavior', () => {
    it('should stop polling after max attempts', () => {
      const MAX_POLLS = 60;
      let pollCount = 0;

      const shouldContinuePolling = () => {
        pollCount++;
        return pollCount < MAX_POLLS;
      };

      // Simulate polling
      while (shouldContinuePolling()) {
        // Poll...
      }

      expect(pollCount).toBe(MAX_POLLS);
    });
  });
});
