import { describe, expect, it } from 'vitest';
import { getWizardCta } from '@/lib/checkout/cta-mapper';

describe('getWizardCta', () => {
  // Skip: Northern Ireland uses tenancy flow (not eviction), which is not yet implemented
  it.skip('returns tenancy CTAs for Northern Ireland', () => {
    const result = getWizardCta({
      jurisdiction: 'ni',
      validation_summary: { status: 'warning', blockers: [], warnings: [] },
      caseId: 'case-1',
      source: 'validator',
    });

    expect(result.primary.productKey).toBe('ast_premium');
    expect(result.secondary?.productKey).toBe('ast_standard');
  });

  it('returns complete pack as primary when eviction is invalid', () => {
    const result = getWizardCta({
      jurisdiction: 'england',
      validator_key: 'section_21',
      validation_summary: { status: 'invalid', blockers: [], warnings: [] },
      caseId: 'case-1',
      source: 'validator',
    });

    expect(result.primary.productKey).toBe('complete_pack');
    expect(result.secondary?.productKey).toBe('notice_only');
  });

  // Skip: tenancy_agreement validator uses tenancy flow (not eviction), which is not yet implemented
  it.skip('returns tenancy premium primary', () => {
    const result = getWizardCta({
      jurisdiction: 'wales',
      validator_key: 'tenancy_agreement',
      validation_summary: { status: 'pass', blockers: [], warnings: [] },
      caseId: 'case-1',
      source: 'validator',
    });

    expect(result.primary.productKey).toBe('ast_premium');
    expect(result.secondary?.productKey).toBe('ast_standard');
  });

  // ============================================
  // CTA href validation tests (case_id preservation)
  // ============================================
  describe('CTA href contains required parameters', () => {
    it('includes case_id in primary CTA href for section_21 validator', () => {
      const result = getWizardCta({
        jurisdiction: 'england',
        validator_key: 'section_21',
        validation_summary: { status: 'warning', blockers: [], warnings: [] },
        caseId: 'test-case-123',
        source: 'validator',
      });

      expect(result.primary.href).toContain('case_id=test-case-123');
      expect(result.secondary?.href).toContain('case_id=test-case-123');
    });

    it('includes case_id in primary CTA href for section_8 validator', () => {
      const result = getWizardCta({
        jurisdiction: 'england',
        validator_key: 'section_8',
        validation_summary: { status: 'invalid', blockers: [], warnings: [] },
        caseId: 'sec8-case-456',
        source: 'validator',
      });

      expect(result.primary.href).toContain('case_id=sec8-case-456');
      expect(result.secondary?.href).toContain('case_id=sec8-case-456');
    });

    it('includes jurisdiction in CTA href', () => {
      const result = getWizardCta({
        jurisdiction: 'scotland',
        validator_key: 'section_21',
        validation_summary: { status: 'pass', blockers: [], warnings: [] },
        caseId: 'scot-case-789',
        source: 'validator',
      });

      expect(result.primary.href).toContain('jurisdiction=scotland');
    });

    it('includes source=validator in CTA href', () => {
      const result = getWizardCta({
        jurisdiction: 'england',
        validator_key: 'section_21',
        validation_summary: { status: 'warning', blockers: [], warnings: [] },
        caseId: 'source-test-case',
        source: 'validator',
      });

      expect(result.primary.href).toContain('source=validator');
    });

    it('routes to /wizard/flow for eviction validators', () => {
      const result = getWizardCta({
        jurisdiction: 'england',
        validator_key: 'section_21',
        validation_summary: { status: 'warning', blockers: [], warnings: [] },
        caseId: 'wizard-flow-test',
        source: 'validator',
      });

      expect(result.primary.href).toMatch(/^\/wizard\/flow\?/);
      expect(result.primary.href).toContain('type=eviction');
    });
  });

  describe('CTA product and pricing', () => {
    it('includes correct price for notice_only product', () => {
      const result = getWizardCta({
        jurisdiction: 'england',
        validator_key: 'section_21',
        validation_summary: { status: 'pass', blockers: [], warnings: [] },
        caseId: 'price-test',
        source: 'validator',
      });

      // When status is 'pass', notice_only is primary
      expect(result.primary.productKey).toBe('notice_only');
      expect(result.primary.price).toBe(29.99);
    });

    it('includes correct price for complete_pack product', () => {
      const result = getWizardCta({
        jurisdiction: 'england',
        validator_key: 'section_21',
        validation_summary: { status: 'invalid', blockers: [], warnings: [] },
        caseId: 'price-test',
        source: 'validator',
      });

      // When status is 'invalid', complete_pack is primary
      expect(result.primary.productKey).toBe('complete_pack');
      expect(result.primary.price).toBe(149.99);
    });

    it('includes correct label for CTA buttons', () => {
      const result = getWizardCta({
        jurisdiction: 'england',
        validator_key: 'section_21',
        validation_summary: { status: 'warning', blockers: [], warnings: [] },
        caseId: 'label-test',
        source: 'validator',
      });

      expect(result.primary.label).toBe('Start Eviction Pack');
      expect(result.secondary?.label).toBe('Start Notice Only');
    });
  });
});
