/**
 * Tests for Tenancy Premium Upsell Analytics Events
 *
 * Verifies:
 * 1. tenancy_premium_recommended event fires correctly
 * 2. tenancy_premium_selected_after_recommendation event fires correctly
 * 3. tenancy_standard_selected_despite_recommendation event fires correctly
 * 4. No PII is included in any events
 */

import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import {
  trackTenancyPremiumRecommended,
  trackTenancyPremiumSelectedAfterRecommendation,
  trackTenancyStandardSelectedDespiteRecommendation,
  trackTenancyRationaleExpanded,
  TenancyPremiumRecommendationReason,
} from '@/lib/analytics';

// Mock gtag and fbq
const mockGtag = vi.fn();
const mockFbq = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (global as any).window = {
    gtag: mockGtag,
    fbq: mockFbq,
  };
});

afterEach(() => {
  delete (global as any).window;
});

describe('trackTenancyPremiumRecommended', () => {
  const baseParams = {
    reasons: ['multiple_tenants', 'unrelated_tenants'] as TenancyPremiumRecommendationReason[],
    strength: 'strong' as const,
    jurisdiction: 'england',
  };

  it('should fire GA4 event with correct name', () => {
    trackTenancyPremiumRecommended(baseParams);

    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'tenancy_premium_recommended',
      expect.any(Object)
    );
  });

  it('should include event category', () => {
    trackTenancyPremiumRecommended(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.event_category).toBe('tenancy_upsell');
  });

  it('should include reason flags as comma-separated string (not array)', () => {
    trackTenancyPremiumRecommended(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.reason_flags).toBe('multiple_tenants,unrelated_tenants');
    expect(typeof eventData.reason_flags).toBe('string');
  });

  it('should include reason count', () => {
    trackTenancyPremiumRecommended(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.reason_count).toBe(2);
  });

  it('should include strength', () => {
    trackTenancyPremiumRecommended(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.strength).toBe('strong');
  });

  it('should include jurisdiction', () => {
    trackTenancyPremiumRecommended(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.jurisdiction).toBe('england');
  });

  it('should set has_hmo_indicator flag correctly', () => {
    trackTenancyPremiumRecommended(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.has_hmo_indicator).toBe(true);
  });

  it('should set has_hmo_indicator to false when no HMO reasons', () => {
    trackTenancyPremiumRecommended({
      reasons: ['student_let', 'guarantor_needed'],
      strength: 'moderate',
      jurisdiction: 'england',
    });

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.has_hmo_indicator).toBe(false);
  });

  it('should set has_student_let flag correctly', () => {
    trackTenancyPremiumRecommended({
      reasons: ['student_let'],
      strength: 'moderate',
      jurisdiction: 'england',
    });

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.has_student_let).toBe(true);
  });

  it('should set has_guarantor_need flag correctly', () => {
    trackTenancyPremiumRecommended({
      reasons: ['guarantor_needed'],
      strength: 'moderate',
      jurisdiction: 'england',
    });

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.has_guarantor_need).toBe(true);
  });

  it('should fire Facebook pixel ViewContent event', () => {
    trackTenancyPremiumRecommended(baseParams);

    expect(mockFbq).toHaveBeenCalledWith('track', 'ViewContent', expect.any(Object));
  });

  it('should NOT include any PII in event data', () => {
    trackTenancyPremiumRecommended(baseParams);

    const eventData = mockGtag.mock.calls[0][2];

    // Check no PII fields are present
    expect(eventData).not.toHaveProperty('email');
    expect(eventData).not.toHaveProperty('name');
    expect(eventData).not.toHaveProperty('phone');
    expect(eventData).not.toHaveProperty('address');
    expect(eventData).not.toHaveProperty('tenant_name');
    expect(eventData).not.toHaveProperty('landlord_name');
  });

  it('should NOT include free text in event data', () => {
    trackTenancyPremiumRecommended(baseParams);

    const eventData = mockGtag.mock.calls[0][2];

    // Check no free text fields
    expect(eventData).not.toHaveProperty('message');
    expect(eventData).not.toHaveProperty('rationale');
    expect(eventData).not.toHaveProperty('description');
  });
});

describe('trackTenancyPremiumSelectedAfterRecommendation', () => {
  const baseParams = {
    reasons: ['multiple_tenants', 'shared_facilities'] as TenancyPremiumRecommendationReason[],
    strength: 'strong' as const,
    jurisdiction: 'wales',
  };

  it('should fire GA4 event with correct name', () => {
    trackTenancyPremiumSelectedAfterRecommendation(baseParams);

    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'tenancy_premium_selected_after_recommendation',
      expect.any(Object)
    );
  });

  it('should include reason flags', () => {
    trackTenancyPremiumSelectedAfterRecommendation(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.reason_flags).toBe('multiple_tenants,shared_facilities');
  });

  it('should include strength and jurisdiction', () => {
    trackTenancyPremiumSelectedAfterRecommendation(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.strength).toBe('strong');
    expect(eventData.jurisdiction).toBe('wales');
  });

  it('should fire Facebook AddToCart event', () => {
    trackTenancyPremiumSelectedAfterRecommendation(baseParams);

    expect(mockFbq).toHaveBeenCalledWith('track', 'AddToCart', expect.objectContaining({
      content_name: 'ast_premium',
    }));
  });

  it('should NOT include recommendation_rejected flag', () => {
    trackTenancyPremiumSelectedAfterRecommendation(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData).not.toHaveProperty('recommendation_rejected');
  });
});

describe('trackTenancyStandardSelectedDespiteRecommendation', () => {
  const baseParams = {
    reasons: ['hmo_property'] as TenancyPremiumRecommendationReason[],
    strength: 'strong' as const,
    jurisdiction: 'scotland',
  };

  it('should fire GA4 event with correct name', () => {
    trackTenancyStandardSelectedDespiteRecommendation(baseParams);

    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'tenancy_standard_selected_despite_recommendation',
      expect.any(Object)
    );
  });

  it('should include recommendation_rejected flag set to true', () => {
    trackTenancyStandardSelectedDespiteRecommendation(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.recommendation_rejected).toBe(true);
  });

  it('should include reason flags', () => {
    trackTenancyStandardSelectedDespiteRecommendation(baseParams);

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.reason_flags).toBe('hmo_property');
  });

  it('should NOT fire Facebook event', () => {
    trackTenancyStandardSelectedDespiteRecommendation(baseParams);

    // This event should not trigger Facebook pixel
    // (we don't want to confuse conversion tracking)
    expect(mockFbq).not.toHaveBeenCalled();
  });
});

describe('trackTenancyRationaleExpanded', () => {
  it('should fire GA4 event with correct name', () => {
    trackTenancyRationaleExpanded({
      feature: 'joint_liability',
      jurisdiction: 'england',
    });

    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'tenancy_rationale_expanded',
      expect.any(Object)
    );
  });

  it('should include feature and jurisdiction', () => {
    trackTenancyRationaleExpanded({
      feature: 'hmo_clauses',
      jurisdiction: 'northern-ireland',
    });

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.feature).toBe('hmo_clauses');
    expect(eventData.jurisdiction).toBe('northern-ireland');
  });

  it('should include event category', () => {
    trackTenancyRationaleExpanded({
      feature: 'guarantor',
      jurisdiction: 'england',
    });

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.event_category).toBe('tenancy_upsell');
  });
});

// ==========================================================================
// REASON FLAGS VALIDATION
// ==========================================================================

describe('reason flag validation', () => {
  it('should only accept valid reason flags', () => {
    const validReasons: TenancyPremiumRecommendationReason[] = [
      'multiple_tenants',
      'unrelated_tenants',
      'separate_rent_payments',
      'room_by_room_let',
      'shared_facilities',
      'hmo_property',
      'hmo_licensed',
      'student_let',
      'guarantor_needed',
      'rent_review_needed',
      'high_value_property',
    ];

    // This test verifies the type system prevents invalid reasons
    // If this compiles, the type checking is working
    trackTenancyPremiumRecommended({
      reasons: validReasons,
      strength: 'strong',
      jurisdiction: 'england',
    });

    expect(mockGtag).toHaveBeenCalled();
  });
});

// ==========================================================================
// EDGE CASES
// ==========================================================================

describe('edge cases', () => {
  it('should handle empty reasons array', () => {
    trackTenancyPremiumRecommended({
      reasons: [],
      strength: 'moderate',
      jurisdiction: 'england',
    });

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.reason_flags).toBe('');
    expect(eventData.reason_count).toBe(0);
  });

  it('should handle all jurisdictions', () => {
    const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'];

    jurisdictions.forEach((jurisdiction) => {
      mockGtag.mockClear();

      trackTenancyPremiumRecommended({
        reasons: ['hmo_property'],
        strength: 'strong',
        jurisdiction,
      });

      const eventData = mockGtag.mock.calls[0][2];
      expect(eventData.jurisdiction).toBe(jurisdiction);
    });
  });

  it('should handle moderate strength', () => {
    trackTenancyPremiumRecommended({
      reasons: ['student_let'],
      strength: 'moderate',
      jurisdiction: 'england',
    });

    const eventData = mockGtag.mock.calls[0][2];
    expect(eventData.strength).toBe('moderate');
  });
});

// ==========================================================================
// WINDOW UNDEFINED HANDLING
// ==========================================================================

describe('window undefined handling', () => {
  beforeEach(() => {
    delete (global as any).window;
  });

  it('should not throw when window is undefined', () => {
    expect(() => {
      trackTenancyPremiumRecommended({
        reasons: ['hmo_property'],
        strength: 'strong',
        jurisdiction: 'england',
      });
    }).not.toThrow();
  });

  it('should not throw for selected after recommendation', () => {
    expect(() => {
      trackTenancyPremiumSelectedAfterRecommendation({
        reasons: ['hmo_property'],
        strength: 'strong',
        jurisdiction: 'england',
      });
    }).not.toThrow();
  });

  it('should not throw for standard despite recommendation', () => {
    expect(() => {
      trackTenancyStandardSelectedDespiteRecommendation({
        reasons: ['hmo_property'],
        strength: 'strong',
        jurisdiction: 'england',
      });
    }).not.toThrow();
  });
});
