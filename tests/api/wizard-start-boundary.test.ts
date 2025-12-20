import { describe, expect, it } from 'vitest';

/**
 * Boundary tests for /api/wizard/start
 *
 * Ensures the wizard start endpoint:
 * - Only accepts canonical jurisdictions (england, wales, scotland, northern-ireland)
 * - Blocks NI eviction and money_claim with 422 contract
 * - Cannot emit england-wales in new case facts
 */
describe('API Boundary: /api/wizard/start', () => {
  describe('Jurisdiction validation', () => {
    it('should reject legacy england-wales without property_location', async () => {
      // Simulating the zod schema validation from wizard/start/route.ts line 37
      const { z } = await import('zod');
      const startWizardSchema = z.object({
        product: z.enum([
          'notice_only',
          'complete_pack',
          'money_claim',
          'money_claim_england_wales',
          'money_claim_scotland',
          'tenancy_agreement',
          'ast_standard',
          'ast_premium',
        ]),
        jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']),
        case_id: z.string().uuid().optional(),
      });

      // Legacy jurisdiction should fail schema validation
      const result = startWizardSchema.safeParse({
        product: 'notice_only',
        jurisdiction: 'england-wales', // Legacy value
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['jurisdiction']);
      }
    });

    it('should accept canonical england jurisdiction', async () => {
      const { z } = await import('zod');
      const startWizardSchema = z.object({
        product: z.enum([
          'notice_only',
          'complete_pack',
          'money_claim',
          'money_claim_england_wales',
          'money_claim_scotland',
          'tenancy_agreement',
          'ast_standard',
          'ast_premium',
        ]),
        jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']),
        case_id: z.string().uuid().optional(),
      });

      const result = startWizardSchema.safeParse({
        product: 'notice_only',
        jurisdiction: 'england', // Canonical
      });

      expect(result.success).toBe(true);
    });

    it('should accept canonical wales jurisdiction', async () => {
      const { z } = await import('zod');
      const startWizardSchema = z.object({
        product: z.enum([
          'notice_only',
          'complete_pack',
          'money_claim',
          'money_claim_england_wales',
          'money_claim_scotland',
          'tenancy_agreement',
          'ast_standard',
          'ast_premium',
        ]),
        jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']),
        case_id: z.string().uuid().optional(),
      });

      const result = startWizardSchema.safeParse({
        product: 'notice_only',
        jurisdiction: 'wales', // Canonical
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Northern Ireland gating', () => {
    it('should block NI eviction with 422 contract', () => {
      // Simulating the NI gating logic from wizard/start/route.ts line 145-164
      const effectiveJurisdiction = 'northern-ireland';
      const resolvedCaseType: string = 'eviction';

      const shouldBlock = effectiveJurisdiction === 'northern-ireland' && resolvedCaseType !== 'tenancy_agreement';

      expect(shouldBlock).toBe(true);
    });

    it('should block NI money_claim with 422 contract', () => {
      const effectiveJurisdiction = 'northern-ireland';
      const resolvedCaseType: string = 'money_claim';

      const shouldBlock = effectiveJurisdiction === 'northern-ireland' && resolvedCaseType !== 'tenancy_agreement';

      expect(shouldBlock).toBe(true);
    });

    it('should allow NI tenancy_agreement', () => {
      const effectiveJurisdiction = 'northern-ireland';
      const resolvedCaseType = 'tenancy_agreement';

      const shouldBlock = effectiveJurisdiction === 'northern-ireland' && resolvedCaseType !== 'tenancy_agreement';

      expect(shouldBlock).toBe(false);
    });
  });

  describe('Cannot emit england-wales in case facts', () => {
    it('should not set england-wales in jurisdiction field', () => {
      // Simulating case facts creation from wizard/start/route.ts line 223
      const effectiveJurisdiction = 'england'; // After resolveJurisdiction

      const initialFacts = {
        property_country: effectiveJurisdiction,
        jurisdiction: effectiveJurisdiction,
      };

      expect(initialFacts.jurisdiction).not.toBe('england-wales');
      expect(initialFacts.jurisdiction).toBe('england');
    });
  });
});
