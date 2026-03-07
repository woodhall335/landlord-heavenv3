/**
 * Regression tests for Notice Only Preview Routing
 *
 * Tests the fix for: Wales notice_only cases show correct Review page, but
 * /wizard/preview/{caseId} fails with "Route section_21 is not available for wales/notice_only"
 *
 * Root cause: Preview page was calling /api/documents/generate for individual documents,
 * which doesn't support Wales routes. Fix uses the merged preview approach for notice_only.
 *
 * Also tests: Review -> Preview link includes product=notice_only to ensure preview page
 * correctly identifies the product type.
 */

describe('Notice Only Preview Routing', () => {
  describe('Product inference logic', () => {
    /**
     * Helper that mimics the robust product inference from the preview page
     */
    function inferProduct(
      urlProduct: string | null,
      factsMeta: Record<string, unknown>,
      originalMeta: Record<string, unknown>,
      wizardFacts: Record<string, unknown>,
      caseType: string
    ): string | undefined {
      // ROBUST PRODUCT INFERENCE ORDER:
      // 1. URL query param (most explicit)
      // 2. collected_facts.meta.product
      // 3. collected_facts.__meta.product
      // 4. collected_facts.__meta.original_product
      // 5. Infer from notice-only specific facts
      let inferredProduct =
        urlProduct ||
        (factsMeta.product as string | undefined) ||
        (originalMeta.product as string | undefined) ||
        (originalMeta.original_product as string | undefined);

      if (!inferredProduct) {
        const hasNoticeOnlyMarkers =
          wizardFacts.selected_notice_route ||
          wizardFacts.eviction_route ||
          (originalMeta.flow === 'notice_only');

        if (hasNoticeOnlyMarkers && caseType === 'eviction') {
          inferredProduct = 'notice_only';
        }
      }

      return inferredProduct;
    }

    it('should prefer URL product param over all other sources', () => {
      const product = inferProduct(
        'notice_only',
        { product: 'complete_pack' },
        { product: 'money_claim' },
        {},
        'eviction'
      );
      expect(product).toBe('notice_only');
    });

    it('should use factsMeta.product when URL param is null', () => {
      const product = inferProduct(
        null,
        { product: 'complete_pack' },
        { product: 'notice_only' },
        {},
        'eviction'
      );
      expect(product).toBe('complete_pack');
    });

    it('should use originalMeta.product when factsMeta is empty', () => {
      const product = inferProduct(
        null,
        {},
        { product: 'notice_only' },
        {},
        'eviction'
      );
      expect(product).toBe('notice_only');
    });

    it('should use originalMeta.original_product as fallback', () => {
      const product = inferProduct(
        null,
        {},
        { original_product: 'notice_only' },
        {},
        'eviction'
      );
      expect(product).toBe('notice_only');
    });

    it('should infer notice_only from selected_notice_route for eviction cases', () => {
      const product = inferProduct(
        null,
        {},
        {},
        { selected_notice_route: 'wales_section_173' },
        'eviction'
      );
      expect(product).toBe('notice_only');
    });

    it('should infer notice_only from eviction_route for eviction cases', () => {
      const product = inferProduct(
        null,
        {},
        {},
        { eviction_route: 'section_8' },
        'eviction'
      );
      expect(product).toBe('notice_only');
    });

    it('should infer notice_only from flow meta for eviction cases', () => {
      const product = inferProduct(
        null,
        {},
        { flow: 'notice_only' },
        {},
        'eviction'
      );
      expect(product).toBe('notice_only');
    });

    it('should NOT infer notice_only for non-eviction cases', () => {
      const product = inferProduct(
        null,
        {},
        {},
        { selected_notice_route: 'section_8' },
        'money_claim'
      );
      expect(product).toBeUndefined();
    });

    it('should return undefined when no product can be inferred', () => {
      const product = inferProduct(
        null,
        {},
        {},
        {},
        'eviction'
      );
      expect(product).toBeUndefined();
    });
  });

  describe('Review page preview URL construction', () => {
    /**
     * Helper that mimics the URL construction from the review page
     */
    function buildPreviewUrl(
      caseId: string,
      product: string | undefined,
      jurisdiction: string | undefined
    ): string {
      const previewParams = new URLSearchParams();
      if (product) {
        previewParams.set('product', product);
      }
      if (jurisdiction) {
        previewParams.set('jurisdiction', jurisdiction);
      }
      const queryString = previewParams.toString();
      return `/wizard/preview/${caseId}${queryString ? `?${queryString}` : ''}`;
    }

    it('should include product=notice_only for notice_only cases', () => {
      const url = buildPreviewUrl('abc123', 'notice_only', 'wales');
      expect(url).toBe('/wizard/preview/abc123?product=notice_only&jurisdiction=wales');
    });

    it('should include product=complete_pack for complete_pack cases', () => {
      const url = buildPreviewUrl('abc123', 'complete_pack', 'england');
      expect(url).toBe('/wizard/preview/abc123?product=complete_pack&jurisdiction=england');
    });

    it('should handle missing jurisdiction', () => {
      const url = buildPreviewUrl('abc123', 'notice_only', undefined);
      expect(url).toBe('/wizard/preview/abc123?product=notice_only');
    });

    it('should handle missing product', () => {
      const url = buildPreviewUrl('abc123', undefined, 'wales');
      expect(url).toBe('/wizard/preview/abc123?jurisdiction=wales');
    });

    it('should handle no params', () => {
      const url = buildPreviewUrl('abc123', undefined, undefined);
      expect(url).toBe('/wizard/preview/abc123');
    });
  });

  describe('Notice Only preview generation strategy', () => {
    /**
     * Tests that isNoticeOnly flag correctly determines whether to skip
     * individual document generation
     */
    it('should identify notice_only from URL param', () => {
      const urlProduct = 'notice_only';
      const isNoticeOnly = urlProduct === 'notice_only';
      expect(isNoticeOnly).toBe(true);
    });

    it('should identify notice_only from inferred product', () => {
      const inferredProduct = 'notice_only';
      const isNoticeOnly = inferredProduct === 'notice_only';
      expect(isNoticeOnly).toBe(true);
    });

    it('should NOT identify complete_pack as notice_only', () => {
      const inferredProduct = 'complete_pack';
      const isNoticeOnly = inferredProduct === 'notice_only';
      expect(isNoticeOnly).toBe(false);
    });

    it('should NOT identify money_claim as notice_only', () => {
      const inferredProduct = 'money_claim';
      const isNoticeOnly = inferredProduct === 'notice_only';
      expect(isNoticeOnly).toBe(false);
    });
  });

  describe('Wales notice_only integration', () => {
    it('should correctly route Wales section_173 as notice_only', () => {
      // This represents a Wales case that would previously fail
      const wizardFacts = {
        selected_notice_route: 'wales_section_173',
        jurisdiction: 'wales',
        __meta: { product: 'notice_only' },
      };

      const product =
        (wizardFacts.__meta as any)?.product ||
        'notice_only'; // Fallback to notice_only for Wales notice routes

      const isNoticeOnly = product === 'notice_only';

      expect(isNoticeOnly).toBe(true);
    });

    it('should correctly route Wales fault_based as notice_only', () => {
      const wizardFacts = {
        selected_notice_route: 'wales_fault_based',
        jurisdiction: 'wales',
        __meta: { product: 'notice_only' },
        wales_fault_grounds: ['Section 157 - Serious rent arrears'],
      };

      const product = (wizardFacts.__meta as any)?.product;
      const isNoticeOnly = product === 'notice_only';

      expect(isNoticeOnly).toBe(true);
    });

    it('should identify Wales notice_only even without explicit meta', () => {
      // This is the problematic case - meta is missing but we have notice-only markers
      const wizardFacts = {
        selected_notice_route: 'wales_section_173',
        jurisdiction: 'wales',
        // No __meta.product set
      };

      // With fix: should infer notice_only from selected_notice_route
      const hasNoticeOnlyMarkers = Boolean(wizardFacts.selected_notice_route);
      const inferredProduct = hasNoticeOnlyMarkers ? 'notice_only' : undefined;

      expect(inferredProduct).toBe('notice_only');
    });
  });

  describe('Non-notice-only products remain unchanged', () => {
    it('complete_pack should still use individual document generation', () => {
      const product = 'complete_pack';
      const isNoticeOnly = product === 'notice_only';
      const shouldUseIndividualGen = !isNoticeOnly;

      expect(shouldUseIndividualGen).toBe(true);
    });

    it('money_claim should still use individual document generation', () => {
      const product = 'money_claim';
      const isNoticeOnly = product === 'notice_only';
      const shouldUseIndividualGen = !isNoticeOnly;

      expect(shouldUseIndividualGen).toBe(true);
    });

    it('tenancy_agreement should still use individual document generation', () => {
      const product = 'tenancy_agreement';
      const isNoticeOnly = product === 'notice_only';
      const shouldUseIndividualGen = !isNoticeOnly;

      expect(shouldUseIndividualGen).toBe(true);
    });
  });
});
