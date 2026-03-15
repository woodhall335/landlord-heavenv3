import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  generateStandardASTMock,
  generatePremiumASTMock,
  singleMock,
  uploadMock,
  createSignedUrlMock,
} = vi.hoisted(() => ({
  generateStandardASTMock: vi.fn(),
  generatePremiumASTMock: vi.fn(),
  singleMock: vi.fn(),
  uploadMock: vi.fn(),
  createSignedUrlMock: vi.fn(),
}));

vi.mock('@/lib/documents/ast-generator', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents/ast-generator')>(
    '@/lib/documents/ast-generator'
  );
  return {
    ...actual,
    generateStandardAST: generateStandardASTMock,
    generatePremiumAST: generatePremiumASTMock,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: singleMock,
        }),
      }),
    }),
    storage: {
      from: () => ({
        upload: uploadMock,
        createSignedUrl: createSignedUrlMock,
      }),
    },
  }),
}));

import { clearAllPreviewCaches, generateTenancyPreview } from '../preview-generator';

describe('generateTenancyPreview', () => {
  beforeEach(() => {
    clearAllPreviewCaches();
    vi.clearAllMocks();

    uploadMock.mockResolvedValue({ error: null });
    createSignedUrlMock.mockResolvedValue({
      data: { signedUrl: 'https://example.com/preview/page-0.jpg' },
      error: null,
    });
  });

  it('uses the standard tenancy generator for standard previews', async () => {
    singleMock.mockResolvedValue({
      data: {
        id: 'case-standard',
        jurisdiction: 'england',
        property_location: null,
        collected_facts: {
          __meta: { jurisdiction: 'england' },
          landlord_full_name: 'Preview Landlord',
          landlord_address_line1: '1 Preview Street',
          landlord_address_town: 'London',
          landlord_address_postcode: 'SW1A 1AA',
          landlord_email: 'preview@example.com',
          landlord_phone: '07000000000',
          property_address_line1: '2 Test Road',
          property_address_town: 'London',
          property_address_postcode: 'E1 1AA',
          tenancy_start_date: '2026-05-02',
          rent_amount: 1500,
          deposit_amount: 1500,
          tenants: [
            {
              full_name: 'Tenant Preview',
              email: 'tenant@example.com',
              phone: '07000000001',
            },
          ],
        },
      },
      error: null,
    });
    generateStandardASTMock.mockResolvedValue({
      html: '<html><body>Residential Tenancy Agreement</body></html>',
      pdf: Buffer.from('pdf'),
    });

    const manifest = await generateTenancyPreview({
      caseId: 'case-standard',
      product: 'ast_standard',
      tier: 'standard',
    });

    expect(generateStandardASTMock).toHaveBeenCalledTimes(1);
    expect(generatePremiumASTMock).not.toHaveBeenCalled();
    expect(generateStandardASTMock.mock.calls[0][0]).toMatchObject({
      jurisdiction: 'england',
      tenancy_start_date: '2026-05-02',
    });
    expect(manifest.status).toBe('ready');
    expect(manifest.jurisdiction).toBe('england');
    expect(manifest.pageCount).toBe(1);
  });

  it('uses the premium tenancy generator for premium previews', async () => {
    singleMock.mockResolvedValue({
      data: {
        id: 'case-premium',
        jurisdiction: 'wales',
        property_location: null,
        collected_facts: {
          __meta: { jurisdiction: 'wales' },
          landlord_full_name: 'Preview Landlord',
          landlord_address_line1: '1 Preview Street',
          landlord_address_town: 'Cardiff',
          landlord_address_postcode: 'CF10 1AA',
          landlord_email: 'preview@example.com',
          landlord_phone: '07000000000',
          property_address_line1: '2 Test Road',
          property_address_town: 'Cardiff',
          property_address_postcode: 'CF10 2AA',
          tenancy_start_date: '2026-04-01',
          rent_amount: 1800,
          deposit_amount: 1800,
          is_hmo: true,
          number_of_sharers: 4,
          tenants: [
            {
              full_name: 'Tenant Preview',
              email: 'tenant@example.com',
              phone: '07000000001',
            },
            {
              full_name: 'Tenant Two',
              email: 'tenant2@example.com',
              phone: '07000000002',
            },
          ],
        },
      },
      error: null,
    });
    generatePremiumASTMock.mockResolvedValue({
      html: '<html><body>Premium Occupation Contract</body></html>',
      pdf: Buffer.from('pdf'),
    });

    const manifest = await generateTenancyPreview({
      caseId: 'case-premium',
      product: 'occupation_premium',
      tier: 'premium',
    });

    expect(generatePremiumASTMock).toHaveBeenCalledTimes(1);
    expect(generateStandardASTMock).not.toHaveBeenCalled();
    expect(generatePremiumASTMock.mock.calls[0][0]).toMatchObject({
      jurisdiction: 'wales',
      joint_and_several_liability: true,
    });
    expect(manifest.status).toBe('ready');
    expect(manifest.jurisdiction).toBe('wales');
  });
});
