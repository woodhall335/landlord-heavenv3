import { describe, expect, it } from 'vitest';

import {
  buildEnglandDraftingContext,
  evaluateEnglandDraftingPolicy,
} from '@/lib/tenancy/england-drafting-policy';

const baseFacts = {
  tenancy_start_date: '2026-05-02',
  england_tenancy_purpose: 'new_agreement',
  tenant_is_individual: true,
  main_home: true,
  landlord_not_resident_confirmed: true,
  not_holiday_or_licence_confirmed: true,
  england_rent_in_advance_compliant: true,
  england_no_bidding_confirmed: true,
  england_no_discrimination_confirmed: true,
  deposit_amount: 1500,
  tenants: [
    {
      full_name: 'Alice Tenant',
    },
  ],
};

describe('England drafting policy', () => {
  it('selects the post-reform assured baseline for modern England tenancy packs', () => {
    const decision = evaluateEnglandDraftingPolicy(
      buildEnglandDraftingContext('england_standard_tenancy_agreement', baseFacts)
    );

    expect(decision.route).toBe('assured_periodic');
    expect(decision.hardStops).toEqual([]);
    expect(decision.selectedClauses).toEqual(
      expect.arrayContaining([
        'ASSURED_PERIODIC_CORE',
        'LANDLORD_POSSESSION_BY_GROUNDS_ONLY',
        'TENANT_TWO_MONTH_NOTICE',
        'SECTION_13_FORM_4A_RENT_REVIEW',
        'RENT_IN_ADVANCE_LIMIT',
        'WRITTEN_INFORMATION_BASELINE',
        'PET_REQUEST_PROCESS',
        'RENTAL_BIDDING_AND_EQUAL_TREATMENT',
        'DEPOSIT_COMPLIANCE',
      ])
    );
  });

  it('hard-stops the lodger route when resident-landlord facts contradict it', () => {
    const decision = evaluateEnglandDraftingPolicy(
      buildEnglandDraftingContext('england_lodger_agreement', {
        ...baseFacts,
        resident_landlord_confirmed: false,
        shared_kitchen_or_bathroom: false,
      })
    );

    expect(decision.route).toBe('resident_landlord_lodger');
    expect(decision.hardStops.join(' ')).toMatch(/resident landlord/i);
  });

  it('hard-stops the HMO route when the facts do not justify shared-house drafting', () => {
    const decision = evaluateEnglandDraftingPolicy(
      buildEnglandDraftingContext('england_hmo_shared_house_tenancy_agreement', {
        ...baseFacts,
        is_hmo: false,
        number_of_sharers: 1,
        communal_areas: '',
        shared_facilities: false,
      })
    );

    expect(decision.hardStops.join(' ')).toMatch(/HMO|shared-house/i);
  });
});
