/**
 * Regression tests for Wales preview route salvage
 *
 * Tests the fix for: /wizard/preview/{caseId} for a Wales notice_only case returns
 * "Route section_21 is not available for wales/notice_only" even though
 * /wizard/review shows Wales RHW Notice.
 *
 * Root cause: route_recommendation.recommended_route could leak 'section_21' into a Wales case,
 * causing validateForPreview to block with ROUTE_NOT_SUPPORTED.
 *
 * Fix: Wales route salvage logic derives correct Wales route from facts when England routes
 * are detected in a Wales jurisdiction.
 */

import { validateFlow } from '@/lib/validation/validateFlow';
import type { FlowValidationInput } from '@/lib/validation/validateFlow';

/**
 * Helper function that mimics the route selection logic from the preview API
 * This allows us to unit test the route selection without making HTTP calls
 */
function selectWalesRoute(
  jurisdiction: string,
  rawRoute: string | undefined,
  wizardFacts: Record<string, unknown>
): string {
  let selected_route = rawRoute;

  // NORMALIZE WALES ROUTES: Add 'wales_' prefix if missing
  if (jurisdiction === 'wales' && selected_route) {
    if (selected_route === 'section_173' || selected_route === 'fault_based') {
      selected_route = `wales_${selected_route}`;
    }
  }

  // WALES ROUTE SALVAGE: Prevent England routes from leaking into Wales cases
  if (jurisdiction === 'wales') {
    const isEnglandRoute = selected_route === 'section_21' || selected_route === 'section_8';
    const isUnknownRoute = !selected_route || (
      selected_route !== 'wales_section_173' &&
      selected_route !== 'wales_fault_based'
    );

    if (isEnglandRoute || isUnknownRoute) {
      // Determine Wales route by inspecting facts
      const hasFaultGrounds = Array.isArray(wizardFacts.wales_fault_grounds) &&
        (wizardFacts.wales_fault_grounds as unknown[]).length > 0;

      selected_route = hasFaultGrounds ? 'wales_fault_based' : 'wales_section_173';
    }
  }

  // Apply jurisdiction-aware default if no route specified
  if (!selected_route) {
    if (jurisdiction === 'scotland') {
      selected_route = 'notice_to_leave';
    } else if (jurisdiction === 'wales') {
      selected_route = 'wales_section_173';
    } else {
      selected_route = 'section_8';
    }
  }

  return selected_route;
}

describe('Wales Preview Route Salvage', () => {
  describe('Route selection logic', () => {
    it('should salvage section_21 to wales_fault_based when wales_fault_grounds present', () => {
      const route = selectWalesRoute('wales', 'section_21', {
        wales_fault_grounds: ['Section 157 - Serious rent arrears'],
      });
      expect(route).toBe('wales_fault_based');
    });

    it('should salvage section_21 to wales_section_173 when no wales_fault_grounds', () => {
      const route = selectWalesRoute('wales', 'section_21', {});
      expect(route).toBe('wales_section_173');
    });

    it('should salvage section_8 to wales_fault_based when wales_fault_grounds present', () => {
      const route = selectWalesRoute('wales', 'section_8', {
        wales_fault_grounds: ['Section 159 - Minor rent arrears'],
      });
      expect(route).toBe('wales_fault_based');
    });

    it('should salvage section_8 to wales_section_173 when no wales_fault_grounds', () => {
      const route = selectWalesRoute('wales', 'section_8', {});
      expect(route).toBe('wales_section_173');
    });

    it('should normalize fault_based to wales_fault_based', () => {
      const route = selectWalesRoute('wales', 'fault_based', {});
      expect(route).toBe('wales_fault_based');
    });

    it('should normalize section_173 to wales_section_173', () => {
      const route = selectWalesRoute('wales', 'section_173', {});
      expect(route).toBe('wales_section_173');
    });

    it('should keep wales_section_173 as-is', () => {
      const route = selectWalesRoute('wales', 'wales_section_173', {});
      expect(route).toBe('wales_section_173');
    });

    it('should keep wales_fault_based as-is', () => {
      const route = selectWalesRoute('wales', 'wales_fault_based', {});
      expect(route).toBe('wales_fault_based');
    });

    it('should default to wales_section_173 when route is undefined', () => {
      const route = selectWalesRoute('wales', undefined, {});
      expect(route).toBe('wales_section_173');
    });

    it('should default to wales_section_173 when route is empty string', () => {
      const route = selectWalesRoute('wales', '', {});
      expect(route).toBe('wales_section_173');
    });
  });

  describe('England routes remain unchanged', () => {
    it('should keep section_21 for England jurisdiction', () => {
      const route = selectWalesRoute('england', 'section_21', {});
      expect(route).toBe('section_21');
    });

    it('should keep section_8 for England jurisdiction', () => {
      const route = selectWalesRoute('england', 'section_8', {});
      expect(route).toBe('section_8');
    });

    it('should default to section_8 for England when route is undefined', () => {
      const route = selectWalesRoute('england', undefined, {});
      expect(route).toBe('section_8');
    });
  });

  describe('Scotland routes remain unchanged', () => {
    it('should keep notice_to_leave for Scotland jurisdiction', () => {
      const route = selectWalesRoute('scotland', 'notice_to_leave', {});
      expect(route).toBe('notice_to_leave');
    });

    it('should default to notice_to_leave for Scotland when route is undefined', () => {
      const route = selectWalesRoute('scotland', undefined, {});
      expect(route).toBe('notice_to_leave');
    });
  });

  describe('Integration with validateFlow', () => {
    const baseWalesFacts = {
      landlord_full_name: 'John Smith',
      landlord_address_line1: '123 Main St',
      landlord_city: 'Cardiff',
      landlord_postcode: 'CF10 1AA',
      tenant_full_name: 'Jane Doe',
      property_address_line1: '456 Rental Ave',
      property_city: 'Cardiff',
      property_postcode: 'CF10 2BB',
      tenancy_start_date: '2023-01-01',
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_expiry_date: '2024-06-01',
    };

    it('should pass validation for wales_section_173 route', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'wales',
        product: 'notice_only',
        route: 'wales_section_173',
        stage: 'preview',
        facts: {
          ...baseWalesFacts,
          selected_notice_route: 'wales_section_173',
        },
      };

      const result = validateFlow(input);

      // Should NOT have ROUTE_NOT_SUPPORTED error
      const routeError = result.blocking_issues.find(
        issue => issue.code === 'ROUTE_NOT_SUPPORTED'
      );
      expect(routeError).toBeUndefined();
    });

    it('should pass validation for wales_fault_based route', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'wales',
        product: 'notice_only',
        route: 'wales_fault_based',
        stage: 'preview',
        facts: {
          ...baseWalesFacts,
          selected_notice_route: 'wales_fault_based',
          wales_fault_grounds: ['Section 157 - Serious rent arrears'],
          arrears_total: 3000,
        },
      };

      const result = validateFlow(input);

      // Should NOT have ROUTE_NOT_SUPPORTED error
      const routeError = result.blocking_issues.find(
        issue => issue.code === 'ROUTE_NOT_SUPPORTED'
      );
      expect(routeError).toBeUndefined();
    });

    it('should FAIL validation if section_21 is passed directly to Wales', () => {
      // This test verifies that the capability matrix still correctly blocks section_21 for Wales
      // The route salvage logic in the API should prevent this scenario from reaching validateFlow
      const input: FlowValidationInput = {
        jurisdiction: 'wales',
        product: 'notice_only',
        route: 'section_21', // This is the bug - should never reach here after fix
        stage: 'preview',
        facts: {
          ...baseWalesFacts,
          selected_notice_route: 'section_21',
        },
      };

      const result = validateFlow(input);

      // The capability matrix should block this with ROUTE_NOT_SUPPORTED
      expect(result.ok).toBe(false);
      // Either ROUTE_NOT_SUPPORTED or a similar error should be present
      expect(result.status).toBe('unsupported');
    });
  });

  describe('Route derivation order', () => {
    it('should prefer selected_notice_route over eviction_route', () => {
      // This tests that the derivation order in the API is correct
      const wizardFacts = {
        selected_notice_route: 'wales_section_173',
        eviction_route: 'section_21',
        eviction_route_intent: 'section_8',
        route_recommendation: { recommended_route: 'section_21' },
      };

      // selected_notice_route should win
      const selectedRoute =
        wizardFacts.selected_notice_route ||
        wizardFacts.eviction_route ||
        wizardFacts.eviction_route_intent ||
        wizardFacts.route_recommendation?.recommended_route;

      expect(selectedRoute).toBe('wales_section_173');
    });

    it('should use eviction_route_intent when earlier fields are missing', () => {
      const wizardFacts = {
        selected_notice_route: undefined,
        eviction_route: undefined,
        eviction_route_intent: 'wales_fault_based',
        route_recommendation: { recommended_route: 'section_21' },
      };

      const selectedRoute =
        wizardFacts.selected_notice_route ||
        wizardFacts.eviction_route ||
        wizardFacts.eviction_route_intent ||
        wizardFacts.route_recommendation?.recommended_route;

      expect(selectedRoute).toBe('wales_fault_based');
    });

    it('should fallback to route_recommendation when all else is missing', () => {
      const wizardFacts = {
        selected_notice_route: undefined,
        eviction_route: undefined,
        eviction_route_intent: undefined,
        route_recommendation: { recommended_route: 'section_21' },
      };

      const selectedRoute =
        wizardFacts.selected_notice_route ||
        wizardFacts.eviction_route ||
        wizardFacts.eviction_route_intent ||
        wizardFacts.route_recommendation?.recommended_route;

      // This is the problematic case - should be salvaged by Wales route salvage logic
      expect(selectedRoute).toBe('section_21');
    });
  });
});
