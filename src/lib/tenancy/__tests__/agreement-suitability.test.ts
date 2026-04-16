import { describe, expect, it } from 'vitest';

import {
  getAgreementSuitabilityFacts,
  getAgreementSuitabilityWarnings,
  getEnglandAssuredSuitabilityAnswer,
} from '@/lib/tenancy/agreement-suitability';

describe('agreement suitability compatibility', () => {
  it('interprets legacy standalone assured booleans correctly for modern England tenancy products', () => {
    const suitability = getAgreementSuitabilityFacts({
      __meta: { product: 'england_standard_tenancy_agreement' },
      tenant_is_individual: true,
      main_home: true,
      landlord_lives_at_property: true,
      holiday_or_licence: true,
    });

    expect(suitability).toMatchObject({
      tenantIsIndividual: true,
      mainHome: true,
      landlordLivesAtProperty: false,
      holidayOrLicence: false,
    });
  });

  it('preserves legacy AST semantics for older AST products', () => {
    const facts = {
      __meta: { product: 'ast_standard' },
      tenant_is_individual: true,
      main_home: true,
      landlord_lives_at_property: true,
      holiday_or_licence: true,
    };

    expect(getAgreementSuitabilityFacts(facts)).toMatchObject({
      tenantIsIndividual: true,
      mainHome: true,
      landlordLivesAtProperty: true,
      holidayOrLicence: true,
    });
    expect(getAgreementSuitabilityWarnings(facts)).toHaveLength(2);
  });

  it('hydrates the new standalone assured suitability fields from old saved cases', () => {
    expect(getEnglandAssuredSuitabilityAnswer({
      __meta: { product: 'england_student_tenancy_agreement' },
      tenant_is_individual: true,
      main_home: true,
      landlord_lives_at_property: true,
      holiday_or_licence: true,
    })).toEqual({
      tenant_is_individual: true,
      main_home: true,
      landlord_not_resident_confirmed: true,
      not_holiday_or_licence_confirmed: true,
    });
  });

  it('prefers the new positive confirmation fields when they are present', () => {
    const suitability = getAgreementSuitabilityFacts({
      __meta: { product: 'england_hmo_shared_house_tenancy_agreement' },
      landlord_lives_at_property: true,
      holiday_or_licence: true,
      landlord_not_resident_confirmed: false,
      not_holiday_or_licence_confirmed: false,
    });

    expect(suitability.landlordLivesAtProperty).toBe(true);
    expect(suitability.holidayOrLicence).toBe(true);
  });
});
