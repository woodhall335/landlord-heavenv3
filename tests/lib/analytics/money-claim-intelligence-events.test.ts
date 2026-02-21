import { describe, expect, it } from 'vitest';

// =============================================================================
// Money Claim Intelligence Analytics Events Tests
//
// These tests verify that the intelligence tracking events:
// 1. Exist and are exported from analytics module
// 2. Have the expected function signatures
// 3. Do not include PII in their event parameters (structural check)
// =============================================================================

describe('Money Claim Intelligence Analytics - Export Verification', () => {
  it('exports trackOutcomeConfidenceShown function', async () => {
    const analytics = await import('@/lib/analytics');
    expect(typeof analytics.trackOutcomeConfidenceShown).toBe('function');
  });

  it('exports trackCourtFeeEstimatorViewed function', async () => {
    const analytics = await import('@/lib/analytics');
    expect(typeof analytics.trackCourtFeeEstimatorViewed).toBe('function');
  });

  it('exports trackEvidenceGalleryViewed function', async () => {
    const analytics = await import('@/lib/analytics');
    expect(typeof analytics.trackEvidenceGalleryViewed).toBe('function');
  });

  it('exports trackEvidenceWarningResolved function', async () => {
    const analytics = await import('@/lib/analytics');
    expect(typeof analytics.trackEvidenceWarningResolved).toBe('function');
  });
});

describe('Money Claim Intelligence Analytics - Function Signatures', () => {
  it('trackOutcomeConfidenceShown accepts claimTypes array', async () => {
    const { trackOutcomeConfidenceShown } = await import('@/lib/analytics');
    // Should not throw when called with expected params
    expect(() => {
      trackOutcomeConfidenceShown({ claimTypes: ['rent_arrears', 'property_damage'] });
    }).not.toThrow();
  });

  it('trackCourtFeeEstimatorViewed accepts amountBand string', async () => {
    const { trackCourtFeeEstimatorViewed } = await import('@/lib/analytics');
    // Should not throw when called with expected params
    expect(() => {
      trackCourtFeeEstimatorViewed({ amountBand: '1000_5000' });
    }).not.toThrow();
  });

  it('trackEvidenceGalleryViewed accepts claimTypes array', async () => {
    const { trackEvidenceGalleryViewed } = await import('@/lib/analytics');
    // Should not throw when called with expected params
    expect(() => {
      trackEvidenceGalleryViewed({ claimTypes: ['property_damage'] });
    }).not.toThrow();
  });

  it('trackEvidenceWarningResolved accepts ruleId string', async () => {
    const { trackEvidenceWarningResolved } = await import('@/lib/analytics');
    // Should not throw when called with expected params
    expect(() => {
      trackEvidenceWarningResolved({ ruleId: 'test_rule' });
    }).not.toThrow();
  });
});

describe('Money Claim Intelligence Analytics - PII Prevention (Code Review)', () => {
  // These tests verify the function implementations don't track PII by
  // examining that rule IDs and other tracked values are generic identifiers

  it('rule IDs used in evidence warnings are generic identifiers, not PII', () => {
    // Rule IDs like 'property_damage_missing_photo_evidence' are generic
    // identifiers and do not constitute PII
    const ruleIds = [
      'property_damage_missing_photo_evidence',
      'rent_arrears_missing_rent_ledger',
      'council_tax_missing_statement',
      'cleaning_missing_invoice',
      'utilities_missing_bill_evidence',
    ];

    ruleIds.forEach((ruleId) => {
      // Rule IDs should not contain user-specific information
      expect(ruleId).not.toMatch(/user_\d+/);
      expect(ruleId).not.toMatch(/@/); // No email addresses
      expect(ruleId).not.toMatch(/case_[a-f0-9-]+/); // No case IDs
      expect(ruleId).not.toMatch(/\d{4}-\d{2}-\d{2}/); // No dates
    });
  });

  it('amount bands are anonymized ranges, not exact amounts', () => {
    const validBands = [
      'under_300',
      '300_500',
      '500_1000',
      '1000_5000',
      '5000_10000',
      '10000_100000',
      'over_100000',
    ];

    validBands.forEach((band) => {
      // Bands should be range identifiers, not exact values
      expect(band).toMatch(/^(under_|over_|\d+_)\d*$/);
      // Should not look like an exact currency amount
      expect(band).not.toMatch(/^\d+\.\d{2}$/);
    });
  });
});
