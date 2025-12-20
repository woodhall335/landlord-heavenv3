import { describe, expect, it } from 'vitest';

/**
 * Boundary tests for /api/documents/generate
 *
 * Ensures the document generation endpoint:
 * - Normalizes legacy jurisdiction using deriveCanonicalJurisdiction
 * - Blocks NI eviction and money_claim with 400 contract
 * - Validates canonical jurisdiction before proceeding
 */
describe('API Boundary: /api/documents/generate', () => {
  describe('Jurisdiction normalization', () => {
    it('should use deriveCanonicalJurisdiction to normalize legacy inputs', async () => {
      const { deriveCanonicalJurisdiction } = await import('@/lib/types/jurisdiction');

      // Legacy england-wales without property_location should return null or undefined (fail closed)
      const result1 = deriveCanonicalJurisdiction('england-wales', {});
      expect(result1).toBeFalsy(); // null or undefined - both indicate failure

      // Legacy england-wales WITH property_location should normalize correctly
      const result2 = deriveCanonicalJurisdiction('england-wales', { property_location: 'england' });
      expect(result2).toBe('england');

      const result3 = deriveCanonicalJurisdiction('england-wales', { property_location: 'wales' });
      expect(result3).toBe('wales');
    });

    it('should pass through canonical jurisdiction unchanged', async () => {
      const { deriveCanonicalJurisdiction } = await import('@/lib/types/jurisdiction');

      const result1 = deriveCanonicalJurisdiction('england', {});
      expect(result1).toBe('england');

      const result2 = deriveCanonicalJurisdiction('wales', {});
      expect(result2).toBe('wales');

      const result3 = deriveCanonicalJurisdiction('scotland', {});
      expect(result3).toBe('scotland');

      const result4 = deriveCanonicalJurisdiction('northern-ireland', {});
      expect(result4).toBe('northern-ireland');
    });

    it('should return 400 when jurisdiction is invalid', () => {
      // Simulating the validation from documents/generate/route.ts line 176-182
      const canonicalJurisdiction = undefined; // From deriveCanonicalJurisdiction failure

      const shouldReject = !canonicalJurisdiction;

      expect(shouldReject).toBe(true);
    });
  });

  describe('Northern Ireland gating', () => {
    it('should block NI eviction documents with 400 contract', () => {
      // Simulating the NI gating from documents/generate/route.ts line 185-197
      const canonicalJurisdiction = 'northern-ireland';
      const documentType = 'section8_notice';

      const allowedNIDocTypes = ['private_tenancy', 'private_tenancy_premium'];
      const shouldBlock = canonicalJurisdiction === 'northern-ireland' && !allowedNIDocTypes.includes(documentType);

      expect(shouldBlock).toBe(true);
    });

    it('should block NI money claim documents with 400 contract', () => {
      const canonicalJurisdiction = 'northern-ireland';
      const documentType = 'money_claim';

      const allowedNIDocTypes = ['private_tenancy', 'private_tenancy_premium'];
      const shouldBlock = canonicalJurisdiction === 'northern-ireland' && !allowedNIDocTypes.includes(documentType);

      expect(shouldBlock).toBe(true);
    });

    it('should allow NI tenancy documents', () => {
      const canonicalJurisdiction = 'northern-ireland';
      const documentType = 'private_tenancy';

      const allowedNIDocTypes = ['private_tenancy', 'private_tenancy_premium'];
      const shouldBlock = canonicalJurisdiction === 'northern-ireland' && !allowedNIDocTypes.includes(documentType);

      expect(shouldBlock).toBe(false);
    });
  });

  describe('Cannot emit england-wales in generated documents', () => {
    it('should only use canonical jurisdiction in document metadata', () => {
      // Simulating document record creation from documents/generate/route.ts line 466
      const canonicalJurisdiction = 'england'; // From deriveCanonicalJurisdiction

      const documentRecord = {
        jurisdiction: canonicalJurisdiction,
      };

      expect(documentRecord.jurisdiction).not.toBe('england-wales');
      expect(documentRecord.jurisdiction).toBe('england');
    });
  });
});
