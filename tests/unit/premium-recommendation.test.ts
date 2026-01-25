/**
 * Tests for Premium Tenancy Agreement Recommendation Logic
 *
 * Verifies:
 * 1. Premium recommendation appears when HMO/multi-tenant signals detected
 * 2. No recommendation for simple single-tenant cases
 * 3. Correct strength assignment (strong vs moderate)
 * 4. Jurisdiction-specific legal references
 */

import {
  detectPremiumRecommendation,
  getPremiumFeatures,
  isStrongRecommendationReason,
  type PremiumRecommendationResult,
} from '@/lib/utils/premium-recommendation';

describe('detectPremiumRecommendation', () => {
  // ==========================================================================
  // STRONG RECOMMENDATION CASES
  // ==========================================================================

  describe('strong recommendation cases', () => {
    it('should strongly recommend Premium when property is explicitly marked as HMO', () => {
      const facts = { is_hmo: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.reasons).toContain('hmo_property');
      expect(result.legalReference).toBe('Housing Act 2004');
    });

    it('should strongly recommend Premium when property is HMO licensed', () => {
      const facts = { hmo_licence_status: 'Currently licensed' };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.reasons).toContain('hmo_licensed');
    });

    it('should strongly recommend Premium for 3+ tenants', () => {
      const facts = { number_of_tenants: 3 };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.reasons).toContain('multiple_tenants');
    });

    it('should strongly recommend Premium for 3+ unrelated tenants', () => {
      const facts = { number_of_tenants: 3, unrelated_tenants: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.reasons).toContain('multiple_tenants');
      expect(result.reasons).toContain('unrelated_tenants');
    });

    it('should strongly recommend Premium for room-by-room lets', () => {
      const facts = { room_by_room_let: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.reasons).toContain('room_by_room_let');
    });

    it('should strongly recommend Premium when tenants array has 3+ entries', () => {
      const facts = {
        tenants: [
          { full_name: 'Tenant 1' },
          { full_name: 'Tenant 2' },
          { full_name: 'Tenant 3' },
        ],
      };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.reasons).toContain('multiple_tenants');
    });
  });

  // ==========================================================================
  // MODERATE RECOMMENDATION CASES
  // ==========================================================================

  describe('moderate recommendation cases', () => {
    it('should moderately recommend Premium for student lets', () => {
      const facts = { is_student_let: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('moderate');
      expect(result.reasons).toContain('student_let');
    });

    it('should moderately recommend Premium when tenant_type is students', () => {
      const facts = { tenant_type: 'students' };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('moderate');
      expect(result.reasons).toContain('student_let');
    });

    it('should moderately recommend Premium when guarantor is required', () => {
      const facts = { guarantor_required: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('moderate');
      expect(result.reasons).toContain('guarantor_needed');
    });

    it('should moderately recommend Premium when rent review is needed', () => {
      const facts = { rent_increase_clause: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('moderate');
      expect(result.reasons).toContain('rent_review_needed');
    });

    it('should moderately recommend Premium for separate rent payments', () => {
      const facts = { separate_rent_payments: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('moderate');
      expect(result.reasons).toContain('separate_rent_payments');
    });

    it('should moderately recommend Premium for 2+ tenants with shared facilities', () => {
      const facts = { number_of_tenants: 2, shared_facilities: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('moderate');
      expect(result.reasons).toContain('shared_facilities');
    });

    it('should become strong with 3+ moderate indicators', () => {
      const facts = {
        is_student_let: true,
        guarantor_required: true,
        rent_increase_clause: true,
      };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.reasons.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ==========================================================================
  // NO RECOMMENDATION CASES
  // ==========================================================================

  describe('no recommendation cases', () => {
    it('should NOT recommend Premium for single tenant', () => {
      const facts = { number_of_tenants: 1 };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(false);
      expect(result.strength).toBe('none');
      expect(result.reasons).toHaveLength(0);
    });

    it('should NOT recommend Premium for empty facts', () => {
      const facts = {};
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(false);
      expect(result.strength).toBe('none');
    });

    it('should NOT recommend Premium for 2 related tenants without shared facilities', () => {
      const facts = { number_of_tenants: 2, tenants_related: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(false);
      expect(result.strength).toBe('none');
    });

    it('should NOT recommend Premium for standard family let', () => {
      const facts = {
        number_of_tenants: 2,
        tenant_type: 'Family',
        tenants_related: true,
      };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.isRecommended).toBe(false);
      expect(result.strength).toBe('none');
    });
  });

  // ==========================================================================
  // JURISDICTION-SPECIFIC TESTS
  // ==========================================================================

  describe('jurisdiction-specific behavior', () => {
    it('should use Housing Act 2004 reference for England HMO', () => {
      const facts = { is_hmo: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.legalReference).toBe('Housing Act 2004');
      expect(result.rationale).toContain('Housing Act 2004');
    });

    it('should use Housing (Wales) Act 2014 reference for Wales HMO', () => {
      const facts = { is_hmo: true };
      const result = detectPremiumRecommendation(facts, 'wales');

      expect(result.legalReference).toBe('Housing (Wales) Act 2014');
      expect(result.rationale).toContain('Housing (Wales) Act 2014');
    });

    it('should use Civic Government (Scotland) Act 1982 for Scotland HMO', () => {
      const facts = { is_hmo: true };
      const result = detectPremiumRecommendation(facts, 'scotland');

      expect(result.legalReference).toBe('Civic Government (Scotland) Act 1982');
      expect(result.rationale).toContain('Civic Government (Scotland) Act 1982');
    });

    it('should use Housing (NI) Order 1992 for Northern Ireland HMO', () => {
      const facts = { is_hmo: true };
      const result = detectPremiumRecommendation(facts, 'northern-ireland');

      expect(result.legalReference).toBe('Housing (NI) Order 1992');
    });
  });

  // ==========================================================================
  // MESSAGE GENERATION TESTS
  // ==========================================================================

  describe('message generation', () => {
    it('should generate HMO-specific message for HMO properties', () => {
      const facts = { is_hmo: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.message).toContain('HMO');
      expect(result.message).toContain('strongly recommended');
    });

    it('should generate multi-tenant message for 3+ unrelated tenants', () => {
      const facts = { number_of_tenants: 3, unrelated_tenants: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.message).toContain('3+ unrelated tenants');
    });

    it('should generate room-by-room message for room lets', () => {
      const facts = { room_by_room_let: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.message).toContain('Room-by-room');
    });

    it('should generate student-specific message for student lets', () => {
      const facts = { is_student_let: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.message).toContain('student');
    });

    it('should return empty message when not recommended', () => {
      const facts = { number_of_tenants: 1 };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.message).toBe('');
    });
  });

  // ==========================================================================
  // RATIONALE GENERATION TESTS
  // ==========================================================================

  describe('rationale generation', () => {
    it('should include joint liability explanation for multiple tenants', () => {
      const facts = { number_of_tenants: 3 };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.rationale).toContain('Joint and several liability');
    });

    it('should include student-specific rationale for student lets', () => {
      const facts = { is_student_let: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.rationale).toContain('guarantor');
    });

    it('should include rent review explanation for rent increase needs', () => {
      const facts = { rent_increase_clause: true };
      const result = detectPremiumRecommendation(facts, 'england');

      expect(result.rationale).toContain('rent');
    });
  });
});

// ==========================================================================
// getPremiumFeatures TESTS
// ==========================================================================

describe('getPremiumFeatures', () => {
  it('should return array of features', () => {
    const features = getPremiumFeatures('england');

    expect(Array.isArray(features)).toBe(true);
    expect(features.length).toBeGreaterThan(0);
  });

  it('should include joint and several liability feature', () => {
    const features = getPremiumFeatures('england');
    const jointLiability = features.find((f) => f.feature === 'Joint and Several Liability');

    expect(jointLiability).toBeDefined();
    expect(jointLiability?.description).toBeDefined();
  });

  it('should include HMO-Ready Clauses feature with legal basis', () => {
    const features = getPremiumFeatures('england');
    const hmoFeature = features.find((f) => f.feature === 'HMO-Ready Clauses');

    expect(hmoFeature).toBeDefined();
    expect(hmoFeature?.legalBasis).toBe('Housing Act 2004');
  });

  it('should use correct legal basis for Wales', () => {
    const features = getPremiumFeatures('wales');
    const hmoFeature = features.find((f) => f.feature === 'HMO-Ready Clauses');

    expect(hmoFeature?.legalBasis).toBe('Housing (Wales) Act 2014');
  });

  it('should use correct legal basis for Scotland', () => {
    const features = getPremiumFeatures('scotland');
    const hmoFeature = features.find((f) => f.feature === 'HMO-Ready Clauses');

    expect(hmoFeature?.legalBasis).toBe('Civic Government (Scotland) Act 1982');
  });
});

// ==========================================================================
// isStrongRecommendationReason TESTS
// ==========================================================================

describe('isStrongRecommendationReason', () => {
  it('should return true for HMO-related reasons', () => {
    expect(isStrongRecommendationReason('hmo_property')).toBe(true);
    expect(isStrongRecommendationReason('hmo_licensed')).toBe(true);
    expect(isStrongRecommendationReason('multiple_tenants')).toBe(true);
    expect(isStrongRecommendationReason('unrelated_tenants')).toBe(true);
    expect(isStrongRecommendationReason('room_by_room_let')).toBe(true);
  });

  it('should return false for moderate reasons', () => {
    expect(isStrongRecommendationReason('student_let')).toBe(false);
    expect(isStrongRecommendationReason('guarantor_needed')).toBe(false);
    expect(isStrongRecommendationReason('rent_review_needed')).toBe(false);
    expect(isStrongRecommendationReason('high_value_property')).toBe(false);
  });
});

// ==========================================================================
// EDGE CASES
// ==========================================================================

describe('edge cases', () => {
  it('should handle string number_of_tenants', () => {
    const facts = { number_of_tenants: '3' };
    const result = detectPremiumRecommendation(facts, 'england');

    expect(result.isRecommended).toBe(true);
    expect(result.reasons).toContain('multiple_tenants');
  });

  it('should handle alternative fact key names', () => {
    const facts = { tenant_count: 4 };
    const result = detectPremiumRecommendation(facts, 'england');

    expect(result.isRecommended).toBe(true);
    expect(result.reasons).toContain('multiple_tenants');
  });

  it('should handle tenants_unrelated alternative key', () => {
    const facts = { number_of_tenants: 3, tenants_unrelated: true };
    const result = detectPremiumRecommendation(facts, 'england');

    expect(result.reasons).toContain('unrelated_tenants');
  });

  it('should handle is_room_let alternative key', () => {
    const facts = { is_room_let: true };
    const result = detectPremiumRecommendation(facts, 'england');

    expect(result.reasons).toContain('room_by_room_let');
  });

  it('should handle property_is_hmo alternative key', () => {
    const facts = { property_is_hmo: true };
    const result = detectPremiumRecommendation(facts, 'england');

    expect(result.reasons).toContain('hmo_property');
  });

  it('should handle high-value property detection', () => {
    const facts = { rent_amount: 2500, rent_period: 'month' };
    const result = detectPremiumRecommendation(facts, 'england');

    expect(result.reasons).toContain('high_value_property');
  });

  it('should calculate monthly equivalent for weekly rent', () => {
    // £500/week = ~£2166/month (above threshold)
    const facts = { rent_amount: 500, rent_period: 'week' };
    const result = detectPremiumRecommendation(facts, 'england');

    expect(result.reasons).toContain('high_value_property');
  });
});
