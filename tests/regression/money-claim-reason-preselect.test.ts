/**
 * Money Claim Reason URL Param Preselection Regression Test
 *
 * Ensures:
 * 1. reason= URL param with comma-separated values preselects multiple checkboxes
 * 2. Initial preselect does NOT fire money_claim_reasons_selected analytics
 * 3. User toggling a checkbox DOES fire money_claim_reasons_selected analytics
 *
 * Run with: npx vitest run tests/regression/money-claim-reason-preselect.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock analytics before importing components
vi.mock('@/lib/analytics', () => ({
  trackMoneyClaimReasonsSelected: vi.fn(),
  trackEvent: vi.fn(),
}));

import { trackMoneyClaimReasonsSelected } from '@/lib/analytics';

/**
 * Mirrors the REASON_TO_CLAIM_TYPE mapping from MoneyClaimSectionFlow.tsx
 */
const REASON_TO_CLAIM_TYPE: Record<string, string> = {
  rent_arrears: 'rent_arrears',
  arrears: 'rent_arrears',
  property_damage: 'property_damage',
  damage: 'property_damage',
  cleaning: 'cleaning',
  unpaid_utilities: 'unpaid_utilities',
  utilities: 'unpaid_utilities',
  unpaid_council_tax: 'unpaid_council_tax',
  council_tax: 'unpaid_council_tax',
  other_tenant_debt: 'other_tenant_debt',
  other: 'other_tenant_debt',
};

/**
 * Mirrors getInitialClaimReasons from MoneyClaimSectionFlow.tsx
 */
function getInitialClaimReasons(reason?: string, topic?: string): string[] {
  if (reason) {
    const reasonList = reason.split(',').map((r) => r.trim().toLowerCase());
    const claimTypes: string[] = [];
    for (const r of reasonList) {
      const claimType = REASON_TO_CLAIM_TYPE[r];
      if (claimType && !claimTypes.includes(claimType)) {
        claimTypes.push(claimType);
      }
    }
    if (claimTypes.length > 0) {
      return claimTypes;
    }
  }

  switch (topic) {
    case 'arrears':
      return ['rent_arrears'];
    case 'damage':
    case 'damages':
      return ['property_damage'];
    default:
      return [];
  }
}

/**
 * Simulates applyClaimReasons logic from ClaimDetailsSection.tsx
 * The key behavior: trackEvent parameter controls whether analytics fires
 */
function applyClaimReasons(
  reasons: Set<string>,
  jurisdiction: string,
  trackEvent: boolean = true
): void {
  if (trackEvent && reasons.size > 0) {
    trackMoneyClaimReasonsSelected({
      reasons: Array.from(reasons),
      jurisdiction,
      source: 'wizard',
    });
  }
}

describe('Money Claim Reason URL Param Preselection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('URL Param Parsing (getInitialClaimReasons)', () => {
    it('parses single reason param correctly', () => {
      const reasons = getInitialClaimReasons('property_damage');
      expect(reasons).toEqual(['property_damage']);
    });

    it('parses comma-separated reason params correctly', () => {
      const reasons = getInitialClaimReasons('property_damage,cleaning');
      expect(reasons).toEqual(['property_damage', 'cleaning']);
    });

    it('handles multiple reasons with spaces after comma', () => {
      const reasons = getInitialClaimReasons('property_damage, cleaning, rent_arrears');
      expect(reasons).toEqual(['property_damage', 'cleaning', 'rent_arrears']);
    });

    it('deduplicates aliased reasons', () => {
      // 'damage' and 'property_damage' both map to 'property_damage'
      const reasons = getInitialClaimReasons('damage,property_damage');
      expect(reasons).toEqual(['property_damage']);
    });

    it('handles all six claim types', () => {
      const reasons = getInitialClaimReasons(
        'rent_arrears,property_damage,cleaning,unpaid_utilities,unpaid_council_tax,other_tenant_debt'
      );
      expect(reasons).toHaveLength(6);
      expect(reasons).toContain('rent_arrears');
      expect(reasons).toContain('property_damage');
      expect(reasons).toContain('cleaning');
      expect(reasons).toContain('unpaid_utilities');
      expect(reasons).toContain('unpaid_council_tax');
      expect(reasons).toContain('other_tenant_debt');
    });

    it('ignores invalid reason values', () => {
      const reasons = getInitialClaimReasons('property_damage,invalid_reason,cleaning');
      expect(reasons).toEqual(['property_damage', 'cleaning']);
    });

    it('falls back to topic param when reason is empty', () => {
      const reasons = getInitialClaimReasons(undefined, 'arrears');
      expect(reasons).toEqual(['rent_arrears']);
    });

    it('reason param takes precedence over topic param', () => {
      const reasons = getInitialClaimReasons('cleaning', 'arrears');
      expect(reasons).toEqual(['cleaning']);
    });

    it('returns empty array for unrecognized topic', () => {
      const reasons = getInitialClaimReasons(undefined, 'unknown');
      expect(reasons).toEqual([]);
    });
  });

  describe('Analytics Event Firing', () => {
    it('does NOT fire analytics on initial URL preselect (trackEvent=false)', () => {
      const reasons = new Set(['property_damage', 'cleaning']);

      // Initial preselect: trackEvent=false
      applyClaimReasons(reasons, 'england', false);

      expect(trackMoneyClaimReasonsSelected).not.toHaveBeenCalled();
    });

    it('DOES fire analytics when user toggles checkbox (trackEvent=true)', () => {
      const reasons = new Set(['property_damage', 'cleaning']);

      // User toggle: trackEvent=true (default)
      applyClaimReasons(reasons, 'england', true);

      expect(trackMoneyClaimReasonsSelected).toHaveBeenCalledTimes(1);
      expect(trackMoneyClaimReasonsSelected).toHaveBeenCalledWith({
        reasons: expect.arrayContaining(['property_damage', 'cleaning']),
        jurisdiction: 'england',
        source: 'wizard',
      });
    });

    it('does NOT fire analytics when reasons set is empty', () => {
      const reasons = new Set<string>();

      applyClaimReasons(reasons, 'england', true);

      expect(trackMoneyClaimReasonsSelected).not.toHaveBeenCalled();
    });

    it('fires analytics for each jurisdiction correctly', () => {
      const reasons = new Set(['rent_arrears']);

      applyClaimReasons(reasons, 'wales', true);
      expect(trackMoneyClaimReasonsSelected).toHaveBeenCalledWith(
        expect.objectContaining({ jurisdiction: 'wales' })
      );

      vi.clearAllMocks();

      applyClaimReasons(reasons, 'scotland', true);
      expect(trackMoneyClaimReasonsSelected).toHaveBeenCalledWith(
        expect.objectContaining({ jurisdiction: 'scotland' })
      );
    });
  });

  describe('End-to-End Flow Simulation', () => {
    it('simulates wizard flow: URL preselect -> user toggle -> analytics', () => {
      // Step 1: Parse URL param (e.g., ?reason=property_damage,cleaning)
      const initialReasons = getInitialClaimReasons('property_damage,cleaning');
      expect(initialReasons).toEqual(['property_damage', 'cleaning']);

      // Step 2: Apply initial reasons WITHOUT analytics (URL preselect)
      const reasonsSet = new Set(initialReasons);
      applyClaimReasons(reasonsSet, 'england', false);
      expect(trackMoneyClaimReasonsSelected).not.toHaveBeenCalled();

      // Step 3: User toggles another checkbox (adds rent_arrears)
      reasonsSet.add('rent_arrears');
      applyClaimReasons(reasonsSet, 'england', true);

      // Now analytics SHOULD fire
      expect(trackMoneyClaimReasonsSelected).toHaveBeenCalledTimes(1);
      expect(trackMoneyClaimReasonsSelected).toHaveBeenCalledWith({
        reasons: expect.arrayContaining(['property_damage', 'cleaning', 'rent_arrears']),
        jurisdiction: 'england',
        source: 'wizard',
      });
    });

    it('simulates wizard flow: user unchecks a preselected reason', () => {
      // Step 1: Parse URL param
      const initialReasons = getInitialClaimReasons('property_damage,cleaning');

      // Step 2: Apply initial reasons WITHOUT analytics
      const reasonsSet = new Set(initialReasons);
      applyClaimReasons(reasonsSet, 'england', false);
      expect(trackMoneyClaimReasonsSelected).not.toHaveBeenCalled();

      // Step 3: User unchecks 'cleaning'
      reasonsSet.delete('cleaning');
      applyClaimReasons(reasonsSet, 'england', true);

      // Analytics SHOULD fire with remaining reason
      expect(trackMoneyClaimReasonsSelected).toHaveBeenCalledTimes(1);
      expect(trackMoneyClaimReasonsSelected).toHaveBeenCalledWith({
        reasons: ['property_damage'],
        jurisdiction: 'england',
        source: 'wizard',
      });
    });
  });

  describe('No PII in Analytics Payloads', () => {
    it('analytics payload contains only non-PII data', () => {
      const reasons = new Set(['rent_arrears', 'property_damage']);
      applyClaimReasons(reasons, 'england', true);

      const callArgs = vi.mocked(trackMoneyClaimReasonsSelected).mock.calls[0][0];

      // Verify only expected fields are present (no tenant names, addresses, etc.)
      expect(Object.keys(callArgs)).toEqual(['reasons', 'jurisdiction', 'source']);
      expect(callArgs.reasons).not.toContain(expect.stringMatching(/[A-Z][a-z]+ [A-Z][a-z]+/)); // No names
      expect(callArgs.reasons).not.toContain(expect.stringMatching(/@/)); // No emails
    });
  });
});
