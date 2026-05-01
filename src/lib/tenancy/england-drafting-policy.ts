import {
  getAgreementSuitabilityFacts,
  type AgreementSuitabilityFacts,
} from '@/lib/tenancy/agreement-suitability';
import {
  getEnglandTenancyPurpose,
  isEnglandPostReformTenancy,
  type EnglandTenancyPurpose,
} from '@/lib/tenancy/england-reform';

export type EnglandModernTenancyDraftingProduct =
  | 'england_standard_tenancy_agreement'
  | 'england_premium_tenancy_agreement'
  | 'england_student_tenancy_agreement'
  | 'england_hmo_shared_house_tenancy_agreement'
  | 'england_lodger_agreement';

export type EnglandDraftingRoute = 'assured_periodic' | 'resident_landlord_lodger';

export type EnglandClauseId =
  | 'ASSURED_PERIODIC_CORE'
  | 'LANDLORD_POSSESSION_BY_GROUNDS_ONLY'
  | 'TENANT_TWO_MONTH_NOTICE'
  | 'SECTION_13_FORM_4A_RENT_REVIEW'
  | 'RENT_IN_ADVANCE_LIMIT'
  | 'WRITTEN_INFORMATION_BASELINE'
  | 'PET_REQUEST_PROCESS'
  | 'RENTAL_BIDDING_AND_EQUAL_TREATMENT'
  | 'DEPOSIT_COMPLIANCE'
  | 'GUARANTOR_SUPPORT'
  | 'PREMIUM_MANAGEMENT_PROTOCOL'
  | 'STUDENT_OCCUPATION_PROTOCOL'
  | 'HMO_SHARED_HOUSE_PROTOCOL'
  | 'LODGER_ROOM_LET_PROTOCOL';

export interface EnglandDraftingDecision {
  route: EnglandDraftingRoute;
  selectedClauses: EnglandClauseId[];
  omittedClauses: Array<{ id: EnglandClauseId; reason: string }>;
  warnings: string[];
  complianceWarnings: string[];
  hardStops: string[];
}

export interface EnglandDraftingContext {
  product: EnglandModernTenancyDraftingProduct;
  purpose: EnglandTenancyPurpose;
  tenancyStartDate: string;
  postReform: boolean;
  suitability: AgreementSuitabilityFacts;
  residentLandlordConfirmed?: boolean;
  sharedKitchenOrBathroom?: boolean;
  tenantCount: number;
  sharerCount: number;
  isHmo: boolean;
  sharedFacilitiesRecorded: boolean;
  guarantorRequired: boolean;
  allTenantsFullTimeStudents?: boolean;
  depositTaken: boolean;
  rentInAdvanceCompliant?: boolean;
  noBiddingConfirmed?: boolean;
  noDiscriminationConfirmed?: boolean;
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', '1'].includes(normalized)) return true;
    if (['false', 'no', '0'].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value > 0;
  return undefined;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function countTenantRecords(value: unknown): number {
  if (Array.isArray(value)) return value.filter(Boolean).length;
  return 0;
}

function sanitizeEnglandPolicyText(value: string): string {
  return value
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€“/g, '-')
    .replace(/â€”/g, '-')
    .replace(/â€¦/g, '...');
}

export function buildEnglandDraftingContext(
  product: EnglandModernTenancyDraftingProduct,
  facts: Record<string, any>
): EnglandDraftingContext {
  const purpose = getEnglandTenancyPurpose(facts.england_tenancy_purpose);
  const tenancyStartDate = typeof facts.tenancy_start_date === 'string' ? facts.tenancy_start_date : '';
  const postReform = isEnglandPostReformTenancy({
    jurisdiction: 'england',
    tenancyStartDate,
    purpose,
  });
  const suitability = getAgreementSuitabilityFacts(facts, { product });
  const tenantCount = countTenantRecords(facts.tenants);
  const sharerCount = toNumber(facts.number_of_sharers) ?? tenantCount;

  return {
    product,
    purpose,
    tenancyStartDate,
    postReform,
    suitability,
    residentLandlordConfirmed: toBoolean(facts.resident_landlord_confirmed),
    sharedKitchenOrBathroom: toBoolean(facts.shared_kitchen_or_bathroom),
    tenantCount,
    sharerCount,
    isHmo: toBoolean(facts.is_hmo) === true,
    sharedFacilitiesRecorded: Boolean(
      (typeof facts.communal_areas === 'string' && facts.communal_areas.trim()) ||
        toBoolean(facts.shared_facilities) === true ||
        sharerCount > 1
    ),
    guarantorRequired: toBoolean(facts.guarantor_required) === true,
    allTenantsFullTimeStudents: toBoolean(facts.all_tenants_full_time_students),
    depositTaken: (toNumber(facts.deposit_amount) ?? 0) > 0,
    rentInAdvanceCompliant: toBoolean(facts.england_rent_in_advance_compliant),
    noBiddingConfirmed: toBoolean(facts.england_no_bidding_confirmed),
    noDiscriminationConfirmed: toBoolean(facts.england_no_discrimination_confirmed),
  };
}

export function evaluateEnglandDraftingPolicy(
  context: EnglandDraftingContext
): EnglandDraftingDecision {
  const selectedClauses: EnglandClauseId[] = [];
  const omittedClauses: Array<{ id: EnglandClauseId; reason: string }> = [];
  const warnings: string[] = [];
  const complianceWarnings: string[] = [];
  const hardStops: string[] = [];

  if (context.product === 'england_lodger_agreement') {
    selectedClauses.push('LODGER_ROOM_LET_PROTOCOL');

    if (context.residentLandlordConfirmed === false) {
      hardStops.push(
        'The Lodger Agreement route is only appropriate where the landlord lives at the property as a resident landlord.'
      );
    } else if (context.residentLandlordConfirmed === undefined) {
      warnings.push(
        'Resident-landlord confirmation is not recorded. Review the route carefully before relying on the lodger agreement.'
      );
    }

    if (context.sharedKitchenOrBathroom === false) {
      warnings.push(
        'Shared kitchen / bathroom arrangements are not confirmed. If the occupier does not share the home with the resident landlord, a lodger agreement may be the wrong route.'
      );
    }

    return {
      route: 'resident_landlord_lodger',
      selectedClauses,
      omittedClauses,
      warnings: warnings.map(sanitizeEnglandPolicyText),
      complianceWarnings: complianceWarnings.map(sanitizeEnglandPolicyText),
      hardStops: hardStops.map(sanitizeEnglandPolicyText),
    };
  }

  selectedClauses.push(
    'ASSURED_PERIODIC_CORE',
    'LANDLORD_POSSESSION_BY_GROUNDS_ONLY',
    'TENANT_TWO_MONTH_NOTICE',
    'SECTION_13_FORM_4A_RENT_REVIEW',
    'RENT_IN_ADVANCE_LIMIT',
    'WRITTEN_INFORMATION_BASELINE',
    'PET_REQUEST_PROCESS',
    'RENTAL_BIDDING_AND_EQUAL_TREATMENT'
  );

  if (context.depositTaken) {
    selectedClauses.push('DEPOSIT_COMPLIANCE');
  } else {
    omittedClauses.push({
      id: 'DEPOSIT_COMPLIANCE',
      reason: 'No tenancy deposit is recorded for this agreement.',
    });
  }

  if (context.guarantorRequired) {
    selectedClauses.push('GUARANTOR_SUPPORT');
  } else {
    omittedClauses.push({
      id: 'GUARANTOR_SUPPORT',
      reason: 'No guarantor is recorded in the tenancy facts.',
    });
  }

  if (context.product === 'england_premium_tenancy_agreement') {
    selectedClauses.push('PREMIUM_MANAGEMENT_PROTOCOL');
  }

  if (context.product === 'england_student_tenancy_agreement') {
    selectedClauses.push('STUDENT_OCCUPATION_PROTOCOL');
    if (context.allTenantsFullTimeStudents === false) {
      warnings.push(
        'The Student Tenancy Agreement route is selected but the answers do not confirm that the occupiers are full-time students.'
      );
    }
  }

  if (context.product === 'england_hmo_shared_house_tenancy_agreement') {
    selectedClauses.push('HMO_SHARED_HOUSE_PROTOCOL');
    if (!context.isHmo && !context.sharedFacilitiesRecorded && context.sharerCount < 2) {
      hardStops.push(
        'The HMO / Shared House route is selected but the answers do not record an HMO, communal areas, or a sharer setup that justifies the shared-house drafting.'
      );
    }
  }

  if (context.suitability.tenantIsIndividual === false) {
    hardStops.push(
      'The assured-tenancy route is not appropriate because the tenant is not recorded as an individual occupier.'
    );
  } else if (context.suitability.tenantIsIndividual === undefined) {
    warnings.push(
      'The tenancy facts do not confirm that the tenant is an individual. Record this before relying on the assured-tenancy route.'
    );
  }

  if (context.suitability.mainHome === false) {
    hardStops.push(
      'The assured-tenancy route is not appropriate because the property is not recorded as the tenant’s main home.'
    );
  } else if (context.suitability.mainHome === undefined) {
    warnings.push(
      'Main-home occupation is not confirmed. Record it before relying on the assured-tenancy route.'
    );
  }

  if (context.suitability.landlordLivesAtProperty === true) {
    hardStops.push(
      'The assured-tenancy route is not appropriate because the landlord is recorded as living at the property. Use the lodger / resident-landlord route instead.'
    );
  } else if (context.suitability.landlordLivesAtProperty === undefined) {
    warnings.push(
      'Resident-landlord status is not confirmed. Record whether the landlord lives at the property before relying on the assured-tenancy route.'
    );
  }

  if (context.suitability.holidayOrLicence === true) {
    hardStops.push(
      'The assured-tenancy route is not appropriate because the arrangement is recorded as a holiday let or licence-style occupation.'
    );
  } else if (context.suitability.holidayOrLicence === undefined) {
    warnings.push(
      'The facts do not confirm that this is not a holiday or licence arrangement. Review the route before relying on the assured-tenancy drafting.'
    );
  }

  if (context.postReform) {
    if (context.rentInAdvanceCompliant !== true) {
      complianceWarnings.push(
        'Rent-in-advance compliance is not positively confirmed for this post-1 May 2026 England tenancy.'
      );
    }
    if (context.noBiddingConfirmed !== true) {
      complianceWarnings.push(
        'The record does not positively confirm compliance with the ban on rental bidding above the advertised rent.'
      );
    }
    if (context.noDiscriminationConfirmed !== true) {
      complianceWarnings.push(
        'The record does not positively confirm compliance with the post-1 May 2026 England anti-discrimination letting restrictions.'
      );
    }
  }

  return {
    route: 'assured_periodic',
    selectedClauses,
    omittedClauses,
    warnings: warnings.map(sanitizeEnglandPolicyText),
    complianceWarnings: complianceWarnings.map(sanitizeEnglandPolicyText),
    hardStops: hardStops.map(sanitizeEnglandPolicyText),
  };
}
