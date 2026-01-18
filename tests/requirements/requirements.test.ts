import { describe, expect, it } from 'vitest';
import { getCapabilityMatrix } from '../../src/lib/jurisdictions/capabilities/matrix';
import { getRequirements } from '../../src/lib/jurisdictions/requirements';

const matrix = getCapabilityMatrix();

describe('requirements engine scaffolding', () => {
  it('returns sets for every supported flow', () => {
    for (const [jurisdiction, products] of Object.entries(matrix)) {
      for (const [product, flow] of Object.entries(products)) {
        if (flow.status !== 'supported') continue;
        const result = getRequirements({
          jurisdiction,
          product,
          route: flow.routes[0],
          stage: 'wizard',
          facts: {},
          matrix,
        });

        expect(result).toBeDefined();
        expect(result.requiredNow).toBeInstanceOf(Set);
        expect(result.warnNow).toBeInstanceOf(Set);
        expect(result.derived).toBeInstanceOf(Set);
      }
    }
  });
});

/**
 * Scotland Notice Only Ground Codes Derivation Tests
 *
 * Bug: Scotland notice_only preview showed "Required information missing: ground_codes"
 * because the wizard wrote `scotland_eviction_ground` (number) but requirements expected
 * `ground_codes` (string[]).
 *
 * Fix: Accept either `ground_codes` OR `scotland_eviction_ground` as satisfying
 * the ground selection requirement for Scotland notice_only flows.
 */
describe('Scotland notice_only ground_codes derivation', () => {
  it('should NOT require ground_codes when scotland_eviction_ground is set', () => {
    const result = getRequirements({
      jurisdiction: 'scotland',
      product: 'notice_only',
      route: 'notice_to_leave',
      stage: 'preview',
      facts: {
        // Core required facts
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '123 Test St',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '456 Property Rd',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        // Scotland ground - the old format (number)
        scotland_eviction_ground: 18,
      },
      matrix,
    });

    // ground_codes should be derived (satisfied) not required
    expect(result.derived.has('ground_codes')).toBe(true);
    expect(result.requiredNow.has('ground_codes')).toBe(false);
  });

  it('should NOT require ground_codes when ground_codes is already set', () => {
    const result = getRequirements({
      jurisdiction: 'scotland',
      product: 'notice_only',
      route: 'notice_to_leave',
      stage: 'preview',
      facts: {
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '123 Test St',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '456 Property Rd',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        // New format - ground_codes (string[])
        ground_codes: ['Ground 18'],
      },
      matrix,
    });

    // ground_codes should be derived (satisfied) not required
    expect(result.derived.has('ground_codes')).toBe(true);
    expect(result.requiredNow.has('ground_codes')).toBe(false);
  });

  it('should require ground_codes when no ground is selected', () => {
    const result = getRequirements({
      jurisdiction: 'scotland',
      product: 'notice_only',
      route: 'notice_to_leave',
      stage: 'preview',
      facts: {
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '123 Test St',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '456 Property Rd',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        // No ground selected
      },
      matrix,
    });

    // ground_codes should be required
    expect(result.requiredNow.has('ground_codes')).toBe(true);
    expect(result.derived.has('ground_codes')).toBe(false);
  });

  it('should work at generate stage too', () => {
    const result = getRequirements({
      jurisdiction: 'scotland',
      product: 'notice_only',
      route: 'notice_to_leave',
      stage: 'generate',
      facts: {
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '123 Test St',
        landlord_address_town: 'Edinburgh',
        landlord_address_postcode: 'EH1 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '456 Property Rd',
        property_address_town: 'Glasgow',
        property_address_postcode: 'G1 1BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        scotland_eviction_ground: 1,
      },
      matrix,
    });

    // ground_codes should be derived (satisfied) at generate stage too
    expect(result.derived.has('ground_codes')).toBe(true);
    expect(result.requiredNow.has('ground_codes')).toBe(false);
  });
});
